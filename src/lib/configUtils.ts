/**
 * Configuration Validation Module
 *
 * This module provides environment configuration validation using a comprehensive
 * Zod schema that checks for all required environment variables.
 *
 * The validation includes:
 * - Spotify API credentials
 * - NextAuth configuration
 * - Analytics services (GA4, PostHog)
 * - Sentry error tracking (optional but recommended)
 * - Runtime environment specification
 *
 * @see src/lib/env.ts - Main environment schema definition
 * @see src/lib/envConfig.ts - Configuration getter functions
 */

import { getValidatedEnv } from './envConfig';

/**
 * Validates environment configuration on application startup
 *
 * This function is called during application initialization to ensure all required
 * environment variables are present and valid before the app starts processing requests.
 *
 * Error handling:
 * - If validation fails, a detailed error message is logged
 * - The process exits with code 1 to indicate configuration failure
 * - This prevents the app from running with missing critical configuration
 *
 * @throws {Error} If environment validation fails
 *
 * @example
 * ```ts
 * // Called automatically in src/lib/init.ts
 * validateConfig();
 * ```
 */
export const validateConfig = (): void => {
  try {
    const env = getValidatedEnv();
    console.log(`✓ Environment configuration validated for ${env.NODE_ENV} environment`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('✗ Environment configuration validation failed:');
    console.error(errorMessage);
    process.exit(1);
  }
};

export default validateConfig;
