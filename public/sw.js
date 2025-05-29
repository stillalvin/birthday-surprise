const CACHE_NAME = 'birthday-gift-v1';
const ASSETS_TO_CACHE = [
    '/birthday-surprise/',
    '/birthday-surprise/index.html',
    '/birthday-surprise/style.css',
    '/birthday-surprise/scripts.js',
    '/birthday-surprise/manifest.json',
    '/birthday-surprise/images/gift.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate Service Worker
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

// Fetch Event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the response
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        // Return a fallback response or the cached version
                        return caches.match('/birthday-surprise/offline.html')
                            .then(response => response || new Response('Offline content not available'));
                    });
            })
    );
});

// Push Notification
self.addEventListener('push', (event) => {
    const options = {
        body: 'I(Alvin) made you something special!',
        icon: '/birthday-surprise/images/gift.png',
        badge: '/birthday-surprise/images/gift.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open Gift',
                icon: '/birthday-surprise/images/gift.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('🎉 Happy Birthday Jenny!', options)
    );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                // If a window is already open, focus it
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise, open a new window
                if (clients.openWindow) {
                    return clients.openWindow('/birthday-surprise/');
                }
            })
        );
    }
}); 