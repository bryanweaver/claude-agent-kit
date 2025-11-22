---
allowed-tools: Task
argument-hint: [optional test focus area]
description: Batch test and fix - run comprehensive tests, identify all issues, then fix systematically
---

# Test Suite: $ARGUMENTS

## Objective

Run comprehensive tests, identify all issues, then fix systematically. Focus area: **$ARGUMENTS**

## Workflow

You will coordinate the lean agile team following the `/test` workflow:

### Phase 1: Discovery

1. **Test Branch** (Shipper)

   - Create branch: `test/[timestamp]`
   - Ensure clean working directory

2. **Run Complete Test Suite** (Shipper)
   - Execute ALL tests to completion
   - Collect all failures and errors
   - Compile comprehensive failure report
   - Report full list to orchestrator

### Phase 2: Fix Assignment

3. **Process Failure Report** (Main Orchestrator)

   - Create TODO list from all failures
   - Prioritize fixes by impact/dependency
   - Assign fixes to appropriate developers

4. **Fix Issues** (Full Stack Developer and/or Database Admin)
   - Work through assigned failures
   - Full Stack: application logic, API, frontend issues
   - Database Admin: query failures, schema issues, data integrity
   - Implement fixes with appropriate tests
   - Report completion for each fix

### Phase 3: Verification

5. **Commit Fixes** (Shipper)

   - Create atomic commits for each fix
   - Format: `fix: [test-name] - [brief description]`

6. **Re-run Failed Tests** (Shipper)
   - Execute just the previously failed tests
   - If any still fail → report back for additional fixes
   - If all pass → proceed to final validation

### Phase 4: Final Validation

7. **Complete Test Suite** (Shipper)

   - Full test run to ensure no regressions
   - Confirm all tests passing

8. **Validate Fixes** (Reviewer)

   - Review code changes made for fixes
   - Ensure fixes are appropriate
   - Check for any introduced issues

9. **Finalize** (Shipper)
   - Create PR with test report and fixes
   - Merge to main after approval

## Instructions for Main Orchestrator

Use the Task tool to coordinate batch testing:

- Launch shipper agent for initial test run
- Process failure report and create fix assignments
- Launch multiple agents in parallel for fixes
- Use shipper agent for verification and final validation
- Focus on fixing ALL issues before proceeding

Remember: Discover all problems first, then fix systematically.
