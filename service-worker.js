self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/tracker.html',
        '/styles.css',
        '/script.js',
        '/icon512_maskable.png',
        '/icon512_rounded.png'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
    console.log('Fetching:', event.request.url);
    // Respond with the cached resource or fetch from the network
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
