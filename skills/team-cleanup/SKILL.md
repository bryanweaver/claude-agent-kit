---
name: team-cleanup
description: Technical debt and refactoring — analyze, refactor, and validate code improvements
argument-hint: <area or module to clean up>
disable-model-invocation: true
allowed-tools: Bash(git *), TaskCreate, TaskUpdate, TaskList, TaskGet
---

# Cleanup — Technical Debt and Refactoring

Improve code quality, performance, and maintainability through targeted refactoring.

**Area to clean up:** $ARGUMENTS

## Execution

### With Agent Teams (recommended)

Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

Create a team and spawn teammates:

1. **Create team** named `cleanup-<area-slug>`
2. **Spawn teammates:** shipper, reviewer, full-stack-developer, database-admin (if data layer), documentor

Create the following task list with dependencies:

| # | Task | Owner | Blocked By |
|---|------|-------|------------|
| 1 | Create branch `refactor/<area>` from main | shipper | — |
| 2 | Analyze code for smells, bottlenecks, and refactoring opportunities | reviewer | 1 |
| 3 | Refactor application code based on review findings | full-stack-developer | 2 |
| 4 | Refactor data layer based on review findings (if needed) | database-admin | 2 |
| 5 | Commit refactoring changes | shipper | 3, 4 |
| 6 | Run full test suite and validate | shipper | 5 |
| 7 | Update documentation for refactoring changes | documentor | 6 |
| 8 | Create PR to main with before/after summary | shipper | 6, 7 |

**Parallelism:** Tasks 3 and 4 can run simultaneously after the review completes.

### Without Agent Teams (fallback)

Execute sequentially using the Task tool:

1. `Task(shipper, "Create branch refactor/<area> from main")`
2. `Task(reviewer, "Analyze $ARGUMENTS for code smells, bottlenecks, refactoring opportunities")`
3. `Task(full-stack-developer, "Refactor based on review findings: <findings>")`
4. `Task(database-admin, "Refactor data layer: <findings>")` — only if needed
5. `Task(shipper, "Commit changes: refactor: <description>")`
6. `Task(shipper, "Run full test suite, validate no regressions")`
7. `Task(documentor, "Update docs for refactoring changes in: $ARGUMENTS")`
8. `Task(shipper, "Create PR to main with before/after summary")`

## Workflow Diagram

```text
┌─────────┐     ┌──────────┐     ┌──────────────────┐     ┌─────────┐     ┌─────────┐     ┌────────────┐     ┌─────────┐
│ Shipper │────►│ Reviewer │────►│ Full Stack Dev   │────►│ Shipper │────►│ Shipper │────►│ Documentor │────►│ Shipper │
│ Branch  │     │ Analyze  │     │ + DB Admin (||)  │     │ Commit  │     │  Test   │     │ Update Docs│     │  PR     │
└─────────┘     └──────────┘     │ Refactor         │     └─────────┘     └─────────┘     └────────────┘     └─────────┘
                     │           └──────────────────┘
              [Identify Issues]
              [Prioritize]
```
