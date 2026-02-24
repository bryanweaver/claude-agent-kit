# Lean Agile Development System

## Philosophy

**Ship fast, learn faster.** Minimal agents, rapid iteration, continuous deployment, parallel workflows.

## Agent Teams Architecture

This system uses Claude Code's **Agent Teams** feature for native multi-agent coordination. When Agent Teams is enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`), agents coordinate through:

- **Shared Task List:** All agents read from and write to a shared task list with dependency tracking (`blockedBy`). Tasks are created by skills and assigned to specific agents.
- **Mailbox Protocol:** Agents communicate via the built-in `SendMessage` tool — direct messages, broadcasts, and shutdown requests. No custom communication protocol needed.
- **Team Lead:** The main Claude Code agent acts as team lead, spawning teammates and monitoring progress.
- **Parallel Execution:** Agents with `isolation: worktree` work in parallel on isolated copies of the repository, merging changes back when complete.

### Fallback Mode

Without Agent Teams, skills execute the same workflow sequentially using `Task()` calls. Same steps, same quality — just serial execution.

---

## The Lean Team (5 Core Agents)

### 1. Full Stack Developer Agent

**Purpose:** Rapid feature implementation and bug fixes across the entire stack

**Configuration:**
- Model: Sonnet
- Memory: Project (accumulates codebase knowledge)
- Isolation: Worktree (safe parallel execution)
- Tools: Read, Write, Edit, MultiEdit, Bash, Grep, Glob

**Key Responsibilities:**
- Write working code quickly (frontend, backend, APIs, integrations)
- Implement features end-to-end
- Debug and fix issues across all layers
- Write minimal tests for CRITICAL functionality only
- Prefer simple, working solutions over complex architectures

**Approach:**
- Make it work first, optimize later
- Ship in small, deployable increments
- Write self-documenting code
- Keep dependencies minimal
- Test only what could break production

---

### 2. Database Admin Agent

**Purpose:** Database design, optimization, and data layer implementation

**Configuration:**
- Model: Sonnet
- Memory: Project (accumulates schema knowledge)
- Isolation: Worktree (safe parallel execution)
- Tools: Read, Write, Edit, MultiEdit, Bash, Grep, Glob

**Key Responsibilities:**
- Design and implement database schemas
- Write and optimize queries
- Handle migrations and data transformations
- Ensure data integrity and consistency
- Write tests ONLY for critical data integrity

**Approach:**
- Data integrity first, performance second
- Use appropriate indexes and constraints
- Write efficient, scalable queries
- Always include rollback strategy for migrations
- Test only what could lose or corrupt data

---

### 3. Shipper Agent

**Purpose:** Complete pipeline ownership — git, testing, building, deployment

**Configuration:**
- Model: Sonnet
- Permission Mode: acceptEdits (unblocked pipeline access)
- Tools: Bash, Read, Grep, Glob

**Key Responsibilities:**
- Handle all git operations (branches, commits, pushes, merges)
- Run test suites and report results
- Build and deploy applications
- Create PRs with comprehensive descriptions
- Monitor deployment health, rollback if needed

**Approach:**
- Atomic commits with conventional format
- Keep main branch always deployable
- Use feature branches for all development
- Zero-downtime deployments
- Quick rollback capability

---

### 4. Reviewer Agent

**Purpose:** Pragmatic code quality checks

**Configuration:**
- Model: Sonnet
- Permission Mode: plan (read-only enforcement)
- Tools: Read, Grep, Glob, Bash

**Key Responsibilities:**
- Identify security vulnerabilities (BLOCKING)
- Catch obvious bugs (non-blocking)
- Flag performance bottlenecks (non-blocking)
- Spot code that will cause future problems (non-blocking)

**Approach:**
- Focus on high-impact issues only
- Skip style nitpicks
- Provide actionable feedback with file:line references
- Only block deployment for security issues

---

### 5. Documentor Agent

**Purpose:** Create, maintain, and organize codebase documentation

**Configuration:**
- Model: Sonnet
- Tools: Read, Write, Edit, Glob, Grep, Bash

**Key Responsibilities:**
- Create and maintain structured docs/ folder with table of contents
- Generate documentation from code analysis
- Update documentation when code changes
- Cross-link related documents and maintain navigation

**Approach:**
- Initialize full documentation with `initialize-documentation`
- Maintain documentation with `update-docs` after changes
- Use kebab-case file naming, clear structure
- Cross-link generously with relative paths

---

## Agent Teams Coordination

### Task List Model

Skills create tasks with explicit dependencies. Example for `/ship`:

```
Task 1: Create feature branch          → shipper        [no deps]
Task 2: Implement feature              → full-stack-dev [blocked by 1]
Task 3: Implement data layer changes   → database-admin [blocked by 1]
Task 4: Commit changes                 → shipper        [blocked by 2, 3]
Task 5: Review implementation          → reviewer       [blocked by 4]
Task 6: Run test suite                 → shipper        [blocked by 5]
Task 7: Update documentation           → documentor     [blocked by 6]
Task 8: Deploy and create PR           → shipper        [blocked by 6, 7]
```

Tasks 2 and 3 run in parallel. The shipper waits for both before committing.

### Communication Flow

