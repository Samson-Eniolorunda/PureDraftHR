// Service Worker for PWA offline caching
const CACHE_NAME = "hr-doc-utility-v2";
const STATIC_ASSETS = ["/formatter", "/summarizer", "/builder", "/icons/icon-192.svg"];

console.log("[SW] Service Worker loaded with cache:", CACHE_NAME);

self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets:", STATIC_ASSETS);
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches
      .keys()
      // Service Worker for PWA offline caching
      const CACHE_NAME = "hr-doc-utility-v2"; // bump to force update when deployed
      const STATIC_ASSETS = ["/formatter", "/summarizer", "/builder", "/icons/icon-192.svg"];
      .then((keys) => {
        console.log("[SW] Found caches:", keys);
        console.log('[SW] Installing...');
          keys.filter((k) => k !== CACHE_NAME).map((k) => {
            console.log("[SW] Deleting old cache:", k);
            console.log('sw install, caching static assets', STATIC_ASSETS);
          }),
        );
      }),
  );
  self.clients.claim();
});

        console.log('sw activate, clearing old caches if any');
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
               console.log('[SW] Found caches:', keys);
  // Always respond to prevent "message channel closed" error
  if (event.ports && event.ports[0]) {
                   console.log('[SW] Deleting old cache:', k);
  }
});

self.addEventListener("fetch", (event) => {
  // Network-first strategy for API / streaming routes
  if (event.request.url.includes("/api/")) return;

  // Don't try to cache POST requests (Cache API only supports GET/HEAD)
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches
        // Debug logging
        // console.log('sw fetch:', event.request.url);
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
