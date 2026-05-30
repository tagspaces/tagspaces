// @ts-nocheck
/**
 * TagSpaces Capacitor IO implementation
 * Capacitor mobile build only;
 * Other builds (web/Electron) bundle this file too but never execute
 * it at runtime — usage is gated by `AppConfig.isCapacitor`.
 * Kept as untyped CJS for now; incremental TS typing can come later.
 */
const AppConfig = require('@tagspaces/tagspaces-common/AppConfig');
const { b64toBlob } = require('@tagspaces/tagspaces-common/misc');
const {
  extractParentDirectoryPath,
  cleanTrailingDirSeparator,
  extractFileName,
  extractFileExtension,
  getMetaFileLocationForDir,
  getThumbFileLocationForDirectory,
} = require('@tagspaces/tagspaces-common/paths');

// Capacitor imports
const { Capacitor } = require('@capacitor/core');
const { Filesystem, Directory, Encoding } = require('@capacitor/filesystem');
const { App } = require('@capacitor/app');
const { Device } = require('@capacitor/device');
const { Browser } = require('@capacitor/browser');
const { Share } = require('@capacitor/share');
const { SplashScreen } = require('@capacitor/splash-screen');

let FileOpener;
try {
  FileOpener = require('@capacitor-community/file-opener').FileOpener;
} catch (e) {
  console.warn('FileOpener plugin not available');
}

let BackgroundMode;
try {
  BackgroundMode =
    require('@anuradev/capacitor-background-mode').BackgroundMode;
} catch (e) {
  console.warn('BackgroundMode plugin not available');
}

let FilePicker;
try {
  FilePicker = require('@capawesome/capacitor-file-picker').FilePicker;
} catch (e) {
  console.warn('FilePicker plugin not available');
}

// Custom plugins registered in MainActivity
const { registerPlugin } = require('@capacitor/core');
const StoragePermission = registerPlugin('StoragePermission');
const IntentHandler = registerPlugin('IntentHandler');
// iOS-only: bridges FileManager.url(forUbiquityContainerIdentifier:) (see ICloudPlugin.swift)
const ICloud = registerPlugin('ICloud');

const appSettingFile = 'settings.json';
const appSettingTagsFile = 'settingsTags.json';

let urlFromIntent;
let loadedSettings;
let loadedSettingsTags;

// --- Platform helpers ---

/**
 * Determine the Capacitor Directory enum value and relative path from an absolute path.
 * On Android with MANAGE_EXTERNAL_STORAGE, we work with absolute paths via ExternalStorage.
 * On iOS, we work relative to the Documents directory.
 */
function resolveCapacitorPath(absolutePath) {
  const platform = Capacitor.getPlatform();
  let path = absolutePath;

  if (platform === 'ios') {
    // iCloud ubiquity-container paths live outside the app sandbox, so they
    // can't be addressed relative to Directory.Documents. They are passed as
    // raw absolute paths (containing "/Mobile Documents/"). @capacitor/filesystem
    // addresses raw paths when no `directory` is given, but resolves them with
    // URL(string:) — which returns nil for unencoded spaces. So build a
    // percent-encoded file:// URL here (slashes preserved, spaces → %20).
    if (path.startsWith('file://') || path.includes('/Mobile Documents/')) {
      const abs = path.startsWith('file://') ? path.substring(7) : path;
      const encoded = abs.split('/').map(encodeURIComponent).join('/');
      return { path: 'file://' + encoded, directory: undefined };
    }
    // iOS: paths are relative to Documents directory
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    // Root of Documents = empty string or just "/" → use "." for Capacitor
    if (!path || path === '') {
      path = '.';
    }
    return { path, directory: Directory.Documents };
  }

  // Android: use ExternalStorage for sdcard paths
  if (path.startsWith('sdcard/')) {
    path = path.substring(7); // Remove 'sdcard/' prefix
    if (!path || path === '') path = '.';
    return { path, directory: Directory.ExternalStorage };
  }
  if (path.startsWith('/sdcard/')) {
    path = path.substring(8);
    if (!path || path === '') path = '.';
    return { path, directory: Directory.ExternalStorage };
  }
  if (path.startsWith('/storage/emulated/0/')) {
    path = path.substring(20);
    if (!path || path === '') path = '.';
    return { path, directory: Directory.ExternalStorage };
  }
  if (path.startsWith('/')) {
    // Absolute path — use ExternalStorage with relative path
    // For paths outside /storage/emulated/0, this may need MANAGE_EXTERNAL_STORAGE
    path = path.substring(1);
    if (!path || path === '') path = '.';
    return { path, directory: Directory.ExternalStorage };
  }

  if (!path || path === '') path = '.';
  return { path, directory: Directory.ExternalStorage };
}

