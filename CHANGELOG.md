# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Skills system for code patterns (supabase-patterns, nextjs-app-router, shadcn-components, tanstack-query, testing-patterns)
- `--skills` option for installing Skills
- CHANGELOG.md for version tracking
- GitHub Actions CI/CD workflows
- ESLint configuration
- Basic CLI tests
- CONTRIBUTING.md

### Changed
- Updated agents from AWS/Vue.js to Supabase/Next.js stack
- Slimmed down full-stack-developer and database-admin agents
- Renamed hook files from .js to .cjs for CommonJS compatibility
- Added safety warnings to supabase-patterns Skill

### Fixed
- Path traversal vulnerability in file operations
- Command injection vulnerability in CLI

## [1.0.0] - 2024-11-22

### Added
- Initial release
- CLI tool with `install` and `list` commands
- 6 agents: shipper, reviewer, meta-agent, meta-commands-agent, database-admin, full-stack-developer
- 8 commands: ship, fix, cleanup, audit, repo-status, add-tests, test, all_tools
- 6 hooks: audit_logger, session_manager, diagnose, log_analyzer, session_start, test_hooks
- Global and project installation support
- Selective installation with `--agents`, `--commands`, `--hooks` options
- Conflict detection with diff display
- Interactive prompts for file conflicts

[Unreleased]: https://github.com/bryanweaver/claude-agent-kit/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/bryanweaver/claude-agent-kit/releases/tag/v1.0.0
