# Development Workflow

Guide for developers working on Claude Agent Kit.

## Local Development Setup

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/bryanweaver/claude-agent-kit.git
cd claude-agent-kit
```

### Development Environment

**Required**:
- Git
- Claude Code (for end-to-end testing)

## Common Workflows

### Adding a New Agent

**Goal**: Add a new agent (e.g., security-auditor)

**Steps**:

1. **Create agent file**

   Create `agents/security-auditor.md`:

   ```markdown
   ---
   name: security-auditor
   description: PROACTIVELY performs security audits...
   tools: Read, Grep, Glob, Bash
   model: sonnet
   ---

   # Purpose

   You are the security auditor...
   ```

2. **Test**

   ```bash
   # Load plugin locally
   claude --plugin-dir /path/to/claude-agent-kit

   # Verify agent is available
   @security-auditor hello
   ```

3. **Update README**

   Add to agents list in README.md

4. **Commit**

   ```bash
   git add agents/security-auditor.md README.md
   git commit -m "feat: add security-auditor agent"
   ```

---

### Adding a Skill

**Goal**: Add a new workflow skill

**Steps**:

1. **Create the skill directory and file**

   ```bash
   mkdir skills/team-new-skill
   ```

   Create `skills/team-new-skill/SKILL.md` with proper frontmatter.

2. **Test**

   ```bash
   claude --plugin-dir /path/to/claude-agent-kit
   /team-new-skill --help
   ```

3. **Update docs**

   Add to README.md

4. **Commit**

   ```bash
   git add skills/team-new-skill/SKILL.md README.md
   git commit -m "feat: add /team-new-skill for X functionality"
   ```

---

### Modifying Adaptive Agents

**Goal**: Improve the full-stack-developer or database-admin agent

**Steps**:

1. **Edit the agent file** in `agents/`
2. **Test** by loading the plugin in a project with the relevant stack
3. **Verify** the agent correctly detects the stack and applies appropriate patterns
4. **Commit**

---

## Testing

### Automated Structural Validation

The plugin ships with a structural validation test suite (`test/validate-plugin.test.js`) built on the zero-dependency `node:test` runner. Run it with:

```bash
node --test test/validate-plugin.test.js
```

The suite covers 156 tests across 6 categories:

| Category | What It Checks |
|----------|---------------|
| **Frontmatter validation** | All agent and skill files have required fields (`name`, `description`, `tools`, `model`) with valid values |
| **Cross-references: skills -> agents** | Every agent referenced in a skill's task table or `Task()` call has a matching file in `agents/` |
| **Cross-references: agents -> skills** | Every skill listed in an agent's "Available Tech-Stack Skills" section exists in `skills/` |
| **Cross-references: hooks -> agents** | Any `agent_name` matcher in `hooks/hooks.json` maps to a real agent file |
| **Plugin structure completeness** | Required directories (`agents/`, `skills/`, `hooks/`, `.claude-plugin/`) and files (`settings.json`, `hooks/hooks.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`) all exist and are valid JSON |
| **No stale references** | No `.md` or `.json` file (excluding `CHANGELOG.md`) references removed v1/v2 CLI or library paths (templates directory, bin entrypoint, lib subdirectories) |

Run validation before committing any structural changes to agents, skills, or hooks.

### Manual Testing

```bash
# Load the plugin locally
claude --plugin-dir /path/to/claude-agent-kit

# Test agents
@full-stack-developer hello
@database-admin status

# Test skills
/team-ship add a feature
/team-run-tests
```

### Manual Testing Checklist

- [ ] Automated tests pass: `node --test test/validate-plugin.test.js`
- [ ] Agent files have valid frontmatter
- [ ] Adaptive agents detect the project stack correctly
- [ ] Skills invoke with proper arguments
- [ ] Hooks fire on expected events
- [ ] Claude Code recognizes all agents after restart

## Git Workflow

### Branch Naming

- `feat/new-agent` — New feature
- `fix/skill-bug` — Bug fix
- `docs/update-guide` — Documentation
- `refactor/agent-cleanup` — Code refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add security-auditor agent
fix: correct skill frontmatter
docs: update developer guide
refactor: simplify agent instructions
chore: update plugin manifest
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Update docs if needed
4. Commit with conventional commit message
5. Push and create PR against `main`
6. Wait for review

## Release Process

```bash
# Update CHANGELOG.md
# Bump version
npm version minor  # or patch, major

# Push with tags
git push && git push --tags
```

## Troubleshooting

### Agents not loading

1. Check YAML frontmatter is valid
2. Ensure `name` field is present
3. Restart Claude Code completely

### Skills not activating

1. Check `SKILL.md` frontmatter
2. Verify `description` matches context
3. Restart Claude Code

## Resources

- [System Overview](../architecture/system-overview.md)
- [Getting Started](./getting-started.md)

---

Last updated: 2026-02-26
