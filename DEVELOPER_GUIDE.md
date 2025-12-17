# Developer Guide - Claude Agent Kit

Quick reference for developers working on or with the Claude Agent Kit package.

## Local Development Setup

```bash
# Clone the repository
git clone https://github.com/bryanweaver/agent-orchestration-system.git
cd agent-orchestration-system

# Install dependencies
npm install

# Link for local testing
npm link

# Test the CLI
claude-agent-kit --version
claude-agent-kit list
claude-agent-kit install --project
```

## Project Structure

```
agent-orchestration-system/
├── bin/
│   └── cli.js              # CLI entry point (executable)
├── lib/
│   ├── install.js          # Installation logic
│   └── file-operations.js  # File utilities
├── templates/
│   ├── agents/             # 6 agent definitions
│   ├── commands/           # 8 command definitions
│   └── hooks/              # 6 hook implementations
├── package.json            # Package configuration
├── PKG-README.md           # Package documentation
├── LICENSE                 # MIT License
└── .npmignore              # Package exclusions
```

## Adding New Templates

### Add a New Agent

1. Create agent definition in `.claude/agents/new-agent.md`
2. Copy to templates: `cp .claude/agents/new-agent.md templates/agents/`
3. Update bin/cli.js list command to include the new agent
4. Test: `claude-agent-kit install --agents=new-agent`

### Add a New Command

1. Create command definition in `.claude/commands/new-command.md`
2. Copy to templates: `cp .claude/commands/new-command.md templates/commands/`
3. Update bin/cli.js list command to include the new command
4. Test: `claude-agent-kit install --commands=new-command`

### Add a New Hook

1. Create hook script in `.claude/hooks/new_hook.js`
2. Copy to templates: `cp .claude/hooks/new_hook.js templates/hooks/`
3. Update bin/cli.js list command to include the new hook
4. Test: `claude-agent-kit install --hooks=new_hook`

## Testing Changes

### Test Locally with npm link

```bash
# After making changes
npm link

# Test in a temporary directory
cd /tmp/test-project
claude-agent-kit install --project

# Verify files were installed
ls -la .claude/agents/ .claude/commands/ .claude/hooks/
```

### Test Package Build

```bash
# Dry-run pack (doesn't create file)
npm pack --dry-run

# Actual pack (creates tarball)
npm pack

# Extract and inspect
tar -xzf bryanweaver-claude-agent-kit-1.0.0.tgz
cd package/
ls -la
```

### Test Selective Installation

```bash
# Test specific agents
claude-agent-kit install --project --agents=shipper,reviewer

# Test specific commands
claude-agent-kit install --project --commands=ship,fix

# Test specific hooks
claude-agent-kit install --project --hooks=audit_logger
```

## Extending the CLI

### Add a New Command

Edit `bin/cli.js`:

```javascript
program
  .command('new-command')
  .description('Description of the new command')
  .option('-o, --option', 'Command option')
  .action(async (options) => {
    try {
      await newCommandFunction(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });
```

Create implementation in `lib/`:

```javascript
// lib/new-command.js
import chalk from 'chalk';
import ora from 'ora';

export async function newCommandFunction(options) {
  const spinner = ora('Processing...').start();

  try {
    // Implementation here
    spinner.succeed('Success!');
  } catch (error) {
    spinner.fail('Failed');
    throw error;
  }
}
```

### Add a New Option to Install

Edit `bin/cli.js`:

```javascript
program
  .command('install')
  .option('--new-option', 'Description of new option')
  .action(async (options) => {
    await install(options);
  });
```

Handle in `lib/install.js`:

```javascript
export async function install(options = {}) {
  if (options.newOption) {
    // Handle new option
  }
  // ... rest of install logic
}
```

## File Operation Utilities

Available utilities in `lib/file-operations.js`:

