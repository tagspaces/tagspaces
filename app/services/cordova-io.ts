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

/* globals cordova */
import AppConfig from '../config';
import { b64toBlob } from '-/utils/misc';
import {
  extractParentDirectoryPath,
  cleanTrailingDirSeparator,
  extractFileName,
  extractFileExtension,
  getMetaFileLocationForDir,
  getThumbFileLocationForDirectory
} from '-/utils/paths';
import { TS } from '-/tagspaces.namespace';

const appSettingFile = 'settings.json';
const appSettingTagsFile = 'settingsTags.json';
// let anotatedTree;
// let pendingCallbacks = 0;

declare let cordova;
declare let navigator;
export default class CordovaIO {
  constructor() {
    // Redefining the back button
    document.addEventListener('backbutton', this.onDeviceBackButton, false);
    document.addEventListener('deviceready', this.onDeviceReady, false);
    document.addEventListener('resume', this.onDeviceResume, false);
    document.addEventListener('initApp', this.onApplicationLoad, false);
  }

  fsRoot;
  urlFromIntent;
  // widgetAction;
  loadedSettings: any;
  loadedSettingsTags: any;

  cordovaFileError = {
    1: 'NOT_FOUND_ERR',
    2: 'SECURITY_ERR',
    3: 'ABORT_ERR',
    4: 'NOT_READABLE_ERR',
    5: 'ENCODING_ERR',
    6: 'NO_MODIFICATION_ALLOWED_ERR',
    7: 'INVALID_STATE_ERR',
    8: 'SYNTAX_ERR',
    9: 'INVALID_MODIFICATION_ERR',
    10: 'QUOTA_EXCEEDED_ERR',
    11: 'TYPE_MISMATCH_ERR',
    12: 'PATH_EXISTS_ERR'
  };

  onDeviceReady = () => {
    console.log(
      'Device Ready: ' + window.device.platform + ' - ' + window.device.version
    );

    // attachFastClick(document.body);
    this.getFileSystem();

    // enabling the cordova-plugin-background-mode
    if (window.plugins.backgroundMode) {
      window.plugins.backgroundMode.enable();
    }

    // iOS specific initialization
    if (AppConfig.isCordovaiOS) {
      window.plugins = window.plugins || {};
      // TODO: use fileOpener2 plugin on all platforms
      // https://build.phonegap.com/plugins/1117
      window.plugins.fileOpener = cordova.plugins.fileOpener2;
    }

    window.plugins.intentShim.onIntent(function(intent) {
      /**
       * intent:
       action: "android.intent.action.VIEW"
       component: "ComponentInfo{org.tagspaces.mobile/org.tagspaces.mobileapp.MainActivity}"
       data: "file:///storage/emulated/0/Download/%D0%B4%D0%B5%D0%BA%D0%BB%D0%B0%D1%80%D0%B0%D1%86%D0%B8%D1%8F%20%D0%B7%D0%B0%20%D1%86%D0%BB%D1%80.pdf"
       flags: 306184195
       type: "application/pdf"
       */
      console.debug('Received Intent: ' + JSON.stringify(intent));
      const protocol = window.location.protocol,
        host = '//' + window.location.host,
        path = window.location.pathname;
      // query = window.location.search;

      const newUrl =
        protocol +
        host +
        path +
        // query +
        // (query ? '&' : '?') +
        '?cmdopen=' +
        intent.data.replace('file:///storage/emulated/0', 'file:///sdcard');
      // encodeURIComponent(intent.data);

      // window.history.pushState({ path: newUrl }, '', newUrl);
      // TODO use event
      window.location.replace(newUrl);
    });

    /* if (window.plugins.webintent) {
      window.plugins.webintent.getUri(
        url => {
          if (url) {
            if (url === 'createTXTFile' || url.indexOf('TagSpaces') > 0) {
              this.widgetAction = url;
            } else {
              this.urlFromIntent = url;
            }
          }
        }
      );
      window.plugins.webintent.onNewIntent(url => {
        this.widgetAction = url;
        this.widgetActionHandler();
      });
    } */

    if (AppConfig.isCordovaiOS) {
      setTimeout(() => {
        navigator.splashscreen.hide();
      }, 1000);

      // Enable TestFairy if available
      /* if (PRODUCTION != 'true' && TestFairy) {
        TestFairy.begin('ef5d3fd8bfa17164b8068e71ccb32e1beea25f2f');
      } */
    }
  };

  onDeviceBackButton = e => {
    e.preventDefault();
    // send event to main app
  };

  isWorkerAvailable = (): boolean => false;

  // Register ios file open handler
  handleOpenURL = (url: string) => {
    // const fileName = url.substring(url.lastIndexOf('/') + 1, url.length);
    /* showConfirmDialog('File copied', 'File ' + fileName + ' is copied in inbox folder. Would you like to open it ?', () => {
      FileOpener.openFile(url);
    }); */
  };

