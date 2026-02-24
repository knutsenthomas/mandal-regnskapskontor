const CACHE_NAME = 'mandal-rk-v2';
const APP_SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) =>
                Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                )
            )
            .then(() => self.clients.claim())
    );
});

const cacheStaticAsset = async (request, response) => {
    if (!response || !response.ok) return response;
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
};

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Use network-first for page navigations to avoid stale index.html after deploys.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(async (response) => {
                    if (response && response.ok) {
                        const cache = await caches.open(CACHE_NAME);
                        cache.put('/index.html', response.clone());
                    }
                    return response;
                })
                .catch(async () => {
                    const cachedIndex = await caches.match('/index.html');
                    return cachedIndex || caches.match('/');
                })
        );
        return;
    }

    const cacheableDestinations = new Set(['script', 'style', 'image', 'font']);
    if (!cacheableDestinations.has(request.destination)) return;

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(request).then((response) => cacheStaticAsset(request, response));
        })
    );
});
