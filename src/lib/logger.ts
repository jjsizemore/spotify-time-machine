/**
 * Logger Entry Point
 * This module provides a unified logging interface that works on both client and server
 * On the server (API routes), Winston logger can be imported directly from logger.server
 * Everywhere else (client, middleware), use this simplified logger
 */

// Helper to log errors to Sentry
const logErrorToSentry = (error: Error, context?: Record<string, any>) => {
  try {
    // Dynamic import for Sentry to avoid bundling issues
    if (typeof window !== 'undefined') {
      // Client side
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error, {
          contexts: { logger: context },
        });
      }).catch(() => {
        // Sentry not available
      });
    } else {
      // Server side
      const Sentry = require('@sentry/nextjs');
      Sentry.captureException(error, {
        contexts: { logger: context },
      });
    }
  } catch {
    // Sentry not available
  }
};

// Unified console-based logger with structured formatting
// Works on client, server, and Edge Runtime
export const log = {
  error: (message: string, error?: any, context?: Record<string, any>) => {
    console.error(`❌ ${message}`, error, context);
    if (error instanceof Error) {
      logErrorToSentry(error, { message, ...context });
    }
  },
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(`⚠️ ${message}`, context);
  },
  info: (message: string, context?: Record<string, any>) => {
    console.log(`ℹ️ ${message}`, context);
  },
  http: (message: string, context?: Record<string, any>) => {
    console.log(`🌐 ${message}`, context);
  },
  debug: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`🐛 ${message}`, context);
    }
  },
  auth: (message: string, context?: Record<string, any>) => {
    console.log(`🔐 ${message}`, context);
  },
  api: (message: string, context?: Record<string, any>) => {
    console.log(`🌐 ${message}`, context);
  },
  spotify: (message: string, context?: Record<string, any>) => {
    console.log(`🎵 ${message}`, context);
  },
  performance: (message: string, context?: Record<string, any>) => {
    console.log(`⚡ ${message}`, context);
  },
  security: (message: string, context?: Record<string, any>) => {
    console.warn(`🔒 ${message}`, context);
  },
};

export default log;
