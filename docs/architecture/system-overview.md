# System Overview

Claude Agent Kit is a lean agile development toolkit distributed as a Claude Code plugin. It provides curated agents, skills, and hooks that work together to accelerate development workflows.

## Core Concept

Agents detect the project's tech stack at runtime and adapt their behavior accordingly. No per-project configuration or code generation is needed — the plugin works out of the box for any tech stack.

## Distribution

Claude Agent Kit is distributed as a **Claude Code plugin** via the marketplace:

```bash
claude plugin marketplace add bryanweaver/claude-agent-kit
claude plugin install team@claude-agent-kit
```

Plugin manifests live in `.claude-plugin/`:
- `plugin.json` — Plugin name, version, description, author
- `marketplace.json` — Marketplace registry entry with plugin listing and metadata

For local development, load directly:
```bash
claude --plugin-dir /path/to/claude-agent-kit
```

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Project                            │
│  (Next.js, Django, React+Express, Go, Ruby, etc.)           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ claude plugin install
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Claude Agent Kit Plugin                         │
│                                                              │
│  agents/           → Adaptive agents (detect stack at        │
│                      runtime, tailor approach)               │
│  skills/           → Workflow skills (/team-ship, etc.)      │
│                      + tech-stack pattern libraries           │
│  hooks/            → Quality gates and observability         │
│  settings.json     → Agent Teams flag                        │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Adaptive Agents

The **full-stack-developer** and **database-admin** agents detect the project's tech stack on first invocation by scanning configuration files:

- `package.json` — JavaScript/TypeScript (Next.js, React, Vue, Express, etc.)
- `requirements.txt` / `pyproject.toml` — Python (Django, FastAPI, Flask)
- `go.mod` — Go projects
- `Gemfile` — Ruby (Rails, Sinatra)
- `Cargo.toml` — Rust projects
- `composer.json` — PHP (Laravel, Symfony)

Based on detection, they:
- Apply stack-appropriate patterns and conventions
- Use the correct migration tools and commands
- Enforce safety rules specific to the detected database
- Reference matching tech-stack skills for best practices

### 2. Tech-Stack Skills

Code pattern libraries that auto-activate based on context:

- **`nextjs-app-router`** — Server/Client Components, App Router, data fetching
- **`shadcn-components`** — CVA variants, Radix UI, form components
- **`supabase-patterns`** — RLS policies, migrations, Edge Functions
- **`tanstack-query`** — Data fetching, caching, mutations
- **`testing-patterns`** — Jest, React Testing Library, Playwright

Agents reference these skills when the detected stack matches.

### 3. Workflow Skills

Team orchestration workflows invoked via `/` commands:

- **/team-ship** — Full feature development pipeline
- **/team-fix** — Emergency bug fixes
- **/team-cleanup** — Technical debt refactoring
- **/team-run-tests** — Batch test and fix
- **/team-add-tests** — Critical test coverage

Each workflow coordinates multiple agents in sequence or parallel.

### 4. Tech-Agnostic Agents

Agents that work the same regardless of stack:

- **shipper** — Git operations, testing, building, deployment pipeline
- **reviewer** — Security, bugs, performance review
- **documentor** — Documentation creation and maintenance
- **meta-agent** — Generates new custom agents
- **meta-skills-agent** — Generates new workflow skills

### 5. Hooks

Event-driven automation for quality gates:

- **TaskCompleted** — LLM verifies task completion
- **TeammateIdle** — Logs idle events
- **SubagentStop** — Validates git state on shipper completion

## Why This Architecture?

### Adaptive over Generated

Previous versions generated stack-specific agents at install time via a CLI tool. This required:
- A Node.js CLI with dependencies (commander, inquirer, chalk, ora, fs-extra)
- Stack detection logic in JavaScript
- Agent template generation code
- Per-project initialization

The current approach is simpler:
- Agents detect the stack at runtime — no generation step needed
- Plugin installs directly — no CLI or dependencies
- Works for any stack without pre-configuration
- Tech-stack skills provide framework-specific patterns as supplementary context

### Plugin-Only Distribution

Removing the CLI simplifies distribution:
- No npm dependencies to maintain
- No Node.js version requirements for users
- Single installation method via Claude Code marketplace
- Plugin auto-discovery from repository root

## Related Documents

- [Getting Started](../guides/getting-started.md) — Installation guide
- [Development Workflow](../guides/development-workflow.md) — Contributing guide

---

Last updated: 2026-02-26