/**
 * Normalize a path for internal use (strip leading slash inconsistencies)
 */
function normalizePath(path) {
  if (!path) return path;
  // Remove double slashes
  return path.replace(/\/+/g, '/');
}

// --- Lifecycle ---

async function onDeviceReady() {
  console.log('Capacitor Device Ready: ' + Capacitor.getPlatform());

  // Configure status bar — ensure WebView does not render behind it
  try {
    const { StatusBar, Style } = require('@capacitor/status-bar');
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch (e) {
    console.warn('StatusBar setup failed:', e);
  }

  // Enable background mode
  if (BackgroundMode) {
    try {
      BackgroundMode.enable();
    } catch (e) {
      console.warn('BackgroundMode enable failed:', e);
    }
  }

  // Request storage permission on Android
  if (Capacitor.getPlatform() === 'android') {
    try {
      const { granted } = await StoragePermission.checkPermission();
      if (!granted) {
        console.log('Requesting MANAGE_EXTERNAL_STORAGE permission...');
        await StoragePermission.requestPermission();
      }
    } catch (e) {
      console.warn('StoragePermission check failed:', e);
    }
  }

  // Initialize file system and load settings
  getFileSystem();

  // iOS: hide splash screen after a delay
  if (Capacitor.getPlatform() === 'ios') {
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);
  }

  // Handle initial intent on Android
  if (Capacitor.getPlatform() === 'android') {
    try {
      const intent = await IntentHandler.getIntent();
      if (intent && intent.data) {
        console.debug('Received initial intent: ' + JSON.stringify(intent));
        urlFromIntent = intent.data;
      }
    } catch (e) {
      console.warn('IntentHandler.getIntent failed:', e);
    }

    // Listen for new intents
    IntentHandler.addListener('onIntent', (event) => {
      console.debug('Received new intent: ' + JSON.stringify(event));
      if (event.data) {
        const protocol = window.location.protocol;
        const host = '//' + window.location.host;
        const path = window.location.pathname;
        const newUrl =
          protocol +
          host +
          path +
          '?cmdopen=' +
          event.data.replace('file:///storage/emulated/0', 'file:///sdcard');
        window.location.replace(newUrl);
      }
    });
  }

  // Listen for app URL open events (iOS deep links)
  App.addListener('appUrlOpen', (event) => {
    console.debug('Received app URL open: ' + JSON.stringify(event));
    if (event.url) {
      urlFromIntent = event.url;
      const protocol = window.location.protocol;
      const host = '//' + window.location.host;
      const path = window.location.pathname;
      const newUrl =
        protocol +
        host +
        path +
        '?cmdopen=' +
        event.url.replace('file:///storage/emulated/0', 'file:///sdcard');
      window.location.replace(newUrl);
    }
  });

  // Listen for back button
  App.addListener('backButton', (event) => {
    onDeviceBackButton(event);
  });

  // Listen for resume
  App.addListener('resume', () => {
    onDeviceResume();
  });
}

function onDeviceBackButton(e) {
  // Send event to main app — prevent default handled by Capacitor
}

function handleOpenURL(url) {
  // iOS file open handler
}

