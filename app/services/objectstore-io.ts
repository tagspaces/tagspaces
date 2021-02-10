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
import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

/* const { CognitoIdentityClient } = require("@aws-sdk/client-cognito-identity");
const {
  fromCognitoIdentityPool,
} = require("@aws-sdk/credential-provider-cognito-identity"); */

export default class ObjectStoreIO {
  objectStore = undefined;

  config = undefined;

  configure = (objectStoreConfig: Object): Promise<any> =>
    new Promise((resolve, reject) => {
      this.config = objectStoreConfig; // s3Config switch

      // import(/* webpackChunkName: "AWS" */ 'aws-sdk')
      //  .then(({ default: AWS }) => {
      const advancedMode =
        this.config.endpointURL && this.config.endpointURL.length > 7;
      if (advancedMode) {
        // const endpoint: unknown = new AWS.Endpoint(this.config.endpointURL);
        this.objectStore = new S3Client({
          endpoint: this.config.endpointURL, // endpoint as string,
          credentials: {
            accessKeyId: this.config.accessKeyId,
            secretAccessKey: this.config.secretAccessKey
          },
          // s3ForcePathStyle: true, // needed for minio
          // signatureVersion: 'v4', // needed for minio
          logger: console
        });
      } else {
        this.objectStore = new S3Client({
          region: this.config.region,
          credentials: {
            accessKeyId: this.config.accessKeyId,
            secretAccessKey: this.config.secretAccessKey
          }
          // signatureVersion: 'v4'
        });
      }

      // return this.objectStore.getBucketPolicy({ Bucket: this.config.bucketName }).promise();
      // Getting the properties of the root folder means the connections to AWS was successful
      resolve();
      // return this.getPropertiesPromise('/');
      /* })
        .catch(error => {
          console.warn('An error occurred while loading the AWS-SDK: ' + error);
          reject();
        }); */
    });

  /**
   * @private creates an S3 client with new V3 aws sdk
   */
  /* private createNewS3Client(config) {
    const {
      region,
      credentials,
    } = config;
    let localTestingConfig = {};

    const s3 = new S3Client({
      region: region,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: region }),
        identityPoolId: "IDENTITY_POOL_ID", // IDENTITY_POOL_ID e.g., eu-west-1:xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxx
      }),
    })
    const cfg = {
      credentials: {
        accessKeyId: process.env.KEY,
        secretAccessKey: process.env.SECRET,
      },
      endpoint: process.env.HOST,
      // s3ForcePathStyle is deprecated in v3, every endpoint is now virtual host style
      // signatureVersion is deprecated in v3, signature v4 for all the services
    };

    const s3 = new S3Client(cfg);
    /!*const s3client = new S3Client({
      region,
      credentials,
      customUserAgent: getAmplifyUserAgent(),
      ...localTestingConfig,
      requestHandler: new AxiosHttpHandler({}, emitter),
    });*!/
    return s3;
  } */

  getURLforPath = (
    path: string,
    expirationInSeconds: number = 900
  ): Promise<string> => {
    if (!path || path.length < 1) {
      console.warn('Wrong path param for getURLforPath');
      return Promise.resolve('');
    }
    const params = {
      Bucket: this.config.bucketName,
      Key: path,
      Expires: expirationInSeconds
    };
    const command = new GetObjectCommand(params);
    return getSignedUrl(this.objectStore, command, {
      expiresIn: expirationInSeconds
    });
    // return this.objectStore.getSignedUrl('getObject', params);
  };

