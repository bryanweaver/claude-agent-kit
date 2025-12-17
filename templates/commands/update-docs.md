---
allowed-tools: Task
argument-hint: [optional: specific changes to document or 'auto' for git diff]
description: Update documentation to reflect recent code changes
---

# Update Documentation: $ARGUMENTS

## Objective

Analyze recent code changes and update existing documentation to reflect the current state of the codebase.

## Workflow

You will coordinate the documentor agent to update documentation following the `/update-docs` workflow:

1. **Identify Changes** (Documentor)

   - If $ARGUMENTS is 'auto' or empty, analyze git diff to find recent changes
   - If $ARGUMENTS describes specific changes, focus on those areas
   - List all modified files and their nature (new, modified, deleted)
   - Identify which functional areas are affected

2. **Analyze Documentation Impact** (Documentor)

   - Review existing documentation in docs/ folder
   - Map code changes to relevant documentation sections
   - Identify docs that need updates
   - Identify if new documentation is required
   - Note any docs that should be removed (deleted features)

3. **Update Documentation** (Documentor)

   - Update affected documentation files
   - Add new documentation for new features
   - Remove or archive documentation for removed features
   - Update code examples if they changed
   - Ensure accuracy of all affected sections

4. **Maintain Consistency** (Documentor)

   - Update cross-links if document structure changed
   - Update table of contents (docs/README.md) if needed
   - Verify all links still work
   - Ensure consistent terminology and formatting

## Target Changes

$ARGUMENTS

Options:
- `auto` - Automatically detect changes via git diff
- Empty - Same as auto
- Specific description - Focus on described changes

## Instructions for Main Orchestrator

Use the Task tool to launch the documentor agent:

- Launch documentor agent with instruction to update documentation
- Pass the $ARGUMENTS to specify what changes to analyze
- Ensure documentor compares code state to existing docs
- Verify updated docs accurately reflect code behavior

The documentor will systematically review changes and update all affected documentation to maintain accuracy.

## Expected Output

After completion:
- All affected documentation is updated
- New features are documented
- Removed features have documentation removed/archived
- Table of contents reflects current structure
- All cross-links verified working
