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
   - Node.js version and OS
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
4. **Test your changes**:
   ```bash
   npm test
   npm run lint
   ```
5. **Commit with conventional commits**:
   ```bash
   git commit -m "feat: add new agent for X"
   git commit -m "fix: resolve installation path issue"
   ```
6. **Push and create PR** against `main`

## Development Setup

```bash
# Clone the repository
git clone https://github.com/bryanweaver/claude-agent-kit.git
cd claude-agent-kit

# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Test CLI locally
node bin/cli.js list
node bin/cli.js install --project
```

## Project Structure

```
├── bin/
│   └── cli.js                  # CLI entry point
├── lib/
│   ├── init.js                 # Init command (stack detection + generation)
│   ├── detect-claude-code.js   # Claude Code detection
│   ├── detect-stack.js         # Tech stack detection
│   ├── generate-agents.js      # Agent generation from templates
│   ├── stacks/
│   │   └── index.js            # Stack template definitions
│   ├── install.js              # Legacy selective install
│   └── file-operations.js      # File system utilities
├── templates/
│   ├── agents/                 # Tech-agnostic agents (5 files)
│   │                           # NOTE: developer + database are GENERATED
│   ├── commands/               # Slash command files
│   ├── hooks/                  # Hook scripts
│   └── skills/                 # Skill pattern files
├── docs/                       # Documentation
│   ├── architecture/           # System design docs
│   ├── guides/                 # How-to guides
│   └── reference/              # API/CLI reference
├── .claude/                    # Working copies for this repo
└── test/                       # Test files
```

## Coding Standards

### JavaScript

- ES Modules (`import`/`export`)
- Use `async`/`await` for async operations
- Descriptive variable and function names
- JSDoc comments for public functions

### Agents & Commands (Markdown)

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
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Adding New Content

### Adding a New Stack

**See detailed guide**: [docs/guides/adding-new-stacks.md](./docs/guides/adding-new-stacks.md)

1. Add stack template to `lib/stacks/index.js`
2. Add detection rules to `lib/detect-stack.js`
3. Map stack in `mapToStackTemplate()` function
4. Test with `npx . init` in a project with that stack
5. Update README.md supported stacks table
6. Update docs/reference/supported-stacks.md

### Adding a Tech-Agnostic Agent

**Note**: Developer and database agents are now GENERATED per stack, not static templates.

For tech-agnostic agents (shipper, reviewer, documentor, etc.):

1. Create `templates/agents/your-agent.md`
2. Include required frontmatter with `role` field:
   ```yaml
   ---
   name: your-agent
   role: your-role    # NEW: developer, database, shipper, reviewer, etc.
   description: Brief description for CLI listing
   tools: Read, Write, Edit, Bash, Grep, Glob
   model: sonnet
   color: green
   ---
   ```
3. Update `lib/init.js` to include it in `techAgnosticAgents` array
4. Test with `npx . init`
5. Update README.md agent count and list

### Adding a Command

1. Create `templates/commands/your-command.md`
2. Include required frontmatter:
   ```yaml
   ---
   description: Brief description shown in /help
   arguments:
     - name: arg_name
       description: What this argument does
       required: false
   ---
   ```
3. Copy to `.claude/commands/` for testing
4. Update PKG-README.md command count and list

### Adding a Skill

1. Create `templates/skills/your-skill/SKILL.md`
2. Include required frontmatter:
   ```yaml
   ---
   name: your-skill
   description: When this skill should be activated
   ---
   ```
3. Add additional resource files as needed
4. Copy to `.claude/skills/` for testing
5. Test with `npx . init`

### Adding a Hook

1. Create `templates/hooks/your-hook.cjs`
2. Use CommonJS format (`.cjs` extension)
3. Follow existing hook patterns
4. Test thoroughly - hooks run automatically

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- test/cli.test.js
npm test -- test/init.test.js
```

### Writing Tests

- Place tests in `test/` directory
- Name files `*.test.js`
- Test both success and error cases
- Mock file system operations where appropriate

### Manual Testing

```bash
# Test init command
npm link
cd /tmp/test-nextjs-project
npx @bryanofearth/claude-agent-kit init

# Test stack detection
cd /tmp/test-django-project
npx @bryanofearth/claude-agent-kit init

# Test interactive selection
cd /tmp/empty-project
npx @bryanofearth/claude-agent-kit init

# Verify generated agents
cat .claude/agents/developer.md
cat .claude/agents/database.md
```

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
4. GitHub Actions will publish to npm

## Questions?

- Open an issue for questions
- Check existing documentation in the repo
- Review closed issues for similar questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
