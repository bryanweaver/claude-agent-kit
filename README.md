# Agent Orchestration System

A powerful orchestration framework for Claude that enables custom commands to coordinate multiple specialized sub-agents, creating complex workflows through simple command interfaces.

## Overview

This system enables lean, agile development through custom commands that orchestrate a small team of specialized AI agents. Built on modern DevOps principles, it emphasizes rapid iteration, parallel workflows, and continuous deployment.

### Core Philosophy
**Ship fast, learn faster.** The system uses a minimal set of highly capable agents that work in parallel when possible, fail fast when issues arise, and maintain clean git workflows through dedicated DevOps automation.

### The Meta-Agent: Agent Creation Engine

At the heart of this system is the **Meta-Agent** - an architectural powerhouse that generates other specialized agents. Rather than manually coding each agent, the Meta-Agent:

- **Analyzes Requirements**: Parses natural language descriptions to understand agent needs
- **Selects Optimal Tools**: Intelligently chooses the minimal tool set required for each agent
- **Generates System Prompts**: Creates detailed, purpose-built instructions for consistent behavior
- **Enforces Communication Standards**: Ensures all agents use the Universal Response Format for seamless inter-agent collaboration
- **Maintains Architectural Consistency**: Every generated agent follows best practices and system conventions

This self-building approach enables rapid adaptation - when new capabilities are needed, simply describe them to the Meta-Agent and it generates a fully-functional specialist ready for integration.

### The Agent Team: Specialized Excellence

The system employs a lean team of five core agents, each with laser-focused expertise:

- **Full-Stack Developer**: Implements features end-to-end across all application layers
- **Database Admin**: Manages schema changes, optimizes queries, ensures data integrity
- **Reviewer**: Performs pragmatic code reviews focusing on security and critical bugs
- **Shipper**: Handles testing, building, deployment, and release management
- **Product Manager**: Coordinates workflows, tracks progress, and maintains project momentum

These agents work in **parallel** whenever possible, dramatically reducing development time. Each agent communicates using a standardized protocol, enabling smooth handoffs and collaborative problem-solving.

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

## Custom Commands: Orchestrated Workflows

The real power of this system lies in its **custom commands** - simple slash commands that trigger sophisticated multi-agent workflows. These commands abstract complex development processes into single, intuitive actions.

### How Commands Facilitate Development

Commands act as **workflow orchestrators**, automatically:
- Coordinating multiple agents in the optimal sequence
- Running parallel operations when dependencies allow
- Managing git branches and commits transparently
- Handling errors and rollbacks intelligently
- Maintaining consistent development practices

### Core Commands

#### `/ship` - Build and Deploy Features
**Purpose**: Transform ideas into production code with zero friction

Orchestrates a complete feature lifecycle:
1. **Shipper**: Creates feature branch with proper naming
2. **Full-Stack Developer + Database Admin**: Implement feature in parallel across all layers
3. **Shipper**: Commits changes with conventional messages
4. **Reviewer**: Performs security and bug analysis
5. **Shipper**: Runs test suite and deploys to staging
6. **Shipper**: Promotes to production after validation
7. **Shipper**: Creates PR and merges to main

**Result**: Feature shipped in minutes, not days

#### `/fix` - Emergency Bug Fixes
**Purpose**: Minimize downtime with rapid issue resolution

Fast-track workflow for critical issues:
1. **Shipper**: Creates hotfix branch from main
2. **Full-Stack Developer/Database Admin**: Diagnoses root cause and implements minimal fix
3. **Shipper**: Commits fix with issue reference
4. **Shipper**: Skips full test suite, runs targeted tests only
5. **Shipper**: Deploys directly to production
6. **Shipper**: Monitors for immediate issues, ready to rollback
7. **Shipper**: Merges hotfix to main

**Result**: Production issues resolved in minutes with full audit trail

#### `/cleanup` - Technical Debt and Refactoring
**Purpose**: Maintain code health without disrupting development

Systematic improvement workflow:
1. **Shipper**: Creates refactor branch
2. **Reviewer**: Scans for code smells and performance bottlenecks
3. **Full-Stack Developer/Database Admin**: Implements improvements maintaining functionality
4. **Shipper**: Runs full test suite to ensure no regressions
5. **Shipper**: Deploys to staging for validation
6. **Shipper**: Creates PR with before/after metrics

**Result**: Continuous improvement without feature freeze

