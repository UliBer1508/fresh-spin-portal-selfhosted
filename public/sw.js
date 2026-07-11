const VERSION = '12.24.0';
const CACHE_NAME = `teuni-waescheportal-v${VERSION}`;
const RUNTIME_CACHE = `teuni-runtime-v${VERSION}`;

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/?v=12.24.0',
  '/offline.html',
  '/manifest.json?v=12.24.0',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Install event - precache assets
// NOTE: addAll is atomic - a single missing asset would abort the whole install.
// We therefore cache non-critical assets individually and tolerate failures.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precaching assets v' + VERSION);
        return Promise.allSettled(
          PRECACHE_ASSETS.map(asset => cache.add(asset))
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker v' + VERSION);
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        // Delete all caches that are not current version
        const cachesToDelete = cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
        });

        return Promise.all(
          cachesToDelete.map(cacheName => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('[SW] All old caches deleted, claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Network first for translation files - always get fresh translations
  if (url.pathname.startsWith('/locales/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Content-hashed build assets (/assets/*.js, *.css) are IMMUTABLE:
  // the hash in the filename guarantees the content. Use cache-first and
  // ONLY ever return the exact same-hash file. We never substitute a
  // different chunk on a miss - that is what caused the "two copies of
  // React / Invalid hook call" crash after a deploy. A miss simply goes
  // to the network; if the network 404s (old chunk purged), we let it
  // 404 so the page reloads cleanly instead of running mixed versions.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network first for the app document (HTML) and top-level JS/CSS -
  // never serve a stale app shell.
  if (url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache only for critical files
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
        })
    );
    return;
  }

  // Network first for API calls (Supabase)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone and cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache first for other static assets (images, icons, etc.)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(response => {
            // Don't cache if not a success response
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone and cache the response
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Background sync for offline actions
// Supabase handles retry logic internally via React Query
self.addEventListener('sync', (event) => {
  if (event.tag === 'supabase-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(
      // Notify clients to retry failed requests
      notifyClientsToSync()
    );
  }
});

async function notifyClientsToSync() {
  console.log('[SW] Notifying clients to sync');
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'TRIGGER_SYNC'
    });
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Neue Wäschebestellung verfügbar',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Anzeigen'
      },
      {
        action: 'close',
        title: 'Schließen'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Teuni Wäscheportal', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Message handler for manual cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Accept BOTH message names - the ErrorBoundary in main.tsx sends
  // 'CLEAR_ALL_CACHES', earlier code sent 'CLEAR_CACHE'. Previously only
  // 'CLEAR_CACHE' was handled, so the ErrorBoundary's request was silently
  // ignored and the SW-side caches were never cleared.
  if (event.data && (event.data.type === 'CLEAR_CACHE' || event.data.type === 'CLEAR_ALL_CACHES')) {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});
