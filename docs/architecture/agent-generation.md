# Agent Generation

The agent generation system creates customized agent files dynamically based on the detected or selected tech stack.

## Why Generate Agents?

### Problem with Static Agents

In v1.0, agents were static markdown files:

```
templates/
├── agents/
│   ├── full-stack-developer.md      (Next.js specific)
│   ├── database-admin.md             (Supabase specific)
│   └── ...
```

**Issues**:
- Hard-coded for Next.js + Supabase only
- Supporting 6 stacks would require 12 agent files (6 × 2)
- Updates to agent structure required editing all files
- Difficult to maintain consistency across stacks

### Solution: Dynamic Generation

Agents are generated from stack templates:

```javascript
// lib/stacks/index.js
export const stacks = {
  'nextjs-supabase': {
    id: 'nextjs-supabase',
    name: 'Next.js + Supabase',
    developer: { /* content specs */ },
    database: { /* content specs */ }
  },
  'react-express-postgres': {
    id: 'react-express-postgres',
    name: 'React + Express + PostgreSQL',
    developer: { /* content specs */ },
    database: { /* content specs */ }
  }
  // ... more stacks
};
```

**Benefits**:
- One generation function for all stacks
- Easy to add new stacks (just add an object)
- Consistent structure across all generated agents
- Easier testing and version control

## Stack Template Structure

Each stack defines content for two agents:

### Developer Agent Template

```javascript
developer: {
  name: 'developer',                    // Agent name
  description: '...',                   // What this agent does
  techStack: '...',                     // Technologies (markdown)
  fileStructure: '...',                 // Project structure (text)
  instructions: '...',                  // Step-by-step workflow (markdown)
  boundaries: '...'                     // What agent can/cannot do (markdown)
}
```

### Database Agent Template

```javascript
database: {
  name: 'database',                     // Agent name
  description: '...',                   // What this agent does
  techStack: '...',                     // Database technologies (markdown)
  instructions: '...',                  // Database workflow (markdown)
  safeCommands: '...',                  // Safe CLI commands (markdown)
  dangerousCommands: '...',             // Dangerous commands (markdown)
  protectionRules: '...'                // Critical safety rules (markdown)
}
```

## Generation Process

### Step 1: Retrieve Stack Template

```javascript
// lib/generate-agents.js
import { getStack } from './stacks/index.js';

export function generateDeveloperAgent(stackId) {
  const stack = getStack(stackId);
  if (!stack) {
    throw new Error(`Unknown stack: ${stackId}`);
  }

  const dev = stack.developer;
  // ...
}
```

### Step 2: Build Markdown Content

The generator creates a complete markdown file with:

1. **Frontmatter** (YAML format)
2. **Purpose section**
3. **Tech stack details**
4. **Instructions**
5. **Boundaries**
6. **File structure**
7. **Response format**
8. **Integration notes**

**Example output**:

```markdown
---
name: developer
role: developer
description: PROACTIVELY use for ALL Next.js/React frontend development...
tools: Read, Edit, MultiEdit, Write, Grep, Glob, Bash
model: sonnet
color: green
---

# Purpose

You are the primary developer for this project. Analyze the codebase and implement features following established patterns.

## Tech Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, lucide-react
- **Data**: TanStack Query, React Hook Form + Zod, Supabase
- **Testing**: Jest, React Testing Library, Playwright

## Instructions

When invoked, follow these steps:

### 1. Analyze the Task
Determine if it involves:
- Server Components (data fetching, static content)
- Client Components (interactivity, hooks, browser APIs)
...
```

### Step 3: Write to File System

```javascript
// lib/init.js
const generatedAgents = generateStackAgents(selectedStackId);
// Returns:
// {
//   'developer.md': '--- markdown content ---',
//   'database.md': '--- markdown content ---'
// }

for (const [filename, content] of Object.entries(generatedAgents)) {
  const filePath = path.join(agentsDir, filename);
  await writeFile(filePath, content);
}
```

## Agent Roles

### New in v2.0: Role Field

Generated agents now include a `role` field in frontmatter:

```yaml
---
name: developer
role: developer    # NEW
description: ...
---
```

**Purpose**: Enables better agent organization and filtering in Claude Code.

**Standard roles**:
- `developer` - Implementation and coding
- `database` - Database management
- `shipper` - Git operations and deployment
- `reviewer` - Code review
- `documentor` - Documentation
- `meta` - Agent/command generation

## Template Content Guidelines

### Developer Agent Content

Should include:

1. **Tech Stack**: List specific versions and tools
   ```markdown
   - **Framework**: Next.js 14 (App Router), React 18, TypeScript
   - **Styling**: Tailwind CSS, shadcn/ui
   ```

2. **File Structure**: Show typical project layout
   ```
   /src
     /app                  # Next.js App Router pages
     /components/ui        # shadcn/ui components
   ```

3. **Instructions**: Step-by-step workflow
   - Analyze the task
   - Review existing patterns
   - Implement following patterns
   - Test

4. **Boundaries**: Clear do's and don'ts
   ```markdown
   **DO:**
   - Handle ALL frontend development
   - Write forms with validation

   **DO NOT:**
   - Modify database migrations (use database agent)
   - Push to main without review
   ```

### Database Agent Content

Should include:

1. **Protection Rules**: CRITICAL safety measures
   ```markdown
   ### NEVER RESET DATABASE WITHOUT EXPLICIT USER APPROVAL

   **NEVER run `supabase db reset`** unless absolutely necessary...
   ```

2. **Safe Commands**: Commands that can run without approval
   ```bash
   supabase status
   supabase migration new <name>
   supabase db push      # LOCAL only
   ```

