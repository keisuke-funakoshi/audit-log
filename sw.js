// Service Worker - 安定版（iOS PWAクラッシュ・画面切替バグ防止）
var CACHE_NAME = 'audit-log-pwa-v2';
var CORE_FILES = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function(e){
  // skipWaiting() を削除 → 入力中に突然SW更新・画面切替が起きなくなる
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(CORE_FILES);
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){
        return k !== CACHE_NAME;
      }).map(function(k){
        return caches.delete(k);
      }));
    })
    // clients.claim() を削除 → 強制引き継ぎによる画面切替が起きなくなる
  );
});

// ネットワーク優先・失敗時はキャッシュから返す
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET'){
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    fetch(e.request).then(function(response){
      if(response && response.status === 200){
        var resClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(e.request, resClone);
        });
      }
      return response;
    }).catch(function(){
      // ネットワーク失敗 → キャッシュから返す
      return caches.match(e.request).then(function(cached){
        return cached || new Response('Offline', {status: 503});
      });
    })
  );
});
