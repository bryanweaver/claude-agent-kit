---
name: team-audit-session
description: Analyze and view Claude Code audit logs with comprehensive reporting and verification
argument-hint: [action] [session:id] [limit:number] [claims:"claim1,claim2"]
disable-model-invocation: true
allowed-tools: Bash(node *)
---

# Audit Log Analysis: $ARGUMENTS

Analyze Claude Code audit logs for tool usage, file operations, and session verification.

## Execution

Parse the arguments and run the log analyzer:

1. Extract action from `$ARGUMENTS` (default: `summary`)
2. Extract optional parameters: `session:<id>`, `limit:<number>`, `claims:"<list>"`
3. Execute: `node .claude/hooks/log_analyzer.js <flags>`

### Action Mapping

| Action | Flag | Purpose |
|--------|------|---------|
| `summary` (default) | (none) | Quick overview of session metrics |
| `report` | `--report` | Comprehensive audit report |
| `metrics` | `--metrics` | Detailed tool, file, and performance metrics |
| `timeline` | `--timeline --limit <n>` | Chronological view of events |
| `verify` | `--verify <claims>` | Verify specific claims about accomplishments |
| `anomalies` | `--anomalies` | Detect unusual patterns |

Add `--session <id>` if a session ID is provided.

## Usage Examples

- `/audit` — summary for current session
- `/audit report` — full audit report
- `/audit timeline limit:25` — last 25 timeline events
- `/audit verify claims:"tests were run,files were created"` — verify claims
- `/audit metrics session:abc123` — metrics for specific session
- `/audit anomalies` — detect anomalies
