# Stack Detection

The stack detection system analyzes your project to identify the technologies in use and map them to a known stack template.

## Detection Flow

```
Project Directory
      │
      ▼
┌─────────────────────────────────────┐
│  detectStack(projectPath)            │
│                                      │
│  1. Run all language detectors       │
│     - detectFromPackageJson()        │
│     - detectFromPython()             │
│     - detectFromGo()                 │
│     - detectFromRuby()               │
│     - detectFromRust()               │
│                                      │
│  2. Merge results                    │
│  3. Map to stack template            │
└────────────┬────────────────────────┘
             │
             ▼
        Detection Result
        {
          language: 'typescript',
          frontend: 'nextjs',
          backend: 'nextjs',
          database: 'supabase',
          testing: 'jest',
          ui: 'shadcn',
          stackId: 'nextjs-supabase'
        }
```

## Language-Specific Detectors

### JavaScript/TypeScript Detection

**File**: `lib/detect-stack.js` → `detectFromPackageJson()`

**Sources**:
- `package.json` (dependencies, devDependencies, peerDependencies)
- `tsconfig.json` (presence indicates TypeScript)

**Detection logic**:

1. **Language**: TypeScript if `typescript` dependency or `tsconfig.json` exists, else JavaScript
2. **Frontend**: Check for Next.js → Nuxt → Vue → React → Angular → Svelte
3. **Backend**: Check for Express → NestJS → Fastify → Koa → Hono
   - Special case: If Next.js is detected as frontend, also set as backend
4. **Database**: Check for Supabase → Firebase → MongoDB → PostgreSQL → MySQL → SQLite
5. **UI Library**: Check for shadcn/ui → Chakra UI → Material UI → Bootstrap → Tailwind CSS
   (shadcn/ui is checked first since it implies Tailwind; Tailwind alone is the lowest priority UI match)
6. **Testing**: Check for Vitest → Jest → Mocha → Playwright → Cypress

**Example**:
```javascript
{
  "dependencies": {
    "next": "^14.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "lucide-react": "^0.263.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@radix-ui/react-slot": "^1.0.0"
  }
}
```
→ Detects: TypeScript, Next.js, Supabase, shadcn/ui

### Python Detection

**File**: `lib/detect-stack.js` → `detectFromPython()`

**Sources**:
- `requirements.txt`
- `pyproject.toml`
- `Pipfile`
- `setup.py`

**Detection logic**:

1. **Language**: Python if any Python project file exists
2. **Backend**: Django → FastAPI → Flask → Tornado → Starlette
3. **Database**: Supabase → PostgreSQL (psycopg/asyncpg) → MongoDB → MySQL → SQLite
   - If SQLAlchemy is present without explicit database, assume PostgreSQL
4. **Testing**: pytest → unittest

**Example**:
```
# requirements.txt
django==5.0.0
psycopg2-binary==2.9.0
pytest==7.4.0
```
→ Detects: Python, Django, PostgreSQL, pytest

### Go Detection

**File**: `lib/detect-stack.js` → `detectFromGo()`

**Sources**:
- `go.mod`

**Detection logic**:

1. **Language**: Go if `go.mod` exists
2. **Backend**: Gin → Echo → Fiber → Gorilla Mux
3. **Database**: PostgreSQL (lib/pq or pgx) → MySQL → MongoDB
4. **Testing**: Go's built-in testing

**Example**:
```
// go.mod
module example.com/myapp

require (
    github.com/gin-gonic/gin v1.9.0
    github.com/lib/pq v1.10.0
)
```
→ Detects: Go, Gin, PostgreSQL

### Ruby Detection

**File**: `lib/detect-stack.js` → `detectFromRuby()`

**Sources**:
- `Gemfile`

**Detection logic**:

1. **Language**: Ruby if `Gemfile` exists
2. **Backend**: Rails → Sinatra → Hanami
3. **Database**: PostgreSQL (pg gem) → MySQL → SQLite → MongoDB
4. **Testing**: RSpec → Minitest

### Rust Detection

**File**: `lib/detect-stack.js` → `detectFromRust()`

**Sources**:
- `Cargo.toml`

**Detection logic**:

1. **Language**: Rust if `Cargo.toml` exists
2. **Backend**: Actix-web → Axum → Rocket → Warp
3. **Database**: PostgreSQL if `tokio-postgres` present, or if `sqlx` AND `postgres` both appear; MongoDB otherwise
4. **Testing**: Cargo's built-in testing

