# Lean Agile Development System

## Philosophy
**Ship fast, learn faster.** Minimal agents, rapid iteration, continuous deployment, parallel workflows.

## The Lean Team (4 Core Agents)

### 1. **Full Stack Developer Agent**
**Purpose:** Rapid feature implementation and bug fixes across the entire stack

**Key Responsibilities:**
- Write working code quickly (frontend, backend, APIs, integrations)
- Implement features end-to-end
- Debug and fix issues across all layers
- Write minimal tests for CRITICAL functionality only (auth, payments, core business logic)
- Add regression tests ONLY for bugs that could recur in production
- Add clear TODOs for technical debt
- Prefer simple, working solutions over complex architectures
- Apply targeted fixes for production issues

**Approach:**
- Make it work first, optimize later
- Ship in small, deployable increments
- Write self-documenting code
- Keep dependencies minimal
- Fix first, refactor later when debugging
- Minimal change for maximum impact
- Test only what could break production

**Tools Needed:** Read, Write, Edit, MultiEdit, Bash, Grep, Glob

---

### 2. **Database Admin Agent**
**Purpose:** Database design, optimization, and data layer implementation

**Key Responsibilities:**
- Design and implement database schemas
- Write and optimize queries
- Handle migrations and data transformations
- Implement data access layers and ORMs
- Write tests ONLY for critical data integrity (no data loss, no corruption)
- Test migrations that could break production
- Debug data-related issues
- Ensure data integrity and consistency
- Optimize database performance
- Create database backups and recovery procedures
- Fix data corruption or query issues

**Approach:**
- Data integrity first, performance second
- Use appropriate indexes and constraints
- Write efficient, scalable queries
- Document schema changes clearly
- Quick fixes for data issues when needed
- Monitor and optimize slow queries
- Test only what could lose or corrupt data

**Tools Needed:** Read, Write, Edit, MultiEdit, Bash, Grep, Glob

---

### 3. **Shipper Agent**
**Purpose:** Complete pipeline ownership - git operations, testing, building, and deployment

**Key Responsibilities:**
- Handle all git commits with clear, conventional messages
- Create and manage branches (feature, hotfix, release)
- Push/pull from remote repositories
- Create pull requests with comprehensive descriptions
- Handle merge conflicts
- Tag releases and versions
- Run test suites and fail fast on errors
- Build and package applications
- Deploy to appropriate environments (dev/staging/prod)
- Monitor initial deployment health
- Execute rollbacks when critical issues detected

**Approach:**
- Atomic commits (one logical change per commit)
- Descriptive commit messages following conventional format
- Keep main branch always deployable
- Use feature branches for all development
- Automate everything possible
- Zero-downtime deployments
- Quick rollback capability
- Clear deployment and git history logs

**Tools Needed:** Bash (for git commands and deployment), Read, Grep

---

### 4. **Reviewer Agent**
**Purpose:** Pragmatic code quality checks

**Key Responsibilities:**
- Identify security vulnerabilities
- Catch obvious bugs
- Flag performance bottlenecks
- Spot code that will cause future problems
- Suggest improvements without blocking progress

**Approach:**
- Focus on high-impact issues only
- Skip style nitpicks
- Provide actionable feedback
- Review post-deployment if needed

**Tools Needed:** Read, Grep, Glob, Bash

---

## Agent Communication Protocol

All agents communicate with the Main Orchestrator using a universal format to ensure consistent handoffs and decision-making.

### Universal Response Format
```
STATUS: SUCCESS|FAILED|BLOCKED|IN_PROGRESS
SUMMARY: Brief description of what was accomplished
DETAILS: [Agent-specific information, findings, or metrics]
NEXT: Continue with [agent name]|Stop|Need user input
CONTEXT: [Information the next agent needs to proceed]
```

### Communication Flow
1. **Main Orchestrator** invokes an agent with task and context
2. **Agent** performs work and reports back using the universal format
3. **Main Orchestrator** reads STATUS and NEXT to determine routing
4. **Main Orchestrator** passes CONTEXT to the next agent
5. **Process repeats** until workflow completes

### Example Communications

**Full Stack Developer Response:**
```
STATUS: SUCCESS
SUMMARY: Implemented user authentication feature
DETAILS: Added login/logout endpoints, JWT tokens, session management
NEXT: Continue with Database Admin
CONTEXT: Need users table with email, password_hash, created_at fields
```

**Shipper Response (Testing):**
```
STATUS: FAILED
SUMMARY: Test suite completed with 3 failures
DETAILS: Failed: auth_test.js, user_test.js, session_test.js (45/48 passing)
NEXT: Continue with Full Stack Developer
CONTEXT: auth_test fails on line 23 - expects 200 got 401, user_test fails on null check, session_test timeout
```

