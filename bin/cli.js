#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { install } from '../lib/install.js';
import { init } from '../lib/init.js';
import { getStackChoices } from '../lib/stacks/index.js';
import { listFiles, listDirs, templateDir } from '../lib/file-operations.js';
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

/**
 * Wrap a command action with default project scope and error handling
 * @param {Function} fn - Async action function receiving options
 * @returns {Function} Wrapped action function
 */
function withDefaults(fn) {
  return async (options) => {
    try {
      if (!options.global) {
        options.project = true;
      }
      await fn(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  };
}

program
  .name('claude-agent-kit')
  .description('Install and manage Claude Code agents, hooks, and skills')
  .version(packageJson.version);

// Init command (recommended for new users)
program
  .command('init')
  .description('Initialize Claude Agent Kit with auto-detected or selected tech stack')
  .option('-g, --global', 'Install to global ~/.claude/ directory')
  .option('-p, --project', 'Install to project ./.claude/ directory (default)')
  .option('-y, --yes', 'Skip confirmations and use detected/default stack')
  .action(withDefaults(init));

// Install command (advanced: selective installation)
program
  .command('install')
  .description('Install specific agents, hooks, and skills (advanced)')
  .option('-g, --global', 'Install to global ~/.claude/ directory')
  .option('-p, --project', 'Install to project ./.claude/ directory (default)')
  .option('--agents <names>', 'Install specific agents (comma-separated)')
  .option('--hooks <names>', 'Install specific hooks (comma-separated)')
  .option('--skills <names>', 'Install specific skills (comma-separated)')
  .action(withDefaults(install));

// List command
program
  .command('list')
  .description('List available stacks, agents, commands, and hooks')
  .action(async () => {
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
    const agents = await listFiles(join(templateDir, 'agents'), '.md');
    agents.forEach(f => {
      console.log(`    - ${f.replace('.md', '')}`);
    });
    console.log();

    console.log(chalk.yellow('Hooks:'));
    const hooks = await listFiles(join(templateDir, 'hooks'), '.cjs');
    hooks.forEach(f => {
      console.log(`  - ${f}`);
    });
    console.log();

    console.log(chalk.yellow('Skills (workflow + tech-stack):'));
    const skills = await listDirs(join(templateDir, 'skills'));
    skills.forEach(s => {
      console.log(`  - ${s}`);
    });
    console.log();

    console.log(chalk.blue('Quick Start:'));
    console.log(chalk.gray('  npx claude-agent-kit init\n'));
  });

// Parse command line arguments
program.parse();
