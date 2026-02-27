# Developer Guide - Claude Agent Kit

Quick reference for developers working on or with the Claude Agent Kit plugin.

## Project Structure

```text
claude-agent-kit/
├── .claude-plugin/
│   ├── plugin.json             # Claude Code plugin manifest
│   └── marketplace.json        # Marketplace distribution manifest
├── agents/
│   ├── full-stack-developer.md # Adaptive full-stack implementation
│   ├── database-admin.md       # Adaptive database administration
│   ├── shipper.md              # Pipeline: git, test, build, deploy
│   ├── reviewer.md             # Security, bugs, performance review
│   ├── documentor.md           # Documentation creation and maintenance
│   ├── meta-agent.md           # Agent generator
│   └── meta-skills-agent.md    # Skill generator
├── skills/                     # Workflow and tech-stack skills
├── hooks/                      # Quality gates and observability
│   └── hooks.json              # Hook definitions
├── settings.json               # Plugin settings (Agent Teams flag)
├── docs/                       # Documentation
├── package.json                # Package metadata
├── README.md                   # Main README
├── CHANGELOG.md                # Version history
├── CONTRIBUTING.md              # Contribution guidelines
├── DEVELOPER_GUIDE.md           # This file
└── LICENSE                      # MIT License
```

## Plugin Distribution

Claude Agent Kit is distributed as a **Claude Code plugin only**. Users install it via the marketplace:

```bash
claude plugin marketplace add bryanweaver/claude-agent-kit
claude plugin install team@claude-agent-kit
```

Or load locally for development:

```bash
claude --plugin-dir /path/to/claude-agent-kit
```

## Adaptive Agents

The **full-stack-developer** and **database-admin** agents are stack-adaptive. Instead of being generated for a specific tech stack, they detect the project's stack at runtime by scanning configuration files:

- `package.json` — JavaScript/TypeScript frameworks and database clients
- `requirements.txt` / `pyproject.toml` — Python frameworks and ORMs
- `go.mod` — Go projects
- `Gemfile` — Ruby projects
- `composer.json` — PHP projects

They then tailor their approach (patterns, commands, safety rules) to match the detected stack. They also reference the built-in tech-stack skills (`nextjs-app-router`, `supabase-patterns`, `shadcn-components`, `tanstack-query`, `testing-patterns`) for framework-specific best practices.

## Adding New Content

### Add a New Agent

1. Create agent definition in `agents/new-agent.md`
2. Include frontmatter with `name`, `description`, `tools`, and `model`
3. Test by loading the plugin: `claude --plugin-dir .`

### Add a New Skill

1. Create `skills/your-skill/SKILL.md` with frontmatter
2. Add additional resource files as needed
3. Test by loading the plugin

### Add a New Hook

1. Edit `hooks/hooks.json` to add hook configuration
2. Follow existing hook patterns
3. Test thoroughly — hooks run automatically

## Testing Changes

### Manual Testing

```bash
# Load the plugin locally in Claude Code
claude --plugin-dir /path/to/claude-agent-kit

# Verify agents are loaded
@full-stack-developer hello
@database-admin status

# Test skills
/team-ship --help
```

### Verify Plugin Structure

Ensure these directories and files are present:
- `agents/` — All agent markdown files
- `skills/` — All skill directories with SKILL.md
- `hooks/` — hooks.json
- `settings.json` — Plugin settings
- `.claude-plugin/` — Plugin and marketplace manifests

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
fix: correct skill frontmatter parsing
docs: update developer guide
refactor: simplify agent instructions
chore: update plugin manifest version
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Update docs if needed
4. Commit with conventional commit message
5. Push and create PR against `main`
6. Wait for review

## Publishing

### Pre-publish Checklist

- [ ] All agent files have valid frontmatter
- [ ] Version number updated in package.json
- [ ] CHANGELOG.md updated with new version entry
- [ ] README.md reflects any new features
- [ ] `.claude-plugin/marketplace.json` version updated if plugin content changed
- [ ] `.claude-plugin/plugin.json` version matches

### Version Bumping

```bash
npm version patch  # Bug fixes
npm version minor  # New features
npm version major  # Breaking changes

git push && git push --tags
```

### Updating the Marketplace Manifest

When releasing a new version that changes plugin content (agents, skills, hooks), update the version in `.claude-plugin/marketplace.json` and `.claude-plugin/plugin.json`.

## Troubleshooting

### Agents not appearing in Claude Code

1. Check that agent files have valid YAML frontmatter
2. Ensure `name` field is present in frontmatter
3. Restart Claude Code completely
4. Verify plugin is loaded: check Claude Code settings

### Skills not activating

1. Check that `SKILL.md` has valid frontmatter
2. Verify the `description` field matches activation context
3. Restart Claude Code

---

For questions or issues, open a GitHub issue or submit a PR.
