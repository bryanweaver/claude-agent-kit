# Claude Agent Kit - CLI Package Plan

**Version:** 1.0.0
**Package Name:** `@bryanweaver/claude-agent-kit`
**Created:** 2025-11-22
**Repository:** https://github.com/bryanweaver/agent-orchestration-system

## Project Overview

A CLI tool and npm package that distributes a curated collection of Claude Code agents, slash commands, and hooks to enhance developer productivity with AI-assisted development workflows.

### Goals

1. **Easy Distribution**: One-command installation of professional-grade Claude Code agents
2. **Safe Installation**: Never overwrite user configurations without explicit consent
3. **Flexible Deployment**: Support both global and project-level installations
4. **Zero Friction**: Work with `npx` for instant tryouts
5. **Community Building**: Create a shareable, version-controlled agent ecosystem

## What We're Distributing

### Assets Included

| Type | Count | Examples |
|------|-------|----------|
| **Agents** | 6 | shipper, reviewer, meta-agent, database-admin, full-stack-developer, meta-commands-agent |
| **Commands** | 8 | /ship, /fix, /cleanup, /audit, /repo-status, /add-tests, /test |
| **Hooks** | 6 | audit_logger.js, session_manager.js, diagnose.js, log_analyzer.js, session_start.js, test_hooks.js |
| **Documentation** | 7 | AI reference docs for subagents, commands, hooks, quick start |

### Asset Purposes

**Agents:**
- `shipper` - Git operations, testing, building, deployment pipeline
- `reviewer` - Pragmatic code review focusing on security and bugs
- `meta-agent` - Generates new custom agents from descriptions
- `meta-commands-agent` - Creates perfect slash commands
- `database-admin` - AWS Amplify backend specialist
- `full-stack-developer` - Vue.js frontend development expert

**Commands:**
- `/ship` - Build and deploy features from start to production
- `/fix` - Emergency bug fixes and rapid issue resolution
- `/cleanup` - Technical debt and refactoring
- `/audit` - Analyze and view audit logs
- `/repo-status` - Comprehensive repository status report
- `/add-tests` - Add critical test coverage
- `/test` - Batch test and fix workflows

**Hooks:**
- Audit logging for all tool usage
- Session management and persistence
- Diagnostic tools for troubleshooting

## Package Architecture

### Directory Structure

```
@bryanweaver/claude-agent-kit/
├── package.json
├── README.md
├── LICENSE
├── bin/
│   └── cli.js                    # Main CLI entry point
├── lib/
│   ├── install.js                # Installation logic
│   ├── uninstall.js              # Removal logic
│   ├── update.js                 # Update existing installations
│   ├── list.js                   # List installed assets
│   ├── restore.js                # Restore from backups
│   ├── conflict-resolver.js      # Conflict detection & resolution
│   ├── settings-merger.js        # Smart settings.json merging
│   ├── file-operations.js        # File copy, backup, hash utilities
│   └── prompts.js                # Interactive CLI prompts
├── templates/
│   ├── agents/
│   │   ├── shipper.md
│   │   ├── reviewer.md
│   │   ├── meta-agent.md
│   │   ├── meta-commands-agent.md
│   │   ├── database-admin.md
│   │   └── full-stack-developer.md
│   ├── commands/
│   │   ├── ship.md
│   │   ├── fix.md
│   │   ├── cleanup.md
│   │   ├── audit.md
│   │   ├── repo-status.md
│   │   ├── add-tests.md
│   │   ├── test.md
│   │   └── all_tools.md
│   ├── hooks/
│   │   ├── audit_logger.js
│   │   ├── session_manager.js
│   │   ├── diagnose.js
│   │   ├── log_analyzer.js
│   │   ├── session_start.js
│   │   └── test_hooks.js
│   └── settings/
│       └── recommended-settings.json
└── .claude-agent-kit/
    └── manifest.json             # Tracks what was installed
```

### Dependencies

```json
{
  "dependencies": {
    "chalk": "^5.3.0",          // Terminal colors
    "commander": "^11.1.0",     // CLI framework
    "inquirer": "^9.2.12",      // Interactive prompts
    "ora": "^7.0.1",            // Spinners
    "diff": "^5.1.0",           // Show file diffs
    "fs-extra": "^11.2.0"       // Enhanced file operations
  }
}
```