**Reviewer Response:**
```
STATUS: SUCCESS
SUMMARY: Code review completed, found 1 critical issue
DETAILS: SQL injection risk in user.js:45, performance suggestion for query.js:80
NEXT: Stop
CONTEXT: Critical issue should be fixed before next deployment
```

---

## Command Workflows

### `/ship` - Build and Deploy Features
**Purpose:** Implement new features or enhancements from start to production

**Workflow Diagram:**
```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│ Shipper │────►│Full Stack│────►│ Shipper │────►│ Reviewer │────►│ Shipper │
│ Branch  │     │ Dev & DB │     │ Commit  │     │  Review  │     │Run Tests│
└─────────┘     └──────────┘     └─────────┘     └──────────┘     └─────────┘
                                                                         │
                                              ┌──────────────────────────┴──────┐
                                              │                                 │
                                          [Tests Pass]                    [Tests Fail]
                                              │                                 │
                                              ▼                                 ▼
                                       ┌──────────┐                     ┌──────────┐
                                       │ Shipper  │                     │Full Stack│
                                       │Deploy &  │                     │ Fix      │
                                       │ PR/Merge │                     │Regressions│
                                       └──────────┘                     └──────────┘
```

**Workflow:**
1. **Shipper** creates feature branch
   - Creates branch from main: `feature/[feature-name]`
   - Sets up tracking with remote
   
2. **Full Stack Developer** and/or **Database Admin** implement the feature
   - Creates/modifies code files across all layers
   - Database Admin handles schema/query changes if needed
   - Writes minimal tests for critical paths
   - Ensures code runs locally
   
3. **Shipper** commits changes
   - Creates atomic commits with clear messages
   - Pushes to feature branch
   
4. **Reviewer** validates the implementation
   - Reviews code for security issues
   - Identifies potential bugs
   - Flags performance concerns
   - Creates TODOs for improvements (non-blocking)
   
5. **Shipper** runs full test suite
   - Executes all tests to check for regressions
   - If tests pass → proceed to deployment
   - If tests fail → report to Main Orchestrator
   
6. **If tests fail:** Fix regressions
   - Main Orchestrator assigns fixes to developers
   - Full Stack Developer/Database Admin fix breaking changes
   - Shipper re-runs tests until all pass
   
7. **Shipper** deploys and finalizes
   - Deploys to staging
   - Runs smoke tests
   - Deploys to production
   - Creates PR with description and test results
   - Merges to main after approval
   - Tags release if needed

---

### `/fix` - Emergency Bug Fixes
**Purpose:** Rapidly diagnose and fix production issues

**Workflow Diagram:**
```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│ Shipper │────►│Full Stack│────►│ Shipper │────►│ Shipper  │────►│ Shipper │
│ Hotfix  │     │Dev or DB │     │ Commit  │     │Quick Test│     │ Deploy  │
│ Branch  │     │  Admin   │     │   Fix   │     │  & Deploy│     │PR/Merge │
└─────────┘     └──────────┘     └─────────┘     └──────────┘     └─────────┘
                     ↑                                                    
                 [Diagnose]                                               
                 [Fix Fast]                                               
```

**Workflow:**
1. **Shipper** creates hotfix branch
   - Creates branch from main: `hotfix/[issue-id]`
   
2. **Full Stack Developer** (or **Database Admin** for data issues) diagnoses and patches
   - Reproduces the issue
   - Identifies root cause
   - Implements minimal fix
   - Adds regression test
   
3. **Shipper** commits fix
   - Commits with message: `fix: [description] (fixes #[issue-id])`
   - Pushes to hotfix branch
   
4. **Shipper** fast-tracks testing and deployment
   - Runs focused tests on fix
   - Skips full suite for speed
   - Deploys directly to production
   - Monitors for immediate issues
   - Ready to rollback if needed
   
5. **Shipper** merges hotfix
   - Creates PR for audit trail
   - Merges to main
   - Tags as patch release

---

### `/cleanup` - Technical Debt and Refactoring
**Purpose:** Improve code quality, performance, and maintainability

**Workflow Diagram:**
```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌─────────┐     ┌─────────┐
│ Shipper │────►│ Reviewer │────►│Full Stack│────►│ Shipper │────►│ Shipper │
│ Branch  │     │ Analyze  │     │Dev or DB │     │ Commit  │     │Test/Deploy│
└─────────┘     └──────────┘     └──────────┘     └─────────┘     └─────────┘
                     ↓                                                  │
              [Identify Issues]                                         ▼
              [Prioritize]                                        ┌─────────┐
                                                                  │ Shipper │
                                                                  │PR/Merge │
                                                                  └─────────┘
```

**Workflow:**
1. **Shipper** creates cleanup branch
   - Creates branch: `refactor/[area-name]`
   
