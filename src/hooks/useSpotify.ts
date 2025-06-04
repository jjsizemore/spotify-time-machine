import { spotifyApi } from '@/lib/spotify';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export const useSpotify = () => {
	const { data: session, status } = useSession();
	const [isReady, setIsReady] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Clear error when session changes
		setError(null);

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

				// Clear potentially stale token from spotify-web-api-node
				spotifyApi.resetAccessToken();

				// Force re-authentication
				signIn('spotify');
				return;
			}

			// Check if access token exists and is valid
			if (session.accessToken) {
				console.log('🔑 Setting access token for Spotify API');

				try {
					// Set the access token on the spotifyApi instance
					spotifyApi.setAccessToken(session.accessToken);
					setIsReady(true);
					setError(null);
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
	}, [session, status]);

	// Add a method to manually retry
	const retry = () => {
		if (session?.error === 'RefreshAccessTokenError') {
			signIn('spotify');
		} else {
			window.location.reload();
		}
	};

	return {
		spotifyApi,
		isReady,
		error,
		retry,
		session,
	};
};