function onDeviceResume() {
  // TODO: reload current dir after background operation
}

function onApplicationLoad() {
  // Widget action handler placeholder
}

// --- File System Initialization ---

function getFileSystem() {
  // Load settings on startup
  loadSettingsFile(appSettingFile, (settings) => {
    loadedSettings = settings;
    loadSettingsFile(appSettingTagsFile, (settingsTags) => {
      loadedSettingsTags = settingsTags;
    });
  });
  handleStartParameters();
}

function resolveFullPath(localURL) {
  // In Capacitor, paths are already resolved — return as-is
  return localURL;
}

function getAppStorageFileSystem() {
  // In Capacitor, app storage is accessed via Directory.Data
  return Directory.Data;
}

// --- Settings ---

function saveSettingsFile(fileName, data) {
  Filesystem.writeFile({
    path: fileName,
    data: typeof data === 'string' ? data : JSON.stringify(data),
    directory: Directory.Data,
    encoding: Encoding.UTF8,
  }).catch((error) => {
    console.error('Error saving settings file: ' + JSON.stringify(error));
  });
}

function loadSettingsFile(fileName, ready) {
  Filesystem.readFile({
    path: fileName,
    directory: Directory.Data,
    encoding: Encoding.UTF8,
  })
    .then((result) => {
      const content = result.data;
      ready(content && content.length > 0 ? content : null);
    })
    .catch((error) => {
      // File may not exist yet — that's ok
      console.log('Settings file not found: ' + fileName);
      ready(null);
    });
}

function saveSettings(settings) {
  saveSettingsFile(appSettingFile, settings);
}

function loadSettings() {
  return loadedSettings;
}

function loadSettingsTags() {
  return loadedSettingsTags;
}

// --- Platform API ---

function getDevicePaths() {
  let paths;
  if (Capacitor.getPlatform() === 'ios') {
    paths = {
      Documents: '/',
      // iCloud: will be available via Directory.Icloud if enabled
    };
  } else {
    paths = {
      Photos: 'sdcard/DCIM/',
      Pictures: 'sdcard/Pictures/',
      Download: 'sdcard/Download/',
      Music: 'sdcard/Music/',
      Movies: 'sdcard/Movies/',
      SDCard: 'sdcard/',
    };
  }
  return Promise.resolve(paths);
}

/**
 * Resolve the iCloud Drive ubiquity container's Documents path (iOS only).
 * Returns { available, containerPath, documentsPath }. `available` is false when
 * the user isn't signed into iCloud or has iCloud Drive disabled. documentsPath
 * is a raw absolute path (with literal spaces) suitable for use as a location
 * path; resolveCapacitorPath() encodes it at the plugin boundary.
 */
function getICloudContainer() {
  if (Capacitor.getPlatform() !== 'ios') {
    return Promise.resolve({ available: false });
  }
  return ICloud.getUbiquityContainer().catch((err) => {
    console.warn('getICloudContainer failed: ' + err);
    return { available: false };
  });
}

function handleStartParameters() {
  if (urlFromIntent !== undefined && urlFromIntent.length > 0) {
    console.log('Intent URL: ' + urlFromIntent);
  }
}

function quitApp() {
  App.exitApp();
}

function sendFile(filePath) {
  console.log('Sending file: ' + filePath);
  shareFiles([filePath]);
}

// --- Directory Operations ---

function getDirSystemPromise(dirPath) {
  const { path, directory } = resolveCapacitorPath(dirPath);
  return Filesystem.readdir({
    path: path,
    directory: directory,
  }).then((result) => result);
}

function listMetaDirectoryPromise(path) {
  const entries = [];
  const metaDirPath =
    cleanTrailingDirSeparator(path) +
    AppConfig.dirSeparator +
    AppConfig.metaFolder +
    AppConfig.dirSeparator;

  const { path: capPath, directory } = resolveCapacitorPath(metaDirPath);

  return Filesystem.readdir({
    path: capPath,
    directory: directory,
  })
    .then((result) => {
      if (result && result.files) {
        result.files.forEach((file) => {
          const entryPath = metaDirPath + file.name;
          const ee = {};
          ee.name = file.name;
          ee.path = entryPath;
          ee.isFile = file.type === 'file';
          entries.push(ee);
        });
      }
      return entries;
    })
    .catch((err) => {
      // Meta directory may not exist — that's normal
      return entries;
    });
}

