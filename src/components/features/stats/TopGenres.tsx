import { useMemo } from 'react';
import { Artist } from '@/hooks/useUserStats';
import { extractTopGenres } from '@/lib/genreUtils';
import ErrorDisplay from '@/ui/ErrorDisplay';
import LoadingSpinner from '@/ui/LoadingSpinner';

interface TopGenresProps {
  artists: Artist[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function TopGenres({ artists, isLoading, error, onRetry }: TopGenresProps) {
  const topGenres = useMemo(() => {
    return extractTopGenres(artists, 20);
  }, [artists]);

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} retry={onRetry} />;
  }

  if (topGenres.length === 0) {
    return (
      <div className="text-center py-8 text-spotify-medium-gray">
        No genre data available. Try listening to more diverse music!
      </div>
    );
  }

  // Get the maximum count for scaling
  const maxCount = Math.max(...topGenres.map((genre) => genre.count));

  return (
    <div className="space-y-3">
      {topGenres.map((genre) => (
        <div key={genre.name} className="bg-spotify-dark-gray p-3 rounded-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white font-medium capitalize">{genre.name}</span>
            <span className="text-xs text-spotify-light-gray">{genre.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-spotify-medium-gray/30 h-2 rounded-full overflow-hidden">
            <div
              className="bg-spotify-green h-full rounded-full"
              style={{ width: `${(genre.count / maxCount) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
