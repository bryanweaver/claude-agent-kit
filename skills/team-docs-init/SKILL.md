---
name: team-docs-init
description: Initialize comprehensive documentation for the codebase
argument-hint: [optional: specific area to document]
disable-model-invocation: true
allowed-tools: TaskCreate, TaskUpdate, TaskList, TaskGet
---

# Initialize Documentation

Create comprehensive, well-organized documentation for the codebase.

**Target area:** $ARGUMENTS

## Execution

### With Agent Teams (recommended)

Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

Create a team and spawn teammates:

1. **Create team** named `init-docs`
2. **Spawn teammates:** documentor

Create the following task list:

| # | Task | Owner | Blocked By |
|---|------|-------|------------|
| 1 | Analyze codebase structure, frameworks, and architecture | documentor | — |
| 2 | Create docs/ directory structure and generate documentation | documentor | 1 |
| 3 | Build table of contents and cross-link all documents | documentor | 2 |

### Without Agent Teams (fallback)

Execute using the Task tool:

1. `Task(documentor, "Initialize comprehensive documentation for the codebase. Focus area: $ARGUMENTS. Analyze project structure, create docs/ folder hierarchy, generate documentation for all major modules, and build a table of contents with cross-links.")`

## Expected Output

After completion, the docs/ folder should contain:
- `docs/README.md` — main table of contents
- `docs/architecture/` — system design documentation
- `docs/api/` — API documentation (if applicable)
- `docs/guides/` — how-to guides
- `docs/reference/` — configuration and reference material
- Cross-linked documents for easy navigation
