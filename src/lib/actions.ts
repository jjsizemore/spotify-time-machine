'use server';

import { revalidatePath } from 'next/cache';
import * as Sentry from '@sentry/nextjs';

// Enhanced form data validation for playlists
interface PlaylistFormData {
  playlistName: string;
  startDate: string;
  endDate: string;
  selectedGenres?: string[];
  selectedArtists?: string[];
}

function validateFormData(formData: FormData): PlaylistFormData {
  // Safe string extraction from FormData
  const getStringValue = (key: string): string => {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
  };

  const playlistName = getStringValue('playlistName').trim();
  const startDate = getStringValue('startDate');
  const endDate = getStringValue('endDate');

  if (!playlistName || playlistName.length < 1) {
    throw new Error('Playlist name is required');
  }

  if (!startDate || !endDate) {
    throw new Error('Both start and end dates are required');
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    throw new Error('Invalid date format');
  }

  // Validate date logic
  if (new Date(startDate) > new Date(endDate)) {
    throw new Error('Start date must be before or equal to end date');
  }

  // Get optional filter arrays - safely handle FormDataEntryValue[]
  const selectedGenres = formData
    .getAll('selectedGenres')
    .filter((value): value is string => typeof value === 'string')
    .filter(Boolean);

  const selectedArtists = formData
    .getAll('selectedArtists')
    .filter((value): value is string => typeof value === 'string')
    .filter(Boolean);

  return {
    playlistName,
    startDate,
    endDate,
    selectedGenres,
    selectedArtists,
  };
}

// Server Action for playlist creation
export async function createPlaylistAction(formData: FormData) {
  return Sentry.startSpan(
    {
      name: 'createPlaylistAction',
      op: 'function.server_action',
    },
    async (span) => {
      try {
        // Validate form data
        const validatedData = validateFormData(formData);

        span.setAttributes({
          'playlist.name': validatedData.playlistName,
          'playlist.date_range': `${validatedData.startDate} to ${validatedData.endDate}`,
          'playlist.genre_filters': validatedData.selectedGenres?.length || 0,
          'playlist.artist_filters': validatedData.selectedArtists?.length || 0,
        });

        // For now, return a simulated success - full implementation would
        // need server-side Spotify API integration
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Revalidate related pages
        revalidatePath('/playlist-generator');
        revalidatePath('/dashboard');

        // Return success result
        return {
          success: true,
          playlistUrl: 'https://open.spotify.com/playlist/example',
          trackCount: 25,
          message: `Playlist "${validatedData.playlistName}" created successfully!`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        console.error('Playlist creation error:', error);
        Sentry.captureException(error);

        span.setAttributes({
          'error.occurred': true,
          'error.message': errorMessage,
        });

        return {
          success: false,
          error: errorMessage,
        };
      }
    }
  );
}

// Server Action for refreshing data cache
export async function refreshUserDataAction() {
  return Sentry.startSpan(
    {
      name: 'refreshUserDataAction',
      op: 'function.server_action',
    },
    async () => {
      try {
        // Revalidate all user-related data
        revalidatePath('/dashboard');
        revalidatePath('/history');
        revalidatePath('/playlist-generator');

        return { success: true };
      } catch (error) {
        console.error('Data refresh error:', error);
        Sentry.captureException(error);
        return { success: false, error: 'Failed to refresh data' };
      }
    }
  );
}