## CLI Commands

### Primary Commands

#### `install` - Install agents, commands, and hooks

```bash
# Basic installation (interactive)
claude-agent-kit install

# Global installation (to ~/.claude/)
claude-agent-kit install --global

# Project installation (to ./.claude/)
claude-agent-kit install --project

# Install specific assets
claude-agent-kit install --agents=shipper,reviewer
claude-agent-kit install --commands=ship,fix
claude-agent-kit install --hooks=audit_logger

# Install only certain types
claude-agent-kit install --only=agents
claude-agent-kit install --only=commands

# Conflict handling
claude-agent-kit install --skip-existing
claude-agent-kit install --backup
claude-agent-kit install --force

# Preview mode
claude-agent-kit install --dry-run

# Non-interactive (for CI/automation)
claude-agent-kit install --yes --skip-existing

# With namespace prefix
claude-agent-kit install --prefix="bw-"
```

#### `update` - Update existing installations

```bash
# Update all installed assets
claude-agent-kit update

# Update specific assets
claude-agent-kit update --agents=shipper

# Check for updates without installing
claude-agent-kit update --check
```

#### `uninstall` - Remove installed assets

```bash
# Remove all installed assets (with confirmation)
claude-agent-kit uninstall

# Remove specific assets
claude-agent-kit uninstall --agents=shipper,reviewer

# Force removal without confirmation
claude-agent-kit uninstall --yes
```

#### `list` - Show installed assets

```bash
# List all installed assets
claude-agent-kit list

# List with versions
claude-agent-kit list --versions

# Show installation paths
claude-agent-kit list --paths
```

#### `restore` - Restore from backups

```bash
# List available backups
claude-agent-kit restore --list

# Restore specific backup
claude-agent-kit restore --date=2025-11-22

# Restore specific file
claude-agent-kit restore --file=shipper.md
```

#### `init` - Interactive setup wizard

```bash
# Start interactive setup
claude-agent-kit init

# Wizard flow:
# 1. Choose installation location (global/project)
# 2. Select assets to install
# 3. Configure conflict resolution strategy
# 4. Review and confirm
```

## Conflict Resolution Strategy

### Detection Process

1. **Pre-Installation Scan**: Check all target paths before any file operations
2. **Hash Comparison**: Compare file hashes to detect if files are identical
3. **Categorize Conflicts**:
   - Identical (skip automatically)
   - Different (requires resolution)
   - New (install without prompt)

### Resolution Options

#### Option 1: Skip Existing (Default Safe Mode)
- Installs only new files
- Leaves existing files untouched
- **Use case**: First-time users, cautious installations

#### Option 2: Backup & Install
- Creates timestamped backups (`.backup-YYYY-MM-DD`)
- Installs all package files
- Easy rollback via `restore` command
- **Use case**: Updating installations

#### Option 3: Interactive Per-File
- Show diff for each conflict
- User decides: keep, replace, merge, rename, skip
- Most control, requires user input
- **Use case**: Customized setups, selective updates

#### Option 4: Force Overwrite
- Overwrites everything without backup
- Requires `--force` flag and confirmation
- **Use case**: Clean reinstalls, CI environments

#### Option 5: Namespace Prefix
- Installs with prefix (e.g., `bw-shipper.md`)
- Avoids all conflicts
- **Use case**: Trying package alongside existing setup

### Special Case: Settings Merging

Settings.json requires intelligent merging:

```javascript
// Merge Strategy
{
  permissions: {
    allow: [...existing, ...package],  // Combine arrays
  },
  statusLine: existing || package,     // Keep existing
  hooks: mergeHooks(existing, package) // Smart hook merge
}
```

**Hook Merging Rules:**
- If hook doesn't exist → add from package
- If hook exists but different → prompt user
- If identical → skip
- Always preserve user's custom hooks

## Installation Manifest

Track what was installed for clean uninstalls:

