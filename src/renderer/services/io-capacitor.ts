/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
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
// Pure (native-free) helpers, separated so they can be unit-tested in Node.
const U = require('./capacitor-io-utils');
const { BACK_BUTTON_EVENT } = require('./mobileBackAction');

// Capacitor imports
const { Capacitor, CapacitorHttp } = require('@capacitor/core');
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

let FilePicker;
try {
  FilePicker = require('@capawesome/capacitor-file-picker').FilePicker;
} catch (e) {
  console.warn('FilePicker plugin not available');
}

let Camera, CameraResultType, CameraSource;
try {
  ({ Camera, CameraResultType, CameraSource } = require('@capacitor/camera'));
} catch (e) {
  console.warn('Camera plugin not available');
}

// Custom plugins registered in MainActivity
const { registerPlugin } = require('@capacitor/core');
const StoragePermission = registerPlugin('StoragePermission');
const IntentHandler = registerPlugin('IntentHandler');
// Android-only: foreground service that keeps WebView audio playing in the
// background (see MediaKeepAlivePlugin.java). On iOS background audio is handled
// by UIBackgroundModes "audio" in Info.plist.
const MediaKeepAlive = registerPlugin('MediaKeepAlive');
// iOS-only: bridges FileManager.url(forUbiquityContainerIdentifier:) (see ICloudPlugin.swift)
const ICloud = registerPlugin('ICloud');

const appSettingFile = 'settings.json';
const appSettingTagsFile = 'settingsTags.json';

let urlFromIntent;
let loadedSettings;
let loadedSettingsTags;

// --- Platform helpers ---

/**
 * Build a WebView-loadable URL (https://localhost/_capacitor_file_/… on Android,
 * capacitor://… on iOS) for a location-relative path. Asks the Filesystem plugin
 * for the exact native uri (so the iOS App Documents location, whose path is "/",
 * resolves to the real Documents directory rather than the non-existent device
 * root) and converts it for the WebView. Async because getUri is async; used by
 * thumbnail URL resolution.
 */
function getNativeFileUrlAsync(path) {
  if (!path) return Promise.resolve('');
  if (!Capacitor || !Capacitor.convertFileSrc) return Promise.resolve(path);

  const { path: rel, directory } = resolveCapacitorPath(path);

  // iCloud / raw absolute paths already resolved to an encoded file:// path.
  if (!directory) {
    const abs = rel.startsWith('file://') ? rel.substring(7) : rel;
    return Promise.resolve(Capacitor.convertFileSrc('file://' + abs));
  }

  return Filesystem.getUri({ directory, path: !rel || rel === '.' ? '' : rel })
    .then(({ uri }) => Capacitor.convertFileSrc(uri))
    .catch(() => {
      // getUri failed — best-effort: treat the path as absolute (works on
      // Android via the /sdcard symlink).
      const filePath = path.startsWith('/') ? path : '/' + path;
      return Capacitor.convertFileSrc('file://' + filePath);
    });
}

/**
 * Determine the Capacitor Directory enum value and relative path from an absolute
 * path. Thin wrapper around the pure helper (unit-tested in capacitor-io-utils),
 * injecting the runtime platform + Directory enum.
 */
function resolveCapacitorPath(absolutePath) {
  return U.resolveCapacitorPath(
    absolutePath,
    Capacitor.getPlatform(),
    Directory,
  );
}

/**
 * Normalize a path for internal use (strip leading slash inconsistencies)
 */
function normalizePath(path) {
  return U.normalizePath(path);
}

// --- Lifecycle ---

