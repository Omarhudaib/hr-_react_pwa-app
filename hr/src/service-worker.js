/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from "workbox-precaching";

// Pre-cache static assets injected during build
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache API requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});