1. **Skill invoked** → Team lead creates team and spawns teammates
2. **Tasks created** → Agents check `TaskList` for assigned work
3. **Agents work** → Each agent completes tasks and marks them done
4. **Dependencies resolve** → Blocked tasks become available automatically
5. **Documentor updates** → Documentation is updated before final PR/deploy step
6. **Completion** → Team lead sends shutdown requests, cleans up team

---

## Workflow Skills

### `/ship` — Build and Deploy Features

**Purpose:** Feature branch → implement → commit → review → test → deploy → PR/merge

**Team:** shipper, full-stack-developer, database-admin (conditional), reviewer, documentor

**Flow:**
1. **Shipper** creates feature branch `feature/<name>`
2. **Full Stack Developer** and/or **Database Admin** implement (parallel)
3. **Shipper** commits with conventional message
4. **Reviewer** validates implementation
5. **Shipper** runs full test suite
6. If tests fail → developers fix, shipper re-tests (loop)
7. **Documentor** updates documentation for feature changes
8. **Shipper** deploys and creates PR

---

### `/fix` — Emergency Bug Fixes

**Purpose:** Fast-track hotfix: diagnose → patch → deploy

**Team:** shipper, full-stack-developer, database-admin (conditional), documentor

**Flow:**
1. **Shipper** creates hotfix branch `hotfix/<issue-id>`
2. **Developer(s)** diagnose and implement minimal fix (parallel if both needed)
3. **Shipper** commits with `fix:` prefix
4. **Shipper** runs focused tests and deploys
5. **Documentor** updates docs if fix affects documented behavior
6. **Shipper** merges hotfix to main

**No reviewer step** — speed is priority for emergencies.

---

### `/cleanup` — Technical Debt and Refactoring

**Purpose:** Analyze → refactor → validate

**Team:** shipper, reviewer, full-stack-developer, database-admin (conditional), documentor

**Flow:**
1. **Shipper** creates branch `refactor/<area>`
2. **Reviewer** analyzes for code smells, bottlenecks, opportunities
3. **Developer(s)** refactor based on findings (parallel)
4. **Shipper** commits refactoring changes
5. **Shipper** tests and validates
6. **Documentor** updates documentation for refactoring changes
7. **Shipper** creates PR

---

### `/test` — Batch Test and Fix

**Purpose:** Run all tests, batch-fix failures, verify

**Team:** shipper, full-stack-developer, database-admin, reviewer, documentor

**Flow:**
1. **Shipper** creates branch `test/<timestamp>`
2. **Shipper** runs full suite, compiles failure report
3. **Developer(s)** fix failures (parallel, dynamic sub-tasks)
4. **Shipper** commits fixes
5. **Shipper** re-tests → loop if still failing
6. **Shipper** runs full validation
7. **Reviewer** validates fixes
8. **Documentor** updates docs if fixes affect documented behavior
9. **Shipper** creates PR with test report

---

### `/add-tests` — Critical Test Coverage

**Purpose:** Add tests for CRITICAL functionality only

**Team:** shipper, reviewer, full-stack-developer, database-admin (conditional), documentor

**Flow:**
1. **Shipper** creates branch `test/critical-coverage-<area>`
2. **Reviewer** identifies critical untested paths
3. **Developer(s)** write minimal tests (parallel)
4. **Shipper** runs full suite
5. **Documentor** updates documentation for new test coverage
6. **Shipper** commits and creates PR

**Philosophy:** Test the 20% that prevents 80% of disasters.

---

## Plugin Format

This system is distributed as a Claude Code Plugin:

```
.claude-plugin/plugin.json    # Plugin manifest
agents/                       # Agent definitions
skills/                       # Workflow skills
hooks/hooks.json              # Quality gates
settings.json                 # Plugin settings
```

Install with: `claude --plugin-dir /path/to/agent-orchestration-system`

---

## Key Principles

### Speed and Efficiency
- **Parallel Work:** Agents with worktree isolation work simultaneously
- **Shared Task List:** Dependencies auto-resolve, no manual handoffs
- **Fail Fast:** Any agent can halt the workflow for critical issues

### Minimal Testing Philosophy
- **Test the critical 20% that prevents 80% of disasters**
- **Critical = anything that could:**
  - Break authentication or authorization
  - Lose or corrupt user data
  - Break payments or money flow
  - Cause a production outage
- **Skip tests for:** UI formatting, nice-to-haves, non-production edge cases
- **Time-boxed testing:** Hours, not days

### Pipeline Ownership (Shipper Agent)
- **Complete Ownership:** One agent owns git → test → build → deploy
- **Clean History:** Meaningful commits with conventional format
- **Branch Strategy:** Feature branches for dev, hotfix for emergencies
- **Automated Pipeline:** Testing and deployment fully automated

### Quality Without Bureaucracy
- **Non-blocking reviews:** Reviewer suggestions don't stop deployment (except security)
- **Speed focus:** `/fix` is fastest, `/ship` is balanced, `/cleanup` and `/test` are thorough
- **Pragmatic reviews:** Focus on what matters, skip the nitpicks

### Dual-Mode Operation
- **Agent Teams (recommended):** Full parallel execution with shared task list
- **Sequential fallback:** Same workflow via Task() calls, works everywhere