## Stack Template Mapping

After detection, results are mapped to a known stack template ID.

**File**: `lib/detect-stack.js` → `mapToStackTemplate()`

**Mapping rules** (in priority order):

```javascript
// Exact match: Next.js + Supabase
if (frontend === 'nextjs' && database === 'supabase')
  return 'nextjs-supabase';

// Next.js without Supabase falls back to generic
if (frontend === 'nextjs')
  return 'generic';

// React + Express + PostgreSQL
if (frontend === 'react' && backend === 'express' && database === 'postgresql')
  return 'react-express-postgres';

// Vue + Express + MongoDB
if (frontend === 'vue' && backend === 'express' && database === 'mongodb')
  return 'vue-express-mongodb';

// Backend-focused matches
if (backend === 'django')
  return 'python-django-postgres';

if (backend === 'fastapi')
  return 'python-fastapi-postgres';

// Any detected language falls back to generic
if (detection.language)
  return 'generic';

// No detection at all
return null;
```

> **Note**: Language-specific generic stack IDs (`node-generic`, `python-generic`, etc.) were removed in the refactoring. Any project with a detected language but no matched framework now maps directly to `generic`.

## Interactive Stack Selection

If the user declines the auto-detected stack or no stack is detected, an interactive prompt appears:

```bash
? What stack will you be using?
  Next.js + Supabase
  React + Express + PostgreSQL
  Python + Django + PostgreSQL
  Python + FastAPI + PostgreSQL
  Vue.js + Express + MongoDB
❯ Generic (Tech-Agnostic)
```

**Implementation**: Uses `@inquirer/prompts` for selection.

## Detection Accuracy

### High Confidence Detection

These are very reliable:

- Next.js + Supabase (unique dependency combination)
- Django (Django is the framework and project structure marker)
- Rails (Rails gemfile patterns are distinctive)

### Medium Confidence Detection

May need user confirmation:

- React + Express + PostgreSQL (common, but many variations)
- Vue + Express + MongoDB (similar to MERN stack)

### Low Confidence / Ambiguous

Falls back to interactive selection:

- New projects with no dependencies yet
- Polyglot projects (e.g., Go backend + React frontend in monorepo)
- Custom/unusual stack combinations

## Extending Detection

To add detection for a new language or framework:

### 1. Add a new detector function

```javascript
// lib/detect-stack.js

function detectFromNewLanguage(projectPath) {
  const result = {
    language: null,
    frontend: null,
    backend: null,
    database: null,
    testing: null,
    ui: null
  };

  // Check for language-specific files
  const configFile = path.join(projectPath, 'config-file.ext');
  if (!existsSync(configFile)) return result;

  result.language = 'newlang';

  // Parse and detect frameworks
  // ...

  return result;
}
```

### 2. Call it in `detectStack()`

```javascript
export function detectStack(projectPath = process.cwd()) {
  // ... existing code ...

  const newLangStack = detectFromNewLanguage(projectPath);

  result.raw = {
    javascript: jsStack,
    python: pyStack,
    go: goStack,
    ruby: rubyStack,
    rust: rustStack,
    newlang: newLangStack  // Add here
  };

  const stacks = [jsStack, pyStack, goStack, rubyStack, rustStack, newLangStack];

  // ... rest of function ...
}
```

### 3. Add stack mapping rules

```javascript
function mapToStackTemplate(detection) {
  // ... existing rules ...

  if (detection.language === 'newlang' && detection.backend === 'newframework') {
    return 'newlang-newframework-stack';
  }

  // ... rest of function ...
}
```

### 4. Add stack template

See [Adding New Stacks](../guides/adding-new-stacks.md) for creating the stack template.

## Testing Detection

Test the detection logic:

```bash
# In a test project directory
node -e "
import { detectStack, describeStack } from './lib/detect-stack.js';
const result = detectStack('.');
console.log('Detection:', result);
console.log('Description:', describeStack(result));
"
```

## Related Documents

- [System Overview](./system-overview.md) - Overall architecture
- [Agent Generation](./agent-generation.md) - How detected stacks are used
- [Adding New Stacks](../guides/adding-new-stacks.md) - Creating new stack templates

---

Last updated: 2026-02-24
