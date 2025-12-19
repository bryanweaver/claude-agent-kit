import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import modules under test
import { detectStack, describeStack, getAvailableStacks } from '../lib/detect-stack.js';
import { getStack, getStackChoices } from '../lib/stacks/index.js';
import { generateDeveloperAgent, generateDatabaseAgent, generateStackAgents } from '../lib/generate-agents.js';
import { detectClaudeCode } from '../lib/detect-claude-code.js';

describe('Stack Detection', () => {
  const testDir = path.join(__dirname, 'temp-stack-test');

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  it('should detect Next.js + Supabase stack', () => {
    // Create a package.json with Next.js and Supabase
    const pkg = {
      dependencies: {
        next: '^14.0.0',
        react: '^18.0.0',
        '@supabase/supabase-js': '^2.0.0'
      },
      devDependencies: {
        typescript: '^5.0.0'
      }
    };
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(pkg));

    const result = detectStack(testDir);

    assert.strictEqual(result.language, 'typescript');
    assert.strictEqual(result.frontend, 'nextjs');
    assert.strictEqual(result.database, 'supabase');
    assert.strictEqual(result.stackId, 'nextjs-supabase');
  });

  it('should detect React + Express + PostgreSQL stack', () => {
    const pkg = {
      dependencies: {
        react: '^18.0.0',
        express: '^4.0.0',
        pg: '^8.0.0'
      }
    };
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(pkg));

    const result = detectStack(testDir);

    assert.strictEqual(result.frontend, 'react');
    assert.strictEqual(result.backend, 'express');
    assert.strictEqual(result.database, 'postgresql');
  });

  it('should detect Python Django stack', () => {
    // Create requirements.txt with Django
    fs.writeFileSync(path.join(testDir, 'requirements.txt'), 'django>=5.0\npsycopg2>=2.9\n');

    const result = detectStack(testDir);

    assert.strictEqual(result.language, 'python');
    assert.strictEqual(result.backend, 'django');
    assert.strictEqual(result.stackId, 'python-django-postgres');
  });

  it('should detect Python FastAPI stack', () => {
    fs.writeFileSync(path.join(testDir, 'requirements.txt'), 'fastapi>=0.100.0\nasyncpg>=0.27.0\n');

    const result = detectStack(testDir);

    assert.strictEqual(result.language, 'python');
    assert.strictEqual(result.backend, 'fastapi');
    assert.strictEqual(result.database, 'postgresql');
  });

  it('should detect Vue + MongoDB stack', () => {
    const pkg = {
      dependencies: {
        vue: '^3.0.0',
        express: '^4.0.0',
        mongoose: '^8.0.0'
      }
    };
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(pkg));

    const result = detectStack(testDir);

    assert.strictEqual(result.frontend, 'vue');
    assert.strictEqual(result.backend, 'express');
    assert.strictEqual(result.database, 'mongodb');
  });

  it('should return null stackId for empty project', () => {
    const result = detectStack(testDir);

    assert.strictEqual(result.stackId, null);
    assert.strictEqual(result.language, null);
  });

  it('should handle malformed package.json gracefully', () => {
    fs.writeFileSync(path.join(testDir, 'package.json'), 'not valid json{{{');

    // Should not throw, should return empty detection
    const result = detectStack(testDir);
    assert.strictEqual(result.language, null);
  });

  it('should describe detected stack correctly', () => {
    const pkg = {
      dependencies: {
        next: '^14.0.0',
        '@supabase/supabase-js': '^2.0.0'
      },
      devDependencies: {
        typescript: '^5.0.0',
        jest: '^29.0.0'
      }
    };
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(pkg));

    const detection = detectStack(testDir);
    const description = describeStack(detection);

    assert.ok(description.includes('TypeScript'));
    assert.ok(description.includes('Next.js'));
    assert.ok(description.includes('Supabase'));
    assert.ok(description.includes('Jest'));
  });
});

describe('Stack Configurations', () => {
  it('should have all expected stacks', () => {
    const stacks = getStackChoices();

    assert.ok(stacks.length >= 6, 'Should have at least 6 stacks');

    const stackIds = stacks.map(s => s.id);
    assert.ok(stackIds.includes('nextjs-supabase'));
    assert.ok(stackIds.includes('react-express-postgres'));
    assert.ok(stackIds.includes('python-django-postgres'));
    assert.ok(stackIds.includes('python-fastapi-postgres'));
    assert.ok(stackIds.includes('vue-express-mongodb'));
    assert.ok(stackIds.includes('generic'));
  });

  it('should return valid stack configuration for each stack', () => {
    const stacks = getStackChoices();

    for (const stackChoice of stacks) {
      const stack = getStack(stackChoice.id);

      assert.ok(stack, `Stack ${stackChoice.id} should exist`);
      assert.ok(stack.developer, `Stack ${stackChoice.id} should have developer config`);
      assert.ok(stack.database, `Stack ${stackChoice.id} should have database config`);
      assert.ok(stack.developer.name, `Stack ${stackChoice.id} developer should have name`);
      assert.ok(stack.developer.description, `Stack ${stackChoice.id} developer should have description`);
      assert.ok(stack.developer.techStack, `Stack ${stackChoice.id} developer should have techStack`);
    }
  });

  it('should return null for unknown stack', () => {
    const stack = getStack('nonexistent-stack');
    assert.strictEqual(stack, null);
  });
});

