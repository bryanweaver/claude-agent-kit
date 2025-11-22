---
allowed-tools: Task
argument-hint: [area or functionality to test]
description: Add critical test coverage - tests ONLY for functionality that could cause production issues
---

# Add Critical Tests: $ARGUMENTS

## Objective

Add tests ONLY for critical functionality that could cause production issues in: **$ARGUMENTS**

## Workflow

You will coordinate the lean agile team following the `/add-tests` workflow:

1. **Test Branch** (Shipper)

   - Create branch: `test/critical-coverage-[area]`
   - Set up clean environment

2. **Identify CRITICAL Test Gaps** (Reviewer)

   - Focus ONLY on untested code that could:
     - Cause data loss or corruption
     - Break authentication/authorization
     - Impact payments or financial transactions
     - Cause production outages
   - IGNORE non-critical gaps:
     - UI formatting and styling
     - Nice-to-have features
     - Rare edge cases
     - Anything that can be quickly fixed if it breaks

3. **Write Minimal Tests** (Full Stack Developer and/or Database Admin)

   - Write the MINIMUM tests to prevent disasters
   - Full Stack: auth flows, payment processing, core business logic
   - Database Admin: data integrity, critical migrations
   - Time-boxed effort (hours, not days)
   - Skip comprehensive coverage in favor of critical protection

4. **Run New Test Suite** (Shipper)

   - Execute all tests including new ones
   - Confirm critical paths are now protected

5. **Commit and Merge** (Shipper)
   - Commit with description of critical risks now covered
   - Create PR focusing on production safety improvements
   - Merge to main

## Instructions for Main Orchestrator

Use the Task tool to add critical test coverage:

- Launch shipper agent for branch creation
- Use reviewer agent to identify CRITICAL gaps only
- Launch developers to write minimal disaster-prevention tests
- Use shipper agent for final validation and merge

Remember the testing philosophy:

- Test the critical 20% that prevents 80% of disasters
- Time-boxed effort - don't spend days on coverage
- Focus on: auth, data integrity, payments, production stability
- Skip: UI, nice-to-haves, edge cases, quick-fix issues
