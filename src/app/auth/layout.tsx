import { Metadata } from 'next';
import { generateEnhancedMetadata } from '@/lib/seo';

export const metadata: Metadata = generateEnhancedMetadata({
  title: 'Authentication',
  description:
    'Sign in to access your personal Spotify music analytics and create custom playlists.',
  path: '/auth',
  tags: ['authentication', 'signin', 'login'],
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-spotify-black">{children}</div>;
}
