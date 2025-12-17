import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.join(__dirname, '..', 'bin', 'cli.js');

describe('CLI', () => {
  describe('--version', () => {
    it('should display version number', () => {
      const output = execSync(`node "${CLI_PATH}" --version`, { encoding: 'utf8' });
      assert.match(output.trim(), /^\d+\.\d+\.\d+$/);
    });
  });

  describe('--help', () => {
    it('should display help text', () => {
      const output = execSync(`node "${CLI_PATH}" --help`, { encoding: 'utf8' });
      assert.ok(output.includes('claude-agent-kit'));
      assert.ok(output.includes('install'));
      assert.ok(output.includes('list'));
    });
  });

  describe('list command', () => {
    it('should list available assets', () => {
      const output = execSync(`node "${CLI_PATH}" list`, { encoding: 'utf8' });
      assert.ok(output.includes('Agents'));
      assert.ok(output.includes('Commands'));
      assert.ok(output.includes('Hooks'));
    });

    it('should show agent names', () => {
      const output = execSync(`node "${CLI_PATH}" list`, { encoding: 'utf8' });
      assert.ok(output.includes('shipper'));
      assert.ok(output.includes('reviewer'));
      assert.ok(output.includes('database-admin'));
    });

    it('should show command names', () => {
      const output = execSync(`node "${CLI_PATH}" list`, { encoding: 'utf8' });
      assert.ok(output.includes('ship'));
      assert.ok(output.includes('fix'));
      assert.ok(output.includes('cleanup'));
    });
  });
});

describe('File Operations', () => {
  const testDir = path.join(__dirname, 'temp-test-dir');

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  it('should have templates directory', () => {
    const templatesDir = path.join(__dirname, '..', 'templates');
    assert.ok(fs.existsSync(templatesDir));
  });

  it('should have agents templates', () => {
    const agentsDir = path.join(__dirname, '..', 'templates', 'agents');
    assert.ok(fs.existsSync(agentsDir));

    const files = fs.readdirSync(agentsDir);
    assert.ok(files.length > 0);
    assert.ok(files.some(f => f.endsWith('.md')));
  });

  it('should have commands templates', () => {
    const commandsDir = path.join(__dirname, '..', 'templates', 'commands');
    assert.ok(fs.existsSync(commandsDir));

    const files = fs.readdirSync(commandsDir);
    assert.ok(files.length > 0);
    assert.ok(files.some(f => f.endsWith('.md')));
  });

  it('should have hooks templates', () => {
    const hooksDir = path.join(__dirname, '..', 'templates', 'hooks');
    assert.ok(fs.existsSync(hooksDir));

    const files = fs.readdirSync(hooksDir);
    assert.ok(files.length > 0);
    assert.ok(files.some(f => f.endsWith('.cjs')));
  });

  it('should have skills templates', () => {
    const skillsDir = path.join(__dirname, '..', 'templates', 'skills');
    assert.ok(fs.existsSync(skillsDir));

    const dirs = fs.readdirSync(skillsDir);
    assert.ok(dirs.length > 0);
    assert.ok(dirs.includes('supabase-patterns'));
  });
});

describe('Template Validation', () => {
  it('should have valid agent frontmatter', () => {
    const agentsDir = path.join(__dirname, '..', 'templates', 'agents');
    const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
      assert.ok(content.startsWith('---'), `${file} should start with frontmatter`);
      assert.ok(content.includes('name:'), `${file} should have name field`);
      assert.ok(content.includes('description:'), `${file} should have description field`);
    }
  });

  it('should have valid command frontmatter', () => {
    const commandsDir = path.join(__dirname, '..', 'templates', 'commands');
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
      // all_tools.md is a special reference file without frontmatter
      if (file === 'all_tools.md') {
        continue;
      }
      assert.ok(content.startsWith('---'), `${file} should start with frontmatter`);
      assert.ok(content.includes('description:'), `${file} should have description field`);
    }
  });

  it('should have valid skill metadata', () => {
    const skillsDir = path.join(__dirname, '..', 'templates', 'skills');
    const dirs = fs.readdirSync(skillsDir);

    for (const dir of dirs) {
      const skillPath = path.join(skillsDir, dir, 'SKILL.md');
      if (fs.existsSync(skillPath)) {
        const content = fs.readFileSync(skillPath, 'utf8');
        assert.ok(content.startsWith('---'), `${dir}/SKILL.md should start with frontmatter`);
        assert.ok(content.includes('name:'), `${dir}/SKILL.md should have name field`);
        assert.ok(content.includes('description:'), `${dir}/SKILL.md should have description field`);
      }
    }
  });
});

describe('Security', () => {
  it('should not have path traversal in templates', () => {
    const templatesDir = path.join(__dirname, '..', 'templates');

    const checkDir = (dir) => {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        assert.ok(!item.name.includes('..'), `Path traversal detected: ${item.name}`);
        assert.ok(!item.name.includes('\0'), `Null byte detected: ${item.name}`);

        if (item.isDirectory()) {
          checkDir(path.join(dir, item.name));
        }
      }
    };

    checkDir(templatesDir);
  });
});
