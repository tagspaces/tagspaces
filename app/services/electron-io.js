/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation..
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

import fsextra from 'fs-extra';
import { extractParentDirectoryPath, getMetaDirectoryPath } from '../utils/paths';
import { arrayBufferToBuffer } from '../utils/misc';
import AppConfig from '../config';
import TrayIcon from '../assets/icons/trayIcon.png';
// import TrayIconWin from '../assets/icons/trayIcon.ico';
import TrayIcon2x from '../assets/icons/trayIcon@2x.png';
import TrayIcon3x from '../assets/icons/trayIcon@3x.png';

export default class ElectronIO {
  electron: Object;
  win: Object;
  app: Object;
  ipcRenderer: Object;
  remote: Object;
  workerWindow: Object;
  pathUtils: Object;
  fs: Object;
  fsWatcher: Object;
  webFrame: Object;

  constructor() {
    if (window.require) {
      this.electron = window.require('electron');
      this.ipcRenderer = this.electron.ipcRenderer;
      this.webFrame = this.electron.webFrame;
      this.remote = this.electron.remote;
      this.workerWindow = this.remote.getGlobal('splashWorkerWindow');
      this.win = this.remote.getCurrentWindow();
      this.app = this.remote.app;
      this.fs = fsextra; // window.require('fs-extra');
      this.pathUtils = window.require('path');
    }
  }

  initMainMenu = (menuConfig: Array<Object>) => {
    const Menu = this.remote.Menu;
    const defaultMenu = Menu.buildFromTemplate(menuConfig);
    Menu.setApplicationMenu(defaultMenu);
  };

  initTrayMenu = (menuConfig: Array<Object>) => {
    const mainWindow = this.win;
    const Menu = this.remote.Menu;
    const Tray = this.remote.Tray;
    const nativeImage = this.remote.nativeImage;

    // let trayIconPath;
    // if (process.platform === 'darwin') {
    //   trayIconPath = this.pathUtils.join(__dirname, '/assets/icons/64x64.png');
    // } else if (process.platform === 'win32') {
    //   trayIconPath = this.pathUtils.join(__dirname, '/assets/icons/128x128.png');
    // } else {
    //   trayIconPath = this.pathUtils.join(__dirname, '/assets/icons/64x64.png');
    // }
    // const appPath = this.getAppPath();
    // const nImage = nativeImage.createFromPath(appPath + trayIconPath);

    let nImage;
    // if (process.platform === 'darwin') {
    //   nImage = nativeImage.createFromDataURL(TrayIcon);
    //   nImage.addRepresentation(2, TrayIcon2x);
    // } else
    if (process.platform === 'win32') {
      nImage = nativeImage.createFromDataURL(TrayIcon2x);
    } else {
      nImage = nativeImage.createFromDataURL(TrayIcon);
      nImage.addRepresentation({ scaleFactor: 2.0, dataURL: TrayIcon2x });
      nImage.addRepresentation({ scaleFactor: 3.0, dataURL: TrayIcon3x });
    }

    const tsTray = new Tray(nImage);

    tsTray.on('click', () => {
      if (mainWindow) {
        mainWindow.show();
      }
    });
    const trayMenu = Menu.buildFromTemplate(menuConfig);
    tsTray.setToolTip('TagSpaces App');
    tsTray.setContextMenu(trayMenu);
  };

  isWorkerAvailable = (): boolean => {
    let workerAvailable = false;
    try {
      if (this.workerWindow && this.workerWindow.webContents) {
        workerAvailable = true;
      }
    } catch (err) {
      console.info('Error by finding if worker is available.');
    }
    return workerAvailable;
  };

  showMainWindow = (): void => {
    this.win.show();
  };

  quitApp = (): void => {
    this.win.destroy();
  };

  // Experimental functionality
  watchDirectory = (dirPath: string, listener: Object): void => {
    // stopWatchingDirectories();
    this.fsWatcher = this.fs.watch(
      dirPath,
      { persistent: true, recursive: false },
      listener
    );
  };

  // Sets the current window on top of the windows
  focusWindow = (): void => {
    this.win.focus();
  };

  getDevicePaths = (): Object => {
    const paths = {
      Desktop: this.app.getPath('desktop'),
      Documents: this.app.getPath('documents'),
      Downloads: this.app.getPath('downloads'),
      Music: this.app.getPath('music'),
      Pictures: this.app.getPath('pictures'),
      Videos: this.app.getPath('videos')
    };
    return paths;
  };

