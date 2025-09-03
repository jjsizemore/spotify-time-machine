// Enhanced Spotify API client with request queuing, retry logic, and automatic token refresh
// This eliminates rate limiting issues and provides robust error handling

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com/api/token';

export interface SpotifyError {
	status: number;
	message: string;
}

export class SpotifyApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'SpotifyApiError';
		this.status = status;
	}
}

interface QueuedRequest {
	url: string;
	options: RequestInit;
	resolve: (value: any) => void;
	reject: (error: any) => void;
	retryCount: number;
	priority: number; // Lower number = higher priority
}

interface TokenRefreshCallback {
	(): Promise<any>;
}

class SpotifyApi {
	private accessToken: string | null = null;
	private tokenRefreshCallback: TokenRefreshCallback | null = null;
	private isRefreshing = false;
	private requestQueue: QueuedRequest[] = [];
	private isProcessingQueue = false;
	private lastRequestTime = 0;
	private rateLimitResetTime = 0;
	private readonly minRequestInterval = 100; // 100ms between requests
	private readonly maxRetries = 3;
	private pendingRequests = new Map<string, Promise<any>>(); // For request deduplication
	private readonly requestTimeout = 60000; // 60 seconds timeout for pending requests

	setAccessToken(token: string) {
		this.accessToken = token;
	}

	setTokenRefreshCallback(callback: TokenRefreshCallback) {
		this.tokenRefreshCallback = callback;
	}

	resetAccessToken() {
		this.accessToken = null;
	}

	private async sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	private calculateBackoffDelay(retryCount: number, baseDelay = 1000): number {
		// Exponential backoff with jitter
		const exponentialDelay = Math.min(
			baseDelay * Math.pow(2, retryCount),
			30000
		);
		const jitter = Math.random() * 1000;
		return exponentialDelay + jitter;
	}

	private async refreshAccessToken(): Promise<boolean> {
		if (this.isRefreshing) {
			// Wait for ongoing refresh
			while (this.isRefreshing) {
				await this.sleep(100);
			}
			return !!this.accessToken;
		}

		if (!this.tokenRefreshCallback) {
			console.error('No token refresh callback set');
			return false;
		}

		this.isRefreshing = true;
		try {
			console.log('🔄 Refreshing access token...');
			const tokenData = await this.tokenRefreshCallback();
			this.accessToken = tokenData.accessToken;
			console.log('✅ Access token refreshed successfully');
			return true;
		} catch (error) {
			console.error('❌ Failed to refresh access token:', error);
			return false;
		} finally {
			this.isRefreshing = false;
		}
	}

	private async makeRawRequest(
		url: string,
		options: RequestInit = {}
	): Promise<Response> {
		if (!this.accessToken) {
			throw new SpotifyApiError('No access token available', 401);
		}

		// Check rate limit
		const now = Date.now();
		if (now < this.rateLimitResetTime) {
			const waitTime = this.rateLimitResetTime - now;
			console.warn(`Rate limited, waiting ${waitTime}ms...`);
			await this.sleep(waitTime);
		}

		// Throttle requests
		const timeSinceLastRequest = now - this.lastRequestTime;
		if (timeSinceLastRequest < this.minRequestInterval) {
			await this.sleep(this.minRequestInterval - timeSinceLastRequest);
		}

		this.lastRequestTime = Date.now();

		const response = await fetch(url, {
			...options,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				'Content-Type': 'application/json',
				...options.headers,
			},
		});

		// Handle rate limiting
		if (response.status === 429) {
			const retryAfter = response.headers.get('Retry-After');
			const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 1000;
			this.rateLimitResetTime = Date.now() + waitTime;
			throw new SpotifyApiError('API rate limit exceeded', 429);
		}

