#! /usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const childProcess = require('child_process');
const packageJson = require('../release/app/package.json');

function isInstalled(packageName, checkVersion = undefined) {
  try {
    const packageVersions =
      packageName + (checkVersion ? '@' + checkVersion : '');
    const versions = childProcess
      .execSync(
        'npm list --depth=0 --prefix ' + path.join(__dirname, '../release/app'),
      )
      .toString();
    if (versions.indexOf(packageVersions) > 0) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

function dirExist(dir) {
  try {
    fs.statSync(dir);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
  }
  return false;
}

let platform = 'node';
let installCmd;
const dir = path.join(__dirname, '../release/app/node_modules');

if (process.env.PD_PLATFORM) {
  platform = process.env.PD_PLATFORM;
}

if (platform === 'node') {
  if (
    //!checkSharpPlatform(process.env.TARGET_PLATFORM, process.env.TARGET_ARCH) ||
    !dirExist(dir) ||
    !isInstalled(
      '@tagspaces/extensions',
      packageJson.dependencies['@tagspaces/extensions'],
    ) ||
    !isInstalled(
      '@tagspaces/tagspaces-ws',
      packageJson.dependencies['@tagspaces/tagspaces-ws'],
    ) ||
    !isInstalled('wasm-vips', packageJson.dependencies['wasm-vips'])
  ) {
    installCmd = 'npm run-script install-ext-node';
  }
} else if (platform === 'web') {
  if (
    !dirExist(dir) ||
    !isInstalled(
      '@tagspaces/extensions',
      packageJson.dependencies['@tagspaces/extensions'],
    ) ||
    isInstalled('@tagspaces/tagspaces-ws')
  ) {
    installCmd = 'npm run-script install-ext-web';
  }
}
if (installCmd) {
  console.log(childProcess.execSync(installCmd).toString());
}
