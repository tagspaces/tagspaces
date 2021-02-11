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

import uuidv1 from 'uuid';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { Amplify, Storage } from 'aws-amplify';
import * as AWS from 'aws-sdk';
import AppConfig from '-/config';
import {
  extractFileName,
  extractParentDirectoryPath,
  extractDirectoryName,
  normalizePath,
  getThumbFileLocationForFile,
  getMetaFileLocationForFile,
  extractFileExtension
} from '-/utils/paths';
import { FileSystemEntry } from '-/services/utils-io';

export default class AmplifyStoreIO {
  /* private awsconfig: any;

  constructor() {
    try {
      // eslint-disable-next-line global-require
      this.awsconfig = require('-/aws-exports').default;
    } catch (e) {
      if (e && e.code && e.code === 'MODULE_NOT_FOUND') {
        console.debug(
          'Auth functionality not available aws-exports.js is missing. Are you sure that you have run "amplitude init"?'
        );
      }
      throw e;
    }
  } */

  getURLforPath = (path: string): Promise<any> => {
    if (!path || path.length < 1) {
      console.warn('Wrong path param for getURLforPath');
      return Promise.resolve('');
    }
    return Storage.get(path);
  };

  listMetaDirectoryPromise = async (path: string): Promise<Array<any>> => {
    const entries = [];
    let entry;

    const normalizedPath = normalizePath(this.normalizeRootPath(path));
    const metaDirPath =
      normalizedPath.length > 0
        ? normalizedPath + '/' + AppConfig.metaFolder + '/'
        : AppConfig.metaFolder + '/';

    return Storage.list(metaDirPath) // for listing ALL files without prefix, pass '' instead
      .then(data => {
        // console.debug(result);
        data.forEach(file => {
          // console.warn('Meta: ' + JSON.stringify(file));
          entry = {};
          entry.name = file.key;
          entry.path = file.key;
          entry.isFile = true;
          entry.size = file.size;
          entry.lmdt = Date.parse(file.lastModified);
          if (file.key !== metaDirPath) {
            // skipping the current folder
            entries.push(entry);
          }
        });
        return entries;
      })
      .catch(err => {
        console.warn('Error listing meta directory ' + path, err);
        return Promise.resolve(entries); // returning results even if any promise fails
      });
  };

  /* processStorageList = result => {
    const files = [];
    const folders = new Set();
    result.forEach(res => {
      if (res.size) {
        files.push(res);
        // sometimes files declare a folder with a / within then
        const possibleFolder = res.key
          .split('/')
          .slice(0, -1)
          .join('/');
        if (possibleFolder) folders.add(possibleFolder);
      } else {
        folders.add(res.key);
      }
    });
    return { files, folders };
  }; */

  processStorageList = (results): any => {
    const filesystem = {};
    // https://stackoverflow.com/questions/44759750/how-can-i-create-a-nested-object-representation-of-a-folder-structure
    const add = (source, target, item) => {
      const elements = source.split('/');
      const element = elements.shift();
      if (!element) return; // blank
      target[element] = target[element] || { __data: item }; // element;
      if (elements.length) {
        target[element] =
          typeof target[element] === 'object' ? target[element] : {};
        add(elements.join('/'), target[element], item);
      }
    };
    results.forEach(item => add(item.key, filesystem, item));
    return filesystem;
  };

