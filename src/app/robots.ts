import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL ||
		'https://spotify-time-machine.vercel.app';

	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: ['/api/', '/auth/'],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
