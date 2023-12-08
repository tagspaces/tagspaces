/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {
  platformHaveObjectStoreSupport,
  platformHaveWebDavSupport,
  platformIsMinio,
  platformGetDirSeparator,
  platformEnableObjectStoreSupport,
  platformDisableObjectStoreSupport,
  platformEnableWebdavSupport,
  platformDisableWebdavSupport,
  platformQuitApp,
  platformGetDevicePaths,
  platformGetURLforPath,
  platformListDirectoryPromise,
  platformListMetaDirectoryPromise,
  platformListObjectStoreDir,
  platformSaveFilePromise,
  platformGetPropertiesPromise,
  platformLoadTextFilePromise,
  platformGetFileContentPromise,
  platformSaveTextFilePromise,
  platformSaveBinaryFilePromise,
  platformCreateDirectoryPromise,
  platformCopyFilePromise,
  platformRenameFilePromise,
  platformRenameDirectoryPromise,
  platformMoveDirectoryPromise,
  platformCopyDirectoryPromise,
  platformDeleteFilePromise,
  platformDeleteDirectoryPromise,
  platformSelectDirectoryDialog,
  platformShareFiles,
  platformCreateIndex,
  platformCheckFileExist,
  platformCheckDirExist,
} from '@tagspaces/tagspaces-platforms/platform-io';
import AppConfig from '-/AppConfig';
import { TS } from '-/tagspaces.namespace';
import { Pro } from '-/pro';

export default class PlatformFacade {
  static enableObjectStoreSupport = (objectStoreConfig: any): Promise<any> =>
    platformEnableObjectStoreSupport(objectStoreConfig);

  static disableObjectStoreSupport = (): void =>
    platformDisableObjectStoreSupport();

  static enableWebdavSupport = (webDavConfig: any): void => {
    platformEnableWebdavSupport(webDavConfig);
  };

  static disableWebdavSupport = (): void => platformDisableWebdavSupport();

  static haveObjectStoreSupport = (): boolean =>
    platformHaveObjectStoreSupport();

  static haveWebDavSupport = (): boolean => platformHaveWebDavSupport();

  static isMinio = (): boolean => platformIsMinio();

  static getDirSeparator = (): string => platformGetDirSeparator();

  /**
   * todo rethink this use node path module
   * @param location
   */
  // static getLocationPath = (location: TS.Location): string => platformGetLocationPath(location);

