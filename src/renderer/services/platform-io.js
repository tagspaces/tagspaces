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

const {
  getLocationPath,
  isWorkerAvailable,
  readMacOSTags,
  watchFolder,
  showMainWindow,
  quitApp,
  focusWindow,
  getDevicePaths,
  createDirectoryIndexInWorker,
  createThumbnailsInWorker,
  listDirectoryPromise,
  listMetaDirectoryPromise,
  getPropertiesPromise,
  createDirectoryPromise,
  copyFilePromise,
  renameFilePromise,
  renameDirectoryPromise,
  moveDirectoryPromise,
  copyDirectoryPromise,
  loadTextFilePromise,
  getFileContentPromise,
  saveFilePromise,
  saveTextFilePromise,
  saveBinaryFilePromise,
  deleteFilePromise,
  moveToTrash,
  deleteDirectoryPromise,
  openDirectory,
  openFile,
  resolveFilePath,
  openUrl,
  selectFileDialog,
  selectDirectoryDialog,
  shareFiles,
  createNewInstance,
  checkFileExist,
  checkDirExist,
  loadExtensions,
  removeExtension,
  getUserDataDir,
  unZip,
  getDirProperties,
} = require('./index');
const AppConfig = require('@tagspaces/tagspaces-common/AppConfig');
const Indexer = require('./indexer');

let objectStoreAPI, webDavAPI;

function platformReadMacOSTags(filename) {
  if (readMacOSTags) {
    return readMacOSTags(filename);
  }
  return false;
}

function platformWatchFolder(locationPath, options) {
  if (watchFolder) {
    return watchFolder(locationPath, options);
  }
  return undefined;
}

function platformFocusWindow() {
  focusWindow();
}

function platformGetDevicePaths() {
  if (getDevicePaths) {
    return getDevicePaths();
  } else {
    console.log('getDevicePaths not supported');
    return Promise.resolve(undefined);
  }
}

/**
 * @param path : string
 * @param expirationInSeconds?: number
 */
function platformGetURLforPath(path, expirationInSeconds) {
  if (objectStoreAPI) {
    const param = {
      path,
      bucketName: objectStoreAPI.config().bucketName,
    };
    return objectStoreAPI.getURLforPath(param, expirationInSeconds);
  } else if (webDavAPI) {
    return webDavAPI.getURLforPath(path);
  }
  return undefined;
}

function platformCreateIndex(
  param,
  listDirectory,
  loadTextFile,
  mode = ['extractThumbPath'],
  ignorePatterns = [],
) {
  return Indexer.createIndex(
    objectStoreAPI
      ? {
          ...param,
          bucketName: objectStoreAPI.config().bucketName,
        }
      : param,
    listDirectory,
    loadTextFile,
    mode,
    ignorePatterns,
  );
}

/**
 * @param token
 * @param directoryPath: string
 * @param extractText: boolean
 * @param ignorePatterns: Array<string>
 * @param wsPort: number
 */
function platformCreateDirectoryIndexInWorker(
  token,
  directoryPath,
  extractText,
  ignorePatterns,
  wsPort,
) {
  return createDirectoryIndexInWorker(
    token,
    directoryPath,
    extractText,
    ignorePatterns,
    wsPort,
  );
}

/**
 * Promise === undefined on error
 * @param path: string
 * @param mode = ['extractTextContent', 'extractThumbPath']
 * @param ignorePatterns: Array<string> = []
 * @param resultsLimit
 */
function platformListDirectoryPromise(
  path,
  mode = ['extractThumbPath'],
  ignorePatterns,
  resultsLimit,
) {
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
  }
  return listDirectoryPromise(path, mode, ignorePatterns);
}

function platformListMetaDirectoryPromise(path) {
  if (objectStoreAPI) {
    const param = {
      path,
      bucketName: objectStoreAPI.config().bucketName,
    };
    return objectStoreAPI.listMetaDirectoryPromise(param);
  } else if (webDavAPI) {
    return webDavAPI.listMetaDirectoryPromise(path);
  }
  return listMetaDirectoryPromise(path);
}

/**
 * only objectStore
 * @param param
 * @param mode
 * @param ignorePatterns
 */
function platformListObjectStoreDir(
  param,
  mode = ['extractThumbPath'],
  ignorePatterns = [],
) {
  if (objectStoreAPI) {
    return objectStoreAPI.listDirectoryPromise(param, mode, ignorePatterns);
  } else {
    return Promise.reject(
      new Error('platformListObjectStoreDir: no objectStoreAPI'),
    );
  }
}

/**
 * @param path: string
 */
function platformGetPropertiesPromise(path) {
  if (objectStoreAPI) {
    const param = {
      path,
      bucketName: objectStoreAPI.config().bucketName,
    };
    return objectStoreAPI.getPropertiesPromise(param);
  } else if (webDavAPI) {
    return webDavAPI.getPropertiesPromise(path);
  }
  return getPropertiesPromise(path);
}

/*static ignoreByWatcher = (...paths) => {   // TODO Pro..
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
  };*/

