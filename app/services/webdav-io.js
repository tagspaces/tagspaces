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
 * @flow
 */

import nl from 'js-webdav-client';
import { extractParentDirectoryPath, normalizePath } from '../utils/paths';
import AppConfig from '../config';

export default class WebDAVIO {
  davClient: any;

  constructor() {
    console.log('Loading web.js..' + nl);
    // exact copy of getAjax with timeout added
    nl.sara.webdav.Client.prototype.getAjax = (
      method,
      url,
      callback,
      headers
    ) => {
      const /** @type XMLHttpRequest */ ajax =
        typeof Components !== 'undefined' &&
        typeof Components.classes !== 'undefined'
          ? Components.classes[
            '@mozilla.org/xmlextras/xmlhttprequest;1'
          ].createInstance(Components.interfaces.nsIXMLHttpRequest)
          : new XMLHttpRequest();
      if (this._username !== null) {
        ajax.open(method, url, true, this._username, this._password);
      } else {
        ajax.open(method, url, true);
      }
      ajax.onreadystatechange = () => {
        nl.sara.webdav.Client.ajaxHandler(ajax, callback);
      };

      ajax.ontimeout = () => {
        ajax.readyState = 4;
        ajax.ajax.status = -1;
        nl.sara.webdav.Client.ajaxHandler(ajax, callback);
      };

      if (headers === undefined) {
        headers = {};
      }
      for (const header in this._headers) {
        if (headers[header] === undefined) {
          ajax.setRequestHeader(header, this._headers[header]);
        }
      }
      for (const header in headers) {
        ajax.setRequestHeader(header, headers[header]);
      }
      return ajax;
    };

    console.log('Connecting webdav...');
    let useHTTPS = false;
    if (location.href.indexOf('https') === 0) {
      useHTTPS = true;
    }
    this.davClient = new nl.sara.webdav.Client(
      location.hostname,
      useHTTPS,
      location.port
    );
  }

  isWorkerAvailable = (): boolean => false;

  getDevicePaths = (): Object => {
    const paths = {
      Home: '/files/',
    };
    return paths;
  };

  getAppDataPath = (): string =>
    // TODO
    'SOMEPATH_FIX_ME'
  ;

  getUserHomePath = (): string => '/';

  getNameForPath = (entrypath: string, separator = '/') => {
    let path = entrypath;
    if (path.lastIndexOf(separator) === path.length - 1) {
      path = path.substring(0, path.lastIndexOf(separator));
    }
    const encodedName = path.substring(path.lastIndexOf(separator) + 1, path.length);
    return decodeURI(encodedName);
  };

  isDirectory = (path: string): boolean =>
    // TODO find a better solution
    path.lastIndexOf('/') === path.length - 1
  ;

  checkStatusCode = (code: number): boolean => {
    const status = parseInt(code / 100);
    if (status === 2) {
      return true;
    }
    return false;
  };

  // TODO
  handleStartParameters = (): void => {
    /* let filePath = getURLParameter('open');
    if (filePath && filePath.length > 0) {
      filePath = decodeURIComponent(filePath);
      console.log('Opening file in browser: ' + filePath);
      FileOpener.openFileOnStartup(filePath);
    } */
  };

  /**
   * Creates recursively a tree structure for a given directory path
   * @param {string} dirPath - the full path of the directory for which the tree will be generated
   */
  createDirectoryTree = (dirPath: string) => {
    console.log('Creating directory index for: ' + dirPath);
    const directoyTree = [];
    return directoyTree;
  };


  listMetaDirectoryPromise = async (path: string): Promise<Array<Object>> => {
    const promise = new Promise((resolve) => {
      const entries = [];
      const metaDirPath = normalizePath(path) + AppConfig.dirSeparator + AppConfig.metaFolder + AppConfig.dirSeparator;
      const davSuccess = (status, data) => {
        const dirList = data._responses;
        for (const dir in dirList) {
          const entryPath = dirList[dir].href;
          if (entryPath.toLowerCase() === metaDirPath.toLowerCase()) {
            console.log('Skipping current folder');
          } else {
            const fileName = this.getNameForPath(entryPath);

            const entry = {};
            entry.name = fileName;
            entry.path = decodeURI(entryPath);
            entry.isFile = true;
            entries.push(entry);
          }
        }
        return resolve(entries);
      };

      this.davClient.propfind(
        metaDirPath,
        davSuccess,
        1 // 1 , davClient.INFINITY
      );
      return resolve(entries);
    });
    const result = await promise; // this.listDirectoryPromise(normalizePath(path) + AppConfig.dirSeparator + AppConfig.metaFolder + AppConfig.dirSeparator, true);
    return result;
  };

