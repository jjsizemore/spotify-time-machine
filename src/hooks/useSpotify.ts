import { signIn, useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { spotifyApi } from '@/lib/spotify';

export const useSpotify = () => {
  const { data: session, status, update } = useSession();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Token refresh callback for the Spotify API client
  const tokenRefreshCallback = useCallback(async () => {
    // No client-side refresh token is required — server will perform refresh using the
    // NextAuth JWT stored in cookies. Proceed to call the server refresh endpoint.

    try {
      // Call the server-side NextAuth token refresh endpoint. The server will read the refresh token
      // from the NextAuth JWT stored in cookies and will not expose it to the client.
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokenData = await response.json();

      // Update the session with new token data. Do NOT store refresh tokens client-side.
      await update({
        ...session,
        accessToken: tokenData.accessToken,
        expiresAt: tokenData.expiresAt,
        error: undefined,
      });

      // Return shape includes refreshToken (undefined) to satisfy the SpotifyApi callback contract
      return {
        accessToken: tokenData.accessToken,
        refreshToken: undefined,
        expiresAt: tokenData.expiresAt,
      } as const;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Force re-authentication
      await signIn('spotify');
      throw error;
    }
  }, [session, update]);

  useEffect(() => {
    // Clear error when session changes
    setError(null);

    console.log('useSpotify debug:', {
      status,
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      sessionError: session?.error,
    });

    if (status === 'loading') {
      setIsReady(false);
      return;
    }

    if (session) {
      // Check for refresh token errors
      if (session.error === 'RefreshAccessTokenError') {
        console.error('🔴 Token refresh failed, redirecting to sign-in');
        setError('Authentication expired. Please sign in again.');
        setIsReady(false);

        // Clear potentially stale token from the Spotify API client
        spotifyApi.resetAccessToken();

        // Force re-authentication
        signIn('spotify');
        return;
      }

      // Check if access token exists and is valid
      if (session.accessToken) {
        console.log('🔑 Setting access token for Spotify API');

        try {
          // Set the access token and refresh callback on the spotifyApi instance
          spotifyApi.setAccessToken(session.accessToken);
          spotifyApi.setTokenRefreshCallback(tokenRefreshCallback);
          setIsReady(true);
          setError(null);
          console.log('✅ Spotify API is ready');
        } catch (err) {
          console.error('❌ Error setting Spotify access token:', err);
          setError('Failed to configure Spotify API. Please try again.');
          setIsReady(false);
        }
      } else {
        console.warn('⚠️ Session exists but no access token found');
        setError('No access token available. Please sign in again.');
        setIsReady(false);
        spotifyApi.resetAccessToken();
      }
    } else {
      console.log('📴 No session found');
      setIsReady(false);
      setError(null);
      spotifyApi.resetAccessToken();
    }
  }, [session, status, tokenRefreshCallback]);

  // Add a method to manually retry
  const retry = () => {
    if (session?.error === 'RefreshAccessTokenError') {
      signIn('spotify');
    } else {
      window.location.reload();
    }
  };

  // Get queue status for debugging
  const getQueueStatus = () => {
    return spotifyApi.getQueueStatus();
  };

  return {
    spotifyApi,
    isReady,
    error,
    retry,
    session,
    getQueueStatus,
  };
};
