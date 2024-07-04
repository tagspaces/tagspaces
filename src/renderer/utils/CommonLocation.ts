// import AWS from "aws-sdk";
import { locationType } from '@tagspaces/tagspaces-common/misc';
import {
  extractDirectoryName,
  extractFileExtension,
  extractFileName,
  extractTagsAsObjects,
  getBgndFileLocationForDirectory,
  getMetaFileLocationForDir,
  getMetaFileLocationForFile,
  getThumbFileLocationForDirectory,
  getThumbFileLocationForFile,
  normalizePath,
} from '@tagspaces/tagspaces-common/paths';
import { getUuid, loadJSONString } from '@tagspaces/tagspaces-common/utils-io';
import AppConfig from '-/AppConfig';
//import * as objectStoreAPI from '@tagspaces/tagspaces-common-aws';
import * as cordovaIO from '@tagspaces/tagspaces-common-cordova';
import { TS } from '-/tagspaces.namespace';
import {
  getDescriptionPreview,
  getFulfilledResults,
  getMimeType,
} from '-/services/utils-io';

export class CommonLocation implements TS.Location {
  uuid: string;
  newuuid?: string;
  name: string;
  type: string; // 0 - local; 1 - S3; 2 - amplify; 3 - webdav
  authType?: string; // none,password,digest,token
  username?: string;
  password?: string;
  paths?: Array<string>; // deprecated
  path?: string;
  children?: Array<any>; // this is for tree -> getDirectoriesTree
  perspective?: string; // id of the perspective
  creationDate?: number;
  lastEditedDate?: number;
  isDefault: boolean;
  isReadOnly?: boolean;
  isNotEditable?: boolean;
  watchForChanges?: boolean;
  disableIndexing?: boolean;
  disableThumbnailGeneration?: boolean;
  fullTextIndex?: boolean;
  maxIndexAge?: number;
  maxLoops?: number;
  persistTagsInSidecarFile?: boolean;
  ignorePatternPaths?: Array<string>;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  bucketName?: string;
  region?: string;
  endpointURL?: string;
  autoOpenedFilename?: string;
  ioAPI?: any; //AWS.S3; //common API for IO operations interface
  urlCache = {};

  constructor(location: TS.Location) {
    this.uuid = location.uuid;
    this.newuuid = location.newuuid;
    this.name = location.name;
    this.type = location.type; // 0 - local; 1 - S3; 2 - amplify; 3 - webdav
    this.authType = location.authType; // none,password,digest,token
    this.username = location.username;
    this.password = location.password;
    //this.paths = location.paths; // deprecated
    this.path = location.path;
    //children?: Array<any>;
    this.perspective = location.perspective; // id of the perspective
    this.creationDate = location.creationDate
      ? location.creationDate
      : new Date().getTime();
    this.lastEditedDate = new Date().getTime();
    this.isDefault = location.isDefault;
    this.isReadOnly = location.isReadOnly;
    this.isNotEditable = location.isNotEditable;
    this.watchForChanges = location.watchForChanges;
    this.disableIndexing = location.disableIndexing;
    this.disableThumbnailGeneration = location.disableThumbnailGeneration;
    this.fullTextIndex = location.fullTextIndex;
    this.maxIndexAge = location.maxIndexAge;
    this.maxLoops = location.maxLoops;
    this.persistTagsInSidecarFile = location.persistTagsInSidecarFile;
    this.ignorePatternPaths = location.ignorePatternPaths;
    this.autoOpenedFilename = location.autoOpenedFilename;
    if (location.type === locationType.TYPE_CLOUD) {
      this.accessKeyId = (location as TS.S3Location).accessKeyId;
      this.secretAccessKey = (location as TS.S3Location).secretAccessKey;
      this.sessionToken = (location as TS.S3Location).sessionToken;
      this.bucketName = (location as TS.S3Location).bucketName;
      this.region = (location as TS.S3Location).region;
      this.endpointURL = (location as TS.S3Location).endpointURL;
      this.ioAPI = require('@tagspaces/tagspaces-common-aws3'); //objectStoreAPI.getS3Api(location);
    } else if (location.type === locationType.TYPE_WEBDAV) {
      // TODO impl
    } else if (AppConfig.isCordova) {
      this.ioAPI = cordovaIO;
    }
  }

