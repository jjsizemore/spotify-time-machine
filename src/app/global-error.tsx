'use client';

import { useEffect } from 'react';
import ActionButton from '@/components/ui/ActionButton';

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-spotify-black text-spotify-white flex items-center justify-center px-4">
        <div className="text-center max-w-lg space-y-6">
          <div className="space-y-4">
            <div className="text-6xl">🚨</div>
            <h1 className="text-3xl font-bold">Something went off beat</h1>
            <p className="text-spotify-light-gray">
              An unexpected error prevented Spotify Time Machine from loading. You can try again or
              hop back to the dashboard while we investigate.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
            <ActionButton onClick={reset} variant="primary">
              Try Again
            </ActionButton>
            <ActionButton
              onClick={() => {
                globalThis.location.href = '/';
              }}
              variant="secondary"
            >
              Go Home
            </ActionButton>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-spotify-dark-gray p-4 rounded-lg">
              <summary className="cursor-pointer text-spotify-white">Error details</summary>
              <pre className="mt-2 text-xs text-red-400 whitespace-pre-wrap wrap-break-word">
                {error.message}
              </pre>
              {error.digest && (
                <p className="mt-2 text-xs text-spotify-light-gray">Digest: {error.digest}</p>
              )}
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
