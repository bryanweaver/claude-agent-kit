#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { install } from '../lib/install.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Global error handlers for uncaught exceptions and unhandled rejections
process.on('unhandledRejection', (reason, _promise) => {
  console.error(chalk.red('Unhandled promise rejection:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught exception:'), error);
  process.exit(1);
});

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('claude-agent-kit')
  .description('Install and manage Claude Code agents, commands, hooks, and skills')
  .version(packageJson.version);

// Install command
program
  .command('install')
  .description('Install agents, commands, hooks, and skills to your Claude Code setup')
  .option('-g, --global', 'Install to global ~/.claude/ directory (default)')
  .option('-p, --project', 'Install to project ./.claude/ directory')
  .option('--agents <names>', 'Install specific agents (comma-separated)')
  .option('--commands <names>', 'Install specific commands (comma-separated)')
  .option('--hooks <names>', 'Install specific hooks (comma-separated)')
  .option('--skills <names>', 'Install specific skills (comma-separated)')
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
    console.log('  - database-admin (Supabase database, RLS, migrations)');
    console.log('  - full-stack-developer (Next.js/React frontend)');
    console.log('  - documentor (Documentation management)\n');

    console.log(chalk.yellow('Commands:'));
    console.log('  - /create-agent (Create custom agents with guided requirements)');
    console.log('  - /ship (Build and deploy features)');
    console.log('  - /fix (Emergency bug fixes)');
    console.log('  - /cleanup (Technical debt and refactoring)');
    console.log('  - /initialize-documentation (Generate codebase documentation)');
    console.log('  - /update-docs (Update docs after code changes)');
    console.log('  - /audit (Analyze audit logs)');
    console.log('  - /repo-status (Repository status report)');
    console.log('  - /add-tests (Add test coverage)');
    console.log('  - /test (Batch test and fix workflows)');
    console.log('  - /all_tools (List all available tools)\n');

    console.log(chalk.yellow('Hooks:'));
    console.log('  - audit_logger.cjs (Audit logging for tool usage)');
    console.log('  - session_manager.cjs (Session persistence)');
    console.log('  - diagnose.cjs (Diagnostic tools)');
    console.log('  - log_analyzer.cjs (Log analysis)');
    console.log('  - session_start.cjs (Session initialization)');
    console.log('  - test_hooks.cjs (Hook testing utilities)\n');

    console.log(chalk.yellow('Skills (auto-activated by context):'));
    console.log('  - supabase-patterns (RLS, migrations, Edge Functions)');
    console.log('  - nextjs-app-router (Server/Client Components, routing)');
    console.log('  - shadcn-components (UI components, forms, theming)');
    console.log('  - tanstack-query (Data fetching, caching, mutations)');
    console.log('  - testing-patterns (Jest, RTL, Playwright)\n');
  });

// Parse command line arguments
program.parse();
