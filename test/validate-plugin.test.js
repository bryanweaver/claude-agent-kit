import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse simple flat YAML frontmatter (--- delimited) into an object. */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) fm[key] = value;
  }
  return fm;
}

/** List files matching a glob-ish pattern relative to ROOT. */
function listFiles(dir, ext) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f => f.endsWith(ext)).map(f => path.join(dir, f));
}

/** Read a file relative to ROOT. */
function readFile(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

/** Check whether a path exists relative to ROOT. */
function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

const VALID_MODELS = ['sonnet', 'opus', 'haiku'];
const VALID_TOOLS = [
  'Read', 'Write', 'Edit', 'MultiEdit', 'Bash', 'Grep', 'Glob',
  'WebFetch', 'WebSearch', 'Task', 'NotebookEdit',
];

// ---------------------------------------------------------------------------
// 1. Frontmatter validation
// ---------------------------------------------------------------------------

describe('Frontmatter validation', () => {
  const agentFiles = listFiles('agents', '.md');

  it('finds at least one agent file', () => {
    assert.ok(agentFiles.length > 0, 'No agent files found in agents/');
  });

  for (const file of agentFiles) {
    describe(`agents/${path.basename(file)}`, () => {
      const content = readFile(file);
      const fm = parseFrontmatter(content);

      it('has valid frontmatter', () => {
        assert.ok(fm, `Missing or invalid frontmatter in ${file}`);
      });

      it('has required field: name', () => {
        assert.ok(fm?.name, `Missing "name" in ${file}`);
      });

      it('has required field: description', () => {
        assert.ok(fm?.description, `Missing "description" in ${file}`);
      });

      it('has required field: tools', () => {
        assert.ok(fm?.tools, `Missing "tools" in ${file}`);
      });

      it('has required field: model', () => {
        assert.ok(fm?.model, `Missing "model" in ${file}`);
      });

      it('model is a known value', () => {
        assert.ok(
          VALID_MODELS.includes(fm?.model),
          `Invalid model "${fm?.model}" in ${file}. Expected one of: ${VALID_MODELS.join(', ')}`,
        );
      });

      it('tools contain only known tool names', () => {
        const tools = (fm?.tools || '').split(',').map(t => t.trim()).filter(Boolean);
        for (const tool of tools) {
          assert.ok(
            VALID_TOOLS.includes(tool),
            `Unknown tool "${tool}" in ${file}. Known tools: ${VALID_TOOLS.join(', ')}`,
          );
        }
      });
    });
  }

  // Skill frontmatter
  const skillDirs = fs.existsSync(path.join(ROOT, 'skills'))
    ? fs.readdirSync(path.join(ROOT, 'skills'), { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
    : [];

  for (const dir of skillDirs) {
    const skillFile = `skills/${dir}/SKILL.md`;
    if (!exists(skillFile)) continue;

    describe(`skills/${dir}/SKILL.md`, () => {
      const content = readFile(skillFile);
      const fm = parseFrontmatter(content);

      it('has valid frontmatter', () => {
        assert.ok(fm, `Missing or invalid frontmatter in ${skillFile}`);
      });

      it('has required field: name', () => {
        assert.ok(fm?.name, `Missing "name" in ${skillFile}`);
      });

      it('has required field: description', () => {
        assert.ok(fm?.description, `Missing "description" in ${skillFile}`);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Cross-reference integrity: skills → agents
// ---------------------------------------------------------------------------

describe('Cross-reference integrity: skills → agents', () => {
  const skillDirs = fs.existsSync(path.join(ROOT, 'skills'))
    ? fs.readdirSync(path.join(ROOT, 'skills'), { withFileTypes: true })
        .filter(d => d.isDirectory() && d.name.startsWith('team-'))
        .map(d => d.name)
    : [];

  for (const dir of skillDirs) {
    const skillFile = `skills/${dir}/SKILL.md`;
    if (!exists(skillFile)) continue;

    describe(`skills/${dir}`, () => {
      const content = readFile(skillFile);

      // Derive known agent names from the filesystem
      const knownAgentNames = new Set(
        listFiles('agents', '.md').map(f => path.basename(f, '.md')),
      );

      // Extract agent names from Task(agent, ...) calls
      const taskCallMatches = [...content.matchAll(/Task\(\s*["'`]?([\w-]+)["'`]?/g)];
      // Extract agent names from task table Owner column (| owner-name |)
      const tableOwnerMatches = [...content.matchAll(/\|\s*([\w-]+)\s*\|/g)];

      // Collect referenced agents — Task() args are always agent names,
      // table matches are filtered to known agents (tables contain non-agent text too)
      const referenced = new Set();
      for (const m of taskCallMatches) {
        referenced.add(m[1]);
      }
      for (const m of tableOwnerMatches) {
        if (knownAgentNames.has(m[1])) referenced.add(m[1]);
      }

      for (const agent of referenced) {
        it(`references agent "${agent}" which exists in agents/`, () => {
          assert.ok(
            exists(`agents/${agent}.md`),
            `Skill ${dir} references agent "${agent}" but agents/${agent}.md does not exist`,
          );
        });
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 3. Cross-reference integrity: agents → skills
// ---------------------------------------------------------------------------

describe('Cross-reference integrity: agents → skills', () => {
  const agentsToCheck = listFiles('agents', '.md').map(f => path.basename(f, '.md'));

  for (const agent of agentsToCheck) {
    const agentFile = `agents/${agent}.md`;
    if (!exists(agentFile)) continue;

    describe(`agents/${agent}.md`, () => {
      const content = readFile(agentFile);

      // Extract backtick-quoted skill names (e.g. `nextjs-app-router`)
      const matches = [...content.matchAll(/`([\w-]+)`/g)];

      const skillDirs = fs.existsSync(path.join(ROOT, 'skills'))
        ? new Set(
            fs.readdirSync(path.join(ROOT, 'skills'), { withFileTypes: true })
              .filter(d => d.isDirectory())
              .map(d => d.name),
          )
        : new Set();

      // Only check names that look like skill references (exist as skill dirs)
      // and those explicitly referenced in "Available Tech-Stack Skills" section
      const skillSection = content.split(/## Available Tech-Stack Skills/)[1] || '';
      const skillRefs = [...skillSection.matchAll(/\*\*`([\w-]+)`\*\*/g)].map(m => m[1]);

      for (const skill of skillRefs) {
        it(`references skill "${skill}" which exists in skills/`, () => {
          assert.ok(
            skillDirs.has(skill),
            `Agent ${agent} references skill "${skill}" but skills/${skill}/ does not exist`,
          );
        });
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 4. Cross-reference integrity: hooks → agents
// ---------------------------------------------------------------------------

describe('Cross-reference integrity: hooks → agents', () => {
  const hooksFile = 'hooks/hooks.json';

  it('hooks.json exists and is valid JSON', () => {
    assert.ok(exists(hooksFile), 'hooks/hooks.json does not exist');
    JSON.parse(readFile(hooksFile));
  });

  if (exists(hooksFile)) {
    const hooksData = JSON.parse(readFile(hooksFile));
    const hooks = hooksData.hooks || [];

    for (const hook of hooks) {
      const agentName = hook.matcher?.agent_name;
      if (agentName) {
        it(`hook with agent_name "${agentName}" references an existing agent`, () => {
          assert.ok(
            exists(`agents/${agentName}.md`),
            `Hook references agent "${agentName}" but agents/${agentName}.md does not exist`,
          );
        });
      }
    }
  }
});

// ---------------------------------------------------------------------------
// 5. Plugin structure completeness
// ---------------------------------------------------------------------------

describe('Plugin structure completeness', () => {
  const requiredDirs = ['agents', 'skills', 'hooks', '.claude-plugin'];
  for (const dir of requiredDirs) {
    it(`directory ${dir}/ exists`, () => {
      assert.ok(exists(dir), `Required directory ${dir}/ is missing`);
    });
  }

  const requiredFiles = [
    'settings.json',
    'hooks/hooks.json',
    '.claude-plugin/plugin.json',
    '.claude-plugin/marketplace.json',
  ];
  for (const file of requiredFiles) {
    it(`file ${file} exists`, () => {
      assert.ok(exists(file), `Required file ${file} is missing`);
    });
  }

  it('plugin.json is valid JSON with "name" field', () => {
    const data = JSON.parse(readFile('.claude-plugin/plugin.json'));
    assert.ok(data.name, 'plugin.json is missing "name" field');
  });

  it('marketplace.json is valid JSON with "name" field', () => {
    const data = JSON.parse(readFile('.claude-plugin/marketplace.json'));
    assert.ok(data.name, 'marketplace.json is missing "name" field');
  });

  it('settings.json is valid JSON', () => {
    JSON.parse(readFile('settings.json'));
  });
});

// ---------------------------------------------------------------------------
// 6. No stale references (regression guard)
// ---------------------------------------------------------------------------

describe('No stale references', () => {
  /** Recursively collect .md and .json files, excluding certain dirs. */
  function collectFiles(dir) {
    const results = [];
    const entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true });
    for (const entry of entries) {
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (['.git', 'node_modules'].includes(entry.name)) continue;
        results.push(...collectFiles(rel));
      } else if ((entry.name.endsWith('.md') || entry.name.endsWith('.json')) && entry.name !== 'CHANGELOG.md') {
        results.push(rel);
      }
    }
    return results;
  }

  const files = collectFiles('.');

  const stalePatterns = [
    { pattern: /templates\//g, label: 'templates/' },
    { pattern: /bin\/cli/g, label: 'bin/cli' },
    { pattern: /lib\/init/g, label: 'lib/init' },
    { pattern: /lib\/install/g, label: 'lib/install' },
    { pattern: /lib\/detect/g, label: 'lib/detect' },
    { pattern: /lib\/stacks/g, label: 'lib/stacks' },
    { pattern: /lib\/generate/g, label: 'lib/generate' },
    { pattern: /lib\/file-operations/g, label: 'lib/file-operations' },
  ];

  for (const { pattern, label } of stalePatterns) {
    it(`no files reference "${label}"`, () => {
      const violations = [];
      for (const file of files) {
        const content = readFile(file);
        if (pattern.test(content)) {
          violations.push(file);
        }
        // Reset regex lastIndex since we use /g flag
        pattern.lastIndex = 0;
      }
      assert.deepStrictEqual(
        violations, [],
        `Found stale reference to "${label}" in: ${violations.join(', ')}`,
      );
    });
  }
});
