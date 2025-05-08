'use client';

import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useLikedTracks } from '@/hooks/useLikedTracks';

interface GenreTimeData {
  genre: string;
  period: string; // Format: 'YYYY-Q1', 'YYYY-Q2', etc.
  count: number;
}

type TimeFilter = '1year' | '2years' | 'all';

export default function GenreTrendsVisualization() {
  const { tracks, isLoading, isLoadingArtists, error, artistsDetails } = useLikedTracks();
  const [genreData, setGenreData] = useState<GenreTimeData[]>([]);
  const [topGenres, setTopGenres] = useState<string[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [processingData, setProcessingData] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1year');

  // Color palette for genres
  const colorPalette = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];

  // Process the genre data once we have tracks and artist details
  useEffect(() => {
    // Skip if still loading initial data or if artist details aren't ready yet
    if (isLoading || isLoadingArtists || tracks.length === 0 || artistsDetails.size === 0) {
      return;
    }

    setProcessingData(true);

    try {
      // Filter tracks based on timeFilter
      const filteredTracks = filterTracksByTime(tracks, timeFilter);

      // Group tracks by quarter
      const genresByQuarter: Record<string, Record<string, number>> = {};

      filteredTracks.forEach(item => {
        const date = new Date(item.added_at);
        const year = date.getFullYear();
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const periodKey = `${year}-Q${quarter}`;

        if (!genresByQuarter[periodKey]) {
          genresByQuarter[periodKey] = {};
        }

        // Count genres for each track's artists
        item.track.artists.forEach((artist: { id: string }) => {
          const artistDetail = artistsDetails.get(artist.id);
          if (!artistDetail) return;

          const genres: string[] = artistDetail.genres || [];
          genres.forEach((genre: string) => {
            if (!genresByQuarter[periodKey][genre]) {
              genresByQuarter[periodKey][genre] = 0;
            }
            genresByQuarter[periodKey][genre]++;
          });
        });
      });

      // Convert to array format
      const genreTimeData: GenreTimeData[] = [];
      for (const period in genresByQuarter) {
        for (const genre in genresByQuarter[period]) {
          genreTimeData.push({
            period,
            genre,
            count: genresByQuarter[period][genre]
          });
        }
      }

      // Get top genres overall
      const genreCounts: Record<string, number> = {};
      genreTimeData.forEach(item => {
        if (!genreCounts[item.genre]) {
          genreCounts[item.genre] = 0;
        }
        genreCounts[item.genre] += item.count;
      });

      const sortedGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0])
        .slice(0, 8); // Take top 8 genres

      // Get unique periods and sort them chronologically
      const uniquePeriods = [...new Set(genreTimeData.map(item => item.period))].sort();

      setTopGenres(sortedGenres);
      setPeriods(uniquePeriods);
      setGenreData(genreTimeData);
    } catch (err) {
      console.error('Error processing genre trends data:', err);
    } finally {
      setProcessingData(false);
    }
  }, [tracks, artistsDetails, isLoading, isLoadingArtists, timeFilter]);

  // Filter tracks based on time selection
  const filterTracksByTime = (tracks: any[], filter: TimeFilter) => {
    if (filter === 'all') return tracks;

    const now = new Date();
    const cutoffDate = new Date();

    if (filter === '1year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    } else if (filter === '2years') {
      cutoffDate.setFullYear(now.getFullYear() - 2);
    }

    return tracks.filter(item => new Date(item.added_at) >= cutoffDate);
  };

  // Show main loading state for initial data fetch
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error if any
  if (error) {
    return (
      <div className="bg-spotify-dark-gray rounded-lg p-6 text-center text-spotify-light-gray">
        <p>{error}</p>
      </div>
    );
  }

  // Show loading state while waiting for artist details
  if (isLoadingArtists || processingData) {
    return (
      <div className="bg-spotify-dark-gray rounded-lg p-6">
        <h3 className="text-xl font-bold text-spotify-white mb-6">Your Genre Evolution</h3>
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
          <span className="ml-3 text-spotify-light-gray">
            {isLoadingArtists ? 'Loading artist data...' : 'Processing genre trends...'}
          </span>
        </div>
      </div>
    );
  }

  // Show message if no data
  if (genreData.length === 0 || topGenres.length === 0) {
    return (
      <div className="bg-spotify-dark-gray rounded-lg p-6 text-center text-spotify-light-gray">
        <p>Not enough listening data to visualize genre trends.</p>
      </div>
    );
  }

  return (
    <div className="bg-spotify-dark-gray rounded-lg p-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-spotify-white">Your Genre Evolution</h3>

        <div className="flex space-x-2 text-sm mt-2 md:mt-0">
          <button
            onClick={() => setTimeFilter('1year')}
            className={`px-3 py-1 rounded-full ${timeFilter === '1year'
              ? 'bg-spotify-green text-black'
              : 'bg-spotify-light-black text-spotify-light-gray'}`}
          >
            Past Year
          </button>
          <button
            onClick={() => setTimeFilter('2years')}
            className={`px-3 py-1 rounded-full ${timeFilter === '2years'
              ? 'bg-spotify-green text-black'
              : 'bg-spotify-light-black text-spotify-light-gray'}`}
          >
            Past 2 Years
          </button>
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-3 py-1 rounded-full ${timeFilter === 'all'
              ? 'bg-spotify-green text-black'
              : 'bg-spotify-light-black text-spotify-light-gray'}`}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[600px]">
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-6">
            {topGenres.map((genre, index) => (
              <div key={genre} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${colorPalette[index % colorPalette.length]}`}></div>
                <span className="text-xs text-spotify-light-gray capitalize">{genre}</span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="space-y-4">
            {periods.map(period => {
              // Calculate total count for this period to determine percentages
              const periodTotal = topGenres.reduce((sum, genre) => {
                const entry = genreData.find(d => d.period === period && d.genre === genre);
                return sum + (entry?.count || 0);
              }, 0);

              return (
                <div key={period} className="flex items-center">
                  <div className="w-16 flex-shrink-0 text-xs text-spotify-light-gray">{period}</div>
                  <div className="flex-grow h-8 flex rounded-full overflow-hidden">
                    {topGenres.map((genre, index) => {
                      const entry = genreData.find(d => d.period === period && d.genre === genre);
                      const count = entry?.count || 0;
                      const percentage = (count / periodTotal) * 100;

                      return percentage > 0 ? (
                        <div
                          key={genre}
                          className={`h-full ${colorPalette[index % colorPalette.length]}`}
                          style={{ width: `${percentage}%` }}
                          title={`${genre}: ${Math.round(percentage)}%`}
                        ></div>
                      ) : null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-sm text-spotify-light-gray mt-6">
        This visualization shows how your genre preferences have changed over time by quarter.
        {timeFilter !== 'all' && ' Adjust the time range to see more data.'}
      </p>
    </div>
  );
}