/*
import { BrowserWindow } from 'electron';
import Chokidar = require('chokidar');

let watcher;

const sendMessage = (
  mainWindow: BrowserWindow,
  nameMessage: string,
  message: Changed,
) => {
  try {
    mainWindow.webContents.send(nameMessage, message);
  } catch (ex) {
    console.error(ex);
    stopWatching();
  }
};

export function stopWatching() {
  if (watcher && watcher.close) {
    watcher.close();
  }
  watcher = undefined;
}
export function watchFolder(
  mainWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  path: string,
  depth,
) {
  console.log('Start watching: ' + path);
  if (process.env.NODE_ENV === 'development') {
    // TODO chokidar do not work in package https://github.com/electron/forge/issues/2594
    stopWatching();
    watcher = Chokidar.watch(path, {
      ignored: (
        path, //, stats) =>
      ) =>
        (/(^|[\/\\])\../.test(path) && !path.includes('.ts')) || // ignoring .dotfiles but not dirs like .ts
        (path.includes('.ts') && path.includes('tsi.json')), // ignoring .ts/tsi.json folder
      //  /(^|[\/\\])\../.test(path) || path.includes('.ts'), // ignoring .dotfiles // ignoring .ts folder
      // (stats && stats.isDirectory()),  // ignoring directories
      ignoreInitial: true,
      depth,
    });

    watcher.on('all', (event, path) =>
      sendMessage(mainWindow, 'folderChanged', {
        path,
        eventName: event,
      }),
    );
  }
}

/!*export function watchFile(
  mainWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  message: Message
) {
  const { filePath, nameWatcher } = message;
  const watcher = Chokidar.watch(filePath, { ignoreInitial: true });

  watcher
    .on("add", (path) =>
      sendMessage(watcher, mainWindow, "fileChanged", {
        path,
        eventName: "add",
        nameWatcher,
      })
    )
    .on("change", (path) =>
      sendMessage(watcher, mainWindow, "fileChanged", {
        path,
        eventName: "change",
        nameWatcher,
      })
    )
    .on("unlink", (path) =>
      sendMessage(watcher, mainWindow, "fileChanged", {
        path,
        eventName: "unlink",
        nameWatcher,
      })
    );
}*!/

export interface Message {
  path: string;
  depth?: number;
}
*/
export interface Changed {
  path: string;
  eventName: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
}
