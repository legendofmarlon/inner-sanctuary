// Inner Sanctuary Wellness Foundation — Progressive Web App Service Worker
// Version: 1.0.0 (Sanctuary in Your Pocket)

const CACHE_NAME = 'inner-sanctuary-cache-v33';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './community-hub.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './emblem.png',
  './emblem.jpg',
  './js/modules/adaptive-atmosphere.js',
  './js/modules/clubhouse-community-sync.js',
  './js/modules/community-hub-wings.js',
  './js/modules/community-popup.js',
  './js/modules/echo-spark.js',
  './js/modules/funder-dossier.js',
  './js/modules/pause-booth.js',
  './js/modules/promo-card-generator.js',
  './js/modules/pulse-constellation.js',
  './js/modules/raffle-wheel.js',
  './js/modules/run-of-show.js',
  './js/modules/sanctuary-cinema.js',
  './js/modules/sanctuary-os.js',
  './js/modules/telemetry-lens.js',
  './styles/modules/adaptive-atmosphere.css',
  './styles/modules/community-hub-wings.css',
  './styles/modules/community-popup.css',
  './styles/modules/echo-spark.css',
  './styles/modules/funder-dossier.css',
  './styles/modules/pause-booth.css',
  './styles/modules/promo-card-generator.css',
  './styles/modules/pulse-constellation.css',
  './styles/modules/raffle-wheel.css',
  './styles/modules/run-of-show.css',
  './styles/modules/sanctuary-cinema.css',
  './styles/modules/sanctuary-os.css'
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

  // On local preview / dev, always fetch fresh from network to prevent stale cache
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    event.respondWith(fetch(req));
    return;
  }

  // Only handle GET requests and valid http/https schemes
  if (req.method !== 'GET' || !req.url.startsWith('http')) {
    return;
  }

  // Skip caching Netlify function calls, live Supabase REST/Auth/Upload APIs, and oversized animated GIFs
  if (
    req.url.includes('/.netlify/functions/') ||
    req.url.includes('.supabase.co/rest/') ||
    req.url.includes('.supabase.co/auth/') ||
    /\.gif(\?|$)/i.test(req.url)
  ) {
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
