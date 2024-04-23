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
/*

import * as cordovaIO from '@tagspaces/tagspaces-common-cordova';
import AppConfig from '-/AppConfig';
import { TS } from '-/tagspaces.namespace';
import { Pro } from '-/pro';
import { openUrlForWeb } from '-/services/utils-io';

let objectStoreAPI, webDavAPI;
const urlCache = {};

export default class PlatformFacade {
  static getPath(param) {
    if (typeof param === 'object' && param !== null) {
      return param.path;
    } else if (param) {
      return param;
    }
    return '';
  }

  static enableObjectStoreSupport = (objectStoreConfig: any): Promise<any> => {
    // DisableWebdavSupport
    webDavAPI = undefined;
    return new Promise((resolve, reject) => {
      if (
        objectStoreAPI !== undefined &&
        objectStoreAPI.config().bucketName === objectStoreConfig.bucketName &&
        objectStoreAPI.config().secretAccessKey ===
          objectStoreConfig.secretAccessKey &&
        objectStoreAPI.config().region === objectStoreConfig.region &&
        objectStoreAPI.config().endpointURL === objectStoreConfig.endpointURL &&
        objectStoreAPI.config().accessKeyId === objectStoreConfig.accessKeyId
      ) {
        resolve(true);
      } else {
        objectStoreAPI = require('@tagspaces/tagspaces-common-aws/io-objectstore');
        objectStoreAPI.configure(objectStoreConfig);
        resolve(true);
      }
    });
  };

  static disableObjectStoreSupport = (): void => (objectStoreAPI = undefined);

  static enableWebdavSupport = (webDavConfig: any): void => {
    objectStoreAPI = undefined;
    if (
      webDavAPI === undefined ||
      webDavAPI.username !== webDavConfig.username ||
      webDavAPI.password !== webDavConfig.password ||
      webDavAPI.port !== webDavConfig.port
    ) {
      //webDavAPI = require("@tagspaces/tagspaces-common-webdav/io-webdav");
      //webDavAPI.configure(webDavConfig);
    }
  };

  static disableWebdavSupport = (): void => (webDavAPI = undefined);

  static haveObjectStoreSupport = (): boolean => objectStoreAPI !== undefined;

  static haveWebDavSupport = (): boolean => webDavAPI !== undefined;

  static isMinio = (): boolean =>
    objectStoreAPI !== undefined && objectStoreAPI.config().endpointURL;

  static getDirSeparator = (): string => {
    // TODO rethink usage for S3 on Win
    return objectStoreAPI !== undefined || webDavAPI !== undefined
      ? '/'
      : AppConfig.dirSeparator;
  };

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
    } /!*else {
      platformQuitApp();
    }*!/
  };

  /!*static watchDirectory = (dirPath: string, listener): void =>
    platformWatchDirectory(dirPath, listener);*!/

  static focusWindow = (): void => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('focus-window');
    }
  };

  static getDevicePaths = (): Promise<any> => {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('getDevicePaths');
    } else if (AppConfig.isCordova) {
      return cordovaIO.getDevicePaths();
    } else {
      console.log('getDevicePaths not supported');
      return Promise.resolve(undefined);
    }
  };

  /!**
   * ObjectStore and webDav only
   * Function to generate or retrieve cached URL with expiration date
   * @param path
   * @param expirationInSeconds
   *!/
  static getURLforPath = (
    path: string,
    expirationInSeconds: number = 900,
  ): string => {
    const currentTime = new Date().getTime();

    // Check if URL is cached and not expired
    if (urlCache[path] && urlCache[path].expirationTime > currentTime) {
      return urlCache[path].url;
    } else {
      // Generate new URL and cache it with expiration time
      return this.generateURLforPath(path, expirationInSeconds);
    }
  };

  static generateURLforPath = (path, expirationInSeconds) => {
    let url;
    if (objectStoreAPI) {
      const param = {
        path,
        bucketName: objectStoreAPI.config().bucketName,
      };
      url = objectStoreAPI.getURLforPath(param, expirationInSeconds);
    } else if (webDavAPI) {
      url = webDavAPI.getURLforPath(path);
    }
    if (url) {
      urlCache[path] = {
        url: url,
        expirationTime: new Date().getTime() + expirationInSeconds * 1000,
      };
    }
    return url;
  };

  /!**
   * needs to run in init this function always return false first time
   *!/
  static isWorkerAvailable = (): Promise<boolean> => {
    if (
      AppConfig.isElectron &&
      objectStoreAPI === undefined &&
      webDavAPI === undefined
    ) {
      return window.electronIO.ipcRenderer.invoke('isWorkerAvailable');
    }
    return Promise.resolve(false);
  };

  static readMacOSTags = (filename: string): Promise<TS.Tag[]> => {
    if (
      AppConfig.isElectron &&
      objectStoreAPI === undefined &&
      webDavAPI === undefined
    ) {
      return window.electronIO.ipcRenderer.invoke('readMacOSTags', filename);
    }
    return Promise.resolve(undefined);
  };

  static watchFolder = (locationPath, depth) => {
    if (
      AppConfig.isElectron &&
      Pro &&
      objectStoreAPI === undefined &&
      webDavAPI === undefined
    ) {
      window.electronIO.ipcRenderer.sendMessage(
        'watchFolder',
        locationPath,
        depth,
      );
    }
  };

  /!*static tiffJs = () => {
    return platformTiffJs();
  };*!/

  static createDirectoryIndexInWorker = (
    directoryPath: string,
    extractText: boolean,
    ignorePatterns: Array<string>,
  ): Promise<any> => {
    if (
      AppConfig.isElectron &&
      objectStoreAPI === undefined &&
      webDavAPI === undefined
    ) {
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
    if (
      AppConfig.isElectron &&
      objectStoreAPI === undefined &&
      webDavAPI === undefined
    ) {
      const payload = JSON.stringify(tmbGenerationList);
      return window.electronIO.ipcRenderer.invoke(
        'postRequest',
        payload,
        '/thumb-gen',
      );
    }
    return Promise.reject(new Error('createThumbnailsInWorker not Electron!'));
  };

  /!**
   * Promise === undefined on error
   * @param path
   * @param mode = ['extractTextContent', 'extractThumbPath']
   * @param ignorePatterns
   * @param resultsLimit
   *!/
  static listDirectoryPromise = (
    path: string,
    mode = ['extractThumbPath'],
    ignorePatterns: Array<string> = [],
    resultsLimit: any = {},
  ): Promise<Array<any>> => {
    if (objectStoreAPI) {
      const param = {
        path,
        bucketName: objectStoreAPI.config().bucketName,
      };
      return objectStoreAPI.listDirectoryPromise(
        param,
        mode,
        ignorePatterns,
        resultsLimit,
      );
    } else if (webDavAPI) {
      return webDavAPI.listDirectoryPromise(path, mode, ignorePatterns);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'listDirectoryPromise',
        path,
        mode,
        ignorePatterns,
        resultsLimit,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.listDirectoryPromise(path, mode, ignorePatterns);
    }

    return Promise.reject(new Error('listDirectoryPromise not implemented!'));
  };

  static listMetaDirectoryPromise = (path: string): Promise<Array<any>> => {
    if (objectStoreAPI) {
      const param = {
        path,
        bucketName: objectStoreAPI.config().bucketName,
      };
      return objectStoreAPI.listMetaDirectoryPromise(param);
    } else if (webDavAPI) {
      return webDavAPI.listMetaDirectoryPromise(path);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'listMetaDirectoryPromise',
        path,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.listMetaDirectoryPromise(path);
    }

    return Promise.reject(
      new Error('listMetaDirectoryPromise not implemented!'),
    );
  };

  static listObjectStoreDir = (
    param: Object,
    mode = ['extractThumbPath'],
    ignorePatterns: Array<string> = [],
  ): Promise<Array<any>> => {
    if (objectStoreAPI) {
      return objectStoreAPI.listDirectoryPromise(
        { ...param, bucketName: objectStoreAPI.config().bucketName },
        mode,
        ignorePatterns,
      );
    } else {
      return Promise.reject(
        new Error('platformListObjectStoreDir: no objectStoreAPI'),
      );
    }
  };

  static getPropertiesPromise = (path: string): Promise<any> => {
    if (objectStoreAPI) {
      const param = {
        path,
        bucketName: objectStoreAPI.config().bucketName,
      };
      return objectStoreAPI.getPropertiesPromise(param);
    } else if (webDavAPI) {
      return webDavAPI.getPropertiesPromise(path);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('getPropertiesPromise', path);
    } else if (AppConfig.isCordova) {
      return cordovaIO.getPropertiesPromise(path);
    }
    return Promise.reject(new Error('getPropertiesPromise: not implemented'));
  };

  static checkDirExist = (dir: string): Promise<boolean> => {
    if (objectStoreAPI) {
      return objectStoreAPI
        .getPropertiesPromise({
          path: dir,
          bucketName: objectStoreAPI.config().bucketName,
        })
        .then((stats) => stats && !stats.isFile);
    } else if (webDavAPI) {
      return webDavAPI
        .getPropertiesPromise(dir)
        .then((stats) => stats && !stats.isFile);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('checkDirExist', dir);
    } else if (AppConfig.isCordova) {
      // In cordova this check is too expensive for dirs like /.ts
      return cordovaIO.checkDirExist(dir);
    }
    return Promise.reject(new Error('checkDirExist: not implemented'));
  };

  static checkFileExist = (file: string): Promise<boolean> => {
    if (file === undefined) {
      return Promise.resolve(false);
    }
    if (objectStoreAPI) {
      return objectStoreAPI.isFileExist({
        path: file,
        bucketName: objectStoreAPI.config().bucketName,
      });
      //.then((stats) => stats && stats.isFile);
    } else if (webDavAPI) {
      return webDavAPI
        .getPropertiesPromise(file)
        .then((stats) => stats && stats.isFile);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('checkFileExist', file);
    } else if (AppConfig.isCordova) {
      return cordovaIO.checkFileExist(file);
    }

    return Promise.reject(new Error('checkFileExist: not implemented'));
  };

  static createDirectoryPromise = (dirPath: string): Promise<any> => {
    if (objectStoreAPI) {
      const param = {
        path: dirPath,
        bucketName: objectStoreAPI.config().bucketName,
      };
      return objectStoreAPI.createDirectoryPromise(param);
    } else if (webDavAPI) {
      return webDavAPI.createDirectoryPromise(dirPath);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'createDirectoryPromise',
        dirPath,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.createDirectoryPromise(dirPath);
    }
    return Promise.reject(new Error('createDirectoryPromise: not implemented'));
  };

  /!**
   * @param sourceFilePath
   * @param targetFilePath - if exist overwrite it
   *!/
  static copyFilePromiseOverwrite = (
    sourceFilePath: string,
    targetFilePath: string,
  ): Promise<any> => {
    if (objectStoreAPI) {
      const param = {
        path: sourceFilePath,
        bucketName: objectStoreAPI.config().bucketName,
      };
      return objectStoreAPI.copyFilePromise(param, targetFilePath);
    } else if (webDavAPI) {
      return webDavAPI.copyFilePromise(sourceFilePath, targetFilePath);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'copyFilePromiseOverwrite',
        sourceFilePath,
        targetFilePath,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.copyFilePromise(sourceFilePath, targetFilePath);
    }
    return Promise.reject(new Error('createDirectoryPromise: not implemented'));
  };

  static renameFilePromise = (
    filePath: string,
    newFilePath: string,
    onProgress = undefined,
  ): Promise<any> => {
    if (objectStoreAPI) {
      const param = {
        path: filePath,
        bucketName: objectStoreAPI.config().bucketName,
      };
      return objectStoreAPI.renameFilePromise(param, newFilePath, onProgress);
      // .then(result => result);
    } else if (webDavAPI) {
      return webDavAPI.renameFilePromise(filePath, newFilePath, onProgress);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'renameFilePromise',
        filePath,
        newFilePath,
        onProgress !== undefined,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.renameFilePromise(filePath, newFilePath, onProgress);
    }
    return Promise.reject(new Error('renameFilePromise: not implemented'));
  };

  static renameDirectoryPromise = (
    dirPath: string,
    newDirName: string,
  ): Promise<any> => {
    if (objectStoreAPI) {
      const param = {
        path: dirPath,
        bucketName: objectStoreAPI.config().bucketName,
      };
      return objectStoreAPI.renameDirectoryPromise(param, newDirName);
    } else if (webDavAPI) {
      return webDavAPI.renameDirectoryPromise(dirPath, newDirName);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'renameDirectoryPromise',
        dirPath,
        newDirName,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.renameDirectoryPromise(dirPath, newDirName);
    }
    return Promise.reject(new Error('renameDirectoryPromise: not implemented'));
  };

  static uploadAbort = (path?: string): Promise<any> => {
    if (AppConfig.isElectron && !objectStoreAPI && !webDavAPI) {
      return window.electronIO.ipcRenderer.invoke('uploadAbort', path);
    }
    return Promise.resolve(false);
  };

  static copyDirectoryPromise = (
    param: any,
    newDirPath: string,
    onProgress = undefined,
  ): Promise<any> => {
    if (objectStoreAPI) {
      const params = {
        ...param,
        bucketName: objectStoreAPI.config().bucketName,
      };
      return objectStoreAPI.copyDirectoryPromise(
        params,
        newDirPath,
        onProgress,
      );
    } else if (webDavAPI) {
      return webDavAPI.copyDirectoryPromise(param, newDirPath, onProgress);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'copyDirectoryPromise',
        param,
        newDirPath,
        onProgress !== undefined,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.copyDirectoryPromise(param, newDirPath, onProgress);
    }
    return Promise.reject(new Error('copyDirectoryPromise: not implemented'));
  };

  static moveDirectoryPromise = (
    param: any,
    newDirPath: string,
    onProgress = undefined,
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.moveDirectoryPromise(
        {
          ...param,
          bucketName: objectStoreAPI.config().bucketName,
        },
        newDirPath,
        onProgress,
      );
    } else if (webDavAPI) {
      return webDavAPI.moveDirectoryPromise(param, newDirPath, onProgress);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'moveDirectoryPromise',
        param,
        newDirPath,
        onProgress !== undefined,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.moveDirectoryPromise(param, newDirPath, onProgress);
    }
    return Promise.reject(new Error('moveDirectoryPromise: not implemented'));
  };

  static loadTextFilePromise = (
    param: any,
    isPreview?: boolean,
  ): Promise<string> => {
    let filePath = this.getPath(param);
    try {
      filePath = decodeURIComponent(filePath);
    } catch (ex) {}
    if (objectStoreAPI) {
      return objectStoreAPI.loadTextFilePromise(
        {
          path: filePath,
          bucketName: objectStoreAPI.config().bucketName,
        },
        isPreview,
      );
    } else if (webDavAPI) {
      return webDavAPI.loadTextFilePromise(filePath, isPreview);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'loadTextFilePromise',
        filePath,
        isPreview,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.loadTextFilePromise(filePath, isPreview);
    }
    return Promise.reject(new Error('loadTextFilePromise: not implemented'));
  };

  static getFileContentPromise = (
    filePath: string,
    type?: string,
  ): Promise<any> => {
    if (objectStoreAPI) {
      const param = {
        path: filePath,
        bucketName: objectStoreAPI.config().bucketName,
      };
      return objectStoreAPI.getFileContentPromise(param, type);
    } else if (webDavAPI) {
      return webDavAPI.getFileContentPromise(filePath, type);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'getFileContentPromise',
        filePath,
        type,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.getFileContentPromise(filePath, type);
    }
    return Promise.reject(new Error('getFileContentPromise: not implemented'));
  };

  static getLocalFileContentPromise = (
    filePath: string,
    type?: string,
  ): Promise<any> => {
    return window.electronIO.ipcRenderer.invoke(
      'getFileContentPromise',
      filePath,
      type,
    );
  };

  static saveFilePromise = (
    param: any,
    content: any,
    overwrite: boolean,
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.saveFilePromise(
        {
          ...param,
          bucketName: objectStoreAPI.config().bucketName,
        },
        content,
        overwrite,
      );
    } else if (webDavAPI) {
      return webDavAPI.saveFilePromise(param, content, overwrite);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'saveFilePromise',
        param,
        content,
        overwrite,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.saveFilePromise(param, content, overwrite);
    }
    return Promise.reject(new Error('saveFilePromise: not implemented'));
  };

  static saveTextFilePromise = (
    param: any,
    content: string,
    overwrite: boolean,
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.saveTextFilePromise(
        {
          ...param,
          bucketName: objectStoreAPI.config().bucketName,
        },
        content,
        overwrite,
      );
    } else if (webDavAPI) {
      return webDavAPI.saveTextFilePromise(param, content, overwrite);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'saveTextFilePromise',
        param,
        content,
        overwrite,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.saveTextFilePromise(param, content, overwrite);
    }
    return Promise.reject(new Error('saveTextFilePromise: not implemented'));
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
    if (objectStoreAPI) {
      return objectStoreAPI.saveBinaryFilePromise(
        {
          ...param,
          bucketName: objectStoreAPI.config().bucketName,
        },
        content,
        overwrite,
        onUploadProgress,
      );
    } else if (webDavAPI) {
      return webDavAPI.saveBinaryFilePromise(
        param,
        content,
        overwrite,
        onUploadProgress,
      );
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'saveBinaryFilePromise',
        param,
        content,
        overwrite,
        !!onUploadProgress,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO
        .saveBinaryFilePromise(param, content, overwrite)
        .then((succeeded) => {
          if (succeeded && onUploadProgress) {
            onUploadProgress(
              { key: param.path, loaded: 1, total: 1 },
              undefined,
            );
          }
          return succeeded;
        });
    }
    return Promise.reject(new Error('saveBinaryFilePromise: not implemented'));
  };

  static deleteFilePromise = (
    path: string,
    useTrash?: boolean,
  ): Promise<any> => {
    if (objectStoreAPI) {
      const param = {
        path,
        bucketName: objectStoreAPI.config().bucketName,
      };
      return objectStoreAPI.deleteFilePromise(param);
    } else if (webDavAPI) {
      return webDavAPI.deleteFilePromise(path);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'deleteFilePromise',
        path,
        useTrash,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.deleteFilePromise(path);
    }
    return Promise.reject(new Error('deleteFilePromise: not implemented'));
  };

  static deleteDirectoryPromise = (
    path: string,
    useTrash?: boolean,
  ): Promise<any> => {
    if (objectStoreAPI) {
      const param = {
        path,
        bucketName: objectStoreAPI.config().bucketName,
      };
      return objectStoreAPI.deleteDirectoryPromise(param);
    } else if (webDavAPI) {
      return webDavAPI.deleteDirectoryPromise(path);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'deleteDirectoryPromise',
        path,
        useTrash,
      );
    } else if (AppConfig.isCordova) {
      return cordovaIO.deleteDirectoryPromise(path);
    }
    return Promise.reject(new Error('deleteDirectoryPromise: not implemented'));
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
      // web or cordova
      openUrlForWeb(url);
    }
  };

  static selectDirectoryDialog = (): Promise<any> => {
    if (AppConfig.isElectron && !objectStoreAPI && !webDavAPI) {
      return window.electronIO.ipcRenderer.invoke('selectDirectoryDialog');
    } else if (AppConfig.isCordova) {
      return cordovaIO.selectDirectoryDialog();
    }
    return Promise.reject(new Error('selectDirectoryDialog: not implemented'));
  };

  /!**
   * cordova only
   * @param files
   *!/
  static shareFiles = (files: Array<string>): void => {
    if (AppConfig.isCordova) {
      cordovaIO.shareFiles(files);
    } else {
      console.log('shareFiles is implemented in Cordova only.');
    }
  };

  /!**
   *  Load extensions is supported only on Electron
   *!/
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
*/
