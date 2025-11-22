---
allowed-tools: Bash
argument-hint: [action] [session:id] [limit:number] [claims:"claim1,claim2"]
description: Analyze and view Claude Code audit logs with comprehensive reporting and verification
---

# Audit Log Analysis: $ARGUMENTS

Analyze Claude Code audit logs to provide insights into tool usage, file operations, commands executed, and verify claims about what was accomplished during a session.

## Step 1: Parse Arguments and Execute Log Analyzer

Extract action and options from arguments, then execute the log analyzer JavaScript:

! echo "Parsing audit command arguments: $ARGUMENTS"

! ARGS="$ARGUMENTS"
! ACTION="summary"
! SESSION=""
! LIMIT="50"
! CLAIMS=""

# Parse arguments to extract action and parameters
! if echo "$ARGS" | grep -q "report"; then ACTION="report"; fi
! if echo "$ARGS" | grep -q "metrics"; then ACTION="metrics"; fi  
! if echo "$ARGS" | grep -q "timeline"; then ACTION="timeline"; fi
! if echo "$ARGS" | grep -q "verify"; then ACTION="verify"; fi
! if echo "$ARGS" | grep -q "anomalies"; then ACTION="anomalies"; fi

# Extract session ID if provided (session:abc123)
! SESSION=$(echo "$ARGS" | grep -o 'session:[^[:space:]]*' | cut -d':' -f2 || echo "")

# Extract limit if provided (limit:25)
! LIMIT=$(echo "$ARGS" | grep -o 'limit:[0-9]*' | cut -d':' -f2 || echo "50")

# Extract claims if provided (claims:"claim1,claim2")
! CLAIMS=$(echo "$ARGS" | grep -o 'claims:"[^"]*"' | sed 's/claims://; s/"//g' || echo "")

## Step 2: Build and Execute Log Analyzer Command

Construct the appropriate command for the log analyzer based on parsed arguments:

! echo "Action: $ACTION, Session: $SESSION, Limit: $LIMIT, Claims: $CLAIMS"
! echo "Executing log analyzer..."
! echo ""

! CMD="node .claude/hooks/log_analyzer.js"

# Add action-specific flags
! case "$ACTION" in
!   "report")
!     CMD="$CMD --report"
!     ;;
!   "metrics")
!     CMD="$CMD --metrics"
!     ;;
!   "timeline")
!     CMD="$CMD --timeline --limit $LIMIT"
!     ;;
!   "verify")
!     if [ -n "$CLAIMS" ]; then
!       # Split claims and add them as separate arguments
!       CMD="$CMD --verify"
!       IFS=',' read -ra CLAIM_ARRAY <<< "$CLAIMS"
!       for claim in "${CLAIM_ARRAY[@]}"; do
!         CMD="$CMD \"$(echo $claim | xargs)\""
!       done
!     else
!       echo "Error: Claims required for verify action. Use: /audit verify claims:\"claim1,claim2\""
!       exit 1
!     fi
!     ;;
!   "anomalies")
!     CMD="$CMD --anomalies"
!     ;;
!   *)
!     # Default summary - no additional flags needed
!     ;;
! esac

# Add session flag if provided
! if [ -n "$SESSION" ]; then
!   CMD="$CMD --session $SESSION"
! fi

## Step 3: Execute Log Analyzer

Run the constructed command and display results:

! echo "Executing: $CMD"
! echo "==========================================="
! eval "$CMD"

## Available Actions

- **summary** (default): Quick overview of session metrics
- **report**: Comprehensive audit report with all details  
- **metrics**: Detailed metrics about tools, files, and performance
- **timeline**: Chronological view of all events (use limit: to control output)
- **verify**: Verify specific claims about what was accomplished
- **anomalies**: Detect unusual patterns or potential issues

## Usage Examples

- `/audit` - Show summary for current session
- `/audit report` - Generate full audit report
- `/audit timeline limit:25` - Show last 25 timeline events
- `/audit verify claims:"tests were run,files were created"` - Verify specific claims
- `/audit metrics session:abc123` - Show metrics for specific session ID
- `/audit anomalies` - Detect anomalies in current session