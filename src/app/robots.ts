import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL || 'https://stm.jermainesizemore.com';

	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: ['/api/', '/auth/'],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
