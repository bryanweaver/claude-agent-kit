# Evals

Behavioral evaluation harness for the agent kit. Where the tests in `test/` validate file contracts and cross-references, this evaluates whether agents produce the right output for representative inputs.

## Why

Structural tests catch broken file paths. They cannot catch a reviewer agent that fails to flag a concision regression, or a meta-agent that forgets to call out per-model behavioral risk. Those failures are behavioral — only an eval will surface them.

## Status

**Phase 1 only. Phases 2-5 are deferred** — see `docs/architecture/eval-strategy.md` for the full plan and the conditions under which to revisit.

Phase 1 (offline mock-output harness) is useful as:
1. **Specification** — each case documents what the agent should do better than prose docs
2. **Spot-check tool** — catches regressions in mock outputs / case structure
3. **TODO with teeth** — write a case for desired-but-not-achieved behavior; it fails until the agent is improved

Phase 1 does NOT run the agents. It does not catch behavioral regressions in the real prompts. Live evaluation requires Phase 2+, which is deferred until the kit grows enough to justify the cost.

## Layout

```
evals/
├── cases/<agent>/<case-id>.json    Golden inputs + expected output
├── graders/                        Grading implementations
├── runner.js                       Loads cases, runs agent (mock or real), invokes graders
├── results/<timestamp>/            Historical pass/fail + full traces
└── README.md
```

## Running

```bash
npm run evals              # full suite
npm run evals -- --agent reviewer
npm run evals -- --case reviewer-concision-001
npm run evals -- --live    # use real Claude API (Phase 2+, requires ANTHROPIC_API_KEY)
```

Default is offline / mock mode — each case can supply a `mock_output` field that the runner returns instead of calling the API.

## Case format

```json
{
  "id": "reviewer-concision-001",
  "agent": "reviewer",
  "model": "sonnet",
  "input": { ... },
  "expected": {
    "must_classify_as": "WARNING",
    "must_mention": ["concision-vs-quality"],
    "must_not_mention": [],
    "max_words": 500
  },
  "rubric": "<one-paragraph description of what 'good' looks like>",
  "mock_output": "<offline-mode response>"
}
```

The `mock_output` field is only read in offline mode. In live mode, the runner calls Claude with the agent's prompt + the case input.

## Operational principles

- **Look at the data.** The runner saves the raw model output for every case to `results/<timestamp>/<case-id>.json` so failures can be inspected. Aggregate scores hide patterns.
- **Calibrate the judge.** Before LLM-as-judge grades are trusted, the judge must agree with hand-grades on a small calibration set. If it disagrees, the judge is broken, not the agent under test.
- **Grade outputs, not process.** What matters is whether the produced response meets the rubric, not the model's reasoning trace.
- **Per-model.** Same case run on sonnet/opus/haiku; results stored separately. Same prompt produces different behavior across models.
- **Track regressions over time.** A single pass/fail run is noise. The same eval over weeks tells you whether the kit is improving or degrading.
