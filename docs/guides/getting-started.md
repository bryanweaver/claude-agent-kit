# Getting Started

Welcome to Claude Agent Kit! This guide covers both installation methods and gets you up and running quickly.

## Prerequisites

### Required: Claude Code

Claude Agent Kit installs assets for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), Anthropic's official CLI tool. You must have Claude Code installed.

```bash
npm install -g @anthropic-ai/claude-code
```

Verify installation:
```bash
claude --version
```

### Required for npm CLI method only: Node.js

- Node.js >= 18.0.0
- npm or npx

## Installation Methods

There are two ways to install Claude Agent Kit. Choose the one that fits your workflow.

---

### Method 1: Claude Code Marketplace (Recommended)

The marketplace method installs the plugin directly through Claude Code. No Node.js or npm required.

#### Step 1: Add the repository to the marketplace

```bash
claude plugin marketplace add bryanweaver/claude-agent-kit
```

#### Step 2: Install the team plugin

```bash
claude plugin install team@claude-agent-kit
```

#### Step 3: Start using the team

```bash
/team-ship add user authentication
/team-fix users can't log in
/team-cleanup authentication module
```

---

### Method 2: npm CLI

The npm CLI method copies templates into your project's `.claude/` directory, with automatic tech stack detection and customized agent generation.

#### 1. Navigate to Your Project

```bash
cd /path/to/your/project
```

Claude Agent Kit will detect your project's tech stack by scanning for:
- `package.json` (JavaScript/TypeScript)
- `requirements.txt`, `pyproject.toml` (Python)
- `go.mod` (Go)
- `Gemfile` (Ruby)
- `Cargo.toml` (Rust)

#### 2. Run Init Command

```bash
npx @bryanofearth/claude-agent-kit init
```

This will:
1. Check that Claude Code is installed
2. Auto-detect your project's tech stack
3. Generate agents customized for your stack
4. Install hooks and skills
5. Save everything to `./.claude/`

**Example output**:

```
  Claude Agent Kit - Initialize

✔ Claude Code detected (1.0.0)
✔ Tech stack detected

  Detected technologies:
    ✓ TypeScript
    ✓ Next.js
    ✓ Supabase
    ✓ shadcn/ui

  Matched stack template:
    Next.js + Supabase
    Full-stack TypeScript with Next.js 14, React 18, shadcn/ui, and Supabase

? Use "Next.js + Supabase" stack template? Yes

  Using stack: Next.js + Supabase

  Target directory: /path/to/project/.claude

✔ Directory structure created
✔ Generated 2 stack-specific agent(s)
✔ Installed 5 tech-agnostic agent(s)
✔ Installed 6 hook(s)
✔ Installed 15 skill(s)

  ✓ Initialization complete!

  Installed to: /path/to/project/.claude

  Agents:
    • developer (Next.js + Supabase specialist)
    • database (Next.js + Supabase database)
    • shipper (tech-agnostic)
    • reviewer (tech-agnostic)
    • documentor (tech-agnostic)
    • meta-agent (tech-agnostic)

  Skills: 15 installed
    /team-ship, /team-fix, /team-cleanup, /team-run-tests, /team-add-tests, and more

  Next steps:
    1. Restart Claude Code to load new agents
    2. Try /team-ship to start building features
    3. Use /team-create-agent to add custom agents
```

### 3. Restart Claude Code

For Claude Code to recognize the new agents and commands, you need to restart it:

```bash
# Exit Claude Code if running, then:
claude
```

Or if using the GUI, fully quit and reopen the application.

### 4. Verify Installation

Check that agents are available:

```bash
# In Claude Code
@developer hello
@database status
/team-ship --help
```

## Installation Options

### Marketplace Plugin (Recommended)

Installs agents, skills, and hooks as a Claude Code plugin:

```bash
claude plugin marketplace add bryanweaver/claude-agent-kit
claude plugin install team@claude-agent-kit
```

**Use when**: You want the simplest setup, or prefer managing plugins through Claude Code directly.

**Pros**:
- No npm or Node.js required
- Managed entirely within Claude Code
- Single install command

**Cons**:
- Does not perform per-project stack detection

### npm CLI — Project Installation (Default)

Installs to `./.claude/` in your current project:

