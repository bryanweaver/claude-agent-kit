---
allowed-tools: Task
argument-hint: [issue description or bug report]
description: Emergency bug fixes - rapidly diagnose and fix production issues
---

# Fix Issue: $ARGUMENTS

## Objective

Rapidly diagnose and fix the production issue: **$ARGUMENTS**

## Workflow

You will coordinate the lean agile team to fix this issue following the `/fix` workflow:

1. **Hotfix Branch** (Shipper)

   - Create branch from main: `hotfix/[issue-id]`
   - Set up for rapid deployment

2. **Diagnose and Patch** (Full Stack Developer or Database Admin)

   - Reproduce the issue
   - Identify root cause
   - Implement minimal fix (no refactoring)
   - Add regression test to prevent recurrence

3. **Commit Fix** (Shipper)

   - Commit with message: `fix: [description] (fixes #[issue-id])`
   - Push to hotfix branch

4. **Fast-track Deployment** (Shipper)

   - Run focused tests on fix only
   - Skip full test suite for speed
   - Deploy directly to production
   - Monitor for immediate issues
   - Ready to rollback if needed

5. **Merge Hotfix** (Shipper)
   - Create PR for audit trail
   - Merge to main
   - Tag as patch release

## Instructions for Main Orchestrator

Use the Task tool to launch agents for rapid response:

- Start with shipper agent for hotfix branch
- Launch full-stack-developer or database-admin based on issue type
- Use shipper agent for quick deployment
- Focus on speed: minimal fix, focused testing, rapid deployment

Remember: Fix first, refactor later. Get production working ASAP.
