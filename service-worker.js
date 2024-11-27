self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/tracker.html',
        '/styles.css',
        '/script.js',
        '/android/android-launchericon-512-512.png',
        '/android/android-launchericon-192-192.png',
        '/android/android-launchericon-144-144.png',
        '/android/android-launchericon-96-96.png',
        '/android/android-launchericon-72-72.png',
        '/android/android-launchericon-48-48.png'
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
