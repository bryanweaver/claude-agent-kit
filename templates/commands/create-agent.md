---
allowed-tools: Task, AskUserQuestion, WebFetch, WebSearch
argument-hint: [agent description or purpose]
description: Create a new custom agent using the meta-agent with guided requirements gathering
---

# Create Agent: $ARGUMENTS

## Objective

Create a new custom Claude Code agent based on: **$ARGUMENTS**

## Workflow

You will use the meta-agent to create a new agent, but first ensure requirements are clear and complete.

### Phase 1: Requirements Gathering

Before invoking the meta-agent, evaluate the provided description:

1. **Assess Clarity**
   - Is the agent's purpose clearly defined?
   - Are the primary tasks/responsibilities specified?
   - Is the target domain or technology stack clear?
   - Are there any ambiguous or conflicting requirements?

2. **If Requirements Are Unclear**
   Use AskUserQuestion to clarify:
   - What specific tasks should this agent handle?
   - What tools does this agent need access to?
   - Should this agent work with other agents in the system?
   - What model tier is appropriate (haiku for simple, sonnet for standard, opus for complex)?

3. **Offer Research Option**
   If the user's description is for a specialized domain, ask:
   > "Would you like me to research best practices for [agent purpose] before creating the agent? This can help ensure the agent follows industry standards and patterns."

   If yes, use WebSearch/WebFetch to research:
   - Best practices for the agent's domain
   - Common patterns and workflows
   - Recommended tooling and approaches

### Phase 2: Agent Creation

Once requirements are sufficiently gathered:

1. **Invoke Meta-Agent**
   Use the Task tool to launch the meta-agent with subagent_type='meta-agent':

   Provide a comprehensive prompt including:
   - The agent's purpose and responsibilities
   - Required tools
   - Any researched best practices
   - Integration points with other agents (if applicable)
   - Preferred model tier

2. **Verify Creation**
   - Confirm the agent file was created in `.claude/agents/`
   - Verify the agent follows the Universal Response Format

### Phase 3: Completion

After the agent is created, inform the user:

```
Agent created successfully!

Location: .claude/agents/[agent-name].md

IMPORTANT: You must restart your Claude Code session to see and use the new agent.

To restart:
- Close the current Claude Code session
- Start a new session in your project directory
- The new agent will be available for use
```

## Instructions for Main Orchestrator

1. First, evaluate if `$ARGUMENTS` provides enough information to create a quality agent
2. If unclear, use AskUserQuestion to gather missing requirements
3. Offer to research best practices if the domain is specialized
4. Once requirements are complete, launch the meta-agent via Task tool
5. After creation, always remind the user to restart Claude Code

## Example Interactions

**Clear Request:**
> User: "Create an agent for managing Docker containers"

This is clear enough - proceed to offer research option, then create.

**Unclear Request:**
> User: "Create a helper agent"

Ask: What specific tasks should this helper agent perform? What domain will it work in?

**Specialized Domain:**
> User: "Create an agent for Kubernetes deployments"

Offer: "Would you like me to research Kubernetes deployment best practices before creating this agent?"
