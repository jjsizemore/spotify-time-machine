import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCREENSHOTS_DIR = join(dirname(__dirname), 'public');

const SCREENSHOTS = [
	{
		name: 'dashboard-preview',
		url: 'http://localhost:3000/dashboard',
		waitForSelector: '.bg-spotify-dark-gray',
		viewport: { width: 1440, height: 900 },
		clip: { x: 0, y: 0, width: 1440, height: 800 },
	},
	{
		name: 'history-preview',
		url: 'http://localhost:3000/history',
		waitForSelector: '.bg-spotify-dark-gray',
		viewport: { width: 1440, height: 900 },
		clip: { x: 0, y: 0, width: 1440, height: 800 },
	},
	{
		name: 'playlist-generator-preview',
		url: 'http://localhost:3000/playlist-generator',
		waitForSelector: '.bg-spotify-dark-gray',
		viewport: { width: 1440, height: 900 },
		clip: { x: 0, y: 0, width: 1440, height: 800 },
	},
];

async function generateScreenshots() {
	// Ensure screenshots directory exists
	if (!existsSync(SCREENSHOTS_DIR)) {
		mkdirSync(SCREENSHOTS_DIR, { recursive: true });
	}

	const browser = await puppeteer.launch({
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});

	try {
		// First, authenticate
		console.log('Authenticating...');
		const authPage = await browser.newPage();
		await authPage.setViewport({ width: 1440, height: 900 });

		// Go to the home page
		await authPage.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

		// Click the Spotify sign-in button
		await authPage.waitForSelector('.spotify-button');
		await authPage.click('.spotify-button');

		// Wait for authentication to complete
		await authPage.waitForNavigation({ waitUntil: 'networkidle0' });

		// Get the cookies after authentication
		const cookies = await authPage.cookies();
		await authPage.close();

		// Now take screenshots
		for (const screenshot of SCREENSHOTS) {
			console.log(`Generating screenshot for ${screenshot.name}...`);

			const page = await browser.newPage();
			await page.setViewport(screenshot.viewport);

			// Set the cookies from the authenticated session
			await page.setCookie(...cookies);

			// Navigate to the page
			await page.goto(screenshot.url, { waitUntil: 'networkidle0' });

			// Wait for the main content to load
			await page.waitForSelector(screenshot.waitForSelector);

			// Add a small delay to ensure all animations are complete
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Take the screenshot
			const screenshotPath = join(SCREENSHOTS_DIR, `${screenshot.name}.png`);
			await page.screenshot({
				path: screenshotPath,
				fullPage: false,
				clip: screenshot.clip,
				quality: 100,
			});

			console.log(`Screenshot saved to ${screenshotPath}`);
			await page.close();
		}
	} catch (error) {
		console.error('Error generating screenshots:', error);
		process.exit(1);
	} finally {
		await browser.close();
	}
}

// Run the script
generateScreenshots().catch(console.error);