/**
 * Creates a list containing the files and sub directories of a given directory
 */
function listDirectoryPromise(param, mode = ['extractThumbPath']) {
  let path;
  if (typeof param === 'object' && param !== null) {
    path = param.path;
  } else {
    path = param;
  }

  return new Promise(async (resolve, reject) => {
    console.time('listDirectoryPromise');
    const metaContent = mode.includes('extractThumbPath')
      ? await listMetaDirectoryPromise(path)
      : [];

    const enhancedEntries = [];
    const metaPromises = [];

    const { path: capPath, directory } = resolveCapacitorPath(path);

    try {
      const result = await Filesystem.readdir({
        path: capPath,
        directory: directory,
      });

      if (result && result.files) {
        for (const file of result.files) {
          const eentry = {};
          eentry.name = file.name;
          eentry.path = cleanTrailingDirSeparator(path) + '/' + file.name;
          eentry.tags = [];
          eentry.isFile = file.type === 'file';

          if (file.type === 'file') {
            eentry.size = file.size || 0;
            eentry.lmdt = file.mtime ? new Date(file.mtime).getTime() : 0;
          }

          if (mode.includes('extractThumbPath')) {
            if (!eentry.isFile) {
              // Read tsm.json from subfolders
              if (
                !eentry.path.includes(
                  AppConfig.dirSeparator + AppConfig.metaFolder,
                )
              ) {
                const folderMetaPath = getMetaFileLocationForDir(
                  eentry.path,
                  AppConfig.dirSeparator,
                );
                metaPromises.push(getEntryMeta(eentry, folderMetaPath));
              }
            } else {
              const metaFileAvailable = metaContent.find(
                (obj) => obj.name === file.name + AppConfig.metaFileExt,
              );
              if (metaFileAvailable && metaFileAvailable.path) {
                metaPromises.push(getEntryMeta(eentry, metaFileAvailable.path));
              }
            }
          }

          enhancedEntries.push(eentry);
        }
      }

      await Promise.all(metaPromises).catch(() => {});
      console.timeEnd('listDirectoryPromise');
      resolve(enhancedEntries);
    } catch (err) {
      console.error('Error in listDirectoryPromise:', err);
      reject(err);
    }
  });
}

function getEntryMeta(eentry, metaPath) {
  if (eentry.isFile) {
    return loadTextFilePromise(metaPath).then((result) => {
      try {
        eentry.meta = JSON.parse(result.trim());
      } catch (ex) {
        console.warn('Error getEntryMeta for ' + metaPath, ex);
      }
      return eentry;
    });
  }

  if (!eentry.path.endsWith(AppConfig.metaFolder + '/')) {
    return loadTextFilePromise(metaPath).then((result) => {
      try {
        eentry.meta = JSON.parse(result.trim());
      } catch (ex) {
        console.warn('Error getEntryMeta for ' + metaPath, ex);
      }
      return eentry;
    });
  }

  return Promise.resolve(eentry);
}

// --- File Properties ---

function getPropertiesPromise(param) {
  let path;
  if (typeof param === 'object' && param !== null) {
    path = param.path;
  } else {
    path = param;
  }

  const { path: capPath, directory } = resolveCapacitorPath(path);

  return Filesystem.stat({
    path: capPath,
    directory: directory,
  })
    .then((stat) => {
      return {
        path: path,
        size: stat.size || 0,
        lmdt: stat.mtime ? new Date(stat.mtime).getTime() : 0,
        isFile: stat.type === 'file',
        name: extractFileName(path, '/'),
      };
    })
    .catch((err) => {
      console.log('getPropertiesPromise: not exist ' + path, err);
      return false;
    });
}