  listMetaDirectoryPromise = (path: string): Promise<Array<any>> => {
    // const promise: Promise<Array<any>> = new Promise(resolve => {
    const entries = [];
    let entry;
    if (!this.objectStore) {
      console.log('Object store not configured. Exiting');
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('Object store not configured.'); // false;
    }

    const normalizedPath = normalizePath(this.normalizeRootPath(path));
    const metaDirPath =
      normalizedPath.length > 0
        ? normalizedPath + '/' + AppConfig.metaFolder + '/'
        : AppConfig.metaFolder + '/';
    const params = {
      Delimiter: '/',
      Prefix: metaDirPath,
      Bucket: this.config.bucketName
    };
    try {
      return this.objectStore
        .send(new ListObjectsCommand(params))
        .then(data => {
          // console.log('listObjectsV2 ' + JSON.stringify(params));
          /* if (error) {
            console.warn('Error listing meta directory ' + path);
            return resolve(entries); // returning results even if any promise fails
          }

          if (window.walkCanceled) {
            return resolve(entries); // returning results even if walk canceled
          } */

          // const truncated = data.IsTruncated;
          // const nextMarker = data.NextMarker;

          // Handling files
          data.Contents.forEach(file => {
            // console.warn('Meta: ' + JSON.stringify(file));
            entry = {};
            entry.name = file.Key;
            entry.path = file.Key;
            entry.isFile = true;
            entry.size = file.Size;
            entry.lmdt = Date.parse(file.LastModified);
            if (file.Key !== params.Prefix) {
              // skipping the current folder
              entries.push(entry);
            }
          });
          return entries; // resolve(entries);
        });
    } catch (error) {
      console.log('error', error);
      return Promise.reject(error);
    }
    // });
    // const result = await promise;
    // return result;
  };

