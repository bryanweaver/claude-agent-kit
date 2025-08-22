# Agent Orchestration System

A powerful orchestration framework for Claude that enables custom commands to coordinate multiple specialized sub-agents, creating complex workflows through simple command interfaces.

## Overview

This system enables lean, agile development through custom commands that orchestrate a small team of specialized AI agents. Built on modern DevOps principles, it emphasizes rapid iteration, parallel workflows, and continuous deployment.

### Core Philosophy
**Ship fast, learn faster.** The system uses a minimal set of highly capable agents that work in parallel when possible, fail fast when issues arise, and maintain clean git workflows through dedicated DevOps automation.

### The Meta-Agent

At the core of this system is a **Meta-Agent** - a special agent capable of generating other agents. The Meta-Agent creates our lean team of specialized agents, ensuring consistency and purpose-built functionality. This self-building approach allows the system to evolve as needs change.

## Key Features

- **Lean Team**: Just 5 specialized agents (Builder, Shipper, Reviewer, Fixer, DevOps)
- **Parallel Workflows**: Agents work simultaneously when possible for maximum efficiency
- **Git-First**: Dedicated DevOps agent manages all version control automatically
- **Fail Fast**: Immediate error detection and rapid recovery
- **Custom Commands**: Simple slash commands orchestrate complex workflows
- **Hook System**: Automate workflows and enforce standards
- **Continuous Deployment**: Ship to production multiple times per day

## Architecture

```
Build Time:                          Runtime:
┌─────────────────┐                 ┌─────────────────┐
│   Meta-Agent    │                 │  Claude Code    │
│   (Builder)     │                 │  Main Agent     │
└────────┬────────┘                 └────────┬────────┘
         │                                    │
         │ generates                          │ reads & orchestrates
         ▼                                    ▼
┌─────────────────┐                 ┌─────────────────┐
│ .claude/agents/ │ ◄───────────────│    Commands     │
│   *.md files    │                 │ .claude/commands│
└─────────────────┘                 └────────┬────────┘
                                             │
                                    ┌────────┴────────┐
                                    │   orchestrates  │
                                    ▼                 ▼
                              ┌─────────────────────────────┐
                              │     The Lean Team:          │
                              │  • Builder (full-stack dev) │
                              │  • Shipper (test & deploy)  │
                              │  • Reviewer (quality check) │
                              │  • Fixer (debug & patch)     │
                              │  • DevOps (git & branches)  │
                              └─────────────────────────────┘
```

## Core Commands

### `/ship` - Build and Deploy Features
Rapid feature development from code to production:
1. **DevOps**: Creates feature branch
2. **Builder**: Implements the feature end-to-end
3. **DevOps**: Commits with conventional message
4. **Shipper**: Tests and deploys to staging/production
5. **Reviewer**: Post-deployment quality check
6. **DevOps**: Creates PR and merges

### `/fix` - Emergency Bug Fixes
Fast-track critical issue resolution:
1. **DevOps**: Creates hotfix branch
2. **Fixer**: Diagnoses and patches the issue
3. **DevOps**: Commits the fix
4. **Shipper**: Deploys directly to production
5. **DevOps**: Merges hotfix to main

### `/cleanup` - Technical Debt
Continuous improvement and refactoring:
1. **Reviewer**: Identifies code improvements
2. **Builder**: Refactors and optimizes
3. **Shipper**: Validates changes
4. **DevOps**: Commits and merges

### `/test` - Parallel Testing with Fixes
Smart testing that fixes issues in real-time:
1. **Shipper**: Runs tests, reports failures immediately
2. **Builder**: Fixes issues in parallel as they're found
3. **DevOps**: Commits each fix atomically
4. **Shipper**: Re-tests fixed issues
5. **Reviewer**: Final validation

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd agent-orchestration-system

# Install dependencies
npm install
```

### Basic Usage

1. Define your Claude Code sub-agents in `.claude/agents/`:
```markdown
---
name: test-runner
description: Runs test suites and reports results. Use proactively when code changes are made.
tools: Bash, Read, Grep, Glob
---

You are a test runner agent specialized in discovering and executing tests.

Your responsibilities:
1. Discover test files in the project
2. Identify the test framework being used
3. Run the appropriate test command
4. Parse test output for failures
5. Report results in a structured format

When tests fail:
- Identify the specific failures
- Provide error messages and stack traces
- Suggest potential fixes based on the errors

Return a clear summary of test outcomes including pass/fail counts.
```

2. Create custom slash commands that orchestrate agents:
```markdown
---
allowed-tools: Task
description: Run complete test suite with coverage analysis
argument-hint: [test-pattern]
---

# Test Workflow

Execute a comprehensive testing workflow:

1. Use the test-discovery agent to find all test files matching pattern: $ARGUMENTS
2. Use the test-runner agent to execute the discovered tests
3. Use the coverage-reporter agent to analyze code coverage
4. Summarize results and suggest improvements

Focus on:
- Identifying failing tests
- Coverage gaps
- Performance issues
- Flaky test detection
```

3. Commands are automatically available:
```bash
# Create command files in .claude/commands/
.claude/commands/test.md     # Creates /test command
.claude/commands/build.md    # Creates /build command  
.claude/commands/fix.md      # Creates /fix command