3. **Dangerous Commands**: Commands requiring user approval
   ```bash
   supabase db reset                # Destroys ALL data
   supabase db push --linked        # Deploys to PRODUCTION
   ```

4. **Workflow**: Database-specific steps
   - Check database status
   - Create migrations
   - Test locally
   - Generate types

## Example: Adding a New Stack

To add support for Laravel + MySQL:

```javascript
// lib/stacks/index.js

'laravel-mysql': {
  id: 'laravel-mysql',
  name: 'Laravel + MySQL',
  description: 'Full-stack PHP with Laravel and MySQL',

  developer: {
    name: 'developer',
    description: 'PROACTIVELY use for ALL Laravel development including Blade templates, controllers, Eloquent models, and Vue.js components.',
    techStack: `- **Framework**: Laravel 10, PHP 8.2+
- **Frontend**: Blade Templates, Vue.js 3 (via Inertia.js)
- **Database**: MySQL with Eloquent ORM
- **Testing**: PHPUnit, Pest`,
    fileStructure: `/app
  /Http/Controllers     # Controllers
  /Models               # Eloquent models
/resources
  /views                # Blade templates
  /js                   # Vue components
/database
  /migrations           # Database migrations`,
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
- \`/resources/js/\` - Vue components

### 3. Implement
- Follow Laravel conventions
- Use Eloquent ORM for database operations
- Implement proper validation using Form Requests
- Follow PSR-12 coding standards`,
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
  },

  database: {
    name: 'database',
    description: 'Use proactively for MySQL database management with Laravel migrations, Eloquent schema management, and query optimization.',
    techStack: `- **Database**: MySQL 8.0+
- **ORM**: Laravel Eloquent
- **Migrations**: Laravel migrations
- **Seeding**: Database seeders and factories`,
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
\`\`\``,
    safeCommands: `\`\`\`bash
php artisan make:migration <name>
php artisan migrate                  # Local development
php artisan migrate:status
php artisan db:show
\`\`\``,
    dangerousCommands: `\`\`\`bash
php artisan migrate --force          # Production migration
php artisan migrate:fresh            # Drops all tables
php artisan migrate:reset            # Rolls back all migrations
php artisan db:wipe                  # Drops all tables
\`\`\``,
    protectionRules: `### LOCAL-FIRST DEVELOPMENT

Always test migrations locally using \`php artisan migrate\` before production.

### NEVER DEPLOY WITHOUT APPROVAL

Production migrations with \`--force\` flag require explicit user approval.

### NEVER DROP TABLES WITHOUT APPROVAL

Commands like \`migrate:fresh\` or \`db:wipe\` require explicit user confirmation.`
  }
}
```

After adding this to `lib/stacks/index.js`, the stack is immediately available:

```bash
npx @bryanofearth/claude-agent-kit init
? What stack will you be using?
  Next.js + Supabase
  React + Express + PostgreSQL
  Laravel + MySQL          # ← New option appears
  ...
```

## Generation Functions

### `generateDeveloperAgent(stackId)`

Generates the developer agent markdown file.

**Input**: `stackId` (e.g., `'nextjs-supabase'`)

**Output**: Complete markdown string with frontmatter

**Template**:
```javascript
return `---
name: ${dev.name}
role: developer
description: ${dev.description}
tools: Read, Edit, MultiEdit, Write, Grep, Glob, Bash
model: sonnet
color: green
---

# Purpose

You are the primary developer for this project...

## Tech Stack

${dev.techStack}

## Instructions

${dev.instructions}

## Important Boundaries

${dev.boundaries}

## File Structure

\`\`\`text
${dev.fileStructure}
\`\`\`

## Universal Response Format
...
`;
```

### `generateDatabaseAgent(stackId)`

Generates the database agent markdown file.

**Input**: `stackId`

**Output**: Complete markdown string with frontmatter

**Template**:
```javascript
return `---
name: ${db.name}
role: database
description: ${db.description}
tools: Read, Write, Edit, MultiEdit, Bash, Glob, Grep
model: sonnet
color: blue
---

# Purpose

You are the database administrator for this project...

## Tech Stack

${db.techStack}

## CRITICAL PROTECTION RULES

${db.protectionRules}

## Instructions

${db.instructions}

## Safe vs Dangerous Commands

### Safe (No Approval Needed)
${db.safeCommands}

### DANGEROUS (Require User Approval)
${db.dangerousCommands}
...
`;
```

### `generateStackAgents(stackId)`

Generates both agents for a stack.

**Input**: `stackId`

**Output**: Object with filenames as keys
```javascript
{
  'developer.md': '--- generated developer content ---',
  'database.md': '--- generated database content ---'
}
```

## Testing Generated Agents

### Manual Testing

```bash
# In the package directory
node -e "
import { generateStackAgents } from './lib/generate-agents.js';
const agents = generateStackAgents('nextjs-supabase');
console.log(agents['developer.md']);
"
```

### Automated Testing

```javascript
// test/generate-agents.test.js
import { generateStackAgents } from '../lib/generate-agents.js';

test('generates both agents for nextjs-supabase', () => {
  const agents = generateStackAgents('nextjs-supabase');

  expect(agents).toHaveProperty('developer.md');
  expect(agents).toHaveProperty('database.md');

  expect(agents['developer.md']).toContain('Next.js 14');
  expect(agents['database.md']).toContain('Supabase');
});
```

## Related Documents

- [System Overview](./system-overview.md) - Overall architecture
- [Stack Detection](./stack-detection.md) - How stacks are detected
- [Adding New Stacks](../guides/adding-new-stacks.md) - Step-by-step guide

---

Last updated: 2025-12-18
