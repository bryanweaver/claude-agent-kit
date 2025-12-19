/**
 * Stack configurations for agent generation
 * Each stack defines the tech-specific content to inject into agent templates
 */

export const stacks = {
  'nextjs-supabase': {
    id: 'nextjs-supabase',
    name: 'Next.js + Supabase',
    description: 'Full-stack TypeScript with Next.js 14, React 18, shadcn/ui, and Supabase',

    developer: {
      name: 'developer',
      description: 'PROACTIVELY use for ALL Next.js/React frontend development, Server/Client Component work, API routes, Supabase integrations, shadcn/ui components, forms, and data fetching. Expert in Next.js 14 App Router, React 18, TypeScript, and modern frontend patterns.',
      techStack: `- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, lucide-react
- **Data**: TanStack Query, React Hook Form + Zod, Supabase
- **Testing**: Jest, React Testing Library, Playwright`,
      fileStructure: `/src
  /app                  # Next.js App Router pages and API routes
  /components/ui        # shadcn/ui components
  /components           # Domain-specific components
  /lib                  # Utilities, Supabase clients
  /hooks                # Custom React hooks
  /types                # TypeScript types (including database.types.ts)`,
      instructions: `### 1. Analyze the Task
Determine if it involves:
- Server Components (data fetching, static content)
- Client Components (interactivity, hooks, browser APIs)
- API Routes (backend logic, Supabase operations)
- UI Components (shadcn/ui patterns)
- Forms (React Hook Form + Zod validation)
- Data fetching (TanStack Query)

### 2. Review Existing Patterns
Check relevant files in the codebase:
- \`/src/app/\` - Page and API route patterns
- \`/src/components/ui/\` - shadcn/ui conventions
- \`/src/components/\` - Domain-specific components
- \`/src/lib/\` - Utilities, Supabase clients
- \`/src/hooks/\` - Custom React hooks
- \`/src/types/\` - TypeScript definitions

### 3. Implement
- Follow existing codebase patterns
- Use Server Components by default, \`'use client'\` only when needed
- Ensure TypeScript types are properly defined
- Handle errors gracefully with user feedback`,
      boundaries: `**DO:**
- Handle ALL Next.js/React frontend development
- Implement API routes and Supabase integrations
- Create/modify shadcn/ui components
- Write forms with React Hook Form + Zod
- Implement data fetching with TanStack Query
- Write frontend tests

**DO NOT:**
- Modify Supabase migrations directly (use database agent)
- Execute destructive database commands
- Push directly to main branch without review`
    },

    database: {
      name: 'database',
      description: 'Use proactively for all Supabase database management, schema changes, migrations, RLS policies, Edge Functions, and performance optimization. Specialist for Supabase administration, security implementation, and local development workflows.',
      techStack: `- **Database**: PostgreSQL via Supabase
- **ORM**: Supabase client with TypeScript
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Functions**: Supabase Edge Functions (Deno)`,
      instructions: `### 1. Initial Assessment
1. Run \`supabase status\` to verify local environment
2. Review \`/supabase/migrations/\` for current state
3. Clarify what database changes are needed
4. Plan changes before implementing

### 2. Implement Changes
- **Always use migrations** for schema changes
- **Follow naming conventions**: \`YYYYMMDDHHMMSS_descriptive_name.sql\`
- **Enable RLS** on all user-facing tables
- **Test locally first** with \`supabase db push\`

### 3. Generate Types
After schema changes:
\`\`\`bash
supabase gen types typescript --local > src/types/database.types.ts
\`\`\``,
      safeCommands: `\`\`\`bash
supabase start|stop|status
supabase migration new <name>
supabase db push                    # LOCAL only
supabase gen types typescript --local
supabase functions serve <name>
\`\`\``,
      dangerousCommands: `\`\`\`bash
supabase db reset                   # Destroys ALL local data
supabase db push --linked           # Deploys to PRODUCTION
supabase functions deploy <name>    # Deploys to PRODUCTION
supabase db pull                    # Can overwrite local work
\`\`\``,
      protectionRules: `### NEVER RESET DATABASE WITHOUT EXPLICIT USER APPROVAL

**NEVER run \`supabase db reset\`** unless absolutely necessary and only after explicit user approval.

### NEVER PUSH TO REMOTE WITHOUT EXPLICIT USER APPROVAL

**NEVER run \`supabase db push --linked\`** or any command that deploys to the remote/production database without explicit user approval.

### LOCAL-FIRST DEVELOPMENT

Always work locally first:
- Use \`supabase start\` for local development
- Test all migrations locally with \`supabase db push\` (no --linked flag)
- Generate and verify types locally
- Only deploy to remote after thorough local testing AND user approval`
    }
  },

  'react-express-postgres': {
    id: 'react-express-postgres',
    name: 'React + Express + PostgreSQL',
    description: 'React frontend with Express.js backend and PostgreSQL database',

    developer: {
      name: 'developer',
      description: 'PROACTIVELY use for ALL React frontend development and Express.js backend work. Expert in React 18, TypeScript, Express.js REST APIs, and PostgreSQL integration patterns.',
      techStack: `- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL with Prisma or Knex
- **Styling**: Tailwind CSS or CSS Modules
- **Data Fetching**: TanStack Query, Axios
- **Testing**: Jest, React Testing Library, Supertest`,
      fileStructure: `/client (or /frontend)
  /src
    /components         # React components
    /hooks              # Custom React hooks
    /pages              # Page components
    /services           # API client functions
    /types              # TypeScript types

/server (or /api)
  /routes               # Express route definitions
  /controllers          # Business logic
  /middleware           # Auth, validation, etc.
  /models               # Database models
  /types                # Shared TypeScript types`,
      instructions: `### 1. Analyze the Task
Determine if it involves:
- React components (functional components, hooks)
- Express routes and controllers
- API endpoints (REST patterns)
- Database queries (through ORM or raw SQL)
- Authentication/Authorization
- Form handling and validation

### 2. Review Existing Patterns
Check relevant directories for established patterns.

### 3. Implement
- Follow existing codebase patterns
- Use TypeScript types for API contracts
- Implement proper error handling
- Use environment variables for configuration
- Follow REST API best practices`,
      boundaries: `**DO:**
- Handle ALL React frontend development
- Implement Express.js routes and controllers
- Write API integrations
- Create reusable components and hooks
- Implement authentication flows
- Write tests

**DO NOT:**
- Modify database migrations directly (use database agent)
- Execute raw SQL that modifies schema
- Push directly to main branch without review`
    },

    database: {
      name: 'database',
      description: 'Use proactively for all PostgreSQL database management, schema changes, migrations, and query optimization. Expert in Prisma, Knex, or raw PostgreSQL with Node.js.',
      techStack: `- **Database**: PostgreSQL
- **ORM Options**: Prisma, Knex.js, or TypeORM
- **Migrations**: Prisma Migrate or Knex migrations
- **Connection**: pg or postgres.js`,
      instructions: `### 1. Initial Assessment
1. Check for existing ORM (Prisma, Knex, etc.)
2. Review migration history
3. Understand current schema state

### 2. Implement Changes

#### If using Prisma:
\`\`\`bash
npx prisma migrate dev --name <migration_name>
npx prisma generate
\`\`\`

#### If using Knex:
\`\`\`bash
npx knex migrate:make <migration_name>
npx knex migrate:latest
\`\`\`

### 3. Generate Types
After schema changes, regenerate TypeScript types.`,
      safeCommands: `\`\`\`bash
# Prisma
npx prisma migrate dev --name <name>  # Local development
npx prisma generate
npx prisma studio

# Knex
npx knex migrate:make <name>
npx knex migrate:latest              # Local
\`\`\``,
      dangerousCommands: `\`\`\`bash
# Prisma
npx prisma migrate deploy            # Production deployment
npx prisma migrate reset             # Destroys data

# Knex
npx knex migrate:latest --env production
npx knex migrate:rollback

# Raw SQL
DROP TABLE, TRUNCATE, DELETE without WHERE
\`\`\``,
      protectionRules: `### LOCAL-FIRST DEVELOPMENT

Always test migrations locally before applying to production.

### NEVER DEPLOY WITHOUT APPROVAL

Production migrations require explicit user approval.`
    }
  },

  'python-django-postgres': {
    id: 'python-django-postgres',
    name: 'Python + Django + PostgreSQL',
    description: 'Full-featured Python web framework with Django ORM and PostgreSQL',

    developer: {
      name: 'developer',
      description: 'PROACTIVELY use for ALL Django development including views, models, templates, Django REST Framework APIs, forms, and admin customization. Expert in Django 5.x, Python best practices, and PostgreSQL integration.',
      techStack: `- **Framework**: Django 5.x, Python 3.11+
- **API**: Django REST Framework (DRF)
- **Database**: PostgreSQL via Django ORM
- **Auth**: Django Auth, django-allauth, or JWT
- **Testing**: pytest, pytest-django
- **Task Queue**: Celery (optional)`,
      fileStructure: `/project
  settings.py           # Django settings
  urls.py               # Root URL config

/apps
  /users                # User management app
    models.py
    views.py
    urls.py
    serializers.py      # DRF serializers
    admin.py
    tests/

/templates              # HTML templates
/static                 # Static files`,
      instructions: `### 1. Analyze the Task
Determine if it involves:
- Models (database schema via Django ORM)
- Views (function-based or class-based)
- Templates (Django template language)
- REST API (DRF serializers, viewsets)
- Forms (Django forms, validation)
- Admin (admin site customization)

### 2. Implement
- Follow Django conventions (MTV pattern)
- Use class-based views where appropriate
- Implement proper form validation
- Use Django's built-in security features
- Follow PEP 8 style guidelines

### 3. Test
- Write tests using pytest-django
- Test views, models, and API endpoints`,
      boundaries: `**DO:**
- Handle ALL Django development
- Create/modify models and run makemigrations
- Implement views (CBV and FBV)
- Build DRF serializers and viewsets
- Create Django forms with validation
- Customize Django admin
- Write tests

**DO NOT:**
- Run migrations on production without approval
- Modify database directly (use Django ORM)
- Push directly to main branch without review`
    },

    database: {
      name: 'database',
      description: 'Use proactively for Django database management, complex migrations, PostgreSQL optimization, and database-level operations that go beyond Django ORM.',
      techStack: `- **Database**: PostgreSQL
- **ORM**: Django ORM
- **Migrations**: Django migrations
- **Admin**: Django Admin for data management`,
      instructions: `### 1. Django Migrations
\`\`\`bash
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations
\`\`\`

### 2. Database Shell
\`\`\`bash
python manage.py dbshell
python manage.py shell_plus  # if django-extensions installed
\`\`\`

### 3. Data Operations
\`\`\`bash
python manage.py loaddata <fixture>
python manage.py dumpdata <app> > fixture.json
\`\`\``,
      safeCommands: `\`\`\`bash
python manage.py makemigrations
python manage.py migrate              # Local
python manage.py showmigrations
python manage.py dbshell
\`\`\``,
      dangerousCommands: `\`\`\`bash
python manage.py migrate --database=production
python manage.py flush                # Deletes all data
DROP TABLE, TRUNCATE in raw SQL
\`\`\``,
      protectionRules: `### LOCAL-FIRST DEVELOPMENT

Always test migrations locally with \`python manage.py migrate\` before production.

### NEVER DEPLOY WITHOUT APPROVAL

Production migrations require explicit user approval.`
    }
  },

  'python-fastapi-postgres': {
    id: 'python-fastapi-postgres',
    name: 'Python + FastAPI + PostgreSQL',
    description: 'Modern async Python API framework with automatic OpenAPI documentation',

    developer: {
      name: 'developer',
      description: 'PROACTIVELY use for ALL FastAPI development including endpoints, Pydantic models, dependency injection, background tasks, and async database operations. Expert in FastAPI, Python async/await, and modern API design.',
      techStack: `- **Framework**: FastAPI, Python 3.11+
- **Validation**: Pydantic v2
- **Database**: PostgreSQL with SQLAlchemy or asyncpg
- **Auth**: OAuth2, JWT (python-jose)
- **Testing**: pytest, pytest-asyncio, httpx
- **Docs**: Auto-generated OpenAPI/Swagger`,
      fileStructure: `/app
  main.py               # FastAPI app entry point
  /api
    /v1
      /endpoints        # Route handlers
      deps.py           # Dependencies
  /core
    config.py           # Settings
    security.py         # Auth utilities
  /models               # SQLAlchemy models
  /schemas              # Pydantic schemas
  /crud                 # Database operations
  /tests`,
      instructions: `### 1. Analyze the Task
Determine if it involves:
- API endpoints (path operations)
- Pydantic schemas (request/response models)
- Database models (SQLAlchemy)
- Dependencies (authentication, database sessions)
- Background tasks
- WebSocket endpoints

### 2. Implement
- Use async/await for I/O operations
- Define Pydantic models for validation
- Use dependency injection for shared logic
- Follow RESTful conventions
- Leverage automatic OpenAPI generation

### 3. Test
- Write async tests with pytest-asyncio
- Use httpx for API testing
- Test both success and error cases`,
      boundaries: `**DO:**
- Handle ALL FastAPI development
- Create Pydantic schemas for validation
- Implement async endpoints
- Set up dependency injection
- Write API tests
- Configure OpenAPI documentation

**DO NOT:**
- Modify database migrations directly (use database agent)
- Execute raw SQL that modifies schema
- Push directly to main branch without review`
    },

    database: {
      name: 'database',
      description: 'Use proactively for PostgreSQL database management with SQLAlchemy, Alembic migrations, and async database operations for FastAPI applications.',
      techStack: `- **Database**: PostgreSQL
- **ORM**: SQLAlchemy 2.0 (async)
- **Migrations**: Alembic
- **Connection**: asyncpg`,
      instructions: `### 1. Alembic Migrations
\`\`\`bash
alembic init alembic
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1
\`\`\`

### 2. SQLAlchemy Models
Define models with proper relationships and indexes.

### 3. Async Sessions
Use async session makers for database operations.`,
      safeCommands: `\`\`\`bash
alembic revision --autogenerate -m "description"
alembic upgrade head                  # Local
alembic history
alembic current
\`\`\``,
      dangerousCommands: `\`\`\`bash
alembic downgrade base                # Rolls back everything
alembic upgrade head (on production)
DROP TABLE, TRUNCATE in raw SQL
\`\`\``,
      protectionRules: `### LOCAL-FIRST DEVELOPMENT

Always test migrations locally before production deployment.

### NEVER DEPLOY WITHOUT APPROVAL

Production migrations require explicit user approval.`
    }
  },

  'vue-express-mongodb': {
    id: 'vue-express-mongodb',
    name: 'Vue.js + Express + MongoDB',
    description: 'Vue.js 3 frontend with Express.js backend and MongoDB database',

    developer: {
      name: 'developer',
      description: 'PROACTIVELY use for ALL Vue.js frontend development and Express.js backend work. Expert in Vue 3 Composition API, TypeScript, Express.js REST APIs, and MongoDB integration.',
      techStack: `- **Frontend**: Vue.js 3, TypeScript, Vite
- **State**: Pinia
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS or Vuetify
- **Testing**: Vitest, Vue Test Utils, Supertest`,
      fileStructure: `/client
  /src
    /components         # Vue components
    /composables        # Composition API hooks
    /views              # Page components
    /stores             # Pinia stores
    /services           # API clients

/server
  /routes               # Express routes
  /controllers          # Business logic
  /models               # Mongoose models
  /middleware           # Auth, validation`,
      instructions: `### 1. Analyze the Task
Determine if it involves:
- Vue components (Composition API)
- Pinia stores (state management)
- Express routes and controllers
- Mongoose models and queries
- Authentication
- Form handling

### 2. Implement
- Use Composition API with \`<script setup>\`
- Follow Vue 3 best practices
- Use TypeScript for type safety
- Implement proper error handling`,
      boundaries: `**DO:**
- Handle ALL Vue.js frontend development
- Implement Express.js routes and controllers
- Create Pinia stores
- Write Vue composables
- Implement authentication flows
- Write tests

**DO NOT:**
- Modify database schemas directly (use database agent)
- Execute destructive database commands
- Push directly to main branch without review`
    },

    database: {
      name: 'database',
      description: 'Use proactively for MongoDB database management, Mongoose schema design, indexes, aggregation pipelines, and database optimization.',
      techStack: `- **Database**: MongoDB
- **ODM**: Mongoose
- **Validation**: Mongoose schemas
- **Indexes**: MongoDB indexes`,
      instructions: `### 1. Mongoose Schemas
Define schemas with proper validation, indexes, and virtuals.

### 2. Database Operations
\`\`\`javascript
// Create indexes
schema.index({ field: 1 });
schema.index({ field1: 1, field2: -1 });

// Aggregation pipelines
Model.aggregate([...]);
\`\`\`

### 3. Migrations
Use migrate-mongo for schema migrations:
\`\`\`bash
npx migrate-mongo create <name>
npx migrate-mongo up
npx migrate-mongo down
\`\`\``,
      safeCommands: `\`\`\`bash
npx migrate-mongo create <name>
npx migrate-mongo up                  # Local
npx migrate-mongo status
mongosh                               # Local shell
\`\`\``,
      dangerousCommands: `\`\`\`bash
db.collection.drop()
db.dropDatabase()
npx migrate-mongo down (on production)
\`\`\``,
      protectionRules: `### LOCAL-FIRST DEVELOPMENT

Always test migrations and schema changes locally first.

### NEVER DEPLOY WITHOUT APPROVAL

Production database changes require explicit user approval.`
    }
  },

  'generic': {
    id: 'generic',
    name: 'Generic (Tech-Agnostic)',
    description: 'Flexible agents that adapt to any tech stack by analyzing your codebase',

    developer: {
      name: 'developer',
      description: 'PROACTIVELY use for code implementation across any tech stack. Adapts to your project by analyzing existing patterns and conventions.',
      techStack: `This agent adapts to your project's tech stack by analyzing:
- Package managers (package.json, requirements.txt, go.mod, etc.)
- Framework patterns in the codebase
- Existing code conventions and style`,
      fileStructure: `Determined by analyzing your project structure.`,
      instructions: `### 1. Analyze the Project
First, scan the project to understand:
- What language(s) are used
- What frameworks are present
- What patterns are established
- What testing tools are configured

### 2. Follow Existing Patterns
- Match the code style already in use
- Follow established architectural patterns
- Use the same libraries and tools

### 3. Implement
- Write code that fits naturally with existing code
- Ask clarifying questions if patterns are unclear
- Test using the project's testing setup`,
      boundaries: `**DO:**
- Adapt to whatever tech stack is present
- Follow existing code patterns
- Ask questions when uncertain
- Write appropriate tests

**DO NOT:**
- Modify database/infrastructure directly (use database agent)
- Push directly to main branch without review
- Introduce new patterns without discussion`
    },

    database: {
      name: 'database',
      description: 'Use proactively for database management across any database system. Adapts to your project\'s database by analyzing existing configuration.',
      techStack: `This agent adapts to your database by detecting:
- Database type (PostgreSQL, MySQL, MongoDB, SQLite, etc.)
- ORM/ODM in use (Prisma, SQLAlchemy, Mongoose, etc.)
- Migration tools configured`,
      instructions: `### 1. Detect Database Setup
Scan for:
- Database configuration files
- ORM/ODM presence
- Existing migrations
- Connection strings (without exposing secrets)

### 2. Follow Existing Patterns
- Use the migration tool already configured
- Follow schema conventions in place
- Match existing query patterns

### 3. Implement
- Create migrations using the project's tools
- Test locally before any remote changes`,
      safeCommands: `Depends on your database setup. Generally safe:
- Creating new migrations
- Running migrations locally
- Generating types/schemas`,
      dangerousCommands: `Always dangerous regardless of database:
- Dropping tables/collections
- Truncating data
- Running migrations on production
- Destructive schema changes`,
      protectionRules: `### LOCAL-FIRST DEVELOPMENT

Always test database changes locally first.

### NEVER DEPLOY WITHOUT APPROVAL

Production database changes require explicit user approval.`
    }
  }
};

/**
 * Get a stack configuration by ID
 * @param {string} stackId - The stack ID
 * @returns {Object|null} Stack configuration or null
 */
export function getStack(stackId) {
  return stacks[stackId] || null;
}

/**
 * Get all available stacks for selection
 * @returns {Array} Array of stack choices
 */
export function getStackChoices() {
  return Object.values(stacks).map(stack => ({
    id: stack.id,
    name: stack.name,
    description: stack.description
  }));
}
