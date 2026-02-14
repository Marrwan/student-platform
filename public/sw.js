// Self-destructing Service Worker to clear caches and stop interception
// This ensures that any broken caches (like Paystack scripts) are removed immediately

self.addEventListener('install', (event) => {
  console.log('Installing Killer SW');
  self.skipWaiting(); // Force activation
});

self.addEventListener('activate', (event) => {
  console.log('Activating Killer SW - Clearing Caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

self.addEventListener('fetch', (event) => {
  // Pass through to network - do not intercept
  // event.respondWith(fetch(event.request)); // Optional, default is network anyway if no respondWith
});