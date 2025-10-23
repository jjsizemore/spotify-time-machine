'use client';

import { useEffect } from 'react';
import ActionButton from '@/ui/ActionButton';
import { log } from '@/lib/logger';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error('Authentication error caught', error, {
      digest: error.digest,
      name: error.name,
      category: 'auth',
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-spotify-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-spotify-white mb-4">Authentication Error</h1>
          <p className="text-spotify-light-gray mb-6">
            We encountered an issue while trying to authenticate with Spotify. This might be due to
            API restrictions or a temporary issue.
          </p>
        </div>

        <div className="space-y-4">
          <ActionButton onClick={reset} variant="primary">
            Try Again
          </ActionButton>

          <ActionButton
            onClick={() => {
              window.location.href = '/';
            }}
            variant="secondary"
          >
            Go Home
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