  // Platform specific functions

  normalizePath = (path: string) => {
    // we set absolute path because some extensions didn't recognize cdvfile
    // but in cordova.api implementation we didn't need absolute path so we strip nativeURL
    if (path.indexOf(this.fsRoot.nativeURL) === 0) {
      path = path.replace(this.fsRoot.nativeURL, '/');
    }
    if (path.indexOf(this.fsRoot.fullPath) === 0) {
      path = path.substring(this.fsRoot.fullPath.length, path.length);
    }
    return path;
  };

  onDeviceResume = () => {
    // TODO: reload curtent dir after background operation
  };

  // widgetActionHandler = () => {
  /* if (currentPath === null) {
      showAlertDialog('Please set location folder to use widget');
      return;
    }

    if (widgetAction === 'createTXTFile') {
      createTXTFile();
    } else {
      const fileName = widgetAction.substring(widgetAction.lastIndexOf('/'), widgetAction.length);
      const newFileName = currentPath + fileName;
      const newFileFullPath = this.fsRoot.nativeURL + '/' + newFileName;
      this.renameFile(widgetAction, newFileName);
      FileOpener.openFile(newFileFullPath);
    }

    widgetAction = undefined; */
  // };

  onApplicationLoad = () => {
    /* if (this.widgetAction) {
      this.widgetActionHandler();
    } */
  };

