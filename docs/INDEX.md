# Spotify Time Machine Documentation Index

Welcome to the Spotify Time Machine documentation. This documentation is organized using the [Diátaxis framework](https://diataxis.fr/) to provide clear, actionable, and comprehensive guidance.

## 📚 Documentation Structure

This documentation follows the Diátaxis framework, organizing content into four distinct categories:

### 🎓 Tutorials (Learning-Oriented)

_Step-by-step lessons for getting started_

Currently no tutorial documents. Consider adding:

- Getting Started with Spotify Time Machine
- Your First Playlist Generator
- Understanding Your Music Statistics

### 🔧 How-To Guides (Task-Oriented)

_Practical guides for accomplishing specific tasks_

**CI/CD & Testing:**

- [CI/CD Optimization Guide](./how-to/ci-cd-optimization.md) - Complete guide to optimizing CI/CD pipeline
- [CI/CD Summary](./how-to/ci-cd-summary.md) - Quick overview of CI/CD improvements
- [Turborepo Remote Cache Setup](./how-to/turborepo-remote-cache-setup.md) - Enable shared caching with Vercel
- [Sharded Test Fixes](./how-to/sharded-test-fixes.md) - Fixing and debugging sharded tests
- [Codecov Setup](./how-to/codecov-setup.md) - Set up code coverage tracking

**Configuration:**

- [Environment Setup](./how-to/environment-setup.md) - Configure environment variables

### 📖 Reference (Information-Oriented)

_Technical descriptions and specifications_

**Core Documentation:**

- [README](./README.md) - Project overview and quick start
- [LLM Context](./reference/llm-context.md) - Comprehensive project context for AI assistants
- [TODO](./reference/todo.md) - Feature implementation checklist and roadmap
- [Branding Guide](./reference/branding.md) - Spotify design guidelines and color tokens

**Quick References:**

- [Quick Reference](./reference/quick-reference.md) - Fast lookup for common tasks
- [CI/CD Quick Reference](./reference/ci-cd-quick-reference.md) - CI/CD commands and troubleshooting
- [Environment Configuration](./reference/environment-configuration.md) - Complete environment variable reference

**Testing & Debug References:**

- [Sharded Test Debug Checklist](./reference/sharded-test-debug-checklist.md) - Debugging test sharding issues
- [Sharding Quick Debug](./reference/sharding-quick-debug.md) - Fast debugging for test shards
- [Sharding Verification](./reference/sharding-verification.md) - Test shard verification procedures

### 💡 Explanation (Understanding-Oriented)

_Background and context to deepen understanding_

**Migration Guides:**

- [Analytics Migration](./explanation/analytics-migration.md) - Analytics platform migration details
- [Domain Migration](./explanation/domain-migration.md) - Domain transition process
- [Oxlint Migration](./explanation/oxlint-migration.md) - Switching from ESLint to Oxlint
- [Environment Migration](./explanation/environment-migration.md) - Environment configuration system migration
- [Migration Complete Summary](./explanation/migration-complete.md) - Process.env migration summary

**Implementation Details:**

- [Implementation Summary](./explanation/implementation-summary.md) - Overview of major implementations
- [Improvements Summary](./explanation/improvements-summary.md) - Summary of project improvements
- [DevOps Improvements](./explanation/devops-improvements.md) - Infrastructure and DevOps enhancements
- [Token Management](./explanation/token-management.md) - Authentication and token handling
- [Turborepo Optimization](./explanation/turborepo-optimization.md) - Task caching and parallelization
- [Turborepo Remote Cache Implementation](./explanation/turborepo-remote-cache-implementation.md) - Remote caching setup
- [Sharding Fix Applied](./explanation/sharding-fix-applied.md) - Test sharding implementation details
- [Codecov Integration](./explanation/codecov-integration.md) - Code coverage integration architecture
- [Test Environment Isolation](./explanation/test-environment-isolation.md) - Test isolation strategy
- [MSW LocalStorage Issue](./explanation/msw-localstorage-issue.md) - MSW localStorage fix explanation

### 🛠️ Development (Developer Resources)

_Tools, setup, and development workflows_

- [Dev Tools](./development/dev-tools.md) - Developer experience and DevSecOps tools
- [Tool Installation](./development/tool-installation.md) - Installing and configuring development tools

---

## 🚀 Quick Start

**New to the project?**

1. Start with the [README](./README.md)
2. Review [LLM Context](./reference/LLM_CONTEXT.md) for comprehensive project overview
3. Check [TODO](./reference/TODO.md) for current priorities

**Need to accomplish a specific task?**

- Browse the [How-To Guides](#-how-to-guides-task-oriented)
- Check the [Quick Reference](./reference/QUICK_REFERENCE.md)

**Want to understand the architecture?**

- Read through the [Explanation](#-explanation-understanding-oriented) documents
- Review specific implementation details in the explanation folder

**Setting up your development environment?**

- Follow [Dev Tools](./development/DEV_TOOLS.md)
- Install tools using [Tool Installation](./development/TOOL_INSTALLATION.md)

---

## 📂 Directory Structure

```
docs/
├── INDEX.md                          # This file - documentation navigation
├── README.md                         # Project overview and quick start
├── tutorials/                        # Step-by-step learning guides
├── how-to/                          # Task-oriented practical guides
│   ├── CI_CD_OPTIMIZATION.md
│   ├── CI_CD_SUMMARY.md
│   └── SHARDED_TEST_FIXES.md
├── reference/                       # Technical reference materials
│   ├── BRANDING.md
│   ├── LLM_CONTEXT.md
│   ├── TODO.md
│   ├── QUICK_REFERENCE.md
│   ├── CI_CD_QUICK_REFERENCE.md
│   ├── SHARDED_TEST_DEBUG_CHECKLIST.md
│   ├── SHARDING_QUICK_DEBUG.md
│   └── SHARDING_VERIFICATION.md
├── explanation/                     # Background and context
│   ├── ANALYTICS_MIGRATION.md
│   ├── DOMAIN_MIGRATION.md
│   ├── OXLINT_MIGRATION.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── IMPROVEMENTS_SUMMARY.md
│   ├── DEVOPS_IMPROVEMENTS.md
│   ├── TOKEN_MANAGEMENT.md
│   └── SHARDING_FIX_APPLIED.md
└── development/                     # Developer tools and setup
    ├── DEV_TOOLS.md
    └── TOOL_INSTALLATION.md
```

---

## 🔍 Finding What You Need

### By Topic

**Authentication & API:**

- [Token Management](./explanation/TOKEN_MANAGEMENT.md) - Token handling explanation
- [LLM Context](./reference/LLM_CONTEXT.md) - Auth architecture details

**CI/CD Pipeline:**

- [CI/CD Optimization](./how-to/CI_CD_OPTIMIZATION.md) - Complete optimization guide
- [CI/CD Summary](./how-to/CI_CD_SUMMARY.md) - Quick overview
- [CI/CD Quick Reference](./reference/CI_CD_QUICK_REFERENCE.md) - Command reference

**Testing:**

- [Sharded Test Fixes](./how-to/SHARDED_TEST_FIXES.md) - How to fix test issues
- [Sharded Test Debug Checklist](./reference/SHARDED_TEST_DEBUG_CHECKLIST.md) - Debug reference
- [Sharding Verification](./reference/SHARDING_VERIFICATION.md) - Verification procedures

**Design & Branding:**

- [Branding Guide](./reference/BRANDING.md) - Spotify design guidelines

**Development Setup:**

- [Dev Tools](./development/DEV_TOOLS.md) - Available tools and commands
- [Tool Installation](./development/TOOL_INSTALLATION.md) - Setup instructions
- [Turborepo Optimization](./explanation/turborepo-optimization.md) - Build system and task caching

**Project Planning:**

- [TODO](./reference/TODO.md) - Feature checklist and roadmap
- [Implementation Summary](./explanation/IMPLEMENTATION_SUMMARY.md) - What's been done

### By Role

**New Developer:**

1. [README](./README.md)
2. [LLM Context](./reference/LLM_CONTEXT.md)
3. [Dev Tools](./development/DEV_TOOLS.md)
4. [TODO](./reference/TODO.md)

**AI Assistant (Kilo Code, GitHub Copilot, etc.):**

1. [Kilo Code.md](.kilocode/rules/memory-bank)
2. [LLM Context](./reference/LLM_CONTEXT.md)
3. [Quick Reference](./reference/QUICK_REFERENCE.md)

**DevOps Engineer:**

1. [CI/CD Optimization](./how-to/CI_CD_OPTIMIZATION.md)
2. [DevOps Improvements](./explanation/DEVOPS_IMPROVEMENTS.md)
3. [CI/CD Quick Reference](./reference/CI_CD_QUICK_REFERENCE.md)

**QA Engineer:**

1. [Sharded Test Fixes](./how-to/SHARDED_TEST_FIXES.md)
2. [Sharding Verification](./reference/SHARDING_VERIFICATION.md)
3. [Sharding Quick Debug](./reference/SHARDING_QUICK_DEBUG.md)

---

## 🤝 Contributing to Documentation

When adding new documentation:

1. **Choose the right category** based on the Diátaxis framework:
   - **Tutorials:** Learning-oriented, step-by-step lessons for beginners
   - **How-To Guides:** Problem-solving guides for specific tasks
   - **Reference:** Technical descriptions, specs, and quick lookups
   - **Explanation:** Conceptual explanations and background context
   - **Development:** Developer tools, setup, and workflows

2. **Update this INDEX.md** to include your new document

3. **Follow naming conventions:**
   - Use UPPERCASE_WITH_UNDERSCORES for markdown files
   - Be descriptive and specific
   - Include category in the path (e.g., `docs/how-to/NEW_GUIDE.md`)

4. **Link related documents** to create a documentation web

---

## 📊 Documentation Health

Last Updated: October 23, 2025

**Status:**

- ✅ Core documentation organized and indexed
- ✅ Diátaxis framework structure implemented
- ⚠️ Tutorials section needs content
- ✅ Reference materials comprehensive
- ✅ How-to guides available
- ✅ Explanation documents detailed

**Priorities:**

1. Add getting started tutorial
2. Create developer onboarding guide
3. Add API usage tutorials
4. Expand testing how-to guides

---

## 🔗 External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Diátaxis Framework](https://diataxis.fr/)

---

**Need help?** Check the [Quick Reference](./reference/QUICK_REFERENCE.md) or [Dev Tools](./development/DEV_TOOLS.md) for common commands and workflows.
