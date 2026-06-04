const CACHE_NAME = 'blogger-pwa-ua-cache-v3';
const urlsToCache = ['/'];

const CUSTOM_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.0.0 Safari/53";

// 1. Service Worker Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Forcefully activate hobe
});

// 2. Active State
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// 3. Network Fetch Intercept & Safety Patch
self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('http')) {
    
    const modifiedHeaders = new Headers(event.request.headers);
    
    event.respondWith(
      self.clients.get(event.clientId).then(client => {
        // PWA Mode Context Logic
        const isAppMode = event.request.referrer === '' || (client && client.url && !client.url.includes('?utm_source=browser'));

        if (isAppMode) {
          modifiedHeaders.set('User-Agent', CUSTOM_USER_AGENT);
        }
        
        // Safety Patch: 'redirect: manual' kete normal navigation default rakha holo
        const requestOptions = {
          headers: modifiedHeaders,
          credentials: event.request.credentials
        };

        // Mode jodi navigate hoy tabuo default pass korbe direct loop break kora chara
        if (event.request.mode === 'navigate') {
          return fetch(event.request); // Direct fetch crash prevent korbe
        }

        const modifiedRequest = new Request(event.request, requestOptions);
        return fetch(modifiedRequest).catch(() => caches.match(event.request));
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});