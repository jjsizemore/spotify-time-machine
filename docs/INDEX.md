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

- [CI/CD Optimization Guide](./how-to/CI_CD_OPTIMIZATION.md) - Complete guide to optimizing CI/CD pipeline
- [CI/CD Summary](./how-to/CI_CD_SUMMARY.md) - Quick overview of CI/CD improvements
- [Sharded Test Fixes](./how-to/SHARDED_TEST_FIXES.md) - Fixing and debugging sharded tests

### 📖 Reference (Information-Oriented)

_Technical descriptions and specifications_

**Core Documentation:**

- [README](./README.md) - Project overview and quick start
- [LLM Context](./reference/LLM_CONTEXT.md) - Comprehensive project context for AI assistants
- [TODO](./reference/TODO.md) - Feature implementation checklist and roadmap
- [Branding Guide](./reference/BRANDING.md) - Spotify design guidelines and color tokens

**Quick References:**

- [Quick Reference](./reference/QUICK_REFERENCE.md) - Fast lookup for common tasks
- [CI/CD Quick Reference](./reference/CI_CD_QUICK_REFERENCE.md) - CI/CD commands and troubleshooting

**Testing & Debug References:**

- [Sharded Test Debug Checklist](./reference/SHARDED_TEST_DEBUG_CHECKLIST.md) - Debugging test sharding issues
- [Sharding Quick Debug](./reference/SHARDING_QUICK_DEBUG.md) - Fast debugging for test shards
- [Sharding Verification](./reference/SHARDING_VERIFICATION.md) - Test shard verification procedures

### 💡 Explanation (Understanding-Oriented)

_Background and context to deepen understanding_

**Migration Guides:**

- [Analytics Migration](./explanation/ANALYTICS_MIGRATION.md) - Analytics platform migration details
- [Domain Migration](./explanation/DOMAIN_MIGRATION.md) - Domain transition process
- [Oxlint Migration](./explanation/OXLINT_MIGRATION.md) - Switching from ESLint to Oxlint

**Implementation Details:**

- [Implementation Summary](./explanation/IMPLEMENTATION_SUMMARY.md) - Overview of major implementations
- [Improvements Summary](./explanation/IMPROVEMENTS_SUMMARY.md) - Summary of project improvements
- [DevOps Improvements](./explanation/DEVOPS_IMPROVEMENTS.md) - Infrastructure and DevOps enhancements
- [Token Management](./explanation/TOKEN_MANAGEMENT.md) - Authentication and token handling
- [Sharding Fix Applied](./explanation/SHARDING_FIX_APPLIED.md) - Test sharding implementation details

### 🛠️ Development (Developer Resources)

_Tools, setup, and development workflows_

- [Dev Tools](./development/DEV_TOOLS.md) - Developer experience and DevSecOps tools
- [Tool Installation](./development/TOOL_INSTALLATION.md) - Installing and configuring development tools

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
