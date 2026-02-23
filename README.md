# Lean Agile Team — Claude Code Plugin

Ship fast, learn faster. 4 agents, 5 workflows, Agent Teams coordination.

## Prerequisites

- [Claude Code](https://claude.com/claude-code) installed
- **Required for full coordination:** `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` (set automatically by this plugin's `settings.json`)
- Works without Agent Teams in degraded sequential mode via Task() fallback

## Quick Start

```bash
# Install the plugin
claude --plugin-dir /path/to/agent-orchestration-system

# Ship a feature
/ship add user authentication

# Fix a production bug
/fix users can't log in

# Clean up tech debt
/cleanup authentication module

# Run and fix tests
/test

# Add critical test coverage
/add-tests payment processing
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Team Lead                       │
│            (Claude Code Main Agent)              │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
  ┌──────────┐ ┌────────┐ ┌──────────┐
  │Full Stack│ │Database│ │ Reviewer  │
  │Developer │ │ Admin  │ │          │
  └──────────┘ └────────┘ └──────────┘
        │          │          │
        └──────────┼──────────┘
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
| **Full Stack Developer** | Rapid implementation across entire stack | Sonnet | Worktree isolation, project memory |
| **Database Admin** | Schema, queries, migrations, data integrity | Sonnet | Worktree isolation, project memory |
| **Shipper** | Git, testing, building, deployment, PRs | Sonnet | Unblocked pipeline access |
| **Reviewer** | Security, bugs, performance review | Sonnet | Read-only (plan mode) |
| **Meta-Agent** | Generate new custom agents | Opus | On-demand agent creation |

## Workflow Skills

| Skill | Purpose | Speed |
|-------|---------|-------|
| `/ship <feature>` | Feature branch → implement → review → test → deploy → PR | Balanced |
| `/fix <bug>` | Hotfix → diagnose → patch → deploy (no review step) | Fastest |
| `/cleanup <area>` | Analyze tech debt → refactor → validate | Thorough |
| `/test [scope]` | Run all tests → batch-fix failures → verify | Thorough |
| `/add-tests <area>` | Identify critical gaps → write minimal tests | Focused |

## Workflow Details

### `/ship` — Build and Deploy Features

```
Shipper ──► Full Stack Dev + DB Admin (parallel) ──► Shipper ──► Reviewer ──► Shipper ──► Shipper
Branch       Implement feature                       Commit       Review       Test         Deploy+PR
```

Tasks: Create branch → Implement → Commit → Review → Test → Fix regressions (if needed) → Deploy & PR

### `/fix` — Emergency Bug Fixes

```
Shipper ──► Full Stack Dev + DB Admin ──► Shipper ──► Shipper ──► Shipper
Hotfix       Diagnose & patch              Commit      Test+Deploy  Merge
```

No reviewer step — speed is the priority for emergencies.

### `/cleanup` — Technical Debt

```
Shipper ──► Reviewer ──► Full Stack Dev + DB Admin (parallel) ──► Shipper ──► Shipper
Branch       Analyze       Refactor                                Commit      Test+PR
```

Reviewer-first: analyze before refactoring.

### `/test` — Batch Test and Fix

```
Shipper ──► Shipper ──► Full Stack Dev + DB Admin ──► Shipper ──► Shipper ──► Reviewer ──► Shipper
Branch       Run tests    Fix failures (parallel)      Commit      Re-test     Review       PR
                              ↑                                       │
                              └───────── loop if still failing ───────┘
```

### `/add-tests` — Critical Test Coverage

```
Shipper ──► Reviewer ──► Full Stack Dev + DB Admin (parallel) ──► Shipper ──► Shipper
Branch       Find gaps     Write minimal tests                     Run tests    Commit+PR
```

Test the 20% that prevents 80% of disasters.

## Plugin Structure

```
agent-orchestration-system/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── agents/
│   ├── full-stack-developer.md  # Rapid full-stack implementation
│   ├── database-admin.md        # Database and data layer
│   ├── shipper.md               # Pipeline: git, test, build, deploy
│   ├── reviewer.md              # Security, bugs, performance review
│   └── meta-agent.md            # Agent generator
├── skills/
│   ├── ship/SKILL.md            # Feature development workflow
│   ├── fix/SKILL.md             # Emergency hotfix workflow
│   ├── cleanup/SKILL.md         # Tech debt refactoring workflow
│   ├── test/SKILL.md            # Batch test and fix workflow
│   └── add-tests/SKILL.md       # Critical test coverage workflow
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
| **TeammateIdle** | Command | Logs idle events to `/tmp/lean-agile-team.log` |
| **SubagentStop[shipper]** | Prompt | Validates git state is clean when shipper finishes |

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

```
Create a new agent that handles API integration testing
```

The meta-agent will:
1. Analyze your requirements
2. Select appropriate tools and model
3. Generate a complete agent definition
4. Save to `agents/<name>.md`

## Key Principles

- **Ship fast, learn faster** — working software over perfect software
- **Minimal testing** — test the 20% that prevents 80% of disasters
- **Speed focus** — `/fix` is fastest, `/ship` is balanced, `/cleanup` and `/test` are thorough
- **Non-blocking reviews** — reviewer suggestions don't stop deployment (except security)
- **Clean pipeline** — shipper owns the entire git-to-production flow
- **Quality without bureaucracy** — pragmatic reviews, not nitpicks
