#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { install } from '../lib/install.js';
import { init } from '../lib/init.js';
import { getStackChoices } from '../lib/stacks/index.js';
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

// Init command (recommended for new users)
program
  .command('init')
  .description('Initialize Claude Agent Kit with auto-detected or selected tech stack')
  .option('-g, --global', 'Install to global ~/.claude/ directory')
  .option('-p, --project', 'Install to project ./.claude/ directory (default)')
  .option('-y, --yes', 'Skip confirmations and use detected/default stack')
  .action(async (options) => {
    try {
      // Project is the default unless --global is specified
      if (!options.global) {
        options.project = true;
      }
      await init(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Install command (advanced: selective installation)
program
  .command('install')
  .description('Install specific agents, commands, hooks, and skills (advanced)')
  .option('-g, --global', 'Install to global ~/.claude/ directory')
  .option('-p, --project', 'Install to project ./.claude/ directory (default)')
  .option('--agents <names>', 'Install specific agents (comma-separated)')
  .option('--commands <names>', 'Install specific commands (comma-separated)')
  .option('--hooks <names>', 'Install specific hooks (comma-separated)')
  .option('--skills <names>', 'Install specific skills (comma-separated)')
  .action(async (options) => {
    try {
      // Project is the default unless --global is specified
      if (!options.global) {
        options.project = true;
      }
      await install(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('List available stacks, agents, commands, and hooks')
  .action(() => {
    console.log(chalk.blue.bold('\nClaude Agent Kit - Available Assets\n'));

    console.log(chalk.yellow('Supported Stacks:'));
    const stacks = getStackChoices();
    stacks.forEach(stack => {
      console.log(`  - ${chalk.cyan(stack.name)}`);
      console.log(`    ${chalk.gray(stack.description)}`);
    });
    console.log();

    console.log(chalk.yellow('Agents (installed via init):'));
    console.log(chalk.gray('  Generated for your stack:'));
    console.log('    - developer (Stack-specific implementation specialist)');
    console.log('    - database (Stack-specific database administrator)');
    console.log(chalk.gray('  Tech-agnostic (same for all stacks):'));
    console.log('    - shipper (Git operations, testing, deployment)');
    console.log('    - reviewer (Code review, security, bugs)');
    console.log('    - documentor (Documentation management)');
    console.log('    - meta-agent (Generate custom agents)');
    console.log('    - meta-commands-agent (Create slash commands)\n');

    console.log(chalk.yellow('Commands:'));
    console.log('  - /ship (Build and deploy features)');
    console.log('  - /fix (Emergency bug fixes)');
    console.log('  - /cleanup (Technical debt and refactoring)');
    console.log('  - /test (Batch test and fix workflows)');
    console.log('  - /add-tests (Add test coverage)');
    console.log('  - /create-agent (Create custom agents)');
    console.log('  - /initialize-documentation (Generate docs)');
    console.log('  - /update-docs (Update docs after changes)');
    console.log('  - /repo-status (Repository status report)');
    console.log('  - /audit (Analyze audit logs)\n');

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

    console.log(chalk.blue('Quick Start:'));
    console.log(chalk.gray('  npx claude-agent-kit init\n'));
  });

// Parse command line arguments
program.parse();
