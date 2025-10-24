/**
 * Global Setup for Vitest
 * Runs once before all tests start and can provide context to tests
 * Available since Vitest v2+, enhanced in v4
 *
 * IMPORTANT: This setup provides TEST mock values, NOT production values from .env
 * Tests must be isolated from actual environment configuration to ensure:
 * - Reproducible test behavior across environments
 * - No accidental use of production credentials in tests
 * - Tests can run without requiring actual credentials
 */

import type { TestProject } from 'vitest/node';

// Declare the provided context types
declare module 'vitest' {
  export interface ProvidedContext {
    testStartTime: number;
    baseUrl: string;
    spotifyClientId: string;
  }
}

export default function globalSetup(project: TestProject) {
  // Provide test mock values (NOT from production .env)
  // Use explicit test values to maintain test isolation
  // NEVER use getEnvOrDefault() here - that reads from actual .env file!

  const testBaseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const testSpotifyClientId = process.env.TEST_SPOTIFY_CLIENT_ID || 'test-spotify-client-id';

  project.provide('testStartTime', Date.now());
  project.provide('baseUrl', testBaseUrl);
  project.provide('spotifyClientId', testSpotifyClientId);

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
