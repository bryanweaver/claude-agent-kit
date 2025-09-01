#!/usr/bin/env node
/**
 * Safe SessionStart hook that won't hang Claude Code
 * This hook specifically handles session initialization without waiting for stdin
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const AUDIT_BASE_DIR = path.join(os.homedir(), '.claude', 'logs', 'audit');
const SESSION_FILE = path.join(AUDIT_BASE_DIR, 'current_session.json');

// Force exit after 1 second no matter what
setTimeout(() => {
    process.exit(0);
}, 1000);

try {
    // Create directories
    fs.mkdirSync(path.join(AUDIT_BASE_DIR, 'sessions'), { recursive: true });
    
    // Generate session ID
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const sessionId = `session_${timestamp}_${process.pid}`;
    
    // Create session metadata
    const sessionData = {
        session_id: sessionId,
        start_time: new Date().toISOString(),
        active: true,
        pid: process.pid,
        cwd: process.cwd(),
        user: process.env.USER || process.env.USERNAME || 'unknown',
        project_dir: process.env.CLAUDE_PROJECT_DIR || process.cwd()
    };
    
    // Write session file
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
    
    // Log session start event
    const logEntry = {
        timestamp: new Date().toISOString(),
        session_id: sessionId,
        event_type: 'SessionStart',
        environment: {
            cwd: process.cwd(),
            user: sessionData.user,
            project_dir: sessionData.project_dir,
            node_version: process.version,
            platform: process.platform
        }
    };
    
    // Write to session log
    const sessionLog = path.join(AUDIT_BASE_DIR, 'sessions', `${sessionId}.jsonl`);
    fs.appendFileSync(sessionLog, JSON.stringify(logEntry) + '\n');
    
    // Also write to project-specific log if in a project
    const projectAuditDir = path.join(process.cwd(), '.claude', 'logs', 'audit', 'sessions');
    if (process.cwd().includes('projects')) {
        try {
            fs.mkdirSync(projectAuditDir, { recursive: true });
            const projectSessionLog = path.join(projectAuditDir, `${sessionId}.jsonl`);
            fs.appendFileSync(projectSessionLog, JSON.stringify(logEntry) + '\n');
        } catch (e) {
            // Ignore project log errors
        }
    }
    
    // Exit successfully
    process.exit(0);
    
} catch (err) {
    // Log error but don't block
    try {
        const errorLog = path.join(AUDIT_BASE_DIR, 'session_start_errors.log');
        const errorEntry = {
            timestamp: new Date().toISOString(),
            error: err.message,
            stack: err.stack
        };
        fs.appendFileSync(errorLog, JSON.stringify(errorEntry) + '\n');
    } catch (e) {
        // Even error logging failed, just exit
    }
    
    process.exit(0);
}