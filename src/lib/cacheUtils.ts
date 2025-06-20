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

// Compression utilities for more efficient storage
async function compressData(data: any): Promise<string> {
	try {
		const jsonString = JSON.stringify(data);
		const uint8Array = new TextEncoder().encode(jsonString);

		// Try native browser compression first (supported in modern browsers)
		if (typeof CompressionStream !== 'undefined') {
			const compressionStream = new CompressionStream('gzip');
			const writer = compressionStream.writable.getWriter();
			const reader = compressionStream.readable.getReader();

			// Write data to compression stream
			await writer.write(uint8Array);
			await writer.close();

			// Read compressed chunks
			const chunks: Uint8Array[] = [];
			let done = false;
			while (!done) {
				const { value, done: readerDone } = await reader.read();
				done = readerDone;
				if (value) {
					chunks.push(value);
				}
			}

			// Combine chunks and convert to base64
			const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
			const combined = new Uint8Array(totalLength);
			let offset = 0;
			for (const chunk of chunks) {
				combined.set(chunk, offset);
				offset += chunk.length;
			}

			// Convert to base64 for storage
			const base64 = btoa(String.fromCharCode(...combined));
			return base64;
		} else {
			// Fallback to fflate for older browsers
			const { gzipSync } = await import('fflate');
			const compressed = gzipSync(uint8Array);
			const base64 = btoa(String.fromCharCode(...compressed));
			return base64;
		}
	} catch (error) {
		console.warn('Failed to compress data, using uncompressed format:', error);
		return JSON.stringify(data);
	}
}

async function decompressData<T>(compressedData: string): Promise<T | null> {
	try {
		// Check if this looks like base64 compressed data
		if (compressedData.startsWith('{') || compressedData.startsWith('[')) {
			// This is uncompressed JSON, parse directly
			return JSON.parse(compressedData);
		}

		// Decode base64 to Uint8Array
		const binaryString = atob(compressedData);
		const compressed = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			compressed[i] = binaryString.charCodeAt(i);
		}

		// Try native browser decompression first
		if (typeof DecompressionStream !== 'undefined') {
			const decompressionStream = new DecompressionStream('gzip');
			const writer = decompressionStream.writable.getWriter();
			const reader = decompressionStream.readable.getReader();

			// Write compressed data to decompression stream
			await writer.write(compressed);
			await writer.close();

			// Read decompressed chunks
			const chunks: Uint8Array[] = [];
			let done = false;
			while (!done) {
				const { value, done: readerDone } = await reader.read();
				done = readerDone;
				if (value) {
					chunks.push(value);
				}
			}

			// Combine chunks and convert to string
			const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
			const combined = new Uint8Array(totalLength);
			let offset = 0;
			for (const chunk of chunks) {
				combined.set(chunk, offset);
				offset += chunk.length;
			}

			const jsonString = new TextDecoder().decode(combined);
			return JSON.parse(jsonString);
		} else {
			// Fallback to fflate for older browsers
			const { gunzipSync } = await import('fflate');
			const decompressed = gunzipSync(compressed);
			const jsonString = new TextDecoder().decode(decompressed);
			return JSON.parse(jsonString);
		}
	} catch (_error) {
		// If decompression fails, try parsing as uncompressed JSON
		try {
			return JSON.parse(compressedData);
		} catch (parseError) {
			console.error('Failed to decompress/parse data:', parseError);
			return null;
		}
	}
}

