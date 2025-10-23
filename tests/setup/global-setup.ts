/**
 * Global Setup for Vitest
 * Runs once before all tests start and can provide context to tests
 * Available since Vitest v2+, enhanced in v4
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
  // Provide global values that can be injected in tests
  project.provide('testStartTime', Date.now());
  project.provide('baseUrl', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
  project.provide('spotifyClientId', process.env.SPOTIFY_CLIENT_ID || 'test-client-id');

  // Set up mock server or other global resources
  console.log('🧪 Setting up global test environment...');

  // Initialize MSW or other mocking libraries here if needed

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
