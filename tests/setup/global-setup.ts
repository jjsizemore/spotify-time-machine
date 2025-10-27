/**
 * Global Setup for Vitest
 * Runs once before all tests start and can provide context to tests
 * Available since Vitest v2+, enhanced in v4
 *
 * IMPORTANT: This setup reads TEST mock values from .env.test
 * - .env.test is loaded by dotenvx via explicit `-f .env.test` flag in package.json
 * - Test values are MOCKS only - never production credentials
 * - Fallback hardcoded values ensure tests can run without .env.test
 *
 * Environment Loading Flow:
 * 1. package.json: `dotenvx run -f .env.test -- vitest`
 * 2. dotenvx loads ONLY .env.test into process.env (production .env is ignored)
 * 3. global-setup.ts reads TEST_* variables from process.env
 * 4. Values are injected into test context via project.provide()
 *
 * This ensures:
 * - Reproducible test behavior across environments
 * - No accidental use of production credentials in tests
 * - Tests can run without requiring actual API credentials
 */

import type { TestProject } from 'vitest/node';
import { getTestConfig } from './test-config'; // Declare the provided context types
declare module 'vitest' {
  export interface ProvidedContext {
    testStartTime: number;
    baseUrl: string;
    spotifyClientId: string;
  }
}

export default function globalSetup(project: TestProject) {
  // Read test mock values from .env.test (loaded by dotenvx with `-f .env.test`)
  // Uses centralized test-config.ts for DRY principle and consistency
  const testConfig = getTestConfig();

  project.provide('testStartTime', Date.now());
  project.provide('baseUrl', testConfig.baseUrl);
  project.provide('spotifyClientId', testConfig.spotifyClientId);

  // Set up mock server or other global resources
  console.log('🧪 Setting up global test environment...');

  // Handle test reruns (v3+ feature)
  project.onTestsRerun(async () => {
    console.log('🔄 Tests are rerunning, refreshing global setup...');
    // Restart any services or clear caches here
  });

  // Return cleanup function (runs after all tests complete)
  return async () => {
    console.log('🧹 Cleaning up global test environment...');
    // Clean up global resources, close connections, etc.
  };
}
