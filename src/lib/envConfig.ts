/**
 * Environment Configuration Module
 *
 * This module provides validated environment variables using Next.js's built-in
 * environment variable support. Next.js automatically loads .env files.
 *
 * The module follows modern best practices:
 * - Validated on module initialization
 * - Type-safe environment variable access
 * - Clear error messages for misconfiguration
 * - Works in both client and server environments
 *
 * @see https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
 * @see https://zod.dev - TypeScript-first schema validation
 */

import type { Environment } from './env';
import { validateEnv } from './env';

/**
 * Validated environment variables
 * Initialized immediately on module load using Next.js process.env
 */
const env: Environment = (() => {
  try {
    // Next.js automatically loads .env files into process.env
    return validateEnv(process.env);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown environment validation error';
    throw new Error(`Failed to load environment configuration:\n${errorMessage}`, {
      cause: error,
    });
  }
})();

export { env };

/**
 * @deprecated Use `env` object directly instead: `import { env } from '@/lib/envConfig'`
 * @returns Validated environment variables object
 */
export function getValidatedEnv(): Environment {
  return env;
}

export default env;
