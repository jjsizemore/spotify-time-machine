/**
 * Environment Variable Validation Schema
 *
 * This module defines a Zod schema for validating all required environment variables.
 * It ensures that the application has all necessary configuration at startup.
 *
 * Note: Zod v4 deprecation warnings about .url() are internal to the library and
 * do not affect functionality. These are expected and can be safely ignored.
 *
 * @see https://zod.dev - TypeScript-first schema validation library
 */

import { z } from 'zod';

/**
 * Environment variable schema definition
 *
 * Required variables:
 * - Spotify API: CLIENT_ID, CLIENT_SECRET
 * - NextAuth: SECRET, URL
 * - Analytics: GA_ID, POSTHOG_KEY, POSTHOG_HOST
 * - Sentry: DSN, AUTH_TOKEN, ORG, PROJECT
 */
const envSchema = z.object({
  // ============================================================================
  // SPOTIFY API CONFIGURATION
  // ============================================================================
  SPOTIFY_CLIENT_ID: z
    .string()
    .min(1, 'Spotify Client ID is required')
    .describe('Spotify API application ID'),
  SPOTIFY_CLIENT_SECRET: z
    .string()
    .min(1, 'Spotify Client Secret is required')
    .describe('Spotify API application secret'),

  // ============================================================================
  // NEXTAUTH CONFIGURATION
  // ============================================================================
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NextAuth Secret must be at least 32 characters')
    .describe('Secret key for NextAuth session encryption'),
  NEXTAUTH_URL: z.url().describe('Base URL for NextAuth callbacks'),

  // ============================================================================
  // ANALYTICS CONFIGURATION - GOOGLE ANALYTICS 4
  // ============================================================================
  NEXT_PUBLIC_GA_ID: z
    .string()
    .regex(/^(G-[A-Z0-9]+|G-DISABLED)$/, 'GA ID must be in format G-XXXXXXXXXX or G-DISABLED')
    .describe('Google Analytics 4 Measurement ID'),

  // ============================================================================
  // ANALYTICS CONFIGURATION - POSTHOG
  // ============================================================================
  NEXT_PUBLIC_POSTHOG_KEY: z
    .string()
    .min(1, 'PostHog Key is required')
    .describe('PostHog public API key for session recording and analytics'),
  NEXT_PUBLIC_POSTHOG_HOST: z
    .string()
    .url()
    .default('https://app.posthog.com')
    .describe('PostHog instance URL'),

  // ============================================================================
  // SENTRY ERROR TRACKING CONFIGURATION
  // ============================================================================
  NEXT_PUBLIC_SENTRY_DSN: z
    .url()
    .optional()
    .nullable()
    .describe('Sentry public DSN for error tracking (optional)'),
  SENTRY_AUTH_TOKEN: z
    .string()
    .min(1, 'Sentry Auth Token is required if using Sentry')
    .optional()
    .nullable()
    .describe('Sentry authentication token for CLI operations'),
  SENTRY_ORG: z
    .string()
    .min(1, 'Sentry Organization slug is required if using Sentry')
    .optional()
    .nullable()
    .describe('Sentry organization slug'),
  SENTRY_PROJECT: z
    .string()
    .min(1, 'Sentry Project slug is required if using Sentry')
    .optional()
    .nullable()
    .describe('Sentry project slug'),

  // ============================================================================
  // RUNTIME ENVIRONMENT
  // ============================================================================
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development')
    .describe('Node.js runtime environment'),

  // ============================================================================
  // NEXT.JS PUBLIC BASE URL (Optional)
  // ============================================================================
  NEXT_PUBLIC_BASE_URL: z
    .url()
    .optional()
    .nullable()
    .describe('Public base URL for the application'),

  // ============================================================================
  // DEBUGGING & DEVELOPMENT FLAGS (Optional)
  // ============================================================================
  NEXT_PUBLIC_DEBUG: z
    .string()
    .optional()
    .default('false')
    .describe('Enable debug logging in production (default: false)'),
  FORCE_ANALYTICS: z
    .string()
    .optional()
    .describe('Force analytics initialization in development for testing'),
});

/**
 * Inferred type from the environment schema
 * Use this type for type-safe environment variable access throughout the application
 */
export type Environment = z.infer<typeof envSchema>;

/**
 * Validates environment variables against the schema
 *
 * @param env - Object containing environment variables to validate
 * @returns Validated environment variables
 * @throws {z.ZodError} If validation fails
 *
 * @example
 * ```ts
 * const env = validateEnv(process.env);
 * console.log(env.SPOTIFY_CLIENT_ID); // Type-safe access
 * ```
 */
export function validateEnv(env: Record<string, unknown>): Environment {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    const fieldErrors = result.error.issues
      .filter((issue) => issue.path.length > 0)
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n  - ');

    const errorMessage = fieldErrors
      ? `Environment validation failed:\n  - ${fieldErrors}`
      : `Environment validation failed with unknown errors`;

    throw new Error(errorMessage);
  }

  return result.data;
}

export default envSchema;
