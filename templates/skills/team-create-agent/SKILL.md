---
name: team-create-agent
description: Create a new custom agent using the meta-agent with guided requirements gathering
argument-hint: [agent description or purpose]
disable-model-invocation: true
allowed-tools: Task, AskUserQuestion, WebFetch, WebSearch
---

# Create Agent

Create a new custom Claude Code agent based on: **$ARGUMENTS**

## Execution

### Phase 1: Requirements Gathering

Evaluate the provided description before invoking the meta-agent:

1. **Assess clarity** — Is the purpose, domain, and task scope clear?
2. **If unclear**, use AskUserQuestion to clarify:
   - What specific tasks should this agent handle?
   - What tools does it need?
   - Should it work with other agents?
   - What model tier? (haiku = simple, sonnet = standard, opus = complex)
3. **Offer research** — For specialized domains, offer to research best practices via WebSearch/WebFetch before creating

### Phase 2: Agent Creation

Once requirements are clear:

1. `Task(meta-agent, "Create an agent for: $ARGUMENTS. <include gathered requirements and any research findings>")`
2. Verify the agent file was created in the agents directory

### Phase 3: Completion

After creation, inform the user:

```text
Agent created successfully!
Location: agents/[agent-name].md

IMPORTANT: Restart your Claude Code session to load the new agent.
```
