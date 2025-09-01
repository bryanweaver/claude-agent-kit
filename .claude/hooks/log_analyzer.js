#!/usr/bin/env node
/**
 * Log analyzer for Claude Code audit system.
 * Provides analysis, reporting, and verification of logged activities.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const AUDIT_BASE_DIR = path.join(os.homedir(), '.claude', 'logs', 'audit');

class LogAnalyzer {
    constructor(sessionId = null) {
        this.sessionId = sessionId || this.getCurrentSession();
        this.events = [];
        this.loadEvents();
    }

    getCurrentSession() {
        const sessionFile = path.join(AUDIT_BASE_DIR, 'current_session.json');
        if (fs.existsSync(sessionFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
                return data.session_id || 'unknown';
            } catch (err) {
                // Session file is invalid
            }
        }
        return 'unknown';
    }

    async loadEvents(limit = null) {
        this.events = [];
        const sessionLog = path.join(AUDIT_BASE_DIR, 'sessions', `${this.sessionId}.jsonl`);

        if (!fs.existsSync(sessionLog)) {
            console.log(`No log found for session: ${this.sessionId}`);
            return;
        }

        const fileStream = fs.createReadStream(sessionLog);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let lineCount = 0;
        for await (const line of rl) {
            if (limit && lineCount >= limit) break;
            try {
                this.events.push(JSON.parse(line));
                lineCount++;
            } catch (err) {
                // Skip invalid lines
            }
        }
    }

    generateTimeline() {
        const timeline = [];

        for (const event of this.events) {
            const entry = {
                time: event.timestamp,
                type: event.event_type,
                agent: (event.agent || {}).agent_type || 'main'
            };

            // Add event-specific details
            if (event.tool) {
                entry.tool = event.tool.name;
                entry.success = event.tool.success !== false;
                if (event.tool.duration_ms !== undefined) {
                    entry.duration_ms = event.tool.duration_ms;
                }
            }

            if (event.file) {
                entry.file = event.file.path;
                entry.modified = event.file.modified || false;
            }

            if (event.bash) {
                entry.command = (event.bash.command || '').slice(0, 100);
            }

            if (event.subagent) {
                entry.subagent_type = event.subagent.type;
            }

            timeline.push(entry);
        }

        return timeline;
    }

    calculateMetrics() {
        const metrics = {
            session_id: this.sessionId,
            total_events: this.events.length,
            start_time: null,
            end_time: null,
            duration: null,
            tools: {},
            agents: {},
            files: {
                read: new Set(),
                modified: new Set(),
                created: new Set()
            },
            commands: [],
            errors: [],
            subagents: {}
        };

        if (this.events.length === 0) {
            return metrics;
        }

        // Calculate time range
        metrics.start_time = this.events[0].timestamp;
        metrics.end_time = this.events[this.events.length - 1].timestamp;

        const start = new Date(metrics.start_time);
        const end = new Date(metrics.end_time);
        const durationMs = end - start;
        const hours = Math.floor(durationMs / 3600000);
        const minutes = Math.floor((durationMs % 3600000) / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        metrics.duration = `${hours}h ${minutes}m ${seconds}s`;

        // Process events
        for (const event of this.events) {
            // Track agents
            const agentType = (event.agent || {}).agent_type || 'main';
            metrics.agents[agentType] = (metrics.agents[agentType] || 0) + 1;

            // Track tools
            if (event.tool) {
                const toolName = event.tool.name;
                if (!metrics.tools[toolName]) {
                    metrics.tools[toolName] = { count: 0, success: 0, total_ms: 0 };
                }
                metrics.tools[toolName].count++;
                if (event.tool.success !== false) {
                    metrics.tools[toolName].success++;
                }
                if (event.tool.duration_ms !== undefined) {
                    metrics.tools[toolName].total_ms += event.tool.duration_ms;
                }
            }

            // Track files
            if (event.file) {
                const filePath = event.file.path;
                if (event.event_type === 'PreToolUse') {
                    if (event.tool && event.tool.name === 'Read') {
                        metrics.files.read.add(filePath);
                    } else if (!event.file.exists_before) {
                        metrics.files.created.add(filePath);
                    }
                } else if (event.file.modified) {
                    metrics.files.modified.add(filePath);
                }
            }

            // Track commands
            if (event.bash && event.event_type === 'PreToolUse') {
                metrics.commands.push({
                    command: event.bash.command,
                    description: event.bash.description || '',
                    timestamp: event.timestamp
                });
            }

            // Track errors
            if (event.error) {
                metrics.errors.push({
                    tool: (event.tool || {}).name || 'unknown',
                    message: event.error.message,
                    timestamp: event.timestamp
                });
            }

            // Track subagents
            if (event.subagent) {
                const subagentType = event.subagent.type || 'unknown';
                if (!metrics.subagents[subagentType]) {
                    metrics.subagents[subagentType] = { count: 0, success: 0, total_ms: 0 };
                }
                metrics.subagents[subagentType].count++;
                if (event.subagent.task_completed) {
                    metrics.subagents[subagentType].success++;
                }
                if (event.subagent.duration_ms !== undefined) {
                    metrics.subagents[subagentType].total_ms += event.subagent.duration_ms;
                }
            }
        }

        // Convert sets to arrays and calculate success rates
        metrics.files.read = Array.from(metrics.files.read);
        metrics.files.modified = Array.from(metrics.files.modified);
        metrics.files.created = Array.from(metrics.files.created);

        // Calculate tool success rates
        for (const [tool, stats] of Object.entries(metrics.tools)) {
            if (stats.count > 0) {
                stats.success_rate = stats.success / stats.count;
                if (stats.total_ms > 0) {
                    stats.avg_ms = stats.total_ms / stats.count;
                }
            }
        }

        return metrics;
    }

    verifyClaims(claims) {
        const verification = {
            claims: [],
            session_id: this.sessionId
        };

        for (const claim of claims) {
            const result = { claim: claim, verified: false, evidence: [] };

            // Check for test execution claims
            if (claim.toLowerCase().includes('test') && 
                (claim.toLowerCase().includes('ran') || 
                 claim.toLowerCase().includes('run') || 
                 claim.toLowerCase().includes('passed'))) {
                for (const event of this.events) {
                    if (event.bash) {
                        const cmd = event.bash.command || '';
                        if (cmd.includes('test') || cmd.includes('jest') || 
                            cmd.includes('vitest') || cmd.includes('playwright')) {
                            result.verified = true;
                            result.evidence.push({
                                command: cmd,
                                timestamp: event.timestamp,
                                success: (event.tool || {}).success !== false
                            });
                        }
                    }
                }
            }

            // Check for file creation/modification claims
            else if (claim.toLowerCase().includes('created') || claim.toLowerCase().includes('wrote')) {
                for (const event of this.events) {
                    if (event.file && event.event_type === 'PostToolUse') {
                        if (!event.file.exists_before && event.file.exists_after) {
                            result.verified = true;
                            result.evidence.push({
                                file: event.file.path,
                                timestamp: event.timestamp
                            });
                        }
                    }
                }
            }

            // Check for specific file mentions
            for (const event of this.events) {
                if (event.file) {
                    const words = claim.split(/\s+/);
                    if (words.some(word => event.file.path.includes(word))) {
                        result.verified = true;
                        result.evidence.push({
                            file: event.file.path,
                            action: (event.tool || {}).name || 'unknown',
                            timestamp: event.timestamp
                        });
                    }
                }
            }

            verification.claims.push(result);
        }

        return verification;
    }

    generateReport(format = 'text') {
        const metrics = this.calculateMetrics();
        const timeline = this.generateTimeline();

        if (format === 'json') {
            return JSON.stringify({
                metrics: metrics,
                timeline: timeline
            }, null, 2);
        }

        // Text format report
        const report = [];
        report.push(`=== AUDIT REPORT FOR SESSION ${this.sessionId} ===\n`);
        report.push(`Duration: ${metrics.duration}`);
        report.push(`Total Events: ${metrics.total_events}`);
        report.push(`Start: ${metrics.start_time}`);
        report.push(`End: ${metrics.end_time}\n`);

        // Tool usage
        report.push('=== TOOL USAGE ===');
        for (const [tool, stats] of Object.entries(metrics.tools).sort()) {
            const successRate = (stats.success_rate || 0) * 100;
            const avgMs = stats.avg_ms || 0;
            report.push(`  ${tool}: ${stats.count} calls, ${successRate.toFixed(1)}% success, ${avgMs.toFixed(0)}ms avg`);
        }

        // Agent activity
        report.push('\n=== AGENT ACTIVITY ===');
        for (const [agent, count] of Object.entries(metrics.agents).sort()) {
            report.push(`  ${agent}: ${count} events`);
        }

        // Subagents
        if (Object.keys(metrics.subagents).length > 0) {
            report.push('\n=== SUBAGENT TASKS ===');
            for (const [subagent, stats] of Object.entries(metrics.subagents).sort()) {
                report.push(`  ${subagent}: ${stats.count} tasks, ${stats.success} completed`);
            }
        }

        // Files
        report.push('\n=== FILE OPERATIONS ===');
        report.push(`  Files Read: ${metrics.files.read.length}`);
        report.push(`  Files Modified: ${metrics.files.modified.length}`);
        report.push(`  Files Created: ${metrics.files.created.length}`);

        if (metrics.files.modified.length > 0) {
            report.push('  Modified:');
            for (const f of metrics.files.modified.slice(0, 10)) {
                report.push(`    - ${f}`);
            }
        }

        // Commands
        if (metrics.commands.length > 0) {
            report.push(`\n=== COMMANDS EXECUTED (${metrics.commands.length}) ===`);
            for (const cmd of metrics.commands.slice(0, 20)) {
                report.push(`  ${cmd.timestamp}: ${cmd.command.slice(0, 80)}`);
            }
        }

        // Errors
        if (metrics.errors.length > 0) {
            report.push(`\n=== ERRORS (${metrics.errors.length}) ===`);
            for (const err of metrics.errors.slice(0, 10)) {
                report.push(`  ${err.timestamp}: [${err.tool}] ${err.message.slice(0, 100)}`);
            }
        }

        return report.join('\n');
    }

    findAnomalies() {
        const anomalies = [];

        // Check for rapid file modifications
        const fileMods = {};
        for (const event of this.events) {
            if (event.file && event.file.modified) {
                const filePath = event.file.path;
                if (!fileMods[filePath]) fileMods[filePath] = [];
                fileMods[filePath].push(event.timestamp);
            }
        }

        for (const [filePath, timestamps] of Object.entries(fileMods)) {
            if (timestamps.length > 5) {
                anomalies.push({
                    type: 'excessive_file_modifications',
                    file: filePath,
                    count: timestamps.length,
                    severity: 'medium'
                });
            }
        }

        // Check for failed tool calls
        const toolFailures = {};
        for (const event of this.events) {
            if (event.tool && event.tool.success === false) {
                const toolName = event.tool.name;
                toolFailures[toolName] = (toolFailures[toolName] || 0) + 1;
            }
        }

        for (const [tool, failures] of Object.entries(toolFailures)) {
            if (failures > 3) {
                anomalies.push({
                    type: 'repeated_tool_failures',
                    tool: tool,
                    count: failures,
                    severity: 'high'
                });
            }
        }

        // Check for suspicious commands
        const suspiciousPatterns = ['rm -rf', 'curl', 'wget', 'nc ', 'base64', 'eval'];
        for (const event of this.events) {
            if (event.bash) {
                const cmd = (event.bash.command || '').toLowerCase();
                for (const pattern of suspiciousPatterns) {
                    if (cmd.includes(pattern)) {
                        anomalies.push({
                            type: 'suspicious_command',
                            command: event.bash.command.slice(0, 200),
                            pattern: pattern,
                            timestamp: event.timestamp,
                            severity: 'high'
                        });
                    }
                }
            }
        }

        return anomalies;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const options = {
        session: null,
        report: false,
        metrics: false,
        timeline: false,
        verify: [],
        anomalies: false,
        format: 'text',
        limit: null
    };

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--session':
                options.session = args[++i];
                break;
            case '--report':
                options.report = true;
                break;
            case '--metrics':
                options.metrics = true;
                break;
            case '--timeline':
                options.timeline = true;
                break;
            case '--verify':
                while (args[i + 1] && !args[i + 1].startsWith('--')) {
                    options.verify.push(args[++i]);
                }
                break;
            case '--anomalies':
                options.anomalies = true;
                break;
            case '--format':
                options.format = args[++i];
                break;
            case '--limit':
                options.limit = parseInt(args[++i]);
                break;
            case '--help':
            case '-h':
                console.log('Usage: node log_analyzer.js [options]');
                console.log('Options:');
                console.log('  --session <id>    Session ID to analyze (default: current)');
                console.log('  --report          Generate full report');
                console.log('  --metrics         Show metrics only');
                console.log('  --timeline        Show timeline');
                console.log('  --verify <claims> Verify claims');
                console.log('  --anomalies       Find anomalies');
                console.log('  --format <type>   Output format (text|json)');
                console.log('  --limit <n>       Limit number of events to process');
                process.exit(0);
        }
    }

    const analyzer = new LogAnalyzer(options.session);
    
    if (options.limit) {
        await analyzer.loadEvents(options.limit);
    }

    if (options.report) {
        console.log(analyzer.generateReport(options.format));
    } else if (options.metrics) {
        const metrics = analyzer.calculateMetrics();
        if (options.format === 'json') {
            console.log(JSON.stringify(metrics, null, 2));
        } else {
            for (const [key, value] of Object.entries(metrics)) {
                if (!['tools', 'files', 'commands', 'errors', 'subagents', 'agents'].includes(key)) {
                    console.log(`${key}: ${value}`);
                }
            }
        }
    } else if (options.timeline) {
        const timeline = analyzer.generateTimeline();
        if (options.format === 'json') {
            console.log(JSON.stringify(timeline, null, 2));
        } else {
            for (const entry of timeline) {
                console.log(`${entry.time} [${entry.agent}] ${entry.type} ${entry.tool || ''}`);
            }
        }
    } else if (options.verify.length > 0) {
        const verification = analyzer.verifyClaims(options.verify);
        console.log(JSON.stringify(verification, null, 2));
    } else if (options.anomalies) {
        const anomalies = analyzer.findAnomalies();
        if (anomalies.length > 0) {
            console.log('=== ANOMALIES DETECTED ===');
            for (const anomaly of anomalies) {
                console.log(`[${anomaly.severity.toUpperCase()}] ${anomaly.type}: ${JSON.stringify(anomaly)}`);
            }
        } else {
            console.log('No anomalies detected');
        }
    } else {
        // Default: show summary
        const metrics = analyzer.calculateMetrics();
        console.log(`Session: ${metrics.session_id}`);
        console.log(`Events: ${metrics.total_events}`);
        console.log(`Duration: ${metrics.duration}`);
        console.log(`Tools used: ${Object.keys(metrics.tools).length}`);
        console.log(`Files modified: ${metrics.files.modified.length}`);
        console.log(`Commands run: ${metrics.commands.length}`);
        console.log(`Errors: ${metrics.errors.length}`);
    }
}

if (require.main === module) {
    main().catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
}

module.exports = LogAnalyzer;