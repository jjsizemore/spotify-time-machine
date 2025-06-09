#!/usr/bin/env node

/**
 * Image optimization script for Spotify Time Machine
 *
 * This script optimizes images in the Spotify Time Machine project, creating
 * smaller WebP versions that load faster while maintaining quality.
 * Particularly useful for preview images and any future assets.
 *
 * To use:
 * 1. Dependencies should already be installed via package.json
 * 2. Run: pnpm optimize-images
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Type definitions
interface OptimizationConfig {
	readonly quality: number;
	readonly maxWidth: number;
	readonly thumbnailWidth: number;
	readonly thumbnailHeight: number;
	readonly previewQuality: number; // Higher quality for preview images
}

interface DirectoryInfo {
	readonly inputDir: string;
	readonly outputDir: string;
	readonly category: string;
}

interface ProcessingStats {
	totalFiles: number;
	processedFiles: number;
	skippedFiles: number;
	errors: number;
}

// Configuration constants for Spotify Time Machine
const DIRS: readonly string[] = [
	'public/previews', // Preview screenshots of the app
	'public/images', // App icons and assets
	'public', // Root level images like favicon.png, spotify-icon.png
] as const;

const OPTIMIZED_DIR = 'public/images/optimized' as const;

const OPTIMIZATION_CONFIG: OptimizationConfig = {
	quality: 100, // Maximum quality for app assets
	maxWidth: 2000, // Much larger max width to preserve detail
	thumbnailWidth: 800, // Larger thumbnails for better clarity
	thumbnailHeight: 600, // Taller thumbnails to preserve aspect ratio
	previewQuality: 100, // Maximum quality for preview images
} as const;

const SUPPORTED_EXTENSIONS: readonly string[] = [
	'.jpg',
	'.jpeg',
	'.png',
	'.webp', // Also process existing webp files for consistency
] as const;

// Files to exclude from optimization (keep originals)
const EXCLUDED_FILES: readonly string[] = [
	'favicon.svg',
	'browserconfig.xml',
	'sw.js',
	'.DS_Store',
] as const;

/**
 * Creates a directory if it doesn't exist
 */
function ensureDirectoryExists(dirPath: string): void {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
		console.log(`📁 Created directory: ${dirPath}`);
	}
}

/**
 * Determines the category name for a given directory
 */
function getCategoryName(dir: string): string {
	if (dir === 'public/previews') return 'previews';
	if (dir === 'public/images') return 'assets';
	if (dir === 'public') return 'root';

	const relativeDir = path.relative('public', dir);
	return relativeDir === ''
		? 'general'
		: relativeDir.split(path.sep).pop() || 'unknown';
}

/**
 * Checks if a file is a supported image format
 */
function isSupportedImageFile(filePath: string): boolean {
	const fileExt = path.extname(filePath).toLowerCase();
	return SUPPORTED_EXTENSIONS.includes(
		fileExt as (typeof SUPPORTED_EXTENSIONS)[number]
	);
}

/**
 * Checks if a file should be excluded from processing
 */
function isExcludedFile(fileName: string): boolean {
	return EXCLUDED_FILES.includes(fileName) || fileName.startsWith('.');
}

/**
 * Determines if this is a preview image that needs higher quality
 */
function isPreviewImage(filePath: string): boolean {
	const fileName = path.basename(filePath).toLowerCase();
	return fileName.includes('preview') || fileName.includes('screenshot');
}

/**
 * Optimizes a single image file with maximum clarity settings
 */
async function optimizeImage(
	inputPath: string,
	outputDir: string,
	fileName: string
): Promise<boolean> {
	try {
		const fileExt = path.extname(fileName);
		const baseName = path.basename(fileName, fileExt);
		const webpOutputPath = `${outputDir}/${baseName}.webp` as const;
		const thumbOutputPath = `${outputDir}/${baseName}-thumb.webp` as const;

		// Use lossless WebP for preview images to maximize clarity
		const isPreview = isPreviewImage(inputPath);
		const webpOptions = isPreview
			? { lossless: true, effort: 6 } // Lossless with maximum effort for previews
			: { quality: OPTIMIZATION_CONFIG.quality, effort: 6 }; // High quality with max effort for others

		// Process the full-size image to WebP with maximum clarity settings
		await sharp(inputPath)
			.resize({
				width: OPTIMIZATION_CONFIG.maxWidth,
				withoutEnlargement: true,
				kernel: sharp.kernel.lanczos3, // Best quality resampling kernel
			})
			.sharpen() // Add subtle sharpening for clarity
			.webp(webpOptions)
			.toFile(webpOutputPath);

		// Create a high-quality thumbnail version
		await sharp(inputPath)
			.resize({
				width: OPTIMIZATION_CONFIG.thumbnailWidth,
				height: OPTIMIZATION_CONFIG.thumbnailHeight,
				fit: 'cover',
				kernel: sharp.kernel.lanczos3, // Best quality resampling
			})
			.sharpen() // Add subtle sharpening for thumbnails
			.webp(webpOptions)
			.toFile(thumbOutputPath);

		const qualityLabel = isPreview ? ' (lossless)' : ' (high quality)';
		console.log(
			`✅ Optimized: ${fileName} → ${path.basename(webpOutputPath)}${qualityLabel}`
		);
		return true;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error';
		console.error(`❌ Error optimizing ${fileName}: ${errorMessage}`);
		return false;
	}
}

