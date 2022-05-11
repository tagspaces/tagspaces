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
  platformIsMinio,
  platformGetDirSeparator,
  platformEnableObjectStoreSupport,
  platformDisableObjectStoreSupport,
  platformEnableWebdavSupport,
  platformDisableWebdavSupport,
  platformWatchDirectory,
  platformSetLanguage,
  platformIsWorkerAvailable,
  platformSetZoomFactorElectron,
  platformSetGlobalShortcuts,
  platformShowMainWindow,
  platformQuitApp,
  platformFocusWindow,
  platformGetDevicePaths,
  platformCreateDirectoryTree,
  platformCreateDirectoryIndexInWorker,
  platformCreateThumbnailsInWorker,
  platformGetURLforPath,
  platformListDirectoryPromise,
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
  platformDeleteFilePromise,
  platformDeleteDirectoryPromise,
  platformOpenDirectory,
  platformShowInFileManager,
  platformOpenFile,
  platformResolveFilePath,
  platformOpenUrl,
  platformSelectFileDialog,
  platformSelectDirectoryDialog,
  platformShareFiles
} from '@tagspaces/tagspaces-platforms/platform-io';
import { Pro } from '../pro';
import { TS } from '-/tagspaces.namespace';
import AppConfig from '-/config';

let token: string;

export default class PlatformFacade {
  static enableObjectStoreSupport = (objectStoreConfig: any): Promise<any> =>
    platformEnableObjectStoreSupport(objectStoreConfig);

  static disableObjectStoreSupport = (): void =>
    platformDisableObjectStoreSupport();

  static enableWebdavSupport = (webDavConfig: any): void =>
    platformEnableWebdavSupport(webDavConfig);

  static disableWebdavSupport = (): void => platformDisableWebdavSupport();

  static haveObjectStoreSupport = (): boolean =>
    platformHaveObjectStoreSupport();

  static isMinio = (): boolean => platformIsMinio();

  static getDirSeparator = (): string => platformGetDirSeparator();

  static setLanguage = (language: string): void => {
    platformSetLanguage(language);
  };

  static setZoomFactorElectron = zoomLevel => {
    platformSetZoomFactorElectron(zoomLevel);
  };

  static setGlobalShortcuts = globalShortcutsEnabled => {
    platformSetGlobalShortcuts(globalShortcutsEnabled);
  };

  static showMainWindow = (): void => platformShowMainWindow();

  static quitApp = (): void => platformQuitApp();

  static watchDirectory = (dirPath: string, listener): void =>
    platformWatchDirectory(dirPath, listener);

  static focusWindow = (): void => platformFocusWindow();

  static getDevicePaths = (): Promise<Object> => platformGetDevicePaths();

  /* static getAppDataPath = (): string => nativeAPI.getAppDataPath();

  static getUserHomePath = (): string => nativeAPI.getUserHomePath(); */

  static getURLforPath = (path: string, expirationInSeconds?: number): string =>
    platformGetURLforPath(path, expirationInSeconds);

  static createDirectoryTree = (directoryPath: string): Object =>
    platformCreateDirectoryTree(directoryPath);

  static isWorkerAvailable = (): boolean => {
    if (token !== undefined) {
      return token !== 'not';
    }
    try {
      // eslint-disable-next-line global-require
      const config = require('-/config/config.json');
      if (platformIsWorkerAvailable()) {
        token = config.jwt;
      }
    } catch (e) {
      if (e && e.code && e.code === 'MODULE_NOT_FOUND') {
        console.debug('jwt token not available');
        token = 'not';
      }
    }
    return false;
  };

  static createDirectoryIndexInWorker = (
    directoryPath: string,
    extractText: boolean,
    ignorePatterns: Array<string>
  ): Promise<any> => {
    if (!PlatformFacade.isWorkerAvailable()) {
      return Promise.reject(new Error('no Worker Available!'));
    }
    return platformCreateDirectoryIndexInWorker(
      token,
      directoryPath,
      extractText,
      ignorePatterns
    );
  };

  static createThumbnailsInWorker = (
    tmbGenerationList: Array<string>
  ): Promise<any> => {
    if (!PlatformFacade.isWorkerAvailable()) {
      return Promise.reject(new Error('no Worker Available!'));
    }
    return platformCreateThumbnailsInWorker(token, tmbGenerationList);
  };

  /**
   * Promise === undefined on error
   * @param path
   * @param mode = ['extractTextContent', 'extractThumbPath']
   * @param ignorePatterns
   */
  static listDirectoryPromise = (
    path: string,
    mode = ['extractThumbPath'],
    ignorePatterns: Array<string> = []
  ): Promise<Array<any>> =>
    platformListDirectoryPromise(path, mode, ignorePatterns);

  static listObjectStoreDir = (
    param: Object,
    mode = ['extractThumbPath'],
    ignorePatterns: Array<string> = []
  ): Promise<Array<any>> =>
    platformListObjectStoreDir(param, mode, ignorePatterns);

  static getPropertiesPromise = (path: string): Promise<any> =>
    platformGetPropertiesPromise(path);

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
    PlatformFacade.ignoreByWatcher(dirPath);