#### `/test` - Batch Test and Fix
**Purpose**: Discover and fix all issues systematically

Two-phase testing strategy:
1. **Discovery Phase**:
   - **Shipper**: Runs complete test suite to completion
   - Collects ALL failures without stopping
   - Compiles comprehensive failure report

2. **Fix Phase**:
   - **Orchestrator**: Creates TODO list from failures
   - **Full-Stack Developer + Database Admin**: Fix issues in parallel
   - **Shipper**: Re-runs failed tests after each fix
   - **Reviewer**: Validates all fixes are appropriate

**Result**: All tests passing with minimal iteration

#### `/add-tests` - Critical Test Coverage
**Purpose**: Add disaster-prevention tests only

Pragmatic testing workflow:
1. **Shipper**: Creates test branch
2. **Reviewer**: Identifies CRITICAL untested code (auth, payments, data integrity)
3. **Full-Stack Developer/Database Admin**: Write minimal tests for disaster scenarios
4. **Shipper**: Validates new tests catch real issues
5. **Shipper**: Merges tests to main

**Result**: 20% effort prevents 80% of production disasters

#### `/repo-status` - Comprehensive Repository Analysis
**Purpose**: Provide detailed insights into repository health and development activity

Complete diagnostic workflow:
1. **Git Status Analysis**: Branch health, uncommitted changes, remote sync status
2. **Development Activity**: Recent commits, contributor patterns, file modification trends
3. **Action Items Discovery**: TODO, FIXME, HACK comments across the codebase
4. **Project Health**: Configuration completeness, test coverage, documentation status
5. **Actionable Recommendations**: Prioritized next steps based on findings

**Usage**: 
- `/repo-status` - Full repository analysis
- `/repo-status git` - Focus on git repository health
- `/repo-status todos` - Comprehensive action item analysis
- `/repo-status health` - Project health assessment only

**Result**: Complete visibility into project status with prioritized action items

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

## The Lean Team: Purpose-Built Specialists

Each agent in the team has a specific purpose and works collaboratively to enable rapid, high-quality software development:

### Agent Roles and Responsibilities

#### 1. **Full-Stack Developer**
- **Purpose**: Rapid feature implementation across all application layers
- **Expertise**: Frontend, backend, APIs, database interactions
- **Communication**: Receives requirements, outputs working code
- **Tools**: Read, Write, Edit, MultiEdit, Grep, Glob

#### 2. **Database Admin**
- **Purpose**: Ensure data integrity and optimal database performance
- **Expertise**: Schema design, query optimization, migrations, data consistency
- **Communication**: Receives data requirements, outputs optimized queries and schemas
- **Tools**: Read, Write, Edit, Bash, Grep

#### 3. **Reviewer**
- **Purpose**: Maintain code quality without blocking progress
- **Expertise**: Security vulnerabilities, performance issues, code smells
- **Communication**: Receives code changes, outputs prioritized improvement lists
- **Philosophy**: "Ship now, improve later" - only blocks for critical issues
- **Tools**: Read, Grep, Glob

#### 4. **Shipper**
- **Purpose**: Automate the path from code to production
- **Expertise**: Testing, building, deployment, git operations, CI/CD
- **Communication**: Receives code, outputs deployment status and test results
- **Tools**: Bash, Read, Write, Edit, Grep

#### 5. **Product Manager**
- **Purpose**: Maintain project momentum and visibility
- **Expertise**: Task prioritization, progress tracking, workflow coordination
- **Communication**: Receives project status, outputs organized task lists
- **Tools**: TodoWrite, Read

### Inter-Agent Communication Protocol

All agents use a **Universal Response Format** for seamless collaboration:

```
STATUS: SUCCESS|FAILED|BLOCKED|IN_PROGRESS
SUMMARY: Brief description of operation completed
DETAILS: [What was accomplished]
NEXT: Continue with [agent]|Stop|Need user input
CONTEXT: [Information for next agent]
```

This standardized protocol ensures:
- Clear handoffs between agents
- Automatic error propagation
- Parallel execution capability
- Consistent user feedback

## Roadmap

- [ ] Enhanced parallel agent execution
- [ ] Real-time agent communication bus
- [ ] Automated rollback triggers
- [ ] Performance metrics dashboard
- [ ] Agent learning from failures
- [ ] Multi-environment deployment strategies
- [ ] Intelligent test prioritization
- [ ] Automatic dependency updates