		return response;
	}

	private async processRequest(queuedRequest: QueuedRequest): Promise<void> {
		const { url, options, resolve, reject, retryCount } = queuedRequest;

		try {
			const response = await this.makeRawRequest(url, options);

			if (response.status === 401 && retryCount === 0) {
				// Try to refresh token on first 401
				const refreshed = await this.refreshAccessToken();
				if (refreshed) {
					// Retry with new token
					queuedRequest.retryCount++;
					this.requestQueue.unshift(queuedRequest); // Add to front of queue
					return;
				} else {
					reject(
						new SpotifyApiError(
							'Authentication failed and token refresh failed',
							401
						)
					);
					return;
				}
			}

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const message =
					errorData.error?.message ||
					`HTTP ${response.status}: ${response.statusText}`;

				if (response.status === 429 && retryCount < this.maxRetries) {
					// Retry rate limited requests
					const delay = this.calculateBackoffDelay(retryCount);
					console.warn(
						`Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`
					);
					await this.sleep(delay);
					queuedRequest.retryCount++;
					this.requestQueue.unshift(queuedRequest);
					return;
				}

				reject(new SpotifyApiError(message, response.status));
				return;
			}

			const data = await response.json();
			resolve(data);
		} catch (error) {
			if (error instanceof SpotifyApiError) {
				if (error.status === 429 && retryCount < this.maxRetries) {
					// Retry on rate limit
					const delay = this.calculateBackoffDelay(retryCount);
					console.warn(
						`Request failed with rate limit, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`
					);
					await this.sleep(delay);
					queuedRequest.retryCount++;
					this.requestQueue.unshift(queuedRequest);
					return;
				}
			}
			reject(error);
		}
	}

	private async processQueue(): Promise<void> {
		if (this.isProcessingQueue || this.requestQueue.length === 0) {
			return;
		}

		this.isProcessingQueue = true;

		while (this.requestQueue.length > 0) {
			// Sort by priority (lower number = higher priority)
			this.requestQueue.sort((a, b) => a.priority - b.priority);
			const request = this.requestQueue.shift()!;

			try {
				await this.processRequest(request);
			} catch {
				// Individual request errors are handled in processRequest
			}

			// Small delay between requests to avoid overwhelming the API
			await this.sleep(50);
		}

		this.isProcessingQueue = false;
	}

	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {},
		priority = 5
	): Promise<T> {
		const url = `${SPOTIFY_BASE_URL}${endpoint}`;

		// Create a unique key for request deduplication that includes the full URL and method
		const method = options.method || 'GET';
		const requestKey = `${method}:${url}${options.body ? `:${JSON.stringify(options.body)}` : ''}`;

		// Check if this exact request is already pending
		if (this.pendingRequests.has(requestKey)) {
			console.log(`🔄 Deduplicating request: ${method} ${endpoint}`);
			return this.pendingRequests.get(requestKey)!;
		}

		const requestPromise = new Promise<T>((resolve, reject) => {
			// Set up timeout to prevent hanging requests
			const timeoutId = setTimeout(() => {
				this.pendingRequests.delete(requestKey);
				reject(new SpotifyApiError('Request timeout', 408));
			}, this.requestTimeout);

			const queuedRequest: QueuedRequest = {
				url,
				options,
				resolve: (value) => {
					clearTimeout(timeoutId);
					this.pendingRequests.delete(requestKey);
					resolve(value);
				},
				reject: (error) => {
					clearTimeout(timeoutId);
					this.pendingRequests.delete(requestKey);
					reject(error);
				},
				retryCount: 0,
				priority,
			};

			this.requestQueue.push(queuedRequest);
			this.processQueue();
		});

		// Store the promise for deduplication
		this.pendingRequests.set(requestKey, requestPromise);

		return requestPromise;
	}

	// Get user's saved tracks (lower priority - slower endpoint)
	async getMySavedTracks(params: { limit?: number; offset?: number } = {}) {
		const searchParams = new URLSearchParams();
		if (params.limit) searchParams.set('limit', params.limit.toString());
		if (params.offset) searchParams.set('offset', params.offset.toString());

		const endpoint = `/me/tracks${searchParams.toString() ? `?${searchParams}` : ''}`;
		const data = await this.makeRequest<any>(endpoint, {}, 4); // Lower priority - slower endpoint
		return { body: data };
	}

	// Get user's top artists (highest priority - fast endpoint)
	async getMyTopArtists(
		params: { time_range?: string; limit?: number; offset?: number } = {}
	) {
		const searchParams = new URLSearchParams();
		if (params.time_range) searchParams.set('time_range', params.time_range);
		if (params.limit) searchParams.set('limit', params.limit.toString());
		if (params.offset) searchParams.set('offset', params.offset.toString());

		const endpoint = `/me/top/artists${searchParams.toString() ? `?${searchParams}` : ''}`;
		const data = await this.makeRequest<any>(endpoint, {}, 1); // Highest priority - fast endpoint
		return { body: data };
	}

	// Get user's top tracks (highest priority - fast endpoint)
	async getMyTopTracks(
		params: { time_range?: string; limit?: number; offset?: number } = {}
	) {
		const searchParams = new URLSearchParams();
		if (params.time_range) searchParams.set('time_range', params.time_range);
		if (params.limit) searchParams.set('limit', params.limit.toString());
		if (params.offset) searchParams.set('offset', params.offset.toString());

		const endpoint = `/me/top/tracks${searchParams.toString() ? `?${searchParams}` : ''}`;
		const data = await this.makeRequest<any>(endpoint, {}, 1); // Highest priority - fast endpoint
		return { body: data };
	}

	// Get recently played tracks (high priority - fast endpoint)
	async getMyRecentlyPlayedTracks(
		params: { limit?: number; after?: number; before?: number } = {}
	) {
		const searchParams = new URLSearchParams();
		if (params.limit) searchParams.set('limit', params.limit.toString());
		if (params.after) searchParams.set('after', params.after.toString());
		if (params.before) searchParams.set('before', params.before.toString());

		const endpoint = `/me/player/recently-played${searchParams.toString() ? `?${searchParams}` : ''}`;
		const data = await this.makeRequest<any>(endpoint, {}, 2); // High priority - fast endpoint
		return { body: data };
	}

	// Get multiple artists by IDs (medium priority)
	async getArtists(ids: string[]) {
		if (ids.length === 0) {
			return { body: { artists: [] } };
		}

		const endpoint = `/artists?ids=${ids.join(',')}`;
		const data = await this.makeRequest<any>(endpoint, {}, 3); // Medium priority
		return { body: data };
	}

	// Create a playlist
	async createPlaylist(
		name: string,
		options: { description?: string; public?: boolean } = {}
	) {
		// First get the current user's ID
		const userResponse = await this.makeRequest<any>('/me', {}, 1);
		const userId = userResponse.id;

		const endpoint = `/users/${userId}/playlists`;
		const body = {
			name,
			description: options.description || '',
			public: options.public ?? false,
		};

		const data = await this.makeRequest<any>(
			endpoint,
			{
				method: 'POST',
				body: JSON.stringify(body),
			},
			1
		); // High priority for user actions

		return { body: data };
	}

	// Add tracks to playlist
	async addTracksToPlaylist(playlistId: string, trackUris: string[]) {
		const endpoint = `/playlists/${playlistId}/tracks`;
		const body = {
			uris: trackUris,
		};

		const data = await this.makeRequest<any>(
			endpoint,
			{
				method: 'POST',
				body: JSON.stringify(body),
			},
			1
		); // High priority for user actions

		return { body: data };
	}

	// Clear all pending requests (useful for debugging or cleanup)
	clearPendingRequests() {
		console.log(`🧹 Clearing ${this.pendingRequests.size} pending requests`);
		this.pendingRequests.clear();
	}

	// Get current queue status (for debugging)
	getQueueStatus() {
		const pendingRequestKeys = Array.from(this.pendingRequests.keys());
		return {
			queueLength: this.requestQueue.length,
			pendingRequestsCount: this.pendingRequests.size,
			pendingRequestKeys: pendingRequestKeys.slice(0, 10), // Show first 10 for debugging
			isProcessing: this.isProcessingQueue,
			isRefreshing: this.isRefreshing,
			rateLimitResetTime: this.rateLimitResetTime,
			hasToken: !!this.accessToken,
		};
	}
}

