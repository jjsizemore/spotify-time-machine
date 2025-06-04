import SpotifyWebApi from 'spotify-web-api-node';

export const spotifyApi = new SpotifyWebApi({
	clientId: process.env.SPOTIFY_CLIENT_ID,
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
	redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/spotify`,
});

export const scopes = [
	'user-read-email',
	'user-read-private',
	'user-library-read',
	'playlist-modify-public',
	'playlist-modify-private',
	'user-read-recently-played',
	'user-top-read',
].join(' ');

export const refreshAccessToken = async (refreshToken: string) => {
	try {
		console.log('🔄 Attempting to refresh Spotify access token...');

		// Use direct fetch instead of spotify-web-api-node for better control
		const url = 'https://accounts.spotify.com/api/token';

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${Buffer.from(
					`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
				).toString('base64')}`,
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
			}),
			// Critical: Add no-cache to prevent stale responses
			cache: 'no-cache',
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('❌ Spotify token refresh failed:', {
				status: response.status,
				statusText: response.statusText,
				error: errorData,
			});
			throw new Error(
				`Token refresh failed: ${response.status} ${response.statusText} - ${errorData}`
			);
		}

		const body = await response.json();

		console.log('✅ Successfully refreshed Spotify access token');

		return {
			accessToken: body.access_token,
			// Important: Use new refresh token if provided, otherwise fall back to old one
			refreshToken: body.refresh_token ?? refreshToken,
			expiresAt: Math.floor(Date.now() / 1000) + body.expires_in,
		};
	} catch (error) {
		console.error('❌ Error refreshing access token:', error);
		throw error;
	}
};