# Use commands in Claude Code:
> /test unit
> /build production
> /fix "type errors"
```

## Configuration

### Agent Configuration (Markdown with YAML frontmatter)
```markdown
---
name: example-agent
description: Example agent that demonstrates configuration. Use proactively for specific tasks.
tools: Read, Write, Edit, Bash, Grep
---

You are a specialized agent with focused expertise.

## Your role
- Execute specific tasks efficiently
- Return structured, actionable results
- Handle errors gracefully

## Guidelines
1. Be concise and focused
2. Validate inputs before processing
3. Provide clear error messages when issues occur
4. Return results in a consistent format

## Output format
Always return results as structured data that can be parsed by other agents.
```

### Command Configuration (Markdown with frontmatter)
```markdown
---
allowed-tools: Task, Read, Bash
description: Build and deploy the application
argument-hint: [environment]
model: claude-3-5-sonnet-20241022
---

# Build and Deploy Command

## Context
- Target environment: $ARGUMENTS
- Current branch: !`git branch --show-current`
- Last commit: !`git log -1 --oneline`

## Workflow

1. Use the dependency-checker agent to verify all dependencies
2. Use the build-agent to compile the application
3. Use the test-runner agent to run smoke tests
4. Use the deploy-agent to deploy to $ARGUMENTS environment

Report any failures immediately and rollback if needed.
```

### Hook Configuration
```bash
# .claude/hooks/pre-command.sh
#!/bin/bash
# Runs before any command execution
echo "Command starting: $1"

# .claude/hooks/post-agent.sh  
#!/bin/bash
# Runs after each agent completes
echo "Agent $1 completed with status: $2"
```

## Development

### Creating a New Agent via Meta-Agent

Instead of manually coding agents, use the Meta-Agent to generate them:

```bash
# Use the meta-agent to create a new specialized agent
claude-code use meta-agent "Create a data validation agent that checks JSON schemas and data formats"

# The meta-agent will generate a new agent file like:
# .claude/agents/data-validator.md
```

Example of Meta-Agent request:
```
Create an agent named 'data-validator' that:
- Validates JSON, YAML, and XML data formats
- Checks data against schemas
- Reports validation errors with line numbers
- Suggests fixes for common issues
- Tools needed: Read, Grep, Bash
```

The Meta-Agent will:
1. Analyze the requirements
2. Generate the agent's Markdown file with YAML frontmatter
3. Define appropriate tools and permissions
4. Create a detailed system prompt
5. Save to `.claude/agents/` directory

### Creating a New Command

Commands are Markdown files that orchestrate multiple agents:

1. Create a `.md` file in `.claude/commands/`
2. Add frontmatter with tools and description
3. Write the orchestration workflow
4. Command is automatically available as `/command-name`

Example: `.claude/commands/refactor.md`
```markdown
---
allowed-tools: Task, Read, Edit
description: Refactor code for better maintainability
argument-hint: [file-or-directory]
---

Refactor the code in $ARGUMENTS:

1. Use the code-analyzer agent to identify code smells
2. Use the refactoring-agent to improve code structure
3. Use the test-runner agent to ensure no regressions
4. Use the documentation-agent to update docs

Maintain backward compatibility and preserve all tests.
```

## API Reference

### Meta-Agent Interface
```typescript
interface MetaAgent {
  generateAgent(spec: AgentSpec): Promise<Agent>;
  updateAgent(name: string, updates: Partial<AgentSpec>): Promise<Agent>;
  analyzeRequirements(description: string): AgentSpec;
  validateAgentCode(code: string): ValidationResult;
}
```

### Agent Interface
```typescript
interface Agent {
  name: string;
  execute(context: Context): Promise<Result>;
  validate(input: any): boolean;
  handleError(error: Error): void;
  metadata: {
    generatedBy: string;
    version: string;
    capabilities: string[];
  };
}
```

### Command Interface
```typescript
interface Command {
  name: string;
  agents: string[];
  orchestrate(input: any): Promise<Result>;
  beforeAgent(agent: Agent, context: Context): void;
  afterAgent(agent: Agent, result: Result): void;
}

## Examples

### Simple Build Command
```javascript
class BuildCommand {
  agents = ['Clean', 'Compile', 'Package'];
  
  async orchestrate(input) {
    const context = { project: input.project };
    
    for (const agentName of this.agents) {
      const agent = this.getAgent(agentName);
      const result = await agent.execute(context);
      
      if (!result.success) {
        throw new Error(`Build failed at ${agentName}: ${result.error}`);
      }
      
      context.lastResult = result;
    }
    
    return { success: true, artifacts: context.lastResult.artifacts };
  }
}
```

## The Lean Team

For detailed specifications of each agent and command workflow, see [docs/lean-agile-system.md](docs/lean-agile-system.md).

### Core Agents
1. **Builder**: Full-stack developer for rapid implementation
2. **Shipper**: Automated testing, building, and deployment
3. **Reviewer**: Pragmatic code quality and security checks
4. **Fixer**: Expert debugger for rapid issue resolution
5. **DevOps**: Git workflow and version control management

## Roadmap

- [ ] Enhanced parallel agent execution
- [ ] Real-time agent communication bus
- [ ] Automated rollback triggers
- [ ] Performance metrics dashboard
- [ ] Agent learning from failures
- [ ] Multi-environment deployment strategies
- [ ] Intelligent test prioritization
- [ ] Automatic dependency updates