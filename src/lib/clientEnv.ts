/**
 * Client-Safe Environment Variable Access
 *
 * This module provides safe access to environment variables in client-side code.
 * It only uses process.env (replaced at build time) and does NOT import dotenvx.
 *
 * IMPORTANT: Only use this in files that may be imported by client components.
 * For server-side only code, use envConfig.ts instead.
 */

/**
 * Gets a client-safe environment variable
 * Only works with variables available at build time via process.env
 */
export function getClientEnv(key: string): string | undefined {
  return process.env[key];
}

/**
 * Gets environment variable with fallback value (client-safe)
 */
export function getClientEnvOrDefault<T extends string | boolean | number>(
  key: string,
  fallback: T
): string | T {
  const value = process.env[key];
  return value ?? fallback;
}

/**
 * Common public environment variables (available client-side)
 */
export const PUBLIC_ENV = {
  BASE_URL: getClientEnvOrDefault('NEXT_PUBLIC_BASE_URL', 'https://tm.jermainesizemore.com'),
  GA_ID: getClientEnv('NEXT_PUBLIC_GA_ID'),
  POSTHOG_KEY: getClientEnv('NEXT_PUBLIC_POSTHOG_KEY'),
  POSTHOG_HOST: getClientEnvOrDefault('NEXT_PUBLIC_POSTHOG_HOST', 'https://app.posthog.com'),
  SENTRY_DSN: getClientEnv('NEXT_PUBLIC_SENTRY_DSN'),
  NODE_ENV: getClientEnvOrDefault('NODE_ENV', 'development'),
} as const;
