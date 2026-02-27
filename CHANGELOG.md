# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0](https://github.com/bryanweaver/claude-agent-kit/compare/v2.0.0...v3.0.0) (2026-02-27)


### ⚠ BREAKING CHANGES

* Package is now a Claude Code plugin only — no CLI entrypoint.

### Features

* Complete v3 migration with structural validation tests ([#14](https://github.com/bryanweaver/claude-agent-kit/issues/14)) ([67da3c5](https://github.com/bryanweaver/claude-agent-kit/commit/67da3c5832e65b6cfe3f015418df5c0f18e4b239))

## [3.0.0](https://github.com/bryanweaver/claude-agent-kit/compare/v2.0.0...v3.0.0) (2026-02-26)

### ⚠ BREAKING CHANGES

* Package is now a Claude Code plugin only — no CLI entrypoint, no npm install, no templates. Install via Claude Code Marketplace or `--plugin-dir`.

### Features

* Complete v3 migration: remove CLI (`bin/cli.js`), libs (`lib/`), and templates (`templates/`) in favor of a pure plugin architecture
* Agents are now stack-adaptive — detect the project's tech stack at runtime by scanning config files; no per-project generation step needed
* Add structural validation test suite (`test/validate-plugin.test.js`) — 156 tests using zero-dependency `node:test` covering frontmatter, cross-references, plugin structure, and stale-reference guards
* Add `meta-skills-agent` to generate new workflow skills on demand via `/team-create-skill`
* Skills moved from `templates/skills/` to top-level `skills/` directory

### Removed

* `bin/cli.js` — CLI entrypoint removed; plugin-only distribution
* `lib/` — All runtime library files removed (`init.js`, `install.js`, `detect-stack.js`, `generate-agents.js`, `file-operations.js`, `stacks/`)
* `templates/` — Agent and hook templates removed; agents now live directly in `agents/`
* `test/cli.test.js`, `test/init.test.js` — Old CLI tests replaced by `test/validate-plugin.test.js`
* Docs: Removed `docs/architecture/agent-generation.md`, `docs/architecture/stack-detection.md`, `docs/guides/adding-new-stacks.md`, `docs/reference/agent-templates.md`, `docs/reference/cli-commands.md`, `docs/reference/supported-stacks.md`

## [2.0.0](https://github.com/bryanweaver/claude-agent-kit/compare/v1.1.0...v2.0.0) (2026-02-26)


### ⚠ BREAKING CHANGES

* Old custom slash commands (/ship, /fix, /cleanup, etc.) are removed. Use the new workflow skills instead (/team-ship, /team-fix, /team-cleanup).

### Features

* Add marketplace manifest for plugin distribution ([31ccd8d](https://github.com/bryanweaver/claude-agent-kit/commit/31ccd8dfacc5b821c5a52637730157fdc780eccd))
* Migrate to skills-only architecture ([#13](https://github.com/bryanweaver/claude-agent-kit/issues/13)) ([d0970ae](https://github.com/bryanweaver/claude-agent-kit/commit/d0970ae53c39f1db95bd1b0b9a7cf79ee45278e0))

## [1.2.0] - 2026-02-24

### Added
- Claude Code marketplace distribution via `.claude-plugin/marketplace.json`
- Plugin can now be installed directly through the Claude Code plugin marketplace:
  - `claude plugin marketplace add bryanweaver/claude-agent-kit`
  - `claude plugin install team@claude-agent-kit`
- `.claude-plugin/marketplace.json` manifest describing the `team` plugin and its metadata

### Changed
- Two distribution methods now available: npm CLI (`npx @bryanofearth/claude-agent-kit init`) and Claude Code plugin marketplace

## [1.1.0](https://github.com/bryanweaver/claude-agent-kit/compare/v1.0.3...v1.1.0) (2025-12-19)

### Features

* Add init command with multi-stack support ([#3](https://github.com/bryanweaver/claude-agent-kit/issues/3)) ([bf7ef48](https://github.com/bryanweaver/claude-agent-kit/commit/bf7ef48c911f53830af2dfee04b278029cbe2401))
* Add release-please for automated semantic versioning ([1f3bbf2](https://github.com/bryanweaver/claude-agent-kit/commit/1f3bbf2e5aa40490e9248ddbd4e60299879d76c5))

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

[3.0.0]: https://github.com/bryanweaver/claude-agent-kit/compare/v2.0.0...v3.0.0
[1.2.0]: https://github.com/bryanweaver/claude-agent-kit/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/bryanweaver/claude-agent-kit/compare/v1.0.3...v1.1.0
[1.0.3]: https://github.com/bryanweaver/claude-agent-kit/releases/tag/v1.0.3
[1.0.2]: https://github.com/bryanweaver/claude-agent-kit/releases/tag/v1.0.2
[1.0.1]: https://github.com/bryanweaver/claude-agent-kit/releases/tag/v1.0.1
[1.0.0]: https://github.com/bryanweaver/claude-agent-kit/releases/tag/v1.0.0
