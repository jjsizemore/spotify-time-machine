interface CachedData<T> {
	timestamp: number;
	data: T;
	ttl: number;
}

// Error types for better error handling
interface CacheError {
	type:
		| 'QUOTA_EXCEEDED'
		| 'PARSE_ERROR'
		| 'STORAGE_ACCESS'
		| 'CORRUPTED_DATA'
		| 'UNKNOWN';
	operation: 'SET' | 'GET' | 'CLEAR';
	key?: string;
	originalError?: Error;
	context?: string;
}

const CACHE_PREFIX = 'spotifyTimeMachineCache_';

function logCacheError(error: CacheError): void {
	const logMessage = [
		`[Cache Error] ${error.type} during ${error.operation}`,
		error.key ? `Key: ${error.key}` : '',
		error.context ? `Context: ${error.context}` : '',
		error.originalError ? `Original: ${error.originalError.message}` : '',
	]
		.filter(Boolean)
		.join(' | ');

	console.error(logMessage, error.originalError);
}

function categorizeStorageError(error: any): CacheError['type'] {
	if (
		error.name === 'QuotaExceededError' ||
		error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
		error.code === 22 ||
		(error.message && error.message.toLowerCase().includes('quota'))
	) {
		return 'QUOTA_EXCEEDED';
	}

	if (error instanceof SyntaxError || error.name === 'SyntaxError') {
		return 'PARSE_ERROR';
	}

	if (
		error.name === 'SecurityError' ||
		error.name === 'InvalidAccessError' ||
		(error.message && error.message.toLowerCase().includes('access'))
	) {
		return 'STORAGE_ACCESS';
	}

	return 'UNKNOWN';
}

function clearOldestCacheEntry(): boolean {
	if (typeof window === 'undefined') {
		logCacheError({
			type: 'STORAGE_ACCESS',
			operation: 'CLEAR',
			context: 'Window undefined - running in non-browser environment',
		});
		return false;
	}

	let oldestKey: string | null = null;
	let oldestTimestamp = Infinity;
	let corruptedItemsCount = 0;

	try {
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith(CACHE_PREFIX)) {
				try {
					const itemString = localStorage.getItem(key);
					if (itemString) {
						const item: CachedData<unknown> = JSON.parse(itemString);

						// Validate the parsed item structure
						if (!item.timestamp || !item.ttl || item.data === undefined) {
							throw new Error('Invalid cache item structure');
						}

						if (item.timestamp < oldestTimestamp) {
							oldestTimestamp = item.timestamp;
							oldestKey = key;
						}
					}
				} catch (parseError: any) {
					corruptedItemsCount++;
					logCacheError({
						type: 'CORRUPTED_DATA',
						operation: 'CLEAR',
						key,
						originalError: parseError,
						context: 'Found corrupted cache item during cleanup',
					});

					try {
						localStorage.removeItem(key);
					} catch (removeError: any) {
						logCacheError({
							type: 'STORAGE_ACCESS',
							operation: 'CLEAR',
							key,
							originalError: removeError,
							context: 'Failed to remove corrupted cache item',
						});
					}
				}
			}
		}

		if (corruptedItemsCount > 0) {
			console.warn(`Cleaned up ${corruptedItemsCount} corrupted cache items`);
		}

		if (oldestKey) {
			try {
				localStorage.removeItem(oldestKey);
				console.info(
					`Cache cleanup: Removed oldest item (${oldestKey.replace(CACHE_PREFIX, '')}) from ${new Date(oldestTimestamp).toLocaleString()}`
				);
				return true;
			} catch (removeError: any) {
				logCacheError({
					type: 'STORAGE_ACCESS',
					operation: 'CLEAR',
					key: oldestKey,
					originalError: removeError,
					context: 'Failed to remove oldest cache item',
				});
				return false;
			}
		}

		console.warn(
			'Cache cleanup requested but no cache entries found to remove'
		);
		return false;
	} catch (error: any) {
		logCacheError({
			type: categorizeStorageError(error),
			operation: 'CLEAR',
			originalError: error,
			context: 'Error during cache cleanup process',
		});
		return false;
	}
}

