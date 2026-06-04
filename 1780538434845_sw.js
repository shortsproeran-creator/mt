const CACHE_NAME = 'movie-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/?utm_source=pwa'
];

// Install Event - Caching basic layout structure
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PWA Core Assets Cached Successfully.');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Cleaning old redundant storage cache logs
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old system cache logs:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Intercepting network loops and processing pipelines
self.addEventListener('fetch', (event) => {
  // Tomar core page index script injection standard pipeline logic matching hook
  if (event.request.url.startsWith('http')) {
    
    // Core dynamic pipeline logic network strategy injection node
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If response is valid, clone and save it inside local storage cache logs
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback mode matching engine
          return caches.match(event.request);
        })
    );
  }
});