  listDirectoryPromise = async (
    path: string,
    lite: boolean = true
  ): Promise<Array<Object>> => {
    //  new Promise(async resolve => {
    const enhancedEntries = [];
    let entryPath;
    let metaFolderPath;
    let stats;
    let eentry;
    const containsMetaFolder = false;
    // const metaMetaFolder = AppConfig.metaFolder + AppConfig.dirSeparator + AppConfig.metaFolder;

    if (!this.objectStore) {
      console.log('Object store not configured. Exiting');
      return Promise.reject('Object store not configured.'); // false;
    }

    // this.listMetaDirectoryPromise(path).then((entries) => {
    //   console.log('Meta folder content: ' + JSON.stringify(entries));
    //   return true;
    // }).catch((error) => {
    //   console.warn('Error loading meta files: ' + JSON.stringify(error));
    // });
    const metaContent = await this.listMetaDirectoryPromise(path);
    // console.log('Meta folder content: ' + JSON.stringify(metaContent));

    const params = {
      Delimiter: '/', // '/',
      Prefix:
        path.length > 0 && path !== '/'
          ? normalizePath(this.normalizeRootPath(path)) + '/'
          : '',
      // MaxKeys: 10000, // It returns actually up to 1000
      Bucket: this.config.bucketName
    };
    // this.objectStore.listObjectsV2(params, (error, data) => {
    return this.objectStore.send(new ListObjectsCommand(params)).then(data => {
      // console.warn(data);
      /* data = {
      Contents: [
         {
        ETag: "\"70ee1738b6b21\"",
        Key: "example11.jpg",
        LastModified: <Date Representation>,
        Owner: {
         DisplayName: "myname12",
         ID: "12345example251"
        },
        Size: 112311,
        StorageClass: "STANDARD"
       },..
      ],
      NextMarker: "eyJNYXJrZXIiOiBudWxsLCAiYm90b190cnVuY2F0ZV9hbW91bnQiOiAyfQ=="
     }
     */
      /* if (error) {
        console.warn('Error listing directory ' + path);
        resolve(enhancedEntries); // returning results even if any promise fails
        return;
      }
*/
      if (window.walkCanceled) {
        return enhancedEntries; // returning results even if walk canceled
      }

      // const truncated = data.IsTruncated;
      // const nextMarker = data.NextMarker;

      const metaPromises = [];

      // Handling "directories"
      data.CommonPrefixes.forEach(dir => {
        // console.warn(JSON.stringify(dir));
        const prefix = normalizePath(this.normalizeRootPath(dir.Prefix));
        eentry = {};
        const prefixArray = prefix.split('/');
        eentry.name = prefixArray[prefixArray.length - 1]; // dir.Prefix.substring(0, dir.Prefix.length - 1);
        eentry.path = prefix + '/';
        eentry.tags = [];
        eentry.thumbPath = '';
        eentry.meta = {};
        eentry.isFile = false;
        eentry.size = 0;
        eentry.lmdt = 0;

        if (eentry.path !== params.Prefix) {
          // skipping the current directory
          enhancedEntries.push(eentry);
          metaPromises.push(this.getEntryMeta(eentry));
        }
        if (window.walkCanceled) {
          return enhancedEntries;
        }
      });

      // Handling files
      data.Contents.forEach(async file => {
        // console.warn(JSON.stringify(file));
        let thumbPath = getThumbFileLocationForFile(file.Key, '/');
        const thumbAvailable = metaContent.find(
          (obj: any) => obj.path === thumbPath
        );
        if (thumbAvailable) {
          thumbPath = await this.getURLforPath(thumbPath, 604800); // 60 * 60 * 24 * 7 = 1 week
        } else {
          thumbPath = '';
        }

        eentry = {};
        eentry.name = extractFileName(file.Key, '/');
        eentry.path = file.Key;
        eentry.tags = [];
        eentry.thumbPath = thumbPath;
        eentry.meta = {};
        eentry.isFile = true;
        eentry.size = file.Size;
        eentry.lmdt = Date.parse(file.LastModified);
        if (file.Key !== params.Prefix) {
          // skipping the current folder
          enhancedEntries.push(eentry);
          const metaFilePath = getMetaFileLocationForFile(file.Key, '/');
          const metaFileAvailable = metaContent.find(
            (obj: any) => obj.path === metaFilePath
          );
          if (metaFileAvailable) {
            metaPromises.push(this.getEntryMeta(eentry));
          }
        }
      });

      Promise.all(metaPromises)
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
          return enhancedEntries;
        })
        .catch(() => enhancedEntries);
    });
    // });
  };

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
            eentry.thumbPath = await this.getURLforPath(folderTmbPath, 604800); // 60 * 60 * 24 * 7 = 1 week ;
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

  getPropertiesPromise = (path: string): Promise<any> => {
    // new Promise((resolve, reject) => {
    const normalizedPath = this.normalizeRootPath(path); // normalizePath(path); don't clean trailing / for dir properties
    if (normalizedPath) {
      const params = {
        Bucket: this.config.bucketName,
        Key: normalizedPath
      };
      try {
        return this.objectStore.send(new HeadObjectCommand(params)).then(data => {
          /*
      data = {
        "AcceptRanges":"bytes",
        "LastModified":"2018-10-22T12:57:16.000Z",
        "ContentLength":101003,
        "ETag":"\"02cb1c856f4fdcde6b39062a29b95030\"",
        "ContentType":"image/png",
        "ServerSideEncryption":"AES256",
        "Metadata":{}
      }
      */
          // console.log('Properties: ' + path + ' - ' + JSON.stringify(data));
          const isFile = !normalizedPath.endsWith('/');
          return {
            name: isFile
              ? extractFileName(normalizedPath, '/')
              : extractDirectoryName(normalizedPath, '/'),
            isFile,
            size: data.ContentLength,
            lmdt: Date.parse(data.LastModified),
            path: normalizedPath
          };
        });
      } catch (e) {
        console.log(JSON.stringify(e, null, 2));
        // workaround for checking if a folder exists on s3
        const listParams = {
          Bucket: this.config.bucketName,
          Prefix: normalizedPath,
          MaxKeys: 1,
          Delimiter: '/'
        };
        return this.objectStore.send(
          new ListObjectsCommand(listParams),
          (listError, listData) => {
            // this.objectStore.listObjectsV2(listParams, (listError, listData) => {
            if (listError) {
              return false;
            }
            const folderExists =
              (listData && listData.KeyCount && listData.KeyCount > 0) || // supported on aws s3
              (listData &&
                listData.CommonPrefixes &&
                listData.CommonPrefixes.length > 0); // needed for DO
            if (folderExists) {
              return {
                name: extractDirectoryName(normalizedPath, '/'),
                isFile: false,
                size: 0,
                lmdt: undefined,
                path: normalizedPath
              };
            }
            return false;
          }
        );
      }
    } else {
      // root folder
      return Promise.resolve({
        name: this.config.bucketName,
        isFile: false,
        size: 0,
        lmdt: undefined,
        path: '/'
      });
    }
  };
  // });

  loadTextFilePromise = (
    filePath: string,
    isPreview?: boolean
  ): Promise<string> => this.getFileContentPromise(filePath, 'text', isPreview);

  streamToString = (stream): Promise<string> =>
    new Promise((resolve, reject) => {
      if (stream instanceof ReadableStream === false) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(
          'Expected stream to be instance of ReadableStream, but got ' +
            typeof stream
        );
      }
      let text = '';
      const decoder = new TextDecoder('utf-8');

      const reader = stream.getReader();
      const processRead = ({ done, value }) => {
        if (done) {
          // resolve promise with chunks
          console.log('done');
          // resolve(Buffer.concat(chunks).toString("utf8"));
          resolve(text);
          return;
        }

        text += decoder.decode(value);

        // Not done, keep reading
        reader
          .read()
          .then(processRead)
          .catch(err => console.debug(err));
      };

      // start read
      reader
        .read()
        .then(processRead)
        .catch(err => console.debug(err));
    });

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
    // const promise = new Promise((resolve, reject) => {
    const normalizedPath = normalizePath(this.normalizeRootPath(filePath));
    const params = {
      Bucket: this.config.bucketName,
      Key: normalizedPath,
      Range: isPreview ? 'bytes=0-10000' : ''
    };
    try {
      return this.objectStore
        .send(new GetObjectCommand(params))
        .then(async data => {
          /* if (err) {
          console.log('Error getObject ' + normalizedPath); // an error occurred
          console.log(err, err.stack); // an error occurred
          reject('getFileContentPromise error');
        } else { */
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
          const content = await this.streamToString(data.Body); // data.Body.toString('utf8');
          // console.log('Content: ' + content);
          return content;
        });
    } catch (error) {
      console.log('getFileContentPromise:' + normalizedPath, error);
      return Promise.reject(error);
    }
    // });
    // const result = await promise;
    // return result;
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
      let isNewFile = false;
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
        .catch(err => reject(err));
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
      let isNewFile = false;
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
        .catch(err => reject(err));
    });
  }

  /**
   * Creates a directory. S3 does not have folders or files; it has buckets and objects. Buckets are used to store objects (tested)
   * dirPath = newDirectory/
   */
  createDirectoryPromise = (dirPath: string): Promise<Object> => {
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
  };

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
    return this.objectStore
      .copyObject({
        Bucket: this.config.bucketName,
        CopySource: this.config.bucketName + '/' + nFilePath,
        Key: nNewFilePath
      })
      .promise();
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
    return this.objectStore
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
      });
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
    return this.objectStore
      .copyObject({
        Bucket: this.config.bucketName,
        CopySource: this.config.bucketName + '/' + dirPath,
        Key: newDirPath
      })
      .promise();
  };

  /**
   * Delete a specified file
   */
  deleteFilePromise = (path: string): Promise<Object> =>
    this.objectStore
      .deleteObject({
        Bucket: this.config.bucketName,
        Key: path
      })
      .promise();

  /**
   * Delete a specified directory, the directory should be empty, if the trash can functionality is not enabled (partial: works for files and empty dirs)
   * TODO empty dir (its have invisible .ts dir)
   */
  deleteDirectoryPromise = (path: string): Promise<Object> =>
    this.objectStore
      .deleteObject({
        Bucket: this.config.bucketName,
        Key: path
      })
      .promise();

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