export function setCachedData<T>(
	key: string,
	data: T,
	ttlMinutes: number
): void {
	if (typeof window === 'undefined') {
		logCacheError({
			type: 'STORAGE_ACCESS',
			operation: 'SET',
			key,
			context: 'Window undefined - running in non-browser environment',
		});
		return;
	}

	if (!key || ttlMinutes <= 0) {
		logCacheError({
			type: 'UNKNOWN',
			operation: 'SET',
			key,
			context: `Invalid parameters - key: ${key}, ttlMinutes: ${ttlMinutes}`,
		});
		return;
	}

	const timestamp = new Date().getTime();
	const item: CachedData<T> = {
		timestamp,
		data,
		ttl: ttlMinutes * 60 * 1000, // Convert minutes to milliseconds
	};

	const cacheKey = CACHE_PREFIX + key;
	const itemString = JSON.stringify(item);
	const itemSizeKB = Math.round(new Blob([itemString]).size / 1024);

	const attemptSetItem = () => {
		localStorage.setItem(cacheKey, itemString);
	};

	try {
		attemptSetItem();
		console.debug(`Cache set: ${key} (${itemSizeKB}KB, TTL: ${ttlMinutes}min)`);
	} catch (error: any) {
		const errorType = categorizeStorageError(error);

		logCacheError({
			type: errorType,
			operation: 'SET',
			key,
			originalError: error,
			context: `Initial attempt failed - item size: ${itemSizeKB}KB`,
		});

		if (errorType === 'QUOTA_EXCEEDED') {
			console.warn(
				`LocalStorage quota exceeded while trying to cache ${key} (${itemSizeKB}KB). Attempting recovery...`
			);

			if (clearOldestCacheEntry()) {
				try {
					console.info(`Retrying cache set for ${key} after clearing space...`);
					attemptSetItem();
					console.info(`Successfully cached ${key} after cleanup`);
				} catch (retryError: any) {
					logCacheError({
						type: categorizeStorageError(retryError),
						operation: 'SET',
						key,
						originalError: retryError,
						context: `Retry failed after clearing space - item size: ${itemSizeKB}KB`,
					});
				}
			} else {
				logCacheError({
					type: 'QUOTA_EXCEEDED',
					operation: 'SET',
					key,
					context: `No cache entries available to clear. Item size: ${itemSizeKB}KB may be too large`,
				});
			}
		}
	}
}

export function getCachedData<T>(key: string): T | null {
	if (typeof window === 'undefined') {
		logCacheError({
			type: 'STORAGE_ACCESS',
			operation: 'GET',
			key,
			context: 'Window undefined - running in non-browser environment',
		});
		return null;
	}

	if (!key) {
		logCacheError({
			type: 'UNKNOWN',
			operation: 'GET',
			key,
			context: 'Invalid key provided',
		});
		return null;
	}

	const cacheKey = CACHE_PREFIX + key;

	try {
		const cachedItem = localStorage.getItem(cacheKey);
		if (!cachedItem) {
			console.debug(`Cache miss: ${key} - no data found`);
			return null;
		}

		let item: CachedData<T>;
		try {
			item = JSON.parse(cachedItem);
		} catch (parseError: any) {
			logCacheError({
				type: 'PARSE_ERROR',
				operation: 'GET',
				key,
				originalError: parseError,
				context: 'Failed to parse cached JSON data',
			});

			// Remove corrupted item
			try {
				localStorage.removeItem(cacheKey);
				console.info(`Removed corrupted cache item: ${key}`);
			} catch (removeError: any) {
				logCacheError({
					type: 'STORAGE_ACCESS',
					operation: 'GET',
					key,
					originalError: removeError,
					context: 'Failed to remove corrupted cache item',
				});
			}
			return null;
		}

		// Validate cache item structure
		if (!item.timestamp || !item.ttl || item.data === undefined) {
			logCacheError({
				type: 'CORRUPTED_DATA',
				operation: 'GET',
				key,
				context: 'Cache item missing required properties',
			});

			try {
				localStorage.removeItem(cacheKey);
				console.info(`Removed malformed cache item: ${key}`);
			} catch (removeError: any) {
				logCacheError({
					type: 'STORAGE_ACCESS',
					operation: 'GET',
					key,
					originalError: removeError,
					context: 'Failed to remove malformed cache item',
				});
			}
			return null;
		}

		const now = new Date().getTime();
		const age = now - item.timestamp;

		if (age > item.ttl) {
			console.debug(
				`Cache expired: ${key} - age: ${Math.round(age / 1000)}s, TTL: ${Math.round(item.ttl / 1000)}s`
			);
			try {
				localStorage.removeItem(cacheKey);
			} catch (removeError: any) {
				logCacheError({
					type: 'STORAGE_ACCESS',
					operation: 'GET',
					key,
					originalError: removeError,
					context: 'Failed to remove expired cache item',
				});
			}
			return null;
		}

		console.debug(
			`Cache hit: ${key} - age: ${Math.round(age / 1000)}s, remaining: ${Math.round((item.ttl - age) / 1000)}s`
		);
		return item.data;
	} catch (error: any) {
		logCacheError({
			type: categorizeStorageError(error),
			operation: 'GET',
			key,
			originalError: error,
			context: 'Unexpected error during cache retrieval',
		});

		// Attempt to remove the problematic item
		try {
			localStorage.removeItem(cacheKey);
			console.info(`Removed problematic cache item: ${key}`);
		} catch (removeError: any) {
			logCacheError({
				type: 'STORAGE_ACCESS',
				operation: 'GET',
				key,
				originalError: removeError,
				context: 'Failed to remove problematic cache item',
			});
		}

		return null;
	}
}
