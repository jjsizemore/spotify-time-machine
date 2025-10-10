import { Metadata } from 'next';
import { generateEnhancedMetadata } from '@/lib/seo';

export const metadata: Metadata = generateEnhancedMetadata({
  title: 'Thank You',
  description:
    "Thank you for using Jermaine's Spotify Time Machine! You have been successfully logged out.",
  path: '/thank-you',
  tags: ['logout', 'thank you', 'goodbye'],
});

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-spotify-black">{children}</div>;
}
