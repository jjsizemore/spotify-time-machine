'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSpotify } from '@/hooks/useSpotify';
import LoadingSpinner from '@/components/LoadingSpinner';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import Navigation from '@/components/Navigation';

export default function PlaylistGeneratorPage() {
  const { data: session, status } = useSession();
  const spotifyApi = useSpotify();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [trackCount, setTrackCount] = useState(0);

  // Generate the custom playlist
  const generatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate || !playlistName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // 1. Get all liked tracks
      const tracks = await fetchAllLikedTracks();

      // 2. Filter tracks by date range
      const parsedStartDate = parseISO(startDate);
      const parsedEndDate = parseISO(endDate);

      const filteredTracks = tracks.filter(track => {
        const trackDate = new Date(track.added_at);
        return isAfter(trackDate, parsedStartDate) && isBefore(trackDate, parsedEndDate);
      });

      if (filteredTracks.length === 0) {
        setError('No tracks found in the selected date range');
        setIsLoading(false);
        return;
      }

      setTrackCount(filteredTracks.length);

      // 3. Create a new playlist
      const user = await spotifyApi.getMe();
      const dateRangeText = `${format(parsedStartDate, 'MMM d, yyyy')} - ${format(parsedEndDate, 'MMM d, yyyy')}`;

      const playlist = await spotifyApi.createPlaylist(
        user.body.id,
        {
          description: `Custom playlist for ${dateRangeText}. Created with Spotify Time Machine.`,
          public: false
        },
        playlistName
      );

      // 4. Add tracks to the playlist (in batches of 100 due to API limits)
      const trackUris = filteredTracks.map(track => `spotify:track:${track.track.id}`);

      for (let i = 0; i < trackUris.length; i += 100) {
        const batch = trackUris.slice(i, i + 100);
        await spotifyApi.addTracksToPlaylist(playlist.body.id, batch);
      }

      setSuccess(true);
      setPlaylistUrl(playlist.body.external_urls.spotify);
    } catch (err) {
      console.error('Error generating playlist:', err);
      setError('Failed to generate playlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to fetch all liked tracks
  const fetchAllLikedTracks = async () => {
    const limit = 50;
    let offset = 0;
    let allTracks = [];
    let total = 0;

    do {
      const response = await spotifyApi.getMySavedTracks({ limit, offset });
      allTracks = [...allTracks, ...response.body.items];
      total = response.body.total;
      offset += limit;
    } while (offset < total);

    return allTracks;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-spotify-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotify-black">
      {/* Top Navigation Bar */}
      <Navigation user={session?.user} />

      {/* Main Content */}
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-spotify-light-gray mb-2">
          Custom Playlist Generator
        </h1>
        <p className="text-spotify-light-gray mb-8">
          Create a playlist from your liked songs within a specific date range.
        </p>

        <div className="bg-spotify-dark-gray rounded-lg p-6">
          {!success ? (
            <form onSubmit={generatePlaylist} className="space-y-6">
              <div>
                <label htmlFor="playlistName" className="block text-spotify-white mb-2 font-medium">
                  Playlist Name
                </label>
                <input
                  type="text"
                  id="playlistName"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  className="w-full bg-spotify-black border border-spotify-medium-gray rounded-md p-3 text-spotify-white focus:outline-none focus:ring-2 focus:ring-spotify-green"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-spotify-white mb-2 font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-spotify-black border border-spotify-medium-gray rounded-md p-3 text-spotify-white focus:outline-none focus:ring-2 focus:ring-spotify-green"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-spotify-white mb-2 font-medium">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-spotify-black border border-spotify-medium-gray rounded-md p-3 text-spotify-white focus:outline-none focus:ring-2 focus:ring-spotify-green"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-spotify-white p-3 rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-spotify-green text-spotify-black font-bold py-3 px-4 rounded-full hover:bg-spotify-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Generate Playlist'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="bg-spotify-green/20 border border-spotify-green text-spotify-green p-4 rounded-md">
                <h3 className="font-bold text-xl mb-2">Playlist Created Successfully!</h3>
                <p>Added {trackCount} tracks from your saved songs.</p>
              </div>

              <div>
                <a
                  href={playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-spotify-green text-spotify-black font-bold py-3 px-6 rounded-full hover:bg-spotify-green/90 transition"
                >
                  Open Playlist in Spotify
                </a>
              </div>

              <button
                onClick={() => {
                  setSuccess(false);
                  setPlaylistName('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-spotify-light-gray underline hover:text-spotify-white"
              >
                Create Another Playlist
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}