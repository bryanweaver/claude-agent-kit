# System Overview

Claude Agent Kit is a CLI tool that installs curated Claude Code agents, commands, skills, and hooks customized for your specific tech stack.

## Core Concept

**Before (v1.0)**: One-size-fits-all agents designed for Next.js + Supabase only.

**Now (v2.0)**: Stack-aware agents generated dynamically based on your project's technology.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Project                            │
│  (Next.js, Django, React+Express, etc.)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ npx @bryanofearth/claude-agent-kit init
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Init Command Workflow                       │
│                                                              │
│  1. Detect Claude Code ──► Check if CLI is installed        │
│  2. Detect Stack ───────► Scan project files                │
│  3. Select Stack ────────► Auto-select or interactive        │
│  4. Generate Agents ─────► Create developer + database       │
│  5. Install Assets ──────► Copy commands, hooks, skills      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               ./.claude/ (or ~/.claude/)                     │
│                                                              │
│  ├── agents/                                                 │
│  │   ├── developer.md      ← Generated for your stack       │
│  │   ├── database.md       ← Generated for your stack       │
│  │   ├── shipper.md        ← Tech-agnostic (copied)         │
│  │   ├── reviewer.md       ← Tech-agnostic (copied)         │
│  │   └── ...                                                 │
│  ├── commands/                                               │
│  ├── skills/                                                 │
│  └── hooks/                                                  │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Claude Code Detection (`lib/detect-claude-code.js`)

Verifies that Claude Code is installed before proceeding:

- Checks if `claude` CLI command exists
- Retrieves version information
- Provides installation instructions if missing

**Why this matters**: The generated assets are useless without Claude Code installed.

### 2. Stack Detection (`lib/detect-stack.js`)

Scans the project to identify:

- **Language**: JavaScript, TypeScript, Python, Go, Ruby, Rust
- **Frontend Framework**: Next.js, React, Vue, Angular, Svelte
- **Backend Framework**: Express, Django, FastAPI, Rails, etc.
- **Database**: PostgreSQL, MongoDB, MySQL, Supabase, Firebase
- **UI Library**: shadcn/ui, Tailwind CSS, Material UI
- **Testing Framework**: Jest, Vitest, pytest, etc.

**Detection sources**:
- `package.json` dependencies (JavaScript/TypeScript)
- `requirements.txt`, `pyproject.toml` (Python)
- `go.mod` (Go)
- `Gemfile` (Ruby)
- `Cargo.toml` (Rust)

**Stack matching**: Detection results are mapped to known stack templates (e.g., `nextjs-supabase`, `react-express-postgres`).

### 3. Stack Templates (`lib/stacks/index.js`)

Each stack template defines:

```javascript
{
  id: 'nextjs-supabase',
  name: 'Next.js + Supabase',
  description: 'Full-stack TypeScript with Next.js 14...',

  developer: {
    name: 'developer',
    description: '...',
    techStack: '...',
    fileStructure: '...',
    instructions: '...',
    boundaries: '...'
  },

  database: {
    name: 'database',
    description: '...',
    techStack: '...',
    instructions: '...',
    safeCommands: '...',
    dangerousCommands: '...',
    protectionRules: '...'
  }
}
```

These templates are **content specifications**, not files. The actual agent markdown files are generated at runtime.

### 4. Agent Generation (`lib/generate-agents.js`)

Takes a stack template and generates agent markdown files:

- **Developer agent**: Customized for the specific frontend/backend frameworks
- **Database agent**: Customized for the specific database and ORM/ODM

**Generated structure**:
```markdown
---
name: developer
role: developer
description: PROACTIVELY use for ALL Next.js/React frontend development...
tools: Read, Edit, MultiEdit, Write, Grep, Glob, Bash
model: sonnet
color: green
---

# Purpose

You are the primary developer for this project...

## Tech Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, lucide-react
...
```

### 5. Installation (`lib/init.js`)

Orchestrates the entire initialization process:

1. Check for Claude Code
2. Detect project stack
3. Confirm or select stack
4. Generate stack-specific agents
5. Copy tech-agnostic agents (shipper, reviewer, etc.)
6. Copy commands, hooks, and skills
7. Report success

## Tech-Agnostic vs Stack-Specific

### Tech-Agnostic Assets (Copied as-is)

These work the same regardless of your stack:

- **Agents**: shipper, reviewer, documentor, meta-agent, meta-commands-agent
- **Commands**: /ship, /fix, /cleanup, /test, /add-tests, etc.
- **Hooks**: audit_logger.cjs, session_manager.cjs, etc.
- **Skills**: (Most skills are stack-specific)

These are stored in `templates/` and copied directly to `.claude/`.

### Stack-Specific Assets (Generated)

These are customized based on your detected stack:

- **developer agent**: Instructions for your specific frameworks and patterns
- **database agent**: Commands and safeguards for your specific database

These do NOT exist as pre-made files. They are generated from templates in `lib/stacks/index.js`.

## Why This Architecture?

### Problem with v1.0

- Hard-coded for Next.js + Supabase only
- Users with other stacks had to manually edit agents
- Adding new stacks required creating multiple new files
- Maintenance burden: 6 stacks × 2 agents = 12 files to maintain

### Solution in v2.0

- Stack templates are JavaScript objects (easy to maintain)
- One generation function creates agents for any stack
- Adding a new stack = adding one object to `lib/stacks/index.js`
- Easier to test, version, and extend

## Installation Modes

### Project Installation (Default)

```bash
npx @bryanofearth/claude-agent-kit init
```

Installs to `./.claude/` in the current directory.

**Use when**: Different projects use different stacks.

### Global Installation

```bash
npx @bryanofearth/claude-agent-kit init --global
```

Installs to `~/.claude/` in your home directory.

**Use when**: You work on similar projects and want the same agents everywhere.

## Related Documents

- [Stack Detection](./stack-detection.md) - Deep dive into how stack detection works
- [Agent Generation](./agent-generation.md) - How agents are generated from templates
- [Adding New Stacks](../guides/adding-new-stacks.md) - How to add support for new stacks

---

Last updated: 2025-12-18
