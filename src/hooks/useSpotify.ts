import { spotifyApi } from '@/lib/spotify';
import { signIn, useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

export const useSpotify = () => {
	const { data: session, status, update } = useSession();
	const [isReady, setIsReady] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Token refresh callback for the Spotify API client
	const tokenRefreshCallback = useCallback(async () => {
		if (!session?.refreshToken) {
			throw new Error('No refresh token available');
		}

		try {
			// Call the NextAuth token refresh endpoint
			const response = await fetch('/api/auth/refresh-token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					refreshToken: session.refreshToken,
				}),
			});

			if (!response.ok) {
				throw new Error('Token refresh failed');
			}

			const tokenData = await response.json();

			// Update the session with new token data
			await update({
				...session,
				accessToken: tokenData.accessToken,
				refreshToken: tokenData.refreshToken,
				expiresAt: tokenData.expiresAt,
				error: undefined,
			});

			return {
				accessToken: tokenData.accessToken,
				refreshToken: tokenData.refreshToken,
				expiresAt: tokenData.expiresAt,
			};
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
			hasRefreshToken: !!session?.refreshToken,
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