// Enhanced cache entry with compression support
interface CompressedCachedData {
	timestamp: number;
	data: string; // Compressed data
	ttl: number;
	compressed: boolean;
	originalSize?: number;
	compressedSize?: number;
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

export async function setCachedDataCompressed<T>(
	key: string,
	data: T,
	ttlMinutes: number,
	useCompression: boolean = true
): Promise<void> {
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
	let compressedData: string;
	let originalSize = 0;
	let compressedSize = 0;
	let compressed = false;

	if (useCompression) {
		const originalString = JSON.stringify(data);
		originalSize = new Blob([originalString]).size;
		compressedData = await compressData(data);
		compressedSize = new Blob([compressedData]).size;
		compressed = true;

		// Only use compression if it actually saves space
		if (compressedSize >= originalSize * 0.9) {
			compressedData = originalString;
			compressed = false;
			console.debug(
				`Compression not beneficial for ${key}, using uncompressed`
			);
		}
	} else {
		compressedData = JSON.stringify(data);
	}

	const item: CompressedCachedData = {
		timestamp,
		data: compressedData,
		ttl: ttlMinutes * 60 * 1000,
		compressed,
		originalSize: useCompression ? originalSize : undefined,
		compressedSize: useCompression ? compressedSize : undefined,
	};

	const cacheKey = CACHE_PREFIX + key;
	const itemString = JSON.stringify(item);
	const itemSizeKB = Math.round(new Blob([itemString]).size / 1024);

	const attemptSetItem = () => {
		localStorage.setItem(cacheKey, itemString);
	};

	try {
		attemptSetItem();
		if (useCompression && compressed && originalSize && compressedSize) {
			const savings = Math.round((1 - compressedSize / originalSize) * 100);
			console.debug(
				`Cache set: ${key} (${itemSizeKB}KB, TTL: ${ttlMinutes}min, ${savings}% compression)`
			);
		} else {
			console.debug(
				`Cache set: ${key} (${itemSizeKB}KB, TTL: ${ttlMinutes}min)`
			);
		}
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

export async function getCachedDataCompressed<T>(
	key: string
): Promise<T | null> {
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

		let item: CompressedCachedData;
		try {
			item = JSON.parse(cachedItem);
		} catch (parseError: any) {
			// Note: Legacy format fallback removed for now to avoid circular dependency

			logCacheError({
				type: 'PARSE_ERROR',
				operation: 'GET',
				key,
				originalError: parseError,
				context: 'Failed to parse cached JSON data',
			});

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

		// Decompress data if needed
		const decompressedData = item.compressed
			? await decompressData<T>(item.data)
			: JSON.parse(item.data);

		if (decompressedData === null) {
			// Remove corrupted compressed data
			try {
				localStorage.removeItem(cacheKey);
				console.info(`Removed corrupted compressed cache item: ${key}`);
			} catch (removeError: any) {
				logCacheError({
					type: 'STORAGE_ACCESS',
					operation: 'GET',
					key,
					originalError: removeError,
					context: 'Failed to remove corrupted compressed cache item',
				});
			}
			return null;
		}

		console.debug(
			`Cache hit: ${key} - age: ${Math.round(age / 1000)}s, remaining: ${Math.round((item.ttl - age) / 1000)}s${item.compressed ? ' (compressed)' : ''}`
		);
		return decompressedData;
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

/**
 * Clears all cached data for the Spotify Time Machine application
 * This includes both regular cache and compressed cache data
 * @returns number of cache items removed
 */
export function clearAllCache(): number {
	if (typeof window === 'undefined') {
		logCacheError({
			type: 'STORAGE_ACCESS',
			operation: 'CLEAR',
			context: 'Window undefined - running in non-browser environment',
		});
		return 0;
	}

	let removedCount = 0;
	const keysToRemove: string[] = [];

	try {
		// Collect all cache keys first to avoid modifying storage while iterating
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith(CACHE_PREFIX)) {
				keysToRemove.push(key);
			}
		}

		// Remove all cache items
		for (const key of keysToRemove) {
			try {
				localStorage.removeItem(key);
				removedCount++;
				console.debug(`Removed cache item: ${key.replace(CACHE_PREFIX, '')}`);
			} catch (removeError: any) {
				logCacheError({
					type: 'STORAGE_ACCESS',
					operation: 'CLEAR',
					key,
					originalError: removeError,
					context: 'Failed to remove cache item during clear all operation',
				});
			}
		}

		console.info(`Cache cleared: Removed ${removedCount} cache items`);
		return removedCount;
	} catch (error: any) {
		logCacheError({
			type: categorizeStorageError(error),
			operation: 'CLEAR',
			originalError: error,
			context: 'Error during clear all cache operation',
		});
		return removedCount;
	}
}

// Add IndexedDB support for large datasets
interface IndexedDBStorage {
	open(): Promise<IDBDatabase>;
	set<T>(key: string, data: T, ttlMinutes: number): Promise<void>;
	get<T>(key: string): Promise<T | null>;
	clear(): Promise<void>;
}

class IndexedDBCacheStorage implements IndexedDBStorage {
	private dbName = 'SpotifyTimeMachineCache';
	private version = 1;
	private storeName = 'cache';

	async open(): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.version);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				if (!db.objectStoreNames.contains(this.storeName)) {
					const store = db.createObjectStore(this.storeName, {
						keyPath: 'key',
					});
					store.createIndex('timestamp', 'timestamp', { unique: false });
				}
			};
		});
	}

	async set<T>(key: string, data: T, ttlMinutes: number): Promise<void> {
		try {
			const db = await this.open();
			const timestamp = Date.now();
			const item = {
				key: CACHE_PREFIX + key,
				data,
				timestamp,
				ttl: ttlMinutes * 60 * 1000,
			};

			const transaction = db.transaction([this.storeName], 'readwrite');
			const store = transaction.objectStore(this.storeName);

			await new Promise<void>((resolve, reject) => {
				const request = store.put(item);
				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			});

			console.debug(`IndexedDB cache set: ${key} (TTL: ${ttlMinutes}min)`);
		} catch (error: any) {
			console.error('IndexedDB cache set error:', error);
			throw error;
		}
	}

	async get<T>(key: string): Promise<T | null> {
		try {
			const db = await this.open();
			const transaction = db.transaction([this.storeName], 'readonly');
			const store = transaction.objectStore(this.storeName);

			const item = await new Promise<any>((resolve, reject) => {
				const request = store.get(CACHE_PREFIX + key);
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			});

			if (!item) {
				console.debug(`IndexedDB cache miss: ${key} - no data found`);
				return null;
			}

			const now = Date.now();
			const age = now - item.timestamp;

			if (age > item.ttl) {
				console.debug(`IndexedDB cache expired: ${key}`);
				// Remove expired item
				const deleteTransaction = db.transaction([this.storeName], 'readwrite');
				const deleteStore = deleteTransaction.objectStore(this.storeName);
				deleteStore.delete(CACHE_PREFIX + key);
				return null;
			}

			console.debug(`IndexedDB cache hit: ${key}`);
			return item.data;
		} catch (error: any) {
			console.error('IndexedDB cache get error:', error);
			return null;
		}
	}

	async clear(): Promise<void> {
		try {
			const db = await this.open();
			const transaction = db.transaction([this.storeName], 'readwrite');
			const store = transaction.objectStore(this.storeName);

			// Clear only items with our prefix
			const range = IDBKeyRange.bound(CACHE_PREFIX, CACHE_PREFIX + '\uffff');
			const request = store.openCursor(range);

			let removedCount = 0;

			await new Promise<void>((resolve, reject) => {
				request.onsuccess = (event) => {
					const cursor = (event.target as IDBRequest).result;
					if (cursor) {
						cursor.delete();
						removedCount++;
						cursor.continue();
					} else {
						resolve();
					}
				};
				request.onerror = () => reject(request.error);
			});

			console.info(`IndexedDB cache cleared: Removed ${removedCount} items`);
		} catch (error: any) {
			console.error('IndexedDB cache clear error:', error);
		}
	}
}

