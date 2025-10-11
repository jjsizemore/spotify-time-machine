// Service Worker for Spotify Time Machine PWA
// 2025 Standards Implementation with iOS Optimizations

const STATIC_CACHE_NAME = 'spotify-time-machine-static-v2';
const DYNAMIC_CACHE_NAME = 'spotify-time-machine-dynamic-v2';

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

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Spotify API requests (they need fresh data)
  if (url.hostname === 'api.spotify.com' || url.hostname === 'accounts.spotify.com') {
    return;
  }

  // Skip NextAuth API routes
  if (url.pathname.startsWith('/api/auth/')) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/_next/static/')) {
    // Static assets - cache first
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (url.pathname.startsWith('/api/')) {
    // API routes - network first
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/)) {
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
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
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

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(self.clients.openWindow('/dashboard'));
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});