2. **Reviewer** identifies improvements
   - Scans for code smells
   - Finds performance bottlenecks
   - Lists refactoring opportunities
   - Prioritizes by impact
   
3. **Full Stack Developer** (or **Database Admin** for data layer) refactors code
   - Implements improvements
   - Maintains functionality
   - Updates tests as needed
   - Documents changes
   
4. **Shipper** commits refactoring
   - Creates clear commits for each logical change
   - Uses conventional commit format: `refactor: [description]`
   
5. **Shipper** tests and validates changes
   - Runs full test suite
   - Checks performance metrics
   - Deploys to staging first
   - Monitors for regressions
   - Deploys to production if stable
   
6. **Shipper** completes merge
   - Creates PR with before/after metrics
   - Merges after review

---

### `/test` - Batch Test and Fix Workflow
**Purpose:** Run comprehensive tests, identify all issues, then fix systematically

**Workflow Diagram:**
```
     Phase 1: Discovery          Phase 2: Fix              Phase 3: Verify
┌─────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐     ┌─────────┐
│ Shipper │────►│ Shipper │────►│Full Stack│────►│ Shipper │────►│ Shipper │
│ Branch  │     │Run Tests│     │  & DB    │     │ Commit  │     │ Re-test │
└─────────┘     └─────────┘     └──────────┘     └─────────┘     └─────────┘
                     │                ↑                               │
                     ▼                │                               ▼
              ┌─────────────┐   ┌──────────┐                  ┌──────────┐
              │Failure Report│──►│   Main   │                  │Final Test│
              │  (3 failed) │   │Orchestrator│                 │   Suite  │
              └─────────────┘   └──────────┘                  └──────────┘
                                                                       │
                                                                       ▼
                                                               ┌──────────┐
                                                               │ Reviewer │──►[PR/Merge]
                                                               └──────────┘
```

**Workflow:**

#### Phase 1: Discovery
1. **Shipper** prepares test branch
   - Creates branch: `test/[timestamp]`
   - Ensures clean working directory
   
2. **Shipper** runs complete test suite
   - Executes ALL tests to completion
   - Collects all failures and errors
   - Compiles comprehensive failure report
   - Reports to Main Orchestrator with full list

#### Phase 2: Fix Assignment
3. **Main Orchestrator** processes failure report
   - Creates TODO list from all failures
   - Prioritizes fixes by impact/dependency
   - Assigns fixes to appropriate developers
   
4. **Full Stack Developer** and/or **Database Admin** fix issues
   - Work through assigned failures
   - Each developer handles their domain:
     - Full Stack: application logic, API, frontend issues
     - Database Admin: query failures, schema issues, data integrity
   - Implement fixes with appropriate tests
   - Report completion for each fix

#### Phase 3: Verification
5. **Shipper** commits all fixes
   - Creates atomic commits for each fix
   - Format: `fix: [test-name] - [brief description]`
   
6. **Shipper** re-runs failed tests only
   - Executes just the previously failed tests
   - If any still fail → reports back for additional fixes
   - If all pass → proceeds to final validation

#### Phase 4: Final Validation
7. **Shipper** runs complete test suite
   - Full test run to ensure no regressions
   - Confirms all tests passing
   
8. **Reviewer** validates fixes
   - Reviews code changes made for fixes
   - Ensures fixes are appropriate
   - Checks for any introduced issues
   
9. **Shipper** finalizes
   - Creates PR with test report and fixes
   - Merges to main after approval

---

### `/add-tests` - Add Critical Test Coverage
**Purpose:** Add tests ONLY for critical functionality that could cause production issues

**Workflow Diagram:**
```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌─────────┐     ┌─────────┐
│ Shipper │────►│ Reviewer │────►│Full Stack│────►│ Shipper │────►│ Shipper │
│ Branch  │     │ Analyze  │     │ Dev & DB │     │Run Tests│     │ Commit  │
└─────────┘     └──────────┘     └──────────┘     └─────────┘     └─────────┘
                      │                                  │              │
           [Find CRITICAL gaps]                   [Verify new]          ▼
           [Production risks]                     [tests work]    ┌─────────┐
                                                                  │ Shipper │
                                                                  │PR/Merge │
                                                                  └─────────┘
```

**Workflow:**
1. **Shipper** creates test branch
   - Creates branch: `test/critical-coverage-[area]`
   - Sets up clean environment
   
2. **Reviewer** identifies CRITICAL test gaps
   - Focuses ONLY on untested code that could:
     - Cause data loss or corruption
     - Break authentication/authorization
     - Impact payments or financial transactions
     - Cause production outages
   - IGNORES non-critical gaps (UI, nice-to-haves, rare edge cases)
   
