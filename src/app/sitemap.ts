import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL || 'https://stm.jermainesizemore.com';
	const currentDate = new Date();
	const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

	return [
		{
			url: baseUrl,
			lastModified: currentDate,
			changeFrequency: 'weekly',
			priority: 1.0,
			alternates: {
				languages: {
					en: baseUrl,
				},
			},
		},
		{
			url: `${baseUrl}/dashboard`,
			lastModified: currentDate,
			changeFrequency: 'daily',
			priority: 0.9,
			alternates: {
				languages: {
					en: `${baseUrl}/dashboard`,
				},
			},
		},
		{
			url: `${baseUrl}/history`,
			lastModified: lastWeek,
			changeFrequency: 'daily',
			priority: 0.8,
			alternates: {
				languages: {
					en: `${baseUrl}/history`,
				},
			},
		},
		{
			url: `${baseUrl}/playlist-generator`,
			lastModified: lastWeek,
			changeFrequency: 'daily',
			priority: 0.8,
			alternates: {
				languages: {
					en: `${baseUrl}/playlist-generator`,
				},
			},
		},
		{
			url: `${baseUrl}/thank-you`,
			lastModified: new Date('2024-01-01'),
			changeFrequency: 'monthly',
			priority: 0.5,
			alternates: {
				languages: {
					en: `${baseUrl}/thank-you`,
				},
			},
		},
		// Add dynamic routes for better SEO discovery
		{
			url: `${baseUrl}/auth/signin`,
			lastModified: new Date('2024-01-01'),
			changeFrequency: 'yearly',
			priority: 0.3,
		},
		// Add API documentation routes if they exist
		{
			url: `${baseUrl}/api-docs`,
			lastModified: new Date('2024-01-01'),
			changeFrequency: 'monthly',
			priority: 0.4,
		},
	];
}

// Enhanced Image Sitemap for 2025 SEO
export async function generateImageSitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL || 'https://stm.jermainesizemore.com';

	return [
		{
			url: `${baseUrl}/previews/dashboard-preview.png`,
			lastModified: new Date('2024-01-01'),
			changeFrequency: 'yearly',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/previews/history-preview.png`,
			lastModified: new Date('2024-01-01'),
			changeFrequency: 'yearly',
			priority: 0.7,
		},
		{
			url: `${baseUrl}/previews/playlist-generator-preview.png`,
			lastModified: new Date('2024-01-01'),
			changeFrequency: 'yearly',
			priority: 0.7,
		},
		{
			url: `${baseUrl}/favicon.svg`,
			lastModified: new Date('2024-01-01'),
			changeFrequency: 'yearly',
			priority: 0.9,
		},
		{
			url: `${baseUrl}/spotify-icon.png`,
			lastModified: new Date('2024-01-01'),
			changeFrequency: 'yearly',
			priority: 0.9,
		},
	];
}
