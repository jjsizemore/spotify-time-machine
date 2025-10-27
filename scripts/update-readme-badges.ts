#!/usr/bin/env node
/**
 * Update README badge versions from package.json
 * This script reads package.json and updates the technology badges in README.md
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get project root
const projectRoot = join(__dirname, '..');
const packageJsonPath = join(projectRoot, 'package.json');
const readmePath = join(projectRoot, 'README.md');

interface PackageJson {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  packageManager?: string;
  engines?: { node?: string };
}

function cleanVersion(version: string): string {
  // Remove ^ and ~ prefixes, get major.minor version
  const cleaned = version.replace(/^[\^~]/, '');
  const parts = cleaned.split('.');
  return `${parts[0]}.${parts[1]}`;
}

function getPackageVersion(pkg: PackageJson, packageName: string): string {
  const version = pkg.dependencies[packageName] || pkg.devDependencies[packageName];
  if (!version) {
    throw new Error(`Package ${packageName} not found in dependencies`);
  }
  return cleanVersion(version);
}

function getPnpmVersionFromPackageManager(pkg: PackageJson): string | null {
  if (!pkg.packageManager) return null;
  const match = pkg.packageManager.match(/^pnpm@(\d+)\.(\d+)\./);
  if (match) {
    const major = match[1];
    const minor = match[2];
    return `${major}.${minor}`;
  }
  return null;
}

function readOptionalFile(path: string): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

function getNodeVersion(pkg: PackageJson): string {
  if (pkg.engines?.node) {
    const m = pkg.engines.node.match(/(\d+)(?:\.(\d+))?/);
    if (m) {
      const major = m[1];
      const minor = m[2] ?? 'x';
      return `${major}.${minor}`;
    }
  }
  const nvmrc = readOptionalFile(join(projectRoot, '.nvmrc'));
  if (nvmrc) {
    const ver = nvmrc.trim().replace(/^v/, '');
    const parts = ver.split('.');
    if (parts.length >= 2) return `${parts[0]}.${parts[1]}`;
    if (parts.length === 1) return `${parts[0]}.x`;
  }
  const mise = readOptionalFile(join(projectRoot, 'mise.toml'));
  if (mise) {
    const objMatch = mise.match(/node\s*=\s*\{[^}]*version\s*=\s*"([^"]+)"/);
    const strMatch = mise.match(/node\s*=\s*"([^"]+)"/);
    const val = (objMatch?.[1] || strMatch?.[1] || '').trim();
    if (val) {
      if (val.toLowerCase() === 'latest') return 'latest';
      const parts = val.replace(/^v/, '').split('.');
      if (parts.length >= 2) return `${parts[0]}.${parts[1]}`;
      if (parts.length === 1) return `${parts[0]}.x`;
    }
  }
  return 'latest';
}

function main() {
   
  console.log('📦 Reading package.json...');
  const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

   
  console.log('📖 Reading README.md...');
  let readmeContent = readFileSync(readmePath, 'utf8');

  // Extract versions
  const versions = {
    nextjs: getPackageVersion(packageJson, 'next'),
    react: getPackageVersion(packageJson, 'react'),
    typescript: getPackageVersion(packageJson, 'typescript'),
    tailwind: getPackageVersion(packageJson, 'tailwindcss'),
    pnpm: getPnpmVersionFromPackageManager(packageJson) ?? 'latest',
    node: getNodeVersion(packageJson),
  };

   
  console.log('🔍 Found versions:', versions);

  // Update badge patterns
  const badgeUpdates = [
    {
      name: 'Next.js',
      pattern: /\[!\[Next\.js\]\(https:\/\/img\.shields\.io\/badge\/Next\.js-[\d.]+/,
      replacement: `[![Next.js](https://img.shields.io/badge/Next.js-${versions.nextjs}`,
    },
    {
      name: 'React',
      pattern: /\[!\[React\]\(https:\/\/img\.shields\.io\/badge\/React-[\d.]+/,
      replacement: `[![React](https://img.shields.io/badge/React-${versions.react}`,
    },
    {
      name: 'TypeScript',
      pattern: /\[!\[TypeScript\]\(https:\/\/img\.shields\.io\/badge\/TypeScript-[\d.]+/,
      replacement: `[![TypeScript](https://img.shields.io/badge/TypeScript-${versions.typescript}`,
    },
    {
      name: 'Tailwind CSS',
      pattern: /\[!\[Tailwind CSS\]\(https:\/\/img\.shields\.io\/badge\/Tailwind-[\d.]+/,
      replacement: `[![Tailwind CSS](https://img.shields.io/badge/Tailwind-${versions.tailwind}`,
    },
    {
      name: 'pnpm',
      pattern: /\[!\[pnpm\]\(https:\/\/img\.shields\.io\/badge\/pnpm-[\w.]+/,
      replacement: `[![pnpm](https://img.shields.io/badge/pnpm-${versions.pnpm}`,
    },
    {
      name: 'Node.js',
      pattern: /\[!\[Node\.js\]\(https:\/\/img\.shields\.io\/badge\/Node\.js-[\w.]+/,
      replacement: `[![Node.js](https://img.shields.io/badge/Node.js-${versions.node}`,
    },
  ];

  // Apply updates
  let updatedCount = 0;
  for (const update of badgeUpdates) {
    if (update.pattern.test(readmeContent)) {
      readmeContent = readmeContent.replace(update.pattern, update.replacement);
       
      console.log(`✅ Updated ${update.name} badge`);
      updatedCount++;
    } else {
       
      console.log(`⚠️  Could not find ${update.name} badge pattern`);
    }
  }

  // Write back to README
  if (updatedCount > 0) {
    writeFileSync(readmePath, readmeContent, 'utf8');
     
    console.log(`\n✨ Successfully updated ${updatedCount} badge(s) in README.md`);
  } else {
     
    console.log('\n⚠️  No badges were updated');
  }

  // Also update the Core Technologies section
  const techSectionPattern = /### Core Technologies\n\n([\s\S]*?)(?=\n## |\n### |$)/;
  if (techSectionPattern.test(readmeContent)) {
    readmeContent = readmeContent.replace(
      /- \*\*Next\.js [\d.]+\*\*/,
      `- **Next.js ${versions.nextjs}**`
    );
    readmeContent = readmeContent.replace(
      /- \*\*React [\d.]+\*\*/,
      `- **React ${versions.react}**`
    );
    readmeContent = readmeContent.replace(
      /- \*\*TypeScript [\d.]+\*\*/,
      `- **TypeScript ${versions.typescript}**`
    );
    readmeContent = readmeContent.replace(
      /- \*\*Tailwind CSS [\d.]+\*\*/,
      `- **Tailwind CSS ${versions.tailwind}**`
    );
    writeFileSync(readmePath, readmeContent, 'utf8');
     
    console.log('✅ Updated Core Technologies section');
  }
}

try {
  main();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
