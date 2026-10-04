import {
  app,
  dialog,
  globalShortcut,
  ipcMain,
  net,
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
import { Readable } from 'stream';
import {
  getOnProgress,
  isWorkerAvailable,
  newProgress,
  ollamaDeleteRequest,
  ollamaGetRequest,
  ollamaPostRequest,
  postRequest,
} from './util';
import { readMacOSTags } from './macUserTags';
import os from 'os';
import registerSecureStorageEvents from './secureStorage';

//let watcher: FSWatcher;
const progress = {};

// A desktop-Chrome User-Agent so remote servers treat our downloads like a
// regular browser request. Many sites reject the default Electron/Node agent
// (403 "non-browser host"), which is why direct downloads previously failed.
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function browserHeaders(url: string): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': BROWSER_USER_AGENT,
    Accept: '*/*',
  };
  try {
    headers.Referer = new URL(url).origin;
  } catch (e) {
    // invalid URL — net.fetch will reject below
  }
  return headers;
}

// Only allow http/https downloads. Without this, net.fetch would also resolve
// file:// (local file read) and other schemes — an SSRF / local-file-read risk,
// especially since image URLs are taken from fetched (untrusted) page content.
function isHttpUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch (e) {
    return false;
  }
}
const controllers = new Map(); // requestId -> AbortController

function isSafePath(filePath) {
  if (typeof filePath !== 'string') return false;
  return true;
}

