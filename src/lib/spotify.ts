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
		spotifyApi.setRefreshToken(refreshToken);
		const { body } = await spotifyApi.refreshAccessToken();

		return {
			accessToken: body.access_token,
			refreshToken: refreshToken, // If the Spotify API doesn't return a new refresh token, use the old one
			expiresAt: Math.floor(Date.now() / 1000) + body.expires_in,
		};
	} catch (error) {
		console.error('Error refreshing access token:', error);
		throw error;
	}
};
