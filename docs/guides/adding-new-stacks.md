# Adding New Stacks

This guide shows you how to add support for a new tech stack to Claude Agent Kit.

## Overview

Adding a new stack involves three steps:

1. **Add stack template** to `lib/stacks/index.js`
2. **Add detection rules** to `lib/detect-stack.js`
3. **Test the stack** with the init command

## Step 1: Add Stack Template

### Template Structure

Open `lib/stacks/index.js` and add a new entry to the `stacks` object:

```javascript
export const stacks = {
  // ... existing stacks ...

  'your-stack-id': {
    id: 'your-stack-id',
    name: 'Your Stack Name',
    description: 'Brief description shown in CLI',

    developer: {
      name: 'developer',
      description: 'When to use this agent (for CLI listing)',
      techStack: 'Markdown formatted tech stack details',
      fileStructure: 'Text representation of project structure',
      instructions: 'Markdown formatted workflow steps',
      boundaries: 'Markdown formatted do\'s and don\'ts'
    },

    database: {
      name: 'database',
      description: 'When to use this agent (for CLI listing)',
      techStack: 'Database tech stack',
      instructions: 'Database workflow steps',
      safeCommands: 'Commands that don\'t need approval',
      dangerousCommands: 'Commands that need approval',
      protectionRules: 'Critical safety rules'
    }
  }
};
```

### Developer Agent Template

#### `name`
Always `'developer'` - this is the agent name.

#### `description`
Brief description shown in CLI listings. Should explain when to use this agent.

**Format**: `PROACTIVELY use for ALL [framework] development including [key features]. Expert in [technologies].`

**Example**:
```javascript
description: 'PROACTIVELY use for ALL Laravel development including Blade templates, controllers, Eloquent models, and Vue.js components. Expert in Laravel 10, PHP best practices, and MySQL integration.'
```

#### `techStack`
Markdown-formatted list of technologies.

**Template**:
```javascript
techStack: `- **Framework**: [Framework Name Version]
- **Language**: [Language Version]
- **Database**: [Database via ORM]
- **Testing**: [Test Frameworks]
- **Other**: [Additional Tools]`
```

**Example**:
```javascript
techStack: `- **Framework**: Laravel 10, PHP 8.2+
- **Frontend**: Blade Templates, Vue.js 3 (via Inertia.js)
- **Database**: MySQL with Eloquent ORM
- **Testing**: PHPUnit, Pest
- **Queue**: Redis, Laravel Horizon`
```

#### `fileStructure`
Text representation of the typical project structure.

**Template**:
```javascript
fileStructure: `/directory1
  /subdirectory        # Description
  file.ext             # Description

/directory2
  /subdirectory        # Description`
```

**Example**:
```javascript
fileStructure: `/app
  /Http/Controllers     # Request handlers
  /Models               # Eloquent models
  /Services             # Business logic
/resources
  /views                # Blade templates
  /js                   # Vue components
/database
  /migrations           # Schema migrations
  /seeders              # Data seeders`
```

#### `instructions`
Markdown-formatted workflow steps.

**Template**:
```markdown
### 1. Analyze the Task
Determine if it involves:
- [Component type 1]
- [Component type 2]
- [Component type 3]

### 2. Review Existing Patterns
Check relevant files in the codebase:
- `[directory/]` - [What to check]
- `[directory/]` - [What to check]

### 3. Implement
- [Implementation guideline 1]
- [Implementation guideline 2]
- [Implementation guideline 3]
```

**Example**:
```javascript
instructions: `### 1. Analyze the Task
Determine if it involves:
- Controllers (routing and business logic)
- Eloquent models (database operations)
- Blade templates (server-side rendering)
- Vue components (client-side interactivity)

### 2. Review Existing Patterns
Check relevant files:
- \`/app/Http/Controllers/\` - Controller patterns
- \`/app/Models/\` - Model definitions
- \`/resources/views/\` - Blade templates

### 3. Implement
- Follow Laravel conventions
- Use Eloquent ORM for database operations
- Implement validation using Form Requests
- Follow PSR-12 coding standards`
```

#### `boundaries`
What the agent should and shouldn't do.

**Template**:
```markdown
**DO:**
- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

