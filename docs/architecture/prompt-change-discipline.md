# Prompt Change Discipline

Modifying an agent's system prompt or a skill's instructions is a high-leverage change. Small wording shifts (e.g., asking for more concise output) can produce large, non-obvious behavioral regressions across the agent kit. This document describes the discipline this kit applies to such changes.

These practices are distilled from Anthropic's April 23, 2026 postmortem on Claude Code quality regressions, where three separate prompt/config changes — a default reasoning-effort drop, a verbosity-reduction instruction, and a stale-session caching change — each shipped past human and automated review and degraded behavior in production.

## What counts as a "prompt change"

Any diff that touches one of the following:

- `agents/*.md` — agent system prompts and frontmatter (`description`, `tools`, `model`, `permissionMode`)
- `skills/**/SKILL.md` and `.claude/skills/**/SKILL.md` — workflow and pattern skills
- `hooks/hooks.json` `prompt` entries — inline policy nudges
- `CLAUDE.md` and any project-level instruction files

These changes are reviewed differently from code changes because their failure modes are behavioral rather than syntactic.

## Four checks before merging

### 1. Per-model behavioral check

The same prompt can produce meaningfully different behavior on Sonnet, Opus, and Haiku. The Apr 23 postmortem describes a verbosity-reduction instruction that degraded coding quality on the model targeted by the change while leaving others unaffected.

For any prompt change:

- Identify which `model:` values in the kit could be affected (default `sonnet`, plus any agent that overrides to `opus` or `haiku`).
- Exercise the changed agent or skill on each affected model on at least one representative task before merging. Capture the output, not just whether it ran.
- If the change is a tradeoff (verbosity, effort, terseness), record what the tradeoff is in the PR description.

### 2. Ablation discipline

Bundle one prompt change per PR where possible. When that is not possible:

- Make each change a separate commit with a one-line rationale.
- In the PR description, list each change and what behavior it is meant to alter.
- Reviewers should be able to revert any single commit and see only that change reflected in behavior.

The postmortem's verbosity instruction was a single sentence with broad downstream effects. Bundled prompt changes amplify that risk because regressions cannot be bisected by revert.

### 3. Concision-vs-quality watch

Changes that ask the agent to be shorter, faster, or use less reasoning are the highest-risk class of prompt edits. Treat these as carrying a soak period: prefer to land them behind a feature flag, on a non-default branch, or behind an explicit opt-in skill before making them the default.

Examples of language that triggers this check:

- "be concise", "minimize output", "don't explain"
- "use less thinking", "default to medium effort", "skip reasoning"
- "respond in under N words", "one-line answers"
- adding `disable-model-invocation: true` to a previously auto-invoked skill

If a PR contains language like the above, the reviewer must confirm the tradeoff is intentional and bounded.

### 4. Context-preservation check

Hooks and skill instructions can quietly clear or rewrite the agent's working context (extended thinking blocks, prior tool results, task list state). The Apr 23 caching bug cleared reasoning history on every turn instead of once per stale session, producing an agent that "would continue executing, but increasingly without memory of why it had chosen to do what it was doing."

When a change touches context-management logic — `hooks/hooks.json` actions that interact with sessions, skills that instruct the agent to "forget" or "summarize and clear", or anything that resets task or memory state — the reviewer must explicitly note:

- What context the change clears or rewrites
- Whether it runs once or every turn
- How a multi-turn task will behave under the change

## Reviewer responsibilities

The `reviewer` agent applies these checks when it observes a prompt change in the diff. Authors should call them out preemptively in the PR description so the reviewer can verify rather than discover.

## Source

Anthropic Engineering, "An update on recent Claude Code quality reports" (April 23, 2026): https://www.anthropic.com/engineering/april-23-postmortem
