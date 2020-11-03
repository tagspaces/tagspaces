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

// import { ManagedUpload } from 'aws-sdk/clients/s3';
import { Pro } from '../pro';
// @ts-ignore
import NativePlatformIO from './_PLATFORMIO_';
import AppConfig from '-/config';
import { FileSystemEntry } from '-/services/utils-io';

const nativeAPI: any = new NativePlatformIO();
let objectStoreAPI;

export default class PlatformIO {
  static enableObjectStoreSupport = (
    objectStoreConfig: any // S3.Types.ClientConfiguration
  ): Promise<any> =>
    new Promise((resolve, reject) => {
      if (Pro && Pro.ObjectStoreIO) {
        if (
          objectStoreAPI !== undefined &&
          objectStoreAPI.config.bucketName === objectStoreConfig.bucketName &&
          objectStoreAPI.config.secretAccessKey ===
            objectStoreConfig.secretAccessKey &&
          objectStoreAPI.config.region === objectStoreConfig.region &&
          objectStoreAPI.config.accessKeyId === objectStoreConfig.accessKeyId
        ) {
          resolve();
        } else {
          objectStoreAPI = new Pro.ObjectStoreIO();
          objectStoreAPI
            .configure(objectStoreConfig)
            .then(() => {
              resolve();
              return true;
            })
            .catch(e => {
              reject(e);
            });
        }
      } else {
        reject('ObjectStore support available in the PRO version');
      }
    });

  static disableObjectStoreSupport = (): void => {
    objectStoreAPI = undefined;
  };

  static haveObjectStoreSupport = (): boolean => objectStoreAPI !== undefined;

  static getDirSeparator = (): string => // TODO rethink usage for S3 on Win
    PlatformIO.haveObjectStoreSupport() ? '/' : AppConfig.dirSeparator;

  static initMainMenu = (menuConfig: Array<Object>): void => {
    if (nativeAPI.initMainMenu) {
      nativeAPI.initMainMenu(menuConfig);
    } else {
      console.log('initMainMenu not supported');
    }
  };

  static initTrayMenu = (menuConfig: Array<Object>): void => {
    if (nativeAPI.initTrayMenu) {
      nativeAPI.initTrayMenu(menuConfig);
    } else {
      console.log('initTrayMenu not supported');
    }
  };

  static isWorkerAvailable = (): boolean => nativeAPI.isWorkerAvailable();

  static setZoomFactorElectron = zoomLevel => {
    if (nativeAPI.setZoomFactorElectron) {
      nativeAPI.setZoomFactorElectron(zoomLevel);
    } else {
      console.log('setZoomFactorElectron not supported');
    }
  };

  static setGlobalShortcuts = globalShortcutsEnabled => {
    if (nativeAPI.setGlobalShortcuts) {
      nativeAPI.setGlobalShortcuts(globalShortcutsEnabled);
    } else {
      console.log('setGlobalShortcuts not supported');
    }
  };

  static showMainWindow = (): void => nativeAPI.showMainWindow();

  static quitApp = (): void => nativeAPI.quitApp();

  static watchDirectory = (dirPath: string, listener): void =>
    nativeAPI.watchDirectory(dirPath, listener);

  static focusWindow = (): void => nativeAPI.focusWindow();

  static getDevicePaths = (): Object => nativeAPI.getDevicePaths();

  static getAppDataPath = (): string => nativeAPI.getAppDataPath();

  static getUserHomePath = (): string => nativeAPI.getUserHomePath();

  static getURLforPath = (path: string): string => {
    if (objectStoreAPI) {
      return objectStoreAPI.getURLforPath(path);
    }
    // console.log('getURLforPath not supported');
    // return path;
  };

  static createDirectoryTree = (directoryPath: string): Object =>
    nativeAPI.createDirectoryTree(directoryPath);

  static createDirectoryIndexInWorker = (
    directoryPath: string,
    extractText: boolean
  ): Promise<any> =>
    nativeAPI.createDirectoryIndexInWorker(directoryPath, extractText);

  static createThumbnailsInWorker = (
    tmbGenerationList: Array<string>
  ): Promise<any> => nativeAPI.createThumbnailsInWorker(tmbGenerationList);

  static listDirectoryPromise = (
    path: string,
    lite: boolean = true,
    extractText: boolean = true
  ): Promise<Array<any>> => {
    if (objectStoreAPI) {
      return objectStoreAPI.listDirectoryPromise(path, lite);
    }
    return nativeAPI.listDirectoryPromise(path, lite, extractText);
  };

