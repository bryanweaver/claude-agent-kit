---
name: team-docs-update
description: Update documentation to reflect recent code changes
argument-hint: [optional: specific changes to document or 'auto' for git diff]
disable-model-invocation: true
allowed-tools: TaskCreate, TaskUpdate, TaskList, TaskGet
---

# Update Documentation

Analyze recent code changes and update existing documentation to reflect the current state.

**Target changes:** $ARGUMENTS

## Execution

### With Agent Teams (recommended)

Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

Create a team and spawn teammates:

1. **Create team** named `update-docs`
2. **Spawn teammates:** documentor

Create the following task list:

| # | Task | Owner | Blocked By |
|---|------|-------|------------|
| 1 | Identify recent code changes via git diff and map to existing docs | documentor | — |
| 2 | Update affected documentation, add new docs, remove obsolete sections | documentor | 1 |
| 3 | Verify cross-links and update table of contents | documentor | 2 |

### Without Agent Teams (fallback)

Execute using the Task tool:

1. `Task(documentor, "Update documentation for recent changes. Target: $ARGUMENTS. Use git diff to identify changes, update affected docs, add new documentation for new features, remove docs for removed features, and verify all cross-links.")`

## Options

- `auto` or empty — automatically detect changes via `git diff`
- Specific description — focus on described changes
