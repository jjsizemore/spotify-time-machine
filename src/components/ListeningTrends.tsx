'use client';

import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useLikedTracks } from '@/hooks/useLikedTracks';

interface MonthlyData {
  month: string;
  count: number;
}

export default function ListeningTrends() {
  const { tracks, isLoading, error } = useLikedTracks();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [maxCount, setMaxCount] = useState(0);
  const [processingData, setProcessingData] = useState(false);

  // Process data when tracks are loaded
  useEffect(() => {
    if (isLoading || tracks.length === 0) return;

    setProcessingData(true);

    try {
      // Group tracks by month
      const tracksByMonth: Record<string, number> = {};

      tracks.forEach(item => {
        const date = new Date(item.added_at);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;

        if (!tracksByMonth[monthYear]) {
          tracksByMonth[monthYear] = 0;
        }

        tracksByMonth[monthYear]++;
      });

      // Convert to array and sort chronologically
      const monthlyDataArray: MonthlyData[] = Object.entries(tracksByMonth).map(([month, count]) => ({
        month,
        count
      })).sort((a, b) => a.month.localeCompare(b.month));

      // Get the highest count for scaling
      const maxVal = Math.max(...monthlyDataArray.map(item => item.count));

      setMaxCount(maxVal);
      setMonthlyData(monthlyDataArray);
    } catch (err) {
      console.error('Error processing listening history data:', err);
    } finally {
      setProcessingData(false);
    }
  }, [tracks, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-spotify-dark-gray rounded-lg p-6 text-center text-spotify-light-gray">
        <p>{error}</p>
      </div>
    );
  }

  if (processingData) {
    return (
      <div className="bg-spotify-dark-gray rounded-lg p-6">
        <h3 className="text-xl font-bold text-spotify-white mb-6">Your Listening Trends</h3>
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
          <span className="ml-3 text-spotify-light-gray">Processing data...</span>
        </div>
      </div>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <div className="bg-spotify-dark-gray rounded-lg p-6 text-center text-spotify-light-gray">
        <p>No listening data available to visualize.</p>
      </div>
    );
  }

  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
  };

  return (
    <div className="bg-spotify-dark-gray rounded-lg p-6">
      <h3 className="text-xl font-bold text-spotify-white mb-6">Your Listening Trends</h3>

      <div className="h-64 flex items-end space-x-2 overflow-x-auto pb-4">
        {monthlyData.map((data) => (
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
        ))}
      </div>

      <div className="flex justify-between text-sm text-spotify-light-gray mt-8">
        <div>Timeline of songs you've liked</div>
        <div>Total: {monthlyData.reduce((sum, data) => sum + data.count, 0)} tracks</div>
      </div>
    </div>
  );
}