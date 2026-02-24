---
allowed-tools: Task
argument-hint: [area or module to refactor]
description: Technical debt and refactoring - improve code quality and performance
---

# Cleanup: $ARGUMENTS

## Objective

Improve code quality, performance, and maintainability for: **$ARGUMENTS**

## Workflow

You will coordinate the lean agile team to cleanup this area following the `/team-cleanup` workflow:

1. **Cleanup Branch** (Shipper)

   - Create branch: `refactor/[area-name]`
   - Prepare for systematic improvements

2. **Identify Improvements** (Reviewer)

   - Scan for code smells
   - Find performance bottlenecks
   - List refactoring opportunities
   - Prioritize by impact

3. **Refactor Code** (Full Stack Developer or Database Admin)

   - Implement improvements
   - Maintain functionality (no behavior changes)
   - Update tests as needed
   - Document significant changes

4. **Commit Refactoring** (Shipper)

   - Create clear commits for each logical change
   - Use format: `refactor: [description]`

5. **Test and Validate** (Shipper)

   - Run full test suite
   - Check performance metrics
   - Monitor for regressions

6. **Documentation Update** (Documentor)
   - Check if refactoring affects existing documentation
   - Update docs if code structure/architecture changed
   - Update any outdated code examples in docs
   - Commit documentation changes to refactor branch

7. **Complete Merge** (Shipper)
   - Create PR with before/after metrics
   - Document performance improvements
   - Merge after review

## Instructions for Main Orchestrator

Use the Task tool to launch agents for systematic improvement:

- Start with shipper agent for branch creation
- Launch reviewer agent to analyze code
- Use full-stack-developer or database-admin for refactoring
- Launch shipper agent for testing
- Launch documentor agent to update any affected documentation
- Launch shipper agent to create PR and merge

Focus on high-impact improvements, skip minor nitpicks.
