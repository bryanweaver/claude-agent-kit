---
name: team-audit
description: Analyze Claude Code audit logs — session summaries, metrics, timelines, anomaly detection, and claim verification
argument-hint: [action] [session:id] [limit:number] [claims:"claim1,claim2"]
allowed-tools: Bash(node *)
---

# Audit Log Analysis: $ARGUMENTS

Analyze Claude Code audit logs to provide insights into tool usage, file operations, commands executed, and verify claims about what was accomplished during a session.

## Parse Arguments and Execute

Extract action and options from arguments, then run the log analyzer:

```bash
ARGS="$ARGUMENTS"
ACTION="summary"
SESSION=""
LIMIT="50"
CLAIMS=""

# Parse action
if echo "$ARGS" | grep -q "report"; then ACTION="report"; fi
if echo "$ARGS" | grep -q "metrics"; then ACTION="metrics"; fi
if echo "$ARGS" | grep -q "timeline"; then ACTION="timeline"; fi
if echo "$ARGS" | grep -q "verify"; then ACTION="verify"; fi
if echo "$ARGS" | grep -q "anomalies"; then ACTION="anomalies"; fi

# Extract session ID (session:abc123)
SESSION=$(echo "$ARGS" | grep -o 'session:[^[:space:]]*' | cut -d':' -f2 || echo "")

# Extract limit (limit:25)
LIMIT=$(echo "$ARGS" | grep -o 'limit:[0-9]*' | cut -d':' -f2 || echo "50")

# Extract claims (claims:"claim1,claim2")
CLAIMS=$(echo "$ARGS" | grep -o 'claims:"[^"]*"' | sed 's/claims://; s/"//g' || echo "")
```

Build and run the log analyzer command:

```bash
set -- node .claude/hooks/log_analyzer.js

case "$ACTION" in
  "report")   set -- "$@" --report ;;
  "metrics")  set -- "$@" --metrics ;;
  "timeline") set -- "$@" --timeline --limit "$LIMIT" ;;
  "verify")
    if [ -n "$CLAIMS" ]; then
      set -- "$@" --verify
      IFS=',' read -ra CLAIM_ARRAY <<< "$CLAIMS"
      for claim in "${CLAIM_ARRAY[@]}"; do
        set -- "$@" "$(echo "$claim" | xargs)"
      done
    else
      echo "Error: Claims required for verify action. Use: /team-audit verify claims:\"claim1,claim2\""
      exit 1
    fi
    ;;
  "anomalies") set -- "$@" --anomalies ;;
esac

if [ -n "$SESSION" ]; then
  set -- "$@" --session "$SESSION"
fi

"$@"
```

## Available Actions

| Action | Description |
|--------|-------------|
| **summary** (default) | Quick overview of session metrics |
| **report** | Comprehensive audit report with all details |
| **metrics** | Detailed metrics about tools, files, and performance |
| **timeline** | Chronological view of all events (use `limit:N` to control output) |
| **verify** | Verify specific claims about what was accomplished |
| **anomalies** | Detect unusual patterns or potential issues |

## Usage Examples

- `/team-audit` - Show summary for current session
- `/team-audit report` - Generate full audit report
- `/team-audit timeline limit:25` - Show last 25 timeline events
- `/team-audit verify claims:"tests were run,files were created"` - Verify claims
- `/team-audit metrics session:abc123` - Show metrics for specific session
- `/team-audit anomalies` - Detect anomalies in current session
