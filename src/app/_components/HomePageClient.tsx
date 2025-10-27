'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/ui/LoadingSpinner';
import FeatureShowcaseItem from '@/features/home/FeatureShowcaseItem';
import SpotifySignInButton from '@/auth/SpotifySignInButton';

export default function HomePageClient() {
  const { status } = useSession();
  const router = useRouter();
  const [showApiRestrictionNotice, setShowApiRestrictionNotice] = useState(true);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Show loading spinner while checking auth status
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-spotify-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <main
      className="flex flex-col min-h-screen items-center justify-center bg-spotify-black text-spotify-light-gray px-4"
      role="main"
    >
      <div className="flex flex-col items-center w-full max-w-4xl xl:max-w-6xl py-12">
        {/* Spotify API Restriction Notice */}
        {showApiRestrictionNotice && (
          <section
            aria-labelledby="api-restriction-heading"
            className="w-full max-w-4xl mx-auto mb-8 bg-red-900/20 border border-red-500/50 rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">⚠️</div>
                  <h2 id="api-restriction-heading" className="text-xl font-bold text-red-400">
                    Important Notice: App in Development Mode
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-spotify-light-gray">
                  <div className="bg-red-900/30 p-4 rounded-md">
                    <p className="text-red-300 font-semibold mb-2">
                      🚨 This app is currently stuck in development mode due to Spotify&apos;s new
                      API restrictions.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-red-200">
                      <li>
                        Only users manually added to an allowlist can use this app (max 25 users)
                      </li>
                      <li>Severely restricted rate limits compared to extended quota mode</li>
                      <li>
                        Spotify now requires 250k MAUs (Monthly Active Users) to enable extended
                        access
                      </li>
                      <li>
                        Only organizations (not individuals) can apply for extended access as of May
                        15, 2025
                      </li>
                      <li>
                        This makes it impossible for independent developers to launch new public
                        apps
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-spotify-white mb-2">
                      📢 Help us fight these restrictions:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <a
                        href="https://community.spotify.com/t5/Spotify-for-Developers/Updating-the-Criteria-for-Web-API-Extended-Access/m-p/6920661/highlight/true#M17569"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-spotify-green hover:bg-spotify-green/80 text-spotify-black font-medium rounded-lg transition-colors"
                      >
                        <span className="mr-2">💬</span>
                        Join Developer Discussion
                      </a>
                      <a
                        href="https://support.spotify.com/us/contact-spotify-support/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-spotify-dark-gray hover:bg-spotify-medium-gray text-spotify-white font-medium rounded-lg transition-colors border border-spotify-light-gray/30"
                      >
                        <span className="mr-2">📧</span>
                        Contact Spotify Support
                      </a>
                    </div>
                  </div>

                  <div className="text-xs opacity-80">
                    <p>
                      <strong>More info:</strong>{' '}
                      <a
                        href="https://developer.spotify.com/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-spotify-green hover:text-spotify-green/80 underline"
                      >
                        Spotify&apos;s API Change Announcement
                      </a>
                      {' | '}
                      <a
                        href="https://developer.spotify.com/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-spotify-green hover:text-spotify-green/80 underline"
                      >
                        Updated Developer Terms
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowApiRestrictionNotice(false)}
                className="ml-4 text-red-400 hover:text-red-300 p-1"
                aria-label="Dismiss notice"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </section>
        )}

        {/* Data Usage & Privacy Card */}
        <section
          aria-labelledby="privacy-heading"
          className="w-full md:w-1/2 max-w-lg mx-auto mb-8 bg-spotify-dark-gray rounded-lg p-4 shadow-lg"
        >
          <div className="flex flex-col">
            <h2 id="privacy-heading" className="text-xl font-bold text-spotify-white mb-3">
              Your Data & Privacy
            </h2>
            <div className="space-y-3 text-sm text-spotify-light-gray">
              <div>
                <strong className="text-spotify-white">What we access:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Your liked tracks and when you liked them</li>
                  <li>Your top artists and genres</li>
                  <li>Your recently played tracks</li>
                  <li>Ability to create playlists in your Spotify account</li>
                </ul>
              </div>
              <div>
                <strong className="text-spotify-white">What we don&apos;t access:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Your personal information (email, name, etc.)</li>
                  <li>Your playlists (unless you create them through our app)</li>
                  <li>Your listening activity outside of liked tracks</li>
                  <li>Your payment information or account settings</li>
                </ul>
              </div>
              <p className="mt-3 text-xs">
                We only use your Spotify data to provide you with insights and create playlists.
                Your data is never shared with third parties or used for any other purpose.
              </p>
            </div>
          </div>
        </section>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-center mb-8 text-spotify-white tracking-tight">
          <span className="text-spotify-green">Jermaine&apos;s</span>
          <br />
          <Image
            src="/spotify-icon.png"
            alt="Spotify Logo"
            width={120}
            height={120}
            className="inline-block mx-4 mb-2 drop-shadow-lg"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
          <br />
          <span className="text-spotify-green">Time Machine</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-center mb-12 text-spotify-light-gray max-w-3xl">
          Dive deep into your Spotify listening history. Discover patterns, create custom playlists
          from any time period, and explore your musical evolution with powerful analytics and
          insights.
        </p>

        {/* Spotify Sign In Button */}
        <div className="flex justify-center mb-12">
          <SpotifySignInButton />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-16 mb-12 w-full max-w-6xl">
          <FeatureShowcaseItem
            title="Personal Analytics"
            description="View your top artists, tracks, and genres with beautiful visualizations and detailed insights into your listening habits."
            imageUrl="/previews/dashboard-preview.jpeg"
            imageAlt="Dashboard Preview"
            previewUrl="/previews/dashboard-preview.jpeg"
            imageWidth={400}
            imageHeight={300}
          />
          <FeatureShowcaseItem
            title="Time Travel"
            description="Explore your liked tracks month by month and see exactly what you were listening to at any point in time."
            imageUrl="/previews/history-preview.jpeg"
            imageAlt="History Preview"
            previewUrl="/previews/history-preview.jpeg"
            imageWidth={400}
            imageHeight={300}
            reverseLayout={true}
          />
          <FeatureShowcaseItem
            title="Playlist Generator"
            description="Create custom playlists from specific time periods, genres, or artists with a single click."
            imageUrl="/previews/playlist-generator-preview.jpeg"
            imageAlt="Playlist Generator Preview"
            previewUrl="/previews/playlist-generator-preview.jpeg"
            imageWidth={400}
            imageHeight={300}
          />
        </div>

        {/* Footer Note */}
        <p className="text-sm text-spotify-gray mt-8 text-center max-w-2xl">
          This app uses Spotify Web API to access your personal music data. Your data is only used
          to provide insights and is never shared or stored permanently.
        </p>
      </div>
    </main>
  );
}
