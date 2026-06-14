const CACHE_NAME = 'reg-data-cache-v2';
// Daftar file yang akan disimpan untuk penggunaan offline
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Proses Install: Menyimpan file ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Membuka cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Proses Fetch: Menampilkan data dari cache jika sedang offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ada di cache, tampilkan. Jika tidak, ambil dari jaringan (internet)
        return response || fetch(event.request);
      })
  );
});
