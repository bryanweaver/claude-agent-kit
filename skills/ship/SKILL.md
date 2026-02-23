---
name: ship
description: Build and deploy features — branch, implement, commit, review, test, deploy, PR/merge
argument-hint: <feature description>
disable-model-invocation: true
allowed-tools: Bash(git *), TaskCreate, TaskUpdate, TaskList, TaskGet
---

# Ship — Build and Deploy Features

Implement a new feature or enhancement from start to production.

**Feature to implement:** $ARGUMENTS

## Execution

### With Agent Teams (recommended)

Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

Create a team and spawn teammates:

1. **Create team** named `ship-<feature-slug>`
2. **Spawn teammates:** shipper, full-stack-developer, database-admin (if data changes needed), reviewer

Create the following task list with dependencies:

| # | Task | Owner | Blocked By |
|---|------|-------|------------|
| 1 | Create feature branch `feature/<name>` from main | shipper | — |
| 2 | Implement the feature end-to-end | full-stack-developer | 1 |
| 3 | Implement database/data layer changes (if needed) | database-admin | 1 |
| 4 | Commit all changes with conventional message | shipper | 2, 3 |
| 5 | Review implementation for security, bugs, performance | reviewer | 4 |
| 6 | Run full test suite | shipper | 5 |
| 7 | Fix regressions (if tests fail — loop back to 6) | full-stack-developer | 6 |
| 8 | Deploy and create PR to main | shipper | 6 |

**Parallelism:** Tasks 2 and 3 can run simultaneously after task 1 completes.

**Loop:** If task 6 finds failures, create task 7 to fix them, then re-run task 6.

### Without Agent Teams (fallback)

Execute sequentially using the Task tool:

1. `Task(shipper, "Create feature branch feature/<name> from main")`
2. `Task(full-stack-developer, "Implement: $ARGUMENTS")`
3. `Task(database-admin, "Implement data layer changes for: $ARGUMENTS")` — only if needed
4. `Task(shipper, "Commit all changes with message: feat: <description>")`
5. `Task(reviewer, "Review the implementation on this branch")`
6. `Task(shipper, "Run full test suite")`
7. If tests fail: `Task(full-stack-developer, "Fix test failures: <failure details>")`
8. `Task(shipper, "Deploy and create PR to main")`

## Workflow Diagram

```
┌─────────┐     ┌──────────────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│ Shipper │────►│ Full Stack Dev   │────►│ Shipper │────►│ Reviewer │────►│ Shipper │
│ Branch  │     │ + DB Admin (||)  │     │ Commit  │     │  Review  │     │Run Tests│
└─────────┘     └──────────────────┘     └─────────┘     └──────────┘     └────┬────┘
                                                                               │
                                                         ┌────────────────────┴──────┐
                                                         │                           │
                                                    [Tests Pass]              [Tests Fail]
                                                         │                           │
                                                         ▼                           ▼
                                                   ┌──────────┐             ┌──────────────┐
                                                   │ Shipper  │             │Full Stack Dev│
                                                   │Deploy+PR │             │Fix & Re-test │
                                                   └──────────┘             └──────────────┘
```
