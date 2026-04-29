/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */

/**
 * electron-builder afterPack hook — replaces the bundled libffmpeg with
 * the clean variant Electron publishes alongside each release.
 *
 * Open codecs (VP8/9, AV1, Opus, Vorbis, FLAC, MP3, WAV, WebM) keep working.
 *
 * Activated by setting STRIP_PROPRIETARY_CODECS=1 in the environment when
 * running a `package-*` script.
 *
 * Usage in resources/builder.json:
 *   "afterPack": "scripts/swap-ffmpeg.js"
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const https = require('https');
const AdmZip = require('adm-zip');

// Map electron-builder Arch enum + platform string to Electron release naming.
function resolvePlatformArch(electronPlatformName, builderArch) {
  // builderArch is the value of app-builder-lib's Arch enum:
  //   0 ia32, 1 x64, 2 armv7l, 3 arm64, 4 universal
  const archMap = {
    0: 'ia32',
    1: 'x64',
    2: 'armv7l',
    3: 'arm64',
    4: 'universal',
  };
  const arch = archMap[builderArch] ?? 'x64';
  // Electron uses 'darwin' / 'win32' / 'linux' / 'mas' (mac app store).
  const platform =
    electronPlatformName === 'mas' ? 'mas' : electronPlatformName;
  return { platform, arch };
}

// Path to libffmpeg inside the packaged app, per platform.
function libffmpegTarget(appOutDir, electronPlatformName, productName) {
  if (electronPlatformName === 'darwin' || electronPlatformName === 'mas') {
    return path.join(
      appOutDir,
      `${productName}.app`,
      'Contents',
      'Frameworks',
      'Electron Framework.framework',
      'Versions',
      'A',
      'Libraries',
      'libffmpeg.dylib',
    );
  }
  if (electronPlatformName === 'win32') {
    return path.join(appOutDir, 'ffmpeg.dll');
  }
  // linux
  return path.join(appOutDir, 'libffmpeg.so');
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const get = (target) => {
      https
        .get(target, (res) => {
          if (
            res.statusCode &&
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            res.resume();
            get(res.headers.location);
            return;
          }
          if (res.statusCode !== 200) {
            reject(
              new Error(
                `Download failed: ${res.statusCode} ${res.statusMessage} for ${target}`,
              ),
            );
            return;
          }
          res.pipe(file);
          file.on('finish', () => file.close(() => resolve()));
        })
        .on('error', (err) => {
          fs.unlink(dest, () => reject(err));
        });
    };
    get(url);
  });
}

function getElectronVersion() {
  // Look up the version pinned in the root package.json devDependencies.
  // Prefer the value in release/app's `electronVersion` if electron-builder
  // resolves a different one via that field, but TagSpaces doesn't set it.
  const root = require(path.join(__dirname, '..', 'package.json'));
  const v = root.devDependencies?.electron || root.dependencies?.electron;
  if (!v)
    throw new Error('Cannot determine Electron version from package.json');
  // Strip leading ^ ~ etc.
  return v.replace(/^[^\d]*/, '');
}

module.exports = async function afterPack(context) {
  if (process.env.STRIP_PROPRIETARY_CODECS !== '1') {
    // No-op unless explicitly enabled. Keeps default builds untouched.
    return;
  }

  const { appOutDir, electronPlatformName, arch, packager } = context;
  const productName =
    packager?.appInfo?.productName ||
    packager?.config?.productName ||
    'TagSpaces';

  const electronVersion = getElectronVersion();
  const { platform, arch: electronArch } = resolvePlatformArch(
    electronPlatformName,
    arch,
  );

  const zipName = `ffmpeg-v${electronVersion}-${platform}-${electronArch}.zip`;
  const url = `https://github.com/electron/electron/releases/download/v${electronVersion}/${zipName}`;
  const cacheDir = path.join(__dirname, '..', '.cache', 'electron-ffmpeg');
  fs.mkdirSync(cacheDir, { recursive: true });
  const zipPath = path.join(cacheDir, zipName);

  if (!fs.existsSync(zipPath)) {
    console.log(`[swap-ffmpeg] Downloading ${url}`);
    await downloadFile(url, zipPath);
  } else {
    console.log(`[swap-ffmpeg] Using cached ${zipPath}`);
  }

  // The archive contains exactly one file: the libffmpeg shared library
  // for the target platform, named per OS convention.
  const libNameByPlatform = {
    darwin: 'libffmpeg.dylib',
    mas: 'libffmpeg.dylib',
    win32: 'ffmpeg.dll',
    linux: 'libffmpeg.so',
  };
  const libName = libNameByPlatform[electronPlatformName];
  if (!libName) {
    throw new Error(
      `[swap-ffmpeg] Unsupported electronPlatformName: ${electronPlatformName}`,
    );
  }

  const zip = new AdmZip(zipPath);
  const entry = zip.getEntries().find((e) => e.entryName.endsWith(libName));
  if (!entry) {
    throw new Error(
      `[swap-ffmpeg] ${libName} not found in ${zipName}. Archive contents: ${zip
        .getEntries()
        .map((e) => e.entryName)
        .join(', ')}`,
    );
  }

  const target = libffmpegTarget(appOutDir, electronPlatformName, productName);
  if (!fs.existsSync(target)) {
    throw new Error(
      `[swap-ffmpeg] Target not found at ${target}. Wrong productName or layout?`,
    );
  }

  const buf = entry.getData();
  fs.writeFileSync(target, buf);
  console.log(
    `[swap-ffmpeg] Replaced ${target} with patent-clean build (${buf.length} bytes)`,
  );
};