  /**
   * Creates a list with containing the files and the sub directories of a given directory
   */
  listDirectoryPromise = (directoryPath: string, lite: boolean = false): Promise<Array<Object>> => new Promise(async (resolve, reject) => {
    let enhancedEntries;
    let dirPath = directoryPath.split('//').join('/');

    const metaContent = !lite ? await this.listMetaDirectoryPromise(directoryPath) : [];

    // let containsMetaFolder = false;
    const davSuccess = (status, data) => {
      console.log('Dirlist Status:  ' + status);
      if (!this.checkStatusCode(status)) {
        console.warn('Listing directory ' + dirPath + ' failed ' + status);
        reject('Listing directory ' + dirPath + ' failed ' + status);
      }
      const dirList = data._responses;
      let fileName;
      let isDir;
      let filesize;
      let lmdt;
      let path;
      let eentry;

      enhancedEntries = [];
      const metaPromises = [];
      for (const entry in dirList) {
        path = dirList[entry].href;
        if (dirPath.toLowerCase() === path.toLowerCase()) {
          console.log('Skipping current folder');
        } else {
          isDir = false;
          filesize = undefined;
          lmdt = undefined;
          // console.log(dirList[entry]._namespaces['DAV:']);
          if (this.isFile(dirList[entry]._namespaces['DAV:'])) {
            filesize = dirList[entry]._namespaces['DAV:'].getcontentlength._xmlvalue[0].data;
            lmdt = data._responses[entry]._namespaces['DAV:'].getlastmodified._xmlvalue[0].data;
          } else {
            isDir = true;
            // const metaFilePath = getMetaFileLocationForFile(path, '/');
          }
          fileName = this.getNameForPath(path);

          eentry = {};
          eentry.name = fileName;
          eentry.path = decodeURI(path);
          eentry.tags = [];
          eentry.thumbPath = '';
          // eentry.meta = {};
          eentry.isFile = !isDir;
          eentry.size = filesize;
          eentry.lmdt = Date.parse(lmdt);
          // const x = getMetaFileLocationForFile(eentry.path);

          if (!lite) {
            if (isDir) { // Read tsm.json from subfolders
              const metaDirAvailable = metaContent.find(obj => obj.name === AppConfig.metaFolder);
              if (metaDirAvailable) {
                metaPromises.push(this.getEntryMeta(eentry, metaDirAvailable.path));
              }
            } else {
              const metaFileAvailable = metaContent.find(obj => obj.name === fileName + AppConfig.metaFileExt);
              if (metaFileAvailable) {
                metaPromises.push(this.getEntryMeta(eentry, metaFileAvailable.path));
              }

              // Finding if thumbnail available
              const metaThumbAvailable = metaContent.find(obj => obj.name === fileName + AppConfig.thumbFileExt);
              if (metaThumbAvailable) {
                eentry.thumbPath = metaThumbAvailable.path;
              }
            }
          }

          enhancedEntries.push(eentry);
        }
      }

      Promise.all(metaPromises).then((entriesMeta) => {
        /* entriesMeta.forEach((entryMeta) => {
          enhancedEntries.some((enhancedEntry) => {
            if (enhancedEntry.path === entryMeta.path) {
              // eslint-disable-next-line no-param-reassign
              enhancedEntry = entryMeta;
              return true;
            }
            return false;
          });
        }); */
        resolve(enhancedEntries);
        return true;
      }).catch(() => {
        resolve(enhancedEntries);
      });
    };
    if (dirPath.substring(dirPath.length - 1) !== '/') {
      dirPath += '/';
    }
    dirPath = encodeURI(dirPath);

    this.davClient.propfind(
      dirPath,
      davSuccess,
      1 // 1 , davClient.INFINITY
    );
  });

  isFile = (dav: Object): boolean => !(
    typeof dav.getcontentlength === 'undefined' ||
    dav.getcontentlength._xmlvalue.length === 0 ||
    (dav.resourcetype._xmlvalue.length === 1 && dav.resourcetype._xmlvalue[0].localName === 'collection')
  );

