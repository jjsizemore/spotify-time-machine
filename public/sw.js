// Service Worker for Spotify Time Machine PWA
// 2025 Standards Implementation with iOS Optimizations

const STATIC_CACHE_NAME = 'spotify-time-machine-static-v3';
const DYNAMIC_CACHE_NAME = 'spotify-time-machine-dynamic-v3';

// Domain migration handling
const OLD_DOMAIN = 'stm.jermainesizemore.com';
const NEW_DOMAIN = 'tm.jermainesizemore.com';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/history',
  '/playlist-generator',
  '/icon.svg',

  '/manifest.webmanifest',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        // Notify clients about domain migration if on old domain
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            const clientUrl = new URL(client.url);
            if (clientUrl.hostname === OLD_DOMAIN) {
              client.postMessage(
                {
                  type: 'DOMAIN_MIGRATION',
                  oldDomain: OLD_DOMAIN,
                  newDomain: NEW_DOMAIN,
                  message: `This app has moved to ${NEW_DOMAIN}. Please reinstall from the new domain.`,
                },
                client.location.origin
              );
            }
          });
        });
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests - but must return a response
  if (request.method !== 'GET') {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 500 })));
    return;
  }

  // Skip Spotify API requests (they need fresh data) - but must return a response
  if (url.hostname === 'api.spotify.com' || url.hostname === 'accounts.spotify.com') {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Skip NextAuth API routes - but must return a response
  if (url.pathname.startsWith('/api/auth/')) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Skip external analytics and tracking services - but must return a response
  const externalDomains = [
    'www.googletagmanager.com',
    'va.vercel-scripts.com',
    'vitals.vercel-analytics.com',
    'app.posthog.com',
    'us.i.posthog.com',
    'us-assets.i.posthog.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'r2cdn.perplexity.ai',
  ];

  // Also skip Vercel scripts by pathname
  if (url.pathname.startsWith('/_vercel/')) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 200 })));
    return;
  }

  if (externalDomains.includes(url.hostname)) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 200 })));
    return;
  }

  // Skip cross-origin requests that aren't same-origin - but must return a response
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 200 })));
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/_next/static/')) {
    // Static assets - cache first
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (url.pathname.startsWith('/api/')) {
    // API routes - network first
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  } else if (/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/.exec(url.pathname)) {
    // Images - cache first with fallback
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE_NAME));
  } else {
    // Pages - stale while revalidate
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
  }
});

// Cache first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone()).catch(() => {
        // Silently handle cache storage errors
      });
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    // Return a proper response instead of throwing
    return fetch(request).catch(() => new Response('Offline', { status: 503 }));
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone()).catch(() => {
        // Silently handle cache storage errors
      });
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    try {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(request);
      return cachedResponse || new Response('Offline', { status: 503 });
    } catch {
      return new Response('Offline', { status: 503 });
    }
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone()).catch(() => {
            // Silently handle cache storage errors
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If fetch fails and we have a cached response, return it
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise return a valid empty response
        return new Response('', { status: 200 });
      });

    // If we have a cached response, return it immediately
    // Otherwise wait for the network
    if (cachedResponse) {
      return cachedResponse;
    }

    // Wait for network response, with fallback
    const response = await fetchPromise;
    return response || new Response('', { status: 200 });
  } catch (error) {
    console.error('Stale while revalidate failed:', error);
    return fetch(request).catch(() => new Response('', { status: 200 }));
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  // For example, sync offline playlist creations
  console.log('Service Worker: Performing background sync');
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1,
      },
      actions: [
        {
          action: 'explore',
          title: 'View Dashboard',
          icon: '/icon.svg',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ],
    };

    event.waitUntil(globalThis.registration.showNotification(data.title, options));
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(globalThis.clients.openWindow('/dashboard'));
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});
