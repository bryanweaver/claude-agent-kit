#!/usr/bin/env node
/**
 * Diagnostic tool to trace hook execution and identify hanging issues
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

const TRACE_LOG = path.join(process.cwd(), '.claude', 'hooks', 'trace.log');

function log(message, data = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        pid: process.pid,
        message: message,
        ...data
    };
    
    console.log(`[${entry.timestamp}] ${message}`);
    if (Object.keys(data).length > 0) {
        console.log('  Data:', JSON.stringify(data, null, 2));
    }
    
    try {
        fs.appendFileSync(TRACE_LOG, JSON.stringify(entry) + '\n');
    } catch (e) {
        console.error('Could not write to trace log:', e.message);
    }
}

function simulateSessionStart() {
    log('Starting SessionStart simulation');
    
    const hooks = [
        '.claude/hooks/audit_logger.js',
        '.claude/hooks/session_manager.js'
    ];
    
    const testInput = JSON.stringify({
        is_new: true,
        timestamp: new Date().toISOString()
    });
    
    hooks.forEach((hookPath, index) => {
        log(`Testing hook ${index + 1}/${hooks.length}: ${hookPath}`);
        
        const startTime = Date.now();
        const child = spawn('node', [hookPath], {
            env: {
                ...process.env,
                CLAUDE_HOOK_EVENT: 'SessionStart',
                CLAUDE_AUDIT_DEBUG: '1',
                CLAUDE_SESSION_DEBUG: '1'
            },
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let stdout = '';
        let stderr = '';
        let exited = false;
        
        // Monitor stdout
        child.stdout.on('data', (data) => {
            stdout += data.toString();
            log(`Hook stdout (${hookPath})`, { output: data.toString().slice(0, 200) });
        });
        
        // Monitor stderr
        child.stderr.on('data', (data) => {
            stderr += data.toString();
            log(`Hook stderr (${hookPath})`, { output: data.toString().slice(0, 200) });
        });
        
        // Monitor exit
        child.on('exit', (code) => {
            exited = true;
            const duration = Date.now() - startTime;
            log(`Hook exited (${hookPath})`, {
                code: code,
                duration_ms: duration,
                stdout_length: stdout.length,
                stderr_length: stderr.length
            });
        });
        
        // Send input
        log(`Sending input to hook (${hookPath})`, { input_length: testInput.length });
        child.stdin.write(testInput);
        child.stdin.end();
        
        // Check if still running after 1 second
        setTimeout(() => {
            if (!exited) {
                log(`WARNING: Hook still running after 1 second (${hookPath})`);
                
                // Try to get process info
                try {
                    process.kill(child.pid, 0); // Check if process exists
                    log(`Hook process is still alive (${hookPath})`, { pid: child.pid });
                } catch (e) {
                    log(`Hook process check failed (${hookPath})`, { error: e.message });
                }
                
                // Force kill after 3 seconds
                setTimeout(() => {
                    if (!exited) {
                        log(`KILLING hung hook (${hookPath})`);
                        child.kill('SIGKILL');
                    }
                }, 2000);
            }
        }, 1000);
    });
}

function checkProcesses() {
    log('Checking for zombie Node processes');
    
    const checkCmd = process.platform === 'win32' 
        ? 'powershell "Get-Process node -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, StartTime, CPU"'
        : 'ps aux | grep node';
    
    const child = spawn(process.platform === 'win32' ? 'powershell' : 'sh', 
                        process.platform === 'win32' ? ['-Command', checkCmd.replace('powershell ', '')] : ['-c', checkCmd], 
                        { shell: true });
    
    let output = '';
    child.stdout.on('data', (data) => {
        output += data.toString();
    });
    
    child.on('exit', () => {
        log('Current Node processes:', { output: output.slice(0, 1000) });
    });
}

function testStdinHandling() {
    log('Testing stdin handling in hooks');
    
    const testHook = '.claude/hooks/audit_logger.js';
    
    // Test 1: Send data and immediately close stdin
    log('Test 1: Normal input flow');
    const child1 = spawn('node', [testHook], {
        env: { ...process.env, CLAUDE_HOOK_EVENT: 'PreToolUse' },
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    child1.stdin.write('{"tool_name":"test"}');
    child1.stdin.end();
    
    child1.on('exit', (code) => {
        log('Test 1 result', { code: code });
    });
    
    // Test 2: Close stdin without sending data
    setTimeout(() => {
        log('Test 2: No input, immediate close');
        const child2 = spawn('node', [testHook], {
            env: { ...process.env, CLAUDE_HOOK_EVENT: 'PreToolUse' },
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        child2.stdin.end();
        
        child2.on('exit', (code) => {
            log('Test 2 result', { code: code });
        });
    }, 1000);
    
    // Test 3: Send partial data
    setTimeout(() => {
        log('Test 3: Partial JSON input');
        const child3 = spawn('node', [testHook], {
            env: { ...process.env, CLAUDE_HOOK_EVENT: 'PreToolUse' },
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        child3.stdin.write('{"tool');
        child3.stdin.end();
        
        child3.on('exit', (code) => {
            log('Test 3 result', { code: code });
        });
    }, 2000);
}

function checkLogFiles() {
    log('Checking log files for recent activity');
    
    const logDir = path.join(os.homedir(), '.claude', 'logs', 'audit');
    const logFiles = [
        'current_session.json',
        'hook_errors.log',
        'session_errors.log'
    ];
    
    logFiles.forEach(file => {
        const filePath = path.join(logDir, file);
        try {
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n').filter(l => l.trim());
                
                log(`Log file: ${file}`, {
                    size: stats.size,
                    modified: stats.mtime.toISOString(),
                    lines: lines.length,
                    last_line: lines[lines.length - 1]?.slice(0, 200)
                });
            } else {
                log(`Log file not found: ${file}`);
            }
        } catch (e) {
            log(`Error reading log file: ${file}`, { error: e.message });
        }
    });
}

async function main() {
    console.log('=== Claude Hooks Diagnostic Tool ===\n');
    
    // Clear trace log
    try {
        fs.writeFileSync(TRACE_LOG, '');
    } catch (e) {
        // Ignore
    }
    
    log('Starting diagnostics');
    
    // Check existing processes
    checkProcesses();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check log files
    checkLogFiles();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test stdin handling
    testStdinHandling();
    
    // Wait for stdin tests
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Simulate SessionStart
    simulateSessionStart();
    
    // Wait for simulation
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Final process check
    checkProcesses();
    
    console.log('\n=== Diagnostics Complete ===');
    console.log(`Trace log saved to: ${TRACE_LOG}`);
    console.log('\nIf hooks are hanging, check for:');
    console.log('1. Node processes that don\'t exit');
    console.log('2. Missing stdin.end() calls');
    console.log('3. Infinite loops in hook code');
    console.log('4. File system permission issues');
}

if (require.main === module) {
    main().catch(err => {
        console.error('Diagnostic error:', err);
        process.exit(1);
    });
}