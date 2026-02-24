# Developer Guide - Claude Agent Kit

Quick reference for developers working on or with the Claude Agent Kit package.

## Local Development Setup

```bash
# Clone the repository
git clone https://github.com/bryanweaver/claude-agent-kit.git
cd claude-agent-kit

# Install dependencies
npm install

# Link for local testing
npm link

# Test the CLI
claude-agent-kit --version
claude-agent-kit list
claude-agent-kit init
```

## Project Structure

```
claude-agent-kit/
├── .claude-plugin/
│   ├── plugin.json             # Claude Code plugin manifest
│   └── marketplace.json        # Marketplace distribution manifest (v1.2+)
├── bin/
│   └── cli.js                  # CLI entry point (executable)
├── lib/
│   ├── init.js                 # Init command (stack detection + generation)
│   ├── detect-claude-code.js   # Claude Code detection
│   ├── detect-stack.js         # Tech stack detection
│   ├── generate-agents.js      # Agent generation from templates
│   ├── stacks/
│   │   └── index.js            # Stack template definitions
│   ├── install.js              # Legacy selective install
│   └── file-operations.js      # File utilities
├── templates/
│   ├── agents/                 # Tech-agnostic agents only (5 files)
│   │                           # NOTE: developer + database are now GENERATED
│   ├── commands/               # 11 command definitions
│   ├── hooks/                  # 6 hook implementations
│   └── skills/                 # 5 skill directories
├── docs/                       # Documentation
│   ├── architecture/           # System design docs
│   ├── guides/                 # How-to guides
│   └── reference/              # API/CLI reference
├── test/                       # Test files
├── package.json                # Package configuration
├── README.md                   # Main README
├── CHANGELOG.md                # Version history
├── CONTRIBUTING.md             # Contribution guidelines
├── DEVELOPER_GUIDE.md          # This file
├── LICENSE                     # MIT License
└── .npmignore                  # Package exclusions
```

## Major Changes in v2.0

### 1. Init Command (Primary Installation Method)

The `init` command replaces `install` as the primary installation method:

- Auto-detects project tech stack
- Generates stack-specific developer and database agents
- Interactive stack selection for empty/unknown projects
- Claude Code prerequisite checking

### 2. Generated Agents (Not Static Files)

**Before (v1.x)**:
- `templates/agents/full-stack-developer.md` (Next.js only)
- `templates/agents/database-admin.md` (Supabase only)

**Now (v2.x)**:
- Stack templates in `lib/stacks/index.js`
- `generateDeveloperAgent(stackId)` creates customized agents
- `generateDatabaseAgent(stackId)` creates customized agents
- Supports multiple stacks: Next.js, React+Express, Django, FastAPI, Vue+Express, Generic

### 3. Stack Detection

New detection system scans project for:
- `package.json` (JavaScript/TypeScript)
- `requirements.txt`, `pyproject.toml` (Python)
- `go.mod` (Go)
- `Gemfile` (Ruby)
- `Cargo.toml` (Rust)

Maps detected technologies to stack templates.

### 4. Role Field in Agent Frontmatter

Agents now include a `role` field:

```yaml
---
name: developer
role: developer    # NEW
description: ...
---
```

Standard roles: developer, database, shipper, reviewer, documentor, meta

## Adding New Content

### Add a New Stack

See detailed guide: [docs/guides/adding-new-stacks.md](./docs/guides/adding-new-stacks.md)

**Quick overview**:

1. Add stack template to `lib/stacks/index.js`
2. Add detection rules to `lib/detect-stack.js`
3. Test with `claude-agent-kit init` in a project with that stack

**Example**:

```javascript
// lib/stacks/index.js
'laravel-mysql': {
  id: 'laravel-mysql',
  name: 'Laravel + MySQL',
  description: 'Full-stack PHP with Laravel and MySQL',
  developer: { /* content spec */ },
  database: { /* content spec */ }
}
```

### Add a New Tech-Agnostic Agent

**Note**: Developer and database agents are now GENERATED, not static templates.

For tech-agnostic agents (like shipper, reviewer):

1. Create agent definition in `templates/agents/new-agent.md`
2. Include `role` field in frontmatter
3. Test: `claude-agent-kit init`

No changes to `lib/init.js` are needed — it now auto-discovers all files in `templates/agents/` that are not generated stack agents.

### Add a New Command

1. Create command definition in `templates/commands/new-command.md`
2. Test: `claude-agent-kit init` (commands are auto-copied)

### Add a New Hook

1. Create hook script in `templates/hooks/new_hook.cjs`
2. Test: `claude-agent-kit init` (hooks are auto-copied)

## Testing Changes

### Test Stack Detection

```bash
# In a test project with a specific stack
cd /path/to/nextjs-project
claude-agent-kit init

# Should detect Next.js + Supabase (if applicable)
# And generate appropriate agents
```

### Test Agent Generation

```bash
# Test generation logic directly
node -e "
import { generateStackAgents } from './lib/generate-agents.js';
const agents = generateStackAgents('nextjs-supabase');
console.log(Object.keys(agents));
console.log(agents['developer.md'].substring(0, 200));
"
```

### Test Init Command

```bash
# After making changes
npm link

# Test in different project types
cd /tmp/nextjs-project
claude-agent-kit init

cd /tmp/django-project
claude-agent-kit init

cd /tmp/empty-project
claude-agent-kit init
# Should show interactive stack selection

# Verify generated files
ls -la .claude/agents/
cat .claude/agents/developer.md
cat .claude/agents/database.md
```

