# Development Workflow

Guide for developers working on Claude Agent Kit.

## Local Development Setup

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/bryanweaver/claude-agent-kit.git
cd claude-agent-kit

# Install dependencies
npm install

# Link for local testing
npm link

# Verify link worked
claude-agent-kit --version
```

### Development Environment

**Required**:
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Claude Code (for end-to-end testing)

**Optional**:
- ESLint extension for your editor
- Test projects with different stacks

## Common Workflows

### Adding a New Stack

**Goal**: Add support for a new tech stack (e.g., Laravel + MySQL)

**Steps**:

1. **Define the stack template**

   Edit `lib/stacks/index.js`:

   ```javascript
   'laravel-mysql': {
     id: 'laravel-mysql',
     name: 'Laravel + MySQL',
     description: 'Full-stack PHP with Laravel and MySQL',
     developer: {
       name: 'developer',
       description: '...',
       techStack: `...`,
       fileStructure: `...`,
       instructions: `...`,
       boundaries: `...`
     },
     database: {
       name: 'database',
       description: '...',
       techStack: `...`,
       instructions: `...`,
       safeCommands: `...`,
       dangerousCommands: `...`,
       protectionRules: `...`
     }
   }
   ```

2. **Add detection logic**

   Edit `lib/detect-stack.js`:

   ```javascript
   // Add PHP detector
   function detectFromComposer(projectPath) {
     // ... detection logic ...
   }

   // Call in detectStack()
   const phpStack = detectFromComposer(projectPath);

   // Add to stacks array
   const stacks = [..., phpStack];

   // Add mapping rule
   if (backend === 'laravel') {
     return 'laravel-mysql';
   }
   ```

3. **Test generation**

   ```bash
   node -e "
   import { generateStackAgents } from './lib/generate-agents.js';
   const agents = generateStackAgents('laravel-mysql');
   console.log(agents['developer.md']);
   "
   ```

4. **Test detection**

   ```bash
   cd /tmp/laravel-project
   claude-agent-kit init

   # Should detect Laravel and show:
   # Matched stack template:
   #   Laravel + MySQL
   ```

5. **Verify generated agents**

   ```bash
   cat .claude/agents/developer.md
   cat .claude/agents/database.md
   ```

6. **Update documentation**

   - Add to README.md supported stacks table
   - Add entry to docs/reference/supported-stacks.md

7. **Commit**

   ```bash
   git add lib/stacks/index.js lib/detect-stack.js
   git commit -m "feat: add Laravel + MySQL stack support"
   ```

---

### Updating a Stack Template

**Goal**: Improve instructions or add features to an existing stack

**Steps**:

1. **Edit the template**

   ```bash
   vim lib/stacks/index.js
   # Update the relevant stack template
   ```

2. **Test generation**

   ```bash
   node -e "
   import { generateStackAgents } from './lib/generate-agents.js';
   console.log(generateStackAgents('nextjs-supabase')['developer.md']);
   "
   ```

3. **Test in a real project**

   ```bash
   cd /path/to/nextjs-project
   rm -rf .claude/  # Clean previous install
   claude-agent-kit init
   cat .claude/agents/developer.md
   ```

4. **Verify changes**

   - Check generated content is correct
   - Verify frontmatter is valid
   - Test agent in Claude Code

5. **Commit**

   ```bash
   git commit -m "improve: enhance Next.js stack developer agent instructions"
   ```

---

### Adding a Tech-Agnostic Agent

**Goal**: Add a new agent that works for all stacks (e.g., security-auditor)

**Steps**:

1. **Create agent file**

   ```bash
   vim templates/agents/security-auditor.md
   ```

   ```markdown
   ---
   name: security-auditor
   role: security
   description: PROACTIVELY performs security audits...
   tools: Read, Grep, Glob, Bash
   model: sonnet
   color: red
   ---

   # Purpose

   You are the security auditor...
   ```

2. **Test** (no changes to `lib/init.js` needed)

   ```bash
   cd /tmp/test-project
   rm -rf .claude/
   claude-agent-kit init
   ls .claude/agents/
   # Should see security-auditor.md
   ```

   `lib/init.js` auto-discovers all `.md` files in `templates/agents/` that are not generated stack agents — no code changes required.

3. **Update README**

   Add to agents list in README.md

4. **Commit**

   ```bash
   git add templates/agents/security-auditor.md README.md
   git commit -m "feat: add security-auditor agent"
   ```

---

### Testing Stack Detection

**Goal**: Verify that stack detection works correctly

**Steps**:

1. **Create test projects**

   ```bash
   mkdir -p /tmp/test-stacks
   cd /tmp/test-stacks

   # Next.js project
   mkdir nextjs-test
   cd nextjs-test
   echo '{"dependencies":{"next":"14.0.0","@supabase/supabase-js":"2.0.0"}}' > package.json

   # Django project
   mkdir ../django-test
   cd ../django-test
   echo 'django==5.0.0' > requirements.txt
   ```

2. **Test detection**

   ```bash
   cd nextjs-test
   claude-agent-kit init --yes
   # Verify: Should auto-detect Next.js + Supabase

   cd ../django-test
   claude-agent-kit init --yes
   # Verify: Should auto-detect Python + Django + PostgreSQL
   ```

3. **Debug detection**

   Add logging to `lib/detect-stack.js`:

   ```javascript
   export function detectStack(projectPath = process.cwd()) {
     // ... existing code ...
     console.log('Detection result:', result);
     console.log('Stack ID:', result.stackId);
     return result;
   }
   ```

4. **Test edge cases**

   ```bash
   # Empty project
   mkdir ../empty-test
   cd ../empty-test
   claude-agent-kit init
   # Should show interactive menu

   # Unknown stack
   mkdir ../unknown-test
   cd ../unknown-test
   echo '{"dependencies":{"some-obscure-lib":"1.0.0"}}' > package.json
   claude-agent-kit init
   # Should use generic stack or show menu
   ```

---

### Adding a Skill

**Goal**: Add a new workflow skill

**Steps**:

1. **Create the skill directory and file**

   ```bash
   mkdir templates/skills/team-new-skill
   vim templates/skills/team-new-skill/SKILL.md
   ```

2. **Test**

   ```bash
   cd /tmp/test-project
   rm -rf .claude/
   claude-agent-kit init
   ls .claude/skills/
   ```

3. **Update docs**

   Add to README.md

4. **Commit**

   ```bash
   git add templates/skills/team-new-skill/SKILL.md README.md
   git commit -m "feat: add /team-new-skill for X functionality"
   ```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- test/detect-stack.test.js

# Watch mode
npm test -- --watch
```