  static setLanguage = (language: string): void => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('set-language', language);
    }
  };

  static setZoomFactorElectron = (zoomLevel) => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('setZoomFactor', zoomLevel);
    }
  };

  static setGlobalShortcuts = (globalShortcutsEnabled) => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage(
        'global-shortcuts-enabled',
        globalShortcutsEnabled,
      );
    }
  };

  static showMainWindow = (): void => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('show-main-window');
    }
  };

  static createNewInstance = (url?: string): void => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('create-new-window', url);
    } else {
      if (url) {
        window.open(url, '_blank');
      } else {
        window.open('index.html', '_blank');
      }
    }
  };

  static quitApp = (): void => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('quitApp');
    } else {
      platformQuitApp();
    }
  };

  /*static watchDirectory = (dirPath: string, listener): void =>
    platformWatchDirectory(dirPath, listener);*/

  static focusWindow = (): void => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('focus-window');
    }
  };

  static getDevicePaths = (): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('getDevicePaths');
    }
    return platformGetDevicePaths();
  };

  /**
   * ObjectStore and webDav only
   * @param path
   * @param expirationInSeconds
   */
  static getURLforPath = (path: string, expirationInSeconds?: number): string =>
    platformGetURLforPath(path, expirationInSeconds);

  /**
   * needs to run in init this function always return false first time
   */
  static isWorkerAvailable = (): Promise<boolean> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('isWorkerAvailable');
    }
    return Promise.resolve(false);
  };

  static readMacOSTags = (filename: string): Promise<TS.Tag[]> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('readMacOSTags', filename);
    }
    return Promise.resolve(undefined);
  };

  static watchFolder = (locationPath, depth) => {
    if (AppConfig.isElectron && Pro) {
      window.electronIO.ipcRenderer.sendMessage(
        'watchFolder',
        locationPath,
        depth,
      );
    }
  };

  /*static watchForEvents = (listener) => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage(
        'watchForEvents',
        listener
      );
    }
  };*/

  /*static tiffJs = () => {
    return platformTiffJs();
  };*/

  static createDirectoryIndexInWorker = (
    directoryPath: string,
    extractText: boolean,
    ignorePatterns: Array<string>,
  ): Promise<any> => {
    if (AppConfig.isElectron) {
      const payload = JSON.stringify({
        directoryPath,
        extractText,
        ignorePatterns,
      });
      return window.electronIO.ipcRenderer.invoke(
        'postRequest',
        payload,
        '/indexer',
      );
    }
    return Promise.reject(
      new Error('createDirectoryIndexInWorker not Electron!'),
    );
  };

  static createThumbnailsInWorker = (
    tmbGenerationList: Array<string>,
  ): Promise<any> => {
    if (AppConfig.isElectron) {
      const payload = JSON.stringify(tmbGenerationList);
      return window.electronIO.ipcRenderer.invoke(
        'postRequest',
        payload,
        '/thumb-gen',
      );
    }
    return Promise.reject(new Error('createThumbnailsInWorker not Electron!'));
  };

  /**
   * Promise === undefined on error
   * @param path
   * @param mode = ['extractTextContent', 'extractThumbPath']
   * @param ignorePatterns
   * @param resultsLimit
   */
  static listDirectoryPromise = (
    path: string,
    mode = ['extractThumbPath'],
    ignorePatterns: Array<string> = [],
    resultsLimit: any = {},
  ): Promise<Array<any>> => {
    if (
      AppConfig.isElectron &&
      !platformHaveObjectStoreSupport() &&
      !platformHaveWebDavSupport()
    ) {
      return window.electronIO.ipcRenderer.invoke(
        'listDirectoryPromise',
        path,
        mode,
        ignorePatterns,
        resultsLimit,
      );
    }
    return platformListDirectoryPromise(
      path, // cleanTrailingDirSeparator(path),
      mode,
      ignorePatterns,
      resultsLimit,
    );
  };

  static listMetaDirectoryPromise = (path: string): Promise<Array<any>> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'listMetaDirectoryPromise',
        path,
      );
    }
    platformListMetaDirectoryPromise(path);
  };

  static listObjectStoreDir = (
    param: Object,
    mode = ['extractThumbPath'],
    ignorePatterns: Array<string> = [],
  ): Promise<Array<any>> =>
    platformListObjectStoreDir(param, mode, ignorePatterns);

  static getPropertiesPromise = (path: string): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('getPropertiesPromise', path);
    }
    return platformGetPropertiesPromise(path);
  };

  static checkDirExist = (dir: string): Promise<boolean> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('checkDirExist', dir);
    }
    return platformCheckDirExist(dir);
  };

  static checkFileExist = (file: string): Promise<boolean> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('checkFileExist', file);
    }
    platformCheckFileExist(file);
  };

  static createDirectoryPromise = (dirPath: string): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'createDirectoryPromise',
        dirPath,
      );
    }
    return platformCreateDirectoryPromise(dirPath);
  };

  /**
   * @param sourceFilePath
   * @param targetFilePath - if exist overwrite it
   */
  static copyFilePromiseOverwrite = (
    sourceFilePath: string,
    targetFilePath: string,
  ): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'copyFilePromiseOverwrite',
        sourceFilePath,
        targetFilePath,
      );
    }
    return platformCopyFilePromise(sourceFilePath, targetFilePath);
  };

  static renameFilePromise = (
    filePath: string,
    newFilePath: string,
    onProgress = undefined,
  ): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'renameFilePromise',
        filePath,
        newFilePath,
        onProgress,
      );
    }
    return platformRenameFilePromise(filePath, newFilePath, onProgress);
  };

  static renameDirectoryPromise = (
    dirPath: string,
    newDirName: string,
  ): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'renameDirectoryPromise',
        dirPath,
        newDirName,
      );
    }
    return platformRenameDirectoryPromise(dirPath, newDirName);
  };

  static uploadAbort = (path?: string): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('uploadAbort', path);
    }
    return Promise.resolve(false);
  };

  static copyDirectoryPromise = (
    param: any,
    newDirPath: string,
    onProgress = undefined,
  ): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'copyDirectoryPromise',
        param,
        newDirPath,
        onProgress !== undefined,
      );
    }
    return platformCopyDirectoryPromise(param, newDirPath, onProgress);
  };

  static moveDirectoryPromise = (
    param: any,
    newDirPath: string,
    onProgress = undefined,
  ): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'moveDirectoryPromise',
        param,
        newDirPath,
        onProgress !== undefined,
      );
    }
    return platformMoveDirectoryPromise(param, newDirPath, onProgress);
  };

  static loadTextFilePromise = (
    filePath: string,
    isPreview?: boolean,
  ): Promise<any> => {
    let path = filePath;
    try {
      path = decodeURIComponent(filePath);
    } catch (ex) {}
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'loadTextFilePromise',
        path,
        isPreview,
      );
    }
    return platformLoadTextFilePromise(path, isPreview);
  };

  static getFileContentPromise = (
    filePath: string,
    type?: string,
  ): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'getFileContentPromise',
        filePath,
        type,
      );
    }
    return platformGetFileContentPromise(filePath, type);
  };

  static getLocalFileContentPromise = (
    filePath: string,
    type?: string,
  ): Promise<any> => {
    return window.electronIO.ipcRenderer.invoke(
      'getLocalFileContentPromise',
      filePath,
      type,
    );
  };

  static saveFilePromise = (
    param: any,
    content: any,
    overwrite: boolean,
  ): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'saveFilePromise',
        param,
        content,
        overwrite,
      );
    }
    return platformSaveFilePromise(param, content, overwrite);
  };

  static saveTextFilePromise = (
    param: any,
    content: string,
    overwrite: boolean,
  ): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'saveTextFilePromise',
        param,
        content,
        overwrite,
      );
    }
    return platformSaveTextFilePromise(param, content, overwrite);
  };

  static saveBinaryFilePromise = (
    param: any,
    content: any,
    overwrite: boolean,
    onUploadProgress?: (
      progress: any, // ManagedUpload.Progress,
      response: any, // AWS.Response<AWS.S3.PutObjectOutput, AWS.AWSError>
    ) => void,
  ): Promise<TS.FileSystemEntry> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'saveBinaryFilePromise',
        param,
        content,
        overwrite,
        onUploadProgress,
      );
    }

    return platformSaveBinaryFilePromise(
      param,
      content,
      overwrite,
      onUploadProgress,
    );
  };

  static deleteFilePromise = (
    path: string,
    useTrash?: boolean,
  ): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'deleteFilePromise',
        path,
        useTrash,
      );
    }
    return platformDeleteFilePromise(path);
  };

  static deleteDirectoryPromise = (
    path: string,
    useTrash?: boolean,
  ): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'deleteDirectoryPromise',
        path,
        useTrash,
      );
    }
    return platformDeleteDirectoryPromise(path, useTrash);
  };

  static openDirectory = (dirPath: string): void => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('openDirectory', dirPath);
    } else {
      console.error('Is supported only in Electron');
    }
  };

  static openFile = (
    filePath: string,
    warningOpeningFilesExternally: boolean,
  ): void => {
    if (
      !warningOpeningFilesExternally ||
      // eslint-disable-next-line no-restricted-globals
      confirm(
        'Do you really want to open "' +
          filePath +
          '"? Execution of some files can be potentially dangerous!',
      )
    ) {
      if (AppConfig.isElectron) {
        window.electronIO.ipcRenderer.sendMessage('openFile', filePath);
      } else {
        console.error('Is supported only in Electron');
      }
    }
  };

  static openUrl = (url: string): void => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('openUrl', url);
    } else {
      console.error('Is supported only in Electron');
    }
  };

  static selectDirectoryDialog = (): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('selectDirectoryDialog');
    }
    return platformSelectDirectoryDialog();
  };

  /**
   * cordova only
   * @param files
   */
  static shareFiles = (files: Array<string>): void => {
    platformShareFiles(files);
  };

  static createIndex(
    param: any,
    listDirectoryPromise,
    loadTextFilePromise,
    mode: string[],
    ignorePatterns: Array<string>,
  ) {
    return platformCreateIndex(
      param,
      listDirectoryPromise,
      loadTextFilePromise,
      mode,
      ignorePatterns,
    );
  }

  /**
   *  Load extensions is supported only on Electron
   */
  static loadExtensions() {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('load-extensions');
    }
  }

  static removeExtension(extensionId: string) {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('removeExtension', extensionId);
    } else {
      console.error('remove extensions is supported only on Electron.');
    }
  }

  static getUserDataDir(): Promise<string> {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('getUserDataDir');
    } else {
      return Promise.reject('getUserDataDir is supported only on Electron.');
    }
  }

  static unZip(filePath, targetPath): Promise<string> {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'unZip',
        filePath,
        targetPath,
      );
    } else {
      console.log('UnZip is supported only on Electron.');
    }
  }

  static getDirProperties(path): Promise<TS.DirProp> {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('getDirProperties', path);
    } else {
      return Promise.reject(
        new Error(
          'platformDirProperties is supported on Electron local storage.',
        ),
      );
    }
  }
}
