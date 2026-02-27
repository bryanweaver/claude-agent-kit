# Getting Started

Welcome to Claude Agent Kit! This guide gets you up and running quickly.

## Prerequisites

### Required: Claude Code

Claude Agent Kit is a plugin for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), Anthropic's official CLI tool. You must have Claude Code installed.

```bash
npm install -g @anthropic-ai/claude-code
```

Verify installation:
```bash
claude --version
```

## Installation

### Claude Code Marketplace (Recommended)

The marketplace method installs the plugin directly through Claude Code.

#### Step 1: Add the repository to the marketplace

```bash
claude plugin marketplace add bryanweaver/claude-agent-kit
```

#### Step 2: Install the team plugin

```bash
claude plugin install team@claude-agent-kit
```

#### Step 3: Start using the team

```bash
/team-ship add user authentication
/team-fix users can't log in
/team-cleanup authentication module
```

### Load Locally (Development)

For local development or testing, load the plugin directly:

```bash
claude --plugin-dir /path/to/claude-agent-kit
```

## What Gets Installed

### Adaptive Agents

These agents detect your project's tech stack at runtime and adapt accordingly:

- **full-stack-developer** — Adaptive implementation specialist for any framework
- **database-admin** — Adaptive database administrator for any database

### Tech-Agnostic Agents

These work the same regardless of stack:

- **shipper** — Git operations, testing, building, deployment
- **reviewer** — Pragmatic code review (security, bugs, performance)
- **documentor** — Documentation creation and maintenance
- **meta-agent** — Generates new custom agents
- **meta-skills-agent** — Generates new workflow skills

### Skills

Workflow skills and code pattern libraries:

**Workflow skills** (invoke with `/`):

- **/team-ship** — Build and deploy features from start to production
- **/team-fix** — Emergency bug fixes and rapid issue resolution
- **/team-cleanup** — Technical debt and refactoring
- **/team-run-tests** — Batch test and fix workflows
- **/team-add-tests** — Add critical test coverage
- **/team-create-agent** — Create new custom agents
- **/team-create-skill** — Create new workflow skills
- **/team-init-docs** — Set up docs structure
- **/team-update-docs** — Update docs after changes
- **/team-repo-status** — Comprehensive repository status
- **/team-audit** — Analyze and view audit logs

**Code pattern libraries** (auto-activate based on context):

- **supabase-patterns** — RLS policies, migrations, Edge Functions
- **nextjs-app-router** — Server/Client Components, routing
- **shadcn-components** — CVA variants, forms, Radix UI
- **tanstack-query** — Data fetching, mutations, caching
- **testing-patterns** — Jest, React Testing Library, Playwright

### Hooks

Event-driven automation for quality gates and observability.

## Using the Agents

### Talk to Agents Directly

```
@developer create a login page with email validation
```

```
@database add a users table with RLS policies
```

```
@shipper commit and push these changes
```

### Use Skills for Workflows

```
/team-ship add user authentication
```

This will:
1. Invoke the appropriate agents in sequence
2. Implement the feature
3. Write tests
4. Review code
5. Commit and deploy

### Let Skills Auto-Activate

Skills activate automatically based on context. When you're working on Supabase migrations, the `supabase-patterns` skill provides relevant examples.

## How Adaptive Agents Work

The **full-stack-developer** and **database-admin** agents detect your project's tech stack on their first invocation by scanning:

- `package.json` — JavaScript/TypeScript frameworks
- `requirements.txt` / `pyproject.toml` — Python frameworks
- `go.mod`, `Gemfile`, `Cargo.toml`, `composer.json` — Other languages

They then adapt their instructions, patterns, and safety rules to match your specific stack. No per-project configuration needed.

## Next Steps

- **Learn the architecture**: Read [System Overview](../architecture/system-overview.md)
- **Try a skill**: Run `/team-ship add user profile page`
- **Create custom agents**: Use `/team-create-agent` or the `meta-agent`

## Troubleshooting

### Agents not appearing in Claude Code

1. **Restart Claude Code completely**: Fully exit and restart
2. **Check plugin is loaded**: Verify in Claude Code settings
3. **Check agent frontmatter**: Ensure valid YAML format

### Skills not activating

1. Check that `SKILL.md` has valid frontmatter
2. Verify the `description` field matches context
3. Restart Claude Code

## Related Documents

- [System Overview](../architecture/system-overview.md)
- [Development Workflow](./development-workflow.md)

---

Last updated: 2026-02-26