export const spotifyApi = new SpotifyApi();

export const scopes = [
	'user-read-email',
	'user-read-private',
	'user-library-read',
	'playlist-modify-public',
	'playlist-modify-private',
	'user-read-recently-played',
	'user-top-read',
].join(' ');

export const refreshAccessToken = async (refreshToken: string) => {
	try {
		console.log('🔄 Attempting to refresh Spotify access token...');

		const response = await fetch(SPOTIFY_ACCOUNTS_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${Buffer.from(
					`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
				).toString('base64')}`,
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
			}),
			// Critical: Add no-cache to prevent stale responses
			cache: 'no-cache',
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('❌ Spotify token refresh failed:', {
				status: response.status,
				statusText: response.statusText,
				error: errorData,
			});
			throw new Error(
				`Token refresh failed: ${response.status} ${response.statusText} - ${errorData}`
			);
		}

		const body = await response.json();

		console.log('✅ Successfully refreshed Spotify access token');

		return {
			accessToken: body.access_token,
			// Important: Use new refresh token if provided, otherwise fall back to old one
			refreshToken: body.refresh_token ?? refreshToken,
			expiresAt: Math.floor(Date.now() / 1000) + body.expires_in,
		};
	} catch (error) {
		console.error('❌ Error refreshing access token:', error);
		throw error;
	}
};
