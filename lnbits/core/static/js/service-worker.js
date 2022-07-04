// the cache version gets updated every time there is a new deployment
const CACHE_VERSION = 1;
const CURRENT_CACHE = `lnbits-${CACHE_VERSION}-`;

const getApiKey = (request) => {
  return request.headers.get('X-Api-Key') || "none"
}

// on activation we clean up the previously registered service workers
self.addEventListener('activate', evt =>
  evt.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          const currentCacheVersion = cacheName.split('-').slice(-2)
          if (currentCacheVersion !== CACHE_VERSION) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  )
);

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches
      .open(CURRENT_CACHE + getApiKey(event.request))
      .then((cache) => {
        return cache.match(event.request);
      })
      .then(cachedResponse => {
        if(cachedResponse) {
          return cachedResponse
        }

        return caches.open(CURRENT_CACHE + getApiKey(event.request)).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});