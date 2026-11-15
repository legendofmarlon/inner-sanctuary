// Inner Sanctuary Wellness Foundation — Progressive Web App Service Worker
// Version: 1.0.0 (Sanctuary in Your Pocket)

const CACHE_NAME = 'inner-sanctuary-cache-v2';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './emblem.png',
  './emblem.jpg'
];

// Install: Cache critical shell resources and skip waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Sanctuary SW] Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up stale caches & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate for fast offline & instant-on performance
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests and valid http/https schemes
  if (req.method !== 'GET' || !req.url.startsWith('http')) {
    return;
  }

  // Handle external analytics or third-party APIs (Zeffy, Google Fonts, etc.)
  if (!req.url.includes(self.location.origin)) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkResponse;
        }).catch(() => cachedResponse);
      })
    );
    return;
  }

  // Same-origin assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return networkResponse;
      }).catch((err) => {
        // If offline and request is HTML document, return cached index.html
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
        throw err;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
