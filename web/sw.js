'use strict';

importScripts('sw-config.js');

self.addEventListener('install', evt => {
  console.log('[ServiceWorker] Install');
  caches
    .open(CACHE_NAME)
    .then(cache => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
    .catch(err => console.warn('Error opening cache ' + err));
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  console.log('[ServiceWorker] Activate');
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
  if (evt.request.mode !== 'navigate') {
    return;
  }
  evt.respondWith(
    fetch(evt.request).catch(() => {
      return caches.open(CACHE_NAME).then(cache => {
        return cache.match('offline.html');
      });
    })
  );
});
