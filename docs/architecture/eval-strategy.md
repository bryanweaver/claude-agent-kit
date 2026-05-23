# Eval Strategy

How the kit evaluates whether its agents work as expected, and the deferred plan for scaling that evaluation if the kit grows.

## Current state — Phase 1 only

The kit ships with `evals/` containing:
- **Offline runner** (`evals/runner.js`) — loads cases, returns each case's `mock_output`, applies the rule-based grader
- **Rule grader** (`evals/graders/rule.js`) — classification, must/must-not-mention, word-count, regex
- **Cases** (`evals/cases/<agent>/<id>.json`) — golden inputs + expected outputs

Phase 1 has **no API calls and no recurring cost**. It is useful as:

1. **Specification.** Each case documents what the agent is *supposed* to do better than prose docs can. Future readers (or future you) understand intent by reading the cases.
2. **Spot-check tool.** Run `npm run evals` after a prompt change to confirm the mocks still grade correctly. Mostly catches dumb regressions in the mocks themselves, not behavioral regressions in the agents.
3. **TODO with teeth.** New cases written with `mock_output` set to current-bad-output and `expected` set to desired-output will fail until the agent is fixed. This makes "I should improve the reviewer's X behavior someday" into a concrete, testable artifact.

Phase 1 is **not** a substitute for behavioral evaluation. It does not run the agents. It does not catch a real prompt regression.

## Deferred phases — build only when the trigger fires

The trigger conditions for revisiting:

- **High change cadence:** You start making non-trivial prompt changes more than ~once a month
- **Observed regression:** Someone reports an agent behavior regression you cannot reproduce or explain
- **Multiple maintainers:** A second contributor starts editing agent prompts and you need a shared definition of "correct"

If none of these are true, **Phase 1 is enough.** Building 2-5 is over-engineered for a stable kit.

### Phase 2 — Live runner

Wire `@anthropic-ai/sdk`. The runner reads the agent's `.md` file as the system prompt, sends the case input as the user message, captures the response.

- New script: `npm run evals -- --live`
- Requires `ANTHROPIC_API_KEY` (env var locally, or as a GitHub secret for CI)
- Cost: ~$0.01-0.05 per case per model, depending on which model and how long the response

Approx work: ~half a day. Most of it is making the API call and threading the result through the existing runner. Cases don't need to change — the `mock_output` field is just ignored in live mode.

### Phase 3 — LLM-as-judge grader

Add `evals/graders/judge.js`. For rubrics that the rule grader can't express (e.g. "the explanation is clear", "the tone is appropriate"), Claude grades the agent's output against the rubric and returns a 0-5 score.

**Calibration step is non-negotiable.** Before judge scores count for anything, the judge must agree with hand-grades on a calibration set of ~20 cases. Procedure:
1. Pick 20 representative outputs
2. Hand-grade them 0-5 yourself
3. Have the judge grade the same 20
4. If judge disagrees with you on > 3 of the 20, the rubrics are bad — rewrite them
5. Repeat until agreement is within tolerance

Approx work: ~1 day for the judge, ~half a day for calibration per agent.

### Phase 4 — Coverage expansion

- 5-10 cases per agent (currently 3 for reviewer only)
- Per-model variants (same case run on sonnet/opus/haiku, results stored separately)
- Multi-turn cases for agents that operate over multiple turns

Approx work: ongoing, ~1-2 hours per case.

### Phase 5 — CI integration

- Smoke set on every PR — 3-5 cases, ~30s, ~$0.10
- Full suite weekly — 40+ cases × 3 models, ~$20-50/wk
- Regression gating: a PR that drops pass rate below a threshold blocks merge
- Score history tracked in `evals/results/` (or moved to external storage if it grows)

Approx work: ~1 day for workflows + thresholds. Ongoing maintenance: triage every failure.

## Cost ballpark for the full pipeline

| Item | Cost |
|---|---|
| Phase 2 dev | ~$5 in API credits to wire it up |
| Phase 3 calibration | ~$10 per agent, one-time |
| Phase 5 ongoing — smoke per PR | ~$0.10 × PR count |
| Phase 5 ongoing — weekly full | ~$20-50/wk = $1k-2.5k/yr |

These are estimates. The first live run will give you a real number. **For a free open-source plugin, this is not free.** Worth knowing before committing.

## Decision rubric

- Are you actively iterating on agent prompts? → Build Phase 2 at minimum.
- Have you had a real behavioral regression slip through? → Build Phase 2 + 3.
- Do you have ≥2 maintainers? → Build through Phase 5.
- None of the above? → Stay at Phase 1. Revisit when one of these changes.
