---
name: team-run-tests
description: Batch test and fix — run comprehensive tests, identify all issues, then fix systematically
argument-hint: "[test pattern or scope]"
disable-model-invocation: true
allowed-tools: Bash(git *), TaskCreate, TaskUpdate, TaskList, TaskGet
---

# Test — Batch Test and Fix

Run all tests, batch-fix failures, and verify. Loops until green.

**Test scope:** $ARGUMENTS

## Execution

### With Agent Teams (recommended)

Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

Create a team and spawn teammates:

1. **Create team** named `test-run`
2. **Spawn teammates:** shipper, full-stack-developer, database-admin, reviewer, documentor

Create the following task list with dependencies:

| # | Task | Owner | Blocked By |
|---|------|-------|------------|
| 1 | Create branch `test/<timestamp>` from main | shipper | — |
| 2 | Run full test suite, compile failure report | shipper | 1 |
| 3 | Fix application test failures (dynamic sub-tasks per failure) | full-stack-developer | 2 |
| 4 | Fix data layer test failures (dynamic sub-tasks per failure) | database-admin | 2 |
| 5 | Commit all fixes | shipper | 3, 4 |
| 6 | Re-run previously failed tests | shipper | 5 |
| 7 | Run full validation suite | shipper | 6 |
| 8 | Review all fixes for quality | reviewer | 7 |
| 9 | Update documentation if fixes affect docs | documentor | 8 |
| 10 | Create PR to main with test report | shipper | 8, 9 |

**Parallelism:** Tasks 3 and 4 can run simultaneously.

**Loop:** If task 6 finds remaining failures, create new fix tasks and loop back to task 6.

**Dynamic tasks:** After task 2, create specific sub-tasks for each failure group and assign to the appropriate developer.

### Without Agent Teams (fallback)

Execute sequentially using the Task tool:

1. `Task(shipper, "Create branch test/<timestamp> from main")`
2. `Task(shipper, "Run full test suite, report all failures")`
3. For each failure group:
   - `Task(full-stack-developer, "Fix: <failure details>")` — for app failures
   - `Task(database-admin, "Fix: <failure details>")` — for data failures
4. `Task(shipper, "Commit fixes: fix: <test-name> - <description>")`
5. `Task(shipper, "Re-run previously failed tests")`
6. If still failing, loop back to step 3
7. `Task(shipper, "Run full test suite for final validation")`
8. `Task(reviewer, "Review all test fixes")`
9. `Task(documentor, "Update docs if test fixes changed documented behavior")`
10. `Task(shipper, "Create PR to main with test report")`

## Workflow Diagram

```text
     Phase 1: Discovery          Phase 2: Fix              Phase 3: Verify
┌─────────┐     ┌─────────┐     ┌──────────────┐     ┌─────────┐     ┌──────────┐
│ Shipper │────►│ Shipper │────►│Full Stack Dev│────►│ Shipper │────►│ Shipper  │
│ Branch  │     │Run Tests│     │ + DB Admin   │     │ Commit  │     │ Re-test  │
└─────────┘     └────┬────┘     └──────────────┘     └─────────┘     └────┬─────┘
                     │                ↑                                     │
                     ▼                │ (loop if                           ▼
              [Failure Report]────────┘  still failing)            [Full Validation]
                                                                          │
                                                                          ▼
                                                                   ┌──────────┐     ┌────────────┐
                                                                   │ Reviewer │────►│ Documentor │──►[PR/Merge]
                                                                   └──────────┘     │ Update Docs│
                                                                                    └────────────┘
```
