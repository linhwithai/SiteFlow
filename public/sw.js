// SiteFlow Service Worker
// Version 1.0.0

const CACHE_NAME = 'siteflow-v1.0.0';
const STATIC_CACHE = 'siteflow-static-v1.0.0';
const DYNAMIC_CACHE = 'siteflow-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/dashboard/projects',
  '/dashboard/daily-logs',
  '/manifest.json',
  '/favicon.ico',
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png',
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/projects',
  '/api/daily-logs',
  '/api/projects/stats',
  '/api/daily-logs/stats',
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', request.url);
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Determine which cache to use
            let cacheName = DYNAMIC_CACHE;
            if (STATIC_FILES.includes(url.pathname)) {
              cacheName = STATIC_CACHE;
            } else if (API_CACHE_PATTERNS.some(pattern => url.pathname.startsWith(pattern))) {
              cacheName = DYNAMIC_CACHE;
            }

            // Cache the response
            caches.open(cacheName)
              .then((cache) => {
                cache.put(request, responseToCache);
                console.log('Service Worker: Cached response', request.url);
              });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/') || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain',
                }),
              });
            }
            
            throw error;
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      handleBackgroundSync()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Bạn có thông báo mới từ SiteFlow',
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Xem chi tiết',
        icon: '/assets/images/checkmark.png',
      },
      {
        action: 'close',
        title: 'Đóng',
        icon: '/assets/images/xmark.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('SiteFlow', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Helper function for background sync
async function handleBackgroundSync() {
  try {
    // Get pending data from IndexedDB
    const pendingData = await getPendingData();
    
    // Sync with server
    for (const item of pendingData) {
      try {
        await syncData(item);
        await removePendingData(item.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync item', item.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Helper function to get pending data (mock implementation)
async function getPendingData() {
  // This would typically use IndexedDB to store offline data
  return [];
}

// Helper function to sync data with server
async function syncData(data) {
  const response = await fetch(data.url, {
    method: data.method,
    headers: data.headers,
    body: data.body,
  });
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }
  
  return response.json();
}

// Helper function to remove pending data
async function removePendingData(id) {
  // This would typically remove the item from IndexedDB
  console.log('Service Worker: Removed pending data', id);
}

