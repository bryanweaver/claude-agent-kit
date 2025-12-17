---
allowed-tools: Bash, Grep, Read, Glob
argument-hint: [optional: specific area to focus on like 'git', 'todos', 'health']
description: Comprehensive repository status report with git info, development activity, and project health
---

# Repository Status Report: $ARGUMENTS

Generate a comprehensive status report for the current repository including git status, recent development activity, planned work items, and project health indicators.

## Step 1: Git Repository Status

First, gather current git repository information:

! echo "=== GIT REPOSITORY STATUS ==="
! echo "Current Branch: $(git branch --show-current)"
! echo "Repository Status:"
! git status --short
! echo ""
! echo "Branch Information:"
! git branch -v
! echo ""
! echo "Remote Information:"
! git remote -v
! echo ""
! echo "Recent Commits (last 10):"
! git log --oneline -10 --graph --decorate
! echo ""

## Step 2: Development Activity Analysis

Analyze recent development patterns:

! echo "=== DEVELOPMENT ACTIVITY ==="
! echo "Files changed in last 7 days:"
! git log --since="7 days ago" --name-only --pretty=format: | sort | uniq -c | sort -nr | head -15
! echo ""
! echo "Contributors (last 30 days):"
! git log --since="30 days ago" --pretty=format:"%an" | sort | uniq -c | sort -nr
! echo ""
! echo "File types modified recently:"
! git log --since="7 days ago" --name-only --pretty=format: | grep -E "\.[a-zA-Z]+$" | sed 's/.*\.//' | sort | uniq -c | sort -nr | head -10
! echo ""

## Step 3: Planned Work and Action Items

Search for TODO items, FIXMEs, and other action items across the codebase:

! echo "=== PLANNED WORK & ACTION ITEMS ==="
! echo "Searching for action items in codebase..."
! echo ""

**TODO Items Found:**

Search for TODO comments with line numbers and context:

! echo "TODO items in codebase:"

@grep pattern="TODO|todo" output_mode="content" -n=true -C=1

@grep pattern="@todo" output_mode="content" -n=true -C=1

**FIXME and Known Issues:**

Search for FIXME comments that need attention:

! echo "FIXME items requiring attention:"

@grep pattern="FIXME|fixme" output_mode="content" -n=true -C=1

@grep pattern="@fixme" output_mode="content" -n=true -C=1

**HACK and Temporary Solutions:**

Search for temporary code that needs proper implementation:

! echo "HACK/TEMP items needing proper implementation:"

@grep pattern="HACK|hack" output_mode="content" -n=true -C=1

@grep pattern="TEMP|temp|temporary" output_mode="content" -n=true -C=1

## Step 4: Project Health Assessment

Evaluate overall project health and configuration:

! echo "=== PROJECT HEALTH INDICATORS ==="
! echo "Configuration and Dependencies:"

Check for important configuration files:

! echo "Configuration Files:"

Find package and configuration files:

@glob pattern="*.json"
@glob pattern="*.toml"
@glob pattern="*.yaml"
@glob pattern="*.yml"

@glob pattern="package.json"
@glob pattern="requirements.txt"
@glob pattern="Cargo.toml"
@glob pattern="pyproject.toml"

Check for test coverage:

! echo "Test File Coverage:"

Find test files and patterns:

@glob pattern="**/*test*"
@glob pattern="**/test*"

@glob pattern="**/*spec*"
@glob pattern="**/spec*"

Check for documentation:

! echo "Documentation Status:"

Find documentation files:

@glob pattern="**/README*"
@glob pattern="**/readme*"

@glob pattern="**/*.md"
@glob pattern="**/docs/**"

## Step 5: Generate Summary Report

Based on the gathered information, provide actionable insights:

### Analysis Summary

1. **Git Health**: Current branch status, uncommitted changes, sync with remote
2. **Development Velocity**: Recent activity patterns, contributor engagement, file hotspots  
3. **Technical Debt**: Action items by priority, areas needing attention
4. **Project Status**: Configuration completeness, test coverage, documentation gaps

### Recommended Next Steps

Prioritized recommendations based on findings:
- Urgent items requiring immediate attention
- Technical debt to address in next sprint
- Process improvements for development workflow
- Areas for increased test coverage or documentation

### Focus Areas

If specific focus area provided in $ARGUMENTS, provide detailed analysis for that area:
- **git**: Deep dive into repository health and branch management
- **todos**: Comprehensive action item analysis and prioritization  
- **health**: Overall project health assessment and recommendations
- **activity**: Detailed development activity and contributor patterns