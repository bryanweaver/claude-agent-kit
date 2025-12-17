#!/usr/bin/env node
/**
 * Test script for Claude Code hooks with various error scenarios
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const AUDIT_BASE_DIR = path.join(os.homedir(), '.claude', 'logs', 'audit');

// Test scenarios
const testScenarios = [
    {
        name: 'Valid PreToolUse event',
        hook: 'audit_logger.js',
        env: { CLAUDE_HOOK_EVENT: 'PreToolUse' },
        input: JSON.stringify({
            tool_name: 'Read',
            tool_input: { file_path: '/test/file.txt' }
        }),
        expectSuccess: true
    },
    {
        name: 'Valid PostToolUse event',
        hook: 'audit_logger.js',
        env: { CLAUDE_HOOK_EVENT: 'PostToolUse' },
        input: JSON.stringify({
            tool_name: 'Write',
            tool_input: { file_path: '/test/output.txt', content: 'test' },
            tool_result: { success: true },
            duration_ms: 123
        }),
        expectSuccess: true
    },
    {
        name: 'Invalid JSON input',
        hook: 'audit_logger.js',
        env: { CLAUDE_HOOK_EVENT: 'PreToolUse' },
        input: '{ invalid json',
        expectSuccess: false
    },
    {
        name: 'Empty input',
        hook: 'audit_logger.js',
        env: { CLAUDE_HOOK_EVENT: 'PreToolUse' },
        input: '',
        expectSuccess: false
    },
    {
        name: 'Very large input',
        hook: 'audit_logger.js',
        env: { CLAUDE_HOOK_EVENT: 'PreToolUse' },
        input: JSON.stringify({
            tool_name: 'Edit',
            tool_input: {
                file_path: '/test/large.txt',
                old_string: 'x'.repeat(10000),
                new_string: 'y'.repeat(10000)
            }
        }),
        expectSuccess: true
    },
    {
        name: 'Session start event',
        hook: 'session_manager.js',
        env: { CLAUDE_HOOK_EVENT: 'SessionStart' },
        input: JSON.stringify({ is_new: true }),
        expectSuccess: true
    },
    {
        name: 'Session end event',
        hook: 'session_manager.js',
        env: { CLAUDE_HOOK_EVENT: 'Stop' },
        input: JSON.stringify({ is_final: true }),
        expectSuccess: true
    }
];

async function runTest(scenario) {
    return new Promise((resolve) => {
        console.log(`\nTesting: ${scenario.name}`);
        console.log(`Hook: ${scenario.hook}`);
        
        const hookPath = path.join(__dirname, scenario.hook);
        
        // Check if hook exists
        if (!fs.existsSync(hookPath)) {
            console.error(`  ❌ Hook file not found: ${hookPath}`);
            resolve(false);
            return;
        }
        
        const child = spawn('node', [hookPath], {
            env: { ...process.env, ...scenario.env },
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let stdout = '';
        let stderr = '';
        let timedOut = false;
        
        // Set timeout
        const timeout = setTimeout(() => {
            timedOut = true;
            child.kill();
        }, 6000); // 6 seconds (hook has 5 second timeout)
        
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        child.on('exit', (code) => {
            clearTimeout(timeout);
            
            if (timedOut) {
                console.log('  ❌ Test timed out');
                resolve(false);
                return;
            }
            
            const success = (code === 0) === scenario.expectSuccess;
            
            if (success) {
                console.log(`  ✅ Test passed (exit code: ${code})`);
            } else {
                console.log(`  ❌ Test failed (exit code: ${code}, expected: ${scenario.expectSuccess ? 0 : 'non-zero'})`);
            }
            
            if (stdout) {
                console.log(`  stdout: ${stdout.slice(0, 200)}`);
            }
            
            if (stderr) {
                console.log(`  stderr: ${stderr.slice(0, 200)}`);
            }
            
            resolve(success);
        });
        
        // Send input
        child.stdin.write(scenario.input);
        child.stdin.end();
    });
}

async function checkErrorLogs() {
    console.log('\n=== Checking error logs ===');
    
    const errorLogs = [
        'hook_errors.log',
        'write_errors.log',
        'session_errors.log',
        'metadata_errors.log',
        'metrics_errors.log'
    ];
    
    for (const logFile of errorLogs) {
        const logPath = path.join(AUDIT_BASE_DIR, logFile);
        if (fs.existsSync(logPath)) {
            const stats = fs.statSync(logPath);
            console.log(`${logFile}: ${stats.size} bytes`);
            
            // Show last few errors
            try {
                const content = fs.readFileSync(logPath, 'utf8');
                const lines = content.trim().split('\n');
                const lastLines = lines.slice(-3);
                
                if (lastLines.length > 0) {
                    console.log(`  Last ${lastLines.length} error(s):`);
                    lastLines.forEach(line => {
                        try {
                            const error = JSON.parse(line);
                            console.log(`    ${error.timestamp}: ${error.stage} - ${error.error}`);
                        } catch (e) {
                            console.log(`    [unparseable]: ${line.slice(0, 100)}`);
                        }
                    });
                }
            } catch (e) {
                console.log(`  Could not read log: ${e.message}`);
            }
        } else {
            console.log(`${logFile}: not found`);
        }
    }
}

async function main() {
    console.log('=== Claude Code Hook Test Suite ===');
    console.log(`Testing ${testScenarios.length} scenarios...`);
    
    let passed = 0;
    let failed = 0;
    
    for (const scenario of testScenarios) {
        const result = await runTest(scenario);
        if (result) {
            passed++;
        } else {
            failed++;
        }
    }
    
    console.log('\n=== Test Results ===');
    console.log(`Passed: ${passed}/${testScenarios.length}`);
    console.log(`Failed: ${failed}/${testScenarios.length}`);
    
    // Check error logs
    await checkErrorLogs();
    
    // Show where logs are stored
    console.log('\n=== Log Locations ===');
    console.log(`Audit logs: ${AUDIT_BASE_DIR}`);
    console.log(`Project logs: ${path.join(process.cwd(), '.claude', 'logs', 'audit')}`);
    
    process.exit(failed > 0 ? 1 : 0);
}

if (require.main === module) {
    main().catch(err => {
        console.error('Test suite error:', err);
        process.exit(1);
    });
}