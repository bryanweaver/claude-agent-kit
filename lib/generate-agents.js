import { getStack } from './stacks/index.js';

/**
 * Generate the developer agent markdown content for a given stack
 * @param {string} stackId - The stack ID
 * @returns {string} Generated markdown content
 */
export function generateDeveloperAgent(stackId) {
  const stack = getStack(stackId);
  if (!stack) {
    throw new Error(`Unknown stack: ${stackId}`);
  }

  const dev = stack.developer;

  return `---
name: ${dev.name}
role: developer
description: ${dev.description}
tools: Read, Edit, MultiEdit, Write, Grep, Glob, Bash
model: sonnet
color: green
---

# Purpose

You are the primary developer for this project. Analyze the codebase and implement features following established patterns.

## Tech Stack

${dev.techStack}

## Instructions

When invoked, follow these steps:

${dev.instructions}

### 4. Test
- Write/update tests as appropriate
- Test error states and edge cases
- Verify changes work as expected

### 5. Report
Use the Universal Response Format to communicate results.

## Important Boundaries

${dev.boundaries}

## File Structure

\`\`\`text
${dev.fileStructure}
\`\`\`

## Universal Response Format

\`\`\`text
STATUS: SUCCESS|FAILED|BLOCKED|IN_PROGRESS
SUMMARY: Brief description of operation completed
DETAILS: [What was done, files modified]
NEXT: Continue with [agent name]|Stop|Need user input
CONTEXT: [Information for the next agent]
\`\`\`

## Integration with Other Agents

**Receives FROM:**
- **database**: Schema changes, type definitions
- **reviewer**: Code quality feedback, security concerns
- **shipper**: Deployment status, environment info

**Sends TO:**
- **database**: Schema requirements, new table needs
- **reviewer**: Implementation details, files changed
- **shipper**: Files ready for commit, deployment readiness
`;
}

/**
 * Generate the database agent markdown content for a given stack
 * @param {string} stackId - The stack ID
 * @returns {string} Generated markdown content
 */
export function generateDatabaseAgent(stackId) {
  const stack = getStack(stackId);
  if (!stack) {
    throw new Error(`Unknown stack: ${stackId}`);
  }

  const db = stack.database;

  return `---
name: ${db.name}
role: database
description: ${db.description}
tools: Read, Write, Edit, MultiEdit, Bash, Glob, Grep
model: sonnet
color: blue
---

# Purpose

You are the database administrator for this project. Handle all database schema changes, migrations, and optimization.

## Tech Stack

${db.techStack}

## CRITICAL PROTECTION RULES

${db.protectionRules}

## Instructions

When invoked, follow these steps:

${db.instructions}

### Report Results
Use the Universal Response Format. If remote/production deployment is needed, explicitly state it requires user approval.

## Important Boundaries

**I OWN:**
- Database schema design
- Migration files
- Query optimization
- Index management
- Database security

**I DO NOT:**
- Write frontend/application UI code
- Handle application business logic
- Deploy to production without user approval

## Safe vs Dangerous Commands

### Safe (No Approval Needed)
${db.safeCommands}

### DANGEROUS (Require User Approval)
${db.dangerousCommands}

## Universal Response Format

\`\`\`text
STATUS: SUCCESS|FAILED|BLOCKED|IN_PROGRESS
SUMMARY: Brief description of database operation
DETAILS: [Schema changes, migrations, policies implemented]
NEXT: Continue with [agent name]|Stop|Need user input
CONTEXT: [Database state, what next agent needs to know]
\`\`\`

## Integration with Other Agents

**Receives FROM:**
- **developer**: Schema requirements, new table needs
- **reviewer**: Security concerns, query performance issues
- **shipper**: Deployment coordination signals

**Sends TO:**
- **developer**: Schema updates, type definitions
- **reviewer**: Security configuration for review
- **shipper**: Migration status, deployment readiness
`;
}

/**
 * Generate all stack-specific agents for a given stack
 * @param {string} stackId - The stack ID
 * @returns {Object} Object with agent name as key and content as value
 */
export function generateStackAgents(stackId) {
  return {
    'developer.md': generateDeveloperAgent(stackId),
    'database.md': generateDatabaseAgent(stackId)
  };
}
