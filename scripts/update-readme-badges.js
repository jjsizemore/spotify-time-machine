#!/usr/bin/env node

/**
 * Update README badges with current package versions
 * This script reads package.json and updates badge URLs in README.md
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Generate shields.io badge markdown for a package
 */
function generateBadge(packageName, label) {
  // Encode package name for URL (handle scoped packages like @tanstack/react-query)
  const encodedName = encodeURIComponent(packageName);
  const badgeLabel = label || packageName.replace('@', '').replace('/', '-');

  return `![${badgeLabel}](https://img.shields.io/npm/v/${encodedName}?label=${encodeURIComponent(badgeLabel)}&logo=npm)`;
}

/**
 * Main function to update README badges
 */
async function updateReadmeBadges() {
  try {
    // Read package.json
    const packageJsonPath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

    // Read README.md
    const readmePath = join(rootDir, 'README.md');
    let readmeContent = await readFile(readmePath, 'utf-8');

    // Define key packages to track with badges
    const keyPackages = [
      { name: '@tanstack/react-query', label: 'React Query' },
      { name: 'zod', label: 'Zod' },
      { name: 'next', label: 'Next.js' },
      { name: 'react', label: 'React' },
    ];

    // Generate badge section
    const badges = keyPackages
      .filter((pkg) => packageJson.dependencies[pkg.name] || packageJson.devDependencies[pkg.name])
      .map((pkg) => generateBadge(pkg.name, pkg.label))
      .join('\n');

    // Find and replace the "Modern Code Quality Pipeline" and "Updated Package Ecosystem" sections
    // Remove hardcoded version mentions

    // Pattern 1: Replace "Modern Code Quality Pipeline" bullet points
    const codeQualityPattern = /- \*\*Modern Code Quality Pipeline:\*\*\n( {2}- .*\n)*/;
    const codeQualityReplacement = `- **Modern Code Quality Pipeline:**
  - Modern linting and formatting with the latest tools
  - Optimized data fetching with React Query
  - Automated security scanning and vulnerability detection`;

    readmeContent = readmeContent.replace(codeQualityPattern, codeQualityReplacement);

    // Pattern 2: Replace "Updated Package Ecosystem" section
    const packageEcosystemPattern = /### Updated Package Ecosystem\n\n(- \*\*.*\n)*/;
    const packageEcosystemReplacement = `### Package Versions

${badges}

`;

    readmeContent = readmeContent.replace(packageEcosystemPattern, packageEcosystemReplacement);

    // Pattern 3: Replace "Enhanced Configuration" section to remove version numbers
    const enhancedConfigPattern =
      /### Enhanced Configuration\n\n- \*\*Modern Linting & Formatting\*\*: Biome \d+\.\d+\.\d+ \(replacing Prettier and ESLint\)/;
    const enhancedConfigReplacement = `### Enhanced Configuration\n\n- **Modern Linting & Formatting**: Biome (replacing Prettier and ESLint)`;

    readmeContent = readmeContent.replace(enhancedConfigPattern, enhancedConfigReplacement);

    // Write updated README
    await writeFile(readmePath, readmeContent, 'utf-8');

    console.log('✅ README.md badges updated successfully!');
    console.log('📦 Updated badges for:', keyPackages.map((p) => p.label).join(', '));
  } catch (error) {
    console.error('❌ Error updating README badges:', error);
    process.exit(1);
  }
}

// Run the script with top-level await
await updateReadmeBadges();