// Check if IndexedDB is available
function isIndexedDBAvailable(): boolean {
	if (typeof window === 'undefined') return false;
	return 'indexedDB' in window && window.indexedDB !== null;
}

// Smart cache that uses IndexedDB for large data, localStorage for small data
const indexedDBStorage = new IndexedDBCacheStorage();

export async function setCachedDataSmart<T>(
	key: string,
	data: T,
	ttlMinutes: number,
	forceIndexedDB: boolean = false
): Promise<void> {
	// Estimate data size
	const dataSize = new Blob([JSON.stringify(data)]).size;
	const sizeKB = Math.round(dataSize / 1024);

	// Use IndexedDB for large data (>1MB) or when explicitly requested
	const useIndexedDB = forceIndexedDB || sizeKB > 1024;

	console.debug(
		`🗃️ Cache strategy for ${key}: ${useIndexedDB ? 'IndexedDB' : 'localStorage'} (${sizeKB}KB)`
	);

	if (useIndexedDB && isIndexedDBAvailable()) {
		try {
			await indexedDBStorage.set(key, data, ttlMinutes);
			console.debug(`✅ Successfully cached to IndexedDB: ${key}`);
		} catch (error) {
			console.warn('IndexedDB failed, falling back to localStorage:', error);
			await setCachedDataCompressed(key, data, ttlMinutes, true);
		}
	} else {
		// Use compressed localStorage for smaller data
		await setCachedDataCompressed(key, data, ttlMinutes, true);
		console.debug(`✅ Successfully cached to localStorage: ${key}`);
	}
}

