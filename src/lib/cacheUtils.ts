interface CachedData<T> {
  timestamp: number;
  data: T;
  ttl: number;
}

const CACHE_PREFIX = 'spotifyTimeMachineCache_';

function clearOldestCacheEntry(): boolean {
  if (typeof window === 'undefined') return false;

  let oldestKey: string | null = null;
  let oldestTimestamp = Infinity;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      try {
        const itemString = localStorage.getItem(key);
        if (itemString) {
          const item: CachedData<unknown> = JSON.parse(itemString);
          if (item.timestamp < oldestTimestamp) {
            oldestTimestamp = item.timestamp;
            oldestKey = key;
          }
        }
      } catch (_e) {
        // Corrupted item, potentially remove it
        localStorage.removeItem(key);
      }
    }
  }

  if (oldestKey) {
    localStorage.removeItem(oldestKey);
    console.warn(`Cache full: Removed oldest item (${oldestKey}) to make space.`);
    return true;
  }
  return false;
}

export function setCachedData<T>(key: string, data: T, ttlMinutes: number): void {
  if (typeof window === 'undefined') return; // Ensure localStorage is available

  const timestamp = new Date().getTime();
  const item: CachedData<T> = {
    timestamp,
    data,
    ttl: ttlMinutes * 60 * 1000, // Convert minutes to milliseconds
  };

  const attemptSetItem = () => {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  };

  try {
    attemptSetItem();
  } catch (error: any) {
    console.warn('Initial error saving to localStorage:', error.name, error.message);
    // Check for QuotaExceededError (name can vary by browser)
    if (error.name === 'QuotaExceededError' || // Standard
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || // Firefox
        error.code === 22 || // Generic DOMException code for quota exceeded
        (error.message && error.message.toLowerCase().includes('quota'))
    ) {
      console.warn('LocalStorage quota exceeded. Attempting to clear oldest entry...');
      if (clearOldestCacheEntry()) {
        try {
          console.log('Retrying to set item after clearing space...');
          attemptSetItem();
          console.log('Successfully set item after clearing space.');
        } catch (retryError: any) {
          console.error(
            'Error saving to localStorage even after clearing an old entry. The current item might be too large or cache is still full:',
            retryError.name,
            retryError.message
          );
        }
      } else {
        console.error(
          'LocalStorage quota exceeded, but no old cache entries found to clear. The current item might be too large.'
        );
      }
    } else {
      // Some other error not related to quota
      console.error('Error saving to localStorage (not quota related):', error);
    }
  }
}

export function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null; // Ensure localStorage is available

  try {
    const cachedItem = localStorage.getItem(CACHE_PREFIX + key);
    if (!cachedItem) {
      return null;
    }

    const item: CachedData<T> = JSON.parse(cachedItem);
    const now = new Date().getTime();

    if (now - item.timestamp > item.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key); // Cache expired
      return null;
    }

    return item.data;
  } catch (error) {
    console.error('Error reading from localStorage', error);
    localStorage.removeItem(CACHE_PREFIX + key); // Remove corrupted item
    return null;
  }
}