  getEntryMeta = (eentry: Object, metaPath: string): Promise<Object> => {
    if (eentry.isFile) {
      // const metaFilePath = getMetaFileLocationForFile(eentry.path);
      return this.loadTextFilePromise(metaPath).then(result => {
        // eslint-disable-next-line no-param-reassign
        eentry.meta = JSON.parse(result.trim());
        return eentry;
      });
    }
    // const folderMetaPath = normalizePath(eentry.path) + AppConfig.dirSeparator + AppConfig.metaFolderFile; // getMetaFileLocationForDir(eentry.path);
    if (!eentry.path.endsWith(AppConfig.metaFolder + '/')) { // Skip the /.ts folder
      return this.loadTextFilePromise(metaPath).then(result => {
        // eslint-disable-next-line no-param-reassign
        eentry.meta = JSON.parse(result.trim());
        return eentry;
      });
    }

    return new Promise((resolve) => {
      resolve(eentry);
    });
  };
  /**
   * Finds out the properties of a file or directory such last modification date or file size
   */
  getPropertiesPromise = (filePath: string): Promise<Object> => new Promise((resolve, reject) => {
    this.davClient.propfind(
      encodeURI(filePath),
      (status, data) => {
        console.log(
          'Properties Status / Content: ' +
              status +
              ' / ' +
              JSON.stringify(data._responses)
        );
        const fileProperties = {};
        if (this.checkStatusCode(status)) {
          for (const entry in data._responses) {
            fileProperties.path = filePath;
            fileProperties.name = this.getNameForPath(filePath);
            const isFile = this.isFile(data._responses[entry]._namespaces['DAV:']);
            fileProperties.isFile = isFile;
            if (isFile) {
              fileProperties.size =
                data._responses[entry]._namespaces['DAV:'].getcontentlength._xmlvalue[0].data;
              fileProperties.lmdt = Date.parse(data._responses[entry]._namespaces['DAV:'].getlastmodified._xmlvalue[0].data);
            }
          }
          resolve(fileProperties);
        } else {
          resolve(false);
          // reject('getFileProperties ' + filePath + ' failed ' + status);
        }
      },
      1
    );
  });

  /**
   * Load the content of a text file
   */
  loadTextFilePromise = (filePath: string) =>
    this.getFileContentPromise(filePath, 'text');

  /**
   * Gets the content of file, useful for binary files
   */
  getFileContentPromise = (filePath: string, type): Promise<Object> => {
    console.log('getFileContent file: ' + filePath);
    return new Promise((resolve, reject) => {
      const ajax = this.davClient.getAjax('GET', encodeURI(filePath));
      ajax.onreadystatechange = null;
      ajax.responseType = type || 'arraybuffer';
      ajax.onerror = reject;

      ajax.onload = () => {
        const response = ajax.response || ajax.responseText;
        if (this.checkStatusCode(ajax.status)) {
          resolve(response);
        } else {
          reject('getFileContentPromise ajax error');
        }
      };
      ajax.send();
    });
  };

  /**
   * Persists a given content(binary supported) to a specified filepath
   */
  saveFilePromise = (
    filePath: string,
    content: string,
    overWrite: boolean,
    mode: string
  ): Promise<Object> => new Promise((resolve, reject) => {
    let isNewFile = false;
    this.davClient.propfind(
      encodeURI(filePath),
      (status, data) => {
        console.log(
          'Check file exists: Status / Content: ' + status + ' / ' + data
        );
        if (parseInt(status) === 404) {
          isNewFile = true;
        }
        if (isNewFile || overWrite === true || mode === 'text') {
          this.davClient.put(
            encodeURI(filePath),
            (status, data, headers) => {
              console.log(
                'Creating File Status/Content/Headers:  ' +
                    status +
                    ' / ' +
                    data +
                    ' / ' +
                    headers
              );
              if (this.checkStatusCode(status)) {
                resolve(isNewFile);
              } else {
                reject('saveFilePromise: ' + filePath + ' failed ' + status);
              }
            },
            content,
            'application/octet-stream'
          );
        } else {
          reject('File Already Exists.');
        }
      },
      1
    );
  });

  /**
   * Persists a given text content to a specified filepath
   */
  saveTextFilePromise(filePath: string, content: string, overWrite: boolean): Promise<Object> {
    console.log('Saving text file: ' + filePath);
    return this.saveFilePromise(filePath, content, overWrite, 'text');
  }

  /**
   * Persists a given binary content to a specified filepath
   */
  saveBinaryFilePromise(filePath: string, content: string, overWrite: boolean): Promise<Object> {
    console.log('Saving binary file: ' + filePath);
    return this.saveFilePromise(filePath, content, overWrite);
  }

  /**
   * Creates a directory
   */
  createDirectoryPromise = (dirPath: string): Promise<Object> => {
    console.log('Creating directory: ' + dirPath);
    return new Promise((resolve, reject) => {
      this.davClient.mkcol(encodeURI(dirPath), (status, data, headers) => {
        console.log(
          'Directory Creation Status/Content/Headers:  ' +
            status +
            ' / ' +
            data +
            ' / ' +
            headers
        );
        if (this.checkStatusCode(status)) {
          resolve(dirPath);
        } else {
          reject('createDirectory ' + dirPath + ' failed ' + status);
        }
      });
    });
  }

