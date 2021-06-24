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
import ObjectStoreIO from './objectstore-io';
import AppConfig from '-/config';
import { TS } from '-/tagspaces.namespace';

const nativeAPI: any = new NativePlatformIO();
let objectStoreAPI;

export default class PlatformIO {
  static enableObjectStoreSupport = (
    objectStoreConfig: any // S3.Types.ClientConfiguration
  ): Promise<any> =>
    new Promise((resolve, reject) => {
      if (Pro) {
        if (
          objectStoreAPI !== undefined &&
          objectStoreAPI.config.bucketName === objectStoreConfig.bucketName &&
          objectStoreAPI.config.secretAccessKey ===
            objectStoreConfig.secretAccessKey &&
          objectStoreAPI.config.region === objectStoreConfig.region &&
          objectStoreAPI.config.endpointURL === objectStoreConfig.endpointURL &&
          objectStoreAPI.config.accessKeyId === objectStoreConfig.accessKeyId
        ) {
          resolve();
        } else {
          objectStoreAPI = new ObjectStoreIO();
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

  static getURLforPath = (
    path: string,
    expirationInSeconds?: number
  ): string => {
    if (objectStoreAPI) {
      return objectStoreAPI.getURLforPath(path, expirationInSeconds);
    }
  };

  static createDirectoryTree = (directoryPath: string): Object =>
    nativeAPI.createDirectoryTree(directoryPath);

  static createDirectoryIndexInWorker = (
    directoryPath: string,
    extractText: boolean,
    ignorePatterns: Array<string>
  ): Promise<any> =>
    nativeAPI.createDirectoryIndexInWorker(
      directoryPath,
      extractText,
      ignorePatterns
    );

  static createThumbnailsInWorker = (
    tmbGenerationList: Array<string>
  ): Promise<any> => nativeAPI.createThumbnailsInWorker(tmbGenerationList);

  /**
   * Promise === undefined on error
   * @param path
   * @param lite
   * @param extractText
   * @param ignorePatterns
   */
  static listDirectoryPromise = (
    path: string,
    lite: boolean = true,
    extractText: boolean = true,
    ignorePatterns: Array<string> = []
  ): Promise<Array<any>> => {
    if (objectStoreAPI) {
      return objectStoreAPI.listDirectoryPromise(path, lite);
    }
    return nativeAPI.listDirectoryPromise(
      path,
      lite,
      extractText,
      ignorePatterns
    );
  };

  static getPropertiesPromise = (path: string): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.getPropertiesPromise(path);
    }
    return nativeAPI.getPropertiesPromise(path);
  };

  static ignoreByWatcher = (...paths) => {
    if (Pro && Pro.Watcher && Pro.Watcher.isWatching()) {
      for (let i = 0; i < paths.length; i += 1) {
        Pro.Watcher.addToIgnored(paths[i]);
      }
    }
  };

  static deignoreByWatcher = (...paths) => {
    if (Pro && Pro.Watcher && Pro.Watcher.isWatching()) {
      for (let i = 0; i < paths.length; i += 1) {
        Pro.Watcher.removeFromIgnored(paths[i]);
      }
    }
  };

  static createDirectoryPromise = (dirPath: string): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.createDirectoryPromise(dirPath);
    }
    PlatformIO.ignoreByWatcher(dirPath);

    return nativeAPI.createDirectoryPromise(dirPath).then(result => {
      PlatformIO.deignoreByWatcher(dirPath);
      return result;
    });
  };

  static copyFilePromise = async (
    sourceFilePath: string,
    targetFilePath: string,
    confirmMessage: string = 'File ' +
      targetFilePath +
      ' exist do you want to override it?'
  ): Promise<any> => {
    const isTargetExist = await PlatformIO.getPropertiesPromise(targetFilePath); // TODO rethink to create PlatformIO.isExistSync function
    if (isTargetExist) {
      // eslint-disable-next-line no-alert
      const confirmOverwrite = window.confirm(confirmMessage);
      if (confirmOverwrite === true) {
        return PlatformIO.copyFilePromiseOverwrite(
          sourceFilePath,
          targetFilePath
        );
      }
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject(
        'File "' + targetFilePath + '" exists. Copying failed.'
      );
    }
    return PlatformIO.copyFilePromiseOverwrite(sourceFilePath, targetFilePath);
  };