export default function loadMainEvents() {
  registerSecureStorageEvents();

  ipcMain.on('reloadWindow', () => {
    const mainWindow = BrowserWindow.getAllWindows();
    if (mainWindow.length > 0) {
      mainWindow.map((window) => window.reload());
    }
  });

  ipcMain.handle('fetchTile', async (_event, url: string) => {
    const response = await net.fetch(url, {
      headers: { Referer: 'https://tagspaces.org' },
    });
    if (!response.ok) {
      throw new Error(
        `Tile fetch failed: ${response.status} ${response.statusText}`,
      );
    }
    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  });

  // Download a URL straight to disk (local locations). Uses Electron's net.fetch
  // (Chromium network stack — shares session/cookies, follows redirects, honors
  // proxy/gzip, and is not bound by the renderer's CSP or the server's CORS) with
  // browser-like headers so servers don't block us as a non-browser host.
  ipcMain.handle('fetchUrl', async (_event, url, targetPath, withProgress) => {
    if (!isHttpUrl(url)) {
      return { error: 'Unsupported URL scheme (only http/https allowed)' };
    }
    try {
      const response = await net.fetch(url, { headers: browserHeaders(url) });
      if (!response.ok) {
        return { error: `${response.status} ${response.statusText}` };
      }
      const contentType = response.headers.get('content-type') || '';
      const totalSize = parseInt(
        response.headers.get('content-length') || '',
        10,
      );

      let onUploadProgress;
      if (withProgress) {
        progress['fetchUrl'] = newProgress('fetchUrl', totalSize);
        onUploadProgress = getOnProgress('fetchUrl', progress);
      }

      await new Promise<void>((resolve, reject) => {
        const fileStream = fs.createWriteStream(targetPath);
        const nodeStream = Readable.fromWeb(response.body as any);
        let downloadedSize = 0;
        nodeStream.on('data', (chunk) => {
          downloadedSize += chunk.length;
          if (onUploadProgress) {
            onUploadProgress(
              { key: targetPath, loaded: downloadedSize, total: totalSize },
              undefined,
            );
          }
        });
        nodeStream.on('error', reject);
        fileStream.on('error', reject);
        fileStream.on('finish', resolve);
        nodeStream.pipe(fileStream);
      });

      if (onUploadProgress) {
        onUploadProgress({ key: targetPath, loaded: 1, total: 1 }, undefined);
      }
      return { success: true, filePath: targetPath, contentType };
    } catch (error) {
      return { error: error.message };
    }
  });

  // Cheaply probe a URL's Content-Type (used to recognize PDFs/images served
  // from extension-less URLs, e.g. arxiv.org/pdf/...). Reads only the response
  // headers and cancels the body so the file isn't downloaded.
  ipcMain.handle('probeContentType', async (_event, url) => {
    if (!isHttpUrl(url)) {
      return { error: 'Unsupported URL scheme (only http/https allowed)' };
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await net.fetch(url, {
        headers: browserHeaders(url),
        signal: controller.signal,
      });
      const contentType = response.headers.get('content-type') || '';
      try {
        await response.body?.cancel();
      } catch (e) {
        // ignore — we already have the header we need
      }
      return { contentType };
    } catch (error) {
      return { error: error.message };
    } finally {
      clearTimeout(timer);
    }
  });

  // Fetch a URL and return its bytes (object-store locations + image inlining for
  // the HTML/Markdown "save as" formats). Same browser-stack request as fetchUrl.
  // `options` lets callers harden untrusted sub-resource fetches (page images):
  //   omitCredentials — don't send the app session's cookies to the target
  //   maxBytes        — reject oversized responses (memory/disk DoS guard)
  //   timeoutMs       — abort hung requests
  ipcMain.handle('fetchUrlBuffer', async (_event, url, options = {}) => {
    if (!isHttpUrl(url)) {
      return { error: 'Unsupported URL scheme (only http/https allowed)' };
    }
    const { omitCredentials, maxBytes, timeoutMs } = options;
    const controller = new AbortController();
    const timer = timeoutMs
      ? setTimeout(() => controller.abort(), timeoutMs)
      : undefined;
    try {
      const response = await net.fetch(url, {
        headers: browserHeaders(url),
        credentials: omitCredentials ? 'omit' : undefined,
        signal: controller.signal,
      });
      if (!response.ok) {
        return { error: `${response.status} ${response.statusText}` };
      }
      if (maxBytes) {
        const declared = parseInt(
          response.headers.get('content-length') || '',
          10,
        );
        if (Number.isFinite(declared) && declared > maxBytes) {
          return { error: 'Response too large' };
        }
      }
      const contentType = response.headers.get('content-type') || '';
      const data = await response.arrayBuffer();
      if (maxBytes && data.byteLength > maxBytes) {
        return { error: 'Response too large' };
      }
      return { data, contentType };
    } catch (error) {
      return { error: error.message };
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
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
    const paths: string[] = Array.isArray(filePath) ? filePath : [filePath];
    // Electron's Item requires `file`; `files` (when set) overrides it for the
    // multi-file case.
    event.sender.startDrag({
      file: paths[0],
      ...(paths.length > 1 && { files: paths }),
      icon,
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
    try {
      return await loadTextFilePromise(path, isPreview);
    } catch (err: any) {
      // ENOENT is an expected outcome when loading optional sidecar metadata
      // (e.g. .ts/<name>.json, tsft.jsonl). Surface as undefined to the
      // renderer — the caller's .then(undefined) is the same as a missing
      // file — and skip Electron's default "Error occurred in handler" log.
      if (err && err.code === 'ENOENT') {
        return undefined;
      }
      throw err;
    }
  });
  ipcMain.handle('getFileContentPromise', async (event, filePath, type) => {
    try {
      return await getFileContentPromise(filePath, type);
    } catch (err: any) {
      if (err && err.code === 'ENOENT') {
        return undefined;
      }
      throw err;
    }
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
      // Windows' shell.trashItem throws "Failed to parse path" for paths
      // that no longer exist (orphan/meta cleanup races, or an `undefined`
      // path segment), whereas macOS silently tolerates them. Treat a
      // missing target as already-deleted instead of reporting a false
      // "delete failed" that makes the renderer's optimistic UI lie.
      if (!(await fs.pathExists(path))) {
        return true;
      }
      try {
        await shell.trashItem(path);
        return true;
      } catch (err) {
        console.error('moveToTrash ' + path + ' error:', err);
        // Propagate (don't return false, don't silently permanent-delete):
        // the user asked for a recoverable trash, so escalating to a hard
        // delete behind their back is data loss. Rejecting lets the
        // renderer suppress the optimistic removal and notify. See CLAUDE.md
        // "Never swallow IO errors".
        throw err;
      }
    } else {
      const result = await deleteFilePromise(path);
      return result;
    }
  });
  ipcMain.handle('deleteDirectoryPromise', async (event, path, useTrash) => {
    if (useTrash && !path.startsWith('\\')) {
      // network drive
      if (!(await fs.pathExists(path))) {
        return true;
      }
      try {
        await shell.trashItem(path);
        return true;
      } catch (err) {
        console.error('moveToTrash ' + path + ' error:', err);
        // Propagate rather than swallow or silently hard-delete — see the
        // deleteFilePromise handler above.
        throw err;
      }
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
    // Scheme allowlist: shell.openExternal hands the URL to the OS, which
    // means a malicious file:// or custom scheme (ms-msdt:, search-ms:, etc.)
    // could trigger arbitrary code execution. Only forward URLs whose scheme
    // is on the allowlist below. ts:// links are routed inside the renderer
    // and must never reach this handler.
    if (typeof url !== 'string' || url.length === 0) {
      console.warn('openUrl: ignored non-string url');
      return;
    }
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch (e) {
      console.warn('openUrl: ignored unparseable url:', url);
      return;
    }
    const allowed = new Set(['http:', 'https:', 'mailto:', 'tel:']);
    if (!allowed.has(parsed.protocol)) {
      console.warn(
        'openUrl: blocked scheme ' + parsed.protocol + ' for url: ' + url,
      );
      return;
    }
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