  /**
   * Copies a given file to a specified location
   */
  copyFilePromise = (filePath: string, newFilePath: string): Promise<Object> => {
    console.log('Copying file: ' + filePath + ' to ' + newFilePath);
    return new Promise((resolve, reject) => {
      if (filePath.toLowerCase() === newFilePath.toLowerCase()) {
        reject('Copying file failed, files have the same path');
      } else {
        this.davClient.copy(
          encodeURI(filePath),
          (status, data, headers) => {
            console.log(
              'Copy File Status/Content/Headers:  ' +
                status +
                ' / ' +
                data +
                ' / ' +
                headers
            );
            if (this.checkStatusCode(status)) {
              resolve(filePath, newFilePath);
            } else {
              reject('copyFile ' + filePath + ' failed ' + status);
            }
          },
          encodeURI(newFilePath),
          this.davClient.FAIL_ON_OVERWRITE
        );
      }
    });
  }

  /**
   * Renames a given file
   */
  renameFilePromise = (filePath: string, newFilePath: string): Promise<Object> => {
    console.log('Renaming file: ' + filePath + ' to ' + newFilePath);
    return new Promise((resolve, reject) => {
      if (filePath === newFilePath) {
        reject('Renaming file failed, files have the same path');
      } else {
        this.davClient.move(
          encodeURI(filePath),
          (status, data, headers) => {
            console.log(
              'Rename File Status/Content/Headers:  ' +
                status +
                ' / ' +
                data +
                ' / ' +
                headers
            );
            if (this.checkStatusCode(status)) {
              resolve([filePath, newFilePath]);
            } else {
              reject('rename: ' + filePath + ' failed ' + status);
            }
          },
          encodeURI(newFilePath),
          this.davClient.FAIL_ON_OVERWRITE
        );
      }
    });
  }

  /**
   * Rename a directory
   */
  renameDirectoryPromise = (dirPath: string, newDirectoryPath: string): Promise<Object> => {
    const newDirPath =
      extractParentDirectoryPath(dirPath) + '/' + newDirectoryPath;
    console.log('Renaming directory: ' + dirPath + ' to ' + newDirPath);
    return new Promise((resolve, reject) => {
      if (dirPath === newDirPath) {
        reject('Renaming directory failed, directories have the same path');
      } else {
        this.davClient.move(
          encodeURI(dirPath),
          (status, data, headers) => {
            console.log(
              'Rename Directory Status/Content/Headers:  ' +
                status +
                ' / ' +
                data +
                ' / ' +
                headers
            );
            if (this.checkStatusCode(status)) {
              resolve(newDirPath);
            } else {
              reject('rename: ' + dirPath + ' failed ' + status);
            }
          },
          encodeURI(newDirPath),
          this.davClient.FAIL_ON_OVERWRITE
        );
      }
    });
  };

  /**
   * Delete a specified file
   */
  deleteFilePromise = (path: string): Promise<Object> => this.deleteDirectoryPromise(path);

  /**
   * Delete a specified directory, the directory should be empty, if the trash can functionality is not enabled
   */
  deleteDirectoryPromise = (path: string): Promise<Object> =>
    new Promise((resolve, reject) => {
      this.davClient.remove(encodeURI(path), (status, data, headers) => {
        console.log(
          'Directory/File Deletion Status/Content/Headers:  ' +
            status +
            ' / ' +
            data +
            ' / ' +
            headers
        );
        if (this.checkStatusCode(status)) {
          resolve(path);
        } else {
          reject('delete ' + path + ' failed ' + status);
        }
      });
    });

  /**
   * Choosing directory
   */
  selectDirectoryDialog = () => {
    console.log('Selecting directory is not implemented in the web version');
  };

  /**
   * Choosing file
   */
  selectFileDialog = () => {
    console.log('Selecting file not relevant for the web version');
  };

  /**
   * Opens directory in new tab / window
   */
  openDirectory = (dirPath: string) => {
    console.log(
      'Opening directory ' + dirPath + ' not possible for the web version.'
    );
  };

  /**
   * Open the file url in a new tab / window
   */
  openFile = (filePath: string): void => {
    window.open(filePath, '_blank');
  };

  /**
   * Places the application window on top of the other windows
   */
  focusWindow = (): void => {
    window.focus();
  };
}