    return platformCreateDirectoryPromise(dirPath).then(result => {
      PlatformFacade.deignoreByWatcher(dirPath);
      if (
        process &&
        process.platform &&
        AppConfig.isWin &&
        dirPath.endsWith('\\' + AppConfig.metaFolder)
      ) {
        // hide .ts folder on Windows
        import('winattr').then(winattr => {
          winattr.set(dirPath, { hidden: true }, err => {
            if (err) {
              console.warn('Error setting hidden attr. to dir: ' + dirPath);
            } else {
              console.log('Success setting hidden attr. to dir: ' + dirPath);
            }
          });
        });
        // @ts-ignore
        // return new Promise(resolve => {
        //   winattr.set(dirPath, { hidden: true }, err => {
        //     resolve(dirPath);
        //     if (err) {
        //       console.warn('Error setting hidden attr. to dir: ' + dirPath);
        //     } else {
        //       console.log('Success setting hidden attr. to dir: ' + dirPath);
        //     }
        //   });
        // });
        return true;
      }
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
    const isTargetExist = await PlatformFacade.getPropertiesPromise(
      targetFilePath
    ); // TODO rethink to create PlatformIO.isExistSync function
    if (isTargetExist) {
      // eslint-disable-next-line no-alert
      const confirmOverwrite = window && window.confirm(confirmMessage);
      if (confirmOverwrite === true) {
        return PlatformFacade.copyFilePromiseOverwrite(
          sourceFilePath,
          targetFilePath
        );
      }
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject(
        'File "' + targetFilePath + '" exists. Copying failed.'
      );
    }
    return PlatformFacade.copyFilePromiseOverwrite(
      sourceFilePath,
      targetFilePath
    );
  };

  /**
   * @param sourceFilePath
   * @param targetFilePath - if exist overwrite it
   */
  static copyFilePromiseOverwrite = (
    sourceFilePath: string,
    targetFilePath: string
  ): Promise<any> => {
    PlatformFacade.ignoreByWatcher(targetFilePath);

    return platformCopyFilePromise(sourceFilePath, targetFilePath).then(
      result => {
        PlatformFacade.deignoreByWatcher(targetFilePath);
        return result;
      }
    );
  };

  static renameFilePromise = (
    filePath: string,
    newFilePath: string
  ): Promise<any> => {
    PlatformFacade.ignoreByWatcher(filePath, newFilePath);

    return platformRenameFilePromise(filePath, newFilePath).then(result => {
      PlatformFacade.deignoreByWatcher(filePath, newFilePath);
      return result;
    });
  };

  static renameDirectoryPromise = (
    dirPath: string,
    newDirName: string
  ): Promise<any> => {
    PlatformFacade.ignoreByWatcher(dirPath, newDirName);

    return platformRenameDirectoryPromise(dirPath, newDirName).then(result => {
      PlatformFacade.deignoreByWatcher(dirPath, newDirName);
      return result;
    });
  };

  static loadTextFilePromise = (
    filePath: string,
    isPreview?: boolean
  ): Promise<any> =>
    platformLoadTextFilePromise(decodeURIComponent(filePath), isPreview);

  static getFileContentPromise = (
    filePath: string,
    type?: string
  ): Promise<any> => platformGetFileContentPromise(filePath, type);

  static saveFilePromise = (
    filePath: string,
    content: any,
    overwrite: boolean
  ): Promise<any> => {
    PlatformFacade.ignoreByWatcher(filePath);

    return platformSaveFilePromise(filePath, content, overwrite).then(
      result => {
        PlatformFacade.deignoreByWatcher(filePath);
        return result;
      }
    );
  };

  static saveTextFilePlatform = (
    param: any,
    content: string,
    overwrite: boolean
  ): Promise<any> => {
    PlatformFacade.ignoreByWatcher(param.path);

    return PlatformFacade.saveTextFilePromise(
      param.path,
      content,
      overwrite
    ).then(result => {
      PlatformFacade.deignoreByWatcher(param.path);
      return result;
    });
  };

  static saveTextFilePromise = (
    filePath: string,
    content: string,
    overwrite: boolean
  ): Promise<any> => {
    PlatformFacade.ignoreByWatcher(filePath);

    return platformSaveTextFilePromise(filePath, content, overwrite).then(
      result => {
        PlatformFacade.deignoreByWatcher(filePath);
        return result;
      }
    );
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
    PlatformFacade.ignoreByWatcher(filePath);

    return platformSaveBinaryFilePromise(
      filePath,
      content,
      overwrite,
      onUploadProgress
    ).then(succeeded => {
      PlatformFacade.deignoreByWatcher(filePath);
      return succeeded;
    });
  };

  static deleteFilePromise = (
    path: string,
    useTrash?: boolean
  ): Promise<any> => {
    PlatformFacade.ignoreByWatcher(path);

    return platformDeleteFilePromise(path, useTrash).then(result => {
      PlatformFacade.deignoreByWatcher(path);
      return result;
    });
  };

  static deleteDirectoryPromise = (
    path: string,
    useTrash?: boolean
  ): Promise<any> => {
    PlatformFacade.ignoreByWatcher(path);

    return platformDeleteDirectoryPromise(path, useTrash).then(result => {
      PlatformFacade.deignoreByWatcher(path);
      return result;
    });
  };

  static openDirectory = (dirPath: string): void =>
    platformOpenDirectory(dirPath);

  static showInFileManager = (dirPath: string): void =>
    platformShowInFileManager(dirPath);

  static openFile = (
    filePath: string,
    warningOpeningFilesExternally: boolean
  ): void => {
    if (
      !warningOpeningFilesExternally ||
      // eslint-disable-next-line no-restricted-globals
      confirm(
        'Do you really want to open "' +
          filePath +
          '"? Execution of some files can be potentially dangerous!'
      )
    ) {
      platformOpenFile(filePath);
    }
  };

  static resolveFilePath = (filePath: string): string =>
    platformResolveFilePath(filePath);

  static openUrl = (url: string): void => platformOpenUrl(url);

  static selectFileDialog = (): Promise<any> => platformSelectFileDialog();

  static selectDirectoryDialog = (): Promise<any> =>
    platformSelectDirectoryDialog();

  static shareFiles = (files: Array<string>): void => {
    platformShareFiles(files);
  };
}