// --- File Content ---

function loadTextFilePromise(param, isPreview = false) {
  return getFileContentPromise(param, 'text', isPreview);
}

function getFileContentPromise(param, type, isPreview) {
  let filePath;
  if (typeof param === 'object' && param !== null) {
    filePath = param.path;
  } else {
    filePath = param;
  }

  if (isPreview) {
    return Promise.resolve(
      'Previewing files is not supported on this platform',
    );
  }

  const { path: capPath, directory } = resolveCapacitorPath(filePath);

  if (type === 'text') {
    return Filesystem.readFile({
      path: capPath,
      directory: directory,
      encoding: Encoding.UTF8,
    }).then((result) => result.data);
  }

  // Binary: read as base64 and convert to ArrayBuffer
  return Filesystem.readFile({
    path: capPath,
    directory: directory,
  }).then((result) => {
    // result.data is base64 string
    const binaryString = atob(result.data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  });
}

// --- File Save ---

function saveFilePromise(param, content, overWrite, isRaw) {
  let filePath;
  if (typeof param === 'object' && param !== null) {
    filePath = param.path;
  } else {
    filePath = param;
  }

  filePath = normalizePath(filePath);
  console.log('Saving file: ' + filePath);

  return new Promise(async (resolve, reject) => {
    try {
      if (!overWrite) {
        const exist = await checkFileExist(filePath);
        if (exist) {
          reject('File already exists: ' + filePath);
          return;
        }
      }

      // Ensure parent directory exists
      const parentDir = extractParentDirectoryPath(filePath, '/');
      const { path: parentCapPath, directory: parentDirectory } =
        resolveCapacitorPath(parentDir);
      try {
        await Filesystem.mkdir({
          path: parentCapPath,
          directory: parentDirectory,
          recursive: true,
        });
      } catch (e) {
        // Directory may already exist — that's ok
      }

      const { path: capPath, directory } = resolveCapacitorPath(filePath);

      let data;
      let encoding;

      if (isRaw) {
        // Raw text content
        if (typeof content === 'string') {
          data = content;
          encoding = Encoding.UTF8;
        } else {
          // Blob or ArrayBuffer — convert to base64
          data = await blobToBase64(content);
          encoding = undefined;
        }
      } else if (
        typeof content === 'string' &&
        content.indexOf(';base64,') > 0
      ) {
        // Data URI with base64
        const contentArray = content.split(';base64,');
        data = contentArray.length > 1 ? contentArray[1] : contentArray[0];
        encoding = undefined; // base64 mode
      } else if (typeof content === 'string') {
        data = content;
        encoding = Encoding.UTF8;
      } else {
        // Blob or ArrayBuffer
        data = await blobToBase64(content);
        encoding = undefined;
      }

      const writeOptions = {
        path: capPath,
        data: data,
        directory: directory,
      };
      if (encoding) {
        writeOptions.encoding = encoding;
      }

      await Filesystem.writeFile(writeOptions);

      resolve({
        name: extractFileName(filePath, AppConfig.dirSeparator),
        isFile: true,
        path: filePath,
        extension: extractFileExtension(filePath, AppConfig.dirSeparator),
        size: 0,
        lmdt: new Date().getTime(),
        isNewFile: true,
        tags: [],
      });
    } catch (err) {
      reject('Error saving file: ' + filePath + ' ' + JSON.stringify(err));
    }
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    if (blob instanceof ArrayBuffer) {
      const bytes = new Uint8Array(blob);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      resolve(btoa(binary));
      return;
    }
    if (blob instanceof Blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
      return;
    }
    // Fallback: assume string
    resolve(btoa(blob));
  });
}

function saveTextFilePromise(param, content, overWrite) {
  console.log('Saving TEXT file: ' + param);
  return saveFilePromise(param, content, overWrite, true);
}

function saveBinaryFilePromise(param, content, overWrite) {
  console.log('Saving binary file: ' + param);
  return saveFilePromise(param, content, overWrite, false);
}

// --- Directory Creation ---

function createDirectoryPromise(param) {
  let path;
  if (typeof param === 'object' && param !== null) {
    path = param.path;
  } else {
    path = param;
  }

  console.log('Creating directory: ' + path);

  return new Promise(async (resolve, reject) => {
    try {
      const exist = await checkDirExist(path);
      if (exist) {
        reject('error createDirectory: ' + path + ' exist!');
        return;
      }

      const { path: capPath, directory } = resolveCapacitorPath(path);
      await Filesystem.mkdir({
        path: capPath,
        directory: directory,
        recursive: true,
      });
      resolve(path);
    } catch (err) {
      reject('Creating directory failed: ' + path + ' ' + JSON.stringify(err));
    }
  });
}

// --- Copy ---

function copyFilePromise(param, newFilePath, override = true) {
  let filePath;
  if (typeof param === 'object' && param !== null) {
    filePath = param.path;
  } else {
    filePath = param;
  }

  return new Promise(async (resolve, reject) => {
    try {
      if (!override) {
        const exist = await checkFileExist(newFilePath);
        if (exist) {
          reject('error copyFile: ' + newFilePath + ' exist!');
          return;
        }
      }

      // Ensure parent directory exists
      const parentDir = extractParentDirectoryPath(newFilePath, '/');
      const { path: parentCapPath, directory: parentDirectory } =
        resolveCapacitorPath(parentDir);
      try {
        await Filesystem.mkdir({
          path: parentCapPath,
          directory: parentDirectory,
          recursive: true,
        });
      } catch (e) {
        // May already exist
      }

      const { path: fromPath, directory: fromDir } =
        resolveCapacitorPath(filePath);
      const { path: toPath, directory: toDir } =
        resolveCapacitorPath(newFilePath);

      await Filesystem.copy({
        from: fromPath,
        to: toPath,
        directory: fromDir,
        toDirectory: toDir,
      });

      console.log('File copy: target: ' + newFilePath + ' source: ' + filePath);
      resolve(newFilePath);
    } catch (err) {
      reject('error copying: ' + filePath + ' ' + JSON.stringify(err));
    }
  });
}

// --- Rename ---

function renameFilePromise(param, newFilePath, onProgress = undefined) {
  let filePath;
  if (typeof param === 'object' && param !== null) {
    filePath = param.path;
  } else {
    filePath = param;
  }

  return new Promise(async (resolve, reject) => {
    try {
      const exist = await checkFileExist(newFilePath);
      if (exist) {
        reject('error renaming: ' + newFilePath + ' exist!');
        return;
      }

      const { path: fromPath, directory: fromDir } =
        resolveCapacitorPath(filePath);
      const { path: toPath, directory: toDir } =
        resolveCapacitorPath(newFilePath);

      await Filesystem.rename({
        from: fromPath,
        to: toPath,
        directory: fromDir,
        toDirectory: toDir,
      });

      console.log('File renamed to: ' + newFilePath + ' Old name: ' + filePath);
      resolve([filePath, newFilePath]);
    } catch (err) {
      reject('error renaming: ' + filePath + ' ' + JSON.stringify(err));
    }
  });
}

// --- Existence Checks ---

function checkFileExist(filePath) {
  const { path, directory } = resolveCapacitorPath(filePath);
  return Filesystem.stat({
    path: path,
    directory: directory,
  })
    .then((stat) => stat.type === 'file')
    .catch(() => false);
}

function checkDirExist(dirPath) {
  const { path, directory } = resolveCapacitorPath(dirPath);
  return Filesystem.stat({
    path: path,
    directory: directory,
  })
    .then((stat) => stat.type === 'directory')
    .catch(() => false);
}

// --- Directory Rename/Move/Copy ---

function renameDirectoryPromise(param, newDirName) {
  let path;
  if (typeof param === 'object' && param !== null) {
    path = param.path;
  } else {
    path = param;
  }
  const parentDir = extractParentDirectoryPath(path, '/');
  const newDirPath = parentDir + AppConfig.dirSeparator + newDirName;

  return copyDirectoryPromise(param, newDirPath)
    .then(() => deleteDirectoryPromise(param))
    .then(() => newDirPath);
}

function moveDirectoryPromise(param, newDirPath, onProgress = undefined) {
  let path;
  if (typeof param === 'object' && param !== null) {
    path = param.path;
  } else {
    path = param;
  }

  return new Promise(async (resolve, reject) => {
    try {
      const exist = await checkDirExist(newDirPath);
      if (exist) {
        reject('error renaming: ' + newDirPath + ' exist!');
        return;
      }

      const { path: fromPath, directory: fromDir } = resolveCapacitorPath(path);
      const { path: toPath, directory: toDir } =
        resolveCapacitorPath(newDirPath);

      await Filesystem.rename({
        from: fromPath,
        to: toPath,
        directory: fromDir,
        toDirectory: toDir,
      });

      if (onProgress) {
        const progress = {
          loaded: 1,
          total: 1,
          key: newDirPath,
        };
        onProgress(progress, () => {}, path);
      }

      resolve('/' + newDirPath);
    } catch (err) {
      reject('error moving directory: ' + path + ' ' + JSON.stringify(err));
    }
  });
}

function copyDirectoryPromise(param, targetDir, onProgress = undefined) {
  let sourceDir;
  if (typeof param === 'object' && param !== null) {
    sourceDir = param.path;
  } else {
    sourceDir = param;
  }

  return new Promise(async (resolve, reject) => {
    try {
      // Create target directory
      const normalizedTarget = normalizePath(targetDir);
      const { path: targetCapPath, directory: targetDirectory } =
        resolveCapacitorPath(normalizedTarget);
      await Filesystem.mkdir({
        path: targetCapPath,
        directory: targetDirectory,
        recursive: true,
      });

      // Read source directory
      const { path: sourceCapPath, directory: sourceDirectory } =
        resolveCapacitorPath(sourceDir);
      const result = await Filesystem.readdir({
        path: sourceCapPath,
        directory: sourceDirectory,
      });

      const entries = result.files || [];
      const fileCount = entries.length;
      let part = 0;
      let running = true;

      for (let i = 0; i < entries.length; i++) {
        if (running) {
          const entry = entries[i];
          const sourcePath = sourceDir + AppConfig.dirSeparator + entry.name;
          const targetPath =
            normalizedTarget + AppConfig.dirSeparator + entry.name;

          if (entry.type === 'directory') {
            await copyDirectoryPromise(sourcePath, targetPath);
          } else {
            await copyFilePromise(sourcePath, targetPath);
          }

          part += 1;
          if (onProgress && running) {
            const progress = {
              loaded: part,
              total: fileCount,
              key: normalizedTarget,
            };
            onProgress(
              progress,
              () => {
                running = false;
              },
              sourcePath,
            );
          }
        }
      }

      resolve(normalizedTarget);
    } catch (err) {
      reject(err);
    }
  });
}

// --- Delete ---

function deleteFilePromise(param) {
  let filePath;
  if (typeof param === 'object' && param !== null) {
    filePath = param.path;
  } else {
    filePath = param;
  }

  console.log('Deleting file: ' + filePath);
  const { path, directory } = resolveCapacitorPath(filePath);

  return Filesystem.deleteFile({
    path: path,
    directory: directory,
  }).then(() => filePath);
}

function deleteDirectoryPromise(param) {
  let path;
  if (typeof param === 'object' && param !== null) {
    path = param.path;
  } else {
    path = param;
  }

  console.log('Deleting directory: ' + path);
  const { path: capPath, directory } = resolveCapacitorPath(path);

  return Filesystem.rmdir({
    path: capPath,
    directory: directory,
    recursive: true,
  }).then(() => path);
}

// --- UI / Native Operations ---

function selectDirectory() {
  console.log('Open select directory dialog.');
}

function selectFile() {
  console.log('Operation selectFile not supported.');
}

function selectDirectoryDialog() {
  if (Capacitor.getPlatform() === 'ios') {
    console.log('Operation selectDirectoryDialog not supported on iOS.');
    return Promise.reject('Not supported on iOS');
  }

  if (FilePicker) {
    return FilePicker.pickDirectory().then((result) => {
      if (result && result.path) {
        let path = result.path;
        // Normalize the path for TagSpaces internal format
        path = path.replace('file:///storage/emulated/0', 'sdcard');
        path = path.replace('/storage/emulated/0', 'sdcard');
        return [path];
      }
      return Promise.reject('No folder selected');
    });
  }

  return Promise.reject('FilePicker plugin not available');
}

function openDirectory(dirPath) {
  console.warn('function openDirectory not supported on Capacitor mobile');
}

function openFile(filePath, fileMIMEType) {
  console.log('Opening natively: ' + filePath);

  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    openUrl(filePath);
    return;
  }

  if (FileOpener) {
    const fullPath = filePath.startsWith('file://')
      ? filePath
      : 'file://' + filePath;

    FileOpener.open({
      filePath: fullPath,
      contentType: fileMIMEType,
    }).catch((e) => {
      console.log('Error opening file: ' + e.message);
    });
  } else {
    console.warn('FileOpener plugin not available');
  }
}

