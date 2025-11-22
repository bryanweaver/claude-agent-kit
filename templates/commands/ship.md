---
allowed-tools: Task
argument-hint: [feature description]
description: Build and deploy features from start to production
---

# Ship Feature: $ARGUMENTS

## Objective

Implement and deploy the feature: **$ARGUMENTS**

## Workflow

You will coordinate the lean agile team to implement this feature following the `/ship` workflow:

1. **Branch Creation** (Shipper)

   - Create feature branch: `feature/[feature-name]`
   - Set up tracking with remote

2. **Implementation** (Full Stack Developer + Database Admin)

   - Implement the feature end-to-end
   - Create/modify code files across all layers
   - Handle schema/query changes if needed
   - Write minimal tests for critical paths only
   - Ensure code runs locally

3. **Commit Changes** (Shipper)

   - Create atomic commits with clear messages
   - Push to feature branch

4. **Code Review** (Reviewer)

   - Review for security issues
   - Identify potential bugs
   - Flag performance concerns
   - Create TODOs for improvements (non-blocking)

5. **Test Suite** (Shipper)

   - Run full test suite
   - If tests pass → proceed to deployment
   - If tests fail → fix regressions

6. **Deployment** (Shipper)
   - Deploy to staging
   - Run smoke tests
   - Deploy to production
   - Create PR with description and test results
   - Merge to main after approval
   - Tag release if needed

## Instructions for Main Orchestrator

Use the Task tool to launch the appropriate agents in sequence:

- Start with shipper agent to create the branch
- Launch full-stack-developer agent for implementation
- Use database-admin agent if data layer changes are needed
- Launch shipper agent for commits and testing
- Launch reviewer agent for code review
- Launch shipper agent for final deployment

Follow the lean philosophy: Ship fast, learn faster. Focus on working code over perfect code.