  getUserHomePath = (): string => this.app.getPath('home');

  getAppDataPath = (): string => this.ipcRenderer.sendSync(
    'app-data-path-request',
    'notNeededArgument'
  );

  setZoomFactorElectron = (zoomLevel: number) => this.webFrame.setZoomFactor(zoomLevel);

  setGlobalShortcuts = (globalShortcutsEnabled: boolean) => {
    this.ipcRenderer.send('global-shortcuts-enabled', globalShortcutsEnabled);
  }

  getAppPath = (): string => this.ipcRenderer.sendSync(
    'app-dir-path-request',
    'notNeededArgument'
  );

  createDirectoryTree = (directoryPath: string): Object => {
    console.log('Creating directory index for: ' + directoryPath);
    const generateDirectoryTree = (dirPath: string) => {
      try {
        const tree = {};
        const dstats = this.fs.lstatSync(dirPath);
        tree.name = this.pathUtils.basename(dirPath);
        tree.isFile = false;
        tree.lmdt = dstats.mtime;
        tree.path = dirPath;
        tree.children = [];
        const dirList = this.fs.readdirSync(dirPath);
        for (let i = 0; i < dirList.length; i += 1) {
          const path = dirPath + AppConfig.dirSeparator + dirList[i];
          const stats = this.fs.lstatSync(path);
          if (stats.isFile()) {
            tree.children.push({
              name: this.pathUtils.basename(path),
              isFile: true,
              size: stats.size,
              lmdt: stats.mtime,
              path
            });
          } else {
            tree.children.push(generateDirectoryTree(path));
          }
        }
        return tree;
      } catch (ex) {
        console.error('Generating tree for ' + dirPath + ' failed ' + ex);
      }
    };
    // console.log(JSON.stringify(directoyTree));
    return generateDirectoryTree(directoryPath);
  };

