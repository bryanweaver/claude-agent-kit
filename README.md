# Claude Agent Kit

A CLI tool that installs curated Claude Code agents, slash commands, skills, and hooks customized for your tech stack.

## Prerequisites

> **Requires Claude Code**
>
> This package installs assets for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), Anthropic's official CLI tool.
> The installed agents, commands, skills, and hooks will only work if you have Claude Code installed.
>
> ```bash
> npm install -g @anthropic-ai/claude-code
> ```
>
> [Claude Code Documentation →](https://docs.anthropic.com/en/docs/claude-code)

## Quick Start

```bash
# Initialize in your project (recommended)
npx @bryanofearth/claude-agent-kit init

# List available stacks and assets
npx @bryanofearth/claude-agent-kit list
```

The `init` command will:
1. Check that Claude Code is installed
2. Auto-detect your project's tech stack
3. Generate agents customized for your stack
4. Install commands, hooks, and skills

## Supported Tech Stacks

| Stack | Frontend | Backend | Database |
|-------|----------|---------|----------|
| **Next.js + Supabase** | Next.js 14, React 18, shadcn/ui | Next.js API Routes | Supabase (PostgreSQL) |
| **React + Express + PostgreSQL** | React 18, Vite | Express.js | PostgreSQL |
| **Python + Django + PostgreSQL** | Django Templates | Django 5.x | PostgreSQL |
| **Python + FastAPI + PostgreSQL** | React/Vue (separate) | FastAPI | PostgreSQL |
| **Vue.js + Express + MongoDB** | Vue.js 3 | Express.js | MongoDB |
| **Generic** | Any | Any | Any |

Don't see your stack? Choose "Generic" during init, or [request a new stack](https://github.com/bryanweaver/claude-agent-kit/issues).

## What Gets Installed

### Agents

**Generated for your stack:**
- **developer** - Implementation specialist customized for your framework
- **database** - Database administrator customized for your database

**Tech-agnostic (same for all stacks):**
- **shipper** - Git operations, testing, building, and deployment
- **reviewer** - Pragmatic code review focusing on security and bugs
- **documentor** - Documentation creation and maintenance
- **meta-agent** - Generates new custom agents from descriptions
- **meta-commands-agent** - Creates custom slash commands

### Commands

- **/ship** - Build and deploy features from start to production
- **/fix** - Emergency bug fixes and rapid issue resolution
- **/cleanup** - Technical debt and refactoring
- **/test** - Batch test and fix workflows
- **/add-tests** - Add critical test coverage
- **/create-agent** - Create new custom agents
- **/initialize-documentation** - Set up documentation structure
- **/update-docs** - Update documentation after changes
- **/repo-status** - Comprehensive repository status report
- **/audit** - Analyze and view audit logs

### Skills

Code pattern libraries that auto-activate based on context:
- **supabase-patterns** - RLS policies, migrations, Edge Functions
- **nextjs-app-router** - Server/Client Components, routing, API routes
- **shadcn-components** - CVA variants, forms, Radix UI
- **tanstack-query** - Data fetching, mutations, caching
- **testing-patterns** - Jest, React Testing Library, Playwright

### Hooks

Event-driven automation and logging:
- **audit_logger.cjs** - Audit logging for tool usage
- **session_manager.cjs** - Session management
- **diagnose.cjs** - Diagnostic tools
- **log_analyzer.cjs** - Log analysis
- **session_start.cjs** - Session initialization
- **test_hooks.cjs** - Hook testing utilities

## Installation Options

### Project Installation (Default)

Installs to `./.claude/` for project-specific setup:

```bash
npx @bryanofearth/claude-agent-kit init
```

### Global Installation

Installs to `~/.claude/` for use across all projects:

```bash
npx @bryanofearth/claude-agent-kit init --global
```

### Selective Installation (Advanced)

Install only specific assets without stack detection:

```bash
# Install specific agents
npx @bryanofearth/claude-agent-kit install --agents=shipper,reviewer

# Install specific commands
npx @bryanofearth/claude-agent-kit install --commands=ship,fix

# Install specific hooks
npx @bryanofearth/claude-agent-kit install --hooks=audit_logger
```

## After Installation

1. **Restart Claude Code** to load the new agents and commands
2. **Try a command**: Type `/ship add user authentication` to build a feature
3. **Use an agent**: Reference "developer" or "shipper" in your conversation

## How It Works

1. **Detection**: The CLI scans your project for package.json, requirements.txt, go.mod, etc.
2. **Generation**: Developer and database agents are generated with stack-specific instructions
3. **Installation**: All files are copied to `./.claude/` (or `~/.claude/` with `--global`)
4. **Usage**: Claude Code detects the files on restart and makes them available

## Directory Structure After Installation

```
./.claude/                    # Project installation (default)
├── agents/
│   ├── developer.md          # Generated for your stack
│   ├── database.md           # Generated for your stack
│   ├── shipper.md
│   ├── reviewer.md
│   ├── documentor.md
│   ├── meta-agent.md
│   └── meta-commands-agent.md
├── commands/
│   ├── ship.md
│   ├── fix.md
│   ├── cleanup.md
│   └── ...
├── skills/
│   ├── supabase-patterns/
│   ├── nextjs-app-router/
│   └── ...
└── hooks/
    ├── audit_logger.cjs
    └── ...
```

## Requirements

- **Node.js**: >= 18.0.0
- **Claude Code**: Must be installed
- **Operating System**: Windows, macOS, Linux

## Security Notice

This package installs JavaScript hooks that execute on Claude Code events. All code is open source and available in this repository.

**Safety features in agents:**
- Database agent requires explicit approval for destructive operations
- Never resets database without user confirmation
- Never pushes to remote/production without user approval

## Troubleshooting

### Claude Code not detected

```bash
# Install Claude Code first
npm install -g @anthropic-ai/claude-code

# Then run init again
npx @bryanofearth/claude-agent-kit init
```

### Files not appearing in Claude Code

1. Verify installation location: Check `./.claude/` or `~/.claude/`
2. Restart Claude Code completely
3. Check Claude Code settings for custom directory paths

### Re-running init for a different stack

Just run `init` again - it will overwrite existing generated agents:

```bash
npx @bryanofearth/claude-agent-kit init
```

## Contributing

Contributions welcome! Especially:
- New stack templates
- Improved agent instructions
- New commands and skills

See [CONTRIBUTING.md](https://github.com/bryanweaver/claude-agent-kit/blob/main/CONTRIBUTING.md).

## License

MIT License - see LICENSE file.

## Support

- **Issues**: https://github.com/bryanweaver/claude-agent-kit/issues
- **Repository**: https://github.com/bryanweaver/claude-agent-kit

---

Made with Claude Code