3. **Full Stack Developer** and/or **Database Admin** write minimal tests
   - Write the MINIMUM tests to prevent disasters
   - Full Stack: auth flows, payment processing, core business logic
   - Database Admin: data integrity, critical migrations
   - Time-boxed effort (hours, not days)
   - Skip comprehensive coverage in favor of critical protection
   
4. **Shipper** runs new test suite
   - Executes all tests including new ones
   - Confirms critical paths are now protected
   
5. **Shipper** commits and merges
   - Commits with description of critical risks now covered
   - Creates PR focusing on production safety improvements
   - Merges to main

---

## Key Principles

### Speed and Efficiency
- **Atomic Steps:** Each agent completes their task fully before handoff
- **Clear Handoffs:** Each agent's output becomes the next agent's input  
- **Parallel Work:** Multiple agents can work simultaneously when possible
- **Fail Fast:** Any agent can halt the workflow if critical issues found

### Minimal Testing Philosophy
- **Test the critical 20% that prevents 80% of disasters**
- **Critical = anything that could:**
  - Break authentication or authorization
  - Lose or corrupt user data
  - Break payments or money flow
  - Cause a production outage
- **Skip tests for:**
  - UI formatting and styling
  - Nice-to-have features
  - Edge cases that won't impact production
  - Anything that can be quickly fixed if it breaks
- **Time-boxed testing:** Don't spend days on test coverage

### Pipeline and Version Control (via Shipper Agent)
- **Complete Ownership:** One agent owns git → test → build → deploy
- **Clean History:** Meaningful commits that tell a story
- **Branch Strategy:** Feature branches for development, hotfix for emergencies
- **PR Process:** All changes go through PRs for audit trail
- **Conventional Commits:** Consistent format for automation and clarity
- **Automated Pipeline:** Testing and deployment fully automated

### Quality Without Bureaucracy
- **No Blocking:** Reviewer suggestions don't stop deployment (except security)
- **Speed Focus:** `/fix` is fastest path, `/ship` is balanced, `/cleanup` and `/test` are thorough
- **Pragmatic Reviews:** Focus on what matters, skip the nitpicks

### Continuous Learning
- **Track Metrics:** Deployment frequency, lead time, MTTR
- **Learn from Failures:** Every incident improves the system
- **Iterate Constantly:** Small improvements continuously

---

## Benefits of This System

1. **Faster Delivery:** Parallel workflows and minimal handoffs
2. **Better Quality:** Continuous testing with immediate fixes
3. **Clear Accountability:** Each agent has specific responsibilities
4. **Streamlined Pipeline:** Shipper owns entire code-to-production flow
5. **Flexibility:** Commands can be combined for different workflows
6. **Scalability:** Easy to add new agents or commands as needed

---

## Example Day in the Life

```bash
> /ship add user authentication
# Shipper creates feature/user-auth branch
# Full Stack Developer implements auth in 20 mins
# Shipper commits and tests
# Shipper deploys to staging
# Reviewer suggests improvements (non-blocking)
# Shipper creates PR and merges
# Feature live in 30 mins

> /fix users can't log in
# Shipper creates hotfix/login-issue branch
# Full Stack Developer identifies missing env var
# Shipper commits fix
# Shipper tests and deploys in 5 mins
# Shipper merges hotfix

> /test
# Shipper creates test branch
# Shipper finds 3 failing tests
# Full Stack Developer fixes in parallel
# Shipper commits each fix
# Shipper re-runs and confirms
# Shipper creates PR with report
# All tests green in 15 mins

> /cleanup authentication module
# Shipper creates refactor/auth-cleanup branch
# Reviewer finds N+1 query and code duplication
# Database Admin optimizes query, Full Stack Developer removes duplication
# Shipper commits changes
# Shipper tests and validates performance improvement
# Shipper merges with metrics

> /add-tests user authentication
# Shipper creates test/add-coverage-auth branch
# Reviewer identifies missing edge cases and error paths
# Full Stack Developer writes auth failure tests
# Database Admin adds session expiry tests
# Shipper runs all tests - 100% pass
# Shipper commits and merges
# Coverage increased from 65% to 85%
```

---

## Implementation Notes

### Agent Communication
- Agents communicate through structured output
- Main agent orchestrates handoffs
- Clear status reporting from each agent

### Error Handling
- Each agent reports failures immediately
- Main agent decides on retry vs escalation
- Shipper can always rollback if needed

### Metrics and Monitoring
- Track cycle time for each command
- Monitor failure rates and recovery time
- Measure deployment frequency
- Calculate mean time to recovery (MTTR)

This lean system prioritizes shipping working software over perfect software, learning from real users over lengthy planning, and rapid iteration over big releases - all while maintaining a clean, auditable git history and automated pipeline through the unified Shipper agent.