import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { select, confirm } from '@inquirer/prompts';
import { detectClaudeCode, getInstallInstructions } from './detect-claude-code.js';
import { detectStack, describeStack } from './detect-stack.js';
import { getStackChoices, getStack } from './stacks/index.js';
import { generateStackAgents } from './generate-agents.js';
import {
  copyFile,
  copyDir,
  listFiles,
  listDirs,
  getGlobalClaudeDir,
  getProjectClaudeDir,
  createClaudeStructure,
  writeFile,
  templateDir
} from './file-operations.js';

/**
 * Initialize Claude Agent Kit for a project
 * @param {Object} options - Initialization options
 * @param {boolean} options.global - Install globally to ~/.claude/
 * @param {boolean} options.project - Install to project ./.claude/
 * @param {boolean} options.yes - Skip confirmations
 */
export async function init(options = {}) {
  const spinner = ora();

  console.log(chalk.blue.bold('\n  Claude Agent Kit - Initialize\n'));

  // Step 1: Check for Claude Code
  spinner.start('Checking for Claude Code...');
  const claudeStatus = detectClaudeCode();

  if (!claudeStatus.cliInstalled) {
    spinner.warn('Claude Code not detected');
    console.log();
    console.log(chalk.yellow('  This kit requires Claude Code to be installed.\n'));

    const instructions = getInstallInstructions();
    console.log(chalk.gray('  Install Claude Code:'));
    console.log(chalk.cyan(`    ${instructions.npm}\n`));
    console.log(chalk.gray('  Documentation:'));
    console.log(chalk.cyan(`    ${instructions.docs}\n`));

    if (!options.yes) {
      const proceed = await confirm({
        message: 'Continue installation anyway?',
        default: false
      });

      if (!proceed) {
        console.log(chalk.gray('\n  Installation cancelled.\n'));
        return;
      }
    }
    console.log();
  } else {
    spinner.succeed(`Claude Code detected ${claudeStatus.cliVersion ? `(${claudeStatus.cliVersion})` : ''}`);
  }

  // Step 2: Detect tech stack
  spinner.start('Scanning project for tech stack...');
  const projectPath = process.cwd();
  const detection = detectStack(projectPath);
  const detectedTech = describeStack(detection);

  let selectedStackId = detection.stackId;

  if (detectedTech.length > 0) {
    spinner.succeed('Tech stack detected');
    console.log();
    console.log(chalk.gray('  Detected technologies:'));
    detectedTech.forEach(tech => {
      console.log(chalk.green(`    ✓ ${tech}`));
    });

    if (detection.stackId) {
      const stack = getStack(detection.stackId);
      console.log();
      console.log(chalk.gray('  Matched stack template:'));
      console.log(chalk.cyan(`    ${stack.name}`));
      console.log(chalk.gray(`    ${stack.description}`));
    }
    console.log();

    if (!options.yes) {
      const useDetected = await confirm({
        message: detection.stackId
          ? `Use "${getStack(detection.stackId).name}" stack template?`
          : 'Use detected technologies with generic template?',
        default: true
      });

      if (!useDetected) {
        selectedStackId = await selectStack();
      }
    }
  } else {
    spinner.warn('No tech stack detected (empty or new project)');
    console.log();
    if (!options.yes) {
      selectedStackId = await selectStack();
    }
  }

  // If still no stack selected, use generic
  if (!selectedStackId) {
    selectedStackId = 'generic';
  }

  const selectedStack = getStack(selectedStackId);
  console.log();
  console.log(chalk.blue(`  Using stack: ${selectedStack.name}`));
  console.log();

  // Step 3: Determine installation directory
  const targetDir = options.project
    ? getProjectClaudeDir()
    : getGlobalClaudeDir();

  console.log(chalk.gray(`  Target directory: ${targetDir}\n`));

  // Step 4: Create directory structure
  spinner.start('Creating directory structure...');
  await createClaudeStructure(targetDir);
  spinner.succeed('Directory structure created');

  // Step 5: Generate and install stack-specific agents
  spinner.start('Generating agents for your stack...');
  const generatedAgents = generateStackAgents(selectedStackId);

  const agentsDir = path.join(targetDir, 'agents');
  for (const [filename, content] of Object.entries(generatedAgents)) {
    const filePath = path.join(agentsDir, filename);
    await writeFile(filePath, content);
  }
  spinner.succeed(`Generated ${Object.keys(generatedAgents).length} stack-specific agent(s)`);

  // Step 6: Install tech-agnostic agents (read from templates directory)
  const generatedAgentNames = new Set(Object.keys(generatedAgents).map(f => f.replace('.md', '')));
  const allAgentFiles = await listFiles(path.join(templateDir, 'agents'), '.md');
  const techAgnosticAgents = allAgentFiles.filter(f => !generatedAgentNames.has(f.replace('.md', '')));

  spinner.start('Installing tech-agnostic agents...');
  for (const agent of techAgnosticAgents) {
    const src = path.join(templateDir, 'agents', agent);
    const dest = path.join(agentsDir, agent);
    await copyFile(src, dest);
  }
  spinner.succeed(`Installed ${techAgnosticAgents.length} tech-agnostic agent(s)`);

  // Step 7-8: Install hooks and skills
  const assetGroups = [
    { label: 'hooks', subdir: 'hooks', ext: '.cjs', copyFn: copyFile },
  ];

  const installCounts = {};
  for (const { label, subdir, ext, copyFn } of assetGroups) {
    spinner.start(`Installing ${label}...`);
    const items = await listFiles(path.join(templateDir, subdir), ext);
    for (const item of items) {
      const src = path.join(templateDir, subdir, item);
      const dest = path.join(targetDir, subdir, item);
      await copyFn(src, dest);
    }
    spinner.succeed(`Installed ${items.length} ${label}`);
    installCounts[label] = items.length;
  }

  // Skills are directories, handled separately with non-fatal error handling
  try {
    const skills = await listDirs(path.join(templateDir, 'skills'));
    if (skills.length > 0) {
      spinner.start('Installing skills...');
      for (const skill of skills) {
        const src = path.join(templateDir, 'skills', skill);
        const dest = path.join(targetDir, 'skills', skill);
        await copyDir(src, dest);
      }
      spinner.succeed(`Installed ${skills.length} skill(s)`);
    }
  } catch (error) {
    spinner.warn(`Skills installation skipped: ${error.message}`);
  }

  // Success message
  console.log();
  console.log(chalk.green.bold('  ✓ Initialization complete!\n'));

  console.log(chalk.gray('  Installed to:'), chalk.white(targetDir));
  console.log();
  console.log(chalk.gray('  Agents:'));
  console.log(chalk.cyan('    • developer'), chalk.gray(`(${selectedStack.name} specialist)`));
  console.log(chalk.cyan('    • database'), chalk.gray(`(${selectedStack.name} database)`));
  techAgnosticAgents.forEach(agent => {
    const name = agent.replace('.md', '');
    console.log(chalk.cyan(`    • ${name}`), chalk.gray('(tech-agnostic)'));
  });

  console.log();
  console.log(chalk.blue('  Next steps:'));
  console.log(chalk.gray('    1. Restart Claude Code to load new agents and skills'));
  console.log(chalk.gray('    2. Try /team-ship to start building features'));
  console.log(chalk.gray('    3. Use /team-create-agent to add custom agents'));
  console.log();
}

/**
 * Show stack selection menu
 * @returns {Promise<string>} Selected stack ID
 */
async function selectStack() {
  const choices = getStackChoices();

  const stackId = await select({
    message: 'What stack will you be using?',
    choices: choices.map(stack => ({
      name: `${stack.name}`,
      value: stack.id,
      description: stack.description
    }))
  });

  return stackId;
}
