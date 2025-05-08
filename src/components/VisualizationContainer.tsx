import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner'; // Assuming LoadingSpinner is available

type VisualizationContainerProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  isProcessing?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyDataMessage?: string;
};

function VisualizationSkeleton() {
  return (
    <div className="bg-spotify-dark-gray rounded-lg p-6 animate-pulse w-full">
      <div className="h-7 w-3/4 sm:w-1/2 bg-spotify-medium-gray/50 rounded mb-6"></div> {/* Adjusted for title */}
      <div className="h-64 bg-spotify-medium-gray/30 rounded"></div> {/* Placeholder for chart area */}
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="text-center p-6 text-spotify-red">
      <p>{message}</p>
    </div>
  );
}

function EmptyDataDisplay({ message }: { message: string }) {
  return (
    <div className="text-center p-12 text-spotify-light-gray">
      <p>{message}</p>
    </div>
  );
}

export default function VisualizationContainer({
  title,
  children,
  className = 'mb-8',
  isLoading = false,
  isProcessing = false,
  error = null,
  isEmpty = false,
  emptyDataMessage = 'No data available to display.'
}: VisualizationContainerProps) {
  return (
    <div className={`${className} bg-spotify-dark-gray rounded-lg p-6 w-full relative`}>
      <h3 className="text-xl font-bold text-spotify-white mb-6">{title}</h3>

      {isLoading && <VisualizationSkeleton />}

      {!isLoading && error && <ErrorDisplay message={error} />}

      {!isLoading && !error && isEmpty && <EmptyDataDisplay message={emptyDataMessage} />}

      {!isLoading && !error && !isEmpty && (
        <Suspense fallback={<div className="h-64 flex justify-center items-center"><LoadingSpinner size="lg" /></div>}>
          {children}
          {isProcessing && (
            <div className="absolute inset-0 bg-spotify-dark-gray/50 flex flex-col justify-center items-center rounded-lg z-10">
              <LoadingSpinner size="md" />
              <p className="text-spotify-light-gray mt-2 text-sm">Processing data...</p>
            </div>
          )}
        </Suspense>
      )}
    </div>
  );
}