function platformCreateDirectoryPromise(dirPath) {
  if (objectStoreAPI) {
    const param = {
      path: dirPath,
      bucketName: objectStoreAPI.config().bucketName,
    };
    return objectStoreAPI.createDirectoryPromise(param);
  } else if (webDavAPI) {
    return webDavAPI.createDirectoryPromise(dirPath);
  }

  return createDirectoryPromise(dirPath);
}

/**
 * @param sourceFilePath: string
 * @param targetFilePath: string
 */
async function platformCopyFilePromise(sourceFilePath, targetFilePath) {
  return copyFilePromiseOverwrite(sourceFilePath, targetFilePath);
}

/**
 * @param sourceFilePath
 * @param targetFilePath - if exist overwrite it
 */
function copyFilePromiseOverwrite(sourceFilePath, targetFilePath) {
  if (objectStoreAPI) {
    const param = {
      path: sourceFilePath,
      bucketName: objectStoreAPI.config().bucketName,
    };
    return objectStoreAPI.copyFilePromise(param, targetFilePath);
  } else if (webDavAPI) {
    return webDavAPI.copyFilePromise(sourceFilePath, targetFilePath);
  }
  // PlatformIO.ignoreByWatcher(targetFilePath);

  return copyFilePromise(sourceFilePath, targetFilePath);
}

function platformRenameFilePromise(
  filePath,
  newFilePath,
  onProgress = undefined,
) {
  if (objectStoreAPI) {
    const param = {
      path: filePath,
      bucketName: objectStoreAPI.config().bucketName,
    };
    return objectStoreAPI.renameFilePromise(param, newFilePath, onProgress);
    // .then(result => result);
  } else if (webDavAPI) {
    return webDavAPI.renameFilePromise(filePath, newFilePath, onProgress);
  }
  // PlatformIO.ignoreByWatcher(filePath, newFilePath);

  return renameFilePromise(filePath, newFilePath, onProgress);
}

function platformRenameDirectoryPromise(dirPath, newDirName) {
  if (objectStoreAPI) {
    const param = {
      path: dirPath,
      bucketName: objectStoreAPI.config().bucketName,
    };
    return objectStoreAPI.renameDirectoryPromise(param, newDirName);
  } else if (webDavAPI) {
    return webDavAPI.renameDirectoryPromise(dirPath, newDirName);
  }

  return renameDirectoryPromise(dirPath, newDirName);
}

function platformCopyDirectoryPromise(param, newDirName, onProgress) {
  if (objectStoreAPI) {
    const params = {
      ...param,
      bucketName: objectStoreAPI.config().bucketName,
    };
    return objectStoreAPI.copyDirectoryPromise(params, newDirName, onProgress);
  } else if (webDavAPI) {
    return webDavAPI.copyDirectoryPromise(param, newDirName, onProgress);
  }

  return copyDirectoryPromise(param, newDirName, onProgress);
}

function platformMoveDirectoryPromise(param, newDirName, onProgress) {
  if (objectStoreAPI) {
    return objectStoreAPI.moveDirectoryPromise(
      {
        ...param,
        bucketName: objectStoreAPI.config().bucketName,
      },
      newDirName,
      onProgress,
    );
  } else if (webDavAPI) {
    return webDavAPI.moveDirectoryPromise(param, newDirName, onProgress);
  }
  // PlatformIO.ignoreByWatcher(dirPath, newDirName);

  return moveDirectoryPromise(param, newDirName, onProgress);
}

function platformLoadTextFilePromise(filePath, isPreview) {
  if (objectStoreAPI) {
    const param = {
      path: filePath,
      bucketName: objectStoreAPI.config().bucketName,
    };
    return objectStoreAPI.loadTextFilePromise(param, isPreview);
  } else if (webDavAPI) {
    return webDavAPI.loadTextFilePromise(filePath, isPreview);
  }
  return loadTextFilePromise(filePath, isPreview);
}

function platformGetFileContentPromise(filePath, type) {
  if (objectStoreAPI) {
    const param = {
      path: filePath,
      bucketName: objectStoreAPI.config().bucketName,
    };
    return objectStoreAPI.getFileContentPromise(param, type);
  } else if (webDavAPI) {
    return webDavAPI.getFileContentPromise(filePath, type);
  }
  return getFileContentPromise(filePath, type);
}

function platformGetLocalFileContentPromise(filePath, type) {
  return getFileContentPromise(filePath, type);
}

function platformSaveFilePromise(param, content, overwrite) {
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
  }

  return saveFilePromise(param, content, overwrite);
}

function saveTextFilePlatform(param, content, overwrite) {
  if (objectStoreAPI) {
    return objectStoreAPI.saveTextFilePromise(param, content, overwrite);
  } else if (webDavAPI) {
    return webDavAPI.saveTextFilePromise(param, content, overwrite);
  }
  return platformSaveTextFilePromise(param, content, overwrite);
}

function platformSaveTextFilePromise(param, content, overwrite) {
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
  }

  return saveTextFilePromise(param, content, overwrite);
}

function platformSaveBinaryFilePromise(
  param,
  content,
  overwrite,
  onUploadProgress,
) {
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
  }

  return saveBinaryFilePromise(param, content, overwrite).then((succeeded) => {
    if (succeeded && onUploadProgress) {
      onUploadProgress({ key: param.path, loaded: 1, total: 1 }, undefined);
    }
    return succeeded;
  });
}

