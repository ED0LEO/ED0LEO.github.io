self.addEventListener('install', function(event) {
    console.log('Service Worker installing.');
    // Perform install steps
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
