# Claude Agent Kit Documentation

Welcome to the Claude Agent Kit documentation. This documentation covers the architecture, usage, and development of the Claude Agent Kit plugin.

## Table of Contents

### Architecture

- [System Overview](./architecture/system-overview.md) - High-level architecture and design decisions

### Guides

- [Getting Started](./guides/getting-started.md) - Installation and first steps
- [Development Workflow](./guides/development-workflow.md) - Local development and testing

### Reference

- [Lean Agile System](./lean-agile-system.md) - Detailed system specification: agents, skills, workflows, and coordination model

## Quick Links

- [README](../README.md) - Main project README
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Developer Guide](../DEVELOPER_GUIDE.md) - Development reference
- [Changelog](../CHANGELOG.md) - Version history

## Documentation Goals

This documentation is designed to:

1. **Explain the architecture** - Help contributors understand how the system works
2. **Guide developers** - Provide clear instructions for extending the toolkit
3. **Document decisions** - Record why things are designed the way they are
4. **Enable contribution** - Make it easy for others to add new agents and skills

## Plugin at a Glance

Claude Agent Kit v3 is a pure Claude Code plugin — no CLI, no templates, no npm dependencies at runtime. Key components:

| Directory | Purpose |
|-----------|---------|
| `agents/` | 7 agent definitions (5 core + 2 meta) |
| `skills/` | 12 workflow skills + 5 tech-stack pattern libraries |
| `hooks/` | 3 quality gates and observability hooks |
| `settings.json` | Enables Agent Teams mode automatically |
| `.claude-plugin/` | Plugin and marketplace manifests |

## Getting Help

- **Issues**: https://github.com/bryanweaver/claude-agent-kit/issues
- **Discussions**: https://github.com/bryanweaver/claude-agent-kit/discussions

---

Last updated: 2026-02-26