```json
// ~/.claude/.claude-agent-kit/manifest.json
{
  "version": "1.2.0",
  "installedAt": "2025-11-22T10:30:00Z",
  "installationType": "global",
  "assets": {
    "agents": [
      {
        "name": "shipper.md",
        "version": "1.2.0",
        "hash": "sha256:abc123...",
        "installedAt": "2025-11-22T10:30:00Z",
        "hadConflict": true,
        "resolution": "backup",
        "backupPath": "~/.claude/agents/shipper.md.backup-2025-11-22"
      }
    ],
    "commands": [...],
    "hooks": [...]
  }
}
```

## Implementation Phases

### Phase 1: Core CLI Foundation
- [ ] Initialize npm package structure
- [ ] Set up CLI framework with Commander.js
- [ ] Implement basic install command (no conflict handling)
- [ ] Copy templates from current repo
- [ ] Test with `npx` locally

**Deliverable**: Basic working CLI that installs to `~/.claude/`

### Phase 2: Conflict Detection
- [ ] Implement file hash comparison
- [ ] Build conflict detection system
- [ ] Create backup functionality
- [ ] Add dry-run mode
- [ ] Interactive prompts with Inquirer.js

**Deliverable**: Safe installation with conflict warnings

### Phase 3: Advanced Features
- [ ] Settings.json smart merging
- [ ] Selective installation (--agents, --commands)
- [ ] Update command
- [ ] Uninstall command
- [ ] List command with manifest tracking

**Deliverable**: Full-featured CLI with all commands

### Phase 4: Polish & Documentation
- [ ] Comprehensive README
- [ ] Add examples for all commands
- [ ] Doctor command for validation
- [ ] Better error messages
- [ ] Add tests

**Deliverable**: Production-ready package

### Phase 5: Publish & Iterate
- [ ] Publish v1.0.0 to npm
- [ ] Create GitHub releases
- [ ] Community feedback
- [ ] Bug fixes and feature requests

## Template Customization

Some agents reference "DealDocs" or specific tech stacks. Options:

### Strategy A: Generic Defaults (Recommended for v1.0)
Ship generic versions:
```markdown
You are the Backend Infrastructure Specialist for this application.
```

### Strategy B: Interactive Customization (Future)
Prompt during installation:
```bash
? Project name: my-awesome-app
? Tech stack: AWS Amplify / Firebase / Generic
```

### Strategy C: Multiple Templates (Future)
Provide variations for different stacks.

**Recommendation**: Start with generic (Strategy A)

## Publishing Strategy

### NPM Registry

```bash
# Package name
@bryanweaver/claude-agent-kit

# Initial version
1.0.0

# Public package
npm publish --access public
```

### Versioning

Follow Semantic Versioning:
- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New agents, new commands
- **Patch** (1.0.0 → 1.0.1): Bug fixes, docs

## Security Considerations

1. **Code Execution**: Hooks contain JavaScript - users should review
2. **Permissions**: Commands may request broad permissions
3. **Updates**: Pin dependencies, use lockfile
4. **Audit**: Run `npm audit` before publishing

### Security Documentation

```markdown
## Security Notice

This package installs JavaScript hooks that execute on events.
Review all files before installing - they're open source in this repo.

Report security issues: security@bryanweaver.dev
```

## Future Enhancements

### v1.1+
- [ ] Agent marketplace (community contributions)
- [ ] Template variables for customization
- [ ] Agent testing framework
- [ ] Analytics (anonymized usage stats)

### v2.0+
- [ ] Web UI for browsing agents
- [ ] Agent version pinning per project
- [ ] Dependency management between agents

## Success Metrics

### Initial Goals (v1.0)
- 100+ npm downloads in first month
- 10+ GitHub stars
- 3+ community contributions
- Zero critical security issues

### Growth Goals (6 months)
- 1,000+ npm downloads
- 50+ GitHub stars
- Active community discussions

## Open Questions

1. **Licensing**: MIT or Apache 2.0?
2. **Naming**: `claude-agent-kit` vs `claude-agents`?
3. **Customization**: How much template customization in v1.0?
4. **Settings**: Should we install recommended settings by default?

## Next Steps

1. ✅ Create this plan document
2. [ ] Decide on licensing and final package name
3. [ ] Initialize npm package structure
4. [ ] Implement Phase 1 (Core CLI)
5. [ ] Test with beta users
6. [ ] Publish v1.0.0

---

**Status**: Planning
**Target Release**: v1.0.0 - December 2025
**Maintainer**: @bryanweaver
