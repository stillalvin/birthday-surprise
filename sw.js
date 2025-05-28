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
                // Return cached version or fetch new
                return response || fetch(event.request)
                    .then((response) => {
                        // Cache new responses
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return response;
                    });
            })
    );
});

// Push Notification
self.addEventListener('push', (event) => {
    const options = {
        body: 'Alvin made you something special!',
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
        self.registration.showNotification('🎉 Happy Birthday!', options)
    );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
}); 