  getPath = (param) => {
    if (typeof param === 'object' && param !== null) {
      return param.path;
    } else if (param) {
      return param;
    }
    return '';
  };
  /**
   *  normalize path for URL is always '/'
   */
  normalizeUrl = (url: string) => {
    let normalizedUrl = url;
    if (this.getDirSeparator() !== '/') {
      if (url) {
        normalizedUrl = url.replaceAll(this.getDirSeparator(), '/');
      }
    }
    if (!normalizedUrl.startsWith('http') && !normalizedUrl.startsWith('/')) {
      normalizedUrl = '/' + normalizedUrl;
    }
    return normalizedUrl;
  };

  haveObjectStoreSupport = (): boolean => this.type === locationType.TYPE_CLOUD;

  haveWebDavSupport = (): boolean => this.type === locationType.TYPE_WEBDAV;

  getDirSeparator = (): string => {
    return this.ioAPI ? '/' : AppConfig.dirSeparator;
  };

  getEntryThumbPath = (entry: TS.FileSystemEntry, dt = undefined) => {
    if (entry) {
      return this.getThumbPath(this.getThumbEntryPath(entry), dt);
    }
    return undefined;
  };

  getThumbEntryPath = (entry: TS.FileSystemEntry, encoded = false) => {
    if (!entry) {
      return undefined;
    }
    return entry.isFile
      ? getThumbFileLocationForFile(entry.path, this.getDirSeparator(), encoded)
      : getThumbFileLocationForDirectory(entry.path, this.getDirSeparator());
  };
  /**
   * @param path
   * @param dt
   */
  getFolderThumbPath = (path: string, dt = undefined) => {
    if (path) {
      return this.getThumbPath(
        getThumbFileLocationForDirectory(path, this.getDirSeparator()),
        dt,
      );
    }
    return undefined;
  };

  /**
   * @param thumbPath
   * @param dt
   * // isLocalFile - force to generate local URL
   */
  getThumbPath = (
    thumbPath: string,
    dt = undefined,
    // isLocalFile = false, // todo rethink this
  ) => {
    if (!thumbPath) {
      return undefined;
    }
    if (this.haveObjectStoreSupport() || this.haveWebDavSupport()) {
      if (this.isSignedURL(thumbPath)) {
        return thumbPath;
      }
      return this.getURLforPath(thumbPath);
    }
    return this.normalizeUrl(thumbPath) + (dt ? '?' + dt : '');
  };

  isSignedURL = (signedUrl) => {
    try {
      // const query = url.parse(signedUrl, true).query;
      return signedUrl.indexOf('Signature=') !== -1;
    } catch (ex) {}
    return false;
  };

  getFolderBgndPath = (path: string, dt = undefined) => {
    if (path !== undefined) {
      return this.getBgndPath(
        getBgndFileLocationForDirectory(path, this.getDirSeparator()),
        dt,
      );
    }
    return undefined;
  };

  getBgndPath = (bgndPath: string, dt = undefined) => {
    if (!bgndPath) {
      return undefined;
    }
    if (this.haveObjectStoreSupport() || this.haveWebDavSupport()) {
      return this.getURLforPath(bgndPath);
    }
    return this.normalizeUrl(bgndPath) + (dt ? '?' + dt : '');
  };

