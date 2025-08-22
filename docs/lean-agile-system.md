# Lean Agile Development System

## Philosophy
**Ship fast, learn faster.** Minimal agents, rapid iteration, continuous deployment, parallel workflows.

## The Lean Team (5 Core Agents)

### 1. **Builder Agent**
**Purpose:** Rapid feature implementation across the full stack

**Key Responsibilities:**
- Write working code quickly (frontend, backend, database)
- Implement features end-to-end
- Create minimal viable tests for critical paths
- Add clear TODOs for technical debt
- Prefer simple, working solutions over complex architectures

**Approach:**
- Make it work first, optimize later
- Ship in small, deployable increments
- Write self-documenting code
- Keep dependencies minimal

**Tools Needed:** Read, Write, Edit, MultiEdit, Bash, Grep, Glob

---

### 2. **Shipper Agent**
**Purpose:** Automated testing, building, and deployment

**Key Responsibilities:**
- Run test suites and fail fast on errors
- Build and package applications
- Deploy to appropriate environments (dev/staging/prod)
- Monitor initial deployment health
- Execute rollbacks when critical issues detected

**Approach:**
- Automate everything possible
- Zero-downtime deployments
- Quick rollback capability
- Clear deployment logs

**Tools Needed:** Bash, Read, Grep

---

### 3. **Reviewer Agent**
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

### 4. **Fixer Agent**
**Purpose:** Rapid debugging and issue resolution

**Key Responsibilities:**
- Reproduce reported issues
- Identify root causes quickly
- Apply minimal, targeted fixes
- Verify fixes work correctly
- Add regression tests

**Approach:**
- Fix first, refactor later
- Minimal change for maximum impact
- Document the issue and fix
- Learn from failures

**Tools Needed:** Read, Edit, Bash, Grep, Glob

---

### 5. **DevOps Agent**
**Purpose:** Manage all git operations and version control

**Key Responsibilities:**
- Handle all git commits with clear, conventional messages
- Create and manage branches (feature, hotfix, release)
- Push/pull from remote repositories
- Create pull requests with comprehensive descriptions
- Handle merge conflicts
- Tag releases and versions
- Ensure git history stays clean and meaningful

**Approach:**
- Atomic commits (one logical change per commit)
- Descriptive commit messages following conventional format
- Keep main branch always deployable
- Use feature branches for all development
- Automate PR creation with context
- Never force push to main

**Tools Needed:** Bash (for git commands), Read

---

## Command Workflows

### `/ship` - Build and Deploy Features
**Purpose:** Implement new features or enhancements from start to production

**Workflow:**
1. **DevOps** creates feature branch
   - Creates branch from main: `feature/[feature-name]`
   - Sets up tracking with remote
   
2. **Builder** implements the feature
   - Creates/modifies code files
   - Writes minimal tests for critical paths
   - Ensures code runs locally
   
3. **DevOps** commits changes
   - Creates atomic commits with clear messages
   - Pushes to feature branch
   
4. **Shipper** deploys the feature
   - Runs existing test suite
   - Builds the application
   - Deploys to staging
   - Runs smoke tests
   - Deploys to production (if tests pass)
   
5. **Reviewer** validates the implementation
   - Reviews code for security issues
   - Identifies potential bugs
   - Flags performance concerns
   - Creates TODOs for improvements (non-blocking)
   
6. **DevOps** creates PR and merges
   - Creates PR with description and test results
   - Merges to main after approval
   - Tags release if needed

---

### `/fix` - Emergency Bug Fixes
**Purpose:** Rapidly diagnose and fix production issues

**Workflow:**
1. **DevOps** creates hotfix branch
   - Creates branch from main: `hotfix/[issue-id]`
   
2. **Fixer** diagnoses and patches
   - Reproduces the issue
   - Identifies root cause
   - Implements minimal fix
   - Adds regression test
   
3. **DevOps** commits fix
   - Commits with message: `fix: [description] (fixes #[issue-id])`
   - Pushes to hotfix branch
   
4. **Shipper** fast-tracks deployment
   - Runs focused tests on fix
   - Skips full suite for speed
   - Deploys directly to production
   - Monitors for immediate issues
   - Ready to rollback if needed
   
5. **DevOps** merges hotfix
   - Creates PR for audit trail
   - Merges to main
   - Tags as patch release

---

### `/cleanup` - Technical Debt and Refactoring
**Purpose:** Improve code quality, performance, and maintainability

**Workflow:**
1. **DevOps** creates cleanup branch
   - Creates branch: `refactor/[area-name]`
   
2. **Reviewer** identifies improvements
   - Scans for code smells
   - Finds performance bottlenecks
   - Lists refactoring opportunities
   - Prioritizes by impact
   
3. **Builder** refactors code
   - Implements improvements
   - Maintains functionality
   - Updates tests as needed
   - Documents changes
   