**DO NOT:**
- [Forbidden action 1] (use [other agent])
- [Forbidden action 2]
- [Forbidden action 3]
```

**Example**:
```javascript
boundaries: `**DO:**
- Handle ALL Laravel development
- Create/modify Eloquent models
- Implement controllers and routes
- Create Blade templates and Vue components
- Write feature and unit tests

**DO NOT:**
- Run migrations on production (use database agent)
- Modify database directly outside Eloquent
- Push directly to main branch without review`
```

### Database Agent Template

#### `name`
Always `'database'` - this is the agent name.

#### `description`
Brief description for CLI listing.

**Example**:
```javascript
description: 'Use proactively for MySQL database management with Laravel migrations, Eloquent schema management, and query optimization.'
```

#### `techStack`
Database-specific technologies.

**Example**:
```javascript
techStack: `- **Database**: MySQL 8.0+
- **ORM**: Laravel Eloquent
- **Migrations**: Laravel migrations
- **Seeding**: Database seeders and factories
- **Connection**: PDO`
```

#### `instructions`
Database workflow steps with command examples.

**Example**:
```javascript
instructions: `### 1. Laravel Migrations
\`\`\`bash
php artisan make:migration create_users_table
php artisan migrate
php artisan migrate:status
\`\`\`

### 2. Database Operations
\`\`\`bash
php artisan db:show
php artisan migrate:fresh --seed
\`\`\`

### 3. Model Generation
\`\`\`bash
php artisan make:model User -mfs
# Creates: Model, Migration, Factory, Seeder
\`\`\``
```

#### `safeCommands`
Commands that can run without user approval.

**Example**:
```javascript
safeCommands: `\`\`\`bash
php artisan make:migration <name>
php artisan migrate                  # Local development
php artisan migrate:status
php artisan db:show
php artisan db:seed
\`\`\``
```

#### `dangerousCommands`
Commands that require explicit user approval.

**Example**:
```javascript
dangerousCommands: `\`\`\`bash
php artisan migrate --force          # Production migration
php artisan migrate:fresh            # Drops all tables
php artisan migrate:reset            # Rolls back all migrations
php artisan db:wipe                  # Drops all tables
\`\`\``
```

#### `protectionRules`
Critical safety rules (always include these sections).

**Template**:
```markdown
### LOCAL-FIRST DEVELOPMENT

[Explanation of local-first approach]

### NEVER DEPLOY WITHOUT APPROVAL

[Explanation of production deployment rules]

### NEVER [DESTRUCTIVE ACTION] WITHOUT APPROVAL

[Additional destructive action warnings]
```

**Example**:
```javascript
protectionRules: `### LOCAL-FIRST DEVELOPMENT

Always test migrations locally using \`php artisan migrate\` before production.

### NEVER DEPLOY WITHOUT APPROVAL

Production migrations with \`--force\` flag require explicit user approval.

### NEVER DROP TABLES WITHOUT APPROVAL

Commands like \`migrate:fresh\` or \`db:wipe\` require explicit user confirmation.`
```

## Step 2: Add Detection Rules

### Option A: Add to Existing Detector

If your stack uses a language already supported, add detection logic to the appropriate function in `lib/detect-stack.js`.

**Example: Adding Laravel detection to JavaScript/TypeScript**

```javascript
// lib/detect-stack.js

