---
name: team-repo-status
description: Comprehensive repository status report with git info, development activity, and project health
argument-hint: [optional: specific area like 'git', 'todos', 'health']
disable-model-invocation: true
allowed-tools: Bash(git *), Bash(echo *), Read, Grep, Glob
---

# Repository Status Report

Generate a comprehensive status report for the current repository.

**Focus area:** $ARGUMENTS

## Execution

Gather and analyze the following information:

### 1. Git Repository Status

Run these commands to gather git state:

- `git branch --show-current` — current branch
- `git status --short` — working tree status
- `git branch -v` — all branches
- `git remote -v` — remote info
- `git log --oneline -10 --graph --decorate` — recent commits

### 2. Development Activity

Analyze recent development patterns:

- `git log --since="7 days ago" --name-only --pretty=format:` — files changed recently
- `git log --since="30 days ago" --pretty=format:"%an"` — contributors
- File types modified recently

### 3. Action Items

Search the codebase for:

- **TODO** items with file:line context
- **FIXME** items requiring attention
- **HACK/TEMP** items needing proper implementation

### 4. Project Health

Evaluate project configuration:

- Configuration files present (package.json, requirements.txt, etc.)
- Test file coverage (test/spec files)
- Documentation status (README, docs/)

### 5. Summary Report

Provide actionable insights:

- **Git Health:** Branch status, uncommitted changes, remote sync
- **Development Velocity:** Activity patterns, file hotspots
- **Technical Debt:** Action items by priority
- **Project Status:** Config completeness, test coverage, doc gaps

If `$ARGUMENTS` specifies a focus area (git, todos, health, activity), provide an in-depth analysis for that area.
