import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Jermaine's Spotify Time Machine",
		short_name: 'Spotify Time Machine',
		description:
			'Your personal Spotify listening history and playlist generator. Relive your music journey, create custom playlists, and explore your listening habits over time.',
		start_url: '/',
		display: 'standalone',
		background_color: '#191414',
		theme_color: '#1DB954',
		orientation: 'portrait-primary',
		categories: ['music', 'entertainment', 'productivity'],
		lang: 'en-US',
		scope: '/',
		icons: [
			{
				src: '/favicon.svg',
				sizes: 'any',
				type: 'image/svg+xml',
				purpose: 'maskable',
			},
		],
		screenshots: [
			{
				src: '/previews/dashboard-preview.jpeg',
				sizes: '1200x630',
				type: 'image/jpeg',
				form_factor: 'wide',
				label: 'Dashboard view showing your Spotify statistics',
			},
			{
				src: '/previews/history-preview.jpeg',
				sizes: '1200x630',
				type: 'image/jpeg',
				form_factor: 'wide',
				label: 'Music history timeline view',
			},
			{
				src: '/previews/playlist-generator-preview.jpeg',
				sizes: '1200x630',
				type: 'image/jpeg',
				form_factor: 'wide',
				label: 'Playlist generator view',
			},
		],
		related_applications: [
			{
				platform: 'webapp',
				url: 'https://stm.jermainesizemore.com',
			},
		],
		prefer_related_applications: false,
	};
}
