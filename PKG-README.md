# Claude Agent Kit

A CLI tool and npm package that distributes curated Claude Code agents, slash commands, skills, and hooks to enhance developer productivity with AI-assisted development workflows.

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

### Agents (7)

Professional-grade Claude Code agents for specific development tasks:

- **full-stack-developer** - Next.js 14, React 18, shadcn/ui, TanStack Query expert
- **database-admin** - Supabase specialist (RLS, migrations, Edge Functions)
- **shipper** - Git operations, testing, building, and deployment pipeline
- **reviewer** - Pragmatic code review focusing on security and bugs
- **documentor** - Documentation creation and maintenance
- **meta-agent** - Generates new custom agents from descriptions
- **meta-commands-agent** - Creates perfect slash commands

### Commands (11)

Powerful slash commands for common workflows:

- **/ship** - Build and deploy features from start to production
- **/fix** - Emergency bug fixes and rapid issue resolution
- **/cleanup** - Technical debt and refactoring
- **/audit** - Analyze and view audit logs
- **/repo-status** - Comprehensive repository status report
- **/add-tests** - Add critical test coverage
- **/test** - Batch test and fix workflows
- **/create-agent** - Create new custom agents
- **/initialize-documentation** - Set up documentation structure
- **/update-docs** - Update documentation after changes
- **/all_tools** - List all available tools

### Skills (5)

Code pattern libraries that auto-activate based on context:

- **supabase-patterns** - RLS policies, migrations, Edge Functions, TypeScript types
- **nextjs-app-router** - Server/Client Components, routing, API routes
- **shadcn-components** - CVA variants, forms, Radix UI, theming
- **tanstack-query** - Data fetching, mutations, caching, optimistic updates
- **testing-patterns** - Jest, React Testing Library, Playwright E2E

### Hooks (6)

Event-driven automation and logging:

- **audit_logger.cjs** - Audit logging for all tool usage
- **session_manager.cjs** - Session management and persistence
- **diagnose.cjs** - Diagnostic tools for troubleshooting
- **log_analyzer.cjs** - Log analysis utilities
- **session_start.cjs** - Session initialization
- **test_hooks.cjs** - Hook testing utilities

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

# Install skills
npx @bryanweaver/claude-agent-kit install --skills
```

## Usage Examples

### Example 1: Full Global Installation

```bash
npx @bryanweaver/claude-agent-kit install --global
```

This installs all agents, commands, skills, and hooks to `~/.claude/` for use in any project.

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

1. **Installation**: The CLI copies agent definitions, command definitions, skills, and hook scripts to your Claude Code directory
2. **Detection**: Claude Code automatically detects the new files on restart
3. **Usage**: Use agents with `Continue with [agent-name]` or commands with `/command-name`
4. **Skills**: Auto-activate based on context (e.g., Supabase patterns activate when working with Supabase)
5. **Automation**: Hooks run automatically on events (tool usage, session start, etc.)

## After Installation

1. **Restart Claude Code** to load the new agents and commands
2. **Try a command**: Type `/ship` to test the ship command
3. **Use an agent**: In your response, use "Continue with shipper" to invoke the agent
4. **Check hooks**: Look for `audit.log` files being created as you work

## Tech Stack

The agents and skills are optimized for:

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, RLS, Edge Functions)
- **Data**: TanStack Query, React Hook Form + Zod
- **Testing**: Jest, React Testing Library, Playwright

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
│   ├── documentor.md
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
│   ├── create-agent.md
│   ├── initialize-documentation.md
│   ├── update-docs.md
│   └── all_tools.md
├── skills/
│   ├── supabase-patterns/
│   ├── nextjs-app-router/
│   ├── shadcn-components/
│   ├── tanstack-query/
│   └── testing-patterns/
└── hooks/
    ├── audit_logger.cjs
    ├── session_manager.cjs
    ├── diagnose.cjs
    ├── log_analyzer.cjs
    ├── session_start.cjs
    └── test_hooks.cjs
```

## Security Notice

This package installs JavaScript hooks that execute on Claude Code events. All code is open source and available in this repository. Review the hook files before installation if you have security concerns.

**Hooks perform these actions:**
- Logging tool usage to audit files
- Managing session state
- Running diagnostics on errors
- No network requests or external data transmission

**Safety features in agents:**
- database-admin requires explicit approval for destructive operations
- Never resets database without user confirmation
- Never pushes to remote/production without user approval

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

Contributions are welcome! See [CONTRIBUTING.md](https://github.com/bryanweaver/agent-orchestration-system/blob/main/CONTRIBUTING.md) for guidelines.

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: https://github.com/bryanweaver/agent-orchestration-system/issues
- **Repository**: https://github.com/bryanweaver/agent-orchestration-system

## Version History

See [CHANGELOG.md](https://github.com/bryanweaver/agent-orchestration-system/blob/main/CHANGELOG.md) for detailed release notes.

---

Made with Claude Code by Bryan Weaver
