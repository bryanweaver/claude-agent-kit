# Agent Templates Reference

Complete reference for agent structure, frontmatter, and conventions.

## Agent Types

### Generated Agents (Stack-Specific)

These agents are generated dynamically based on the detected or selected stack:

- **developer** - Implementation specialist customized for your framework
- **database** - Database administrator customized for your database

**Source**: Generated from templates in `lib/stacks/index.js`

**Location after init**: `./.claude/agents/developer.md`, `./.claude/agents/database.md`

### Tech-Agnostic Agents (Static)

These agents work the same regardless of your tech stack:

- **shipper** - Git operations, testing, building, deployment
- **reviewer** - Code review (security, bugs, performance)
- **documentor** - Documentation creation and maintenance
- **meta-agent** - Generates new custom agents
- **meta-skills-agent** - Generates new workflow skills

**Source**: `templates/agents/*.md`

**Location after init**: `./.claude/agents/*.md`

## Agent File Structure

All agents follow this markdown structure:

```markdown
---
name: agent-name
role: agent-role
description: Brief description for CLI and agent selection
tools: Read, Write, Edit, MultiEdit, Bash, Grep, Glob
model: sonnet
color: green
---

# Purpose

High-level purpose and responsibilities of this agent.

## [Sections specific to agent type]

Content organized by purpose.

## Universal Response Format

Template for agent responses.

## Integration with Other Agents

How this agent coordinates with others.
```

## Frontmatter Fields

### Required Fields

#### `name`
Agent identifier used in Claude Code.

**Format**: `lowercase-with-hyphens` or `single-word`

**Examples**:
```yaml
name: developer
name: database
name: full-stack-developer
name: meta-agent
```

**Usage**:
```
@developer create a login page
@database add users table
```

#### `role`
Categorical role for agent organization (NEW in v2.0).

**Standard roles**:
- `developer` - Implementation and coding
- `database` - Database management
- `shipper` - Git operations and deployment
- `reviewer` - Code review
- `documentor` - Documentation
- `meta` - Agent generation

**Examples**:
```yaml
role: developer
role: database
role: shipper
```

**Purpose**: Enables better agent filtering and organization in Claude Code UI.

#### `description`
Brief description shown in CLI listings and agent selection menus.

**Format**: One sentence, present tense, action-oriented

**Good examples**:
```yaml
description: PROACTIVELY use for ALL Next.js/React frontend development...
description: Use proactively for all Supabase database management...
description: PROACTIVELY manages ALL git operations, testing, building, and deployment.
```

**Bad examples**:
```yaml
description: Helps with development  # Too vague
description: A developer agent       # Not action-oriented
```

#### `tools`
Comma-separated list of Claude Code tools this agent can use.

**Available tools**:
- `Read` - Read files
- `Write` - Write new files
- `Edit` - Edit existing files
- `MultiEdit` - Edit multiple files at once
- `Bash` - Execute shell commands
- `Grep` - Search file contents
- `Glob` - Find files by pattern

**Examples**:
```yaml
tools: Read, Write, Edit, Bash, Grep, Glob
tools: Read, Grep, Glob  # Reviewer (read-only)
tools: Bash, Read, Grep, Glob  # Shipper (execution-focused)
```

#### `model`
Claude model to use for this agent.

**Options**:
- `sonnet` - Claude Sonnet (balanced)
- `opus` - Claude Opus (most capable)
- `haiku` - Claude Haiku (fastest)

**Recommendations**:
```yaml
model: sonnet     # Default for most agents
model: opus       # For complex reasoning (reviewer)
model: haiku      # For simple, fast tasks
```

### Optional Fields

#### `color`
Terminal color for agent output.

**Options**: `red`, `green`, `blue`, `yellow`, `magenta`, `cyan`, `white`, `gray`

**Examples**:
```yaml
color: green   # Developer
color: blue    # Database
color: yellow  # Shipper
color: red     # Reviewer (critical feedback)
```

## Content Sections

### Purpose Section

**Required**: Yes

**Format**: Markdown paragraph

**Content**: Clear statement of agent's role and primary responsibilities

**Example**:
```markdown
# Purpose

You are the primary developer for this project. Analyze the codebase and implement features following established patterns.
```

### Tech Stack Section

**Required**: For generated agents (developer, database)

**Format**: Markdown bullet list

**Content**: Specific technologies, frameworks, and tools

**Example**:
```markdown
## Tech Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, lucide-react
- **Database**: Supabase (PostgreSQL)
- **Testing**: Jest, React Testing Library, Playwright
```

### Instructions Section

**Required**: Yes

**Format**: Numbered/bulleted markdown workflow

**Content**: Step-by-step process for agent to follow

**Example**:
```markdown
## Instructions

When invoked, follow these steps:

### 1. Analyze the Task
Determine if it involves:
- Server Components (data fetching)
- Client Components (interactivity)
- API Routes (backend logic)

### 2. Review Existing Patterns
Check relevant files in the codebase...

### 3. Implement
Follow established patterns...

### 4. Test
Write and run tests...
```

### Boundaries Section

**Required**: For implementation agents (developer, database)

**Format**: Markdown lists with DO/DO NOT structure

**Content**: Clear responsibilities and restrictions

**Example**:
```markdown
## Important Boundaries

**DO:**
- Handle ALL frontend development
- Implement API routes
- Create components
- Write tests

**DO NOT:**
- Modify database migrations (use database agent)
- Execute destructive commands
- Push to main without review
```

