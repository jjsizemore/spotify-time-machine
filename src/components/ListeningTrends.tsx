'use client';

import React, { useState, useEffect, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useLikedTracks } from '@/hooks/useLikedTracks';
import VisualizationContainer from './VisualizationContainer';
import { getCachedData, setCachedData } from '../lib/cacheUtils';

interface MonthlyData {
  month: string;
  count: number;
}

const CHUNK_SIZE = 250; // Process 250 tracks per chunk
const LISTENING_TRENDS_CACHE_KEY = 'listeningTrendsData';
const LISTENING_TRENDS_CACHE_TTL_MINUTES = 60; // 1 hour TTL

export default function ListeningTrends() {
  const { tracks, isLoading, error } = useLikedTracks();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [maxCount, setMaxCount] = useState(0);
  const [processingData, setProcessingData] = useState(false);

  const isMountedRef = useRef(true);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  // Process data when tracks are loaded
  useEffect(() => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    // Attempt to load from cache first, only if not already loading primary track data
    // and if we don't already have monthlyData (e.g. from a previous run in this session)
    if (!isLoading && monthlyData.length === 0) {
      const cachedTrendsData = getCachedData<MonthlyData[]>(LISTENING_TRENDS_CACHE_KEY);
      if (cachedTrendsData && cachedTrendsData.length > 0) {
        if (isMountedRef.current) {
          setMonthlyData(cachedTrendsData);
          setMaxCount(Math.max(0, ...cachedTrendsData.map((item: MonthlyData) => item.count)));
          setProcessingData(false);
          console.log('ListeningTrends: Loaded data from cache');
          // If we load from cache, we might not need to proceed with full processing below
          // if the underlying 'tracks' haven't changed significantly or if cache is fresh enough.
          // For simplicity, we'll return here. A more advanced setup might compare track count/timestamps.
          return;
        }
      }
    }

    if (isLoading && !tracks.length) {
      setMonthlyData([]);
      setMaxCount(0);
      setProcessingData(false);
      return;
    }

    if (!isLoading && tracks.length === 0) {
      setMonthlyData([]);
      setMaxCount(0);
      setProcessingData(false);
      return;
    }

    // If there are tracks, start or continue processing.
    // isLoading might be true if paginating, but we have some tracks.
    if (tracks.length > 0) {
      // setProcessingData(true); // VisualizationContainer will handle this via isProcessing prop

      // Initialize accumulators for this processing pass
      let currentTracksByMonth: Record<string, number> = {};
      let currentMaxVal = 0;

      const processChunk = (startIndex: number) => {
        if (!isMountedRef.current) return;

        const endIndex = Math.min(startIndex + CHUNK_SIZE, tracks.length);
        for (let i = startIndex; i < endIndex; i++) {
          const item = tracks[i];
          const date = new Date(item.added_at);
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const monthYear = `${date.getFullYear()}-${month}`;

          if (!currentTracksByMonth[monthYear]) {
            currentTracksByMonth[monthYear] = 0;
          }
          currentTracksByMonth[monthYear]++;
        }

        // Convert to array and sort chronologically for current state
        const monthlyDataArray: MonthlyData[] = Object.entries(currentTracksByMonth)
          .map(([month, count]) => ({
            month,
            count
          }))
          .sort((a, b) => a.month.localeCompare(b.month));

        currentMaxVal = Math.max(0, ...monthlyDataArray.map(item => item.count));

        if (isMountedRef.current) {
          setMonthlyData(monthlyDataArray);
          setMaxCount(currentMaxVal);
        }

        if (endIndex < tracks.length) {
          processingTimeoutRef.current = setTimeout(() => processChunk(endIndex), 0);
        } else {
          if (isMountedRef.current) {
            setProcessingData(false);
            // Save to cache once all chunks are processed
            setCachedData(LISTENING_TRENDS_CACHE_KEY, monthlyDataArray, LISTENING_TRENDS_CACHE_TTL_MINUTES);
            console.log('ListeningTrends: Saved processed data to cache');
          }
        }
      };

      // Start processing from the beginning
      // If previous data existed (e.g. from a smaller 'tracks' array),
      // this effectively resets and re-processes with the new 'tracks' array.
      processChunk(0);
    }

    return () => {
      // Cleanup for this effect instance if tracks/isLoading changes mid-process
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [tracks, isLoading]);

  // Determine overall loading state for the container
  // True if hook is loading AND there's no data yet to show (even partially)
  const isOverallLoading = isLoading && monthlyData.length === 0 && !error;

  // Determine if the container should show the processing overlay
  // True if tracks are being processed in chunks AND it's not the initial full load
  const isIncrementallyProcessing = processingData && !isOverallLoading;

  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
  };

  return (
    <VisualizationContainer
      title="Your Listening Trends"
      isLoading={isOverallLoading}
      isProcessing={isIncrementallyProcessing} // Pass the new processing state
      error={error}
      isEmpty={!isOverallLoading && !error && tracks.length > 0 && monthlyData.length === 0 && !processingData}
      emptyDataMessage="No listening data available to visualize after processing."
    >
      {/* Log a few values for debugging the bar heights */}
      {(() => {
        console.log(
          'ListeningTrends Debug:',
          {
            tracksCount: tracks.length,
            isLoading,
            processingData,
            error,
            maxCount,
            monthlyDataSample: monthlyData.slice(0, 5),
            fullMonthlyData: monthlyData // Log full data for more detail
          }
        );
        return null; // Prevent rendering issue
      })()}
      <div className="h-64 flex items-end space-x-2 overflow-x-auto pb-4">
        {monthlyData.map((data) => {
          // const barHeightPercentage = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
          // console.log(`Month: ${data.month}, Count: ${data.count}, Max: ${maxCount}, Height%: ${barHeightPercentage}`);
          return (
            <div key={data.month} className="flex flex-col items-center min-w-[50px]">
              <div
                className="w-8 bg-spotify-green rounded-t-md"
                style={{
                  height: `${(data.count / maxCount) * 100}%`,
                  minHeight: '4px'
                }}
              />
              <div className="text-xs text-spotify-light-gray mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                {formatMonthLabel(data.month)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-sm text-spotify-light-gray mt-8">
        <div>Timeline of songs you've liked</div>
        <div>Total: {monthlyData.reduce((sum, data) => sum + data.count, 0)} tracks</div>
      </div>
    </VisualizationContainer>
  );
}