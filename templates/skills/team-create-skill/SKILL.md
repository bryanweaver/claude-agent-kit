---
name: team-create-skill
description: Create a new workflow skill using the meta-skills-agent with guided requirements gathering
argument-hint: [skill description or workflow purpose]
disable-model-invocation: true
allowed-tools: Task, AskUserQuestion, WebFetch, WebSearch
---

# Create Workflow Skill

Create a new Claude Code workflow skill based on: **$ARGUMENTS**

## Execution

### Phase 1: Requirements Gathering

Evaluate the provided description before invoking the meta-skills-agent:

1. **Assess clarity** — Is the workflow purpose, agent involvement, and task flow clear?
2. **If unclear**, use AskUserQuestion to clarify:
   - What is the goal of this workflow?
   - Which agents should be involved? (full-stack-developer, database-admin, shipper, reviewer, documentor)
   - What are the major steps and in what order?
   - Can any steps run in parallel?
   - What input arguments should the skill accept?
3. **Offer research** — For specialized workflows, offer to research best practices via WebSearch/WebFetch before creating

### Phase 2: Skill Generation

Once requirements are clear:

1. `Task(meta-skills-agent, "Create a workflow skill for: $ARGUMENTS. <include gathered requirements and any research findings>")`
2. Verify the skill file was created in the skills directory

### Phase 3: Completion

After creation, inform the user:

```text
Workflow skill created successfully!
Location: skills/[skill-name]/SKILL.md

IMPORTANT: Restart your Claude Code session to load the new skill.

Usage: /[skill-name] <arguments>
```