  createDirectoryIndexInWorker = (directoryPath: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (this.isWorkerAvailable()) {
        const timestamp = new Date().getTime().toString();
        this.workerWindow.webContents.send('worker', {
          id: timestamp,
          action: 'createDirectoryIndex',
          path: directoryPath
        });
        this.ipcRenderer.once(timestamp, (event, data) => {
          // console.log('Answer from worker recieved ' + data.result);
          resolve(data.result);
        });
      } else {
        reject('Worker window not available!');
      }
    });
  };

  createThumbnailsInWorker = (tmbGenerationList: Array<string>): Promise<any> => new Promise((resolve, reject) => {
    if (this.isWorkerAvailable()) {
      const timestamp = new Date().getTime().toString();
      this.workerWindow.webContents.send('worker', {
        id: timestamp,
        action: 'createThumbnails',
        tmbGenerationList
      });
      this.ipcRenderer.once(timestamp, (event, data) => {
        // console.log('Answer from worker received ' + data.result);
        resolve(data.result);
      });
    } else {
      reject('Worker window not available!');
    }
  });

  listDirectoryPromise = (
    path: string,
    lite: boolean = true
  ): Promise<Array<Object>> => new Promise(resolve => {
    const enhancedEntries = [];
    let entryPath;
    let metaFolderPath;
    let stats;
    let eentry;
    let containsMetaFolder = false;
    // const metaMetaFolder = AppConfig.metaFolder + AppConfig.dirSeparator + AppConfig.metaFolder;

    this.fs.readdir(path, (error, entries) => {
      if (error) {
        console.warn('Error listing directory ' + path);
        resolve(enhancedEntries); // returning results even if any promise fails
        return;
      }

      if (window.walkCanceled) {
        resolve(enhancedEntries); // returning results even if walk canceled
        return;
      }

      if (entries) {
        entries.forEach(entry => {
          entryPath = path + AppConfig.dirSeparator + entry;
          eentry = {};
          eentry.name = entry;
          eentry.path = entryPath;
          eentry.tags = [];
          eentry.thumbPath = '';
          eentry.meta = {};

          try {
            stats = this.fs.statSync(entryPath);
            eentry.isFile = stats.isFile();
            eentry.size = stats.size;
            eentry.lmdt = stats.mtime.getTime();

            if (
              !eentry.isFile &&
              eentry.name.endsWith(AppConfig.metaFolder)
            ) {
              containsMetaFolder = true;
            }

            // Read tsm.json from subfolders
            if (!eentry.isFile && !lite) {
              const folderMetaPath =
                eentry.path +
                AppConfig.dirSeparator +
                AppConfig.metaFolder +
                AppConfig.dirSeparator +
                AppConfig.metaFolderFile;
              try {
                const folderMeta = this.fs.readJsonSync(folderMetaPath);
                eentry.meta = folderMeta;
                // console.log('Succes reading meta folder file ' + folderMetaPath);
              } catch (err) {
                // console.log('Failed reading meta folder file ' + folderMetaPath);
              }
            }

            if (window.walkCanceled) {
              resolve(enhancedEntries);
              return;
            }
          } catch (e) {
            console.warn('Can not load properties for: ' + entryPath);
          }
          enhancedEntries.push(eentry);
        });

        // Read the .ts meta content
        if (!lite && containsMetaFolder) {
          metaFolderPath = getMetaDirectoryPath(path);
          this.fs.readdir(metaFolderPath, (err, metaEntries) => {
            if (err) {
              console.log(
                'Error listing meta directory ' + metaFolderPath + ' - ' + err
              );
              resolve(enhancedEntries); // returning results even if any promise fails
              return;
            }

            if (window.walkCanceled) {
              resolve(enhancedEntries); // returning results even if walk canceled
              return;
            }

            if (metaEntries) {
              metaEntries.forEach(metaEntryName => {
                /* if (metaEntryName === AppConfig.metaFolderFile) {
                  // Read meta folder path
                } */

                // Reading meta json files with tags and description
                if (metaEntryName.endsWith(AppConfig.metaFileExt)) {
                  const fileNameWithoutMetaExt = metaEntryName.substr(
                    0,
                    metaEntryName.lastIndexOf(AppConfig.metaFileExt)
                  );
                  const origFile = enhancedEntries.find(
                    result => result.name === fileNameWithoutMetaExt
                  );
                  if (origFile) {
                    const metaFilePath =
                      metaFolderPath + AppConfig.dirSeparator + metaEntryName;
                    const metaFileObj = this.fs.readJsonSync(metaFilePath);
                    if (metaFileObj) {
                      enhancedEntries.map(enhancedEntry => {
                        if (enhancedEntry.name === fileNameWithoutMetaExt) {
                          enhancedEntry.meta = metaFileObj;
                        }
                        return true;
                      });
                    }
                  }
                }

                // Finding if thumbnail available
                if (metaEntryName.endsWith(AppConfig.thumbFileExt)) {
                  const fileNameWithoutMetaExt = metaEntryName.substr(
                    0,
                    metaEntryName.lastIndexOf(AppConfig.thumbFileExt)
                  );
                  enhancedEntries.map(enhancedEntry => {
                    if (enhancedEntry.name === fileNameWithoutMetaExt) {
                      const thumbFilePath =
                        metaFolderPath +
                        AppConfig.dirSeparator +
                        metaEntryName;
                      enhancedEntry.thumbPath = thumbFilePath;
                    }
                    return true;
                  });
                }

                if (window.walkCanceled) {
                  resolve(enhancedEntries);
                }
              });
            }
            resolve(enhancedEntries);
          });
        } else {
          resolve(enhancedEntries);
        }
      }
    });
  });

  getPropertiesPromise = (path: string): Promise<any> => new Promise(resolve => {
    /* stats for file:
     * "dev":41, "mode":33204, "nlink":1, "uid":1000, "gid":1000,  "rdev":0,
     * "blksize":4096, "ino":2634172, "size":230, "blocks":24,  "atime":"2015-11-24T09:56:41.932Z",
     * "mtime":"2015-11-23T14:29:29.689Z", "ctime":"2015-11-23T14:29:29.689Z",  "birthtime":"2015-11-23T14:29:29.689Z",
     * "isFile":true, "path":"/home/somefile.txt" */
    this.fs.lstat(path, (err, stats) => {
      if (err) {
        resolve(false);
        return;
      }

      if (stats) {
        resolve({
          name: path.substring(
            path.lastIndexOf(AppConfig.dirSeparator) + 1,
            path.length
          ),
          isFile: stats.isFile(),
          size: stats.size,
          lmdt: stats.mtime.getTime(),
          path
        });
      }
    });
  });

  createDirectoryPromise = (dirPath: string): Promise<any> => {
    console.log('Creating directory: ' + dirPath);
    return new Promise((resolve, reject) => {
      this.fs.mkdirp(dirPath, error => {
        if (error) {
          reject('Error creating folder: ' + dirPath + ' with ' + error);
          return;
        }
        resolve(dirPath);
      });
    });
  };

  copyFilePromise = (
    sourceFilePath: string,
    targetFilePath: string
  ): Promise<any> => {
    console.log('Copying file: ' + sourceFilePath + ' to ' + targetFilePath);
    return new Promise((resolve, reject) => {
      if (sourceFilePath === targetFilePath) {
        reject(
          'Trying to copy over the same file. Copying "' +
            sourceFilePath +
            '" failed'
        );
      } else if (this.fs.lstatSync(sourceFilePath).isDirectory()) {
        reject('Trying to copy a file: ' + sourceFilePath + '. Copying failed');
      } else if (this.fs.existsSync(targetFilePath)) {
        reject('File "' + targetFilePath + '" exists. Copying failed.');
      } else {
        this.fs.copy(sourceFilePath, targetFilePath, error => {
          if (error) {
            reject('Copying: ' + sourceFilePath + ' failed.');
            return;
          }
          resolve([sourceFilePath, targetFilePath]);
        });
      }
    });
  };

  renameFilePromise = (filePath: string, newFilePath: string): Promise<any> => {
    console.log('Renaming file: ' + filePath + ' to ' + newFilePath);
    // stopWatchingDirectories();
    return new Promise((resolve, reject) => {
      if (filePath === newFilePath) {
        reject(
          'Source and target file paths are the same. Renaming of "' +
            filePath +
            '" failed'
        );
        return;
      } else if (this.fs.lstatSync(filePath).isDirectory()) {
        reject(
          'Trying to rename a directory. Renaming of "' + filePath + '" failed'
        );
        return;
      } else if (!this.fs.existsSync(filePath)) {
        reject(
          'Source file does not exist. Renaming of "' + filePath + '" failed'
        );
        return;
      } else if (this.fs.existsSync(newFilePath)) {
        reject(
          'Target filename "' +
            newFilePath +
            '" exists. Renaming of "' +
            filePath +
            '" failed'
        );
        return;
      }
      this.fs.move(filePath, newFilePath, { clobber: true }, error => {
        if (error) {
          reject('Renaming: ' + filePath + ' failed with: ' + error);
          return;
        }
        resolve([filePath, newFilePath]);
      });
    });
  };

  renameDirectoryPromise = (
    dirPath: string,
    newDirName: string
  ): Promise<any> => {
    const newDirPath =
      extractParentDirectoryPath(dirPath) + AppConfig.dirSeparator + newDirName;
    console.log('Renaming dir: ' + dirPath + ' to ' + newDirPath);
    // stopWatchingDirectories();
    return new Promise((resolve, reject) => {
      if (dirPath === newDirPath) {
        reject('Trying to move in the same directory. Moving failed');
        return;
      } else if (this.fs.existsSync(newDirPath)) {
        reject(
          'Directory "' +
            newDirPath +
            '" exists. Renaming of "' +
            dirPath +
            '" failed'
        );
        return;
      }
      const dirStatus = this.fs.lstatSync(dirPath);
      if (dirStatus.isDirectory) {
        this.fs.rename(dirPath, newDirPath, error => {
          if (error) {
            reject('Renaming "' + dirPath + '" failed with: ' + error);
            return;
          }
          resolve(newDirPath);
        });
      } else {
        reject('Path is not a directory. Renaming of ' + dirPath + ' failed.');
      }
    });
  };

  loadTextFilePromise = (
    filePath: string,
    isPreview?: boolean = false
  ): Promise<string> => new Promise((resolve, reject) => {
    if (isPreview) {
      const stream = this.fs.createReadStream(filePath, {
        start: 0,
        end: 10000
      });

      stream.on('error', err => {
        reject(err);
      });

      const chunks = [];
      stream.on('data', (chunk) => {
        chunks.push(chunk.toString());
        // console.log('stream data ' + chunk);
      });

      stream.on('end', () => {
        const textContent = chunks.join('');
        resolve(textContent);
        // console.log('final output ' + string);
      });
    } else {
      this.fs.readFile(filePath, 'utf8', (error, content) => {
        if (error) {
          reject(error);
        } else {
          resolve(content);
        }
      });
    }
  });

  getFileContentPromise = (
    fullPath: string,
    type: string
  ): Promise<any> => new Promise((resolve, reject) => {
    let fileURL = fullPath;
    if (fileURL.indexOf('file://') === -1) {
      fileURL = 'file://' + fileURL;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('GET', fileURL, true);
    xhr.responseType = type || 'arraybuffer';
    xhr.onerror = reject;

    xhr.onload = () => {
      const response = xhr.response || xhr.responseText;
      if (response) {
        resolve(response);
      } else {
        reject('getFileContentPromise error');
      }
    };
    xhr.send();
  });

  saveFilePromise = (
    filePath: string,
    content: any,
    overwrite: boolean = true
  ): Promise<any> => new Promise((resolve, reject) => {
    const fileSystem = this.fs;
    function saveFile(fPath, tContent, isNewFile) {
      fileSystem.writeFile(fPath, tContent, 'utf8', error => {
        if (error) {
          reject(error);
          return;
        }
        resolve(isNewFile);
      });
    }

    this.getPropertiesPromise(filePath)
      .then(entry => {
        if (entry && entry.isFile && overwrite) {
          saveFile(filePath, content, false);
        } else {
          saveFile(filePath, content, true);
        }
        return true;
      })
      .catch(error => {
        // Trying to save as new file
        console.log(
          'Getting properties for ' + filePath + ' failed with: ' + error
        );
        saveFile(filePath, content, true);
      });
  });

  saveTextFilePromise = (
    filePath: string,
    content: string,
    overwrite: boolean
  ): Promise<any> => {
    console.log('Saving file: ' + filePath);

    // Handling the UTF8 support for text files
    const UTF8_BOM = '\ufeff';
    let textContent = content;

    if (content.indexOf(UTF8_BOM) === 0) {
      console.log('Content beging with a UTF8 bom');
    } else {
      textContent = UTF8_BOM + content;
    }

    return this.saveFilePromise(filePath, textContent, overwrite);
  };

  saveBinaryFilePromise = (
    filePath: string,
    content: any,
    overwrite: boolean
  ): Promise<any> => {
    console.log('Saving binary file: ' + filePath);
    const buff = arrayBufferToBuffer(content);
    return this.saveFilePromise(filePath, buff, overwrite);
  };

  deleteFilePromise = (
    path: string,
    useTrash?: boolean = true
  ): Promise<any> => {
    if (useTrash) {
      return new Promise((resolve, reject) => {
        this.moveToTrash([path])
          .then(() => resolve(path))
          .catch(err => reject(err));
      });
    }

    return new Promise((resolve, reject) => {
      this.fs.unlink(path, error => {
        if (error) {
          return reject(error);
        }
        return resolve(path);
      });
    });
  };

  deleteDirectoryPromise = (
    path: string,
    useTrash?: boolean = true
  ): Promise<any> => {
    if (useTrash) {
      return new Promise((resolve, reject) => {
        this.moveToTrash([path])
          .then(() => resolve(path))
          .catch(err => reject(err));
      });
    }

    return new Promise((resolve, reject) => {
      this.fs.rmdir(path, error => {
        if (error) {
          return reject(error);
        }
        return resolve(path);
      });
    });
  };

  moveToTrash = (files: Array<string>): Promise<any> => new Promise((resolve, reject) => {
    let result = true;
    files.forEach(fullPath => {
      result = this.electron.shell.moveItemToTrash(fullPath);
    });
    if (result) {
      resolve(true);
    } else {
      reject('Moving of at least one file to trash failed.');
    }
  });

  openDirectory = (dirPath: string): void => {
    this.electron.shell.showItemInFolder(
      dirPath + AppConfig.dirSeparator + '.'
    );
  };

  openFile = (filePath: string): void => {
    this.electron.shell.openItem(filePath);
  };

  openUrl = (url: string): void => {
    this.electron.shell.openExternal(url);
  };

  selectFileDialog = (): Promise<any> => {
    const options = {
      /* filters: [
        {
          name: 'Images',
          extensions: ['jpg', 'png', 'gif']
        }
      ] */
    };
    return new Promise((resolve) => {
      this.remote.dialog.showOpenDialog(options, fileNames => {
        resolve(fileNames);
      });
    });
  };

  selectDirectoryDialog = (): Promise<any> => {
    const options = {
      properties: ['openDirectory']
    };
    return new Promise(resolve => {
      this.remote.dialog.showOpenDialog(options, directory => {
        resolve(directory);
      });
    });
  };
}