  listDirectoryPromise = (
    path: string,
    lite: boolean = true
  ): Promise<Array<Object>> =>
    new Promise(async resolve => {
      const enhancedEntries = [];
      let entryPath;
      let metaFolderPath;
      let stats;
      let eentry;
      const containsMetaFolder = false;

      const metaContent = await this.listMetaDirectoryPromise(path);
      // console.log('Meta folder content: ' + JSON.stringify(metaContent));

      const dirPath =
        path.length > 0 && path !== '/'
          ? normalizePath(this.normalizeRootPath(path)) + '/'
          : '';
      Storage.list(dirPath)
        .then(data => {
          const fileSystem: any = this.processStorageList(data);
          const metaPromises = [];

          // for (const [fileName, file] of Object.entries(fileSystem)) { TODO
          fileSystem.forEach(async file => {
            // console.warn(JSON.stringify(file));
            let thumbPath = getThumbFileLocationForFile(file.key, '/');
            const thumbAvailable = metaContent.find(
              (obj: any) => obj.path === thumbPath
            );
            if (thumbAvailable) {
              thumbPath = await this.getURLforPath(thumbPath); // , 604800); // 60 * 60 * 24 * 7 = 1 week
            } else {
              thumbPath = '';
            }

            eentry = {};
            eentry.name = extractFileName(file.key, '/');
            eentry.path = file.key;
            eentry.tags = [];
            eentry.thumbPath = thumbPath;
            eentry.meta = {};
            eentry.isFile = true;
            eentry.size = file.size;
            eentry.lmdt = Date.parse(file.lastModified);
            if (file.key !== dirPath) {
              // skipping the current folder
              enhancedEntries.push(eentry);
              const metaFilePath = getMetaFileLocationForFile(file.key, '/');
              const metaFileAvailable = metaContent.find(
                (obj: any) => obj.path === metaFilePath
              );
              if (metaFileAvailable) {
                metaPromises.push(this.getEntryMeta(eentry));
              }
            }
          });

          return Promise.all(metaPromises)
            .then(entriesMeta => {
              entriesMeta.forEach(entryMeta => {
                enhancedEntries.some(enhancedEntry => {
                  if (enhancedEntry.path === entryMeta.path) {
                    enhancedEntry = entryMeta;
                    return true;
                  }
                  return false;
                });
              });
              resolve(enhancedEntries);
              return true;
            })
            .catch(() => {
              resolve(enhancedEntries);
            });
        })
        .catch(err => {
          console.warn('Error listing directory ' + path, err);
          return resolve(enhancedEntries); // returning results even if any promise fails
        });
    });

  getEntryMeta = async (eentry: FileSystemEntry): Promise<Object> => {
    const promise = new Promise(async resolve => {
      if (eentry.isFile) {
        const metaFilePath = getMetaFileLocationForFile(eentry.path, '/');
        const metaFileContent = await this.loadTextFilePromise(metaFilePath);
        eentry.meta = JSON.parse(metaFileContent.trim());
        resolve(eentry);
        // resolve({ ...eentry, meta: JSON.parse(metaFileContent.trim()) });
      } else {
        if (
          !eentry.path.includes('/' + AppConfig.metaFolder) &&
          !eentry.path.includes(AppConfig.metaFolder + '/')
        ) {
          // skipping meta folder
          const folderTmbPath =
            eentry.path +
            AppConfig.metaFolder +
            '/' +
            AppConfig.folderThumbFile;
          const folderThumbProps = await this.getPropertiesPromise(
            folderTmbPath
          );
          if (folderThumbProps.isFile) {
            eentry.thumbPath = await this.getURLforPath(folderTmbPath); // , 604800); // 60 * 60 * 24 * 7 = 1 week ;
          }
          // }
          // if (!eentry.path.endsWith(AppConfig.metaFolder + '/')) { // Skip the /.ts folder
          const folderMetaPath =
            normalizePath(this.normalizeRootPath(eentry.path)) +
            '/' +
            AppConfig.metaFolder +
            '/' +
            AppConfig.metaFolderFile;
          const folderProps = await this.getPropertiesPromise(folderMetaPath);
          if (folderProps.isFile) {
            const metaFileContent = await this.loadTextFilePromise(
              folderMetaPath
            );
            eentry.meta = JSON.parse(metaFileContent.trim());
            // console.log('Folder meta for ' + eentry.path + ' - ' + JSON.stringify(eentry.meta));
          }
        }
        resolve(eentry);
      }
    });
    const result = await promise;
    return result;
  };

