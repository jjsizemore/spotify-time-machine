#!/usr/bin/env node

/**
 * Generate build version for cache invalidation
 *
 * This script generates a unique version identifier for each build
 * and stores it as an environment variable for use in the application
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function generateBuildVersion() {
  // Use current timestamp as the build version
  // On Vercel or in CI environments, you could also use:
  // - process.env.VERCEL_GIT_COMMIT_SHA (commit hash)
  // - process.env.DEPLOYMENT_ID (Vercel deployment ID)
  // - Date.now().toString() (milliseconds since epoch)

  const buildVersion =
    process.env.VERCEL_GIT_COMMIT_SHA || process.env.BUILD_ID || Date.now().toString();

  return buildVersion;
}

function writeBuildVersion(version) {
  // Write the version to a file that can be imported
  const versionContent = `// Auto-generated file - do not edit
// Generated at build time for cache invalidation

export const BUILD_VERSION = '${version}';
export const BUILD_TIMESTAMP = '${new Date().toISOString()}';
`;

  const versionFile = path.join(__dirname, '../.next/cache-version.js');
  const dir = path.dirname(versionFile);

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(versionFile, versionContent, 'utf8');
  console.warn(`✓ Build version generated: ${version}`);
  console.warn(`✓ Written to: ${versionFile}`);
}

const buildVersion = generateBuildVersion();
writeBuildVersion(buildVersion);

// Also set as environment variable for Next.js
process.env.BUILD_TIMESTAMP = buildVersion;
