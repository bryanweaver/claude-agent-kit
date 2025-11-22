#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { install } from '../lib/install.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('claude-agent-kit')
  .description('Install and manage Claude Code agents, commands, and hooks')
  .version(packageJson.version);

// Install command
program
  .command('install')
  .description('Install agents, commands, and hooks to your Claude Code setup')
  .option('-g, --global', 'Install to global ~/.claude/ directory (default)')
  .option('-p, --project', 'Install to project ./.claude/ directory')
  .option('--agents <names>', 'Install specific agents (comma-separated)')
  .option('--commands <names>', 'Install specific commands (comma-separated)')
  .option('--hooks <names>', 'Install specific hooks (comma-separated)')
  .action(async (options) => {
    try {
      await install(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// List command (basic for Phase 1)
program
  .command('list')
  .description('List available agents, commands, and hooks')
  .action(() => {
    console.log(chalk.blue.bold('\nClaude Agent Kit - Available Assets\n'));

    console.log(chalk.yellow('Agents:'));
    console.log('  - shipper (Git operations, testing, deployment)');
    console.log('  - reviewer (Code review, security, bugs)');
    console.log('  - meta-agent (Generate custom agents)');
    console.log('  - meta-commands-agent (Create slash commands)');
    console.log('  - database-admin (AWS Amplify backend)');
    console.log('  - full-stack-developer (Vue.js frontend)\n');

    console.log(chalk.yellow('Commands:'));
    console.log('  - /ship (Build and deploy features)');
    console.log('  - /fix (Emergency bug fixes)');
    console.log('  - /cleanup (Technical debt and refactoring)');
    console.log('  - /audit (Analyze audit logs)');
    console.log('  - /repo-status (Repository status report)');
    console.log('  - /add-tests (Add test coverage)');
    console.log('  - /test (Batch test and fix workflows)');
    console.log('  - /all_tools (List all available tools)\n');

    console.log(chalk.yellow('Hooks:'));
    console.log('  - audit_logger.js (Audit logging for tool usage)');
    console.log('  - session_manager.js (Session persistence)');
    console.log('  - diagnose.js (Diagnostic tools)');
    console.log('  - log_analyzer.js (Log analysis)');
    console.log('  - session_start.js (Session initialization)');
    console.log('  - test_hooks.js (Hook testing utilities)\n');
  });

// Parse command line arguments
program.parse();
