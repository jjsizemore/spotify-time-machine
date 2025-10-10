// Spotify API time ranges
export type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term';

// Internal time ranges for visualizations
export type InternalTimeRange = 'PAST_YEAR' | 'PAST_TWO_YEARS' | 'ALL_TIME';

// Time range display configuration
export interface TimeRangeDisplay {
  value: SpotifyTimeRange;
  label: string;
}

// Different display configurations for different components
export const timeRangeDisplays = {
  spotify: [
    { value: 'short_term', label: 'Last 4 Weeks' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' },
  ] as TimeRangeDisplay[],
  visualization: [
    { value: 'short_term', label: 'Past Year' },
    { value: 'medium_term', label: 'Past 2 Years' },
    { value: 'long_term', label: 'All Time' },
  ] as TimeRangeDisplay[],
};

// Map Spotify API time ranges to internal time ranges
export const mapToInternalTimeRange = (range: SpotifyTimeRange): InternalTimeRange => {
  switch (range) {
    case 'short_term':
      return 'PAST_YEAR';
    case 'medium_term':
      return 'PAST_TWO_YEARS';
    case 'long_term':
      return 'ALL_TIME';
  }
};

// Map internal time ranges to Spotify API time ranges
export const mapToSpotifyTimeRange = (range: InternalTimeRange): SpotifyTimeRange => {
  switch (range) {
    case 'PAST_YEAR':
      return 'short_term';
    case 'PAST_TWO_YEARS':
      return 'medium_term';
    case 'ALL_TIME':
      return 'long_term';
  }
};
