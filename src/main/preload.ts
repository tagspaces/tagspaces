// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  webUtils,
} from 'electron';

export type Channels =
  | 'isWorkerAvailable'
  | 'fetchUrl'
  | 'fetchUrlBuffer'
  | 'probeContentType'
  | 'isDirectory'
  | 'resolveRelativePaths'
  | 'set-language'
  | 'setZoomFactor'
  | 'global-shortcuts-enabled'
  | 'show-main-window'
  | 'create-new-window'
  | 'file-changed'
  | 'description-changed'
  | 'quitApp'
  | 'focus-window'
  | 'getDevicePaths'
  | 'readMacOSTags'
  | 'reloadWindow'
  | 'newChatSession'
  | 'newChatMessage'
  | 'ChatMessage'
  | 'PullModel'
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
  | 'get-user-ext-config'
  | 'unZip'
  | 'getDirProperties'
  | 'set_extensions'
  | 'play-pause'
  | 'cmd'
  | 'toggle-about-dialog'
  | 'show-create-directory-dialog'
  | 'toggle-keys-dialog'
  | 'toggle-license-dialog'
  | 'toggle-open-link-dialog'
  | 'new-text-file'
  | 'new-md-file'
  | 'toggle-onboarding-dialog'
  | 'toggle-settings-dialog'
  | 'toggle-third-party-libs-dialog'
  | 'perspective'
  | 'panels'
  | 'history'
  | 'progress'
  | 'uploadAbort'
  | 'getOllamaModels'
  | 'newOllamaMessage'
  | 'pullOllamaModel'
  | 'deleteOllamaModel'
  | 'startup-finished'
  | 'getAuthor'
  | 'cancelRequest'
  | 'encryptCredentials'
  | 'decryptCredentials'
  | 'getCredentialKeyStatus'
  | 'getWindowCount'
  | 'flushStorageData'
  | 'fetchTile';

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
    getSync(command: Channels, ...args: unknown[]) {
      return ipcRenderer.sendSync(command, ...args);
    },
    removeAllListeners(channel: string) {
      ipcRenderer.removeAllListeners(channel);
    },
    startDrag: (fileName) => ipcRenderer.send('ondragstart', fileName),
    getPathForFile(file: File) {
      return webUtils.getPathForFile(file);
    },
  },
  // CPU architecture of the running Electron binary ('arm64' | 'x64' | …).
  // process isn't available in the sandboxed renderer, so surface it here
  // for arch-specific logic like picking the update descriptor file.
  arch: process.arch,
};

contextBridge.exposeInMainWorld('electronIO', electronHandler);
/*contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
})*/
export type ElectronHandler = typeof electronHandler;
