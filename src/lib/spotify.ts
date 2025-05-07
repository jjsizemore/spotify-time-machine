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
