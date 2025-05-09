import { format } from 'date-fns';

export interface Track {
	id: string;
	name: string;
	album: {
		name: string;
		images: Array<{
			url: string;
			height?: number;
			width?: number;
		}>;
	};
	artists: Array<{ id: string; name: string }>;
	duration_ms: number;
	preview_url: string | null;
}

export interface SavedTrack {
	added_at: string;
	track: Track;
}

export interface MonthlyTracks {
	month: string;
	tracks: SavedTrack[];
	expanded: boolean;
}

/**
 * Process and group tracks by month
 */
export function processAndGroupTracks(items: any[]): MonthlyTracks[] {
	const processedTracks: SavedTrack[] = items.map((item) => ({
		added_at: item.added_at,
		track: {
			id: item.track.id,
			name: item.track.name,
			album: {
				name: item.track.album.name,
				images: item.track.album.images.map((img: any) => ({
					url: img.url,
					height: img.height || 0,
					width: img.width || 0,
				})),
			},
			artists: item.track.artists.map((artist: any) => ({
				id: artist.id,
				name: artist.name,
			})),
			duration_ms: item.track.duration_ms,
			preview_url: item.track.preview_url,
		},
	}));

	return groupTracksByMonth(processedTracks);
}

/**
 * Helper function to group tracks by month
 */
export function groupTracksByMonth(tracks: SavedTrack[]): MonthlyTracks[] {
	const months: { [key: string]: SavedTrack[] } = {};

	tracks.forEach((item) => {
		const added_at = new Date(item.added_at);
		const monthName = format(added_at, 'MMMM yyyy');

		if (!months[monthName]) {
			months[monthName] = [];
		}

		months[monthName].push(item);
	});

	// Convert to array and add expanded state
	return Object.entries(months)
		.map(([month, tracks]) => ({
			month,
			tracks,
			expanded: false,
		}))
		.sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
}

/**
 * Fetch all liked tracks from Spotify API
 */
export async function fetchAllLikedTracks(
	spotifyApi: any
): Promise<SavedTrack[]> {
	if (!spotifyApi) {
		throw new Error('Spotify API is not ready');
	}

	const limit = 50;
	let offset = 0;
	let allTracks: any[] = [];
	let total = 0;

	do {
		const response = await spotifyApi.getMySavedTracks({ limit, offset });
		allTracks = [...allTracks, ...response.body.items];
		total = response.body.total;
		offset += limit;
	} while (offset < total);

	// Cast to our SavedTrack type
	return allTracks as SavedTrack[];
}

/**
 * Create a playlist with tracks on Spotify
 */
export async function createPlaylist(
	spotifyApi: any,
	playlistName: string,
	description: string,
	trackUris: string[]
): Promise<string> {
	// Create the playlist with correct parameters format
	const playlist = await spotifyApi.createPlaylist(playlistName, {
		description,
		public: false,
	});

	// Add tracks to the playlist (in batches of 100 due to API limits)
	for (let i = 0; i < trackUris.length; i += 100) {
		const batch = trackUris.slice(i, i + 100);
		await spotifyApi.addTracksToPlaylist(playlist.body.id, batch);
	}

	return playlist.body.external_urls.spotify;
}
