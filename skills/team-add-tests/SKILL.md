---
name: team-add-tests
description: Add critical test coverage — tests ONLY for functionality that could cause production disasters
argument-hint: <area or module to add tests for>
disable-model-invocation: true
allowed-tools: Bash(git *), TaskCreate, TaskUpdate, TaskList, TaskGet
---

# Add Tests — Critical Test Coverage

Add tests for CRITICAL functionality only. Test the 20% that prevents 80% of disasters.

**Area to cover:** $ARGUMENTS

## Execution

### With Agent Teams (recommended)

Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

Create a team and spawn teammates:

1. **Create team** named `add-tests-<area-slug>`
2. **Spawn teammates:** shipper, reviewer, full-stack-developer, database-admin (if data layer), documentor

Create the following task list with dependencies:

| # | Task | Owner | Blocked By |
|---|------|-------|------------|
| 1 | Create branch `test/critical-coverage-<area>` from main | shipper | — |
| 2 | Identify CRITICAL untested code paths | reviewer | 1 |
| 3 | Write minimal tests for critical application paths | full-stack-developer | 2 |
| 4 | Write minimal tests for critical data integrity paths (if needed) | database-admin | 2 |
| 5 | Run full test suite including new tests | shipper | 3, 4 |
| 6 | Update documentation for new test coverage | documentor | 5 |
| 7 | Commit and create PR to main | shipper | 5, 6 |

**Critical = code that could:**
- Break authentication or authorization
- Lose or corrupt user data
- Break payments or money flow
- Cause a production outage

**Skip tests for:**
- UI formatting and styling
- Nice-to-have features
- Edge cases that won't impact production
- Anything that can be quickly fixed if it breaks

**Parallelism:** Tasks 3 and 4 can run simultaneously.

### Without Agent Teams (fallback)

Execute sequentially using the Task tool:

1. `Task(shipper, "Create branch test/critical-coverage-<area> from main")`
2. `Task(reviewer, "Identify CRITICAL untested code in $ARGUMENTS — focus on auth, data integrity, payments, outage risks")`
3. `Task(full-stack-developer, "Write minimal tests for critical paths: <reviewer findings>")`
4. `Task(database-admin, "Write data integrity tests: <reviewer findings>")` — only if needed
5. `Task(shipper, "Run full test suite including new tests")`
6. `Task(documentor, "Update docs to reflect new test coverage for: $ARGUMENTS")`
7. `Task(shipper, "Commit and create PR: test: add critical coverage for <area>")`

## Workflow Diagram

```
┌─────────┐     ┌──────────┐     ┌──────────────────┐     ┌─────────┐     ┌────────────┐     ┌─────────┐
│ Shipper │────►│ Reviewer │────►│ Full Stack Dev   │────►│ Shipper │────►│ Documentor │────►│ Shipper │
│ Branch  │     │ Identify │     │ + DB Admin (||)  │     │Run Tests│     │ Update Docs│     │Commit+PR│
└─────────┘     │ Critical │     │ Write Tests      │     └─────────┘     └────────────┘     └─────────┘
                │ Gaps     │     └──────────────────┘
                └──────────┘
```

## Philosophy

This is a **time-boxed effort**. Spend hours, not days. The goal is not comprehensive coverage — it's protecting against disasters. Write the minimum tests that prevent the maximum damage.
