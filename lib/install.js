import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import {
  ensureDir,
  copyFile,
  listFiles,
  getGlobalClaudeDir,
  getProjectClaudeDir,
  createClaudeStructure
} from './file-operations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Install agents, commands, and hooks to Claude Code directory
 * @param {Object} options - Installation options
 * @param {boolean} options.global - Install globally to ~/.claude/
 * @param {boolean} options.project - Install to project ./.claude/
 * @param {string} options.agents - Comma-separated list of agent names
 * @param {string} options.commands - Comma-separated list of command names
 * @param {string} options.hooks - Comma-separated list of hook names
 */
export async function install(options = {}) {
  const spinner = ora();

  try {
    // Determine installation directory
    const targetDir = options.project
      ? getProjectClaudeDir()
      : getGlobalClaudeDir();

    console.log(chalk.blue.bold('\nClaude Agent Kit - Installation\n'));
    console.log(chalk.gray(`Target directory: ${targetDir}\n`));

    // Create directory structure
    spinner.start('Creating directory structure...');
    await createClaudeStructure(targetDir);
    spinner.succeed('Directory structure created');

    // Get template directory
    const templateDir = path.join(__dirname, '../templates');

    // Determine what to install
    const installAgents = options.agents
      ? options.agents.split(',').map(s => s.trim() + '.md')
      : await listFiles(path.join(templateDir, 'agents'), '.md');

    const installCommands = options.commands
      ? options.commands.split(',').map(s => s.trim() + '.md')
      : await listFiles(path.join(templateDir, 'commands'), '.md');

    const installHooks = options.hooks
      ? options.hooks.split(',').map(s => s.trim() + '.js')
      : await listFiles(path.join(templateDir, 'hooks'), '.js');

    // Install agents
    if (installAgents.length > 0) {
      spinner.start('Installing agents...');
      for (const agent of installAgents) {
        const src = path.join(templateDir, 'agents', agent);
        const dest = path.join(targetDir, 'agents', agent);
        await copyFile(src, dest);
      }
      spinner.succeed(`Installed ${installAgents.length} agent(s)`);
    }

    // Install commands
    if (installCommands.length > 0) {
      spinner.start('Installing commands...');
      for (const command of installCommands) {
        const src = path.join(templateDir, 'commands', command);
        const dest = path.join(targetDir, 'commands', command);
        await copyFile(src, dest);
      }
      spinner.succeed(`Installed ${installCommands.length} command(s)`);
    }

    // Install hooks
    if (installHooks.length > 0) {
      spinner.start('Installing hooks...');
      for (const hook of installHooks) {
        const src = path.join(templateDir, 'hooks', hook);
        const dest = path.join(targetDir, 'hooks', hook);
        await copyFile(src, dest);
      }
      spinner.succeed(`Installed ${installHooks.length} hook(s)`);
    }

    // Success message
    console.log(chalk.green.bold('\n\u2713 Installation complete!\n'));
    console.log(chalk.gray('Installed to:'), chalk.white(targetDir));
    console.log(chalk.gray('\nAgents:'), chalk.white(installAgents.length));
    console.log(chalk.gray('Commands:'), chalk.white(installCommands.length));
    console.log(chalk.gray('Hooks:'), chalk.white(installHooks.length));
    console.log(chalk.blue('\nRestart Claude Code to use the new agents and commands.\n'));

  } catch (error) {
    spinner.fail('Installation failed');
    throw error;
  }
}
