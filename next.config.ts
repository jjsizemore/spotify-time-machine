import { withSentryConfig } from '@sentry/nextjs';
import withFlowbiteReact from 'flowbite-react/plugin/nextjs';
import type { NextConfig } from 'next';

// Note: next.config.ts runs at build time and has limited access to runtime environment variables.
// We use process.env directly for build-time config and only validated env for runtime values.
const NODE_ENV = process.env.NODE_ENV || 'development';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  reactStrictMode: true,
  output: 'standalone',

  // Next.js 16 Performance Features
  reactCompiler: true, // Enable React Compiler for automatic memoization
  cacheComponents: true, // Enable component caching (replaces experimental.ppr and experimental.dynamicIO)

  // Better server component optimization - moved out of experimental in Next.js 16
  serverExternalPackages: ['sharp'],

  // Performance and SEO Optimizations for Next.js v16
  experimental: {
    // Enable Turbopack filesystem caching for faster dev builds across restarts
    turbopackFileSystemCacheForDev: true,

    optimizePackageImports: [
      '@tanstack/react-query',
      'date-fns',
      'react-icons',
      'flowbite-react',
      '@sentry/nextjs',
    ],
    // Enhanced CSS optimization
    optimizeCss: true,
  },

  // Enhanced Image Optimization for 2025
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co',
        port: '',
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        port: '',
        pathname: '/image/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enhanced Compiler Optimizations for v16
  compiler: {
    removeConsole: NODE_ENV === 'production',
    // Remove React dev tools in production
    reactRemoveProperties: NODE_ENV === 'production',
    // Enable SWC minification
    styledComponents: true,
  },

  // Enhanced bundling and optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Add bundle analyzer in production
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }

    return config;
  },

  // Enhanced runtime configuration
  env: {
    NEXT_RUNTIME_ENV: NODE_ENV,
    BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  },

  // PWA and Caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security Headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Domain Migration Header
          {
            key: 'X-Domain-Migration',
            value: 'tm.jermainesizemore.com',
          },
          // Performance Headers
          {
            key: 'X-Clacks-Overhead',
            value: 'GNU Terry Pratchett',
          },
          // Content Security Policy - Only apply in production
          ...(NODE_ENV === 'production'
            ? [
                {
                  key: 'Content-Security-Policy',
                  value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' 
                https://app.posthog.com 
                https://*.i.posthog.com 
                https://www.googletagmanager.com 
                https://va.vercel-scripts.com 
                https://*.vercel-scripts.com;
              connect-src 'self' 
                https://app.posthog.com 
                https://*.i.posthog.com 
                https://www.google-analytics.com 
                https://analytics.google.com 
                https://vitals.vercel-analytics.com 
                https://*.vercel-analytics.com;
              img-src 'self' data: blob: https: http:;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' 
                https://fonts.gstatic.com 
                https://r2cdn.perplexity.ai;
              worker-src 'self' blob:;
            `
                    .replaceAll(/\s+/g, ' ')
                    .trim(),
                },
              ]
            : []),
        ],
      },
      {
        source: '/favicon.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/previews/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*).webmanifest',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000',
          },
        ],
      },
    ];
  },

  // Advanced redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/app',
        destination: '/dashboard',
        permanent: true,
      },
      // Legacy manifest.json redirect for backwards compatibility
      {
        source: '/manifest.json',
        destination: '/manifest.webmanifest',
        permanent: true,
      },
    ];
  },

  // Disable powered by header
  poweredByHeader: false,

  // Compression
  compress: true,

  // Generate ETags for better caching
  generateEtags: true,

  // Trailing slash redirect
  trailingSlash: false,

  // Skip proxy URL normalization for specific paths
  skipProxyUrlNormalize: false,
};

// Wrap with Sentry for error tracking - only if credentials are available
const shouldEnableSentry = !!(
  process.env.SENTRY_ORG &&
  process.env.SENTRY_PROJECT &&
  process.env.SENTRY_AUTH_TOKEN
);

const configWithFlowbite = withFlowbiteReact(nextConfig);

export default shouldEnableSentry
  ? withSentryConfig(configWithFlowbite, {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Automatically annotate React components to show their full name in breadcrumbs and session replays
      reactComponentAnnotation: {
        enabled: true,
      },

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      tunnelRoute: '/monitoring',

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,

      // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
      // See the following for more information:
      // https://docs.sentry.io/product/crons/
      // https://vercel.com/docs/cron-jobs
      automaticVercelMonitors: true,
    })
  : configWithFlowbite;
