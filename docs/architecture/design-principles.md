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

## 9. Decouple Brain from Hands

Separate orchestration logic ("brain") from execution environments ("hands") through uniform interfaces. Agents should interact with all external tools through a consistent `execute(name, input) → string` pattern, whether calling containers, MCP servers, or future execution environments. This decoupling enables:

- Independent scaling and replacement of execution environments
- Lazy initialization of expensive resources (only provision when a tool call demands it)
- Stateless orchestration that can crash and restart cleanly from the session log

The agent kit applies this principle by keeping agent definitions (brain) separate from skills and tools (hands), connected through structured handoff artifacts rather than tight coupling.

**Source:** "Scaling Managed Agents: Decoupling the brain from the hands" (Feb/Apr 2026)

## 10. Append-Only Session Logs Over Mutable State

Prefer append-only event logs over mutable state snapshots for workflow persistence. Rather than overwriting a single progress file, emit discrete events (step-completed, error-encountered, criteria-defined) that can be selectively queried. This enables:

- Flexible rewinding without irreversible compaction decisions
- Multiple agents reading different slices of the same event stream
- Durable recovery via `wake → getEvents → resume` rather than parsing a possibly-stale snapshot

The `claude-progress.json` pattern remains the lightweight default, but long-running or multi-session workflows should treat it as an append-only log with timestamped entries rather than a single overwritten object.

**Source:** "Scaling Managed Agents: Decoupling the brain from the hands" (Feb/Apr 2026)

## 11. Credential Isolation

Never store sensitive credentials (API keys, tokens, secrets) in environments where untrusted generated code executes. Authentication should be handled through:

- External vaults or proxy patterns that fetch tokens on demand
- Git access tokens wired into local remotes during sandbox setup, not embedded in agent context
- MCP tools that access credentials through dedicated proxies rather than passing secrets through the agent

This is especially important for the shipper agent, which executes in environments that also run generated code.

**Source:** "Scaling Managed Agents: Decoupling the brain from the hands" (Feb/Apr 2026)

---

Last updated: 2026-04-13
