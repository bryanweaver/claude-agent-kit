---
name: team-fix
description: Emergency bug fixes — rapidly diagnose and fix production issues
argument-hint: <bug description or issue ID>
disable-model-invocation: true
allowed-tools: Bash(git *), TaskCreate, TaskUpdate, TaskList, TaskGet
---

# Fix — Emergency Bug Fixes

Rapidly diagnose and fix production issues. Speed is the priority — no reviewer step.

**Issue to fix:** $ARGUMENTS

## Execution

### With Agent Teams (recommended)

Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

Create a team and spawn teammates:

1. **Create team** named `fix-<issue-slug>`
2. **Spawn teammates:** shipper, full-stack-developer, database-admin (if data issue), documentor

Create the following task list with dependencies:

| # | Task | Owner | Blocked By |
|---|------|-------|------------|
| 1 | Create hotfix branch `hotfix/<issue-id>` from main | shipper | — |
| 2 | Diagnose root cause and implement minimal fix | full-stack-developer | 1 |
| 3 | Fix data layer issues (if applicable) | database-admin | 1 |
| 4 | Commit fix with message `fix: <description>` | shipper | 2, 3 |
| 5 | Run focused tests and deploy | shipper | 4 |
| 6 | Update documentation if fix affects docs | documentor | 5 |
| 7 | Merge hotfix to main, tag patch release | shipper | 5, 6 |

**Parallelism:** Tasks 2 and 3 can run simultaneously if both are needed.

### Without Agent Teams (fallback)

Execute sequentially using the Task tool:

1. `Task(shipper, "Create hotfix branch hotfix/<issue-id> from main")`
2. `Task(full-stack-developer, "Diagnose and fix: $ARGUMENTS")`
3. `Task(database-admin, "Fix data issues for: $ARGUMENTS")` — only if data-related
4. `Task(shipper, "Commit fix: fix: <description>")`
5. `Task(shipper, "Run focused tests on fix, deploy to production")`
6. `Task(documentor, "Update docs if fix affects documented behavior: $ARGUMENTS")`
7. `Task(shipper, "Merge hotfix to main, tag patch release")`

## Workflow Diagram

```
┌─────────┐     ┌──────────────────┐     ┌─────────┐     ┌──────────┐     ┌────────────┐     ┌─────────┐
│ Shipper │────►│ Full Stack Dev   │────►│ Shipper │────►│ Shipper  │────►│ Documentor │────►│ Shipper │
│ Hotfix  │     │ + DB Admin (||)  │     │ Commit  │     │Quick Test│     │ Update Docs│     │PR/Merge │
│ Branch  │     │ Diagnose & Fix   │     │   Fix   │     │ & Deploy │     └────────────┘     └─────────┘
└─────────┘     └──────────────────┘     └─────────┘     └──────────┘
```