```bash
npx @bryanofearth/claude-agent-kit init
```

**Use when**: Different projects use different tech stacks.

**Pros**:
- Stack-specific agents for each project
- No cross-project conflicts
- Easy to version control

**Cons**:
- Requires Node.js >= 18.0.0
- Need to initialize each project separately

### npm CLI — Global Installation

Installs to `~/.claude/` in your home directory:

```bash
npx @bryanofearth/claude-agent-kit init --global
```

**Use when**: You work on similar projects with the same stack.

**Pros**:
- Available across all projects
- Install once, use everywhere

**Cons**:
- Only one stack configuration at a time
- Stack-specific agents may not match all projects

## What Gets Installed

### Generated Agents (Stack-Specific)

These are customized based on your detected stack:

- **developer** - Implementation specialist for your framework
- **database** - Database administrator for your database

### Tech-Agnostic Agents

These work the same regardless of stack:

- **shipper** - Git operations, testing, building, deployment
- **reviewer** - Pragmatic code review (security, bugs, performance)
- **documentor** - Documentation creation and maintenance
- **meta-agent** - Generates new custom agents

### Skills

Workflow skills and code pattern libraries:

**Workflow skills** (invoke with `/`):

- **/team-ship** - Build and deploy features from start to production
- **/team-fix** - Emergency bug fixes and rapid issue resolution
- **/team-cleanup** - Technical debt and refactoring
- **/team-run-tests** - Batch test and fix workflows
- **/team-add-tests** - Add critical test coverage
- **/team-create-agent** - Create new custom agents
- **/team-init-docs** - Set up docs structure
- **/team-update-docs** - Update docs after changes
- **/team-repo-status** - Comprehensive repository status
- **/team-audit** - Analyze and view audit logs

**Code pattern libraries** (auto-activate based on context):

- **supabase-patterns** - RLS policies, migrations, Edge Functions
- **nextjs-app-router** - Server/Client Components, routing
- **shadcn-components** - CVA variants, forms, Radix UI
- **tanstack-query** - Data fetching, mutations, caching
- **testing-patterns** - Jest, React Testing Library, Playwright

### Hooks

Event-driven automation:

- **audit_logger.cjs** - Audit logging for tool usage
- **session_manager.cjs** - Session management
- **diagnose.cjs** - Diagnostic tools
- **log_analyzer.cjs** - Log analysis
- **session_start.cjs** - Session initialization
- **test_hooks.cjs** - Hook testing utilities

## Using the Agents

### Talk to Agents Directly

```
@developer create a login page with email validation
```

```
@database add a users table with RLS policies
```

```
@shipper commit and push these changes
```

### Use Skills for Workflows

```
/team-ship add user authentication
```

This will:
1. Invoke the appropriate agents in sequence
2. Implement the feature
3. Write tests
4. Review code
5. Commit and deploy

### Let Skills Auto-Activate

Skills activate automatically based on context. When you're working on Supabase migrations, the `supabase-patterns` skill provides relevant examples.

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

## Next Steps

- **Learn the architecture**: Read [System Overview](../architecture/system-overview.md)
- **Try a skill**: Run `/team-ship add user profile page`
- **Create custom agents**: Use `/team-create-agent` or the `meta-agent`
- **Customize for your stack**: See [Adding New Stacks](./adding-new-stacks.md)

## Troubleshooting

### Claude Code not detected

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Verify
claude --version

# Try init again
npx @bryanofearth/claude-agent-kit init
```

### Files not appearing in Claude Code

1. **Check installation location**: Look for `./.claude/` or `~/.claude/`
2. **Restart Claude Code completely**: Fully exit and restart
3. **Check Claude Code settings**: Verify custom directory paths

### Want to change stacks

Just run init again - it will overwrite the generated agents:

```bash
npx @bryanofearth/claude-agent-kit init
```

### Wrong stack detected

If the auto-detection picks the wrong stack:

```bash
npx @bryanofearth/claude-agent-kit init
# When prompted, choose "No" to auto-detection
# Then manually select your stack from the list
```

## Related Documents

- [CLI Commands Reference](../reference/cli-commands.md)
- [Supported Stacks](../reference/supported-stacks.md)
- [System Overview](../architecture/system-overview.md)

---

Last updated: 2026-02-24