// Configure the status bar so the WebView does not render behind it.
//
// setOverlaysWebView({overlay:false}) is iOS-only here: on iOS re-asserting it
// forces the native side to re-inset and resize the WebView to full height —
// used to recover from iOS leaving the WebView ~status-bar-height short after
// exiting element fullscreen. On Android it is a no-op under the enforced
// edge-to-edge of Android 15+ and internally calls the deprecated
// setSystemUiVisibility / setStatusBarColor APIs (which trip Google Play's
// "deprecated APIs for edge-to-edge" check); MainActivity.insetWebViewFromSystemBars()
// already handles the insets natively there, so we skip it on Android.
// setStyle() uses the non-deprecated WindowInsetsControllerCompat and stays on
// both platforms to keep the status-bar icons light on our dark bar.
async function setupStatusBar() {
  try {
    const { StatusBar, Style } = require('@capacitor/status-bar');
    if (AppConfig.isCapacitoriOS) {
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
    await StatusBar.setStyle({ style: Style.Dark });
  } catch (e) {
    console.warn('StatusBar setup failed:', e);
  }
}

// Last known-good top safe-area inset (notch height, px), captured while the
// WebView reports it correctly, so we can restore it after the iOS bug below.
let lastGoodSafeAreaTop = 0;

// Measure the live env(safe-area-inset-top) in px via a hidden probe element.
function readSafeAreaInsetTop() {
  try {
    const probe = document.createElement('div');
    probe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:env(safe-area-inset-top);' +
      'visibility:hidden;pointer-events:none;';
    document.body.appendChild(probe);
    const h = probe.getBoundingClientRect().height;
    probe.remove();
    return h;
  } catch (e) {
    return 0;
  }
}

// Remember the inset while it is valid so we can restore it later (iOS only).
function captureSafeAreaInset() {
  if (Capacitor.getPlatform() !== 'ios') {
    return;
  }
  const top = readSafeAreaInsetTop();
  if (top > 0) {
    lastGoodSafeAreaTop = top;
  }
}

// iOS only. WKWebView reports env(safe-area-inset-*) as 0 after the Capacitor
// in-app browser (SFSafariViewController) is dismissed, which collapses the
// body's safe-area padding (see index.html) so the top toolbar slides under the
// notch. Recovery is two-pronged: (1) toggle `viewport-fit` to nudge WebKit
// into recomputing env(), then (2) if it is still collapsed, deterministically
// write the cached inset into the --sat CSS variable that index.html's body
// padding (and the drawer / fullScreen dialogs) read.
function forceSafeAreaRecalc() {
  try {
    if (Capacitor.getPlatform() !== 'ios') {
      return;
    }
    const vp = document.querySelector('meta[name="viewport"]');
    const content = vp ? vp.getAttribute('content') || '' : '';
    if (vp && content.indexOf('viewport-fit=cover') !== -1) {
      // Drop `cover` + force a synchronous reflow so WebKit discards the cached
      // (collapsed) insets, then restore `cover` next frame to recompute env().
      vp.setAttribute(
        'content',
        content.replace('viewport-fit=cover', 'viewport-fit=contain'),
      );
      void document.body.offsetHeight;
      requestAnimationFrame(() => {
        vp.setAttribute('content', content);
        void document.body.offsetHeight;
      });
    }
    // After the nudge, verify the inset recovered; if not, restore it from the
    // cached value so the top UI stays clear of the notch regardless.
    requestAnimationFrame(() => {
      const top = readSafeAreaInsetTop();
      if (top > 0) {
        lastGoodSafeAreaTop = top;
        document.documentElement.style.removeProperty('--sat');
      } else if (lastGoodSafeAreaTop > 0) {
        document.documentElement.style.setProperty(
          '--sat',
          lastGoodSafeAreaTop + 'px',
        );
      }
    });
  } catch (e) {
    console.warn('forceSafeAreaRecalc failed:', e);
  }
}

async function onDeviceReady() {
  console.log('Capacitor Device Ready: ' + Capacitor.getPlatform());

  // Configure status bar — ensure WebView does not render behind it
  await setupStatusBar();

  // Cache the notch inset once layout has settled, so we can restore it after
  // the iOS in-app browser collapses env(safe-area-inset-top) on return.
  setTimeout(captureSafeAreaInset, 1000);

  // Keep WebView audio playing while the app is backgrounded. Android starts a
  // mediaPlayback foreground service; iOS relies on UIBackgroundModes "audio".
  if (Capacitor.getPlatform() === 'android') {
    try {
      await MediaKeepAlive.enable();
    } catch (e) {
      console.warn('MediaKeepAlive enable failed:', e);
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

  // Refresh Pro entitlement cache from the store (StoreKit / Play Billing).
  // Fire-and-forget: rest of bootstrap doesn't depend on it. If the
  // entitlement state changes (fresh install with prior purchase, refund
  // processed since last launch) the service triggers a reload so the
  // Pro gate at src/renderer/pro/index.ts re-evaluates.
  void import('-/services/iap').then(({ initializeIap }) => initializeIap());

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

  // iOS: closing the in-app browser (SFSafariViewController) collapses
  // env(safe-area-inset-top), pushing the UI under the notch. Recompute the
  // safe area on return — immediately and again once the dismissal animation
  // has settled (an early-only pass can run while env() is still collapsed).
  Browser.addListener('browserFinished', () => {
    forceSafeAreaRecalc();
    setTimeout(forceSafeAreaRecalc, 350);
  });
}

function onDeviceBackButton(e) {
  // Registering any backButton listener disables Capacitor's default
  // behavior, so this must dispatch to the app or back is a dead button.
  // e.canGoBack refers to WebView history — irrelevant for this SPA.
  // Handled by useMobileBackHandler (mounted in MainPage).
  window.dispatchEvent(new CustomEvent(BACK_BUTTON_EVENT));
}

function handleOpenURL(url) {
  // iOS file open handler
}

function onDeviceResume() {
  // Returning from the background can also leave iOS env(safe-area-inset-top)
  // collapsed (same WKWebView bug as the in-app browser), so recompute the
  // safe area here too. No-op on Android.
  forceSafeAreaRecalc();
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
  return Promise.resolve(U.getDevicePathsForPlatform(Capacitor.getPlatform()));
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
          const ee = {};
          ee.name = file.name;
          // Return the bare filename in `path` to match the Electron/Node
          // listMetaDirectoryPromise contract. Renderer consumers compare with
          // `relativeThumb/MetaPath.endsWith(metaFile.path)` — a full path like
          // "/.ts/<name>" is longer than the relative path and never matches,
          // which silently broke file thumbnails (folder thumbs have separate
          // logic). Callers that need to read the file rebuild the full path.
          ee.path = file.name;
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

          // Attach a WebView-loadable URL from the real native uri returned by
          // readdir. Location-relative paths (e.g. the iOS App Documents
          // location stores path "/") can't be turned into a file:// URL by
          // string manipulation alone — the plugin already resolved the
          // absolute sandbox path, so use it directly.
          if (file.uri && Capacitor.convertFileSrc) {
            eentry.url = Capacitor.convertFileSrc(file.uri);
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
              if (metaFileAvailable) {
                // metaContent carries bare filenames in `path`, so rebuild the
                // full meta path (<dir>/.ts/<name>) for getEntryMeta to read.
                const metaDir =
                  cleanTrailingDirSeparator(path) +
                  AppConfig.dirSeparator +
                  AppConfig.metaFolder +
                  AppConfig.dirSeparator;
                metaPromises.push(
                  getEntryMeta(eentry, metaDir + metaFileAvailable.name),
                );
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
        // Real native uri (e.g. file:///var/mobile/.../Documents/IMG.jpeg) turned
        // into a WebView-loadable URL — used by the viewer for opened files.
        ...(stat.uri &&
          Capacitor.convertFileSrc && {
            url: Capacitor.convertFileSrc(stat.uri),
          }),
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

      // Decide how to write the content (text / extracted-base64 / binary). The
      // routing is unit-tested in capacitor-io-utils.classifyWriteContent; the
      // async base64 conversion stays here.
      const plan = U.classifyWriteContent(content, isRaw, Encoding);
      let data;
      let encoding;
      if (plan.mode === 'binary') {
        data = await blobToBase64(content);
        encoding = undefined;
      } else {
        data = plan.data;
        encoding = plan.encoding;
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
    // Handle ArrayBuffer and any TypedArray view (Uint8Array, etc.). The view
    // case is critical: base64ToUint8Array() returns a Uint8Array view, and
    // mishandling it writes "MCwxLDIs..." junk → zero-thumbnails. The encoding
    // logic lives in capacitor-io-utils.binaryToBase64 (unit-tested).
    if (blob instanceof ArrayBuffer || ArrayBuffer.isView(blob)) {
      resolve(U.binaryToBase64(blob));
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
        // Normalize the path for TagSpaces internal format.
        // Three shapes the picker can return depending on the device, the
        // Android version, and whether MANAGE_EXTERNAL_STORAGE is granted:
        //   1. file:///storage/emulated/0/<rel>        (older / with all-files perm)
        //   2. /storage/emulated/0/<rel>                (rare; absolute)
        //   3. content://com.android.externalstorage.documents/tree/<volume>%3A<rel>
        //      — SAF tree URI on Android 11+. `primary` = internal storage,
        //      anything else = removable SD card / OTG identified by volume UUID.
        path = path.replace('file:///storage/emulated/0', 'sdcard');
        path = path.replace('/storage/emulated/0', 'sdcard');
        const SAF_TREE_PREFIX =
          'content://com.android.externalstorage.documents/tree/';
        if (path.startsWith(SAF_TREE_PREFIX)) {
          const decoded = decodeURIComponent(
            path.slice(SAF_TREE_PREFIX.length),
          );
          // decoded shape: "primary:DCIM/foo" or "1234-5678:Photos"
          const colon = decoded.indexOf(':');
          if (colon > 0) {
            const volume = decoded.slice(0, colon);
            const rel = decoded.slice(colon + 1);
            path =
              volume === 'primary'
                ? 'sdcard' + (rel ? '/' + rel : '')
                : '/storage/' + volume + (rel ? '/' + rel : '');
          }
        }
        return [path];
      }
      return Promise.reject('No folder selected');
    });
  }

  return Promise.reject('FilePicker plugin not available');
}

/**
 * Open the native camera to take a photo. The system file chooser that backs
 * `<input type="file">` in the Capacitor WebView can't reach the camera as a
 * capture source, so this is the dedicated "take a picture" trigger the file
 * picker is missing. Returns a browser File (image/<format>) that the caller
 * feeds through the normal uploadFilesAPI pipeline — its isNativeMobile branch
 * tags the generic name with a capture timestamp so repeated shots don't
 * collide. Resolves null when the user cancels the camera.
 */
function takePicture() {
  if (!Camera) {
    return Promise.reject('Camera plugin not available');
  }
  return Camera.getPhoto({
    source: CameraSource.Camera,
    resultType: CameraResultType.DataUrl,
    quality: 90,
    saveToGallery: false,
    // A file manager wants the full frame — cropping is for avatar pickers.
    allowEditing: false,
  })
    .then((photo) => {
      if (!photo || !photo.dataUrl) {
        return null;
      }
      const format = photo.format || 'jpeg';
      // Let the WebView decode the data URL into bytes — fetch() handles
      // base64 natively, sidestepping the manual base64→Blob conversion.
      return fetch(photo.dataUrl)
        .then((res) => res.blob())
        .then(
          (blob) =>
            new File([blob], 'image.' + format, {
              type: blob.type || 'image/' + format,
            }),
        );
    })
    .catch((err) => {
      // The plugin throws "User cancelled photos app" when the camera is
      // dismissed — treat that as a no-op rather than surfacing an error.
      const msg = err && err.message ? err.message : String(err);
      if (msg.toLowerCase().includes('cancel')) {
        return null;
      }
      throw err;
    });
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

// Only allow http/https for native HTTP requests (defense-in-depth: reject
// file:/data:/other schemes before they reach the native plugin).
function isHttpUrl(url) {
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Fetch a remote URL over the native HTTP stack. WKWebView rejects cross-origin
 * fetch() from the capacitor:// origin with "Load failed"; CapacitorHttp runs
 * the request natively and isn't bound by CORS. Returns the body as a base64
 * string plus the content-type (the shape the native plugin yields for a binary
 * responseType), leaving byte/data-URL conversion to the caller.
 */
function httpGet(url) {
  if (!isHttpUrl(url)) {
    return Promise.reject(new Error('Unsupported URL scheme'));
  }
  return CapacitorHttp.request({
    url,
    method: 'GET',
    responseType: 'arraybuffer',
  }).then((res) => {
    if (res.status < 200 || res.status >= 300) {
      throw new Error('HTTP ' + res.status);
    }
    const contentType =
      (res.headers &&
        (res.headers['content-type'] || res.headers['Content-Type'])) ||
      '';
    // Native returns the binary body as a base64 string.
    const base64 = typeof res.data === 'string' ? res.data : '';
    return { base64, contentType };
  });
}

/**
 * Probe a URL's Content-Type via a native HEAD request (CORS-free). Used to
 * recognize PDFs/images served from extension-less URLs.
 */
function httpHead(url) {
  if (!isHttpUrl(url)) {
    return Promise.reject(new Error('Unsupported URL scheme'));
  }
  return CapacitorHttp.request({ url, method: 'HEAD' }).then((res) => {
    const headers = res.headers || {};
    return {
      contentType: headers['content-type'] || headers['Content-Type'] || '',
    };
  });
}

/**
 * Download a file under Capacitor. Replaces the Cordova-only
 * `window.plugins.Downloader`, which is undefined under Capacitor.
 *
 * Fetches the URL inside the WebView (handles blob:/data: object URLs used for
 * encrypted files, signed S3 URLs, and plain http(s)), then writes the bytes
 * via @capacitor/filesystem.
 *
 * - Android: saves directly to the public `Download/` folder.
 * - iOS: there is no public Downloads folder. We write the file to the app's
 *   Cache directory and present the native share sheet so the user can pick a
 *   destination ("Save to Files", AirDrop, etc.) instead of it disappearing
 *   into the sandboxed app folder.
 *
 * Resolves with the result path (and, on iOS, whether the share sheet was
 * shown), or rejects on a fetch/write failure so the caller can notify.
 */
function downloadFile(fileName, fileUrl) {
  const platform = Capacitor.getPlatform();

  return fetch(fileUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }
      return response.blob();
    })
    .then((blob) => blobToBase64(blob))
    .then((base64Data) => {
      if (platform === 'ios') {
        // Stage in the cache dir, then let the user choose where to save it.
        return Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
          recursive: true,
        }).then((result) =>
          Share.share({
            title: fileName,
            url: result.uri,
            dialogTitle: 'Save or share file',
          })
            .then(() => ({ path: result.uri, shared: true }))
            .catch((err) => {
              // User cancelling the share sheet rejects — treat as a no-op,
              // the file is still in the cache dir at result.uri.
              console.log('Share sheet dismissed: ' + err);
              return { path: result.uri, shared: false };
            }),
        );
      }
      // Android: write straight into the public Downloads folder.
      return Filesystem.writeFile({
        path: 'Download/' + fileName,
        data: base64Data,
        directory: Directory.ExternalStorage,
        recursive: true,
      }).then((result) => ({
        path: result.uri || 'Download/' + fileName,
        shared: false,
      }));
    })
    .then((result) => {
      console.log('File downloaded to: ' + result.path);
      return result;
    })
    .catch((err) => {
      console.error('Capacitor downloadFile failed: ' + err);
      throw err;
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
  checkDirExist,
  checkFileExist,
  copyDirectoryPromise,
  copyFilePromise,
  createDirectoryPromise,
  deleteDirectoryPromise,
  deleteFilePromise,
  downloadFile,
  focusWindow,
  getAppStorageFileSystem,
  getDevicePaths,
  getDirSystemPromise,
  getEntryMeta,
  getFileContentPromise,
  getFileSystem,
  getICloudContainer,
  getNativeFileUrlAsync,
  getPropertiesPromise,
  handleOpenURL,
  handleStartParameters,
  httpGet,
  httpHead,
  listDirectoryPromise,
  listMetaDirectoryPromise,
  loadSettings,
  loadSettingsFile,
  loadSettingsTags,
  loadTextFilePromise,
  moveDirectoryPromise,
  normalizePath,
  onApplicationLoad,
  onDeviceBackButton,
  onDeviceReady,
  onDeviceResume,
  openDirectory,
  openFile,
  openUrl,
  quitApp,
  renameDirectoryPromise,
  renameFilePromise,
  resolveFullPath,
  saveBinaryFilePromise,
  saveFilePromise,
  saveSettings,
  saveSettingsFile,
  saveTextFilePromise,
  selectDirectory,
  selectDirectoryDialog,
  selectFile,
  sendFile,
  setupStatusBar,
  shareFiles,
  takePicture,
};
