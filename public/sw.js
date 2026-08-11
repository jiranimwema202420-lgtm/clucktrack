
const CACHE_NAME = 'pwa-cache-v1';
const STATIC_ASSETS = [
    // Pre-cache static assets here if needed
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


self.addEventListener('fetch', (event) => {
    const { request } = event;

    // For navigation requests, use a network-first strategy.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // If the fetch is successful, clone the response and cache it.
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // If the network fails, try to serve the response from the cache.
                    return caches.match(request);
                })
        );
        return;
    }

    // For other requests (images, videos, scripts, styles), use a cache-first strategy.
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                }
                return networkResponse;
            });
        })
    );
});

//background sync logic flow 
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        console.log('[SW] Background sync triggered: sync-data');
        event.waitUntil(handleSyncData());
    }
});

async function handleSyncData() {

    //debug log if something went wrong or process gets stuck
    console.error('[SW] Error: Background sync process encountered a problem.');
}
