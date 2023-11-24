// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'set-language'
  | 'setZoomFactor'
  | 'global-shortcuts-enabled'
  | 'show-main-window'
  | 'create-new-window'
  | 'quitApp'
  | 'focus-window'
  | 'getDevicePaths'
  | 'readMacOSTags'
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
  | 'getLocalFileContentPromise'
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
  | 'getDirProperties';

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
  },
};

contextBridge.exposeInMainWorld('electronIO', electronHandler);
export type ElectronHandler = typeof electronHandler;
