'use strict';
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((reg) => {
      // console.log('TagSpaces service worker registered.', reg);
      return true;
    }).catch(err => console.warn('Error registering TagSpaces service worker ' + err));
  });
}