  listDirectoryPromise = (
    param: any,
    mode = ['extractThumbPath'],
    ignorePatterns: Array<string> = [],
    resultsLimit: any = {},
  ): Promise<Array<any>> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.listDirectoryPromise(
          {
            path: this.getPath(param),
            bucketName: this.bucketName,
            location: this,
          },
          mode,
          ignorePatterns,
          resultsLimit,
        );
      }
      return this.ioAPI.listDirectoryPromise(
        param,
        mode,
        ignorePatterns,
        resultsLimit,
      );
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'listDirectoryPromise',
        param,
        mode,
        ignorePatterns,
        resultsLimit,
      );
    }
    return Promise.reject(new Error('listDirectoryPromise not implemented!'));
  };

  listMetaDirectoryPromise = (param: any): Promise<Array<any>> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.listMetaDirectoryPromise({
          path: this.getPath(param),
          bucketName: this.bucketName,
          location: this,
        });
      }
      return this.ioAPI.listMetaDirectoryPromise(param);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'listMetaDirectoryPromise',
        param,
      );
    }
    return Promise.reject(
      new Error('listMetaDirectoryPromise not implemented!'),
    );
  };

  getPropertiesPromise = (path: string): Promise<any> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.getPropertiesPromise({
          path,
          bucketName: this.bucketName,
          location: this,
        });
      }
      return this.ioAPI.getPropertiesPromise(path);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('getPropertiesPromise', path);
    }
    return Promise.reject(new Error('getPropertiesPromise: not implemented'));
  };

  checkFileExist = (file: string): Promise<boolean> => {
    if (file === undefined) {
      return Promise.resolve(false);
    }
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.isFileExist({
          path: file,
          bucketName: this.bucketName,
          location: this,
        });
      } else if (AppConfig.isCordova) {
        return this.ioAPI.checkFileExist(file);
      }
      return this.ioAPI
        .getPropertiesPromise(file)
        .then((stats) => stats && stats.isFile);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('checkFileExist', file);
    }
    return Promise.reject(new Error('checkFileExist: not implemented'));
  };

  checkDirExist = (dir: string): Promise<boolean> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI
          .getPropertiesPromise({
            path: dir,
            bucketName: this.bucketName,
            location: this,
          })
          .then((stats) => stats && !stats.isFile);
      } else if (AppConfig.isCordova) {
        return this.ioAPI.checkDirExist(dir);
      }
      return this.ioAPI
        .getPropertiesPromise(dir)
        .then((stats) => stats && !stats.isFile);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke('checkDirExist', dir);
    }
    return Promise.reject(new Error('checkDirExist: not implemented'));
  };

  getURLforPath = (path: string, expirationInSeconds: number = 900): string => {
    const currentTime = new Date().getTime();

    // Check if URL is cached and not expired
    if (
      this.urlCache[path] &&
      this.urlCache[path].expirationTime > currentTime
    ) {
      return this.urlCache[path].url;
    } else {
      // Generate new URL and cache it with expiration time
      return this.generateURLforPath(path, expirationInSeconds);
    }
  };

  generateURLforPath = (path, expirationInSeconds) => {
    let url;
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        const param = {
          path,
          bucketName: this.bucketName,
          location: this,
        };
        url = this.ioAPI.getURLforPath(param, expirationInSeconds);
      } else if (this.haveWebDavSupport()) {
        url = this.ioAPI.getURLforPath(path);
      }
    }
    if (url) {
      this.urlCache[path] = {
        url: url,
        expirationTime: new Date().getTime() + expirationInSeconds * 1000,
      };
    }
    return url;
  };

  toFsEntry = (path: string, isFile: boolean): TS.FileSystemEntry => {
    const name = isFile
      ? extractFileName(path, this.getDirSeparator())
      : extractDirectoryName(path, this.getDirSeparator());
    const tags = extractTagsAsObjects(
      name,
      AppConfig.tagDelimiter,
      this.getDirSeparator(),
    );
    return {
      uuid: getUuid(),
      name,
      isFile,
      locationID: this.uuid,
      extension: extractFileExtension(path, this.getDirSeparator()),
      tags,
      size: 0,
      lmdt: new Date().getTime(),
      path,
    };
  };

  createDirectoryPromise = (dirPath: string): Promise<any> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.createDirectoryPromise({
          path: dirPath,
          bucketName: this.bucketName,
          location: this,
        });
      }
      return this.ioAPI.createDirectoryPromise(dirPath);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'createDirectoryPromise',
        dirPath,
      );
    }
    return Promise.reject(new Error('createDirectoryPromise: not implemented'));
  };

  copyFilePromiseOverwrite = (
    sourceFilePath: string,
    targetFilePath: string,
  ): Promise<any> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.copyFilePromise(
          {
            path: sourceFilePath,
            bucketName: this.bucketName,
            location: this,
          },
          targetFilePath,
        );
      }
      return this.ioAPI.copyFilePromise(sourceFilePath, targetFilePath);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'copyFilePromiseOverwrite',
        sourceFilePath,
        targetFilePath,
      );
    }
    return Promise.reject(
      new Error('copyFilePromiseOverwrite: not implemented'),
    );
  };

  renameFilePromise = (
    filePath: string,
    newFilePath: string,
    onProgress = undefined,
  ): Promise<any> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.renameFilePromise(
          {
            path: filePath,
            bucketName: this.bucketName,
            location: this,
          },
          newFilePath,
          onProgress,
        );
      }
      return this.ioAPI.renameFilePromise(filePath, newFilePath, onProgress);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'renameFilePromise',
        filePath,
        newFilePath,
        onProgress !== undefined,
      );
    }
    return Promise.reject(new Error('renameFilePromise: not implemented'));
  };

  renameDirectoryPromise = (
    dirPath: string,
    newDirName: string,
  ): Promise<any> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.renameDirectoryPromise(
          {
            path: dirPath,
            bucketName: this.bucketName,
            location: this,
          },
          newDirName,
        );
      }
      return this.ioAPI.renameDirectoryPromise(dirPath, newDirName);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'renameDirectoryPromise',
        dirPath,
        newDirName,
      );
    }
    return Promise.reject(new Error('renameDirectoryPromise: not implemented'));
  };

  copyDirectoryPromise = (
    param: any,
    newDirPath: string,
    onProgress = undefined,
  ): Promise<any> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.copyDirectoryPromise(
          {
            ...param,
            bucketName: this.bucketName,
            location: this,
          },
          newDirPath,
          onProgress,
        );
      }
      return this.ioAPI.copyDirectoryPromise(param, newDirPath, onProgress);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'copyDirectoryPromise',
        param,
        newDirPath,
        onProgress !== undefined,
      );
    }
    return Promise.reject(new Error('copyDirectoryPromise: not implemented'));
  };

  moveDirectoryPromise = (
    param: any,
    newDirPath: string,
    onProgress = undefined,
  ): Promise<any> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.moveDirectoryPromise(
          {
            ...param,
            bucketName: this.bucketName,
            location: this,
          },
          newDirPath,
          onProgress,
        );
      }
      return this.ioAPI.moveDirectoryPromise(param, newDirPath, onProgress);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'moveDirectoryPromise',
        param,
        newDirPath,
        onProgress !== undefined,
      );
    }
    return Promise.reject(new Error('moveDirectoryPromise: not implemented'));
  };

  saveFilePromise = (
    param: any,
    content: any,
    overwrite: boolean,
  ): Promise<any> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.saveFilePromise(
          {
            ...param,
            bucketName: this.bucketName,
            location: this,
          },
          content,
          overwrite,
        );
      }
      return this.ioAPI.saveFilePromise(param, content, overwrite);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'saveFilePromise',
        param,
        content,
        overwrite,
      );
    }
    return Promise.reject(new Error('saveFilePromise: not implemented'));
  };

  saveTextFilePromise = (
    param: any,
    content: string,
    overwrite: boolean,
  ): Promise<any> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.saveTextFilePromise(
          {
            ...param,
            bucketName: this.bucketName,
            location: this,
          },
          content,
          overwrite,
        );
      }
      return this.ioAPI.saveTextFilePromise(param, content, overwrite);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'saveTextFilePromise',
        param,
        content,
        overwrite,
      );
    }
    return Promise.reject(new Error('saveTextFilePromise: not implemented'));
  };

  saveBinaryFilePromise = (
    param: any,
    content: any,
    overwrite: boolean,
    onUploadProgress?: (
      progress: any, // ManagedUpload.Progress,
      response: any, // AWS.Response<AWS.S3.PutObjectOutput, AWS.AWSError>
    ) => void,
  ): Promise<TS.FileSystemEntry> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.saveBinaryFilePromise(
          {
            ...param,
            bucketName: this.bucketName,
            location: this,
          },
          content,
          overwrite,
          onUploadProgress,
        );
      } else if (AppConfig.isCordova) {
        return this.ioAPI
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
      return this.ioAPI.saveBinaryFilePromise(
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
    }
    return Promise.reject(new Error('saveBinaryFilePromise: not implemented'));
  };

  deleteFilePromise = (path: string, useTrash?: boolean): Promise<any> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.deleteFilePromise({
          path,
          bucketName: this.bucketName,
          location: this,
        });
      }
      return this.ioAPI.deleteFilePromise(path);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'deleteFilePromise',
        path,
        useTrash,
      );
    }
    return Promise.reject(new Error('deleteFilePromise: not implemented'));
  };

  deleteDirectoryPromise = (path: string, useTrash?: boolean): Promise<any> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.deleteDirectoryPromise({
          path,
          bucketName: this.bucketName,
          location: this,
        });
      }
      return this.ioAPI.deleteDirectoryPromise(path);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'deleteDirectoryPromise',
        path,
        useTrash,
      );
    }
    return Promise.reject(new Error('deleteDirectoryPromise: not implemented'));
  };

  shareFiles = (files: Array<string>): void => {
    if (AppConfig.isCordova) {
      cordovaIO.shareFiles(files);
    } else {
      console.log('shareFiles is implemented in Cordova only.');
    }
  };

  /*getLocalFileContentPromise = (
    filePath: string,
    type?: string,
  ): Promise<any> => {
    return window.electronIO.ipcRenderer.invoke(
      'getFileContentPromise',
      filePath,
      type,
    );
  };*/

  loadTextFilePromise = (param: any, isPreview?: boolean): Promise<string> => {
    let filePath = this.getPath(param);
    try {
      filePath = decodeURIComponent(filePath);
    } catch (ex) {}
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.loadTextFilePromise(
          {
            path: filePath,
            bucketName: this.bucketName,
            location: this,
          },
          isPreview,
        );
      }
      return this.ioAPI.loadTextFilePromise(filePath, isPreview);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'loadTextFilePromise',
        filePath,
        isPreview,
      );
    }
    return Promise.reject(new Error('loadTextFilePromise: not implemented'));
  };

  getFileContentPromise = (filePath: string, type?: string): Promise<any> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.getFileContentPromise(
          {
            path: filePath,
            bucketName: this.bucketName,
            location: this,
          },
          type,
        );
      }
      return this.ioAPI.getFileContentPromise(filePath, type);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'getFileContentPromise',
        filePath,
        type,
      );
    }
    return Promise.reject(new Error('getFileContentPromise: not implemented'));
  };

  createDirectoryIndexInWorker = (
    directoryPath: string,
    extractText: boolean,
    ignorePatterns: Array<string>,
  ): Promise<any> => {
    if (
      AppConfig.isElectron &&
      !this.haveObjectStoreSupport() &&
      !this.haveWebDavSupport()
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

  loadJSONFile = (filePath: string): Promise<TS.FileSystemEntryMeta> => {
    return this.loadTextFilePromise(filePath)
      .then(
        (jsonContent) => loadJSONString(jsonContent) as TS.FileSystemEntryMeta,
      )
      .catch((e) => {
        console.log('cannot load json:' + filePath, e);
        return undefined;
      });
  };

  checkFilesExistPromise = (
    paths: string[],
    targetPath: string,
  ): Promise<Array<string>> => {
    const promises: TS.FileExistenceCheck[] = paths.map((path) => {
      const targetFile =
        normalizePath(targetPath) +
        this.getDirSeparator() +
        extractFileName(path, this.getDirSeparator());
      return { promise: this.checkFileExist(targetFile), path };
    });
    const progressPromises: Array<Promise<string>> = promises.map(
      ({ promise, path }) =>
        promise
          .then((exists) => (exists ? path : ''))
          .catch((err) => {
            console.log(`Promise ${path} error:`, err);
            return '';
          }),
    );

    return Promise.allSettled(progressPromises).then((results) => {
      return getFulfilledResults(results).filter((r) => r);
    });
  };

  checkDirsExistPromise = (
    paths: string[],
    targetPath: string,
  ): Promise<Array<string>> => {
    const promises: TS.FileExistenceCheck[] = paths.map((path) => {
      const targetDir =
        normalizePath(targetPath) +
        this.getDirSeparator() +
        extractDirectoryName(path, this.getDirSeparator());
      return { promise: this.checkDirExist(targetDir), path };
    });
    const progressPromises: Array<Promise<string>> = promises.map(
      ({ promise, path }) =>
        promise
          .then((exists) => (exists ? path : ''))
          .catch((err) => {
            console.log(`Promise ${path} error:`, err);
            return '';
          }),
    );

    return Promise.allSettled(progressPromises).then((results) => {
      return getFulfilledResults(results).filter((r) => r);
    });
  };
  /**
   * if you have entryProperties.isFile prefer to use loadFileMetaDataPromise/loadDirMetaDataPromise
   * @param path
   * @param fullDescription
   */
  loadMetaDataPromise = (path: string): Promise<TS.FileSystemEntryMeta> => {
    return this.getPropertiesPromise(path).then((entryProperties) => {
      if (entryProperties) {
        if (entryProperties.isFile) {
          return this.loadFileMetaDataPromise(path);
        }
        return this.loadDirMetaDataPromise(path);
      }
      throw new Error('loadMetaDataPromise not exist' + path);
    });
  };

  loadFileMetaDataPromise = (
    path: string,
    //fullDescription = true,
  ): Promise<TS.FileSystemEntryMeta> => {
    const metaFilePath = getMetaFileLocationForFile(
      path,
      this.getDirSeparator(),
    );
    return this.loadJSONFile(metaFilePath).then((metaData) => {
      if (!metaData) {
        throw new Error(
          'loadFileMetaDataPromise ' + metaFilePath + ' not exist',
        );
      }
      return {
        id: getUuid(),
        isFile: true,
        color: '',
        tags: [],
        appName: '',
        appVersion: '',
        // lastUpdated: 0,
        ...metaData,
      };
    });
  };

  loadDirMetaDataPromise = (
    path: string,
    //fullDescription = false,
  ): Promise<TS.FileSystemEntryMeta> => {
    const metaDirPath = getMetaFileLocationForDir(path, this.getDirSeparator());
    return this.loadJSONFile(metaDirPath).then((metaData) => {
      if (!metaData) {
        throw new Error('loadDirMetaDataPromise ' + metaDirPath + ' not exist');
      }
      return {
        id: getUuid(),
        isFile: false,
        color: '',
        perspective: 'grid',
        tags: [],
        appName: '',
        appVersion: '',
        // lastUpdated: 0,
        ...metaData,
        /*description: fullDescription
          ? metaData.description
          : getDescriptionPreview(metaData.description, 200),*/
      };
    });
  };

  openFile = (file: TS.FileSystemEntry): void => {
    if (AppConfig.isCordova) {
      this.ioAPI.openFile(file.path, getMimeType(file.extension));
    }
  };
}