  getDirSystemPromise = (dirPath: string): Promise<any> => {
    console.log('getDirSystemPromise: ' + dirPath);
    if (
      dirPath &&
      (dirPath.indexOf(cordova.file.applicationDirectory) === 0 ||
        dirPath.startsWith('file:///'))
    ) {
    } else if (AppConfig.isCordovaiOS) {
      dirPath = (cordova.file.documentsDirectory + '/' + dirPath).replace(
        ':/',
        ':///'
      );
      /*localPath = AppConfig.isCordovaiOS
        ? path
            .join(cordova.file.documentsDirectory, localPath)
            .replace(':/', ':///')
        : 'file:///' + localPath;*/
    } else {
      dirPath = (dirPath.startsWith('/') ? 'file://' : 'file:///') + dirPath;
    }
    dirPath = encodeURI(dirPath) + (dirPath.endsWith('/') ? '' : '/');
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(dirPath, resolve, error => {
        console.error(
          'Error getting FileSystem ' +
            dirPath +
            ': ' +
            this.cordovaFileError[error.code]
        ); //JSON.stringify(error));
        resolve(false); // reject(error);
      });
    });
  };

  resolveFullPath = (localURL: string) => {
    // Cordova file plugin didn't set fullpath so we set fullpath as absolute
    // this solve problem with extensions which can't use the cdvfile
    let URL = 'cdvfile://localhost/persistent/';
    let fullPath = decodeURIComponent(localURL);
    if (fullPath.indexOf('cdvfile://localhost/root/') === 0) {
      URL = 'cdvfile://localhost/root/';
    }

    fullPath =
      this.fsRoot.nativeURL + fullPath.substring(URL.length, fullPath.length);
    return fullPath;
  };

  getAppStorageFileSystem = (fileName: string, fileCallback, fail) => {
    const dataFolderPath = AppConfig.isCordovaiOS
      ? cordova.file.dataDirectory
      : cordova.file.externalApplicationStorageDirectory;

    window.resolveLocalFileSystemURL(
      dataFolderPath,
      (fs: any) => {
        fs.getFile(fileName, { create: true }, fileCallback, fail);
      },
      error => {
        console.error('Error getSettingsFileSystem: ' + JSON.stringify(error));
      }
    );
  };

  getFileSystem = () => {
    // on android cordova.file.externalRootDirectory points to sdcard0
    const fsURL = AppConfig.isCordovaiOS
      ? cordova.file.documentsDirectory
      : 'file:///';
    window.resolveLocalFileSystemURL(
      fsURL,
      fileSystem => {
        this.fsRoot = fileSystem;
        // console.log("Filesystem Details: " + JSON.stringify(this.fsRoot));
        this.handleStartParameters();

        this.loadSettingsFile(appSettingFile, settings => {
          this.loadedSettings = settings;
          this.loadSettingsFile(appSettingTagsFile, settingsTags => {
            this.loadedSettingsTags = settingsTags;
          });
        });
      },
      err => {
        console.error(
          'Error resolving local file system url: ' + JSON.stringify(err)
        );
      }
    );
  };

  /**
   * Creates recursively a tree structure for a given directory path
   */
  /* function generateDirectoryTree(entries) {
    var tree = {};
    var i;
    for (i = 0; i < entries.length; i++) {
      if (entries[i].isFile) {
        console.log("File: " + entries[i].name);
        tree.children.push({
          "name": entries[i].name,
          "isFile": entries[i].isFile,
          "size": "", // TODO size and lmtd
          "lmdt": "", //
          "path": entries[i].fullPath
        });
      } else {
        var directoryReader = entries[i].createReader();
        pendingCallbacks++;
        directoryReader.readEntries(
          generateDirectoryTree,
          function(error) {
            console.error("Error reading dir entries: " + error.code);
          }); // jshint ignore:line
      }
    }
    pendingCallbacks--;
    console.log("Pending recursions: " + pendingCallbacks);
    if (pendingCallbacks <= 0) {
      // .createDirectoryTree(anotatedTree);
    }
  } */

  saveSettingsFile = (fileName: string, data: string) => {
    this.getAppStorageFileSystem(
      fileName,
      fileEntry => {
        fileEntry.createWriter(
          writer => {
            writer.write(data);
          },
          error => {
            console.error('Error creating writter: ' + JSON.stringify(error));
          }
        );
      },
      error => {
        console.error(
          'Error getting app storage file system: ' + JSON.stringify(error)
        );
      }
    );
  };

  loadSettingsFile = (fileName: string, ready: (content: any) => void) => {
    this.getAppStorageFileSystem(
      fileName,
      fileEntry => {
        fileEntry.file(
          file => {
            const reader = new FileReader();
            reader.onloadend = (evt: any) => {
              let content = null;
              if (evt.target.result.length > 0) {
                content = evt.target.result;
              }
              ready(content);
            };
            reader.readAsText(file);
          },
          error => {
            console.error('Error reading file: ' + JSON.stringify(error));
          }
        );
      },
      error => {
        console.log(
          'Error getting app storage file system: ' + JSON.stringify(error)
        );
      }
    );
  };

  // Platform specific API calls

  saveSettings = settings => {
    this.saveSettingsFile(appSettingFile, settings);
  };

  loadSettings = () => this.loadedSettings;

  // saveSettingsTags = (tagGroups: Object) => {
  //   // TODO use js objects
  //   const jsonFormat =
  //     '{ "appName": "' +
  //     Config.DefaultSettings.appName +
  //     '", "appVersion": "' +
  //     Config.DefaultSettings.appVersion +
  //     '", "appBuild": "' +
  //     Config.DefaultSettings.appBuild +
  //     '", "settingsVersion": ' +
  //     Config.DefaultSettings.settingsVersion +
  //     ', "tagGroups": ' +
  //     tagGroups +
  //     ' }';
  //   this.saveSettingsFile(appSettingTagsFile, jsonFormat);
  // };

  loadSettingsTags = () => this.loadedSettingsTags;

  sendFile = (filePath: string) => {
    console.log('Sending file: ' + filePath);
    if (filePath.indexOf('file://') === 0) {
      window.plugins.fileOpener.send(filePath);
    } else {
      window.plugins.fileOpener.send('file://' + filePath);
    }
  };

  // Platform API

  getDevicePaths = (): Object => {
    let paths;
    if (AppConfig.isCordovaiOS) {
      paths = {
        Documents: '/',
        iCloud: cordova.file.syncedDataDirectory
      };
    } else {
      paths = {
        Photos: 'sdcard/DCIM/',
        Pictures: 'sdcard/Pictures/',
        Download: 'sdcard/Download/',
        Music: 'sdcard/Music/',
        Movies: 'sdcard/Movies/',
        SDCard: 'sdcard/' // cordova.file.externalRootDirectory
      };
    }
    return paths;
  };

  getUserHomePath = (): string => '/';

  getAppDataPath = () => {
    // const appDataPath = ipcRenderer.sendSync('app-data-path-request', 'notNeededArgument');
    // return appDataPath;
  };

  handleStartParameters = () => {
    if (this.urlFromIntent !== undefined && this.urlFromIntent.length > 0) {
      console.log('Intent URL: ' + this.urlFromIntent);
      // const filePath = decodeURIComponent(this.urlFromIntent);
      // TODO FileOpener.openFileOnStartup(filePath);
    }
  };

  quitApp = (): void => {
    navigator.app.exitApp();
  };

  /**
   * Creates recursively a tree structure for a given directory path
   */
  createDirectoryTree = (dirPath: string) => {
    console.warn('Creating directory tree is not supported in Cordova yet.');
  };

  listMetaDirectoryPromise = async (path: string): Promise<Array<any>> => {
    const promise: Promise<Array<any>> = new Promise(resolve => {
      const entries = [];
      const metaDirPath =
        cleanTrailingDirSeparator(path) +
        AppConfig.dirSeparator +
        AppConfig.metaFolder +
        AppConfig.dirSeparator;

      this.getDirSystemPromise(metaDirPath)
        .then(fileSystem => {
          const reader = fileSystem.createReader();
          reader.readEntries(entr => {
            entr.forEach(entry => {
              const entryPath = entry.fullPath;
              if (entryPath.toLowerCase() === metaDirPath.toLowerCase()) {
                console.log('Skipping current folder');
              } else {
                const ee: any = {};
                ee.name = entry.name;
                ee.path = decodeURI(entryPath);
                ee.isFile = true;
                entries.push(ee);
              }
            });
            resolve(entries);
          });
          return true;
        })
        .catch(err => {
          console.error('Error getting listMetaDirectoryPromise:', err);
          resolve(entries); // returning results even if any promise fails
        });
    });
    const result = await promise; // this.listDirectoryPromise(normalizePath(path) + AppConfig.dirSeparator + AppConfig.metaFolder + AppConfig.dirSeparator, true);
    return result;
  };

  /**
   * Creates a list with containing the files and the sub directories of a given directory
   */
  listDirectoryPromise = (path: string, lite: boolean): Promise<any> =>
    new Promise(async (resolve, reject) => {
      console.time('listDirectoryPromise');
      const metaContent = !lite
        ? await this.listMetaDirectoryPromise(path)
        : [];

      const enhancedEntries = [];
      const metaPromises = [];
      this.getDirSystemPromise(path)
        .then(
          fileSystem => {
            const reader = fileSystem.createReader();
            reader.readEntries(
              entries => {
                entries.forEach(entry => {
                  const eentry: any = {};
                  eentry.name = entry.name;
                  eentry.path = entry.fullPath;
                  eentry.tags = [];
                  eentry.thumbPath = entry.isFile
                    ? ''
                    : getThumbFileLocationForDirectory(
                        eentry.path,
                        AppConfig.dirSeparator
                      );
                  // eentry.meta = {};
                  eentry.isFile = entry.isFile;
                  if (entry.isFile) {
                    entry.file(fileEntry => {
                      eentry.size = fileEntry.size;
                      eentry.lmdt = fileEntry.lastModifiedDate;
                    });
                  }

                  if (!lite) {
                    if (entry.isDirectory) {
                      // Read tsm.json from subfolders
                      if (
                        !eentry.path.includes(
                          AppConfig.dirSeparator + AppConfig.metaFolder
                        )
                      ) {
                        const folderMetaPath = getMetaFileLocationForDir(
                          eentry.path,
                          AppConfig.dirSeparator
                        );
                        metaPromises.push(
                          this.getEntryMeta(eentry, folderMetaPath)
                        );
                      }
                    } else {
                      const metaFileAvailable: any = metaContent.find(
                        (obj: any) =>
                          obj.name === entry.name + AppConfig.metaFileExt
                      );
                      if (metaFileAvailable && metaFileAvailable.path) {
                        metaPromises.push(
                          this.getEntryMeta(eentry, metaFileAvailable.path)
                        );
                      }

                      // Finding if thumbnail available
                      const metaThumbAvailable: any = metaContent.find(
                        (obj: any) =>
                          obj.name === entry.name + AppConfig.thumbFileExt
                      );
                      if (metaThumbAvailable && metaThumbAvailable.path) {
                        eentry.thumbPath = metaThumbAvailable.path;
                      }
                    }
                  }

                  enhancedEntries.push(eentry);

                  /* if (entry.isDirectory) {
                anotatedDirList.push({
                  name: entry.name,
                  path: entry.fullPath,
                  isFile: false,
                  size: '',
                  lmdt: ''
                });
              } else if (entry.isFile) {
                if (lite) {
                  anotatedDirList.push({
                    name: entry.name,
                    path: entry.fullPath,
                    isFile: true,
                    size: '',
                    lmdt: ''
                  });
                } else {
                  const filePromise = Promise.resolve({
                    then: (onFulfill, onReject) => {
                      entry.file(
                        fileEntry => {
                          if (!fileEntry.fullPath) {
                            fileEntry.fullPath = this.resolveFullPath(
                              fileEntry.localURL
                            );
                          }
                          anotatedDirList.push();
                          onFulfill({
                            name: fileEntry.name,
                            isFile: true,
                            size: fileEntry.size,
                            lmdt: fileEntry.lastModifiedDate,
                            path: fileEntry.fullPath
                          });
                        },
                        err => {
                          onReject('Error reading entry ' + path);
                        }
                      );
                    }
                  }); // jshint ignore:line
                  fileWorkers.push(filePromise);
                }
              } */
                });

                Promise.all(metaPromises)
                  .then(() => {
                    resolve(enhancedEntries);
                    return true;
                  })
                  .catch(() => {
                    resolve(enhancedEntries);
                  });
                /* Promise.all(fileWorkers).then(
              entries => {
                entries.forEach(entry => {
                  anotatedDirList.push(entry);
                });
                console.timeEnd('listDirectoryPromise');
                resolve(anotatedDirList);
              },
              err => {
                console.warn(
                  'At least one file worker failed for ' +
                      path +
                      'err ' +
                      JSON.stringify(err)
                );
                console.timeEnd('listDirectoryPromise');
                resolve(anotatedDirList); // returning results even if any promise fails
              }
            ); */
              },
              err => {
                console.warn(
                  'Error reading entries promise from ' +
                    path +
                    'err ' +
                    JSON.stringify(err)
                );
                resolve(enhancedEntries); // returning results even if any promise fails
              }
            );
            return true;
          },
          () => {
            console.warn('Error getting file system promise');
            resolve(enhancedEntries); // returning results even if any promise fails
          }
        )
        .catch(err => {
          console.error('Error getting listDirectoryPromise:', err);
          resolve(enhancedEntries); // returning results even if any promise fails
        });
    });

  getEntryMeta = (
    eentry: TS.FileSystemEntry,
    metaPath: string
  ): Promise<any> => {
    if (eentry.isFile) {
      // const metaFilePath = getMetaFileLocationForFile(eentry.path);
      return this.loadTextFilePromise(metaPath).then(result => {
        // eslint-disable-next-line no-param-reassign
        eentry.meta = JSON.parse(result.trim());
        return eentry;
      });
    }
    // const folderMetaPath = normalizePath(eentry.path) + AppConfig.dirSeparator + AppConfig.metaFolderFile; // getMetaFileLocationForDir(eentry.path);
    if (!eentry.path.endsWith(AppConfig.metaFolder + '/')) {
      // Skip the /.ts folder
      return this.loadTextFilePromise(metaPath).then(result => {
        // eslint-disable-next-line no-param-reassign
        eentry.meta = JSON.parse(result.trim());
        return eentry;
      });
    }

    return new Promise(resolve => {
      resolve(eentry);
    });
  };

  /**
   * Finds out the properties of a file or directory such last modification date or file size
   */
  getPropertiesPromise = (path: string): Promise<any> =>
    new Promise((resolve, reject) => {
      const entryPath = this.normalizePath(path);
      // getFileSystemPromise(dir).then(function(fileSystem) {
      const fileProperties: any = {};
      this.fsRoot.getFile(
        entryPath,
        {
          create: false,
          exclusive: false
        },
        entry => {
          if (entry.isFile) {
            entry.file(
              file => {
                fileProperties.path = entry.fullPath;
                fileProperties.size = file.size;
                fileProperties.lmdt = file.lastModifiedDate;
                fileProperties.mimetype = file.type;
                fileProperties.isFile = entry.isFile;
                fileProperties.name = file.name;
                resolve(fileProperties);
              },
              () => {
                console.log(
                  'getPropertiesPromise: Error retrieving file properties of ' +
                    entryPath
                );
                resolve(false);
              }
            );
          } else {
            console.log(
              'getPropertiesPromise: Error getting file properties. ' +
                entryPath +
                ' is directory'
            );
            resolve(false);
          }
        },
        err => {
          this.getDirSystemPromise(entryPath).then(dirEntry => {
            if (!dirEntry) {
              resolve(false);
              return false;
            }
            console.log(
              "getPropertiesPromise: It's not file " + entryPath,
              err
            );
            resolve({
              path: dirEntry.fullPath,
              isFile: dirEntry.isFile,
              name: dirEntry.name
            });
          });
        }
      );
    });

  /**
   * Load the content of a text file
   */
  loadTextFilePromise = (
    filePath: string,
    isPreview: boolean = false
  ): Promise<any> => this.getFileContentPromise(filePath, 'text', isPreview);

  /**
   * Gets the content of file, useful for binary files
   */
  getFileContentPromise = (
    filePath: string,
    type: string,
    isPreview: boolean
    // resolvePath?: string
  ): Promise<any> => {
    // TODO refactor
    const getFilePromise = (
      filePath: string,
      resolvePath: string
    ): Promise<any> => {
      const getFile = (fullPath, result, fail) => {
        const filePath = this.normalizePath(fullPath);

        this.fsRoot.getFile(
          filePath,
          { create: false },
          fileEntry => {
            fileEntry.file(file => {
              result(file);
            }, fail);
          },
          fail
        );
      };

      return new Promise((resolve, reject) => {
        if (resolvePath) {
          this.getDirSystemPromise(resolvePath)
            .then(resfs => {
              resfs.getFile(
                filePath,
                { create: false },
                fileEntry => {
                  fileEntry.file(resolve, reject);
                },
                reject
              );
            })
            .catch(reject);
        } else {
          getFile(filePath, resolve, reject);
        }
      });
    };

    if (isPreview) {
      return new Promise(resolve =>
        resolve('Previewing files is not supported on this platform')
      );
    }

    return new Promise((resolve, reject) => {
      getFilePromise(filePath, undefined).then(file => {
        const reader = new FileReader();
        reader.onerror = function() {
          reject(reader.error);
        };
        reader.onload = function() {
          resolve(reader.result);
        };
        if (type === 'text') {
          reader.readAsText(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      }, reject);
    });
  };

  /**
   * Persists a given content(binary supported) to a specified filepath
   */
  saveFilePromise = (
    filePath: string,
    content,
    overWrite: boolean,
    isRaw?: boolean
  ): Promise<TS.FileSystemEntry> => {
    // eslint-disable-next-line no-param-reassign
    filePath = this.normalizePath(filePath);
    console.log('Saving file: ' + filePath);
    return new Promise((resolve, reject) => {
      let isNewFile = true;
      // Checks if the file already exists
      this.fsRoot.getFile(
        filePath,
        {
          create: false,
          exclusive: false
        },
        entry => {
          if (entry.isFile) {
            isNewFile = false;
          }
        },
        () => {}
      );
      if (isNewFile || overWrite) {
        this.fsRoot.getFile(
          filePath,
          {
            create: true,
            exclusive: false
          },
          entry => {
            entry.createWriter(
              writer => {
                writer.onwriteend = function(evt) {
                  // resolve(this.fsRoot.fullPath + "/" + filePath);
                  resolve({
                    name: extractFileName(filePath, AppConfig.dirSeparator),
                    isFile: true,
                    path: filePath,
                    extension: extractFileExtension(
                      filePath,
                      AppConfig.dirSeparator
                    ),
                    size: 0, // TODO debug evt and set size
                    lmdt: new Date().getTime(),
                    isNewFile,
                    tags: []
                  });
                };
                if (isRaw) {
                  writer.write(content);
                } else if (
                  typeof content === 'string' &&
                  content.indexOf(';base64,') > 0
                ) {
                  const contentArray = content.split(';base64,');
                  const type =
                    contentArray.length > 1
                      ? contentArray[0].split(':')[1]
                      : '';
                  const newContent =
                    contentArray.length > 1 ? contentArray[1] : contentArray[0];
                  const data = b64toBlob(newContent, type, 512);
                  writer.write(data);
                } else {
                  writer.write(content);
                }
              },
              err => {
                reject('Error creating file: ' + filePath + ' ' + err);
              }
            );
          },
          error => {
            reject('Error getting file entry: ' + filePath + ' ' + error);
          }
        );
      } else {
        const errMsg = 'File already exists: ' + filePath; // i18n.t('ns.common:fileExists', { fileName: filePath });
        // showAlertDialog(errMsg);
        reject(errMsg);
      }
    });
  };

  /**
   * Persists a given text content to a specified filepath
   */
  saveTextFilePromise = (
    filePath: string,
    content: string,
    overWrite: boolean
  ): Promise<any> => {
    console.log('Saving TEXT file: ' + filePath);
    // Handling the UTF8 support for text files
    /* var UTF8_BOM = "\ufeff";
    if (content.indexOf(UTF8_BOM) === 0) {
      console.log("Content beging with a UTF8 bom");
    } else {
      content = UTF8_BOM + content;
    } */
    return this.saveFilePromise(filePath, content, overWrite, true);
  };

  /**
   * Persists a given binary content to a specified filepath
   */
  saveBinaryFilePromise = (
    filePath: string,
    content: any,
    overWrite: boolean
  ): Promise<TS.FileSystemEntry> => {
    console.log('Saving binary file: ' + filePath);
    // var dataView = new Int8Array(content);
    const dataView = content;
    return this.saveFilePromise(filePath, dataView, overWrite);
  };

  /**
   * Creates a directory
   */
  createDirectoryPromise = (dirPath: string): Promise<any> => {
    console.log('Creating directory: ' + dirPath);
    return new Promise((resolve, reject) => {
      this.checkDirExist(dirPath).then(exist => {
        if (exist) {
          reject('error createDirectory: ' + dirPath + ' exist!');
          return;
        }
        dirPath = this.normalizePath(dirPath);
        this.fsRoot.getDirectory(
          dirPath,
          {
            create: true,
            exclusive: false
          },
          dirEntry => {
            resolve(dirPath);
          },
          error => {
            reject(
              'Creating directory failed: ' +
                dirPath +
                ' failed with error code: ' +
                error.code
            );
          }
        );
      });
    });
  };

  /**
   * Copies a given file to a specified location
   */
  copyFilePromise = (
    filePath: string,
    newFilePath: string,
    override: boolean = true
  ): Promise<any> =>
    new Promise(async (resolve, reject) => {
      if (!override) {
        const exist = await this.checkFileExist(newFilePath);
        if (exist) {
          reject('error copyFile: ' + newFilePath + ' exist!');
          return;
        }
      }
      // eslint-disable-next-line no-param-reassign
      filePath = this.normalizePath(filePath);
      const newFileName = newFilePath.substring(
        newFilePath.lastIndexOf('/') + 1
      );
      const newFileParentPath = this.normalizePath(
        newFilePath.substring(0, newFilePath.lastIndexOf('/'))
      );
      this.fsRoot.getDirectory(
        newFileParentPath,
        {
          create: false,
          exclusive: false
        },
        parentDirEntry => {
          this.fsRoot.getFile(
            filePath,
            {
              create: false,
              exclusive: false
            },
            entry => {
              entry.copyTo(
                parentDirEntry,
                newFileName,
                () => {
                  console.log(
                    'File copy: target: ' +
                      newFilePath +
                      ' source: ' +
                      entry.fullPath
                  );
                  resolve(newFilePath);
                },
                () => {
                  reject('error copying: ' + filePath);
                }
              );
            },
            () => {
              reject('Error getting file: ' + filePath);
            }
          );
        },
        error => {
          reject(
            'Getting dir: ' +
              newFileParentPath +
              ' failed with error code: ' +
              error.code
          );
        }
      );
    });

  /**
   * Renames a given file
   */
  renameFilePromise = (filePath: string, newFilePath: string): Promise<any> =>
    new Promise((resolve, reject) => {
      this.checkFileExist(newFilePath).then(exist => {
        if (exist) {
          reject('error renaming: ' + newFilePath + ' exist!');
          return;
        }
        // eslint-disable-next-line no-param-reassign
        filePath = this.normalizePath(filePath);
        const newFileName = newFilePath.substring(
          newFilePath.lastIndexOf('/') + 1
        );
        const newFileParentPath = this.normalizePath(
          newFilePath.substring(0, newFilePath.lastIndexOf('/') + 1)
        );
        console.log(
          'renameFile: ' + newFileName + ' newFilePath: ' + newFilePath
        );
        this.fsRoot.getDirectory(
          newFileParentPath,
          {
            create: false,
            exclusive: false
          },
          parentDirEntry => {
            this.fsRoot.getFile(
              filePath,
              {
                create: false,
                exclusive: false
              },
              entry => {
                entry.moveTo(
                  parentDirEntry,
                  newFileName,
                  () => {
                    console.log(
                      'File renamed to: ' +
                        newFilePath +
                        ' Old name: ' +
                        entry.fullPath
                    );
                    resolve([filePath, newFilePath]);
                  },
                  err => {
                    reject('error renaming: ' + filePath + ' ' + err);
                  }
                );
              },
              error => {
                reject('Error getting file: ' + filePath + ' ' + error);
              }
            );
          },
          error => {
            console.error(
              'Getting dir: ' +
                newFileParentPath +
                ' failed with error code: ' +
                error.code
            );
            reject(error);
          }
        );
      });
    });

  checkFileExist = filePath =>
    new Promise(resolve => {
      this.fsRoot.getFile(
        filePath,
        {
          create: false,
          exclusive: false
        },
        () => {
          resolve(true);
        },
        () => {
          resolve(false);
        }
      );
    });

  checkDirExist = dirPath =>
    new Promise(resolve => {
      window.resolveLocalFileSystemURL(
        (dirPath.startsWith('/') ? 'file://' : 'file:///') +
          dirPath +
          (dirPath.endsWith('/') ? '' : '/'),
        () => {
          resolve(true);
        },
        () => {
          resolve(false);
        }
      );
    });

  /**
   * Rename a directory
   */
  renameDirectoryPromise = (
    dirPath: string,
    newDirName: string
  ): Promise<any> =>
    new Promise((resolve, reject) => {
      let newDirPath =
        extractParentDirectoryPath(dirPath, '/') +
        AppConfig.dirSeparator +
        newDirName;
      // eslint-disable-next-line no-param-reassign
      dirPath = this.normalizePath(dirPath);
      const newDirParentPath = this.normalizePath(
        newDirPath.substring(0, newDirPath.lastIndexOf('/'))
      );
      newDirPath = this.normalizePath(newDirPath);

      this.checkDirExist(newDirPath).then(exist => {
        if (exist) {
          reject('error renaming: ' + newDirName + ' exist!');
          return;
        }

        console.log(
          'renameDirectoryPromise: ' + dirPath + ' to: ' + newDirPath
        );
        this.fsRoot.getDirectory(
          newDirParentPath,
          {
            create: false,
            exclusive: false
          },
          parentDirEntry => {
            this.fsRoot.getDirectory(
              dirPath,
              {
                create: false,
                exclusive: false
              },
              entry => {
                entry.moveTo(
                  parentDirEntry,
                  newDirName,
                  () => {
                    console.log(
                      'Directory renamed to: ' +
                        newDirPath +
                        ' from: ' +
                        entry.fullPath
                    );
                    resolve('/' + newDirPath);
                  },
                  err => {
                    reject('error renaming directory: ' + dirPath + ' ' + err);
                  }
                );
              },
              error => {
                reject('Error getting directory: ' + dirPath + ' ' + error);
              }
            );
          },
          error => {
            console.error(
              'Getting dir: ' +
                newDirParentPath +
                ' failed with error code: ' +
                error.code
            );
            reject(error);
          }
        );
      });
    });

  /**
   * Delete a specified file
   */
  deleteFilePromise = (filePath: string): Promise<any> =>
    new Promise((resolve, reject) => {
      const path = this.normalizePath(filePath);
      this.fsRoot.getFile(
        path,
        {
          create: false,
          exclusive: false
        },
        entry => {
          entry.remove(
            () => {
              console.log('file deleted: ' + path);
              resolve(filePath);
            },
            err => {
              reject('error deleting: ' + filePath + ' ' + err);
            }
          );
        },
        error => {
          reject('error getting file' + path + ' ' + error);
        }
      );
    });

  /**
   * Delete a specified directory, the directory should be empty, if the trash can functionality is not enabled
   */
  deleteDirectoryPromise = (dirPath: string): Promise<any> => {
    console.log('Deleting directory: ' + dirPath);
    return new Promise((resolve, reject) => {
      const path = this.normalizePath(dirPath);

      this.fsRoot.getDirectory(
        path,
        {
          create: false,
          exclusive: false
        },
        entry => {
          entry.remove(
            () => {
              console.log('file deleted: ' + path);
              resolve(dirPath);
            },
            err => {
              reject('error deleting dir: ' + dirPath + ' ' + err);
            }
          );
        },
        error => {
          reject('error getting directory ' + dirPath + ' ' + error);
        }
      );
    });
  };

  /**
   * Selects a directory with the help of a directory chooser
   */
  selectDirectory = () => {
    console.log('Open select directory dialog.');
    // showDirectoryBrowserDialog(this.fsRoot.fullPath);
  };

  /**
   * Selects a file with the help of a file chooser
   */
  selectFile = () => {
    console.log('Operation selectFile not supported.');
  };

  selectDirectoryDialog = (): Promise<any> => {
    if (AppConfig.isCordovaiOS) {
      console.log('Operation selectDirectoryDialog not supported.');
    } else {
      return new Promise((resolve, reject) => {
        // @ts-ignore
        window.OurCodeWorld.Filebrowser.folderPicker.single({
          success: function(data) {
            if (!data.length) {
              reject('No folders selected');
              return;
            }

            // Array with paths
            // ["file:///storage/emulated/0/360/security", "file:///storage/emulated/0/360/security"]
            // fix https://trello.com/c/vV7D0kGf/500-tsn500-fix-folder-selector-in-create-edit-location-on-android-or-use-native-dialog
            data[0] = data[0].replace(
              'file:///storage/emulated/0', // 'content://org.tagspaces.mobileapp.provider/root/storage/emulated/0', 'file:///storage/emulated/0',
              'sdcard'
            );
            resolve(data);
          },
          error: function(err) {
            reject('Folders selection err:' + err);
          }
        });
      });
    }
  };

  /**
   * Opens a directory in the operating system's default file manager
   */
  openDirectory = (dirPath: string) => {
    console.warn('function openDirectory not supported on cordova');
  };

  /**
   * Opens a directory in the operating system's default file manager, selecting the file
   */
  showInFileManager = (filePath: string) => {
    console.warn('Showing item ' + filePath + ' not supported on cordova');
  };

  /**
   * Opens a file with the operating system's default program for the type of the file
   */
  openFile = (filePath: string) => {
    console.log('Opening natively: ' + filePath);
    if (
      filePath.indexOf('http://') === 0 ||
      filePath.indexOf('https://') === 0
    ) {
      window.open(filePath, '_system');
    } else if (filePath.indexOf('file://') === 0) {
      cordova.plugins.fileOpener2.open(filePath);
    } else {
      cordova.plugins.fileOpener2.open('file://' + filePath);
    }
  };

  openUrl = (url: string): void => {
    window.open(url, '_system');
  };

  /**
   * Places the application window on top of the other windows
   */
  focusWindow = () => {
    console.log('Focusing window is not implemented in cordova.');
  };

  shareFiles = (files: Array<string>) => {
    // this is the complete list of currently supported params you can pass to the plugin (all optional)
    const options = {
      // message: 'share file', // not supported on some apps (Facebook, Instagram)
      subject: 'File sharing', // fi. for email
      files, //: ['', ''], // an array of filenames either locally or remotely
      // url: 'https://www.website.com/foo/#bar?a=b',
      chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
      //appPackageName: 'com.apple.social.facebook', // Android only, you can provide id of the App you want to share with
      //iPadCoordinates: '0,0,0,0' //IOS only iPadCoordinates for where the popover should be point.  Format with x,y,width,height
    };

    const onSuccess = function(result) {
      console.log('Share completed? ' + result.completed); // On Android apps mostly return false even while it's true
      console.log('Shared to app: ' + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
    };

    const onError = function(msg) {
      console.log('Sharing failed with message: ' + msg);
    };

    window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
  };
}
