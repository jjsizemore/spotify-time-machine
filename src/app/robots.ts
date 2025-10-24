import { MetadataRoute } from 'next';
import { getEnvOrDefault } from '@/lib/envConfig';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getEnvOrDefault('NEXT_PUBLIC_BASE_URL', 'https://tm.jermainesizemore.com');

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
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/auth/', '/admin/', '/private/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/auth/', '/admin/', '/private/'],
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
  };
}