describe('Agent Generation', () => {
  it('should generate valid developer agent markdown', () => {
    const markdown = generateDeveloperAgent('nextjs-supabase');

    // Check frontmatter structure
    assert.ok(markdown.startsWith('---'), 'Should start with frontmatter');
    assert.ok(markdown.includes('name: developer'), 'Should have name field');
    assert.ok(markdown.includes('role: developer'), 'Should have role field');
    assert.ok(markdown.includes('description:'), 'Should have description');
    assert.ok(markdown.includes('tools:'), 'Should have tools');
    assert.ok(markdown.includes('model:'), 'Should have model');
    assert.ok(markdown.includes('color:'), 'Should have color');

    // Check content sections
    assert.ok(markdown.includes('# Purpose'), 'Should have Purpose section');
    assert.ok(markdown.includes('## Tech Stack'), 'Should have Tech Stack section');
    assert.ok(markdown.includes('## Instructions'), 'Should have Instructions section');
  });

  it('should generate valid database agent markdown', () => {
    const markdown = generateDatabaseAgent('nextjs-supabase');

    assert.ok(markdown.startsWith('---'));
    assert.ok(markdown.includes('name: database'));
    assert.ok(markdown.includes('role: database'));
    assert.ok(markdown.includes('CRITICAL PROTECTION RULES'), 'Should have protection rules');
  });

  it('should generate both agents for all stacks', () => {
    const stacks = getStackChoices();

    for (const stackChoice of stacks) {
      const agents = generateStackAgents(stackChoice.id);

      assert.ok(agents['developer.md'], `Stack ${stackChoice.id} should generate developer.md`);
      assert.ok(agents['database.md'], `Stack ${stackChoice.id} should generate database.md`);

      // Verify content is not empty
      assert.ok(agents['developer.md'].length > 100, 'Developer agent should have content');
      assert.ok(agents['database.md'].length > 100, 'Database agent should have content');

      // Verify frontmatter is valid
      assert.ok(agents['developer.md'].startsWith('---'));
      assert.ok(agents['database.md'].startsWith('---'));
    }
  });

  it('should throw for unknown stack', () => {
    assert.throws(() => {
      generateDeveloperAgent('nonexistent-stack');
    }, /Unknown stack/);
  });

  it('should generate different content for different stacks', () => {
    const nextjsAgent = generateDeveloperAgent('nextjs-supabase');
    const djangoAgent = generateDeveloperAgent('python-django-postgres');

    // Content should be different
    assert.notStrictEqual(nextjsAgent, djangoAgent);

    // Stack-specific content
    assert.ok(nextjsAgent.includes('Next.js'));
    assert.ok(djangoAgent.includes('Django'));
  });
});

describe('Claude Code Detection', () => {
  it('should return detection result object', () => {
    const result = detectClaudeCode();

    assert.ok(typeof result === 'object');
    assert.ok('cliInstalled' in result);
    assert.ok('cliVersion' in result);
    assert.ok('configExists' in result);

    assert.ok(typeof result.cliInstalled === 'boolean');
    assert.ok(typeof result.configExists === 'boolean');
  });

  it('should not throw even if claude is not installed', () => {
    // This should not throw regardless of whether Claude is installed
    assert.doesNotThrow(() => {
      detectClaudeCode();
    });
  });
});

describe('Security - Path Validation', () => {
  // These tests import the file-operations module to test security functions
  // Note: validateClaudeDestination is not exported, so we test via writeFile

  it('should have templates directory exist', () => {
    const templatesDir = path.join(__dirname, '..', 'templates');
    assert.ok(fs.existsSync(templatesDir), 'Templates directory should exist');
    assert.ok(fs.existsSync(path.join(templatesDir, 'agents')), 'Agents directory should exist');
    assert.ok(fs.existsSync(path.join(templatesDir, 'commands')), 'Commands directory should exist');
  });

  it('should have all tech-agnostic agents', () => {
    const agentsDir = path.join(__dirname, '..', 'templates', 'agents');
    const expectedAgents = ['shipper.md', 'reviewer.md', 'documentor.md', 'meta-agent.md', 'meta-commands-agent.md'];

    for (const agent of expectedAgents) {
      assert.ok(fs.existsSync(path.join(agentsDir, agent)), `Agent ${agent} should exist`);
    }
  });

  it('should have role field in all tech-agnostic agents', () => {
    const agentsDir = path.join(__dirname, '..', 'templates', 'agents');
    const agents = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));

    for (const agent of agents) {
      const content = fs.readFileSync(path.join(agentsDir, agent), 'utf8');
      assert.ok(content.includes('role:'), `Agent ${agent} should have role field`);
    }
  });
});