### Protection Rules Section

**Required**: For database agents

**Format**: Markdown headings with bold warnings

**Content**: Critical safety rules

**Example**:
```markdown
## CRITICAL PROTECTION RULES

### NEVER RESET DATABASE WITHOUT EXPLICIT USER APPROVAL

**NEVER run `supabase db reset`** unless absolutely necessary and only after explicit user approval.

### NEVER PUSH TO REMOTE WITHOUT EXPLICIT USER APPROVAL

**NEVER run `supabase db push --linked`** without explicit user approval.
```

### Universal Response Format Section

**Required**: Yes

**Format**: Code block template

**Content**: Standard response structure

**Example**:
```markdown
## Universal Response Format

\`\`\`text
STATUS: SUCCESS|FAILED|BLOCKED|IN_PROGRESS
SUMMARY: Brief description of operation
DETAILS: [What was done, files modified]
NEXT: Continue with [agent]|Stop|Need user input
CONTEXT: [Information for next agent]
\`\`\`
```

### Integration Section

**Required**: Recommended

**Format**: Markdown lists

**Content**: How agent communicates with others

**Example**:
```markdown
## Integration with Other Agents

**Receives FROM:**
- **database**: Schema changes, type definitions
- **reviewer**: Code quality feedback

**Sends TO:**
- **database**: Schema requirements
- **shipper**: Files ready for commit
```

## Agent Naming Conventions

### Agent Name (in frontmatter)

- Use lowercase
- Use hyphens for multi-word names
- Be descriptive but concise

**Good**:
- `developer`
- `database`
- `full-stack-developer`
- `meta-agent`

**Bad**:
- `Developer` (capitalized)
- `full_stack_developer` (underscores)
- `fsd` (unclear abbreviation)

### File Name

- Must match agent name with `.md` extension
- Stored in `templates/agents/` (tech-agnostic) or generated for stack-specific

**Examples**:
- `developer.md`
- `shipper.md`
- `meta-agent.md`

## Writing Guidelines

### Voice and Tone

- Use second person ("You are...")
- Be direct and imperative ("Do X", "Check Y")
- Use present tense
- Be specific, not vague

**Good**:
```markdown
You are the database administrator. Handle all schema changes and migrations.

When invoked:
1. Check database status
2. Create migrations
3. Test locally
```

**Bad**:
```markdown
This agent can help with database stuff and might do migrations.

You should probably check the database first.
```

### Specificity

- Include exact command syntax
- Provide file path examples
- List specific framework versions

**Good**:
```markdown
Run \`supabase gen types typescript --local > src/types/database.types.ts\`

Check files in:
- \`/src/app/\` - Page and route patterns
- \`/src/components/ui/\` - shadcn/ui components
```

**Bad**:
```markdown
Generate types with supabase

Check the components folder
```

### Safety and Warnings

Use bold and capital letters for critical warnings:

```markdown
**NEVER run `db reset`** without explicit user approval.

### DANGEROUS COMMANDS

Commands that **REQUIRE USER APPROVAL**:
- `migrate --production`
- `db reset`
```

## Generated Agent Templates

### Developer Agent Template Structure

From `lib/generate-agents.js`:

```javascript
{
  name: 'developer',
  description: 'PROACTIVELY use for ALL [framework] development...',
  techStack: `- **Framework**: ...
- **Styling**: ...
- **Database**: ...
- **Testing**: ...`,
  fileStructure: `/src
  /app
  /components`,
  instructions: `### 1. Analyze the Task
...
### 2. Review Patterns
...
### 3. Implement
...`,
  boundaries: `**DO:**
- Handle ALL development

**DO NOT:**
- Modify migrations`
}
```

### Database Agent Template Structure

```javascript
{
  name: 'database',
  description: 'Use proactively for [database] management...',
  techStack: `- **Database**: ...
- **ORM**: ...
- **Migrations**: ...`,
  instructions: `### 1. Check Status
...
### 2. Create Migrations
...`,
  safeCommands: `\`\`\`bash
migrate dev
generate types
\`\`\``,
  dangerousCommands: `\`\`\`bash
migrate --prod
db reset
\`\`\``,
  protectionRules: `### NEVER RESET WITHOUT APPROVAL
...`
}
```

## Testing Agent Templates

### Validate Frontmatter

```bash
# Check frontmatter parses correctly
node -e "
import fs from 'fs';
import yaml from 'yaml';
const content = fs.readFileSync('templates/agents/shipper.md', 'utf-8');
const frontmatter = content.split('---')[1];
console.log(yaml.parse(frontmatter));
"
```

### Test Generated Agents

```bash
# Test generation
node -e "
import { generateDeveloperAgent } from './lib/generate-agents.js';
const content = generateDeveloperAgent('nextjs-supabase');
console.log(content);
"
```

### Verify in Claude Code

```bash
# Install and restart Claude Code
claude-agent-kit init
# Restart Claude Code
claude

# Test agent
@developer hello
@database status
```

## Related Documents

- [Adding New Stacks](../guides/adding-new-stacks.md) - How to create stack templates
- [Agent Generation](../architecture/agent-generation.md) - How agents are generated
- [Supported Stacks](./supported-stacks.md) - Available stack templates

---

Last updated: 2026-02-25
