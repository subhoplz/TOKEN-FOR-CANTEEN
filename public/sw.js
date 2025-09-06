
const CACHE_NAME = 'canteen-pass-cache-v2';
const urlsToCache = [
  '/',
  '/login',
  '/login/user',
  '/login/vendor',
  '/login/admin',
  '/vendor/dashboard',
  '/vendor/scan',
  '/admin',
  '/admin/employees',
  '/admin/tokens',
  '/admin/reports',
  '/manifest.json',
  '/globals.css',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Let the browser handle requests for Firebase
  if (event.request.url.includes('firestore.googleapis.com')) {
    return;
  }
  
  // Use stale-while-revalidate strategy
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If we got a valid response, clone it and put it in the cache.
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            console.error('Fetch failed; returning offline page instead.', err);
            // If the network fails, and there is no cached response, you can return an offline fallback page.
            // For now, we just let the failure happen, but the cached response (if any) is already served.
        });

        // Return the cached response immediately if there is one,
        // and the fetch promise will update the cache in the background.
        return response || fetchPromise;
      });
    })
  );
});
