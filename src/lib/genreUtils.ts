import { Artist } from '@/hooks/useUserStats';

export interface GenreCount {
  name: string;
  count: number;
  percentage: number;
}

export function extractTopGenres(artists: Artist[], limit: number = 10): GenreCount[] {
  // Count genre occurrences
  const genreCounts: Record<string, number> = {};
  let totalGenres = 0;

  artists.forEach((artist) => {
    artist.genres.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      totalGenres++;
    });
  });

  // Convert to array and sort by count
  const genreArray: GenreCount[] = Object.keys(genreCounts).map((name) => ({
    name,
    count: genreCounts[name],
    percentage: (genreCounts[name] / totalGenres) * 100,
  }));

  // Sort by count (descending) and take top N
  return genreArray.toSorted((a, b) => b.count - a.count).slice(0, limit);
}