function platformUploadFileByMultiPart(
  filePath,
  file,
  overwrite,
  onUploadProgress,
) {
  if (objectStoreAPI) {
    const param = {
      path: filePath,
      bucketName: objectStoreAPI.config().bucketName,
    };
    return objectStoreAPI.uploadFileByMultiPart(
      param,
      file,
      overwrite,
      onUploadProgress,
    );
  }
}

function platformDeleteFilePromise(path) {
  if (objectStoreAPI) {
    const param = {
      path,
      bucketName: objectStoreAPI.config().bucketName,
    };
    return objectStoreAPI.deleteFilePromise(param);
  } else if (webDavAPI) {
    return webDavAPI.deleteFilePromise(path);
  }
  return deleteFilePromise(path);
}

function platformDeleteDirectoryPromise(path, useTrash) {
  if (objectStoreAPI) {
    const param = {
      path,
      bucketName: objectStoreAPI.config().bucketName,
    };
    return objectStoreAPI.deleteDirectoryPromise(param);
  } else if (webDavAPI) {
    return webDavAPI.deleteDirectoryPromise(path);
  }

  if (useTrash && moveToTrash) {
    return moveToTrash([path]);
  } else {
    return deleteDirectoryPromise(path);
  }
}

function platformOpenDirectory(dirPath) {
  return openDirectory(dirPath);
}

function platformOpenFile(filePath) {
  openFile(filePath);
}

function platformResolveFilePath(filePath) {
  return objectStoreAPI ? filePath : resolveFilePath(filePath);
}

function platformOpenUrl(url) {
  openUrl(url);
}

/**
 * TODO not used
 * @returns {*}
 */
function platformSelectFileDialog() {
  return selectFileDialog();
}

function platformSelectDirectoryDialog() {
  return selectDirectoryDialog();
}

function platformShareFiles(files) {
  if (AppConfig.isCordova) {
    shareFiles(files);
  } else {
    console.log('shareFiles is implemented in Cordova only.');
  }
}

function platformCreateNewInstance(url) {
  if (AppConfig.isElectron) {
    return createNewInstance(url);
  } else {
    console.log('Creating new instances is supported only on Electron.');
  }
}

function platformCheckFileExist(file) {
  if (AppConfig.isCordova) {
    return checkFileExist(file);
  }
  return platformGetPropertiesPromise(file).then((stats) => {
    return stats && stats.isFile;
  });
}

function platformCheckDirExist(dir) {
  if (AppConfig.isCordova) {
    return checkDirExist(dir);
  }
  // In cordova this check is too expensive for dirs like /.ts
  return platformGetPropertiesPromise(dir).then((stats) => {
    return stats && !stats.isFile;
  });
}

function platformUnZip(filePath, targetPath) {
  if (AppConfig.isElectron) {
    return unZip(filePath, targetPath);
  } else {
    console.log('platformUnZip is supported only on Electron.');
  }
}

function platformDirProperties(filePath) {
  if (AppConfig.isElectron && !objectStoreAPI && !webDavAPI) {
    return getDirProperties(filePath);
  } else {
    return Promise.reject(
      new Error(
        'platformDirProperties is supported on Electron local storage.',
      ),
    );
  }
}

module.exports = {
  platformGetLocationPath,
  platformIsWorkerAvailable,
  platformReadMacOSTags,
  platformWatchFolder,
  platformShowMainWindow,
  platformQuitApp,
  platformEnableObjectStoreSupport,
  platformEnableWebdavSupport,
  platformDisableObjectStoreSupport,
  platformDisableWebdavSupport,
  platformHaveObjectStoreSupport,
  platformHaveWebDavSupport,
  platformIsMinio,
  platformGetDirSeparator,
  platformFocusWindow,
  platformGetDevicePaths,
  platformGetURLforPath,
  platformCreateDirectoryIndexInWorker,
  platformListDirectoryPromise,
  platformListMetaDirectoryPromise,
  platformListObjectStoreDir,
  platformGetPropertiesPromise,
  platformCreateDirectoryPromise,
  platformCopyFilePromise,
  platformRenameFilePromise,
  platformRenameDirectoryPromise,
  platformMoveDirectoryPromise,
  platformCopyDirectoryPromise,
  platformLoadTextFilePromise,
  platformGetFileContentPromise,
  platformGetLocalFileContentPromise,
  platformSaveFilePromise,
  platformUploadFileByMultiPart,
  saveTextFilePlatform,
  platformSaveTextFilePromise,
  platformSaveBinaryFilePromise,
  platformDeleteFilePromise,
  platformDeleteDirectoryPromise,
  platformOpenDirectory,
  platformOpenFile,
  platformResolveFilePath,
  platformOpenUrl,
  platformSelectFileDialog,
  platformSelectDirectoryDialog,
  platformShareFiles,
  platformCreateIndex,
  platformCreateNewInstance,
  platformCheckDirExist,
  platformCheckFileExist,
  platformUnZip,
  platformDirProperties,
};
