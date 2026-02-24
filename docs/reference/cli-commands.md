# CLI Commands Reference

Complete reference for the Claude Agent Kit npm CLI.

> **Note**: As of v1.2.0, Claude Agent Kit also supports installation via the Claude Code plugin marketplace. The CLI commands documented here apply to the npm distribution method only. See [Getting Started](../guides/getting-started.md) for both installation methods.

## Installation

```bash
# Run without installing (npm CLI)
npx @bryanofearth/claude-agent-kit <command>

# Or install globally
npm install -g @bryanofearth/claude-agent-kit
claude-agent-kit <command>

# Plugin marketplace (alternative distribution method)
# claude plugin marketplace add bryanweaver/claude-agent-kit
# claude plugin install team@claude-agent-kit
```

## Commands

### `init`

Initialize Claude Agent Kit for a project with stack-aware agent generation.

**Usage**:
```bash
npx @bryanofearth/claude-agent-kit init [options]
```

**Options**:
- `--global` - Install to `~/.claude/` instead of `./.claude/`
- `--project` - Install to `./.claude/` (default)
- `--yes, -y` - Skip all confirmation prompts (use detected stack)

**Examples**:

```bash
# Interactive init (default)
npx @bryanofearth/claude-agent-kit init

# Auto-accept detected stack
npx @bryanofearth/claude-agent-kit init --yes

# Install globally
npx @bryanofearth/claude-agent-kit init --global

# Project install with auto-accept
npx @bryanofearth/claude-agent-kit init --project --yes
```

**What it does**:

1. Checks for Claude Code installation
2. Detects your project's tech stack by scanning:
   - `package.json` (JavaScript/TypeScript)
   - `requirements.txt`, `pyproject.toml` (Python)
   - `go.mod` (Go)
   - `Gemfile` (Ruby)
   - `Cargo.toml` (Rust)
3. Maps detection to a known stack template
4. Generates `developer.md` and `database.md` agents for your stack
5. Copies tech-agnostic agents (shipper, reviewer, documentor, etc.)
6. Installs commands, hooks, and skills
7. Reports installation summary

**Interactive prompts**:

- If Claude Code is not detected, asks whether to continue anyway
- If stack is detected, asks whether to use it or select manually
- If no stack detected, shows selection menu

**Output location**:

- Default: `./.claude/` (project-local)
- With `--global`: `~/.claude/` (user home directory)

---

### `list`

List all available agents, commands, hooks, and skills.

**Usage**:
```bash
npx @bryanofearth/claude-agent-kit list
```

**Output**:

```
Available Agents:
  - shipper: Git operations, testing, building, and deployment
  - reviewer: Code review focusing on security and bugs
  - documentor: Documentation creation and maintenance
  - meta-agent: Generate new custom agents
  - meta-commands-agent: Create custom slash commands

Note: developer and database agents are generated based on your stack

Available Commands:
  - ship: Build and deploy features from start to production
  - fix: Emergency bug fixes
  - cleanup: Technical debt and refactoring
  - test: Batch test and fix workflows
  - add-tests: Add critical test coverage
  ... and more

Available Hooks:
  - audit_logger.cjs: Audit logging
  - session_manager.cjs: Session management
  - diagnose.cjs: Diagnostic tools
  ... and more

Available Skills:
  - supabase-patterns: RLS, migrations, Edge Functions
  - nextjs-app-router: Server/Client Components
  - shadcn-components: CVA variants, forms
  ... and more
```

---

### `install` (Advanced)

Selectively install specific agents, commands, or hooks without stack detection.

> **Note**: For most users, `init` is recommended. Use `install` only for advanced use cases.

**Usage**:
```bash
npx @bryanofearth/claude-agent-kit install [options]
```

**Options**:
- `--agents=<list>` - Comma-separated agent names
- `--commands=<list>` - Comma-separated command names
- `--hooks=<list>` - Comma-separated hook names
- `--global` - Install to `~/.claude/`
- `--project` - Install to `./.claude/` (default)

**Examples**:

```bash
# Install specific agents only
npx @bryanofearth/claude-agent-kit install --agents=shipper,reviewer

# Install specific commands
npx @bryanofearth/claude-agent-kit install --commands=ship,fix

# Install specific hooks
npx @bryanofearth/claude-agent-kit install --hooks=audit_logger

# Combine multiple options
npx @bryanofearth/claude-agent-kit install \
  --agents=shipper,reviewer \
  --commands=ship,fix \
  --global
```

**Limitations**:

- Does NOT generate stack-specific developer/database agents
- Does NOT detect your tech stack
- Copies files as-is from templates

**When to use**:

- Installing additional agents to an existing setup
- Custom/manual installation workflows
- Testing individual components

---

### `--version`

Show the installed version of Claude Agent Kit.

**Usage**:
```bash
npx @bryanofearth/claude-agent-kit --version
```

**Output**:
```
2.0.0
```

---

### `--help`

Show help information for the CLI.

**Usage**:
```bash
npx @bryanofearth/claude-agent-kit --help
npx @bryanofearth/claude-agent-kit <command> --help
```

---

## Common Workflows

### First-Time Setup

```bash
cd /path/to/your/project
npx @bryanofearth/claude-agent-kit init
```

### Re-initialize with Different Stack

```bash
# Just run init again
npx @bryanofearth/claude-agent-kit init
# Choose different stack when prompted
```

### Global Installation for All Projects

```bash
npx @bryanofearth/claude-agent-kit init --global
```

### Update to Latest Version

```bash
# Re-run init with latest package
npx @bryanofearth/claude-agent-kit@latest init
```

### Check What's Available

```bash
npx @bryanofearth/claude-agent-kit list
```

## Exit Codes

- `0` - Success
- `1` - Error (with error message printed)

## Environment Variables

None currently supported.

## Configuration Files

The CLI does not use configuration files. All settings are passed via command-line flags.

## Related Documents

- [Getting Started Guide](../guides/getting-started.md)
- [Supported Stacks](./supported-stacks.md)

---

Last updated: 2026-02-24
