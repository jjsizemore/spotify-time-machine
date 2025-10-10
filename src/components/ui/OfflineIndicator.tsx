'use client';

import { useEffect, useState } from 'react';
import { FiWifi, FiWifiOff } from 'react-icons/fi';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
      // Hide the toast after 5 seconds
      setTimeout(() => setShowOfflineToast(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showOfflineToast) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        !isOnline || showOfflineToast ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border ${
          isOnline
            ? 'bg-spotify-green text-spotify-black border-spotify-green'
            : 'bg-spotify-red text-white border-spotify-red'
        }`}
      >
        {isOnline ? (
          <>
            <FiWifi size={16} />
            <span className="text-sm font-medium">Back online</span>
          </>
        ) : (
          <>
            <FiWifiOff size={16} />
            <span className="text-sm font-medium">You're offline</span>
          </>
        )}
      </div>
    </div>
  );
}
