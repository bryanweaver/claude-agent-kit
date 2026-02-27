# Contributing to Claude Agent Kit

Thank you for your interest in contributing to Claude Agent Kit! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and constructive in all interactions. We're all here to build something useful together.

## How to Contribute

### Reporting Issues

1. Check existing issues to avoid duplicates
2. Use the issue template if available
3. Include:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Relevant error messages or logs

### Suggesting Features

1. Open an issue with the "feature request" label
2. Describe the use case and why it would be valuable
3. Consider how it fits with existing functionality

### Submitting Pull Requests

1. **Fork and clone** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the coding standards below
4. **Commit with conventional commits**:
   ```bash
   git commit -m "feat: add new agent for X"
   git commit -m "fix: resolve skill invocation issue"
   ```
5. **Push and create PR** against `main`

## Project Structure

```
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
├── settings.json               # Plugin settings
├── docs/                       # Documentation
└── .claude/                    # Working copies for this repo
```

## Coding Standards

### Agents & Skills (Markdown)

- Follow the existing frontmatter format
- Include clear instructions and examples
- Use the Universal Response Format for agent responses
- Keep agents focused on workflow, use Skills for code patterns

### Skills

- Include SKILL.md with metadata frontmatter
- Provide practical, copy-paste-ready code examples
- Add safety warnings for dangerous operations
- Cross-reference related Skills

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `chore:` - Maintenance tasks

## Adding New Content

### Adding a New Agent

1. Create `agents/your-agent.md`
2. Include required frontmatter:
   ```yaml
   ---
   name: your-agent
   description: Brief description for discovery
   tools: Read, Write, Edit, Bash, Grep, Glob
   model: sonnet
   ---
   ```
3. Test by loading the plugin in Claude Code
4. Update README.md agent count and list

### Adding a Skill

1. Create `skills/your-skill/SKILL.md`
2. Include required frontmatter:
   ```yaml
   ---
   name: your-skill
   description: When this skill should be activated
   ---
   ```
3. Add additional resource files as needed
4. Test by loading the plugin in Claude Code

### Adding a Hook

1. Add hook configuration to `hooks/hooks.json`
2. Follow existing hook patterns
3. Test thoroughly - hooks run automatically

## Release Process

Releases are automated via GitHub Actions when version tags are pushed:

1. Update CHANGELOG.md with changes
2. Run version bump:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```
3. Push with tags:
   ```bash
   git push && git push --tags
   ```

## Questions?

- Open an issue for questions
- Check existing documentation in the repo
- Review closed issues for similar questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
