import { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import Breadcrumb from '@/layout/Breadcrumb';
import PageContainer from '@/layout/PageContainer';
import { generateEnhancedMetadata, generateWebApplicationSchema } from '@/lib/seo';
import DashboardClient from './_components/DashboardClient';

// Enhanced metadata for the dashboard page using async pattern
export const metadata: Metadata = generateEnhancedMetadata({
  title: 'Dashboard',
  description:
    'View your personalized Spotify listening statistics, including top artists, tracks, and genres. Analyze your music trends and discover insights about your listening habits with interactive visualizations.',
  path: '/dashboard',
  image: '/previews/dashboard-preview.jpeg',
  tags: [
    'Spotify dashboard',
    'music analytics',
    'listening statistics',
    'top artists',
    'top tracks',
    'music visualization',
  ],
});

// Server Component for initial data structure and SEO
export default async function Dashboard() {
  // Generate enhanced structured data for dashboard on server
  const dashboardSchema = generateWebApplicationSchema({
    '@type': 'WebPage',
    name: 'Dashboard - Spotify Time Machine',
    description:
      'View your personalized Spotify listening statistics, including top artists, tracks, and genres. Analyze your music trends and discover insights about your listening habits.',
    mainEntity: {
      '@type': 'DataVisualization',
      name: 'Spotify Listening Statistics',
      description: 'Interactive dashboard showing personal music listening analytics',
      about: [
        'Top Artists Analysis',
        'Top Tracks Statistics',
        'Genre Distribution',
        'Recently Played Music',
        'Listening Trends Over Time',
      ],
    },
  });

  return (
    <PageContainer maxWidth="7xl" className="min-h-screen pb-20">
      {/* Enhanced Structured Data for 2025 SEO */}
      <Script
        id="dashboard-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(dashboardSchema),
        }}
      />

      {/* SEO-optimized heading structure */}
      <header className="mb-8">
        <h1 className="sr-only">Spotify Music Dashboard - Your Personal Listening Analytics</h1>
        <Breadcrumb items={[{ name: 'Home', url: '/dashboard' }]} />
      </header>

      {/* Client Component for Interactive Elements */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="loading-skeleton h-16 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="loading-skeleton h-32 rounded-lg" />
              <div className="loading-skeleton h-32 rounded-lg" />
            </div>
            <div className="loading-skeleton h-64 rounded-lg" />
          </div>
        }
      >
        <DashboardClient />
      </Suspense>
    </PageContainer>
  );
}
