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

## [1.0.3] - 2024-12-16

### Changed
- Updated repository URLs after rename to `claude-agent-kit`
- Updated package name to `@bryanofearth/claude-agent-kit`
- Improved documentation organization

## [1.0.2] - 2024-12-16

### Added
- Comprehensive testing infrastructure
- GitHub Actions CI/CD workflows
- ESLint configuration and linting

### Fixed
- Path traversal security vulnerability
- Command injection security vulnerability
- Windows compatibility issues

## [1.0.1] - 2024-11-22

### Added
- Skills system for code patterns
- 5 Skills: supabase-patterns, nextjs-app-router, shadcn-components, tanstack-query, testing-patterns
- Additional commands: create-agent, initialize-documentation, update-docs

### Changed
- Updated agents from AWS/Vue.js to Supabase/Next.js stack
- Slimmed down agent definitions
- Renamed hook files from .js to .cjs for CommonJS compatibility

## [1.0.0] - 2024-11-22

### Added
- Initial release
- CLI tool with `install` and `list` commands
- 7 agents: shipper, reviewer, meta-agent, meta-commands-agent, database-admin, full-stack-developer, documentor
- 11 commands: ship, fix, cleanup, audit, repo-status, add-tests, test, all_tools, create-agent, initialize-documentation, update-docs
- 6 hooks: audit_logger, session_manager, diagnose, log_analyzer, session_start, test_hooks
- Global and project installation support
- Selective installation with `--agents`, `--commands`, `--hooks`, `--skills` options

[Unreleased]: https://github.com/bryanweaver/claude-agent-kit/compare/v1.0.3...HEAD
[1.0.3]: https://github.com/bryanweaver/claude-agent-kit/releases/tag/v1.0.3
[1.0.2]: https://github.com/bryanweaver/claude-agent-kit/releases/tag/v1.0.2
[1.0.1]: https://github.com/bryanweaver/claude-agent-kit/releases/tag/v1.0.1
[1.0.0]: https://github.com/bryanweaver/claude-agent-kit/releases/tag/v1.0.0
