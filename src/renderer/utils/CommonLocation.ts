// import AWS from "aws-sdk";
import AppConfig from '-/AppConfig';
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
//import * as objectStoreAPI from '@tagspaces/tagspaces-common-aws';
import { getFulfilledResults, getMimeType } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import * as cordovaIO from '@tagspaces/tagspaces-common-cordova';
import { Pro } from '-/pro';

export class CommonLocation implements TS.Location {
  uuid: string;
  newuuid?: string;
  name: string;
  workSpaceId?: string;
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
  reloadOnFocus?: boolean;
  disableThumbnailGeneration?: boolean;
  fullTextIndex?: boolean;
  extractLinks?: boolean;
  maxIndexAge?: number;
  maxLoops?: number;
  persistTagsInSidecarFile?: boolean;
  ignorePatternPaths?: Array<string>;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  bucketName?: string;
  encryptionKey?: string;
  region?: string;
  endpointURL?: string;
  autoOpenedFilename?: string;
  ioAPI?: any; //AWS.S3; //common API for IO operations interface
  urlCache = {};

  constructor(location: TS.Location) {
    this.uuid = location.uuid;
    this.workSpaceId = location.workSpaceId;
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
    this.reloadOnFocus = location.reloadOnFocus;
    this.disableThumbnailGeneration = location.disableThumbnailGeneration;
    this.fullTextIndex = Pro && location.fullTextIndex;
    this.extractLinks = Pro && location.extractLinks;
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
      this.encryptionKey = (location as TS.S3Location).encryptionKey; // '12345678901234567890123456789012';
      this.region = (location as TS.S3Location).region;
      this.endpointURL = (location as TS.S3Location).endpointURL;
      this.ioAPI = require('@tagspaces/tagspaces-common-aws3'); //objectStoreAPI.getS3Api(location);
    } else if (location.type === locationType.TYPE_WEBDAV) {
      // TODO impl
    } else if (AppConfig.isCordova) {
      this.ioAPI = cordovaIO;
    }
  }

  equal = (location: CommonLocation): boolean => {
    let isEqual =
      this.uuid === location.uuid &&
      this.name === location.name &&
      this.type === location.type && // 0 - local  && 1 - S3  && 2 - amplify  && 3 - webdav
      this.authType === location.authType && // none,password,digest,token
      this.username === location.username &&
      this.password === location.password &&
      this.path === location.path &&
      this.perspective === location.perspective &&
      this.creationDate === location.creationDate &&
      //  this.lastEditedDate === location.lastEditedDate  &&
      this.isDefault === location.isDefault &&
      this.isReadOnly === location.isReadOnly &&
      this.isNotEditable === location.isNotEditable &&
      this.watchForChanges === location.watchForChanges &&
      this.disableIndexing === location.disableIndexing &&
      this.disableThumbnailGeneration === location.disableThumbnailGeneration &&
      this.fullTextIndex === location.fullTextIndex &&
      this.maxIndexAge === location.maxIndexAge &&
      this.maxLoops === location.maxLoops &&
      this.persistTagsInSidecarFile === location.persistTagsInSidecarFile &&
      this.ignorePatternPaths === location.ignorePatternPaths &&
      this.autoOpenedFilename === location.autoOpenedFilename;
    if (!isEqual) {
      return false;
    }
    if (location.type === locationType.TYPE_CLOUD) {
      isEqual =
        this.accessKeyId === (location as TS.S3Location).accessKeyId &&
        this.secretAccessKey === (location as TS.S3Location).secretAccessKey &&
        this.sessionToken === (location as TS.S3Location).sessionToken &&
        this.bucketName === (location as TS.S3Location).bucketName &&
        this.encryptionKey === (location as TS.S3Location).encryptionKey &&
        this.region === (location as TS.S3Location).region &&
        this.endpointURL === (location as TS.S3Location).endpointURL;
    }
    return isEqual;
  };

  getPath = (param) => {
    if (typeof param === 'object' && param !== null) {
      return param.path;
    } else if (param) {
      return param;
    }
    return '';
  };
  /**
   * normalize path for URL: always use '/'
   *  – preserves UNC paths (\\HOST\share → //HOST/share)
   */
  normalizeUrl = (url: string) => {
    if (!url) return '';

    // 1) swap out Windows separators for '/'
    const sep = this.getDirSeparator();
    let normalized = sep !== '/' ? url.replaceAll(sep, '/') : url;

    // 2) detect UNC (\\ → //) before collapsing anything
    const isUnc = normalized.startsWith('//');

    // 3) pull off any leading protocol so we don't touch its "://"
    const protocolMatch = normalized.match(/^[a-z]+:\/\//i);
    const protocol = protocolMatch?.[0] || '';
    let rest = protocol ? normalized.slice(protocol.length) : normalized;

    // 4) collapse any run of 2+ slashes into one
    rest = rest.replace(/\/{2,}/g, '/');

    // 5) restore UNC prefix if needed
    if (isUnc) {
      rest = rest.replace(/^\/+/, '//');
    }

    // 5) ensure a leading slash for non‑HTTP URLs on non‑Windows
    if (!protocol && !AppConfig.isWin && !rest.startsWith('/')) {
      rest = '/' + rest;
    }

    return protocol + rest;
  };

  haveObjectStoreSupport = (): boolean => this.type === locationType.TYPE_CLOUD;

  haveWebDavSupport = (): boolean => this.type === locationType.TYPE_WEBDAV;

  getDirSeparator = (): string => {
    return this.ioAPI ? '/' : AppConfig.dirSeparator;
  };

  getEntryThumbPath = (
    entry: TS.FileSystemEntry,
    dt = undefined,
  ): Promise<string | undefined> => {
    if (entry) {
      return this.getThumbPath(this.getThumbEntryPath(entry), dt);
    }
    return Promise.resolve(undefined);
  };

  getThumbEntryPath = (
    entry: TS.FileSystemEntry,
    encoded = false,
  ): string | undefined => {
    if (!entry || !entry.path) {
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
  getFolderThumbPath = (
    path: string,
    dt = undefined,
  ): Promise<string | undefined> => {
    if (path) {
      return this.getThumbPath(
        getThumbFileLocationForDirectory(path, this.getDirSeparator()),
        dt,
      );
    }
    return Promise.resolve(undefined);
  };

  /**
   * @param thumbPath
   * @param dt
   * // isLocalFile - force to generate local URL
   * @param expirationInSeconds
   */
  getThumbPath = (
    thumbPath: string,
    dt = undefined,
    expirationInSeconds = 900,
  ): Promise<string | undefined> => {
    if (!thumbPath) {
      return Promise.resolve(undefined);
    }

    if (this.haveObjectStoreSupport() || this.haveWebDavSupport()) {
      if (this.isSignedURL(thumbPath)) {
        return Promise.resolve(thumbPath);
      }

      return this.getURLforPathInt(thumbPath, expirationInSeconds);
    }

    const normalizedUrl = this.normalizeUrl(thumbPath) + (dt ? '?' + dt : '');
    return Promise.resolve(normalizedUrl);
  };

  isSignedURL = (signedUrl): boolean => {
    try {
      // const query = url.parse(signedUrl, true).query;
      return signedUrl.indexOf('Signature=') !== -1;
    } catch (ex) {}
    return false;
  };

  getFolderBgndPath = (
    path: string,
    dt = undefined,
  ): Promise<string | undefined> => {
    if (path !== undefined) {
      return this.getBgndPath(
        getBgndFileLocationForDirectory(path, this.getDirSeparator()),
        dt,
      );
    }
    return Promise.resolve(undefined);
  };

  getBgndPath = (
    bgndPath: string,
    dt = undefined,
    expirationInSeconds = 900,
  ): Promise<string | undefined> => {
    if (!bgndPath) {
      return Promise.resolve(undefined);
    }

    if (this.haveObjectStoreSupport() || this.haveWebDavSupport()) {
      if (this.isSignedURL(bgndPath)) {
        return Promise.resolve(bgndPath);
      }

      return this.getURLforPathInt(bgndPath, expirationInSeconds);
    }

    const normalizedUrl = this.normalizeUrl(bgndPath) + (dt ? '?' + dt : '');
    return Promise.resolve(normalizedUrl);
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

  checkFileEncryptedPromise = (path: string): Promise<boolean> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport() && this.encryptionKey) {
        return this.ioAPI
          .getPropertiesPromise({
            path,
            bucketName: this.bucketName,
            location: this,
            ...(this.encryptionKey && { encryptionKey: this.encryptionKey }),
          })
          .then(
            (fsEntry: TS.FileSystemEntry) =>
              fsEntry && typeof fsEntry !== 'boolean',
          );
      }
    }
    return Promise.resolve(false);
  };

  getPropertiesPromise = (
    path: string,
    useEncryption: boolean = true,
    extractLinks: boolean = false,
  ): Promise<any> => {
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.getPropertiesPromise({
          path,
          bucketName: this.bucketName,
          location: this,
          ...(this.encryptionKey &&
            useEncryption && { encryptionKey: this.encryptionKey }),
        });
      }
      return this.ioAPI.getPropertiesPromise(path);
    } else if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'getPropertiesPromise',
        path,
        extractLinks,
      );
    }
    return Promise.reject(new Error('getPropertiesPromise: not implemented'));
  };

  checkFileExist = (file: string, useEncryption = true): Promise<boolean> => {
    if (file === undefined) {
      return Promise.resolve(false);
    }
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.isFileExist({
          path: file,
          bucketName: this.bucketName,
          location: this,
          ...(this.encryptionKey &&
            useEncryption && { encryptionKey: this.encryptionKey }),
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

  delUrlCache = (path) => {
    delete this.urlCache[path];
  };

  getURLforPathInt = async (
    path: string,
    expirationInSeconds: number = 900,
  ): Promise<string> => {
    const currentTime = new Date().getTime();

    // Check if URL is cached and not expired
    if (
      this.urlCache[path] &&
      this.urlCache[path].expirationTime > currentTime
    ) {
      return this.urlCache[path].url;
    } else {
      // Generate new URL and cache it with expiration time
      const url = await this.generateURLforPath(path, expirationInSeconds);
      return url;
    }
  };

  generateURLforPath = async (path, expirationInSeconds) => {
    let url;
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        const param = {
          path,
          bucketName: this.bucketName,
          location: this,
          ...(this.encryptionKey && { encryptionKey: this.encryptionKey }),
        };
        url = await this.ioAPI.getURLforPath(param, expirationInSeconds);
      } else if (this.haveWebDavSupport()) {
        url = this.ioAPI.getURLforPath(path);
      }
    }
    if (url && expirationInSeconds > 0) {
      this.urlCache[path] = {
        url: url,
        expirationTime: new Date().getTime() + expirationInSeconds * 1000,
      };
    }
    return url;
  };

  toFsEntry = (
    path: string,
    isFile: boolean,
    tagDelimiter?: string,
  ): TS.FileSystemEntry => {
    const name = isFile
      ? extractFileName(path, this.getDirSeparator())
      : extractDirectoryName(path, this.getDirSeparator());
    let tags = [];
    if (tagDelimiter) {
      tags = extractTagsAsObjects(name, tagDelimiter, this.getDirSeparator());
    }
    let entryPath = path;
    if (!isFile && !path.endsWith(this.getDirSeparator())) {
      entryPath = path + this.getDirSeparator();
    }
    return {
      uuid: getUuid(),
      name,
      isFile,
      locationID: this.uuid,
      ...(isFile && {
        extension: extractFileExtension(path, this.getDirSeparator()),
      }),
      tags,
      size: 0,
      lmdt: new Date().getTime(),
      path: entryPath,
    };
  };

  createDirectoryPromise = (dirPath: string): Promise<any> => {
    if (this.isReadOnly) {
      return Promise.reject(new Error('read only Location'));
    }
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
    if (this.isReadOnly) {
      return Promise.reject(new Error('read only Location'));
    }
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.copyFilePromise(
          {
            path: sourceFilePath,
            bucketName: this.bucketName,
            location: this,
            ...(this.encryptionKey && { encryptionKey: this.encryptionKey }),
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
    force = false,
  ): Promise<any> => {
    if (this.isReadOnly) {
      return Promise.reject(new Error('read only Location'));
    }
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.renameFilePromise(
          {
            path: filePath,
            bucketName: this.bucketName,
            location: this,
            ...(this.encryptionKey && { encryptionKey: this.encryptionKey }),
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
        force,
      );
    }
    return Promise.reject(new Error('renameFilePromise: not implemented'));
  };

  renameDirectoryPromise = (
    dirPath: string,
    newDirName: string,
  ): Promise<any> => {
    if (this.isReadOnly) {
      return Promise.reject(new Error('read only Location'));
    }
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.renameDirectoryPromise(
          {
            path: dirPath,
            bucketName: this.bucketName,
            location: this,
            ...(this.encryptionKey && { encryptionKey: this.encryptionKey }),
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
    if (this.isReadOnly) {
      return Promise.reject(new Error('read only Location'));
    }
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.copyDirectoryPromise(
          {
            ...param,
            bucketName: this.bucketName,
            location: this,
            ...(this.encryptionKey && { encryptionKey: this.encryptionKey }),
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
    if (this.isReadOnly) {
      return Promise.reject(new Error('read only Location'));
    }
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.moveDirectoryPromise(
          {
            ...param,
            bucketName: this.bucketName,
            location: this,
            ...(this.encryptionKey && { encryptionKey: this.encryptionKey }),
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
    if (this.isReadOnly) {
      return Promise.reject(new Error('read only Location'));
    }
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.saveFilePromise(
          {
            ...param,
            bucketName: this.bucketName,
            location: this,
            ...(this.encryptionKey && { encryptionKey: this.encryptionKey }),
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
    if (this.isReadOnly) {
      return Promise.reject(new Error('read only Location'));
    }
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.saveTextFilePromise(
          {
            ...param,
            bucketName: this.bucketName,
            location: this,
            ...(this.encryptionKey && { encryptionKey: this.encryptionKey }),
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
    if (this.isReadOnly) {
      return Promise.reject(new Error('read only Location'));
    }
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.saveBinaryFilePromise(
          {
            ...param,
            bucketName: this.bucketName,
            location: this,
            ...(this.encryptionKey && { encryptionKey: this.encryptionKey }),
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
    if (this.isReadOnly) {
      return Promise.reject(new Error('read only Location'));
    }
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
    if (this.isReadOnly) {
      return Promise.reject(new Error('read only Location'));
    }
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

  loadTextFilePromise = (
    param: any,
    isPreview?: boolean,
    useEncryption: boolean = true,
  ): Promise<string> => {
    let filePath = this.getPath(param);
    try {
      filePath = decodeURIComponent(filePath);
    } catch (ex) {}
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI
          .loadTextFilePromise(
            {
              path: filePath,
              bucketName: this.bucketName,
              location: this,
              ...(this.encryptionKey &&
                useEncryption && { encryptionKey: this.encryptionKey }),
            },
            isPreview,
          )
          .then((txtContent) => {
            if (this.encryptionKey && txtContent === undefined) {
              //handle wrong encryption
              return this.ioAPI.loadTextFilePromise(
                {
                  path: filePath,
                  bucketName: this.bucketName,
                  location: this,
                  ...(this.encryptionKey &&
                    !useEncryption && { encryptionKey: this.encryptionKey }),
                },
                isPreview,
              );
            }
            return txtContent;
          });
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

  getFileContentPromise = (param: any, type?: string): Promise<any> => {
    const filePath = this.getPath(param);
    if (this.ioAPI) {
      if (this.haveObjectStoreSupport()) {
        return this.ioAPI.getFileContentPromise(
          {
            path: filePath,
            bucketName: this.bucketName,
            location: this,
            ...(this.encryptionKey && { encryptionKey: this.encryptionKey }),
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
    extractLinks: boolean,
    ignorePatterns: Array<string>,
    requestId: string,
  ): Promise<any> => {
    /*if (this.isReadOnly) {
      return Promise.reject(new Error('read only Location'));
    }*/
    if (
      AppConfig.isElectron &&
      !this.haveObjectStoreSupport() &&
      !this.haveWebDavSupport()
    ) {
      const payload = JSON.stringify({
        directoryPath,
        extractText,
        extractLinks,
        ignorePatterns,
      });
      return window.electronIO.ipcRenderer.invoke(
        'postRequest',
        payload,
        '/indexer',
        requestId,
      );
    }
    return Promise.reject(
      new Error('createDirectoryIndexInWorker not Electron!'),
    );
  };

  loadJSONFile = (
    filePath: string,
    useEncryption: boolean = true,
  ): Promise<TS.FileSystemEntryMeta> => {
    return this.loadTextFilePromise(filePath, undefined, useEncryption)
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
      throw new Error('loadMetaDataPromise not exist ' + path);
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
        //id: getUuid(),
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
        //id: getUuid(),
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