  getPropertiesPromise = (path: string): Promise<any> =>
    new Promise((resolve, reject) => {
      /* const normalizedPath = this.normalizeRootPath(path); // normalizePath(path); don't clean trailing / for dir properties
      if (normalizedPath) {
        const params = {
          Bucket: this.config.bucketName,
          Key: normalizedPath
        };
        this.objectStore.headObject(params, (err, data) => {
          if (err) {
            // workaround for checking if a folder exists on s3
            const listParams = {
              Bucket: this.config.bucketName,
              Prefix: normalizedPath,
              MaxKeys: 1,
              Delimiter: '/'
            };
            this.objectStore.listObjectsV2(
              listParams,
              (listError, listData) => {
                if (listError) {
                  resolve(false);
                  return;
                }
                const folderExists =
                  (listData && listData.KeyCount && listData.KeyCount > 0) || // supported on aws s3
                  (listData &&
                    listData.CommonPrefixes &&
                    listData.CommonPrefixes.length > 0); // needed for DO
                if (folderExists) {
                  resolve({
                    name: extractDirectoryName(normalizedPath, '/'),
                    isFile: false,
                    size: 0,
                    lmdt: undefined,
                    path: normalizedPath
                  });
                } else {
                  resolve(false);
                }
              }
            );
            return;
          }
          // console.log('Properties: ' + path + ' - ' + JSON.stringify(data));
          const isFile = !normalizedPath.endsWith('/');
          resolve({
            name: isFile
              ? extractFileName(normalizedPath, '/')
              : extractDirectoryName(normalizedPath, '/'),
            isFile,
            size: data.ContentLength,
            lmdt: Date.parse(data.LastModified),
            path: normalizedPath
          });
        });
      } else {
        // root folder
        resolve({
          name: this.config.bucketName,
          isFile: false,
          size: 0,
          lmdt: undefined,
          path: '/'
        });
      } */
    });

  loadTextFilePromise = (
    filePath: string,
    isPreview?: boolean
  ): Promise<string> => this.getFileContentPromise(filePath, 'text', isPreview);

  /**
   * Use only for files (will not work for dirs)
   * @param filePath
   * @param type
   * @param isPreview
   * @returns {Promise<any>}
   */
  getFileContentPromise = async (
    filePath: string,
    type: string,
    isPreview?: boolean
  ): Promise<any> => {
    const promise = new Promise((resolve, reject) => {
      /* const normalizedPath = normalizePath(this.normalizeRootPath(filePath));
      const params = {
        Bucket: this.config.bucketName,
        Key: normalizedPath,
        Range: isPreview ? 'bytes=0-10000' : ''
      };
      this.objectStore.getObject(params, (err, data) => {
        if (err) {
          console.log('Error getObject ' + normalizedPath); // an error occurred
          console.log(err, err.stack); // an error occurred
          reject('getFileContentPromise error');
        } else {
          // data: {
          // "AcceptRanges":"bytes",
          // "LastModified":"2018-10-22T16:24:42.000Z",
          // "ContentLength":99,
          // "ETag":"\"407a96716a09a2cf36ca32759cf15497\"",
          // "ContentType":"application/json",
          // "ServerSideEncryption":"AES256",
          // "Metadata":{},
          // "Body":{"type":"Buffer","data":[123,....,10,125]}}
          // if (data.Body) { //  && data.Body.type && data.Body.type === 'Buffer'
          //   const enc = new TextDecoder('utf8');
          //   const content = enc.decode(data.Body);
          //   console.log('Content: ' + content);
          //   resolve(content);
          // } else {
          //   reject('Error getting s3 content - wrong response type');
          // }
          // console.log('Content Raw for : ' + filePath + ' - ' + data);
          const content = data.Body.toString('utf8');
          // console.log('Content: ' + content);
          resolve(content);
        }
      }); */
    });
    const result = await promise;
    return result;
  };

  /**
   * Persists a given content(binary supported) to a specified filepath (tested)
   */
  saveFilePromise = (
    filePath: string,
    content: string,
    overWrite: boolean,
    mode: string
  ): Promise<Object> =>
    new Promise((resolve, reject) => {
      /* let isNewFile = false;
      // eslint-disable-next-line no-param-reassign
      filePath = normalizePath(this.normalizeRootPath(filePath));
      this.getPropertiesPromise(filePath)
        .then(result => {
          if (result === false) {
            isNewFile = true;
          }
          if (isNewFile || overWrite === true) {
            // || mode === 'text') {
            const fileExt = extractFileExtension(filePath, '/');

            let mimeType;
            if (fileExt === 'md') {
              mimeType = 'text/markdown';
            } else if (fileExt === 'txt') {
              mimeType = 'text/plain';
            } else if (fileExt === 'html') {
              mimeType = 'text/html';
            } else {
              // default type
              mimeType = 'text/plain';
            }
            const params = {
              Bucket: this.config.bucketName,
              Key: filePath,
              Body: content,
              ContentType: mimeType
            }; // fs.readFileSync(filePath)
            this.objectStore.putObject(params, (err, data) => {
              // putObject
              if (err) {
                console.log('Error upload ' + filePath); // an error occurred
                console.log(err, err.stack); // an error occurred
                reject('saveFilePromise error');
              }
              // const content = data.Body.toString('utf8');
              // console.log('Content: ' + content);
              // resolve(data);
              resolve({
                uuid: data.ETag,
                name: data.Key ? data.Key : extractFileName(filePath, '/'),
                url: data.Location,
                isFile: true,
                path: filePath,
                extension: extractFileExtension(filePath, '/'),
                size: content.length,
                lmdt: new Date().getTime(),
                isNewFile
              });
            });
          }
          return result;
        })
        .catch(err => reject(err)); */
    });

