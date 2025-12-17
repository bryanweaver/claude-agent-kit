#!/usr/bin/env node
/**
 * Session manager for Claude Code audit system.
 * Tracks session lifecycle, agent context switching, and overall metrics.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const AUDIT_BASE_DIR = path.join(os.homedir(), '.claude', 'logs', 'audit');
const SESSION_META_FILE = path.join(AUDIT_BASE_DIR, 'session_metadata.json');
const METRICS_FILE = path.join(AUDIT_BASE_DIR, 'session_metrics.json');

class SessionManager {
    constructor() {
        this.sessionId = this.getSessionId();
        this.startTime = Date.now();
    }

    getSessionId() {
        const sessionFile = path.join(AUDIT_BASE_DIR, 'current_session.json');
        if (fs.existsSync(sessionFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
                return data.session_id || 'unknown';
            } catch (err) {
                // Session file is invalid
            }
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        return `session_${timestamp}`;
    }

    trackEvent(eventType, data) {
        const timestamp = new Date();

        const metrics = {
            timestamp: timestamp.toISOString(),
            session_id: this.sessionId,
            event_type: eventType,
            elapsed_seconds: (Date.now() - this.startTime) / 1000
        };

        // Add resource usage if available
        try {
            metrics.resources = {
                memory_mb: process.memoryUsage().rss / 1024 / 1024,
                heap_used_mb: process.memoryUsage().heapUsed / 1024 / 1024,
                cpu_time: process.cpuUsage()
            };
        } catch (err) {
            // Resource tracking failed
        }

        // Track specific event metrics
        switch (eventType) {
            case 'SessionStart':
                Object.assign(metrics, this.trackSessionStart(data));
                break;
            case 'AgentSwitch':
                Object.assign(metrics, this.trackAgentSwitch(data));
                break;
            case 'SessionEnd':
                Object.assign(metrics, this.trackSessionEnd(data));
                break;
            case 'ToolSummary':
                Object.assign(metrics, this.trackToolSummary(data));
                break;
        }

        // Update session metadata
        this.updateSessionMetadata(metrics);

        // Write metrics
        this.writeMetrics(metrics);

        return metrics;
    }

    trackSessionStart(data) {
        return {
            session: {
                started_at: new Date().toISOString(),
                is_new: data.is_new !== false,
                working_directory: process.cwd(),
                node_version: process.version,
                platform: process.platform
            }
        };
    }

    trackAgentSwitch(data) {
        return {
            agent_switch: {
                from_agent: data.from_agent || 'main',
                to_agent: data.to_agent || 'unknown',
                switch_reason: data.reason || 'task_delegation',
                parent_task: data.parent_task || null
            }
        };
    }

    trackSessionEnd(data) {
        const duration = (Date.now() - this.startTime) / 1000;

        // Calculate summary statistics
        const summary = this.calculateSessionSummary();

        return {
            session_end: {
                ended_at: new Date().toISOString(),
                total_duration_seconds: duration,
                total_duration_human: this.formatDuration(duration),
                summary: summary
            }
        };
    }

    trackToolSummary(data) {
        return {
            tool_summary: {
                tool_name: data.tool_name,
                total_calls: data.total_calls || 0,
                success_rate: data.success_rate || 0,
                avg_duration_ms: data.avg_duration_ms || 0,
                files_affected: data.files_affected || []
            }
        };
    }

    calculateSessionSummary() {
        const summary = {
            total_events: 0,
            tools_used: {},
            agents_activated: new Set(),
            files_modified: new Set(),
            commands_run: 0,
            errors_encountered: 0
        };

        // Read session log and calculate statistics
        const sessionLog = path.join(AUDIT_BASE_DIR, 'sessions', `${this.sessionId}.jsonl`);
        if (fs.existsSync(sessionLog)) {
            try {
                const lines = fs.readFileSync(sessionLog, 'utf8').split('\n').filter(line => line.trim());
                
                lines.forEach(line => {
                    try {
                        const entry = JSON.parse(line);
                        summary.total_events++;

                        // Track tools
                        if (entry.tool) {
                            const toolName = entry.tool.name;
                            summary.tools_used[toolName] = (summary.tools_used[toolName] || 0) + 1;
                        }

                        // Track agents
                        const agentType = (entry.agent || {}).agent_type;
                        if (agentType) {
                            summary.agents_activated.add(agentType);
                        }

                        // Track files
                        if (entry.file && entry.file.path && entry.file.modified) {
                            summary.files_modified.add(entry.file.path);
                        }

                        // Track commands
                        if (entry.bash) {
                            summary.commands_run++;
                        }

                        // Track errors
                        if (entry.error) {
                            summary.errors_encountered++;
                        }
                    } catch (err) {
                        // Skip invalid entries
                    }
                });
            } catch (err) {
                // Log file read failed
            }
        }

        // Convert sets to arrays for JSON serialization
        summary.agents_activated = Array.from(summary.agents_activated);
        summary.files_modified = Array.from(summary.files_modified);

        return summary;
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    updateSessionMetadata(metrics) {
        const updateStartTime = Date.now();
        try {
            let metadata = {};
            if (fs.existsSync(SESSION_META_FILE)) {
                metadata = JSON.parse(fs.readFileSync(SESSION_META_FILE, 'utf8'));
            }

            // Update metadata
            if (!metadata[this.sessionId]) {
                metadata[this.sessionId] = {
                    start_time: new Date().toISOString(),
                    events: []
                };
            }

            metadata[this.sessionId].last_update = new Date().toISOString();
            metadata[this.sessionId].events.push({
                type: metrics.event_type,
                timestamp: metrics.timestamp
            });

            // Keep only last 100 sessions
            const sessionKeys = Object.keys(metadata);
            if (sessionKeys.length > 100) {
                const oldest = sessionKeys.sort().slice(0, -100);
                oldest.forEach(key => delete metadata[key]);
            }

            fs.mkdirSync(path.dirname(SESSION_META_FILE), { recursive: true });
            fs.writeFileSync(SESSION_META_FILE, JSON.stringify(metadata, null, 2));
        } catch (err) {
            // Enhanced error logging
            const errorLog = path.join(AUDIT_BASE_DIR, 'metadata_errors.log');
            const errorEntry = {
                timestamp: new Date().toISOString(),
                operation: 'update_metadata',
                error: err.message,
                stack: err.stack,
                session_id: this.sessionId,
                duration_ms: Date.now() - updateStartTime
            };
            
            try {
                fs.appendFileSync(errorLog, JSON.stringify(errorEntry) + '\n');
            } catch (writeErr) {
                console.error('Failed to update session metadata:', err.message);
                console.error('Also failed to log error:', writeErr.message);
            }
        }
    }

    writeMetrics(metrics) {
        const writeStartTime = Date.now();
        try {
            fs.mkdirSync(path.dirname(METRICS_FILE), { recursive: true });
            fs.appendFileSync(METRICS_FILE, JSON.stringify(metrics) + '\n');
        } catch (err) {
            // Enhanced error logging
            const errorLog = path.join(AUDIT_BASE_DIR, 'metrics_errors.log');
            const errorEntry = {
                timestamp: new Date().toISOString(),
                operation: 'write_metrics',
                error: err.message,
                stack: err.stack,
                metrics_summary: {
                    session_id: metrics.session_id,
                    event_type: metrics.event_type
                },
                duration_ms: Date.now() - writeStartTime
            };
            
            try {
                fs.appendFileSync(errorLog, JSON.stringify(errorEntry) + '\n');
            } catch (writeErr) {
                console.error('Failed to write metrics:', err.message);
                console.error('Also failed to log error:', writeErr.message);
            }
        }
    }
}

function main() {
    const errorLog = path.join(AUDIT_BASE_DIR, 'session_errors.log');
    const startTime = Date.now();
    
    // Enhanced error logging
    const logError = (stage, error, details = {}) => {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            hook: 'session_manager',
            stage: stage,
            error: error.message || String(error),
            stack: error.stack || null,
            details: details,
            env: {
                event: process.env.CLAUDE_HOOK_EVENT,
                cwd: process.cwd(),
                pid: process.pid,
                session_verbose: process.env.CLAUDE_SESSION_VERBOSE
            }
        };
        
        try {
            fs.mkdirSync(path.dirname(errorLog), { recursive: true });
            fs.appendFileSync(errorLog, JSON.stringify(errorEntry) + '\n');
        } catch (writeErr) {
            console.error('Session hook error (cannot write to log):', errorEntry);
        }
    };
    
    try {
        // Read input from stdin
        let inputData = '';
        process.stdin.setEncoding('utf8');
        
        // Track if we received any data
        let dataReceived = false;
        
        process.stdin.on('data', chunk => {
            dataReceived = true;
            inputData += chunk;
        });

        process.stdin.on('end', () => {
            try {
                if (!dataReceived) {
                    logError('no_input', new Error('No input data received'), {
                        duration_ms: Date.now() - startTime
                    });
                }
                
                const data = JSON.parse(inputData);

                // Determine event type
                let eventType = process.env.CLAUDE_HOOK_EVENT || 'unknown';

                // Special handling for session events
                if (['SessionStart', 'Stop', 'SubagentStop'].includes(eventType)) {
                    const manager = new SessionManager();

                    // Map Claude events to session events
                    if (eventType === 'Stop') {
                        // Check if this is a session end
                        if (data.is_final) {
                            eventType = 'SessionEnd';
                        }
                    } else if (eventType === 'SubagentStop') {
                        eventType = 'AgentSwitch';
                    }

                    const metrics = manager.trackEvent(eventType, data);

                    if (process.env.CLAUDE_SESSION_VERBOSE === '1') {
                        console.log(`✓ Session: ${eventType} tracked`);
                    }
                }

                process.exit(0);
            } catch (err) {
                logError('parse_or_process', err, {
                    inputLength: inputData ? inputData.length : 0,
                    inputPreview: inputData ? inputData.slice(0, 200) : 'no input',
                    eventType: process.env.CLAUDE_HOOK_EVENT,
                    duration_ms: Date.now() - startTime
                });
                
                console.error('Session manager error:', err.message || err);
                if (process.env.CLAUDE_SESSION_DEBUG === '1') {
                    console.error('Stack:', err.stack);
                    console.error('Input:', inputData ? inputData.slice(0, 500) : 'no input');
                }
                process.exit(0);
            }
        });
        
        // Add timeout protection
        setTimeout(() => {
            logError('timeout', new Error('Session hook timed out after 5 seconds'), {
                duration_ms: Date.now() - startTime,
                dataReceived: inputData.length > 0
            });
            console.error('Session hook timeout - exiting');
            process.exit(0);
        }, 5000);

    } catch (err) {
        logError('initialization', err, {
            duration_ms: Date.now() - startTime
        });
        console.error('Session manager initialization error:', err.message || err);
        process.exit(0);
    }
}

if (require.main === module) {
    main();
}