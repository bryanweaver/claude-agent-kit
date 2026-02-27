# Lean Agile Team — Claude Code Plugin

Ship fast, learn faster. 7 agents, 12 skills, Agent Teams coordination.

## Prerequisites

- [Claude Code](https://claude.com/claude-code) installed
- **Required for full coordination:** `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` (set automatically by this plugin's `settings.json`)
- Works without Agent Teams in degraded sequential mode via Task() fallback

## Quick Start

### Install via Claude Code Marketplace

```bash
# Add the repository to the marketplace
claude plugin marketplace add bryanweaver/claude-agent-kit

# Install the team plugin
claude plugin install team@claude-agent-kit
```

### Load Locally (Development)

```bash
# Load plugin directly from a local directory
# claude --plugin-dir /path/to/claude-agent-kit
```

### Start Using the Team

```bash
# Ship a feature
/team-ship add user authentication

# Fix a production bug
/team-fix users can't log in

# Clean up tech debt
/team-cleanup authentication module

# Run and fix tests
/team-run-tests

# Add critical test coverage
/team-add-tests payment processing
```

## Architecture

```text
┌─────────────────────────────────────────────────┐
│                  Team Lead                       │
│            (Claude Code Main Agent)              │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
        ▼          ▼          ▼          ▼
  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌────────────┐
  │Full Stack│ │Database│ │ Reviewer │ │ Documentor │
  │Developer │ │ Admin  │ │          │ │            │
  └──────────┘ └────────┘ └──────────┘ └────────────┘
        │          │          │          │
        └──────────┼──────────┼──────────┘
                   │
                   ▼
            ┌──────────┐
            │ Shipper  │
            │ (Pipeline│
            │  Owner)  │
            └──────────┘
                   │
                   ▼
         Shared Task List
    (Agent Teams coordination)
```

## The Lean Team

| Agent | Role | Model | Key Traits |
|-------|------|-------|------------|
| **Full Stack Developer** | Adaptive implementation across entire stack | Sonnet | Stack detection, worktree isolation, project memory |
| **Database Admin** | Adaptive schema, queries, migrations, data integrity | Sonnet | Multi-DB support, worktree isolation, project memory |
| **Shipper** | Git, testing, building, deployment, PRs | Sonnet | Unblocked pipeline access |
| **Reviewer** | Security, bugs, performance review | Sonnet | Read-only (plan mode) |
| **Documentor** | Create, maintain, organize codebase docs | Sonnet | Runs after tests pass |
| **Meta-Agent** | Generate new custom agents | Opus | On-demand agent creation |
| **Meta-Skills-Agent** | Generate new workflow skills | Opus | On-demand skill creation |

### Adaptive Agents

The **Full Stack Developer** and **Database Admin** agents are stack-adaptive — they detect your project's tech stack on first invocation by scanning configuration files (`package.json`, `requirements.txt`, `go.mod`, etc.) and tailor their approach accordingly. They reference the built-in tech-stack skills for framework-specific patterns:

- **`nextjs-app-router`** — Next.js App Router patterns
- **`shadcn-components`** — shadcn/ui component patterns
- **`supabase-patterns`** — Supabase database patterns
- **`tanstack-query`** — TanStack Query data fetching
- **`testing-patterns`** — Testing patterns for React/Next.js

## Skills

### Workflow Skills

| Skill | Purpose | Speed |
|-------|---------|-------|
| `/team-ship <feature>` | Feature branch → implement → review → test → deploy → PR | Balanced |
| `/team-fix <bug>` | Hotfix → diagnose → patch → deploy (no review step) | Fastest |
| `/team-cleanup <area>` | Analyze tech debt → refactor → validate | Thorough |
| `/team-run-tests [scope]` | Run all tests → batch-fix failures → verify | Thorough |
| `/team-add-tests <area>` | Identify critical gaps → write minimal tests | Focused |

### Utility Skills

| Skill | Purpose |
|-------|---------|
| `/team-init-docs [area]` | Generate comprehensive codebase documentation |
| `/team-update-docs [changes]` | Update docs to reflect recent code changes |
| `/team-create-agent <description>` | Create a new custom agent via meta-agent |
| `/team-create-skill <description>` | Create a new workflow skill via meta-skills-agent |
| `/team-repo-status [focus]` | Repository health report (git, todos, activity) |
| `/team-all-tools` | List all available tools with signatures |
| `/team-audit [action]` | Analyze audit logs (summary, report, metrics, timeline, verify, anomalies) |

## Workflow Details

### `/team-ship` — Build and Deploy Features

```text
Shipper ──► Full Stack Dev + DB Admin (parallel) ──► Shipper ──► Reviewer ──► Shipper ──► Documentor ──► Shipper
Branch       Implement feature                       Commit       Review       Test         Update Docs    Deploy+PR
```

Tasks: Create branch → Implement → Commit → Review → Test → Fix regressions (if needed) → Update docs → Deploy & PR

### `/team-fix` — Emergency Bug Fixes

```text
Shipper ──► Full Stack Dev + DB Admin ──► Shipper ──► Shipper ──► Documentor ──► Shipper
Hotfix       Diagnose & patch              Commit      Test+Deploy  Update Docs    Merge
```

No reviewer step — speed is the priority for emergencies.

### `/team-cleanup` — Technical Debt

```text
Shipper ──► Reviewer ──► Full Stack Dev + DB Admin (parallel) ──► Shipper ──► Shipper ──► Documentor ──► Shipper
Branch       Analyze       Refactor                                Commit      Test         Update Docs     PR
```

Reviewer-first: analyze before refactoring.

### `/team-run-tests` — Batch Test and Fix

```text
Shipper ──► Shipper ──► Full Stack Dev + DB Admin ──► Shipper ──► Shipper ──► Reviewer ──► Documentor ──► Shipper
Branch       Run tests    Fix failures (parallel)      Commit      Re-test     Review       Update Docs     PR
                              ↑                                       │
                              └───────── loop if still failing ───────┘
```

### `/team-add-tests` — Critical Test Coverage

```text
Shipper ──► Reviewer ──► Full Stack Dev + DB Admin (parallel) ──► Shipper ──► Documentor ──► Shipper
Branch       Find gaps     Write minimal tests                     Run tests    Update Docs    Commit+PR
```

Test the 20% that prevents 80% of disasters.

## Plugin Structure

```text
claude-agent-kit/
├── .claude-plugin/
│   ├── plugin.json              # Plugin manifest
│   └── marketplace.json         # Marketplace distribution manifest
├── agents/
│   ├── full-stack-developer.md  # Adaptive full-stack implementation
│   ├── database-admin.md        # Adaptive database and data layer
│   ├── shipper.md               # Pipeline: git, test, build, deploy
│   ├── reviewer.md              # Security, bugs, performance review
│   ├── documentor.md            # Documentation creation and maintenance
│   ├── meta-agent.md            # Agent generator
│   └── meta-skills-agent.md     # Skill generator
├── skills/
│   ├── team-ship/SKILL.md        # Feature development workflow
│   ├── team-fix/SKILL.md         # Emergency hotfix workflow
│   ├── team-cleanup/SKILL.md     # Tech debt refactoring workflow
│   ├── team-run-tests/SKILL.md   # Batch test and fix workflow
│   ├── team-add-tests/SKILL.md   # Critical test coverage workflow
│   ├── team-init-docs/SKILL.md   # Full documentation generation
│   ├── team-update-docs/SKILL.md # Documentation maintenance
│   ├── team-create-agent/SKILL.md # Custom agent creation
│   ├── team-create-skill/SKILL.md # Workflow skill generation
│   ├── team-repo-status/SKILL.md # Repository health report
│   ├── team-audit/SKILL.md       # Audit log analysis
│   └── team-all-tools/SKILL.md   # List available tools
├── hooks/
│   └── hooks.json               # Quality gates and observability
├── settings.json                # Plugin settings (Agent Teams flag)
├── docs/
│   └── lean-agile-system.md     # Detailed system specification
└── .claude/
    └── settings.json            # Claude Code project settings
```

## Configuration

### Settings

The plugin automatically enables Agent Teams via `settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Hooks

Three hooks provide quality gates and observability:

| Hook | Type | Purpose |
|------|------|---------|
| **TaskCompleted** | Prompt | LLM verifies task is genuinely complete before marking done |
| **TeammateIdle** | Command | Logs idle events to `<tmpdir>/lean-agile-team.log` |
| **SubagentStop** | Prompt | Validates git state is clean when shipper finishes (scoped via `agent_name` matcher) |

## Dual-Mode Operation

Every skill supports two execution modes:

### Agent Teams Mode (recommended)

With `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`:
- Spawns real teammates that work in parallel
- Uses shared task lists with dependency tracking
- Teammates communicate via mailbox protocol
- Full parallelism where workflows allow

### Sequential Fallback

Without Agent Teams:
- Executes agents sequentially via `Task()` calls
- Same workflow steps, same quality gates
- Works on any Claude Code version
- Slightly slower due to serial execution

## Creating Custom Agents

Use the meta-agent to generate new agents:

```text
/team-create-agent Create a new agent that handles API integration testing
```

The meta-agent will:
1. Analyze your requirements
2. Select appropriate tools and model
3. Generate a complete agent definition
4. Save to `agents/<name>.md`

## Key Principles

- **Ship fast, learn faster** — working software over perfect software
- **Minimal testing** — test the 20% that prevents 80% of disasters
- **Speed focus** — `/team-fix` is fastest, `/team-ship` is balanced, `/team-cleanup` and `/team-run-tests` are thorough
- **Non-blocking reviews** — reviewer suggestions don't stop deployment (except security)
- **Clean pipeline** — shipper owns the entire git-to-production flow
- **Quality without bureaucracy** — pragmatic reviews, not nitpicks
