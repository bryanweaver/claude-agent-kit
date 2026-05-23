#!/usr/bin/env node
/**
 * Eval runner.
 *
 * Modes:
 *   offline (default): reads case.mock_output and grades it. No API calls.
 *   live:              calls Claude API with the agent's prompt + case input. Costs money.
 *
 * Usage:
 *   node evals/runner.js
 *   node evals/runner.js --agent reviewer
 *   node evals/runner.js --case reviewer-concision-001
 *   node evals/runner.js --live    (Phase 2+, requires ANTHROPIC_API_KEY)
 *
 * Output:
 *   - Per-case PASS/FAIL line on stdout
 *   - Aggregate summary at the end
 *   - Full traces written to evals/results/<timestamp>/<case-id>.json
 *   - Exits non-zero if any case fails
 */

import fs from 'node:fs';
import path from 'node:path';
import { grade as ruleGrade } from './graders/rule.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const CASES_DIR = path.join(ROOT, 'evals', 'cases');
const RESULTS_DIR = path.join(ROOT, 'evals', 'results');

function parseArgs(argv) {
  const args = { agent: null, case: null, live: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--agent') args.agent = argv[++i];
    else if (argv[i] === '--case') args.case = argv[++i];
    else if (argv[i] === '--live') args.live = true;
  }
  return args;
}

function loadCases({ agent, caseId }) {
  if (!fs.existsSync(CASES_DIR)) return [];
  const agentDirs = fs.readdirSync(CASES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .filter(d => !agent || d.name === agent)
    .map(d => d.name);

  const cases = [];
  for (const dir of agentDirs) {
    const files = fs.readdirSync(path.join(CASES_DIR, dir)).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(CASES_DIR, dir, file), 'utf8'));
      if (caseId && data.id !== caseId) continue;
      cases.push({ ...data, _file: path.join('evals/cases', dir, file) });
    }
  }
  return cases;
}

async function runCaseOffline(testCase) {
  if (typeof testCase.mock_output !== 'string') {
    throw new Error(
      `Case ${testCase.id} has no mock_output; cannot run in offline mode. ` +
      `Add a mock_output field or run with --live.`,
    );
  }
  return testCase.mock_output;
}

async function runCaseLive(testCase) {
  throw new Error(
    `Live mode not implemented in Phase 1. Phase 2 will wire the Anthropic SDK. ` +
    `For now, add mock_output to ${testCase.id} and run without --live.`,
  );
}

function makeResultsDir() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.join(RESULTS_DIR, stamp);
  fs.mkdirSync(dir);
  return dir;
}

async function main() {
  const args = parseArgs(process.argv);
  const cases = loadCases({ agent: args.agent, caseId: args.case });

  if (cases.length === 0) {
    console.error('No cases matched. Check --agent / --case filters or add cases under evals/cases/.');
    process.exit(2);
  }

  console.log(`# Running ${cases.length} case(s) in ${args.live ? 'LIVE' : 'OFFLINE'} mode\n`);
  const resultsDir = makeResultsDir();

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const testCase of cases) {
    let output;
    try {
      output = args.live ? await runCaseLive(testCase) : await runCaseOffline(testCase);
    } catch (err) {
      console.log(`FAIL  ${testCase.id}  (${err.message})`);
      failed++;
      failures.push({ id: testCase.id, error: err.message });
      continue;
    }

    const result = ruleGrade(output, testCase.expected || {});
    const status = result.pass ? 'PASS' : 'FAIL';
    const scorePct = Math.round(result.score * 100);
    console.log(`${status}  ${testCase.id}  (${result.checks_passed}/${result.checks_total} checks, ${scorePct}%)`);
    if (!result.pass) {
      for (const f of result.failures) console.log(`        - ${f}`);
      failed++;
      failures.push({ id: testCase.id, ...result });
    } else {
      passed++;
    }

    // Save trace for "look at the data"
    fs.writeFileSync(
      path.join(resultsDir, `${testCase.id}.json`),
      JSON.stringify({ case: testCase, output, result }, null, 2),
    );
  }

  // Summary
  const summary = {
    timestamp: path.basename(resultsDir),
    mode: args.live ? 'live' : 'offline',
    total: cases.length,
    passed,
    failed,
    pass_rate: cases.length ? passed / cases.length : 0,
    failures: failures.map(f => f.id),
  };
  fs.writeFileSync(path.join(resultsDir, 'summary.json'), JSON.stringify(summary, null, 2));

  console.log(`\n# Summary: ${passed}/${cases.length} passed (${Math.round(summary.pass_rate * 100)}%)`);
  console.log(`# Results: evals/results/${path.basename(resultsDir)}/`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('Runner error:', err);
  process.exit(2);
});