### Test Package Build

```bash
# Dry-run pack (doesn't create file)
npm pack --dry-run

# Actual pack (creates tarball)
npm pack

# Extract and inspect
tar -xzf bryanofearth-claude-agent-kit-2.0.0.tgz
cd package/
ls -la lib/stacks/
```

### Test Selective Installation (Legacy)

```bash
# Test legacy install command
claude-agent-kit install --agents=shipper,reviewer
claude-agent-kit install --commands=ship,fix
claude-agent-kit install --hooks=audit_logger
```

## Extending the CLI

### Add a New Command

Edit `bin/cli.js`. Use the `withDefaults()` wrapper to handle the standard project/global scope defaulting and error handling automatically:

```javascript
program
  .command('new-command')
  .description('Description of the new command')
  .option('-o, --option', 'Command option')
  .option('-g, --global', 'Install to global ~/.claude/ directory')
  .option('-p, --project', 'Install to project ./.claude/ directory (default)')
  .action(withDefaults(newCommandFunction));
```

The `withDefaults()` wrapper (defined in `bin/cli.js`) sets `options.project = true` when `--global` is not specified and wraps the call in a try/catch that exits with code 1 on error.

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
  ensureDir,            // Create directory if it doesn't exist
  copyFile,             // Copy file with error handling (validates src in templates/, dest in .claude/)
  copyDir,              // Copy directory with the same security validation
  listFiles,            // List files in directory
  listDirs,             // List subdirectories
  fileExists,           // Check if file exists
  getHomeDir,           // Get user home directory
  getGlobalClaudeDir,   // Get ~/.claude/ path
  getProjectClaudeDir,  // Get ./.claude/ path
  createClaudeStructure,// Create agents/commands/hooks dirs
  templateDir           // Absolute path to templates/ directory (re-exported constant)
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
- [ ] CHANGELOG.md updated with new version entry
- [ ] README.md reflects any new features or distribution methods
- [ ] `.claude-plugin/marketplace.json` version updated if plugin content changed
- [ ] No sensitive files in package (check with `npm pack --dry-run`)
- [ ] npm audit shows no vulnerabilities

### Publish to npm

```bash
# Login to npm (first time only)
npm login

# Publish (public package)
npm publish --access public

# Verify published
npm view @bryanofearth/claude-agent-kit
```

### Version Bumping

```bash
# Patch version (1.0.3 -> 1.0.4)
npm version patch

# Minor version (1.0.3 -> 1.1.0)
npm version minor

# Major version (1.0.3 -> 2.0.0)
npm version major

# This updates package.json and creates a git tag
# Then publish
npm publish --access public
```

### Updating the Marketplace Manifest

When releasing a new version that changes plugin content (agents, skills, hooks), update the version field in `.claude-plugin/marketplace.json` and `.claude-plugin/plugin.json`:

```json
{
  "plugins": [
    {
      "name": "team",
      "version": "1.2.0"
    }
  ],
  "metadata": {
    "version": "1.2.0"
  }
}
```

The marketplace manifest and plugin manifest versions are independent from the npm package version — increment them when the plugin content changes meaningfully.

## Common Development Tasks

### Update Tech-Agnostic Agents

```bash
# NOTE: developer.md and database.md are now GENERATED, not in templates/

# Update a tech-agnostic agent (any file in templates/agents/ is auto-installed)
cp .claude/agents/shipper.md templates/agents/

# Test (all .md files in templates/agents/ are installed automatically)
claude-agent-kit init
```

### Update Stack Templates

```bash
# Edit stack templates directly in code
vim lib/stacks/index.js

# Test generation
node -e "
import { generateStackAgents } from './lib/generate-agents.js';
console.log(generateStackAgents('nextjs-supabase')['developer.md']);
"

# Test with init
cd /path/to/test-project
claude-agent-kit init
```

### Update Commands, Hooks, Skills

```bash
# Copy updated files from .claude to templates
cp .claude/commands/*.md templates/commands/
cp .claude/hooks/*.cjs templates/hooks/
cp -r .claude/skills/* templates/skills/

# Test
claude-agent-kit init
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
| @inquirer/prompts | Interactive prompts | lib/init.js (stack selection) |
| ora | Spinners | lib/init.js, lib/install.js |
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
npm unlink -g @bryanofearth/claude-agent-kit
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
chmod +x templates/hooks/*.cjs
```

## Future Enhancement Ideas

Potential features for future versions:

1. **Conflict Detection**
   - Hash comparison for files
   - File diffing to show changes
   - Interactive conflict resolution

2. **Backup System**
   - Timestamped backups before overwriting
   - Restore functionality
   - Backup listing and management

3. **Dry-run Mode**
   - Preview changes before applying
   - Show what would be installed
   - No actual file operations

4. **Update Command**
   - Check for newer versions
   - Selective update of assets
   - Version comparison

## Resources

- Commander.js docs: https://github.com/tj/commander.js
- Inquirer.js docs: https://github.com/SBoudrias/Inquirer.js
- Chalk docs: https://github.com/chalk/chalk
- Ora docs: https://github.com/sindresorhus/ora
- fs-extra docs: https://github.com/jprichardson/node-fs-extra

---

For questions or issues, open a GitHub issue or submit a PR.
