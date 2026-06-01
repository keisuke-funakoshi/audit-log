// Service Worker - キャッシュなし版（常に最新を取得）
self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  // 全キャッシュを削除
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        console.log('Deleting cache:', k);
        return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

// キャッシュせず常にネットワークから取得
self.addEventListener('fetch', function(e){
  e.respondWith(fetch(e.request));
});
