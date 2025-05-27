import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL ||
		'https://spotify-time-machine.vercel.app';

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1,
		},
		{
			url: `${baseUrl}/dashboard`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.9,
		},
		{
			url: `${baseUrl}/history`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/playlist-generator`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/thank-you`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.5,
		},
	];
}