  static getPropertiesPromise = (path: string): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.getPropertiesPromise(path);
    }
    return nativeAPI.getPropertiesPromise(path);
  };

  static createDirectoryPromise = (dirPath: string): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.createDirectoryPromise(dirPath);
    }
    return nativeAPI.createDirectoryPromise(dirPath);
  };

  static copyFilePromise = (
    sourceFilePath: string,
    targetFilePath: string
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.copyFilePromise(sourceFilePath, targetFilePath);
    }
    return nativeAPI.copyFilePromise(sourceFilePath, targetFilePath);
  };

  static renameFilePromise = (
    filePath: string,
    newFilePath: string
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.renameFilePromise(filePath, newFilePath);
    }
    return nativeAPI.renameFilePromise(filePath, newFilePath);
  };

  static renameDirectoryPromise = (
    dirPath: string,
    newDirName: string
  ): Promise<any> => {
    if (objectStoreAPI) {
      // return objectStoreAPI.renameDirectoryPromise(dirPath, newDirName);
      return Promise.reject(
        'Renaming directories not supported on this platform'
      );
    }
    return nativeAPI.renameDirectoryPromise(dirPath, newDirName);
  };

  static loadTextFilePromise = (
    filePath: string,
    isPreview?: boolean
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.loadTextFilePromise(filePath, isPreview);
    }
    return nativeAPI.loadTextFilePromise(filePath, isPreview);
  };

  static getFileContentPromise = (
    filePath: string,
    type?: string
  ): Promise<Object> => {
    if (objectStoreAPI) {
      return objectStoreAPI.getFileContentPromise(filePath, type);
    }
    return nativeAPI.getFileContentPromise(filePath, type);
  };

  static saveFilePromise = (
    filePath: string,
    content: any,
    overwrite: boolean
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.saveFilePromise(filePath, content, overwrite);
    }
    return nativeAPI.saveFilePromise(filePath, content, overwrite);
  };

  static saveTextFilePromise = (
    filePath: string,
    content: string,
    overwrite: boolean
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.saveTextFilePromise(filePath, content, overwrite);
    }
    return nativeAPI.saveTextFilePromise(filePath, content, overwrite);
  };

  static saveBinaryFilePromise = (
    filePath: string,
    content: any,
    overwrite: boolean,
    onUploadProgress?: (
      progress: any, // ManagedUpload.Progress,
      response: any // AWS.Response<AWS.S3.PutObjectOutput, AWS.AWSError>
    ) => void
  ): Promise<FileSystemEntry> => {
    if (objectStoreAPI) {
      return objectStoreAPI.saveBinaryFilePromise(
        filePath,
        content,
        overwrite,
        onUploadProgress
      );
    }
    return nativeAPI
      .saveBinaryFilePromise(filePath, content, overwrite)
      .then(succeeded => {
        if (succeeded && onUploadProgress) {
          onUploadProgress({ key: filePath, loaded: 1, total: 1 }, undefined);
        }
        return succeeded;
      });
  };

  static deleteFilePromise = (
    path: string,
    useTrash?: boolean
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.deleteFilePromise(path, useTrash);
    }
    return nativeAPI.deleteFilePromise(path, useTrash);
  };

  static deleteDirectoryPromise = (
    path: string,
    useTrash?: boolean
  ): Promise<any> => {
    if (objectStoreAPI) {
      // return objectStoreAPI.deleteDirectoryPromise(path, useTrash);
      return Promise.reject(
        'Deleting directories not supported on this platform'
      );
    }
    return nativeAPI.deleteDirectoryPromise(path, useTrash);
  };

  static openDirectory = (dirPath: string): void =>
    nativeAPI.openDirectory(dirPath);

  static showInFileManager = (dirPath: string): void =>
    nativeAPI.showInFileManager(dirPath);

  static openFile = (filePath: string): void => nativeAPI.openFile(filePath);

  static openUrl = (url: string): void => nativeAPI.openUrl(url);

  static selectFileDialog = (): Promise<any> => nativeAPI.selectFileDialog();

  static selectDirectoryDialog = (): Promise<any> =>
    nativeAPI.selectDirectoryDialog();

  static shareFiles = (files: Array<string>): void => {
    if (AppConfig.isCordova) {
      nativeAPI.shareFiles(files);
    } else {
      console.log('shareFiles is implemented in Cordova only.');
    }
  };
}
