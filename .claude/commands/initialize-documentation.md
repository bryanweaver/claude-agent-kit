---
allowed-tools: Task
argument-hint: [optional: specific area to document]
description: Initialize comprehensive documentation for the codebase
---

# Initialize Documentation: $ARGUMENTS

## Objective

Create comprehensive, well-organized documentation for the codebase by analyzing its structure, functionality, and architecture.

## Workflow

You will coordinate the documentor agent to create initial documentation following the `/initialize-documentation` workflow:

1. **Create Documentation Structure** (Documentor)

   - Create `docs/` folder if it doesn't exist
   - Set up standard folder hierarchy:
     - `docs/README.md` (main table of contents)
     - `docs/architecture/` (system design docs)
     - `docs/api/` (API documentation)
     - `docs/components/` (component documentation)
     - `docs/guides/` (how-to guides)
     - `docs/reference/` (reference materials)

2. **Analyze Codebase** (Documentor)

   - Scan project structure and identify key modules
   - Identify entry points and main application flow
   - Map dependencies and relationships between components
   - Understand configuration and environment setup
   - Note any existing documentation or comments

3. **Generate Documentation** (Documentor)

   - Create architecture overview document
   - Document each major module/component
   - Generate API documentation if applicable
   - Create getting started guide
   - Write configuration reference
   - Add cross-links between related documents

4. **Create Table of Contents** (Documentor)

   - Generate `docs/README.md` with organized links
   - Group documents by category
   - Add brief descriptions for each document
   - Include quick navigation section

## Target Area

$ARGUMENTS

If a specific area is provided, focus documentation on that area. Otherwise, document the entire codebase.

## Instructions for Main Orchestrator

Use the Task tool to launch the documentor agent:

- Launch documentor agent with instruction to initialize documentation
- If $ARGUMENTS specifies an area, focus on that area
- Otherwise, perform full codebase documentation
- Ensure all generated docs follow markdown best practices
- Verify cross-links work correctly

The documentor will analyze the codebase thoroughly and create a complete documentation library organized for easy navigation and maintenance.

## Expected Output

After completion, the docs/ folder should contain:
- Organized markdown files covering all major functionality
- A main README.md serving as table of contents
- Cross-linked documents for easy navigation
- Clear, concise explanations of how the codebase works
