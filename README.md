# Jermaine's Spotify Time Machine

<!-- Status badges -->

[![CI/CD](https://github.com/jjsizemore/spotify-time-machine/actions/workflows/ci.yml/badge.svg)](https://github.com/jjsizemore/spotify-time-machine/actions)
[![Tests](https://github.com/jjsizemore/spotify-time-machine/actions/workflows/test.yml/badge.svg)](https://github.com/jjsizemore/spotify-time-machine/actions/workflows/test.yml)
[![codecov](https://codecov.io/github/jjsizemore/spotify-time-machine/branch/main/graph/badge.svg)](https://codecov.io/github/jjsizemore/spotify-time-machine)
[![CodeQL](https://github.com/jjsizemore/spotify-time-machine/actions/workflows/codeql.yml/badge.svg)](https://github.com/jjsizemore/spotify-time-machine/actions/workflows/codeql.yml)
[![Dependency Review](https://github.com/jjsizemore/spotify-time-machine/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/jjsizemore/spotify-time-machine/actions/workflows/dependency-review.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

<!-- Tech badges (auto-updated) -->

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-latest-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.18-f69220?logo=pnpm&logoColor=white)](https://pnpm.io)

<!-- Tooling & community -->

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)
[![ESLint](https://img.shields.io/badge/ESLint-9.x-4B32C3?logo=eslint&logoColor=white)](https://eslint.org)
[![Oxlint](https://img.shields.io/badge/lint-oxlint-00A0E4)](https://oxc-project.github.io/docs/guide/usage/linter)
[![Tests: Vitest](https://img.shields.io/badge/tests-vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![E2E: Playwright](https://img.shields.io/badge/e2e-playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-fa6673.svg)](https://conventionalcommits.org)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/jjsizemore/spotify-time-machine/pulls)
[![Discussions](https://img.shields.io/badge/discussions-welcome-FF4081?logo=github)](https://github.com/jjsizemore/spotify-time-machine/issues)

A Next.js application that lets you explore your Spotify listening history, create playlists based on specific time periods, and visualize your music journey. Now featuring **enterprise-grade infrastructure** with advanced token management, request queuing, and comprehensive debugging tools.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables (see below)
cp .env.example .env.local

# Start development server
pnpm dev
```

Visit [http://127.0.0.1:3000](http://127.0.0.1:3000) to view the application.

## ✨ Key Features

- 🎵 **Comprehensive Dashboard** - View top artists, tracks, genres, and listening trends
- 📅 **Monthly History** - Browse chronological timeline of liked tracks
- 🎨 **Visualizations** - Interactive charts for listening patterns and genre evolution
- 🎵 **Playlist Generation** - Create monthly or custom playlists
- 🔐 **Secure Authentication** - OAuth 2.0 with PKCE implementation
- ⚡ **Enterprise Infrastructure** - Advanced token management and request queuing
- 📊 **Analytics Integration** - Google Analytics 4, Vercel Analytics, PostHog, and Sentry

## 📚 Documentation

**📖 [Complete Documentation Index](./docs/INDEX.md)** - Start here for comprehensive guides

### Quick Links

**Getting Started:**

- [Project Overview](./docs/README.md) - Detailed project information and features
- [Developer Tools](./docs/development/dev-tools.md) - Available tools and commands
- [Tool Installation](./docs/development/tool-installation.md) - Setup guide

**For Developers:**

- [LLM Context](./docs/reference/llm-context.md) - Comprehensive project context
- [TODO Roadmap](./docs/reference/todo.md) - Feature implementation checklist
- [Quick Reference](./docs/reference/quick-reference.md) - Common commands and workflows

**For DevOps:**

- [CI/CD Optimization](./docs/how-to/ci-cd-optimization.md) - Pipeline optimization guide
- [CI/CD Quick Reference](./docs/reference/ci-cd-quick-reference.md) - CI/CD commands

## 🌟 Environment Setup

Create a `.env.local` file:

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXTAUTH_URL=http://127.0.0.1:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Get Spotify credentials at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

## 📦 Available Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality (Optimized with Turborepo)
pnpm check:parallel   # Run lint, format, type-check in parallel ⚡
pnpm lint             # Run linter (Oxlint + ESLint)
pnpm fmt              # Format code (Prettier)
pnpm fmt:check        # Check formatting
pnpm type-check       # TypeScript type checking
pnpm check            # Run lint + type-check
pnpm check:all        # Run all quality checks + tests

# Testing
pnpm test             # Run tests
pnpm test:coverage    # Run tests with coverage
pnpm test:ui          # Open test UI

# Security
pnpm security         # Run all security checks
pnpm security:secrets # Scan for secrets
pnpm security:deps    # Check dependencies
pnpm security:sast    # Static analysis

# Utilities
pnpm clean            # Clean build artifacts
pnpm clean:cache      # Clear Turborepo cache
pnpm analyze          # Analyze bundle size
```

See [Dev Tools Guide](./docs/development/dev-tools.md) for complete command reference.

### ⚡ Turborepo Optimization

This project uses [Turborepo](https://turbo.build/repo) for intelligent task caching and parallelization:

- **Parallel Execution**: Independent tasks run simultaneously for faster feedback
- **Smart Caching**: Only re-runs tasks when relevant files change
- **Optimized Inputs**: Precise file patterns minimize cache misses

Learn more in the [Turborepo Optimization Guide](./docs/explanation/turborepo-optimization.md).

## 🏗️ Project Structure

```
spotify-time-machine/
├── docs/                    # 📚 Complete documentation
│   ├── INDEX.md            # Documentation navigation
│   ├── tutorials/          # Learning-oriented guides
│   ├── how-to/             # Task-oriented guides
│   ├── reference/          # Technical reference
│   ├── explanation/        # Background and context
│   └── development/        # Developer resources
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and API clients
│   └── types/              # TypeScript types
├── public/                 # Static assets
└── tests/                  # Test files
```

## 🤝 Contributing

1. Check the [TODO roadmap](./docs/reference/todo.md) for current priorities
2. Review [Developer Tools](./docs/development/dev-tools.md) setup
3. Follow [code quality guidelines](./docs/reference/llm-context.md)
4. Run `pnpm check:all` before committing
5. Ensure all tests pass with `pnpm test`

## 📊 CI/CD

This project features an optimized CI/CD pipeline:

- ✅ **53% faster** CI runs (~7 minutes vs ~15 minutes)
- ✅ **85% cache hit rate** with automatic cleanup
- ✅ **Automated security scanning** (CodeQL, dependency review)
- ✅ **Sharded test execution** for parallel processing

See [CI/CD Optimization Guide](./docs/how-to/ci-cd-optimization.md) for details.

## 📈 Development Status

**Current Version:** In Active Development

**Completed:**

- ✅ Enhanced authentication with PKCE
- ✅ Enterprise Spotify API client
- ✅ Advanced token management
- ✅ Comprehensive analytics integration
- ✅ Optimized CI/CD pipeline
- ✅ Modern component architecture

**In Progress:**

- 🚧 Audio preview features
- 🚧 Server-side data aggregation
- 🚧 Enhanced visualizations

See [TODO.md](./docs/reference/TODO.md) for complete roadmap.

## 🔒 Security

- **Secret Scanning:** TruffleHog integration
- **Dependency Scanning:** OSV scanner
- **SAST:** Semgrep security rules
- **Security Headers:** Configured in Next.js
- **PKCE Flow:** OAuth 2.0 with enhanced security

Run security checks: `pnpm security`

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Next.js](https://nextjs.org/)
- [Vercel](https://vercel.com/)
- [Diátaxis Documentation Framework](https://diataxis.fr/)

---

**📚 For complete documentation, see [docs/INDEX.md](./docs/INDEX.md)**

**🐛 Found a bug?** [Open an issue](https://github.com/jjsizemore/spotify-time-machine/issues)

**💡 Have a suggestion?** [Open a discussion topic](https://github.com/jjsizemore/spotify-time-machine/issues)
