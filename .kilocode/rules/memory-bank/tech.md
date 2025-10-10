# Tech

## Core Technologies and Frameworks

- **Next.js 15**: React framework for production with App Router, server components, and API routes
- **React 19**: Latest React version with concurrent features and improved performance
- **TypeScript**: Static type checking throughout the application
- **NextAuth.js 4.24.11**: Authentication library for Spotify OAuth integration
- **TanStack Query 5.90.2**: Advanced data fetching and caching library
- **Tailwind CSS 4.1.14**: Utility-first styling with custom Spotify-themed design system
- **Flowbite React 0.12.9**: UI component library built on Tailwind CSS

## Development Environment Setup

- **Node.js 16.8.0+**: JavaScript runtime environment
- **pnpm**: Fast, disk-efficient package manager
- **Biome 1.9.4**: Modern linter and formatter replacing ESLint and Prettier
- **Turbo**: High-performance build system for monorepos
- **Sharp**: High-performance image processing library for Next.js

## Technical Constraints and Requirements

- **Spotify Premium Account**: Required for full API access and playlist creation
- **Spotify Developer Application**: Client ID and secret for OAuth authentication
- **HTTPS**: Required for Spotify OAuth and PWA features
- **Modern Browser Support**: ES2020+ features and CSS Grid/Flexbox
- **Mobile-First Design**: Responsive design optimized for mobile devices

## Key Dependencies and Their Purposes

- **@next/third-parties**: Third-party integrations for analytics and performance monitoring
- **@vercel/analytics**: Web analytics and performance tracking
- **date-fns**: Modern JavaScript date utility library
- **fflate**: Fast zlib compression for data processing
- **react-icons**: Popular icon library for UI components
- **web-vitals**: Core Web Vitals measurement library
- **zod**: TypeScript-first schema validation library

## Tool Usage Patterns and Development Workflow

- **Linting and Formatting**: Biome for consistent code style and error detection
- **Type Checking**: TypeScript compiler for static analysis
- **Security Scanning**: Automated vulnerability detection with TruffleHog and Snyk
- **Commit Management**: Conventional commits with Husky pre-commit hooks
- **Build Optimization**: Turbo for efficient builds and caching
- **Development Debugging**: Enhanced console logging and real-time monitoring tools
