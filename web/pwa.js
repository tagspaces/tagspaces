'use strict';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('sw.js')
      .then(reg => {
        document.title = 'TagSpaces - ' + document.location.hostname;
        // console.log('TagSpaces service worker registered.', reg);
        return true;
      })
      .catch(err =>
        console.warn('Error registering TagSpaces service worker ' + err)
      );
  });
}
