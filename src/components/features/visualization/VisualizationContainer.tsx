import { Suspense, useEffect, useState } from 'react';
import { clearAllCachesAndRefreshComplete } from '@/lib/cacheUtils';
import LoadingSpinner from '@/ui/LoadingSpinner';

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

function EmptyOrErrorDisplay() {
  const handleClearCache = async () => {
    try {
      await clearAllCachesAndRefreshComplete();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  return (
    <div className="text-center p-6 text-spotify-red">
      <div>
        <p className="mb-2">It seems like this data is corrupt or missing.</p>
        <button
          className="cursor-pointer text-spotify-green hover:text-spotify-light-green transition-colors underline"
          onClick={handleClearCache}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClearCache();
            }
          }}
          tabIndex={0}
          type="button"
        >
          Click or tap here to clear the cache and refresh the page 🙂
        </button>
      </div>
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
}: VisualizationContainerProps) {
  const [showLoading, setShowLoading] = useState(true);
  const [showProcessing, setShowProcessing] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Handle initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialMount(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle loading state
  useEffect(() => {
    let loadingTimer: NodeJS.Timeout;
    if (isLoading || isInitialMount) {
      loadingTimer = setTimeout(() => setShowLoading(true), 0);
    } else {
      loadingTimer = setTimeout(() => {
        setShowLoading(false);
      }, 500);
    }
    return () => clearTimeout(loadingTimer);
  }, [isLoading, isInitialMount]);

  // Handle processing state
  useEffect(() => {
    let processingTimer: NodeJS.Timeout;
    if (isProcessing) {
      processingTimer = setTimeout(() => setShowProcessing(true), 0);
    } else {
      processingTimer = setTimeout(() => {
        setShowProcessing(false);
      }, 300);
    }
    return () => clearTimeout(processingTimer);
  }, [isProcessing]);

  return (
    <div className={`${className} bg-spotify-dark-gray rounded-lg p-6 w-full relative`}>
      <h3 className="text-xl font-bold text-spotify-white mb-6">{title}</h3>

      {showLoading && (
        <div className="h-64 flex flex-col justify-center items-center" role="status">
          <LoadingSpinner size="lg" />
          <p className="text-spotify-light-gray mt-2 text-sm">Loading data...</p>
        </div>
      )}

      {!showLoading && (error || isEmpty) && <EmptyOrErrorDisplay />}

      {!showLoading && !error && !isEmpty && (
        <Suspense
          fallback={
            <div className="h-64 flex flex-col justify-center items-center" role="status">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          {children}
          {showProcessing && (
            <div
              className="absolute inset-0 bg-spotify-dark-gray/90 flex flex-col justify-center items-center rounded-lg z-50"
              role="status"
            >
              <LoadingSpinner size="lg" />
              <p className="text-spotify-light-gray mt-2 text-sm">Processing data...</p>
            </div>
          )}
        </Suspense>
      )}
    </div>
  );
}