```javascript
import {
  ensureDir,           // Create directory if it doesn't exist
  copyFile,            // Copy file with error handling
  listFiles,           // List files in directory
  fileExists,          // Check if file exists
  getHomeDir,          // Get user home directory
  getGlobalClaudeDir,  // Get ~/.claude/ path
  getProjectClaudeDir, // Get ./.claude/ path
  createClaudeStructure // Create agents/commands/hooks dirs
} from './lib/file-operations.js';

// Example usage
await ensureDir('/path/to/dir');
await copyFile('/src/file.txt', '/dest/file.txt');
const files = await listFiles('/path', '.md');
const exists = await fileExists('/path/file.txt');
```

## Publishing Workflow

### Pre-publish Checklist

- [ ] All tests pass
- [ ] Version number updated in package.json
- [ ] PKG-README.md updated with changes
- [ ] CHANGELOG.md created/updated (for v1.1+)
- [ ] No sensitive files in package (check with `npm pack --dry-run`)
- [ ] npm audit shows no vulnerabilities

### Publish to npm

```bash
# Login to npm (first time only)
npm login

# Publish (public package)
npm publish --access public

# Verify published
npm view @bryanweaver/claude-agent-kit
```

### Version Bumping

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major

# Then publish
npm publish --access public
```

## Common Development Tasks

### Update All Templates

```bash
# Copy all updated files
cp .claude/agents/*.md templates/agents/
cp .claude/commands/*.md templates/commands/
cp .claude/hooks/*.js templates/hooks/

# Test installation
claude-agent-kit install --project
```

### Test Error Handling

```bash
# Test with invalid agent name
claude-agent-kit install --agents=nonexistent

# Test with permission issues (Unix/Linux)
chmod 000 templates/agents/shipper.md
claude-agent-kit install --agents=shipper
chmod 644 templates/agents/shipper.md
```

### Debug Installation

Add debug logging to `lib/install.js`:

```javascript
console.log(chalk.gray('Debug:'), 'Installing to:', targetDir);
console.log(chalk.gray('Debug:'), 'Template dir:', templateDir);
console.log(chalk.gray('Debug:'), 'Files to install:', installAgents);
```

## Dependencies Overview

| Package | Purpose | Used In |
|---------|---------|---------|
| chalk | Terminal colors | All output |
| commander | CLI framework | bin/cli.js |
| inquirer | Interactive prompts | Phase 2+ |
| ora | Spinners | lib/install.js |
| diff | File comparison | Phase 2+ |
| fs-extra | Enhanced file ops | lib/file-operations.js |

## Code Style Guidelines

- Use ES modules (import/export)
- Use async/await for file operations
- Always use chalk for colored output
- Use ora spinners for operations > 1 second
- Handle errors with try/catch and clear messages
- Add JSDoc comments for public functions
- Use descriptive variable names

## Troubleshooting

### "Command not found" after npm link

```bash
# Re-link the package
npm unlink -g @bryanweaver/claude-agent-kit
npm link

# Or check npm global bin path
npm config get prefix
```

### "Module not found" errors

```bash
# Ensure all imports have .js extension
import { install } from './lib/install.js';  // Correct
import { install } from './lib/install';     // Wrong in ESM

# Verify package.json has "type": "module"
```

### File permissions issues

```bash
# Make CLI executable
chmod +x bin/cli.js

# Make hooks executable (if needed)
chmod +x templates/hooks/*.js
```

## Next Steps for Phase 2

Priority features to implement:

1. **Conflict Detection** (lib/conflict-resolver.js)
   - Hash comparison
   - File diffing
   - Conflict categorization

2. **Backup System** (lib/backup.js)
   - Timestamped backups
   - Restore functionality
   - Backup listing

3. **Dry-run Mode**
   - Preview changes
   - No actual file operations
   - Show what would be installed

4. **Interactive Prompts** (lib/prompts.js)
   - Conflict resolution UI
   - Asset selection
   - Confirmation dialogs

## Resources

- Commander.js docs: https://github.com/tj/commander.js
- Inquirer.js docs: https://github.com/SBoudrias/Inquirer.js
- Chalk docs: https://github.com/chalk/chalk
- Ora docs: https://github.com/sindresorhus/ora
- fs-extra docs: https://github.com/jprichardson/node-fs-extra

---

For questions or issues, open a GitHub issue or submit a PR.
