import {
  app,
  dialog,
  globalShortcut,
  ipcMain,
  shell,
  nativeImage,
  BrowserWindow,
} from 'electron';
import {
  getPropertiesPromise,
  listDirectoryPromise,
  listMetaDirectoryPromise,
  createDirectoryPromise,
  copyFilePromise,
  renameFilePromise,
  renameDirectoryPromise,
  copyDirectoryPromise,
  moveDirectoryPromise,
  loadTextFilePromise,
  getFileContentPromise,
  saveFilePromise,
  saveTextFilePromise,
  saveBinaryFilePromise,
  deleteFilePromise,
  deleteDirectoryPromise,
  unZip,
  getDirProperties,
  isDirectory,
} from '@tagspaces/tagspaces-common-node/io-node';
import fs from 'fs-extra';
import path from 'path';
import WebSocket from 'ws';
import {
  getOnProgress,
  isWorkerAvailable,
  newProgress,
  postRequest,
  readMacOSTags,
} from './util';

//let watcher: FSWatcher;
const progress = {};
let wsc;

export default function loadMainEvents() {
  ipcMain.on('reloadWindow', () => {
    const mainWindow = BrowserWindow.getAllWindows();
    if (mainWindow.length > 0) {
      mainWindow.map((window) => window.reload());
    }
  });

  ipcMain.on('watchFolder', async (e, path: string, depth) => {
    try {
      const wssPort = await postRequest(
        JSON.stringify({ path, depth }),
        '/watch-folder',
      );
      if (!wssPort) {
        console.error('error watchFolder wssPort');
      } else {
        if (wsc) {
          wsc.close();
        }
        // @ts-ignore
        wsc = new WebSocket('ws://127.0.0.1:' + wssPort.port);
        wsc.on('message', function message(data) {
          console.log('received: %s', data);
          const mainWindow = BrowserWindow.getAllWindows(); //getFocusedWindow();
          if (mainWindow.length > 0) {
            mainWindow.map((window) =>
              window.webContents.send('folderChanged', JSON.parse(data)),
            );
          }
        });
      }
    } catch (e) {
      console.error('wss error:', e);
    }

    //watchFolder(mainWindow, e, path, depth);
  });
  ipcMain.handle('isWorkerAvailable', async () => {
    const results = await isWorkerAvailable();
    return results;
  });
  ipcMain.handle('isDirectory', async (event, path) => {
    const results = await isDirectory(path);
    return results;
  });
  ipcMain.handle('resolveRelativePaths', (event, relativePath) => {
    return path.resolve(relativePath);
  });
  ipcMain.on('quitApp', () => {
    globalShortcut.unregisterAll();
    app.quit();
  });
  ipcMain.handle('getDevicePaths', () => {
    const paths: any = {
      desktopFolder: app.getPath('desktop'),
      documentsFolder: app.getPath('documents'),
      downloadsFolder: app.getPath('downloads'),
      musicFolder: app.getPath('music'),
      picturesFolder: app.getPath('pictures'),
      videosFolder: app.getPath('videos'),
    };
    if (process.platform === 'darwin') {
      paths.iCloudFolder =
        app.getPath('home') + '/Library/Mobile Documents/com~apple~CloudDocs';
    }
    return paths;
  });
  /*ipcMain.handle('isWorkerAvailable', async (event, wsPort) => {
    try {
      const res = fetch('http://127.0.0.1:' + wsPort, {
        method: 'HEAD',
      });
      return res.status === 200;
    } catch (e) {
      console.debug('isWorkerAvailable:', e);
    }
    return false;
  });*/
  ipcMain.handle('readMacOSTags', async (event, filename) => {
    const results = await readMacOSTags(filename);
    return results;
  });
  ipcMain.on('ondragstart', (event, filePath) => {
    // https://www.electronjs.org/docs/latest/api/web-contents#contentsstartdragitem
    const dragIconBase64 =
      'data:image/png;base64,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';
    const icon = nativeImage.createFromDataURL(dragIconBase64);
    event.sender.startDrag({
      file: filePath,
      icon: icon,
    });
  });
  ipcMain.handle('postRequest', async (event, payload, endpoint) => {
    try {
      const result = await postRequest(payload, endpoint);
      return result;
    } catch (e) {
      console.error(e);
      return false;
    }
  });
  ipcMain.handle(
    'listDirectoryPromise',
    async (event, path, mode, ignorePatterns, resultsLimit) => {
      const result = await listDirectoryPromise(
        path,
        mode,
        ignorePatterns,
        resultsLimit,
      );
      return result;
    },
  );
  ipcMain.handle('listMetaDirectoryPromise', async (event, path) => {
    const result = await listMetaDirectoryPromise(path);
    return result;
  });
  ipcMain.handle('getPropertiesPromise', async (event, path) => {
    const result = await getPropertiesPromise(path);
    return result;
  });
  ipcMain.handle('checkDirExist', async (event, dir) => {
    const stats = await getPropertiesPromise(dir);
    return stats && !stats.isFile;
  });
  ipcMain.handle('checkFileExist', async (event, file) => {
    const stats = await getPropertiesPromise(file);
    return stats && stats.isFile;
  });
  ipcMain.handle('createDirectoryPromise', async (event, dirPath) => {
    const result = await createDirectoryPromise(dirPath);
    if (process.platform === 'win32' && dirPath.endsWith('\\.ts')) {
      // hide .ts folder on Windows
      const wssPost = await postRequest(
        JSON.stringify({ path: dirPath }),
        '/hide-folder',
      );
      // @ts-ignore
      console.log('Hide folder: ' + dirPath + ' - ' + wssPost.success);
    }
    return result;
  });
  ipcMain.handle(
    'copyFilePromiseOverwrite',
    async (event, sourceFilePath, targetFilePath) => {
      const result = await copyFilePromise(sourceFilePath, targetFilePath);
      return result;
    },
  );
  ipcMain.handle(
    'renameFilePromise',
    async (event, filePath, newFilePath, withProgress) => {
      let result;
      if (withProgress) {
        progress['renameFilePromise'] = newProgress('renameFilePromise', 1);
        result = await renameFilePromise(
          filePath,
          newFilePath,
          getOnProgress('renameFilePromise', progress),
        );
      } else {
        result = await renameFilePromise(filePath, newFilePath, undefined);
      }
      return result;
    },
  );
  ipcMain.handle(
    'renameDirectoryPromise',
    async (event, dirPath, newDirName) => {
      const result = await renameDirectoryPromise(dirPath, newDirName);
      return result;
    },
  );
  ipcMain.handle(
    'copyDirectoryPromise',
    async (event, param, newDirPath, withProgress) => {
      if (withProgress) {
        progress['copyDirectoryPromise'] = newProgress(
          'moveDirectoryPromise',
          param.total,
        );
        const result = await copyDirectoryPromise(
          param,
          newDirPath,
          getOnProgress('copyDirectoryPromise', progress),
        );
        return result;
      } else {
        const result = await copyDirectoryPromise(param, newDirPath);
        return result;
      }
    },
  );
  ipcMain.handle('uploadAbort', async (event, path) => {
    if (path && progress[path] && progress[path].abort) {
      progress[path].abort();
    } else {
      // stop all
      Object.keys(progress).forEach((key) => {
        if (progress[key] && progress[key].abort) {
          progress[key].abort();
        }
      });
    }
    return true;
  });
  ipcMain.handle(
    'moveDirectoryPromise',
    async (event, param, newDirPath, withProgress) => {
      if (withProgress) {
        progress['moveDirectoryPromise'] = newProgress(
          'moveDirectoryPromise',
          param.total,
        );
        const result = await moveDirectoryPromise(
          param,
          newDirPath,
          getOnProgress('moveDirectoryPromise', progress),
        );
        return result;
      } else {
        const result = await moveDirectoryPromise(param, newDirPath);
        return result;
      }
    },
  );
  ipcMain.handle('loadTextFilePromise', async (event, path, isPreview) => {
    const result = await loadTextFilePromise(path, isPreview);
    return result;
  });
  ipcMain.handle('getFileContentPromise', async (event, filePath, type) => {
    const result = await getFileContentPromise(filePath, type);
    return result;
  });
  ipcMain.handle(
    'saveFilePromise',
    async (event, param, content, overwrite) => {
      const result = await saveFilePromise(param, content, overwrite);
      return result;
    },
  );
  ipcMain.handle(
    'saveTextFilePromise',
    async (event, param, content, overwrite) => {
      const result = await saveTextFilePromise(param, content, overwrite);
      return result;
    },
  );
  ipcMain.handle(
    'saveBinaryFilePromise',
    async (event, param, content, overwrite, withProgress) => {
      let onUploadProgress = undefined;
      if (withProgress) {
        progress['saveBinaryFilePromise'] = newProgress(
          'saveBinaryFilePromise',
          param.total,
        );
        onUploadProgress = getOnProgress('saveBinaryFilePromise', progress);
      }
      const result = await saveBinaryFilePromise(
        param,
        content,
        overwrite,
        onUploadProgress,
      ).then((succeeded) => {
        if (succeeded && onUploadProgress) {
          onUploadProgress({ key: param.path, loaded: 1, total: 1 }, undefined);
        }
        return succeeded;
      });
      return result;
    },
  );
  ipcMain.handle('deleteFilePromise', async (event, path, useTrash) => {
    if (useTrash) {
      let ret;
      try {
        ret = await shell.trashItem(path);
      } catch (err) {
        console.error('moveToTrash ' + path + 'error:', err);
        return false;
      }
      return ret;
    } else {
      const result = await deleteFilePromise(path);
      return result;
    }
  });
  ipcMain.handle('deleteDirectoryPromise', async (event, path, useTrash) => {
    if (useTrash) {
      let ret;
      try {
        ret = await shell.trashItem(path);
      } catch (err) {
        console.error('moveToTrash ' + path + 'error:', err);
      }
      return ret;
    } else {
      const result = await deleteDirectoryPromise(path);
      return result;
    }
  });
  ipcMain.on('openDirectory', async (event, dirPath) => {
    shell.showItemInFolder(dirPath);
  });
  ipcMain.on('openFile', async (event, filePath) => {
    shell
      .openPath(filePath)
      .then(() => {
        console.log('File successfully opened ' + filePath);
        return true;
      })
      .catch((e) => {
        console.log('Opening path ' + filePath + ' failed with ' + e);
      });
  });
  ipcMain.on('openUrl', async (event, url) => {
    await shell.openExternal(url);
  });
  ipcMain.handle('selectDirectoryDialog', async () => {
    const options = {
      properties: ['openDirectory', 'createDirectory'],
    };
    // @ts-ignore
    const resultObject = await dialog.showOpenDialog(options);

    if (resultObject.filePaths && resultObject.filePaths.length) {
      // alert(JSON.stringify(resultObject.filePaths));
      return resultObject.filePaths;
    }
    return false;
  });

  ipcMain.on('removeExtension', (e, extensionId) => {
    try {
      const extBuildIndex = extensionId.indexOf('/build');
      fs.rmSync(
        path.join(
          app.getPath('userData'),
          'tsplugins',
          extBuildIndex > -1
            ? extensionId.substring(0, extBuildIndex)
            : extensionId,
        ),
        {
          recursive: true,
        },
      );
    } catch (e) {
      console.debug(e);
    }
  });

  ipcMain.handle('getUserDataDir', () => {
    return app.getPath('userData');
  });

  ipcMain.handle('unZip', async (event, filePath, targetPath) => {
    try {
      const result = await unZip(filePath, targetPath);
      return result;
    } catch (ex) {
      return false;
    }
  });

  ipcMain.handle('getDirProperties', async (event, path) => {
    const result = await getDirProperties(path);
    return result;
  });
}
