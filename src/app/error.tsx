'use client';

import { useEffect } from 'react';
import ActionButton from '@/ui/ActionButton';
import { PUBLIC_ENV } from '@/lib/clientEnv';

export default function ErrorBoundary({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  const isDev = PUBLIC_ENV.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-spotify-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-2xl font-bold text-spotify-white mb-4">Oops! Something went wrong</h1>
          <p className="text-spotify-light-gray mb-6">
            We encountered an unexpected error. This might be due to Spotify API limitations or a
            temporary issue.
          </p>
        </div>

        <div className="space-y-4">
          <ActionButton onClick={reset} variant="primary">
            Try Again
          </ActionButton>

          <ActionButton onClick={() => (globalThis.location.href = '/')} variant="secondary">
            Go Home
          </ActionButton>
        </div>

        {isDev && (
          <details className="mt-6 text-left bg-spotify-dark-gray p-4 rounded-lg">
            <summary className="text-spotify-white cursor-pointer">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs text-red-400 mt-2 overflow-auto">{error.message}</pre>
          </details>
        )}
      </div>
    </div>
  );
}
