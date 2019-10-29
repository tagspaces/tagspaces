'use strict';

const CACHE_NAME = 'TAGSPACES_VERSION';

const FILES_TO_CACHE = [
  'dist/bundle.js',
  'dist/style.css',
  'dist/roboto-v18-cyrillic_latin-100.ttf',
  'dist/roboto-v18-cyrillic_latin-100.woff',
  'dist/roboto-v18-cyrillic_latin-100.woff2',
  'dist/roboto-v18-cyrillic_latin-300.ttf',
  'dist/roboto-v18-cyrillic_latin-300.woff',
  'dist/roboto-v18-cyrillic_latin-300.woff2',
  'dist/roboto-v18-cyrillic_latin-500.ttf',
  'dist/roboto-v18-cyrillic_latin-500.woff',
  'dist/roboto-v18-cyrillic_latin-500.woff2',
  'dist/roboto-v18-cyrillic_latin-700.ttf',
  'dist/roboto-v18-cyrillic_latin-700.woff',
  'dist/roboto-v18-cyrillic_latin-700.woff2',
  'dist/roboto-v18-cyrillic_latin-900.ttf',
  'dist/roboto-v18-cyrillic_latin-900.woff',
  'dist/roboto-v18-cyrillic_latin-900.woff2',
  'dist/roboto-v18-cyrillic_latin-regular.ttf',
  'dist/roboto-v18-cyrillic_latin-regular.woff',
  'dist/roboto-v18-cyrillic_latin-regular.woff2',
];

self.addEventListener('install', (evt) => {
  // console.log('[ServiceWorker] Install');
  caches.open(CACHE_NAME).then((cache) => {
    console.log('[ServiceWorker] Pre-caching offline page');
    return cache.addAll(FILES_TO_CACHE);
  }).catch(err => console.warn('Error opening cache ' + err))
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  // console.log('[ServiceWorker] Activate');
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  // console.log('[ServiceWorker] Fetch', evt.request.url);
  if (evt.request.mode !== 'navigate') {
    return;
  }
  evt.respondWith(
    fetch(evt.request)
      .catch(() => {
        return caches.open(CACHE_NAME)
          .then((cache) => {
            return cache.match('offline.html');
          });
      })
  );
});
