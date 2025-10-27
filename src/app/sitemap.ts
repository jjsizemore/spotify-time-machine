import { MetadataRoute } from 'next';
import { PUBLIC_ENV } from '@/lib/clientEnv';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = PUBLIC_ENV.BASE_URL;
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
  ];
}

// Enhanced Image Sitemap for 2025 SEO
export async function generateImageSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = PUBLIC_ENV.BASE_URL;

  return [
    {
      url: `${baseUrl}/previews/dashboard-preview.jpeg`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/previews/history-preview.jpeg`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/previews/playlist-generator-preview.jpeg`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/icon.svg`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'yearly',
      priority: 0.9,
    },
  ];
}
