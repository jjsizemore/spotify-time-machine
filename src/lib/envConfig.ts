/**
 * Environment Configuration Module
 *
 * This module provides a singleton instance of validated environment variables
 * using dotenvx to load and validate configuration at runtime.
 *
 * The module follows modern best practices:
 * - Lazy initialization on first access
 * - Type-safe environment variable access
 * - Clear error messages for misconfiguration
 * - Support for encrypted environment variables via dotenvx
 *
 * @see https://dotenvx.com - Secure, multi-environment .env solution
 * @see https://zod.dev - TypeScript-first schema validation
 */

import { get } from '@dotenvx/dotenvx';
import type { Environment } from './env';
import { validateEnv } from './env';

/**
 * Singleton instance of validated environment variables
 * Initialized on first access to ensure config is loaded before validation
 */
let cachedEnv: Environment | undefined;

/**
 * Flag to prevent multiple initialization attempts
 */
let initializationAttempted = false;

/**
 * Gets a decrypted environment variable value using dotenvx
 *
 * This function retrieves environment variables with automatic decryption support
 * for variables marked as encrypted in the .env file. It combines dotenvx's
 * secure variable access with the environment schema validation.
 *
 * @param key - The environment variable key to retrieve
 * @returns The decrypted environment variable value
 * @throws Error if the variable is not found
 *
 * @example
 * ```ts
 * const spotifyId = getEnvVar('SPOTIFY_CLIENT_ID');
 * ```
 *
 * @see https://dotenvx.com/docs#get
 */
export function getEnvVar(key: string): string | undefined {
  const value = get(key);
  return value || undefined;
}

/**
 * Gets all environment variables as a record object
 *
 * This retrieves both system environment variables and those loaded from .env files,
 * with automatic decryption support for encrypted values.
 *
 * @returns Object containing all environment variables
 *
 * @example
 * ```ts
 * const allEnv = getAllEnvVars();
 * ```
 */
export function getAllEnvVars(): Record<string, string | undefined> {
  // Combine process.env with dynamically loaded variables from dotenvx
  return {
    ...process.env,
    // Ensure we capture any dotenvx-decrypted values
    SPOTIFY_CLIENT_ID: getEnvVar('SPOTIFY_CLIENT_ID'),
    SPOTIFY_CLIENT_SECRET: getEnvVar('SPOTIFY_CLIENT_SECRET'),
    NEXTAUTH_SECRET: getEnvVar('NEXTAUTH_SECRET'),
    NEXTAUTH_URL: getEnvVar('NEXTAUTH_URL'),
    NEXT_PUBLIC_GA_ID: getEnvVar('NEXT_PUBLIC_GA_ID'),
    NEXT_PUBLIC_POSTHOG_KEY: getEnvVar('NEXT_PUBLIC_POSTHOG_KEY'),
    NEXT_PUBLIC_POSTHOG_HOST: getEnvVar('NEXT_PUBLIC_POSTHOG_HOST'),
    NEXT_PUBLIC_SENTRY_DSN: getEnvVar('NEXT_PUBLIC_SENTRY_DSN'),
    SENTRY_AUTH_TOKEN: getEnvVar('SENTRY_AUTH_TOKEN'),
    SENTRY_ORG: getEnvVar('SENTRY_ORG'),
    SENTRY_PROJECT: getEnvVar('SENTRY_PROJECT'),
    NEXT_PUBLIC_BASE_URL: getEnvVar('NEXT_PUBLIC_BASE_URL'),
    NODE_ENV: getEnvVar('NODE_ENV'),
  };
}

/**
 * Initializes and returns validated environment variables
 *
 * This function performs lazy initialization of the environment configuration,
 * loading and validating all required environment variables on first call.
 * Subsequent calls return the cached configuration.
 *
 * Error handling:
 * - If validation fails, a detailed error message is thrown with all validation issues
 * - The error is only thrown once; subsequent calls will throw the same error
 *
 * @returns Validated environment variables object
 * @throws Error with detailed validation information if environment is invalid
 *
 * @example
 * ```ts
 * try {
 *   const env = getValidatedEnv();
 *   console.log(env.SPOTIFY_CLIENT_ID);
 * } catch (error) {
 *   console.error('Failed to load environment:', error.message);
 *   process.exit(1);
 * }
 * ```
 */
export function getValidatedEnv(): Environment {
  // Return cached environment if already initialized
  if (cachedEnv !== undefined) {
    return cachedEnv;
  }

  // Prevent multiple initialization attempts
  if (initializationAttempted) {
    throw new Error(
      'Environment validation failed on previous initialization attempt. Check your .env file configuration.'
    );
  }

  initializationAttempted = true;

  try {
    const envVars = getAllEnvVars();
    cachedEnv = validateEnv(envVars);
    return cachedEnv;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown environment validation error';
    throw new Error(`Failed to load environment configuration:\n${errorMessage}`, {
      cause: error,
    });
  }
}

/**
 * Type-safe environment variable getter with fallback
 *
 * This function provides a safe way to access environment variables with a fallback value.
 * It's useful for optional configuration that should use a default if not provided.
 *
 * @template T - The type of the fallback value
 * @param key - The environment variable key
 * @param fallback - The fallback value if the variable is not set
 * @returns The environment variable value or the fallback value
 *
 * @example
 * ```ts
 * const host = getEnvOrDefault('NEXT_PUBLIC_POSTHOG_HOST', 'https://app.posthog.com');
 * ```
 */
export function getEnvOrDefault<T extends string | boolean | number>(
  key: string,
  fallback: T
): string | T {
  const value = getEnvVar(key);
  return value ?? fallback;
}

/**
 * Validates that a required environment variable is set
 *
 * Throws a clear error message if a required variable is missing.
 * Useful for initialization checks or feature flags.
 *
 * @param key - The environment variable key to check
 * @param feature - Optional description of the feature requiring this variable
 * @throws Error if the variable is not set
 *
 * @example
 * ```ts
 * requireEnvVar('SPOTIFY_CLIENT_ID', 'Spotify integration');
 * ```
 */
export function requireEnvVar(key: string, feature?: string): string {
  const value = getEnvVar(key);

  if (!value) {
    const context = feature ? ` for ${feature}` : '';
    throw new Error(`Required environment variable '${key}' is not set${context}`);
  }

  return value;
}

export default getValidatedEnv;
