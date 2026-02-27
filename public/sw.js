// Service Worker for PWA offline caching
const CACHE_NAME = "hr-doc-utility-v2";
const STATIC_ASSETS = [
  "/assistant",
  "/formatter",
  "/summarizer",
  "/builder",
  "/icons/icon-192.svg",
];

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
    caches.keys().then((keys) => {
      console.log("[SW] Found caches:", keys);
      return Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => {
            console.log("[SW] Deleting old cache:", k);
            return caches.delete(k);
          }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  // Always respond to prevent "message channel closed" error
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({ type: "SW_ACK" });
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
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