### Integration Tests

```bash
# Test full workflow
npm link
cd /tmp/test-nextjs-project
claude-agent-kit init
# Verify output

# Test with different stacks
cd /tmp/test-django-project
claude-agent-kit init
```

### Manual Testing Checklist

- [ ] Stack detection works for each supported stack
- [ ] Generated agents have valid frontmatter
- [ ] Generated agents contain stack-specific content
- [ ] Init command completes without errors
- [ ] Files are created in correct locations
- [ ] Claude Code recognizes the agents after restart
- [ ] Agents work as expected in Claude Code

## Debugging

### Debug Stack Detection

```bash
# Add console.log to lib/detect-stack.js
export function detectStack(projectPath) {
  console.log('Project path:', projectPath);
  const detection = { /*...*/ };
  console.log('Detection:', detection);
  return detection;
}

# Run init
cd /tmp/test-project
claude-agent-kit init
```

### Debug Agent Generation

```bash
# Test generation directly
node -e "
import { generateStackAgents } from './lib/generate-agents.js';
const agents = generateStackAgents('nextjs-supabase');
console.log('Keys:', Object.keys(agents));
console.log('Developer frontmatter:', agents['developer.md'].split('---')[1]);
"
```

### Debug Init Process

Add spinners and logs to `lib/init.js`:

```javascript
spinner.start('Checking Claude Code...');
console.log('Claude status:', claudeStatus);
spinner.succeed('Claude Code detected');
```

## Git Workflow

### Branch Naming

- `feat/stack-detection` - New feature
- `fix/detection-bug` - Bug fix
- `docs/stack-guide` - Documentation
- `refactor/init-command` - Code refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add Laravel + MySQL stack support
fix: correct Python detection for FastAPI
docs: add stack detection architecture guide
refactor: simplify agent generation logic
test: add tests for stack detection
chore: update dependencies
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Update docs if needed
6. Commit with conventional commit message
7. Push and create PR against `main`
8. Wait for CI to pass
9. Request review

## Release Process

Automated via GitHub Actions:

```bash
# Update CHANGELOG.md
vim CHANGELOG.md

# Bump version
npm version minor  # or patch, major

# Push with tags
git push && git push --tags

# GitHub Actions will:
# 1. Run tests
# 2. Build package
# 3. Publish to npm
```

## Troubleshooting

### "Command not found" after npm link

```bash
npm unlink -g @bryanofearth/claude-agent-kit
npm link
which claude-agent-kit
```

### Tests failing

```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Run tests with verbose output
npm test -- --verbose
```

### Generated agents missing content

Check stack template in `lib/stacks/index.js`:

```javascript
// Ensure all fields are present
developer: {
  name: 'developer',
  description: '...',  // Required
  techStack: `...`,    // Required
  fileStructure: `...`, // Required
  instructions: `...`,  // Required
  boundaries: `...`     // Required
}
```

## Resources

- [Architecture Documentation](../architecture/system-overview.md)
- [Adding New Stacks Guide](./adding-new-stacks.md)
- [CLI Commands Reference](../reference/cli-commands.md)

---

Last updated: 2026-02-24
