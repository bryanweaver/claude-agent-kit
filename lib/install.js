import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import {
  copyFile,
  copyDir,
  listFiles,
  listDirs,
  getGlobalClaudeDir,
  getProjectClaudeDir,
  createClaudeStructure,
  templateDir
} from './file-operations.js';

/**
 * Validate asset name to prevent path traversal attacks
 * @param {string} name - Asset name to validate
 * @param {string} type - Type of asset (agent, command, hook)
 * @returns {string} Validated name
 * @throws {Error} If name contains invalid characters or path traversal sequences
 */
function validateAssetName(name, type) {
  // Only allow alphanumeric, dash, underscore
  const validPattern = /^[a-zA-Z0-9_-]+$/;

  if (!validPattern.test(name)) {
    throw new Error(`Invalid ${type} name: "${name}". Only alphanumeric, dash, and underscore allowed.`);
  }

  // Prevent path traversal
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new Error(`Invalid ${type} name: "${name}". Path traversal detected.`);
  }

  return name;
}

/**
 * Install agents, commands, hooks, and skills to Claude Code directory
 * @param {Object} options - Installation options
 * @param {boolean} options.global - Install globally to ~/.claude/
 * @param {boolean} options.project - Install to project ./.claude/
 * @param {string} options.agents - Comma-separated list of agent names
 * @param {string} options.commands - Comma-separated list of command names
 * @param {string} options.hooks - Comma-separated list of hook names
 * @param {string} options.skills - Comma-separated list of skill names
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

    // Determine what to install (with validation)
    const installAgents = options.agents
      ? options.agents.split(',').map(s => validateAssetName(s.trim(), 'agent') + '.md')
      : await listFiles(path.join(templateDir, 'agents'), '.md');

    const installCommands = options.commands
      ? options.commands.split(',').map(s => validateAssetName(s.trim(), 'command') + '.md')
      : await listFiles(path.join(templateDir, 'commands'), '.md');

    const installHooks = options.hooks
      ? options.hooks.split(',').map(s => validateAssetName(s.trim(), 'hook') + '.cjs')
      : await listFiles(path.join(templateDir, 'hooks'), '.cjs');

    const installSkills = options.skills
      ? options.skills.split(',').map(s => validateAssetName(s.trim(), 'skill'))
      : await listDirs(path.join(templateDir, 'skills'));

    // Install all asset types
    const assetGroups = [
      { items: installAgents, type: 'agent', subdir: 'agents', copyFn: copyFile },
      { items: installCommands, type: 'command', subdir: 'commands', copyFn: copyFile },
      { items: installHooks, type: 'hook', subdir: 'hooks', copyFn: copyFile },
      { items: installSkills, type: 'skill', subdir: 'skills', copyFn: copyDir },
    ];

    for (const { items, type, subdir, copyFn } of assetGroups) {
      if (items.length > 0) {
        spinner.start(`Installing ${subdir}...`);
        for (const item of items) {
          const src = path.join(templateDir, subdir, item);
          const dest = path.join(targetDir, subdir, item);
          await copyFn(src, dest);
        }
        spinner.succeed(`Installed ${items.length} ${type}(s)`);
      }
    }

    // Success message
    console.log(chalk.green.bold('\n\u2713 Installation complete!\n'));
    console.log(chalk.gray('Installed to:'), chalk.white(targetDir));
    console.log(chalk.gray('\nAgents:'), chalk.white(installAgents.length));
    console.log(chalk.gray('Commands:'), chalk.white(installCommands.length));
    console.log(chalk.gray('Hooks:'), chalk.white(installHooks.length));
    console.log(chalk.gray('Skills:'), chalk.white(installSkills.length));
    console.log(chalk.blue('\nRestart Claude Code to use the new agents, commands, and skills.\n'));

  } catch (error) {
    spinner.fail('Installation failed');
    throw error;
  }
}
