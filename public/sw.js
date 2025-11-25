const VERSION = '12.2';
const CACHE_NAME = `teuni-waescheportal-v${VERSION}`;
const RUNTIME_CACHE = `teuni-runtime-v${VERSION}`;

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/?v=12.2',
  '/offline.html',
  '/manifest.json?v=12.2',
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
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker v12.0');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        // Explicitly target and delete problematic old versions
        const oldVersions = ['v11.0', 'v11.1', 'v11.2'];
        const cachesToDelete = cacheNames.filter(cacheName => {
          // Delete if not current version
          if (cacheName === CACHE_NAME || cacheName === RUNTIME_CACHE) {
            return false;
          }
          
          // Explicitly delete old problematic versions
          const isOldVersion = oldVersions.some(oldVer => cacheName.includes(oldVer));
          if (isOldVersion) {
            console.log('[SW] 🔥 FORCE DELETING problematic cache:', cacheName);
            return true;
          }
          
          return true;
        });
        
        return Promise.all(
          cachesToDelete.map(cacheName => {
            console.log('[SW] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('[SW] All old caches deleted, claiming clients');
        return self.clients.claim();
      })
      .then(() => {
        console.log('[SW] Forcing reload of all clients');
        // Force reload all open tabs/windows
        return self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(client => {
            console.log('[SW] Force reloading client:', client.url);
            client.navigate(client.url);
          });
        });
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

  // Network first for app code (JS/CSS/HTML) - never serve stale app code
  if (url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') || 
      url.pathname === '/' || 
      url.pathname.startsWith('/assets/')) {
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
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});