const CACHE_NAME = 'todo-0x58-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/app.js',
  './src/utils/helpers.js',
  './src/services/storage.js',
  './src/services/notifications.js',
  './src/components/TaskCard.js',
  './src/components/Calendar.js',
  './src/components/StatsRing.js',
  './src/pages/HomePage.js',
  './src/pages/TasksPage.js',
  './src/pages/CalendarPage.js',
  './src/pages/StatsPage.js',
  './src/pages/SettingsPage.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest/dist/umd/lucide.min.js',
  'https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap'
];

const ICON_ASSETS = [
  './src/assets/icons/icon-72x72.png',
  './src/assets/icons/icon-96x96.png',
  './src/assets/icons/icon-128x128.png',
  './src/assets/icons/icon-144x144.png',
  './src/assets/icons/icon-152x152.png',
  './src/assets/icons/icon-192x192.png',
  './src/assets/icons/icon-384x384.png',
  './src/assets/icons/icon-512x512.png',
  './src/assets/icons/maskable-icon.png'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...STATIC_ASSETS, ...ICON_ASSETS]);
    }).catch(() => {
      // Graceful fallback - cache what we can
      return caches.open(CACHE_NAME).then((cache) => {
        return Promise.all(
          [...STATIC_ASSETS, ...ICON_ASSETS].map(url => 
            fetch(url).then(response => {
              if (response.ok) cache.put(url, response);
            }).catch(() => {})
          )
        );
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Cache-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) URLs
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse.clone());
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Network fallback
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback for HTML pages
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkNotifications());
  }
});

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkNotifications());
  }
});

async function checkNotifications() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'CHECK_NOTIFICATIONS' });
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'لديك مهمة قادمة!',
    icon: './src/assets/icons/icon-192x192.png',
    badge: './src/assets/icons/icon-72x72.png',
    tag: data.tag || 'task-reminder',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'فتح التطبيق' },
      { action: 'dismiss', title: 'تجاهل' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ToDo 0x58', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].focus();
        } else {
          self.clients.openWindow('./');
        }
      })
    );
  }
});
