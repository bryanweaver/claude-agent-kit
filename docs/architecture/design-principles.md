# Design Principles

Patterns and principles informed by Anthropic's engineering research that guide the Claude Agent Kit's architecture.

## 1. Generator-Evaluator Separation

Independent evaluation prevents self-evaluation bias. The reviewer agent should assess outputs against concrete criteria rather than letting implementing agents judge their own work. Active testing (running the app, executing test suites) catches issues that static code review misses.

**Source:** "Harness design for long-running application development" (Mar 2026)

## 2. Progress Checkpointing

Long-running workflows should persist state to structured files (claude-progress.json) at each major step. This enables:

- Recovery from interrupted sessions without re-doing completed work
- Clear handoffs between agents with shared context
- Auditability of the workflow's progression

The shipper agent owns checkpoint writes; all agents read checkpoints on startup.

**Source:** "Effective harnesses for long-running agents" (Nov 2025)

## 3. Contract-Driven Acceptance Criteria

Before implementation begins, define testable acceptance criteria. This bridges the gap between high-level feature descriptions and measurable "done" conditions. Criteria are written into claude-progress.json so both the implementing agents and the reviewer agent share the same definition of success.

**Source:** "Harness design for long-running application development" (Mar 2026)

## 4. Context Resets Over Compaction

When context grows large, prefer clean resets with structured handoff artifacts over in-place summarization. Agents should read progress files and relevant source code fresh rather than relying on compressed conversation history, which can introduce drift.

**Source:** "Harness design for long-running application development" (Mar 2026)

## 5. Concrete Grading Over Subjective Review

Transform subjective quality judgments into measurable dimensions. The TaskCompleted hook enforces this by requiring verification against explicit acceptance criteria rather than general impressions.

**Source:** "Harness design for long-running application development" (Mar 2026)

## 6. Parallelism Requires Decomposability

Multi-agent parallelism only works when tasks are genuinely independent. The team-ship workflow parallelizes full-stack-developer and database-admin because their work is decomposable. Monolithic tasks that can't be subdivided should run sequentially rather than forcing artificial parallelism.

**Source:** "Building a C compiler with a team of parallel Claudes" (Feb 2026)

## 7. Test Quality Over Test Quantity

Agents will work autonomously to solve whatever problem they're given, so the task verifier must be nearly perfect. Invest in high-quality test infrastructure rather than high test counts. A failing test that produces a false positive wastes more agent time than a missing test.

**Source:** "Building a C compiler with a team of parallel Claudes" (Feb 2026), "Demystifying evals for AI agents" (Jan 2026)

## 8. Reassess Harness Assumptions with New Models

Every component in the harness encodes an assumption about what the model can't do. As models improve, previously essential scaffolding may become unnecessary overhead. Periodically evaluate whether workflow steps (like mandatory review before every deploy) are still justified by actual failure rates.

**Source:** "Harness design for long-running application development" (Mar 2026)

---

Last updated: 2026-03-30