4. **DevOps** commits refactoring
   - Creates clear commits for each logical change
   - Uses conventional commit format: `refactor: [description]`
   
5. **Shipper** validates changes
   - Runs full test suite
   - Checks performance metrics
   - Deploys to staging first
   - Monitors for regressions
   - Deploys to production if stable
   
6. **DevOps** completes merge
   - Creates PR with before/after metrics
   - Merges after review

---

### `/test` - Parallel Test and Fix Workflow
**Purpose:** Run comprehensive tests with immediate fixes, maximizing parallel work

**Workflow:**

#### Initial Phase
1. **DevOps** prepares test branch
   - Creates branch: `test/[timestamp]`
   - Ensures clean working directory
   
2. **Shipper** starts running test suite
   - Begins executing all tests
   - **AS SOON AS** a test fails → reports failure to main agent
   - Continues running remaining tests in parallel
   - Keeps reporting each failure as discovered

#### Parallel Execution Phase
3. **For each reported failure:**
   - **Main agent** immediately assigns to **Builder**
   - **Builder** works on fix:
     - Reproduces the specific failure
     - Implements fix for that functionality
     - Writes/updates unit test
     - Reports completion back to main agent
   - **DevOps** commits each fix:
     - Creates atomic commit: `fix: [test-name] failing due to [reason]`
     - Keeps fixes separate for easy tracking
   
4. **Meanwhile, Shipper continues:**
   - Running remaining untested code
   - Discovering additional failures
   - Reporting each to main agent
   - Tracking which tests are pending fixes

#### Re-test Phase
5. **As Builder completes each fix:**
   - **Main agent** queues the fix for re-testing
   - **Shipper** (when available) re-runs the specific fixed test
   - If passes → marks as resolved
   - If fails → cycles back to Builder with details

#### Completion Phase
6. **When all tests run and all fixes verified:**
   - **Reviewer** does final check:
     - Reviews all fixes made
     - Ensures no regression introduced
     - Validates test coverage
   - **Shipper** runs one final full suite to confirm
   - **DevOps** finalizes:
     - Squashes fix commits if desired
     - Creates PR with test report
     - Merges to main

#### The Flow Visualized:
```
Shipper: Run test 1 ✓
Shipper: Run test 2 ✗ → Report to main
Shipper: Run test 3 ✓     ↓
Shipper: Run test 4 ✗ → Report → Builder: Fix test 2 issue
Shipper: Run test 5 ✓            Builder: Fix test 4 issue
    ↓                               ↓
DevOps: Commit fixes            (working in parallel)
    ↓
Shipper: Re-test 2 ✓
Shipper: Re-test 4 ✓
    ↓
DevOps: Create PR with all fixes
```

---

## Key Principles

### Speed and Efficiency
- **Atomic Steps:** Each agent completes their task fully before handoff
- **Clear Handoffs:** Each agent's output becomes the next agent's input  
- **Parallel Work:** Multiple agents can work simultaneously when possible
- **Fail Fast:** Any agent can halt the workflow if critical issues found

### Git and Version Control (via DevOps Agent)
- **Clean History:** Meaningful commits that tell a story
- **Branch Strategy:** Feature branches for development, hotfix for emergencies
- **PR Process:** All changes go through PRs for audit trail
- **Conventional Commits:** Consistent format for automation and clarity

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
4. **Audit Trail:** Complete git history via DevOps agent
5. **Flexibility:** Commands can be combined for different workflows
6. **Scalability:** Easy to add new agents or commands as needed

---

## Example Day in the Life

```bash
> /ship add user authentication
# DevOps creates feature/user-auth branch
# Builder implements auth in 20 mins
# DevOps commits with clear message
# Shipper deploys to staging
# Reviewer suggests improvements (non-blocking)
# DevOps creates PR and merges
# Feature live in 30 mins

> /fix users can't log in
# DevOps creates hotfix/login-issue branch
# Fixer identifies missing env var
# DevOps commits fix
# Shipper deploys in 5 mins
# DevOps merges hotfix

> /test
# DevOps creates test branch
# Shipper finds 3 failing tests
# Builder fixes in parallel
# DevOps commits each fix
# Shipper re-runs and confirms
# DevOps creates PR with report
# All tests green in 15 mins

> /cleanup authentication module
# DevOps creates refactor/auth-cleanup branch
# Reviewer finds N+1 query and code duplication
# Builder refactors and adds caching
# DevOps commits changes
# Shipper validates performance improvement
# DevOps merges with metrics
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
- DevOps agent can always rollback if needed

### Metrics and Monitoring
- Track cycle time for each command
- Monitor failure rates and recovery time
- Measure deployment frequency
- Calculate mean time to recovery (MTTR)

This lean system prioritizes shipping working software over perfect software, learning from real users over lengthy planning, and rapid iteration over big releases - all while maintaining a clean, auditable git history through the DevOps agent.