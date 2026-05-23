import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

function readFile(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

// ---------------------------------------------------------------------------
// Architecture docs introduced by the blog/postmortem insight PRs
//
// These tests guard the cross-references between agent prompts and the
// architecture docs the prompts now point readers at. They exist because
// the prompts themselves are unverifiable behaviorally in CI — the next
// best thing is to prove the structural contract holds.
// ---------------------------------------------------------------------------

describe('Architecture docs exist', () => {
  const required = [
    'docs/architecture/design-principles.md',
    'docs/architecture/prompt-change-discipline.md',
    'docs/architecture/system-overview.md',
  ];
  for (const doc of required) {
    it(`${doc} exists`, () => {
      assert.ok(exists(doc), `Required architecture doc ${doc} is missing`);
    });
  }
});

describe('design-principles.md content', () => {
  const content = exists('docs/architecture/design-principles.md')
    ? readFile('docs/architecture/design-principles.md')
    : '';

  const requiredPrinciples = [
    'Generator-Evaluator Separation',
    'Progress Checkpointing',
    'Contract-Driven Acceptance Criteria',
    'Context Resets Over Compaction',
    'Concrete Grading Over Subjective Review',
    'Parallelism Requires Decomposability',
    'Test Quality Over Test Quantity',
    'Reassess Harness Assumptions with New Models',
    'Decouple Brain from Hands',
    'Append-Only Session Logs Over Mutable State',
    'Credential Isolation',
  ];

  for (const principle of requiredPrinciples) {
    it(`includes principle: ${principle}`, () => {
      assert.ok(
        content.includes(principle),
        `design-principles.md missing principle "${principle}"`,
      );
    });
  }

  it('every principle cites a Source', () => {
    const headingCount = (content.match(/^## \d+\./gm) || []).length;
    const sourceCount = (content.match(/^\*\*Source:\*\*/gm) || []).length;
    assert.equal(
      sourceCount, headingCount,
      `Expected one **Source:** per principle. Found ${headingCount} principles and ${sourceCount} sources.`,
    );
  });
});

describe('prompt-change-discipline.md content', () => {
  const content = exists('docs/architecture/prompt-change-discipline.md')
    ? readFile('docs/architecture/prompt-change-discipline.md')
    : '';

  const requiredChecks = [
    'Per-model behavioral check',
    'Ablation discipline',
    'Concision-vs-quality watch',
    'Context-preservation check',
  ];

  for (const check of requiredChecks) {
    it(`documents check: ${check}`, () => {
      assert.ok(
        content.includes(check),
        `prompt-change-discipline.md missing check "${check}"`,
      );
    });
  }

  it('defines what counts as a prompt change', () => {
    assert.ok(
      content.includes('agents/*.md') && content.includes('SKILL.md') && content.includes('hooks.json'),
      'prompt-change-discipline.md should enumerate which file types count as prompt changes',
    );
  });
});

describe('reviewer agent integrates new responsibilities', () => {
  const content = exists('agents/reviewer.md') ? readFile('agents/reviewer.md') : '';

  it('has the active-testing step (PR #17)', () => {
    assert.ok(
      /Active testing/.test(content),
      'reviewer.md missing the "Active testing" step',
    );
  });

  it('has the prompt-change review category (PR #19)', () => {
    assert.ok(
      content.includes('Prompt changes') && content.includes('prompt-change-discipline.md'),
      'reviewer.md must include the "Prompt changes" review category referencing prompt-change-discipline.md',
    );
  });

  it('has the concrete-grading approach bullets (PR #17)', () => {
    const required = [
      'Grade outputs, not process',
      'Use concrete grading criteria',
      'Maintain skeptical judgment',
    ];
    for (const phrase of required) {
      assert.ok(
        content.includes(phrase),
        `reviewer.md missing approach bullet: "${phrase}"`,
      );
    }
  });

  it('numbered Instructions steps form a contiguous sequence', () => {
    // Catch regressions like the cherry-pick conflict where numbering
    // duplicated or skipped (e.g. two "4." headings after a merge).
    const section = content.split(/## Instructions/)[1]?.split(/## /)[0] || '';
    const nums = [...section.matchAll(/^(\d+)\. /gm)].map(m => Number(m[1]));
    for (let i = 1; i < nums.length; i++) {
      assert.equal(
        nums[i], nums[i - 1] + 1,
        `reviewer.md Instructions step numbering breaks: ${nums.join(', ')}`,
      );
    }
    assert.ok(nums.length >= 5, `Expected at least 5 instruction steps; found ${nums.length}`);
  });
});

describe('meta-agent integrates prompt-change discipline (PR #19)', () => {
  const content = exists('agents/meta-agent.md') ? readFile('agents/meta-agent.md') : '';

  it('references prompt-change-discipline.md', () => {
    assert.ok(
      content.includes('prompt-change-discipline.md'),
      'meta-agent.md must reference docs/architecture/prompt-change-discipline.md',
    );
  });

  it('documents the approach for prompt edits', () => {
    assert.ok(
      /Approach for prompt edits/i.test(content),
      'meta-agent.md missing "Approach for prompt edits" section',
    );
  });

  it('numbered Instructions steps form a contiguous sequence', () => {
    const section = content.split(/When invoked/)[1]?.split(/^## /m)[0] || '';
    const nums = [...section.matchAll(/^(\d+)\. /gm)].map(m => Number(m[1]));
    for (let i = 1; i < nums.length; i++) {
      assert.equal(
        nums[i], nums[i - 1] + 1,
        `meta-agent.md step numbering breaks: ${nums.join(', ')}`,
      );
    }
  });
});

describe('shipper agent integrates progress checkpointing (PR #17/#18)', () => {
  const content = exists('agents/shipper.md') ? readFile('agents/shipper.md') : '';

  it('references claude-progress.json', () => {
    assert.ok(
      content.includes('claude-progress.json'),
      'shipper.md must reference claude-progress.json for progress checkpointing',
    );
  });

  it('mentions credential isolation guidance (PR #18)', () => {
    assert.ok(
      /credential/i.test(content),
      'shipper.md should mention credential isolation (managed-agents insight)',
    );
  });
});

describe('TaskCompleted hook enforces acceptance criteria (PR #17)', () => {
  const hooks = exists('hooks/hooks.json') ? JSON.parse(readFile('hooks/hooks.json')) : null;

  it('hooks.json parses', () => {
    assert.ok(hooks, 'hooks/hooks.json failed to parse');
  });

  it('TaskCompleted hook references acceptance criteria', () => {
    const taskCompleted = hooks?.hooks?.TaskCompleted;
    assert.ok(taskCompleted, 'TaskCompleted hook is missing from hooks.json');

    const promptText = JSON.stringify(taskCompleted);
    assert.ok(
      /acceptance criteria/i.test(promptText),
      'TaskCompleted hook prompt should mention "acceptance criteria"',
    );
    assert.ok(
      /claude-progress\.json/.test(promptText),
      'TaskCompleted hook prompt should reference claude-progress.json for cross-referencing criteria',
    );
  });
});

describe('team-ship skill enforces contract-driven criteria (PR #17)', () => {
  const file = 'skills/team-ship/SKILL.md';
  const content = exists(file) ? readFile(file) : '';

  it('instructs the team to define acceptance criteria before implementation', () => {
    assert.ok(
      /acceptance criteria/i.test(content),
      'team-ship SKILL.md must instruct defining acceptance criteria',
    );
  });

  it('writes criteria to claude-progress.json so all agents share definition of done', () => {
    assert.ok(
      content.includes('claude-progress.json'),
      'team-ship SKILL.md must reference claude-progress.json for shared criteria',
    );
  });
});