  /**
   * @param sourceFilePath
   * @param targetFilePath - if exist overwrite it
   */
  static copyFilePromiseOverwrite = (
    sourceFilePath: string,
    targetFilePath: string
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.copyFilePromise(sourceFilePath, targetFilePath);
    }
    PlatformIO.ignoreByWatcher(targetFilePath);

    return nativeAPI
      .copyFilePromise(sourceFilePath, targetFilePath)
      .then(result => {
        PlatformIO.deignoreByWatcher(targetFilePath);
        return result;
      });
  };

  static renameFilePromise = (
    filePath: string,
    newFilePath: string
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.renameFilePromise(filePath, newFilePath);
      // .then(result => result);
    }
    PlatformIO.ignoreByWatcher(filePath, newFilePath);

    return nativeAPI.renameFilePromise(filePath, newFilePath).then(result => {
      PlatformIO.deignoreByWatcher(filePath, newFilePath);
      return result;
    });
  };

  static renameDirectoryPromise = (
    dirPath: string,
    newDirName: string
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.renameDirectoryPromise(dirPath, newDirName);
    }
    PlatformIO.ignoreByWatcher(dirPath, newDirName);

    return nativeAPI
      .renameDirectoryPromise(dirPath, newDirName)
      .then(result => {
        PlatformIO.deignoreByWatcher(dirPath, newDirName);
        return result;
      });
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
    PlatformIO.ignoreByWatcher(filePath);

    return nativeAPI
      .saveFilePromise(filePath, content, overwrite)
      .then(result => {
        PlatformIO.deignoreByWatcher(filePath);
        return result;
      });
  };

  static saveTextFilePromise = (
    filePath: string,
    content: string,
    overwrite: boolean
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.saveTextFilePromise(filePath, content, overwrite);
    }

    PlatformIO.ignoreByWatcher(filePath);

    return nativeAPI
      .saveTextFilePromise(filePath, content, overwrite)
      .then(result => {
        PlatformIO.deignoreByWatcher(filePath);
        return result;
      });
  };

  static saveBinaryFilePromise = (
    filePath: string,
    content: any,
    overwrite: boolean,
    onUploadProgress?: (
      progress: any, // ManagedUpload.Progress,
      response: any // AWS.Response<AWS.S3.PutObjectOutput, AWS.AWSError>
    ) => void
  ): Promise<TS.FileSystemEntry> => {
    if (objectStoreAPI) {
      return objectStoreAPI.saveBinaryFilePromise(
        filePath,
        content,
        overwrite,
        onUploadProgress
      );
    }
    PlatformIO.ignoreByWatcher(filePath);

    return nativeAPI
      .saveBinaryFilePromise(filePath, content, overwrite)
      .then(succeeded => {
        if (succeeded && onUploadProgress) {
          onUploadProgress({ key: filePath, loaded: 1, total: 1 }, undefined);
        }
        PlatformIO.deignoreByWatcher(filePath);
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
    PlatformIO.ignoreByWatcher(path);

    return nativeAPI.deleteFilePromise(path, useTrash).then(result => {
      PlatformIO.deignoreByWatcher(path);
      return result;
    });
  };

  static deleteDirectoryPromise = (
    path: string,
    useTrash?: boolean
  ): Promise<any> => {
    if (objectStoreAPI) {
      return objectStoreAPI.deleteDirectoryPromise(path, useTrash);
    }
    PlatformIO.ignoreByWatcher(path);

    return nativeAPI.deleteDirectoryPromise(path, useTrash).then(result => {
      PlatformIO.deignoreByWatcher(path);
      return result;
    });
  };

  static openDirectory = (dirPath: string): void =>
    nativeAPI.openDirectory(dirPath);

  static showInFileManager = (dirPath: string): void =>
    nativeAPI.showInFileManager(dirPath);

  static openFile = (filePath: string): void => {
    if (
      confirm(
        'Do you really want to open "' +
          filePath +
          '"? Execution of some files can be potentially dangerous!'
      )
    ) {
      nativeAPI.openFile(filePath);
    }
  };

  static resolveFilePath = (filePath: string): string =>
    objectStoreAPI ? filePath : nativeAPI.resolveFilePath(filePath);

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