function detectFromPackageJson(projectPath) {
  // ... existing code ...

  // Add Laravel Mix detection (if applicable)
  if (hasDependency(pkg, 'laravel-mix')) {
    result.backend = 'laravel-mix';
  }

  // ... rest of function ...
}
```

**Example: Adding Laravel detection via Composer**

You'll need to add PHP detection:

```javascript
function detectFromComposer(projectPath) {
  const result = {
    language: null,
    frontend: null,
    backend: null,
    database: null,
    testing: null,
    ui: null
  };

  const composerPath = path.join(projectPath, 'composer.json');
  if (!existsSync(composerPath)) return result;

  result.language = 'php';

  const composer = readJsonSafe(composerPath);
  if (!composer) return result;

  // Framework detection
  if (hasDependency(composer, 'laravel/framework')) {
    result.backend = 'laravel';
  }

  // Database detection
  if (hasDependency(composer, 'doctrine/dbal')) {
    result.database = 'mysql'; // Laravel default
  }

  // Testing
  if (hasDependency(composer, 'phpunit/phpunit')) {
    result.testing = 'phpunit';
  } else if (hasDependency(composer, 'pestphp/pest')) {
    result.testing = 'pest';
  }

  return result;
}
```

Then call it in `detectStack()`:

```javascript
export function detectStack(projectPath = process.cwd()) {
  // ... existing code ...

  const phpStack = detectFromComposer(projectPath);

  result.raw = {
    javascript: jsStack,
    python: pyStack,
    go: goStack,
    ruby: rubyStack,
    rust: rustStack,
    php: phpStack  // Add here
  };

  const stacks = [jsStack, pyStack, goStack, rubyStack, rustStack, phpStack];

  // ... rest of function ...
}
```

### Option B: Add Stack Mapping Rule

Update `mapToStackTemplate()` in `lib/detect-stack.js`:

```javascript
function mapToStackTemplate(detection) {
  const { language, frontend, backend, database } = detection;

  // ... existing rules ...

  // Add Laravel detection
  if (backend === 'laravel') {
    return 'laravel-mysql';
  }

  // ... rest of function ...
}
```

## Step 3: Test the Stack

### Manual Testing

```bash
# In a project with your stack
cd /path/to/laravel-project

# Run init
npx @bryanofearth/claude-agent-kit init

# Verify detection
# Should show:
#   Detected technologies:
#     ✓ PHP
#     ✓ Laravel
#     ✓ MySQL
#
#   Matched stack template:
#     Laravel + MySQL
```

### Test Generated Agents

```bash
# Check generated files
ls .claude/agents/

# Verify content
cat .claude/agents/developer.md
cat .claude/agents/database.md
```

### Test Agent Functionality

```bash
# Restart Claude Code
claude

# Test agents
@developer create a User model
@database show migration status
```

## Complete Example: Adding Remix + Prisma Stack

### 1. Add Stack Template

```javascript
// lib/stacks/index.js

'remix-prisma-postgres': {
  id: 'remix-prisma-postgres',
  name: 'Remix + Prisma + PostgreSQL',
  description: 'Full-stack TypeScript with Remix, Prisma ORM, and PostgreSQL',

  developer: {
    name: 'developer',
    description: 'PROACTIVELY use for ALL Remix development including loaders, actions, routes, and React components. Expert in Remix, TypeScript, and Prisma integration.',
    techStack: `- **Framework**: Remix, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Forms**: Remix Forms with validation
- **Testing**: Vitest, Testing Library`,
    fileStructure: `/app
  /routes               # Route modules (loaders + actions + UI)
  /components           # Reusable React components
  /lib                  # Utilities and Prisma client
  /models               # Business logic
/prisma
  schema.prisma         # Database schema
  /migrations           # Prisma migrations`,
    instructions: `### 1. Analyze the Task
Determine if it involves:
- Routes (loaders for data fetching, actions for mutations)
- Components (UI and client-side logic)
- Forms (Remix form handling with progressive enhancement)
- Database queries (Prisma operations)

### 2. Review Existing Patterns
Check relevant files:
- \`/app/routes/\` - Route patterns
- \`/app/components/\` - Component patterns
- \`/app/lib/\` - Utilities and Prisma client setup
- \`/prisma/schema.prisma\` - Database schema

### 3. Implement
- Use loaders for GET data, actions for POST/PUT/DELETE
- Leverage Remix Form for progressive enhancement
- Use Prisma for type-safe database queries
- Follow file-based routing conventions
- Implement proper error boundaries`,
    boundaries: `**DO:**
- Handle ALL Remix development
- Implement loaders and actions
- Create React components
- Write Prisma queries
- Implement form handling and validation
- Write tests

**DO NOT:**
- Modify Prisma migrations directly (use database agent)
- Run migrations on production without approval
- Push directly to main branch without review`
  },

  database: {
    name: 'database',
    description: 'Use proactively for PostgreSQL database management with Prisma, schema design, migrations, and query optimization.',
    techStack: `- **Database**: PostgreSQL
- **ORM**: Prisma
- **Migrations**: Prisma Migrate
- **Type Generation**: Prisma Client`,
    instructions: `### 1. Prisma Schema
Edit \`prisma/schema.prisma\` to define models.

### 2. Migrations
\`\`\`bash
npx prisma migrate dev --name <description>
npx prisma generate
\`\`\`

### 3. Database Operations
\`\`\`bash
npx prisma studio      # GUI database browser
npx prisma db push     # Prototype mode (skip migrations)
\`\`\``,
    safeCommands: `\`\`\`bash
npx prisma migrate dev --name <name>
npx prisma generate
npx prisma studio
npx prisma format
npx prisma validate
\`\`\``,
    dangerousCommands: `\`\`\`bash
npx prisma migrate deploy        # Production deployment
npx prisma migrate reset          # Drops database
npx prisma db push                # Bypasses migrations
\`\`\``,
    protectionRules: `### LOCAL-FIRST DEVELOPMENT

Always test migrations locally with \`npx prisma migrate dev\` before production.

### NEVER DEPLOY WITHOUT APPROVAL

Production migrations using \`migrate deploy\` require explicit user approval.

### NEVER RESET WITHOUT APPROVAL

\`prisma migrate reset\` destroys all data and requires explicit confirmation.`
  }
}
```

### 2. Add Detection

```javascript
// lib/detect-stack.js