export async function getCachedDataSmart<T>(key: string): Promise<T | null> {
	console.debug(`🔍 Smart cache lookup for: ${key}`);

	if (isIndexedDBAvailable()) {
		try {
			const indexedDBResult = await indexedDBStorage.get<T>(key);
			if (indexedDBResult !== null) {
				console.debug(`✅ Found in IndexedDB: ${key}`);
				return indexedDBResult;
			} else {
				console.debug(
					`❌ Not found in IndexedDB: ${key}, trying localStorage...`
				);
			}
		} catch (error) {
			console.warn('IndexedDB failed, falling back to localStorage:', error);
		}
	}

	// Try localStorage as fallback
	const localStorageResult = await getCachedDataCompressed<T>(key);
	if (localStorageResult !== null) {
		console.debug(`✅ Found in localStorage: ${key}`);
	} else {
		console.debug(`❌ Not found in localStorage: ${key}`);
	}

	return localStorageResult;
}

export function clearAllCacheSmart(): Promise<number> {
	return Promise.all([
		isIndexedDBAvailable() ? indexedDBStorage.clear() : Promise.resolve(),
		Promise.resolve(clearAllCache()),
	]).then(() => {
		console.info('All caches cleared (IndexedDB + localStorage)');
		return 0; // Return count not easily available for IndexedDB
	});
}

/**
 * Check storage quota and usage
 * Returns information about available storage space
 */
export async function getStorageInfo(): Promise<{
	quota: number;
	usage: number;
	available: number;
	percentUsed: number;
	canStoreMoreData: boolean;
}> {
	if (typeof window === 'undefined' || !('storage' in navigator)) {
		return {
			quota: 0,
			usage: 0,
			available: 0,
			percentUsed: 0,
			canStoreMoreData: false,
		};
	}

	try {
		const estimate = await navigator.storage.estimate();
		const quota = estimate.quota || 0;
		const usage = estimate.usage || 0;
		const available = quota - usage;
		const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
		const canStoreMoreData = available > 50 * 1024 * 1024; // At least 50MB available

		return {
			quota,
			usage,
			available,
			percentUsed,
			canStoreMoreData,
		};
	} catch (error) {
		console.error('Failed to get storage estimate:', error);
		return {
			quota: 0,
			usage: 0,
			available: 0,
			percentUsed: 0,
			canStoreMoreData: false,
		};
	}
}

/**
 * Request persistent storage to prevent data eviction
 */
