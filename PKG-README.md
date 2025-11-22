# Claude Agent Kit

A CLI tool and npm package that distributes curated Claude Code agents, slash commands, and hooks to enhance developer productivity with AI-assisted development workflows.

## Quick Start

```bash
# Install globally (to ~/.claude/)
npx @bryanweaver/claude-agent-kit install

# Install to current project (to ./.claude/)
npx @bryanweaver/claude-agent-kit install --project

# List available assets
npx @bryanweaver/claude-agent-kit list
```

## What's Included

### Agents (6)

Professional-grade Claude Code agents for specific development tasks:

- **shipper** - Git operations, testing, building, and deployment pipeline
- **reviewer** - Pragmatic code review focusing on security and bugs
- **meta-agent** - Generates new custom agents from descriptions
- **meta-commands-agent** - Creates perfect slash commands
- **database-admin** - AWS Amplify backend specialist
- **full-stack-developer** - Vue.js frontend development expert

### Commands (8)

Powerful slash commands for common workflows:

- **/ship** - Build and deploy features from start to production
- **/fix** - Emergency bug fixes and rapid issue resolution
- **/cleanup** - Technical debt and refactoring
- **/audit** - Analyze and view audit logs
- **/repo-status** - Comprehensive repository status report
- **/add-tests** - Add critical test coverage
- **/test** - Batch test and fix workflows
- **/all_tools** - List all available tools

### Hooks (6)

Event-driven automation and logging:

- **audit_logger.js** - Audit logging for all tool usage
- **session_manager.js** - Session management and persistence
- **diagnose.js** - Diagnostic tools for troubleshooting
- **log_analyzer.js** - Log analysis utilities
- **session_start.js** - Session initialization
- **test_hooks.js** - Hook testing utilities

## Installation Options

### Global Installation (Default)

Installs to `~/.claude/` for use across all projects:

```bash
npx @bryanweaver/claude-agent-kit install --global
```

### Project Installation

Installs to `./.claude/` for project-specific setup:

```bash
npx @bryanweaver/claude-agent-kit install --project
```

### Selective Installation

Install only specific assets:

```bash
# Install specific agents
npx @bryanweaver/claude-agent-kit install --agents=shipper,reviewer

# Install specific commands
npx @bryanweaver/claude-agent-kit install --commands=ship,fix

# Install specific hooks
npx @bryanweaver/claude-agent-kit install --hooks=audit_logger
```

## Usage Examples

### Example 1: Full Global Installation

```bash
npx @bryanweaver/claude-agent-kit install --global
```

This installs all agents, commands, and hooks to `~/.claude/` for use in any project.

### Example 2: Project-Specific Setup

```bash
cd my-project
npx @bryanweaver/claude-agent-kit install --project --agents=shipper,reviewer
```

This installs only the shipper and reviewer agents to your project's `.claude/` directory.

### Example 3: Quick Workflow

```bash
# List what's available
npx @bryanweaver/claude-agent-kit list

# Install everything
npx @bryanweaver/claude-agent-kit install

# Restart Claude Code and start using /ship, /fix, etc.
```

## How It Works

1. **Installation**: The CLI copies agent definitions, command definitions, and hook scripts to your Claude Code directory
2. **Detection**: Claude Code automatically detects the new files on restart
3. **Usage**: Use agents with `Continue with [agent-name]` or commands with `/command-name`
4. **Automation**: Hooks run automatically on events (tool usage, session start, etc.)

## After Installation

1. **Restart Claude Code** to load the new agents and commands
2. **Try a command**: Type `/ship` to test the ship command
3. **Use an agent**: In your response, use "Continue with shipper" to invoke the agent
4. **Check hooks**: Look for `audit.log` files being created as you work

## Requirements

- **Node.js**: >= 18.0.0
- **Claude Code**: Latest version recommended
- **Operating System**: Windows, macOS, Linux

## Directory Structure After Installation

```
~/.claude/                    # Global installation
├── agents/
│   ├── shipper.md
│   ├── reviewer.md
│   ├── meta-agent.md
│   ├── meta-commands-agent.md
│   ├── database-admin.md
│   └── full-stack-developer.md
├── commands/
│   ├── ship.md
│   ├── fix.md
│   ├── cleanup.md
│   ├── audit.md
│   ├── repo-status.md
│   ├── add-tests.md
│   ├── test.md
│   └── all_tools.md
└── hooks/
    ├── audit_logger.js
    ├── session_manager.js
    ├── diagnose.js
    ├── log_analyzer.js
    ├── session_start.js
    └── test_hooks.js
```

## Security Notice

This package installs JavaScript hooks that execute on Claude Code events. All code is open source and available in this repository. Review the hook files before installation if you have security concerns.

**Hooks perform these actions:**
- Logging tool usage to audit files
- Managing session state
- Running diagnostics on errors
- No network requests or external data transmission

## Troubleshooting

### Installation fails with permission error

```bash
# Use sudo on macOS/Linux if installing globally
sudo npx @bryanweaver/claude-agent-kit install --global
```

### Files not appearing in Claude Code

1. Verify installation location: Check `~/.claude/` or `./.claude/`
2. Restart Claude Code completely
3. Check Claude Code settings for custom directory paths

### Hooks not executing

1. Verify hooks are in the correct directory
2. Check file permissions (should be executable)
3. Look for hook errors in Claude Code logs

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: https://github.com/bryanweaver/agent-orchestration-system/issues
- **Repository**: https://github.com/bryanweaver/agent-orchestration-system

## Roadmap

### Phase 2 (Coming Soon)
- Conflict detection and resolution
- Backup functionality
- Dry-run mode
- Interactive prompts

### Phase 3 (Future)
- Smart settings.json merging
- Update and uninstall commands
- Manifest tracking
- Selective installation

## Version History

### 1.0.0 (Current)
- Initial release
- Basic install functionality
- 6 agents, 8 commands, 6 hooks
- Global and project installation support

---

Made with Claude Code by Bryan Weaver
