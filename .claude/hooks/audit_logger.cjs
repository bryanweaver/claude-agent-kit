#!/usr/bin/env node
/**
 * Comprehensive audit logger for Claude Code operations.
 * Tracks all tool usage, timing, agent context, and results.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// Configuration
const AUDIT_BASE_DIR = path.join(os.homedir(), '.claude', 'logs', 'audit');
const PROJECT_AUDIT_DIR = path.join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), '.claude', 'logs', 'audit');
const SESSION_FILE = path.join(AUDIT_BASE_DIR, 'current_session.json');
const MAX_LOG_SIZE = 50 * 1024 * 1024; // 50MB per log file

class AuditLogger {
    constructor() {
        this.sessionId = this.getOrCreateSession();
        this.ensureDirectoriesExist();
    }

    ensureDirectoriesExist() {
        const directories = [
            path.join(AUDIT_BASE_DIR, 'sessions'),
            path.join(AUDIT_BASE_DIR, 'tools'),
            path.join(AUDIT_BASE_DIR, 'agents'),
            path.join(PROJECT_AUDIT_DIR, 'sessions'),
            path.join(PROJECT_AUDIT_DIR, 'tools'),
            path.join(PROJECT_AUDIT_DIR, 'agents')
        ];

        directories.forEach(dir => {
            fs.mkdirSync(dir, { recursive: true });
        });
    }

    getOrCreateSession() {
        try {
            if (fs.existsSync(SESSION_FILE)) {
                const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
                if (data.active) {
                    return data.session_id;
                }
            }
        } catch (err) {
            // Session file doesn't exist or is invalid
        }

        // Create new session
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const sessionId = `session_${timestamp}_${process.pid}`;
        const sessionData = {
            session_id: sessionId,
            start_time: new Date().toISOString(),
            active: true,
            pid: process.pid
        };

        fs.mkdirSync(path.dirname(SESSION_FILE), { recursive: true });
        fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));

        return sessionId;
    }

    calculateFileHash(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath);
                return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
            }
        } catch (err) {
            // File doesn't exist or can't be read
        }
        return null;
    }

    extractAgentInfo(inputData) {
        const agentInfo = {
            agent_type: process.env.CLAUDE_AGENT_TYPE || 'main',
            agent_id: process.env.CLAUDE_AGENT_ID || 'unknown',
            parent_agent: process.env.CLAUDE_PARENT_AGENT || null,
            task_description: process.env.CLAUDE_TASK_DESCRIPTION || null
        };

        // Try to detect from tool_input if available
        const toolInput = inputData.tool_input || {};
        if (toolInput.subagent_type) {
            agentInfo.subagent_type = toolInput.subagent_type;
        }
        if (toolInput.description && inputData.tool_name === 'Task') {
            agentInfo.task_description = toolInput.description;
        }

        return agentInfo;
    }

    logEvent(eventType, inputData) {
        const timestamp = new Date();

        // Build comprehensive log entry
        const logEntry = {
            timestamp: timestamp.toISOString(),
            timestamp_unix: timestamp.getTime() / 1000,
            session_id: this.sessionId,
            event_type: eventType,
            sequence_number: Date.now() % 1000000000,
            agent: this.extractAgentInfo(inputData),
            environment: {
                cwd: process.cwd(),
                user: process.env.USER || process.env.USERNAME || 'unknown',
                project_dir: process.env.CLAUDE_PROJECT_DIR || null
            }
        };

        // Add event-specific data
        switch (eventType) {
            case 'PreToolUse':
                Object.assign(logEntry, this.logPreToolUse(inputData));
                break;
            case 'PostToolUse':
                Object.assign(logEntry, this.logPostToolUse(inputData));
                break;
            case 'UserPromptSubmit':
                Object.assign(logEntry, this.logUserPrompt(inputData));
                break;
            case 'Stop':
                Object.assign(logEntry, this.logStop(inputData));
                break;
            case 'SubagentStop':
                Object.assign(logEntry, this.logSubagentStop(inputData));
                break;
            case 'SessionStart':
                Object.assign(logEntry, this.logSessionStart(inputData));
                break;
            default:
                logEntry.raw_data = inputData;
        }

        // Calculate entry checksum for tamper detection
        const checksumData = JSON.stringify(logEntry, Object.keys(logEntry).sort());
        logEntry.checksum = crypto.createHash('sha256').update(checksumData).digest('hex').slice(0, 8);

        // Write log entry
        this.writeLogEntry(logEntry);

        return logEntry;
    }

    logPreToolUse(data) {
        const toolInput = data.tool_input || {};
        const toolName = data.tool_name || 'unknown';

        const result = {
            tool: {
                name: toolName,
                start_time: new Date().toISOString()
            }
        };

        // Track file operations
        if (['Edit', 'MultiEdit', 'Write', 'Read'].includes(toolName)) {
            const filePath = toolInput.file_path;
            if (filePath) {
                result.file = {
                    path: filePath,
                    hash_before: this.calculateFileHash(filePath),
                    exists_before: fs.existsSync(filePath)
                };
            }
        }

        // Track Bash commands
        if (toolName === 'Bash') {
            result.bash = {
                command: toolInput.command || '',
                description: toolInput.description || '',
                timeout: toolInput.timeout || 120000,
                background: toolInput.run_in_background || false
            };
        }

        // Track Task (subagent) calls
        if (toolName === 'Task') {
            result.subagent = {
                type: toolInput.subagent_type || 'unknown',
                description: toolInput.description || '',
                prompt_length: (toolInput.prompt || '').length
            };
        }

        // Sanitized parameters
        result.parameters = this.sanitizeParameters(toolInput);

        return result;
    }

    logPostToolUse(data) {
        const toolName = data.tool_name || 'unknown';
        const toolResult = data.tool_result || {};

        const result = {
            tool: {
                name: toolName,
                end_time: new Date().toISOString(),
                success: !toolResult.error,
                duration_ms: data.duration_ms || 0
            }
        };

        // Track file changes
        if (['Edit', 'MultiEdit', 'Write'].includes(toolName)) {
            const filePath = (data.tool_input || {}).file_path;
            if (filePath) {
                result.file = {
                    path: filePath,
                    hash_after: this.calculateFileHash(filePath),
                    exists_after: fs.existsSync(filePath),
                    modified: true
                };
            }
        }

        // Track Bash output
        if (toolName === 'Bash') {
            const output = String(toolResult.output || '');
            result.bash = {
                exit_code: toolResult.exit_code || -1,
                output_lines: output.split('\n').length,
                output_size: output.length,
                truncated: output.length > 30000
            };
        }

        // Track errors
        if (toolResult.error) {
            result.error = {
                message: String(toolResult.error || '').slice(0, 500),
                type: toolResult.error_type || 'unknown'
            };
        }

        return result;
    }

    logUserPrompt(data) {
        const prompt = data.prompt || '';
        return {
            user_prompt: {
                length: prompt.length,
                word_count: prompt.split(/\s+/).length,
                has_code: prompt.includes('```'),
                preview: prompt.slice(0, 200)
            }
        };
    }

    logStop(data) {
        return {
            response: {
                finished_at: new Date().toISOString(),
                total_tools_used: data.total_tools_used || 0,
                files_modified: data.files_modified || [],
                tests_run: data.tests_run || false
            }
        };
    }

    logSubagentStop(data) {
        return {
            subagent: {
                type: data.subagent_type || 'unknown',
                task_completed: data.success || false,
                duration_ms: data.duration_ms || 0,
                result_preview: String(data.result || '').slice(0, 500)
            }
        };
    }

    logSessionStart(data) {
        return {
            session: {
                type: data.is_new ? 'start' : 'resume',
                session_id: this.sessionId,
                started_at: new Date().toISOString()
            }
        };
    }

    sanitizeParameters(params) {
        const sanitized = {};
        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'api', 'auth'];

        for (const [key, value] of Object.entries(params)) {
            if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
                sanitized[key] = '[REDACTED]';
            } else if (typeof value === 'string' && value.length > 1000) {
                sanitized[key] = `[TRUNCATED: ${value.length} chars]`;
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeParameters(value);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }

    writeLogEntry(logEntry) {
        const writeStartTime = Date.now();
        const errors = [];
        
        try {
            // Write to session log
            const sessionLog = path.join(AUDIT_BASE_DIR, 'sessions', `${this.sessionId}.jsonl`);
            const projectSessionLog = path.join(PROJECT_AUDIT_DIR, 'sessions', `${this.sessionId}.jsonl`);

            [sessionLog, projectSessionLog].forEach(logFile => {
                // Rotate if too large
                if (fs.existsSync(logFile)) {
                    const stats = fs.statSync(logFile);
                    if (stats.size > MAX_LOG_SIZE) {
                        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                        fs.renameSync(logFile, logFile.replace('.jsonl', `.${timestamp}.jsonl`));
                    }
                }

                fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
            });

            // Write to tool-specific log if applicable
            if (logEntry.tool) {
                const toolName = logEntry.tool.name.toLowerCase();
                const toolLog = path.join(AUDIT_BASE_DIR, 'tools', `${toolName}.jsonl`);
                fs.appendFileSync(toolLog, JSON.stringify(logEntry) + '\n');
            }

            // Write to agent-specific log
            const agentType = (logEntry.agent || {}).agent_type || 'main';
            const agentLog = path.join(AUDIT_BASE_DIR, 'agents', `${agentType}.jsonl`);
            fs.appendFileSync(agentLog, JSON.stringify(logEntry) + '\n');

        } catch (err) {
            // Log to error file instead of just console
            const errorLog = path.join(AUDIT_BASE_DIR, 'write_errors.log');
            const errorEntry = {
                timestamp: new Date().toISOString(),
                error: err.message,
                stack: err.stack,
                logEntry: {
                    session_id: logEntry.session_id,
                    event_type: logEntry.event_type,
                    tool: logEntry.tool ? logEntry.tool.name : null
                },
                duration_ms: Date.now() - writeStartTime
            };
            
            try {
                fs.appendFileSync(errorLog, JSON.stringify(errorEntry) + '\n');
            } catch (writeErr) {
                // Last resort - output to stderr
                console.error('Failed to write audit log:', err.message);
                console.error('Also failed to write error log:', writeErr.message);
            }
        }
    }
}

function main() {
    const errorLog = path.join(AUDIT_BASE_DIR, 'hook_errors.log');
    const startTime = Date.now();
    
    // Log hook invocation
    const logError = (stage, error, details = {}) => {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            hook: 'audit_logger',
            stage: stage,
            error: error.message || String(error),
            stack: error.stack || null,
            details: details,
            env: {
                event: process.env.CLAUDE_HOOK_EVENT,
                cwd: process.cwd(),
                pid: process.pid
            }
        };
        
        try {
            fs.mkdirSync(path.dirname(errorLog), { recursive: true });
            fs.appendFileSync(errorLog, JSON.stringify(errorEntry) + '\n');
        } catch (writeErr) {
            // Fallback to stderr if we can't write to file
            console.error('Hook error (cannot write to log):', errorEntry);
        }
    };
    
    try {
        // Read input from stdin
        let inputData = '';
        process.stdin.setEncoding('utf8');
        
        process.stdin.on('data', chunk => {
            inputData += chunk;
        });

        process.stdin.on('end', () => {
            try {
                // Log raw input for debugging
                if (process.env.CLAUDE_HOOK_DEBUG === '1') {
                    logError('debug_input', new Error('Raw input received'), {
                        inputLength: inputData.length,
                        inputPreview: inputData.slice(0, 500)
                    });
                }
                
                const data = JSON.parse(inputData);

                // Determine event type
                let eventType = process.env.CLAUDE_HOOK_EVENT || 'unknown';
                if (!eventType || eventType === 'unknown') {
                    // Try to infer from input
                    if (data.tool_name) {
                        eventType = data.tool_result ? 'PostToolUse' : 'PreToolUse';
                    } else if (data.prompt) {
                        eventType = 'UserPromptSubmit';
                    }
                }

                // Log the event
                const logger = new AuditLogger();
                const logEntry = logger.logEvent(eventType, data);

                // Output minimal feedback (non-blocking)
                if (process.env.CLAUDE_AUDIT_VERBOSE === '1') {
                    console.log(`✓ Audit: ${eventType} logged [${logEntry.sequence_number}]`);
                }

                process.exit(0);
            } catch (err) {
                logError('parse_or_process', err, {
                    inputLength: inputData ? inputData.length : 0,
                    inputPreview: inputData ? inputData.slice(0, 200) : 'no input',
                    duration_ms: Date.now() - startTime
                });
                
                console.error('Audit error:', err.message || err);
                if (process.env.CLAUDE_AUDIT_DEBUG === '1') {
                    console.error('Stack:', err.stack);
                    console.error('Input data:', inputData ? inputData.slice(0, 500) : 'no input');
                }
                
                // Exit cleanly to avoid blocking
                process.exit(0);
            }
        });
        
        // Add timeout to prevent hanging
        setTimeout(() => {
            logError('timeout', new Error('Hook timed out after 5 seconds'), {
                duration_ms: Date.now() - startTime
            });
            console.error('Audit hook timeout - exiting');
            process.exit(0);
        }, 5000);

    } catch (err) {
        logError('initialization', err, {
            duration_ms: Date.now() - startTime
        });
        console.error('Audit initialization error:', err.message || err);
        process.exit(0);
    }
}

if (require.main === module) {
    main();
}