// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'isWorkerAvailable'
  | 'isDirectory'
  | 'resolveRelativePaths'
  | 'set-language'
  | 'setZoomFactor'
  | 'global-shortcuts-enabled'
  | 'show-main-window'
  | 'create-new-window'
  | 'quitApp'
  | 'focus-window'
  | 'getDevicePaths'
  | 'readMacOSTags'
  | 'reloadWindow'
  | 'watchFolder'
  | 'postRequest'
  | 'listDirectoryPromise'
  | 'listMetaDirectoryPromise'
  | 'getPropertiesPromise'
  | 'checkDirExist'
  | 'checkFileExist'
  | 'createDirectoryPromise'
  | 'copyFilePromiseOverwrite'
  | 'renameFilePromise'
  | 'renameDirectoryPromise'
  | 'copyDirectoryPromise'
  | 'moveDirectoryPromise'
  | 'loadTextFilePromise'
  | 'getFileContentPromise'
  | 'saveFilePromise'
  | 'saveTextFilePromise'
  | 'saveBinaryFilePromise'
  | 'deleteFilePromise'
  | 'deleteDirectoryPromise'
  | 'openDirectory'
  | 'openFile'
  | 'openUrl'
  | 'selectDirectoryDialog'
  | 'load-extensions'
  | 'removeExtension'
  | 'getUserDataDir'
  | 'unZip'
  | 'getDirProperties'
  | 'folderChanged'
  | 'set_extensions'
  | 'play-pause'
  | 'cmd'
  | 'progress'
  | 'uploadAbort';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke(command: Channels, ...args: unknown[]) {
      return ipcRenderer.invoke(command, ...args);
    },
    removeAllListeners(channel: string) {
      ipcRenderer.removeAllListeners(channel);
    },
  },
};

contextBridge.exposeInMainWorld('electronIO', electronHandler);
/*contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
})*/
export type ElectronHandler = typeof electronHandler;