  /**
   * Persists a given text content to a specified filepath (tested)
   */
  saveTextFilePromise(
    filePath: string,
    content: string,
    overWrite: boolean
  ): Promise<Object> {
    filePath = normalizePath(this.normalizeRootPath(filePath));
    console.log('Saving text file: ' + filePath);
    return this.saveFilePromise(filePath, content, overWrite, 'text');
  }

  normalizeRootPath(filePath: string) {
    filePath = filePath.replace(
      new RegExp(AppConfig.dirSeparator + AppConfig.dirSeparator + '+', 'g'),
      '/'
    );
    /* if(filePath.indexOf(AppConfig.dirSeparator) === 0){
      filePath = filePath.substr(AppConfig.dirSeparator.length);
    } */
    if (filePath.indexOf('/') === 0) {
      filePath = filePath.substr(1);
    }
    return decodeURIComponent(filePath);
  }

  /**
   * Persists a given binary content to a specified filepath (tested)
   */
  saveBinaryFilePromise(
    filePath: string,
    content: string,
    overWrite: boolean,
    onUploadProgress?: (
      progress: ManagedUpload.Progress,
      request: () => any
    ) => void,
    onAbort?: () => void
  ): Promise<FileSystemEntry> {
    return new Promise((resolve, reject) => {
      /* let isNewFile = false;
      // eslint-disable-next-line no-param-reassign
      filePath = normalizePath(this.normalizeRootPath(filePath));
      this.getPropertiesPromise(filePath)
        .then(result => {
          if (result === false) {
            isNewFile = true;
          }
          if (isNewFile || overWrite === true) {
            const params = {
              Bucket: this.config.bucketName,
              Key: filePath,
              Body: content
            };
            const request = this.objectStore.upload(params);
            if (onUploadProgress) {
              request.on(
                'httpUploadProgress',
                (progress: ManagedUpload.Progress) => {
                  if (onUploadProgress) {
                    onUploadProgress(progress, () => request.abort());
                  }
                }
              ); // onUploadProgress as any);
            }
            if (onAbort) {
              onAbort = () => request.abort();
            }
            try {
              request
                .promise()
                .then(data => {
                  resolve({
                    uuid: uuidv1(), // data.ETag,
                    name: data.Key ? data.Key : extractFileName(filePath, '/'),
                    url: data.Location,
                    isFile: true,
                    path: filePath,
                    extension: extractFileExtension(filePath, '/'),
                    size: content.length,
                    lmdt: new Date().getTime(),
                    isNewFile
                  });
                })
                .catch(err => {
                  reject(err);
                });
            } catch (err) {
              console.log('Error upload ' + filePath); // an error occurred
              console.log(err, err.stack); // an error occurred
              reject('saveBinaryFilePromise error');
            }
          }
          return result;
        })
        .catch(err => reject(err)); */
    });
  }

  /**
   * Creates a directory. S3 does not have folders or files; it has buckets and objects. Buckets are used to store objects (tested)
   * dirPath = newDirectory/
   */
  /* createDirectoryPromise = (dirPath: string): Promise<Object> => {
    // eslint-disable-next-line no-param-reassign
    dirPath = normalizePath(this.normalizeRootPath(dirPath)) + '/';
    console.log('Creating directory: ' + dirPath);
    return this.objectStore
      .putObject({
        Bucket: this.config.bucketName,
        Key: dirPath
      })
      .promise()
      .then(result => ({
        ...result,
        dirPath
      }));
  }; */

