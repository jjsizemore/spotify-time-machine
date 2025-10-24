# Jermaine's Spotify Time Machine

A Next.js application that lets you explore your Spotify listening history, create playlists based on specific time periods, and visualize your music journey. Now featuring **enterprise-grade infrastructure** with advanced token management, request queuing, and comprehensive debugging tools.

[![CI/CD](https://github.com/jjsizemore/spotify-time-machine/actions/workflows/ci.yml/badge.svg)](https://github.com/jjsizemore/spotify-time-machine/actions)
[![codecov](https://codecov.io/github/jjsizemore/spotify-time-machine/branch/main/graph/badge.svg)](https://codecov.io/github/jjsizemore/spotify-time-machine)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

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
- [Developer Tools](./docs/development/DEV_TOOLS.md) - Available tools and commands
- [Tool Installation](./docs/development/TOOL_INSTALLATION.md) - Setup guide

**For Developers:**

- [LLM Context](./docs/reference/LLM_CONTEXT.md) - Comprehensive project context
- [TODO Roadmap](./docs/reference/TODO.md) - Feature implementation checklist
- [Quick Reference](./docs/reference/QUICK_REFERENCE.md) - Common commands and workflows

**For DevOps:**

- [CI/CD Optimization](./docs/how-to/CI_CD_OPTIMIZATION.md) - Pipeline optimization guide
- [CI/CD Quick Reference](./docs/reference/CI_CD_QUICK_REFERENCE.md) - CI/CD commands

## 🔧 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19.1.0
- **Language:** TypeScript 5.8.3
- **Styling:** Tailwind CSS 4.1.10
- **Authentication:** NextAuth.js 4.24.11
- **State Management:** @tanstack/react-query 5.80.7
- **Analytics:** Google Analytics 4, Vercel Analytics, PostHog, Sentry
- **Testing:** Vitest with Playwright
- **Code Quality:** Biome, Oxlint, Prettier

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

# Code Quality
pnpm lint             # Run linter (Oxlint)
pnpm fmt              # Format code (Prettier)
pnpm fmt:check        # Check formatting
pnpm type-check       # TypeScript type checking
pnpm check            # Run lint + type-check
pnpm check:all        # Run lint + format + type-check

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
pnpm analyze          # Analyze bundle size
```

See [Dev Tools Guide](./docs/development/DEV_TOOLS.md) for complete command reference.

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

1. Check the [TODO roadmap](./docs/reference/TODO.md) for current priorities
2. Review [Developer Tools](./docs/development/DEV_TOOLS.md) setup
3. Follow [code quality guidelines](./docs/reference/LLM_CONTEXT.md)
4. Run `pnpm check:all` before committing
5. Ensure all tests pass with `pnpm test`

## 📊 CI/CD

This project features an optimized CI/CD pipeline:

- ✅ **53% faster** CI runs (~7 minutes vs ~15 minutes)
- ✅ **85% cache hit rate** with automatic cleanup
- ✅ **Automated security scanning** (CodeQL, dependency review)
- ✅ **Sharded test execution** for parallel processing

See [CI/CD Optimization Guide](./docs/how-to/CI_CD_OPTIMIZATION.md) for details.

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

**💡 Have a suggestion?** [Start a discussion](https://github.com/jjsizemore/spotify-time-machine/discussions)
