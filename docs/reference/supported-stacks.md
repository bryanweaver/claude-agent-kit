# Supported Stacks

Complete list of tech stacks supported by Claude Agent Kit with auto-detection and customized agent generation.

## Overview

Each stack provides:

- **Auto-detection** - Scans your project to identify the stack
- **Generated developer agent** - Customized for your frontend/backend frameworks
- **Generated database agent** - Customized for your database and ORM
- **Stack-specific skills** - Code pattern libraries (where applicable)

## Full-Stack JavaScript/TypeScript

### Next.js + Supabase

**Stack ID**: `nextjs-supabase`

**Technologies**:
- **Frontend**: Next.js 14 (App Router), React 18
- **Styling**: Tailwind CSS, shadcn/ui, lucide-react
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Data Fetching**: TanStack Query, React Hook Form + Zod
- **Testing**: Jest, React Testing Library, Playwright

**Detection**:
- `package.json` contains `next` and `@supabase/supabase-js`
- Optional: `components.json` (shadcn/ui indicator)

**Generated Agents**:
- **developer**: Next.js/React specialist with Server/Client Component expertise
- **database**: Supabase specialist with migration, RLS, and Edge Functions knowledge

**Skills Activated**:
- `supabase-patterns` - RLS policies, migrations, Edge Functions
- `nextjs-app-router` - Server/Client Components, routing, API routes
- `shadcn-components` - CVA variants, forms, Radix UI
- `tanstack-query` - Data fetching, mutations, caching

---

### React + Express + PostgreSQL

**Stack ID**: `react-express-postgres`

**Technologies**:
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS or CSS Modules
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Prisma or Knex)
- **Data Fetching**: TanStack Query, Axios
- **Testing**: Jest, React Testing Library, Supertest

**Detection**:
- `package.json` contains `react` and `express`
- Database: `pg`, `postgres`, `prisma`, or `knex`

**Generated Agents**:
- **developer**: React + Express specialist
- **database**: PostgreSQL specialist with Prisma/Knex expertise

---

### Vue.js + Express + MongoDB

**Stack ID**: `vue-express-mongodb`

**Technologies**:
- **Frontend**: Vue.js 3, TypeScript, Vite
- **State Management**: Pinia
- **Styling**: Tailwind CSS or Vuetify
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **Testing**: Vitest, Vue Test Utils, Supertest

**Detection**:
- `package.json` contains `vue` and `express`
- Database: `mongodb` or `mongoose`

**Generated Agents**:
- **developer**: Vue.js + Express specialist
- **database**: MongoDB specialist with Mongoose expertise

---

## Python Stacks

### Python + Django + PostgreSQL

**Stack ID**: `python-django-postgres`

**Technologies**:
- **Framework**: Django 5.x, Python 3.11+
- **API**: Django REST Framework (DRF)
- **Database**: PostgreSQL via Django ORM
- **Auth**: Django Auth, django-allauth
- **Testing**: pytest, pytest-django
- **Task Queue**: Celery (optional)

**Detection**:
- `requirements.txt` or `pyproject.toml` contains `django`
- Optional: `psycopg2` or `asyncpg` for PostgreSQL

**Generated Agents**:
- **developer**: Django specialist with DRF and ORM expertise
- **database**: Django migrations and PostgreSQL specialist

---

### Python + FastAPI + PostgreSQL

**Stack ID**: `python-fastapi-postgres`

**Technologies**:
- **Framework**: FastAPI, Python 3.11+
- **Validation**: Pydantic v2
- **Database**: PostgreSQL with SQLAlchemy 2.0 (async)
- **Migrations**: Alembic
- **Auth**: OAuth2, JWT (python-jose)
- **Testing**: pytest, pytest-asyncio, httpx
- **Docs**: Auto-generated OpenAPI/Swagger

**Detection**:
- `requirements.txt` or `pyproject.toml` contains `fastapi`
- Optional: `sqlalchemy` or `asyncpg`

**Generated Agents**:
- **developer**: FastAPI specialist with async/await expertise
- **database**: PostgreSQL + Alembic specialist

---

## Generic/Fallback Stacks

### Generic (Tech-Agnostic)

**Stack ID**: `generic`

**Description**: Flexible agents that adapt to any tech stack by analyzing your codebase.

**Use when**:
- Your stack isn't explicitly supported
- You have a custom/unusual tech combination
- You're working on a new/empty project

**Generated Agents**:
- **developer**: Analyzes your project and adapts to detected patterns
- **database**: Adapts to detected database and migration tools

**Detection**:
- Fallback when no specific stack is matched
- Can be manually selected during init

---

## Stack Detection Priority

When multiple stacks could match, detection follows this priority:

1. **Exact frontend + database match**
   - Next.js + Supabase → `nextjs-supabase`
   - React + Express + PostgreSQL → `react-express-postgres`
   - Vue + Express + MongoDB → `vue-express-mongodb`

2. **Next.js without Supabase** → `generic`

3. **Backend framework match**
   - Django (any database) → `python-django-postgres`
   - FastAPI (any database) → `python-fastapi-postgres`

4. **Any detected language** → `generic`

5. **No detection** → `null` (interactive stack selection shown)

## Requesting New Stacks

Don't see your stack? You can:

1. **Use Generic stack** - Works with any technology
2. **Request a new stack** - [Open an issue](https://github.com/bryanweaver/claude-agent-kit/issues)
3. **Add it yourself** - See [Adding New Stacks](../guides/adding-new-stacks.md)

### Popular Requested Stacks

Vote or add your request:

- [ ] Laravel + MySQL (PHP)
- [ ] Ruby on Rails + PostgreSQL
- [ ] Go + Gin + PostgreSQL
- [ ] Rust + Actix + PostgreSQL
- [ ] Python + Flask + PostgreSQL
- [ ] Svelte + SvelteKit + Supabase
- [ ] Angular + NestJS + PostgreSQL
- [ ] Remix + Prisma + PostgreSQL

> **Note**: Ruby, Go, Rust, and Flask projects are detected but currently fall back to the `generic` stack. Using `generic` still gives you working developer and database agents that adapt to your codebase.

## Detection Files

The CLI scans these files to detect your stack:

| File | Language | Frameworks Detected |
|------|----------|---------------------|
| `package.json` | JavaScript/TypeScript | Next.js, React, Vue, Angular, Express, NestJS, etc. |
| `requirements.txt` | Python | Django, FastAPI, Flask, etc. |
| `pyproject.toml` | Python | Same as requirements.txt |
| `Pipfile` | Python | Same as requirements.txt |
| `go.mod` | Go | Gin, Echo, Fiber, etc. |
| `Gemfile` | Ruby | Rails, Sinatra, etc. |
| `Cargo.toml` | Rust | Actix, Axum, Rocket, etc. |
| `composer.json` | PHP | Laravel, Symfony, etc. (future) |

## Stack-Specific Skills

Some stacks include additional code pattern skills:

| Stack | Skills Included |
|-------|-----------------|
| Next.js + Supabase | supabase-patterns, nextjs-app-router, shadcn-components, tanstack-query, testing-patterns |
| React + Express + PostgreSQL | testing-patterns (others may apply) |
| Vue + Express + MongoDB | (testing patterns may apply) |
| Python + Django + PostgreSQL | (Django-specific patterns coming soon) |
| Python + FastAPI + PostgreSQL | (FastAPI-specific patterns coming soon) |

## Related Documents

- [Getting Started](../guides/getting-started.md)
- [Stack Detection](../architecture/stack-detection.md)
- [Adding New Stacks](../guides/adding-new-stacks.md)

---

Last updated: 2026-02-24