  /**
   * Copies a given file to a specified location (tested)
   */
  copyFilePromise = (
    filePath: string,
    newFilePath: string
  ): Promise<Object> => {
    const nFilePath = normalizePath(this.normalizeRootPath(filePath));
    const nNewFilePath = normalizePath(this.normalizeRootPath(newFilePath));
    console.log('Copying file: ' + nFilePath + ' to ' + nNewFilePath);
    if (nFilePath.toLowerCase() === nNewFilePath.toLowerCase()) {
      return new Promise((resolve, reject) => {
        reject('Copying file failed, files have the same path');
      });
    }
    /* return this.objectStore
      .copyObject({
        Bucket: this.config.bucketName,
        CopySource: this.config.bucketName + '/' + nFilePath,
        Key: nNewFilePath
      })
      .promise(); */
  };

  /**
   * Renames a given file (tested)
   */
  renameFilePromise = (
    filePath: string,
    newFilePath: string
  ): Promise<Object> => {
    const nFilePath = normalizePath(this.normalizeRootPath(filePath));
    const nNewFilePath = normalizePath(this.normalizeRootPath(newFilePath));
    console.log('Renaming file: ' + nFilePath + ' to ' + newFilePath);
    if (nFilePath === nNewFilePath) {
      return new Promise((resolve, reject) => {
        reject('Renaming file failed, files have the same path');
      });
    }
    // Copy the object to a new location
    /* return this.objectStore
      .copyObject({
        Bucket: this.config.bucketName,
        CopySource: this.config.bucketName + '/' + nFilePath,
        Key: nNewFilePath
      })
      .promise()
      .then(() =>
        // Delete the old object
        this.objectStore
          .deleteObject({
            Bucket: this.config.bucketName,
            Key: nFilePath
          })
          .promise()
      )
      .catch(e => {
        console.log(e);
        return new Promise((resolve, reject) => {
          reject('Renaming file failed' + e.code);
        });
      }); */
  };

  /**
   * Rename a directory TODO list and copy all content in new DIR
   */
  renameDirectoryPromise = (
    dirPath: string,
    newDirectoryPath: string
  ): Promise<Object> => {
    const newDirPath =
      extractParentDirectoryPath(dirPath, '/') + '/' + newDirectoryPath;
    console.log('Renaming directory: ' + dirPath + ' to ' + newDirPath);
    if (dirPath === newDirPath) {
      return new Promise((resolve, reject) => {
        reject('Renaming directory failed, directories have the same path');
      });
    }
    /* return this.objectStore
      .copyObject({
        Bucket: this.config.bucketName,
        CopySource: this.config.bucketName + '/' + dirPath,
        Key: newDirPath
      })
      .promise(); */
  };

  /**
   * Delete a specified file
   */
  /* deleteFilePromise = (path: string): Promise<Object> =>
    this.objectStore
      .deleteObject({
        // Bucket: this.config.bucketName,
        Key: path
      })
      .promise(); */

  /**
   * Delete a specified directory, the directory should be empty, if the trash can functionality is not enabled (partial: works for files and empty dirs)
   * TODO empty dir (its have invisible .ts dir)
   */
  /* deleteDirectoryPromise = (path: string): Promise<Object> =>
    this.objectStore
      .deleteObject({
        Bucket: this.config.bucketName,
        Key: path
      })
      .promise(); */

  /**
   * Choosing directory
   */
  selectDirectoryDialog = () => {
    console.log('Selecting directory is not implemented in the s3 version');
  };

  /**
   * Choosing file
   */
  selectFileDialog = () => {
    console.log('Selecting file not relevant for the s3 version');
  };

  /**
   * Opens directory in new tab / window
   */
  openDirectory = (dirPath: string) => {
    console.log(
      'Opening directory ' + dirPath + ' not possible for the s3 version.'
    );
  };

  /**
   * Open the file url in a new tab / window
   */
  openFile = (filePath: string): void => {
    console.log('Open file in new tab not supported yet');
    // const url = this.getURLforPath(filePath);
    // window.open(url, '_blank');
  };

  /**
   * Places the application window on top of the other windows
   */
  focusWindow = (): void => {
    window.focus();
  };
}
