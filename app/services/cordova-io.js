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

/* globals cordova */

import AppConfig from '../config';
import { b64toBlob } from '../utils/misc';
import { extractParentDirectoryPath } from '../utils/paths';

const appSettingFile = 'settings.json';
const appSettingTagsFile = 'settingsTags.json';
// let anotatedTree;
// let pendingCallbacks = 0;

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
  widgetAction;
  loadedSettings: any;
  loadedSettingsTags: any;

  onDeviceReady = () => {
    console.log('Device Ready: ' + window['device'].platform + ' - ' + window['device'].version);

    // attachFastClick(document.body);
    this.getFileSystem();

    // iOS specific initialization
    if (AppConfig.isCordovaiOS) {
      window.plugins = window.plugins || {};
      // TODO: use fileOpener2 plugin on all platforms
      // https://build.phonegap.com/plugins/1117
      window.plugins.fileOpener = cordova.plugins.fileOpener2;
    }

    if (window.plugins.webintent) {
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
        // , function(error) {
        //  showAlertDialog("WebIntent Error: " + error);
        // }
      );
      window.plugins.webintent.onNewIntent(url => {
        this.widgetAction = url;
        this.widgetActionHandler();
      });
    }

    if (AppConfig.isCordovaiOS) {
      setTimeout(() => {
        navigator.splashscreen.hide();
      }, 1000);

      // Enable TestFairy if available
      /* if (PRODUCTION != 'true' && TestFairy) {
        TestFairy.begin('ef5d3fd8bfa17164b8068e71ccb32e1beea25f2f');
      } */
    }
  }

  onDeviceBackButton = (e) => {
    e.preventDefault();
    // send event to main app
  }

  isWorkerAvailable = (): boolean => false;

  // Register ios file open handler
  handleOpenURL = (url: string) => {
    const fileName = url.substring(url.lastIndexOf('/') + 1, url.length);
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

  widgetActionHandler = () => {
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
  };

  onApplicationLoad = () => {
    if (this.widgetAction) {
      this.widgetActionHandler();
    }
  };

  getFileSystemPromise = (path: string): Promise<*> => {
    console.log('getFileSystemPromise: ' + path);
    if (path.indexOf(cordova.file.applicationDirectory) === 0) {
    } else {
      path = AppConfig.isCordovaiOS
        ? cordova.file.documentsDirectory + '/' + path
        : 'file:///' + path;
    }
    path = encodeURI(path);
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(path, resolve, error => {
        console.error('Error getting FileSystem: ' + JSON.stringify(error));
        reject(error);
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
    const dataFolderPath =
      AppConfig.isCordovaiOS === true
        ? cordova.file.dataDirectory
        : cordova.file.externalApplicationStorageDirectory;

    window.resolveLocalFileSystemURL(
      dataFolderPath,
      fs => {
        fs.getFile(fileName, { create: true }, fileCallback, fail);
      },
      error => {
        console.error('Error getSettingsFileSystem: ' + JSON.stringify(error));
      }
    );
  };

  getFileSystem = () => {
    // on android cordova.file.externalRootDirectory points to sdcard0
    const fsURL =
      AppConfig.isCordovaiOS === true
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
            reader.onloadend = (evt) => {
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

  loadSettings = () => {
    return this.loadedSettings;
  };

  saveSettingsTags = (tagGroups: Object) => {
    // TODO use js objects
    const jsonFormat =
      '{ "appName": "' +
      Config.DefaultSettings.appName +
      '", "appVersion": "' +
      Config.DefaultSettings.appVersion +
      '", "appBuild": "' +
      Config.DefaultSettings.appBuild +
      '", "settingsVersion": ' +
      Config.DefaultSettings.settingsVersion +
      ', "tagGroups": ' +
      tagGroups +
      ' }';
    this.saveSettingsFile(appSettingTagsFile, jsonFormat);
  };

  loadSettingsTags = () => {
    return this.loadedSettingsTags;
  };

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
    const paths = {
      Photos: 'sdcard/DCIM/',
      Pictures: 'sdcard/Pictures/',
      Downloads: 'sdcard/Downloads/',
      Music: 'sdcard/Music/',
      Movies: 'sdcard/Movies/',
      SDCard: 'sdcard/'
    };
    return paths;
  };

  getUserHomePath = (): string => {
    return '/';
  };

  getAppDataPath = () => {
    // const appDataPath = ipcRenderer.sendSync('app-data-path-request', 'notNeededArgument');
    // return appDataPath;
  };

  handleStartParameters = () => {
    if (this.urlFromIntent !== undefined && this.urlFromIntent.length > 0) {
      console.log('Intent URL: ' + this.urlFromIntent);
      const filePath = decodeURIComponent(this.urlFromIntent);
      // TODO FileOpener.openFileOnStartup(filePath);
    }
  };

  /**
   * Creates recursively a tree structure for a given directory path
   */
  createDirectoryTree = (dirPath: string) => {
    console.warn('Creating directory tree is not supported in Cordova yet.');
  };

  /**
   * Creates a list with containing the files and the sub directories of a given directory
   */
  listDirectoryPromise = (path: string, lite: boolean): Promise<*> => {
    console.time('listDirectoryPromise');
    return new Promise((resolve, reject) => {
      const anotatedDirList = [];
      const fileWorkers = [];
      this.getFileSystemPromise(path).then(
        fileSystem => {
          const reader = fileSystem.createReader();
          reader.readEntries(
            entries => {
              entries.forEach(entry => {
                if (entry.isDirectory) {
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
                }
              });

              Promise.all(fileWorkers).then(
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
              );
            },
            err => {
              console.warn(
                'Error reading entries promise from ' +
                  path +
                  'err ' +
                  JSON.stringify(err)
              );
              resolve(anotatedDirList); // returning results even if any promise fails
            }
          );
        },
        () => {
          console.warn('Error getting file system promise');
          resolve(anotatedDirList); // returning results even if any promise fails
        }
      );
    });
  };

  /**
   * Finds out the properties of a file or directory such last modification date or file size
   */
  getPropertiesPromise = (path: string): Promise<*> => {
    return new Promise((resolve, reject) => {
      let entryPath = this.normalizePath(path);
      // getFileSystemPromise(dir).then(function(fileSystem) {
      const fileProperties = {};
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
        () => {
          console.log('getPropertiesPromise: Error getting file ' + entryPath);
          resolve(false);
        }
      );
    });
    // });
  };

  /**
   * Load the content of a text file
   */
  loadTextFilePromise = (filePath: string): Promise<*> => {
    return this.getFileContentPromise(filePath, 'text');
  };

  /**
   * Gets the content of file, useful for binary files
   */
  getFileContentPromise = (
    filePath: string,
    type,
    resolvePath: string
  ): Promise<*> => {
    // TODO refactor
    const getFilePromise = (filePath, resolvePath) => {
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
          this.getFileSystemPromise(resolvePath)
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

    return new Promise((resolve, reject) => {
      getFilePromise(filePath, resolvePath).then(file => {
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
  ): Promise<*> => {
    console.log('Saving file: ' + filePath);
    return new Promise((resolve, reject) => {
      let isFileNew = true;
      filePath = this.normalizePath(filePath);
      // Checks if the file already exists
      this.fsRoot.getFile(
        filePath,
        {
          create: false,
          exclusive: false
        },
        entry => {
          if (entry.isFile) {
            isFileNew = false;
          }
        },
        () => {}
      );
      if (isFileNew || overWrite) {
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
                  resolve(isFileNew);
                };
                if (isRaw) {
                  writer.write(content);
                } else if (content.indexOf(';base64,') > 0) {
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
        const errMsg = $.i18n.t('ns.common:fileExists', { fileName: filePath });
        showAlertDialog(errMsg);
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
  ): Promise<*> => {
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
  ) => {
    console.log('Saving binary file: ' + filePath);
    // var dataView = new Int8Array(content);
    const dataView = content;
    return this.saveFilePromise(filePath, dataView, overWrite);
  };

  /**
   * Creates a directory
   */
  createDirectoryPromise = (dirPath: string): Promise<*> => {
    console.log('Creating directory: ' + dirPath);
    return new Promise((resolve, reject) => {
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
  };

  /**
   * Copies a given file to a specified location
   */
  copyFilePromise = (filePath: string, newFilePath: string): Promise<*> =>
    new Promise((resolve, reject) => {
      const filePath = this.normalizePath(filePath);
      const newFileName = newFilePath.substring(
        newFilePath.lastIndexOf('/') + 1
      );
      const newFileParentPath = this.normalizePath(
        newFilePath.substring(0, newFilePath.lastIndexOf('/'))
      );
      // TODO check if the newFilePath exist or causes issues by copying
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
  renameFilePromise = (filePath: string, newFilePath: string): Promise<*> =>
    new Promise((resolve, reject) => {
      filePath = this.normalizePath(filePath);
      const newFileName = newFilePath.substring(newFilePath.lastIndexOf('/') + 1);
      const newFileParentPath = this.normalizePath(
        newFilePath.substring(0, newFilePath.lastIndexOf('/') + 1)
      );
      console.log(
        'renameFile: ' + newFileName + ' newFilePath: ' + newFilePath
      );
      // TODO check if the newFilePath exist or causes issues by renaming
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
            (entry) => {
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
                (err) => {
                  reject('error renaming: ' + filePath + ' ' + err);
                }
              );
            },
            (error) => {
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

  /**
   * Rename a directory
   */
  renameDirectoryPromise = (
    dirPath: string,
    newDirName: string
  ): Promise<*> => {
    return new Promise((resolve, reject) => {
      let newDirPath =
        extractParentDirectoryPath(dirPath) +
        AppConfig.dirSeparator +
        newDirName;

      dirPath = this.normalizePath(dirPath);
      const newDirParentPath = this.normalizePath(
        newDirPath.substring(0, newDirPath.lastIndexOf('/'))
      );
      newDirPath = this.normalizePath(newDirPath);
      console.log('renameDirectoryPromise: ' + dirPath + ' to: ' + newDirPath);
      // TODO check if the newFilePath exist or cause issues by renaming
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
  };

  /**
   * Delete a specified file
   */
  deleteFilePromise = (filePath: string): Promise<*> => {
    return new Promise((resolve, reject) => {
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
  };

  /**
   * Delete a specified directory, the directory should be empty, if the trash can functionality is not enabled
   */
  deleteDirectoryPromise = (dirPath: string): Promise<*> => {
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
  }

  /**
   * Selects a file with the help of a file chooser
   */
  selectFile = () => {
    console.log('Operation selectFile not supported.');
  }

  /**
   * Opens a directory in the operating system's default file manager
   */
  openDirectory = (dirPath: string) => {
    console.warn('function openDirectory not supported on cordova');
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
      window.plugins.fileOpener.open(filePath);
    } else {
      window.plugins.fileOpener.open('file://' + filePath);
    }
  };

  /**
   * Places the application window on top of the other windows
   */
  focusWindow = () => {
    console.log('Focusing window is not implemented in cordova.');
  };
}
