const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

console.debug('loading preload');
contextBridge.exposeInMainWorld('electron', {
  startDrag: fileName => {
    ipcRenderer.send('ondragstart', path.join(process.cwd(), fileName));
  }
});