function detectFromPackageJson(projectPath) {
  // ... existing code ...

  // Frontend framework detection
  if (hasDependency(pkg, '@remix-run/react')) {
    result.frontend = 'remix';
    result.backend = 'remix'; // Remix is full-stack
  } else if (hasDependency(pkg, 'next')) {
    // ... existing Next.js detection ...
  }

  // ... rest of function ...
}

function mapToStackTemplate(detection) {
  // ... existing rules ...

  // Remix + Prisma + PostgreSQL
  if (frontend === 'remix' && database === 'postgresql') {
    return 'remix-prisma-postgres';
  }

  // ... rest of function ...
}
```

### 3. Test

```bash
# In a Remix project
cd my-remix-app

# Run init
npx @bryanofearth/claude-agent-kit init

# Should auto-detect:
# ✓ TypeScript
# ✓ Remix
# ✓ PostgreSQL (via Prisma)
#
# Matched stack template:
#   Remix + Prisma + PostgreSQL
```

## Best Practices

### 1. Follow Existing Patterns

Look at existing stacks in `lib/stacks/index.js` for reference. Maintain consistency with:

- Frontmatter structure
- Section headings
- Markdown formatting
- Protection rule wording

### 2. Be Specific in Tech Stack

Include specific versions and key technologies:

```javascript
// Good
techStack: `- **Framework**: Laravel 10, PHP 8.2+
- **Frontend**: Blade Templates, Vue.js 3 (via Inertia.js)
- **Database**: MySQL 8.0 with Eloquent ORM`

// Too vague
techStack: `- **Framework**: Laravel
- **Database**: MySQL`
```

### 3. Include Safety Rules

Database agents should always have:

- LOCAL-FIRST DEVELOPMENT section
- NEVER DEPLOY WITHOUT APPROVAL section
- List of dangerous commands

### 4. Test Thoroughly

Test with actual projects:

```bash
# Test detection
# Test agent generation
# Test agent functionality in Claude Code
```

### 5. Update Documentation

After adding a new stack, update:

- `README.md` - Add to supported stacks table
- `docs/reference/supported-stacks.md` - Add detailed entry

## Troubleshooting

### Stack Not Detected

Check detection logic:

```javascript
// Add debug logging
console.log('Detection result:', detection);
console.log('Mapped stack ID:', mapToStackTemplate(detection));
```

### Agent Not Generating

Verify stack template:

```javascript
import { getStack } from './lib/stacks/index.js';
console.log(getStack('your-stack-id'));
```

### Agent Content Issues

Test generation:

```javascript
import { generateStackAgents } from './lib/generate-agents.js';
const agents = generateStackAgents('your-stack-id');
console.log(agents['developer.md']);
```

## Related Documents

- [System Overview](../architecture/system-overview.md)
- [Stack Detection](../architecture/stack-detection.md)
- [Agent Generation](../architecture/agent-generation.md)
- [Supported Stacks Reference](../reference/supported-stacks.md)

---

Last updated: 2025-12-18