export async function requestPersistentStorage(): Promise<boolean> {
	if (typeof window === 'undefined' || !('storage' in navigator)) {
		return false;
	}

	try {
		if ('persist' in navigator.storage) {
			const isPersistent = await navigator.storage.persist();
			console.info(`Persistent storage ${isPersistent ? 'granted' : 'denied'}`);
			return isPersistent;
		}
		return false;
	} catch (error) {
		console.error('Failed to request persistent storage:', error);
		return false;
	}
}

/**
 * Log storage information for debugging
 */
export async function logStorageInfo(): Promise<void> {
	const info = await getStorageInfo();
	console.group('📊 Storage Information');
	console.log(`Quota: ${(info.quota / (1024 * 1024 * 1024)).toFixed(2)} GB`);
	console.log(`Used: ${(info.usage / (1024 * 1024)).toFixed(2)} MB`);
	console.log(`Available: ${(info.available / (1024 * 1024)).toFixed(2)} MB`);
	console.log(`Percent Used: ${info.percentUsed.toFixed(1)}%`);
	console.log(`Can Store More: ${info.canStoreMoreData ? '✅' : '❌'}`);
	console.groupEnd();
}

/**
 * Clear all caches without refreshing the page
 * This function combines localStorage cache clearing with in-memory cache clearing
 * @param clearInMemoryCaches - Function to clear in-memory caches (optional)
 * @returns The number of cache items removed
 */
export function clearAllCachesOnly(clearInMemoryCaches?: () => void): number {
	try {
		// Clear localStorage cache
		const removedCount = clearAllCache();

		// Clear in-memory caches if function provided
		if (clearInMemoryCaches) {
			clearInMemoryCaches();
		}

		console.log(
			`Cache cleared: ${removedCount} localStorage items removed${clearInMemoryCaches ? ', in-memory caches cleared' : ''}`
		);

		return removedCount;
	} catch (error) {
		console.error('Error clearing cache:', error);
		throw error;
	}
}

/**
 * Clear all caches and refresh the page
 * This function combines localStorage cache clearing with in-memory cache clearing
 * @param clearInMemoryCaches - Function to clear in-memory caches (optional)
 * @returns Promise with the number of cache items removed and whether page was refreshed
 */
export async function clearAllCachesAndRefresh(
	clearInMemoryCaches?: () => void
): Promise<{ removedCount: number; refreshed: boolean }> {
	try {
		const removedCount = clearAllCachesOnly(clearInMemoryCaches);

		// Refresh the page
		if (typeof window !== 'undefined') {
			window.location.reload();
		}

		return { removedCount, refreshed: true };
	} catch (error) {
		console.error('Error clearing cache:', error);
		throw error;
	}
}

/**
 * Clear all caches including in-memory caches and refresh the page
 * This is a convenience function that includes all standard cache clearing
 * @returns Promise with the number of cache items removed and whether page was refreshed
 */
export async function clearAllCachesAndRefreshComplete(): Promise<{
	removedCount: number;
	refreshed: boolean;
}> {
	// Dynamically import the cache clearing functions to avoid circular dependencies
	const { clearTracksInMemoryCache } = await import('@/hooks/useLikedTracks');
	const { clearArtistsInMemoryCache } = await import('@/hooks/useLikedArtists');

	const clearInMemoryCaches = () => {
		clearTracksInMemoryCache();
		clearArtistsInMemoryCache();
	};

	return clearAllCachesAndRefresh(clearInMemoryCaches);
}

/**
 * Clear all caches including in-memory caches without refreshing the page
 * This is a convenience function for when you want to show a toast notification
 * @returns The number of cache items removed
 */
export async function clearAllCachesOnlyComplete(): Promise<number> {
	// Dynamically import the cache clearing functions to avoid circular dependencies
	const { clearTracksInMemoryCache } = await import('@/hooks/useLikedTracks');
	const { clearArtistsInMemoryCache } = await import('@/hooks/useLikedArtists');

	const clearInMemoryCaches = () => {
		clearTracksInMemoryCache();
		clearArtistsInMemoryCache();
	};

	return clearAllCachesOnly(clearInMemoryCaches);
}
