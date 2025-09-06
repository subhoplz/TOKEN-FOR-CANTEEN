// v3 - A more robust service worker

const CACHE_NAME = 'canteen-pass-cache-v3';

// The app shell consists of the essential files needed to run the app.
const APP_SHELL_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // Add other critical pages if necessary, e.g., '/login'
];

// On install, pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching app shell');
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});


// On fetch, use a stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache Firestore requests, let Firebase handle its own offline persistence
  if (url.origin.includes('firestore.googleapis.com')) {
    return;
  }
  
  // For navigation requests (HTML pages), use Network Falling Back to Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request.url) || caches.match('/');
      })
    );
    return;
  }
  
  // For other requests (CSS, JS, images), use Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          // If the request is successful, update the cache
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            // Network fetch failed, which is expected offline.
            // The cached response will be used if available.
        });

        // Return the cached response immediately if available, otherwise wait for the network
        return cachedResponse || fetchPromise;
      });
    })
  );
});
