import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL || 'https://stm.jermainesizemore.com';

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/api/',
					'/auth/',
					'/_next/',
					'/admin/',
					'/private/',
					'/*.json$',
					'/tmp/',
					'/cache/',
				],
				crawlDelay: 1,
			},
			{
				userAgent: 'Googlebot',
				allow: '/',
				disallow: ['/api/', '/auth/', '/admin/', '/private/'],
				crawlDelay: 0.5,
			},
			{
				userAgent: 'Bingbot',
				allow: '/',
				disallow: ['/api/', '/auth/', '/admin/', '/private/'],
				crawlDelay: 1,
			},
			{
				userAgent: 'facebookexternalhit',
				allow: '/',
				disallow: ['/api/', '/auth/'],
			},
			{
				userAgent: 'Twitterbot',
				allow: '/',
				disallow: ['/api/', '/auth/'],
			},
			{
				userAgent: 'LinkedInBot',
				allow: '/',
				disallow: ['/api/', '/auth/'],
			},
			// Block aggressive crawlers
			{
				userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot', 'BLEXBot'],
				disallow: '/',
			},
		],
		sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/sitemap-images.xml`],
		host: baseUrl,
	};
}