/**
 * Processes all files in a single directory
 */
async function processDirectory(
	directoryInfo: DirectoryInfo
): Promise<ProcessingStats> {
	const { inputDir, outputDir, category } = directoryInfo;
	const stats: ProcessingStats = {
		totalFiles: 0,
		processedFiles: 0,
		skippedFiles: 0,
		errors: 0,
	};

	// Create category subdirectory if it doesn't exist
	ensureDirectoryExists(outputDir);

	// Check if input directory exists
	if (!fs.existsSync(inputDir)) {
		console.warn(`⚠️  Directory not found: ${inputDir}, skipping...`);
		return stats;
	}

	try {
		const files = fs.readdirSync(inputDir);
		const imageFiles = files.filter((file) => {
			const inputPath = path.join(inputDir, file);
			return fs.statSync(inputPath).isFile() && !isExcludedFile(file);
		});

		stats.totalFiles = imageFiles.length;

		console.log(
			`\n📂 Processing ${category} directory (${imageFiles.length} files)...`
		);

		for (const file of imageFiles) {
			const inputPath = path.join(inputDir, file);

			if (isSupportedImageFile(inputPath)) {
				const success = await optimizeImage(inputPath, outputDir, file);
				if (success) {
					stats.processedFiles++;
				} else {
					stats.errors++;
				}
			} else {
				console.log(`⏭️  Skipping non-image file: ${file}`);
				stats.skippedFiles++;
			}
		}

		console.log(
			`📊 ${category}: ${stats.processedFiles} processed, ${stats.skippedFiles} skipped, ${stats.errors} errors`
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error';
		console.error(`❌ Error reading directory ${inputDir}: ${errorMessage}`);
		stats.errors++;
	}

	return stats;
}

/**
 * Prepares directory information for processing
 */
function prepareDirectoryInfo(dir: string): DirectoryInfo {
	const category = getCategoryName(dir);
	const outputDir = path.join(OPTIMIZED_DIR, category);

	return {
		inputDir: dir,
		outputDir,
		category,
	};
}

/**
 * Prints final summary statistics
 */
function printSummary(allStats: readonly ProcessingStats[]): void {
	const totalStats = allStats.reduce(
		(acc, stats) => ({
			totalFiles: acc.totalFiles + stats.totalFiles,
			processedFiles: acc.processedFiles + stats.processedFiles,
			skippedFiles: acc.skippedFiles + stats.skippedFiles,
			errors: acc.errors + stats.errors,
		}),
		{ totalFiles: 0, processedFiles: 0, skippedFiles: 0, errors: 0 }
	);

	console.log('\n🎉 Spotify Time Machine image optimization complete!');
	console.log('═'.repeat(60));
	console.log(
		`📈 Summary: ${totalStats.processedFiles} processed, ${totalStats.skippedFiles} skipped, ${totalStats.errors} errors`
	);
	console.log(`💾 Optimized images saved to: ${OPTIMIZED_DIR}`);
	console.log('\n📖 Usage in your Next.js app:');
	console.log('   Preview images: /images/optimized/previews/{filename}.webp');
	console.log(
		'   Thumbnails: /images/optimized/previews/{filename}-thumb.webp'
	);
	console.log('   App assets: /images/optimized/assets/{filename}.webp');
	console.log('   Root images: /images/optimized/root/{filename}.webp');

	if (totalStats.processedFiles > 0) {
		console.log('\n💡 Clarity Enhancements:');
		console.log('   • Preview images use lossless WebP (maximum clarity)');
		console.log('   • Lanczos3 resampling for best quality scaling');
		console.log('   • Subtle sharpening applied for enhanced detail');
		console.log('   • Larger dimensions preserved (up to 2000px width)');
		console.log('   • High-resolution thumbnails (800x600px)');
		console.log('   • Maximum effort encoding for best compression');
	}
}

/**
 * Main function that orchestrates the entire optimization process
 */
async function processDirectories(): Promise<void> {
	console.log('🚀 Starting Spotify Time Machine image optimization...');
	console.log('🎯 Focus: Maximum clarity and detail preservation');
	console.log(
		`📏 Max width: ${OPTIMIZATION_CONFIG.maxWidth}px, Thumbnails: ${OPTIMIZATION_CONFIG.thumbnailWidth}x${OPTIMIZATION_CONFIG.thumbnailHeight}px`
	);
	console.log('🔍 Preview images: Lossless WebP + Lanczos3 + Sharpening');
	console.log('⚙️  Other images: 100% quality WebP + Enhanced processing');
	console.log('═'.repeat(60));

	// Create main optimized directory
	ensureDirectoryExists(OPTIMIZED_DIR);

	const allStats: ProcessingStats[] = [];

	// Process each directory
	for (const dir of DIRS) {
		const directoryInfo = prepareDirectoryInfo(dir);
		const stats = await processDirectory(directoryInfo);
		allStats.push(stats);
	}

	// Print final summary
	printSummary(allStats);
}

/**
 * Entry point - runs the optimization process
 */
async function main(): Promise<void> {
	try {
		await processDirectories();
		process.exit(0);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error';
		console.error(
			'💥 Fatal error in Spotify Time Machine image optimization:',
			errorMessage
		);
		process.exit(1);
	}
}

// Execute the script only if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}
