'use client';

import React, { useState, useEffect } from 'react';
import { getStorageInfo, logStorageInfo, requestPersistentStorage } from '@/lib/cacheUtils';

interface StorageInfo {
  quota: number;
  usage: number;
  available: number;
  percentUsed: number;
  canStoreMoreData: boolean;
}

export default function StorageMonitor() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [isPersistent, setIsPersistent] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const refreshStorageInfo = async () => {
    setIsLoading(true);
    try {
      const info = await getStorageInfo();
      setStorageInfo(info);

      // Check if storage is already persistent
      if ('storage' in navigator && 'persisted' in navigator.storage) {
        const persistent = await navigator.storage.persisted();
        setIsPersistent(persistent);
      }
    } catch (error) {
      console.error('Failed to get storage info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPersistent = async () => {
    // Note: Chrome auto-grants persistent storage for frequently visited sites
    // This is mainly useful for Firefox users or low-engagement scenarios
    const granted = await requestPersistentStorage();
    setIsPersistent(granted);
  };

  useEffect(() => {
    refreshStorageInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-spotify-gray rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-spotify-light-gray rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-spotify-light-gray rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!storageInfo) {
    return (
      <div className="bg-spotify-gray rounded-lg p-4">
        <p className="text-spotify-light-gray">Storage information unavailable</p>
      </div>
    );
  }

  const getStatusColor = (percentUsed: number) => {
    if (percentUsed < 50) return 'text-green-400';
    if (percentUsed < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (percentUsed: number) => {
    if (percentUsed < 50) return 'bg-green-500';
    if (percentUsed < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-spotify-gray rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-spotify-white">Storage Usage</h3>
        <button
          onClick={refreshStorageInfo}
          className="text-sm text-spotify-green hover:text-spotify-green-light transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Usage Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-spotify-light-gray">
            {formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}
          </span>
          <span className={getStatusColor(storageInfo.percentUsed)}>
            {storageInfo.percentUsed.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-spotify-dark-gray rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(storageInfo.percentUsed)}`}
            style={{ width: `${Math.min(storageInfo.percentUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Storage Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-spotify-light-gray">Available:</span>
          <span className="text-spotify-white ml-2">{formatBytes(storageInfo.available)}</span>
        </div>
        <div>
          <span className="text-spotify-light-gray">Can Store More:</span>
          <span
            className={`ml-2 ${storageInfo.canStoreMoreData ? 'text-green-400' : 'text-red-400'}`}
          >
            {storageInfo.canStoreMoreData ? '✅ Yes' : '❌ No'}
          </span>
        </div>
      </div>

      {/* Persistent Storage */}
      <div className="border-t border-spotify-dark-gray pt-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-spotify-light-gray text-sm">Persistent Storage:</span>
            <span className={`ml-2 text-sm ${isPersistent ? 'text-green-400' : 'text-yellow-400'}`}>
              {isPersistent === null
                ? '⏳ Checking...'
                : isPersistent
                  ? '✅ Enabled'
                  : '⚠️ Not Enabled'}
            </span>
          </div>
          {isPersistent === false && (
            <button
              onClick={handleRequestPersistent}
              className="text-xs bg-spotify-green hover:bg-spotify-green-light text-black px-3 py-1 rounded-full transition-colors"
            >
              Request
            </button>
          )}
        </div>
        {isPersistent === false && (
          <p className="text-xs text-spotify-light-gray mt-2">
            Enable persistent storage to prevent your data from being cleared automatically.
          </p>
        )}
      </div>

      {/* Debug Button */}
      <div className="border-t border-spotify-dark-gray pt-4">
        <button
          onClick={logStorageInfo}
          className="text-xs text-spotify-light-gray hover:text-spotify-white transition-colors"
        >
          🔍 Log Storage Details to Console
        </button>
      </div>
    </div>
  );
}
