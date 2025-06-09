#!/usr/bin/env node

/**
 * Update image references to use optimized WebP versions
 *
 * This script updates all references to the original PNG images
 * to use the optimized WebP versions created by optimize-images.ts
 */

import fs from 'fs';
import path from 'path';

// Mapping of original images to optimized versions
const IMAGE_MAPPINGS = {
	// Preview images
	'/previews/dashboard-preview.png':
		'/images/optimized/previews/dashboard-preview.webp',
	'/previews/history-preview.png':
		'/images/optimized/previews/history-preview.webp',
	'/previews/playlist-generator-preview.png':
		'/images/optimized/previews/playlist-generator-preview.webp',
	// App icon
	'/spotify-icon.png': '/images/optimized/root/spotify-icon.webp',
} as const;

// Files to update
const FILES_TO_UPDATE = [
	'src/lib/seo.ts',
	'src/app/page.tsx',
	'src/components/Navigation.tsx',
	'src/app/thank-you/page.tsx',
	'src/app/*/metadata.ts',
	'src/app/*/layout.tsx',
] as const;

interface UpdateStats {
	filesProcessed: number;
	replacementsMade: number;
	errors: number;
}

/**
 * Find all files matching a pattern
 */
function findFiles(pattern: string): string[] {
	if (pattern.includes('*')) {
		// Handle glob patterns like 'src/app/*/metadata.ts'
		const parts = pattern.split('*');
		const baseDir = parts[0];
		const suffix = parts[1];

		try {
			const dirs = fs
				.readdirSync(baseDir, { withFileTypes: true })
				.filter((dirent) => dirent.isDirectory())
				.map((dirent) => dirent.name);

			return dirs
				.map((dir) => path.join(baseDir, dir, suffix.slice(1))) // Remove leading slash
				.filter((filePath) => fs.existsSync(filePath));
		} catch {
			return [];
		}
	}

	return fs.existsSync(pattern) ? [pattern] : [];
}

/**
 * Update image references in a file
 */
function updateFile(filePath: string): number {
	try {
		let content = fs.readFileSync(filePath, 'utf8');
		let replacements = 0;

		for (const [original, optimized] of Object.entries(IMAGE_MAPPINGS)) {
			const regex = new RegExp(
				original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
				'g'
			);
			const matches = content.match(regex);
			if (matches) {
				content = content.replace(regex, optimized);
				replacements += matches.length;
				console.log(
					`  ✅ ${filePath}: ${matches.length} replacement(s) for ${original}`
				);
			}
		}

		if (replacements > 0) {
			fs.writeFileSync(filePath, content, 'utf8');
		}

		return replacements;
	} catch (error) {
		console.error(
			`  ❌ Error updating ${filePath}:`,
			error instanceof Error ? error.message : 'Unknown error'
		);
		return 0;
	}
}

/**
 * Main function
 */
async function main(): Promise<void> {
	console.log(
		'🔄 Updating image references to use optimized WebP versions...\n'
	);

	const stats: UpdateStats = {
		filesProcessed: 0,
		replacementsMade: 0,
		errors: 0,
	};

	// Process each file pattern
	for (const pattern of FILES_TO_UPDATE) {
		const files = findFiles(pattern);

		for (const file of files) {
			console.log(`📝 Processing: ${file}`);
			const replacements = updateFile(file);

			stats.filesProcessed++;
			stats.replacementsMade += replacements;

			if (replacements === 0) {
				console.log(`  ⏭️  No changes needed`);
			}
		}
	}

	// Summary
	console.log('\n🎉 Image reference update complete!');
	console.log('═'.repeat(50));
	console.log(`📊 Files processed: ${stats.filesProcessed}`);
	console.log(`🔄 Total replacements: ${stats.replacementsMade}`);
	console.log(`❌ Errors: ${stats.errors}`);

	if (stats.replacementsMade > 0) {
		console.log('\n💡 Next steps:');
		console.log('  • Test your app to ensure images load correctly');
		console.log('  • Consider updating service worker cache (public/sw.js)');
		console.log('  • Update sitemap.ts manually if needed');
		console.log('  • Update manifest.ts to use WebP (check browser support)');
	}
}

// Execute the script only if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}