function openUrl(url) {
  Browser.open({ url: url }).catch((e) => {
    // Fallback to anchor click
    const tmpLink = document.createElement('a');
    tmpLink.target = '_blank';
    tmpLink.href = url;
    tmpLink.rel = 'noopener noreferrer';
    document.body.appendChild(tmpLink);
    tmpLink.click();
    tmpLink.parentNode.removeChild(tmpLink);
  });
}

function focusWindow() {
  console.log('Focusing window is not implemented in Capacitor.');
}

function shareFiles(files) {
  Share.share({
    title: 'File sharing',
    files: files,
    dialogTitle: 'Pick an app',
  }).catch((err) => {
    console.log('Sharing failed: ' + err);
  });
}

// --- Auto-initialization ---
// In Capacitor, the native bridge is ready immediately when JS executes
// (unlike Cordova which requires waiting for the 'deviceready' event).
// Call onDeviceReady() automatically when this module is first loaded.
if (Capacitor.isNativePlatform()) {
  // Use setTimeout to ensure the module is fully loaded before init
  setTimeout(() => {
    onDeviceReady();
  }, 0);
}

// --- Exports (matching io-cordova.js interface exactly) ---

export {
  onDeviceReady,
  onDeviceBackButton,
  handleOpenURL,
  normalizePath,
  onDeviceResume,
  onApplicationLoad,
  getDirSystemPromise,
  resolveFullPath,
  getAppStorageFileSystem,
  getFileSystem,
  saveSettingsFile,
  loadSettingsFile,
  saveSettings,
  loadSettings,
  loadSettingsTags,
  sendFile,
  getDevicePaths,
  getICloudContainer,
  handleStartParameters,
  quitApp,
  listMetaDirectoryPromise,
  listDirectoryPromise,
  getEntryMeta,
  getPropertiesPromise,
  loadTextFilePromise,
  getFileContentPromise,
  saveFilePromise,
  saveTextFilePromise,
  saveBinaryFilePromise,
  createDirectoryPromise,
  copyFilePromise,
  renameFilePromise,
  checkFileExist,
  checkDirExist,
  renameDirectoryPromise,
  moveDirectoryPromise,
  copyDirectoryPromise,
  deleteFilePromise,
  deleteDirectoryPromise,
  selectDirectory,
  selectFile,
  selectDirectoryDialog,
  openDirectory,
  openFile,
  openUrl,
  focusWindow,
  shareFiles,
};
