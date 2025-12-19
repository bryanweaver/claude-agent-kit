import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { getStackChoices } from './stacks/index.js';

/**
 * Stack detection result
 * @typedef {Object} StackDetection
 * @property {string|null} language - Primary language (javascript, typescript, python, etc.)
 * @property {string|null} frontend - Frontend framework (nextjs, react, vue, angular, etc.)
 * @property {string|null} backend - Backend framework (express, django, fastapi, etc.)
 * @property {string|null} database - Database (postgresql, supabase, mongodb, mysql, etc.)
 * @property {string|null} testing - Testing framework (jest, pytest, vitest, etc.)
 * @property {string|null} ui - UI library (shadcn, tailwind, bootstrap, etc.)
 * @property {string|null} stackId - Identified stack template ID
 * @property {Object} raw - Raw detection data for debugging
 */

/**
 * Read and parse JSON file safely
 * @param {string} filePath - Path to JSON file
 * @returns {Object|null} Parsed JSON or null
 */
function readJsonSafe(filePath) {
  try {
    if (!existsSync(filePath)) {return null;}
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Read file content safely
 * @param {string} filePath - Path to file
 * @returns {string|null} File content or null
 */
function readFileSafe(filePath) {
  try {
    if (!existsSync(filePath)) {return null;}
    return readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Check if a dependency exists in package.json
 * @param {Object} pkg - Package.json content
 * @param {string} name - Dependency name
 * @returns {boolean}
 */
function hasDependency(pkg, name) {
  if (!pkg) {return false;}
  return !!(
    pkg.dependencies?.[name] ||
    pkg.devDependencies?.[name] ||
    pkg.peerDependencies?.[name]
  );
}

/**
 * Detect JavaScript/TypeScript stack from package.json
 * @param {string} projectPath - Project root path
 * @returns {Object} Detected stack components
 */
function detectFromPackageJson(projectPath) {
  const result = {
    language: null,
    frontend: null,
    backend: null,
    database: null,
    testing: null,
    ui: null
  };

  const pkg = readJsonSafe(path.join(projectPath, 'package.json'));
  if (!pkg) {return result;}

  // Language detection
  if (hasDependency(pkg, 'typescript') || existsSync(path.join(projectPath, 'tsconfig.json'))) {
    result.language = 'typescript';
  } else {
    result.language = 'javascript';
  }

  // Frontend framework detection (order matters - more specific first)
  if (hasDependency(pkg, 'next')) {
    result.frontend = 'nextjs';
  } else if (hasDependency(pkg, 'nuxt')) {
    result.frontend = 'nuxt';
  } else if (hasDependency(pkg, 'vue')) {
    result.frontend = 'vue';
  } else if (hasDependency(pkg, 'react')) {
    result.frontend = 'react';
  } else if (hasDependency(pkg, '@angular/core')) {
    result.frontend = 'angular';
  } else if (hasDependency(pkg, 'svelte')) {
    result.frontend = 'svelte';
  }

  // Backend framework detection
  if (hasDependency(pkg, 'express')) {
    result.backend = 'express';
  } else if (hasDependency(pkg, '@nestjs/core')) {
    result.backend = 'nestjs';
  } else if (hasDependency(pkg, 'fastify')) {
    result.backend = 'fastify';
  } else if (hasDependency(pkg, 'koa')) {
    result.backend = 'koa';
  } else if (hasDependency(pkg, 'hono')) {
    result.backend = 'hono';
  }

  // Next.js is also a backend
  if (result.frontend === 'nextjs' && !result.backend) {
    result.backend = 'nextjs';
  }

  // Database detection
  if (hasDependency(pkg, '@supabase/supabase-js')) {
    result.database = 'supabase';
  } else if (hasDependency(pkg, 'firebase') || hasDependency(pkg, 'firebase-admin')) {
    result.database = 'firebase';
  } else if (hasDependency(pkg, 'mongodb') || hasDependency(pkg, 'mongoose')) {
    result.database = 'mongodb';
  } else if (hasDependency(pkg, 'pg') || hasDependency(pkg, 'postgres') || hasDependency(pkg, '@prisma/client')) {
    result.database = 'postgresql';
  } else if (hasDependency(pkg, 'mysql') || hasDependency(pkg, 'mysql2')) {
    result.database = 'mysql';
  } else if (hasDependency(pkg, 'better-sqlite3') || hasDependency(pkg, 'sqlite3')) {
    result.database = 'sqlite';
  }

  // Check for Prisma (indicates database usage)
  if (hasDependency(pkg, 'prisma') || hasDependency(pkg, '@prisma/client')) {
    if (!result.database) {result.database = 'postgresql';} // Prisma default
  }

  // Testing framework detection
  if (hasDependency(pkg, 'vitest')) {
    result.testing = 'vitest';
  } else if (hasDependency(pkg, 'jest')) {
    result.testing = 'jest';
  } else if (hasDependency(pkg, 'mocha')) {
    result.testing = 'mocha';
  } else if (hasDependency(pkg, '@playwright/test')) {
    result.testing = 'playwright';
  } else if (hasDependency(pkg, 'cypress')) {
    result.testing = 'cypress';
  }

  // UI library detection
  if (hasDependency(pkg, 'tailwindcss')) {
    result.ui = 'tailwind';
  }
  if (hasDependency(pkg, '@radix-ui/react-slot') || existsSync(path.join(projectPath, 'components.json'))) {
    result.ui = 'shadcn';
  } else if (hasDependency(pkg, '@chakra-ui/react')) {
    result.ui = 'chakra';
  } else if (hasDependency(pkg, '@mui/material')) {
    result.ui = 'mui';
  } else if (hasDependency(pkg, 'bootstrap') || hasDependency(pkg, 'react-bootstrap')) {
    result.ui = 'bootstrap';
  }

  return result;
}

/**
 * Detect Python stack from requirements.txt, pyproject.toml, or Pipfile
 * @param {string} projectPath - Project root path
 * @returns {Object} Detected stack components
 */
function detectFromPython(projectPath) {
  const result = {
    language: null,
    frontend: null,
    backend: null,
    database: null,
    testing: null,
    ui: null
  };

  // Check for Python project markers
  const hasPyproject = existsSync(path.join(projectPath, 'pyproject.toml'));
  const hasRequirements = existsSync(path.join(projectPath, 'requirements.txt'));
  const hasPipfile = existsSync(path.join(projectPath, 'Pipfile'));
  const hasSetupPy = existsSync(path.join(projectPath, 'setup.py'));

  if (!hasPyproject && !hasRequirements && !hasPipfile && !hasSetupPy) {
    return result;
  }

  result.language = 'python';

  // Read requirements content
  let requirementsContent = '';
  if (hasRequirements) {
    requirementsContent = readFileSafe(path.join(projectPath, 'requirements.txt')) || '';
  }

  // Read pyproject.toml content
  let pyprojectContent = '';
  if (hasPyproject) {
    pyprojectContent = readFileSafe(path.join(projectPath, 'pyproject.toml')) || '';
  }

  const allContent = (requirementsContent + '\n' + pyprojectContent).toLowerCase();

  // Backend framework detection
  if (allContent.includes('django')) {
    result.backend = 'django';
  } else if (allContent.includes('fastapi')) {
    result.backend = 'fastapi';
  } else if (allContent.includes('flask')) {
    result.backend = 'flask';
  } else if (allContent.includes('tornado')) {
    result.backend = 'tornado';
  } else if (allContent.includes('starlette')) {
    result.backend = 'starlette';
  }

  // Database detection
  if (allContent.includes('supabase')) {
    result.database = 'supabase';
  } else if (allContent.includes('psycopg') || allContent.includes('asyncpg') || allContent.includes('postgresql')) {
    result.database = 'postgresql';
  } else if (allContent.includes('pymongo') || allContent.includes('motor')) {
    result.database = 'mongodb';
  } else if (allContent.includes('mysql') || allContent.includes('pymysql')) {
    result.database = 'mysql';
  } else if (allContent.includes('sqlite')) {
    result.database = 'sqlite';
  }

  // SQLAlchemy often used with PostgreSQL
  if (allContent.includes('sqlalchemy') && !result.database) {
    result.database = 'postgresql';
  }

  // Testing framework detection
  if (allContent.includes('pytest')) {
    result.testing = 'pytest';
  } else if (allContent.includes('unittest')) {
    result.testing = 'unittest';
  }

  return result;
}

/**
 * Detect Go stack
 * @param {string} projectPath - Project root path
 * @returns {Object} Detected stack components
 */
function detectFromGo(projectPath) {
  const result = {
    language: null,
    frontend: null,
    backend: null,
    database: null,
    testing: null,
    ui: null
  };

  const goModPath = path.join(projectPath, 'go.mod');
  if (!existsSync(goModPath)) {return result;}

  result.language = 'go';
  result.testing = 'go-test'; // Built-in

  const goModContent = readFileSafe(goModPath) || '';
  const contentLower = goModContent.toLowerCase();

  // Backend framework detection
  if (contentLower.includes('gin-gonic/gin')) {
    result.backend = 'gin';
  } else if (contentLower.includes('labstack/echo')) {
    result.backend = 'echo';
  } else if (contentLower.includes('gofiber/fiber')) {
    result.backend = 'fiber';
  } else if (contentLower.includes('gorilla/mux')) {
    result.backend = 'gorilla';
  }

  // Database detection
  if (contentLower.includes('lib/pq') || contentLower.includes('jackc/pgx')) {
    result.database = 'postgresql';
  } else if (contentLower.includes('go-sql-driver/mysql')) {
    result.database = 'mysql';
  } else if (contentLower.includes('mongodb/mongo-go-driver')) {
    result.database = 'mongodb';
  }

  return result;
}

/**
 * Detect Ruby/Rails stack
 * @param {string} projectPath - Project root path
 * @returns {Object} Detected stack components
 */
function detectFromRuby(projectPath) {
  const result = {
    language: null,
    frontend: null,
    backend: null,
    database: null,
    testing: null,
    ui: null
  };

  const gemfilePath = path.join(projectPath, 'Gemfile');
  if (!existsSync(gemfilePath)) {return result;}

  result.language = 'ruby';

  const gemfileContent = readFileSafe(gemfilePath) || '';
  const contentLower = gemfileContent.toLowerCase();

  // Backend framework detection
  if (contentLower.includes('rails')) {
    result.backend = 'rails';
  } else if (contentLower.includes('sinatra')) {
    result.backend = 'sinatra';
  } else if (contentLower.includes('hanami')) {
    result.backend = 'hanami';
  }

  // Database detection
  if (contentLower.includes('pg')) {
    result.database = 'postgresql';
  } else if (contentLower.includes('mysql2')) {
    result.database = 'mysql';
  } else if (contentLower.includes('sqlite3')) {
    result.database = 'sqlite';
  } else if (contentLower.includes('mongoid')) {
    result.database = 'mongodb';
  }

  // Testing framework detection
  if (contentLower.includes('rspec')) {
    result.testing = 'rspec';
  } else if (contentLower.includes('minitest')) {
    result.testing = 'minitest';
  }

  return result;
}

/**
 * Detect Rust stack
 * @param {string} projectPath - Project root path
 * @returns {Object} Detected stack components
 */
function detectFromRust(projectPath) {
  const result = {
    language: null,
    frontend: null,
    backend: null,
    database: null,
    testing: null,
    ui: null
  };

  const cargoPath = path.join(projectPath, 'Cargo.toml');
  if (!existsSync(cargoPath)) {return result;}

  result.language = 'rust';
  result.testing = 'cargo-test'; // Built-in

  const cargoContent = readFileSafe(cargoPath) || '';
  const contentLower = cargoContent.toLowerCase();

  // Backend framework detection
  if (contentLower.includes('actix-web')) {
    result.backend = 'actix';
  } else if (contentLower.includes('axum')) {
    result.backend = 'axum';
  } else if (contentLower.includes('rocket')) {
    result.backend = 'rocket';
  } else if (contentLower.includes('warp')) {
    result.backend = 'warp';
  }

  // Database detection
  if (contentLower.includes('tokio-postgres') || contentLower.includes('sqlx') && contentLower.includes('postgres')) {
    result.database = 'postgresql';
  } else if (contentLower.includes('mongodb')) {
    result.database = 'mongodb';
  }

  return result;
}

/**
 * Map detected stack to a known stack template ID
 * @param {Object} detection - Detection result
 * @returns {string|null} Stack template ID
 */
function mapToStackTemplate(detection) {
  const { frontend, backend, database } = detection;

  // Next.js + Supabase
  if (frontend === 'nextjs' && database === 'supabase') {
    return 'nextjs-supabase';
  }

  // Next.js + PostgreSQL (without Supabase)
  if (frontend === 'nextjs' && database === 'postgresql') {
    return 'nextjs-postgres';
  }

  // React + Express + PostgreSQL
  if (frontend === 'react' && backend === 'express' && database === 'postgresql') {
    return 'react-express-postgres';
  }

  // React + Express + MongoDB
  if (frontend === 'react' && backend === 'express' && database === 'mongodb') {
    return 'react-express-mongodb';
  }

  // Vue + Express + MongoDB
  if (frontend === 'vue' && backend === 'express' && database === 'mongodb') {
    return 'vue-express-mongodb';
  }

  // Vue + Node + PostgreSQL
  if (frontend === 'vue' && (backend === 'express' || backend === 'fastify') && database === 'postgresql') {
    return 'vue-node-postgres';
  }

  // Django + PostgreSQL
  if (backend === 'django' && (database === 'postgresql' || !database)) {
    return 'python-django-postgres';
  }

  // FastAPI + PostgreSQL
  if (backend === 'fastapi' && (database === 'postgresql' || !database)) {
    return 'python-fastapi-postgres';
  }

  // Flask + PostgreSQL
  if (backend === 'flask') {
    return 'python-flask-postgres';
  }

  // Ruby on Rails
  if (backend === 'rails') {
    return 'ruby-rails-postgres';
  }

  // Go + Gin + PostgreSQL
  if (detection.language === 'go' && database === 'postgresql') {
    return 'go-gin-postgres';
  }

  // Rust + Actix
  if (detection.language === 'rust' && backend === 'actix') {
    return 'rust-actix-postgres';
  }

  // Fallback to generic based on language
  if (detection.language === 'python') {
    return 'python-generic';
  }
  if (detection.language === 'go') {
    return 'go-generic';
  }
  if (detection.language === 'ruby') {
    return 'ruby-generic';
  }
  if (detection.language === 'rust') {
    return 'rust-generic';
  }
  if (detection.language === 'typescript' || detection.language === 'javascript') {
    return 'node-generic';
  }

  return null;
}

/**
 * Detect the tech stack of a project
 * @param {string} projectPath - Path to the project root (defaults to cwd)
 * @returns {StackDetection} Detected stack information
 */
export function detectStack(projectPath = process.cwd()) {
  const result = {
    language: null,
    frontend: null,
    backend: null,
    database: null,
    testing: null,
    ui: null,
    stackId: null,
    raw: {}
  };

  // Run all detectors
  const jsStack = detectFromPackageJson(projectPath);
  const pyStack = detectFromPython(projectPath);
  const goStack = detectFromGo(projectPath);
  const rubyStack = detectFromRuby(projectPath);
  const rustStack = detectFromRust(projectPath);

  // Store raw results for debugging
  result.raw = {
    javascript: jsStack,
    python: pyStack,
    go: goStack,
    ruby: rubyStack,
    rust: rustStack
  };

  // Merge results (prefer non-null values, JS/TS takes precedence for frontend)
  const stacks = [jsStack, pyStack, goStack, rubyStack, rustStack];

  for (const stack of stacks) {
    if (stack.language && !result.language) {result.language = stack.language;}
    if (stack.frontend && !result.frontend) {result.frontend = stack.frontend;}
    if (stack.backend && !result.backend) {result.backend = stack.backend;}
    if (stack.database && !result.database) {result.database = stack.database;}
    if (stack.testing && !result.testing) {result.testing = stack.testing;}
    if (stack.ui && !result.ui) {result.ui = stack.ui;}
  }

  // Map to known stack template
  result.stackId = mapToStackTemplate(result);

  return result;
}

/**
 * Get a human-readable description of the detected stack
 * @param {StackDetection} detection - Detection result
 * @returns {string[]} Array of detected technology descriptions
 */
export function describeStack(detection) {
  const descriptions = [];

  if (detection.language) {
    const langMap = {
      typescript: 'TypeScript',
      javascript: 'JavaScript',
      python: 'Python',
      go: 'Go',
      ruby: 'Ruby',
      rust: 'Rust'
    };
    descriptions.push(langMap[detection.language] || detection.language);
  }

  if (detection.frontend) {
    const frontendMap = {
      nextjs: 'Next.js',
      react: 'React',
      vue: 'Vue.js',
      angular: 'Angular',
      svelte: 'Svelte',
      nuxt: 'Nuxt'
    };
    descriptions.push(frontendMap[detection.frontend] || detection.frontend);
  }

  if (detection.backend && detection.backend !== detection.frontend) {
    const backendMap = {
      express: 'Express.js',
      nestjs: 'NestJS',
      fastify: 'Fastify',
      django: 'Django',
      fastapi: 'FastAPI',
      flask: 'Flask',
      rails: 'Ruby on Rails',
      gin: 'Gin',
      actix: 'Actix Web'
    };
    descriptions.push(backendMap[detection.backend] || detection.backend);
  }

  if (detection.database) {
    const dbMap = {
      supabase: 'Supabase',
      postgresql: 'PostgreSQL',
      mongodb: 'MongoDB',
      mysql: 'MySQL',
      sqlite: 'SQLite',
      firebase: 'Firebase'
    };
    descriptions.push(dbMap[detection.database] || detection.database);
  }

  if (detection.ui) {
    const uiMap = {
      shadcn: 'shadcn/ui',
      tailwind: 'Tailwind CSS',
      chakra: 'Chakra UI',
      mui: 'Material UI',
      bootstrap: 'Bootstrap'
    };
    descriptions.push(uiMap[detection.ui] || detection.ui);
  }

  if (detection.testing) {
    const testMap = {
      jest: 'Jest',
      vitest: 'Vitest',
      pytest: 'pytest',
      rspec: 'RSpec',
      'go-test': 'Go testing',
      'cargo-test': 'Cargo test'
    };
    descriptions.push(testMap[detection.testing] || detection.testing);
  }

  return descriptions;
}

/**
 * Get list of available stack templates
 * Derives from the authoritative stack definitions in lib/stacks/index.js
 * @returns {Object[]} Array of stack template info
 */
export function getAvailableStacks() {
  return getStackChoices();
}
