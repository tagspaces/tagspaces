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
import http from 'http';
import https from 'https';
import path from 'path';
import WebSocket from 'ws';
import {
  getOnProgress,
  isWorkerAvailable,
  newProgress,
  ollamaDeleteRequest,
  ollamaGetRequest,
  ollamaPostRequest,
  postRequest,
  readMacOSTags,
} from './util';
import os from 'os';

//let watcher: FSWatcher;
const progress = {};
let wsc;
const controllers = new Map(); // requestId -> AbortController

function isSafePath(filePath) {
  if (typeof filePath !== 'string') return false;
  return true;
}

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
  ipcMain.handle('fetchUrl', async (event, url, targetPath, withProgress) => {
    function fetchHttp(url) {
      return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;

        client
          .get(url, (res) => {
            let downloadedSize = 0;
            const totalSize = parseInt(res.headers['content-length'], 10);

            let onUploadProgress = undefined;
            if (withProgress) {
              progress['fetchUrl'] = newProgress('fetchUrl', totalSize);
              onUploadProgress = getOnProgress('fetchUrl', progress);
            }

            const fileStream = fs.createWriteStream(targetPath); // Write file to disk
            // Pipe the response data into the file
            res.pipe(fileStream);

            // Collect data chunks and calculate size
            res.on('data', (chunk) => {
              downloadedSize += chunk.length; // Add the size of the current chunk
              if (onUploadProgress) {
                onUploadProgress(
                  { key: targetPath, loaded: downloadedSize, total: totalSize },
                  undefined,
                );
              }
            });

            // Resolve the response on end
            res.on('end', () => {
              if (onUploadProgress) {
                onUploadProgress(
                  { key: targetPath, loaded: 1, total: 1 },
                  undefined,
                );
              }
              resolve({ success: true, filePath: targetPath });
            });
          })
          .on('error', (err) => {
            reject(err);
          });
      });
    }

    try {
      const response = await fetchHttp(url);
      return response;
    } catch (error) {
      return { error: error.message };
    }
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
    if (!isSafePath(filename)) {
      throw new Error('Invalid filename');
    }
    return await readMacOSTags(filename);
  });
  ipcMain.on('ondragstart', (event, filePath) => {
    // https://www.electronjs.org/docs/latest/api/web-contents#contentsstartdragitem

    const dragIconBase64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABGCAYAAABxLuKEAAAACXBIWXMAACsPAAArDwFlCXzZAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAA3hJREFUeJztm8+LVlUYxz+PjdaULkQkQWRIGBrcDNoipIJCxYVBu9noX6DSRglTpJWCQa4qajEkGLlwL4gWRCOFOJIgpFBiObVIKVr4C3zn2+JOMF3Pw3vuzD33Pdn5wNmc+9xzvu+Xc8597nnPNUkUHmfJoAXkSjHGoRjjUIxxGOqiEzNbAzzfUX8PgBlJfy2qFUlJCrAU2AfcANRxmQW+A95csP5EpjwLfDUAQ0LlaE7GTGZgyPyys+lvsLYTPDMbBa6R18L+M/CCGvzYFOJ3JGp3MYwA401uSPGUGHHqLwB/JOivzigwFqgfAb6PbSSFMUud+lNUQzo12wkbs6xJI7kN+WwoxjgUYxyKMQ6NF18zWwtsBX6TdK59SXkQPWLMbNjMPgZuAieAtxJpyoKoEWNmy4AzwOtJ1WRE7Ih5h/+RKRBhjJk9BbzdgZasiBkxLwKrUwvJjZg15ndgIlD/Y8tasqKvMZLuAKc70JIVJcFzKMY49J1KZrYSeClwaUbStfYl5UHM4jsOhFL/j4C97crJhzKVHIoxDsUYh2KMQ8zi+wtwLFD/bctasiIm870BHOhAS1aUqeRQjHGIyXyHgBWBSw8l3WtfUh7EjJhXqf5arZf3E+oaOGUqORRjHIoxDsUYh5jM90/gfKD+estasiIm870CbOtAS1aUqeSQ4kSVdwBwDFieoL863lG32SaNpDDmtlM/6G1QT1eQmFeCl4EvApc+l/ReoP6bJgI64h5wqckNMSNmGFgfqF/lxH8NXAY2NRGSmE+avte1vvhKmgV2UT3mc2AaONz0piRPJUk/AJsZ7C7fLNUBpzcWsguQ7DMZSdfN7BWqKbUZWJOyv3k8oNqO/VLSgs8Vxwh9RHha3O9349zZ/em58p+i9Y8snhRK5utQjHEoxjjEZL6jwJHApbOSJufFPQ2cDMT9JOndWpsfAOvqgZImanG7CZ8W3SfpVj/tiyLiM761hD+n+7AW95wTdzHQ5tVQbCDus0BcD1iZ4pPF+aXvVJL0K1WKnwtTkpJn1bFrzEH87YQu6QGHuugoyhhJZ4H9DNacHrBH0lQXnUU/lSQdB7ZQvT33kil6nB7VnvNrkj7tqtMFZb5mthx4Zu4M8D91S4CNgfC79UOMZraBajvjX0iarsWtnru/87+CyyuBQ0nwHIoxDsUYh2KMw9+ZHv8EJjGI7wAAAABJRU5ErkJggg==';
    const icon = nativeImage.createFromDataURL(dragIconBase64);
    event.sender.startDrag({
      file: filePath,
      icon: icon,
    });
  });
  ipcMain.handle('postRequest', async (event, payload, endpoint, requestId) => {
    let controller;
    if (requestId) {
      controller = new AbortController();
      controllers.set(requestId, controller);
    }
    try {
      const result = await postRequest(payload, endpoint, controller?.signal);
      return result;
    } catch (err) {
      console.error('postRequest error:', err);
      if (
        err &&
        (err.name === 'AbortError' ||
          err.message === 'Request aborted by signal')
      ) {
        return { error: 'AbortError' };
      }
      return false;
    } finally {
      // ensure controller cleaned up no matter what
      if (requestId) controllers.delete(requestId);
    }
  });
  // listen for cancel requests from renderer
  ipcMain.on('cancelRequest', (event, requestId) => {
    const controller = controllers.get(requestId);
    if (controller) {
      controller.abort();
      controllers.delete(requestId);
    }
  });
  ipcMain.handle(
    'listDirectoryPromise',
    async (event, path, mode, ignorePatterns) => {
      const result = await listDirectoryPromise(path, mode, ignorePatterns);
      return result;
    },
  );
  ipcMain.handle('listMetaDirectoryPromise', async (event, path) => {
    const result = await listMetaDirectoryPromise(path);
    return result;
  });
  ipcMain.handle('getPropertiesPromise', async (event, path, extractLinks) => {
    const result = await getPropertiesPromise({ path, extractLinks });
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

  ipcMain.handle('getOllamaModels', async (event, ollamaApiUrl) => {
    console.log('Currently Ollama main thread deactivated!');
    /*try {
      const apiResponse = await ollamaGetRequest('/api/tags', ollamaApiUrl);
      return (apiResponse as ApiResponse).models;
    } catch (e) {
      return undefined;
    }*/
  });
  ipcMain.handle('newOllamaMessage', async (event, ollamaApiUrl, msg) => {
    console.log('Currently Ollama main thread deactivated!');
    /*const apiResponse = await ollamaPostRequest(
      JSON.stringify(msg),
      '/api/chat',
      ollamaApiUrl,
      (response) => {
        if (msg.stream) {
          const mainWindow = BrowserWindow.getAllWindows(); //getFocusedWindow();
          if (mainWindow.length > 0) {
            mainWindow.map(
              (window) => window.webContents.send('ChatMessage', response), // Stream message to renderer process
            );
          }
        }
      },
    );
    return apiResponse;*/
  });
  ipcMain.handle('pullOllamaModel', async (event, ollamaApiUrl, msg) => {
    console.log('Currently Ollama main thread deactivated!');
    /*let lastPercents = 0;
    const apiResponse = await ollamaPostRequest(
      JSON.stringify(msg),
      '/api/pull',
      ollamaApiUrl,
      (response) => {
        if (response.completed && response.total) {
          const percents = Math.floor(
            (response.completed / response.total) * 100,
          );
          if (percents !== lastPercents) {
            lastPercents = percents;
            const mainWindow = BrowserWindow.getAllWindows(); //getFocusedWindow();
            if (mainWindow.length > 0) {
              mainWindow.map(
                (window) =>
                  window.webContents.send('PullModel', {
                    ...response,
                    model: msg.name,
                  }), // Stream message to renderer process
              );
            }
          }
        }
      },
    );
    return apiResponse;*/
  });
  ipcMain.handle('deleteOllamaModel', async (event, ollamaApiUrl, msg) => {
    console.log('Currently Ollama main thread deactivated!');
    /*const apiResponse = await ollamaDeleteRequest(
      JSON.stringify(msg),
      '/api/delete',
      ollamaApiUrl,
      (response) => {
        const mainWindow = BrowserWindow.getAllWindows(); //getFocusedWindow();
        if (mainWindow.length > 0) {
          mainWindow.map(
            (window) => window.webContents.send('ChatMessage', response, false), // Stream message to renderer process
          );
        }
      },
    );
    return apiResponse;*/
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
    async (event, filePath, newFilePath, withProgress, force) => {
      let result;
      if (withProgress) {
        progress['renameFilePromise'] = newProgress('renameFilePromise', 1);
        result = await renameFilePromise(
          filePath,
          newFilePath,
          getOnProgress('renameFilePromise', progress),
          force,
        );
      } else {
        result = await renameFilePromise(
          filePath,
          newFilePath,
          undefined,
          force,
        );
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
    if (useTrash && !path.startsWith('\\')) {
      try {
        await shell.trashItem(path);
        return true;
      } catch (err) {
        console.error('moveToTrash ' + path + 'error:', err);
        return false;
      }
    } else {
      const result = await deleteFilePromise(path);
      return result;
    }
  });
  ipcMain.handle('deleteDirectoryPromise', async (event, path, useTrash) => {
    if (useTrash && !path.startsWith('\\')) {
      // network drive
      try {
        await shell.trashItem(path);
      } catch (err) {
        console.error('moveToTrash ' + path + 'error:', err);
        return false;
      }
      return true;
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
    try {
      const result = await getDirProperties(path);
      return result; // renderer.invoke() resolves with this
    } catch (err) {
      console.error('Error in getDirProperties:', err);
      throw {
        message: `Failed to getDirProperties "${path}"`,
        code: err.code || 'UNKNOWN',
        stack: err.stack,
      };
    }
  });

  ipcMain.on('getAuthor', (event) => {
    try {
      event.returnValue = os.userInfo().username ?? '';
    } catch {
      event.returnValue = process.env.USER ?? process.env.USERNAME ?? '';
    }
  });
}
