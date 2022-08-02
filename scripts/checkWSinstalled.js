#! /usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const shell = require('shelljs');

function isInstalled(packageName) {
  try {
    require.resolve('../app/node_modules/' + packageName);
    return true;
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

/*function checkSharpPlatform(targetPlatform, arch) {
  if (!targetPlatform || !arch) {
    return true;
  }
  try {
    const sharp = require('../app/node_modules/sharp');
    const vendor = sharp.vendor;
    console.log('vendor: ' + vendor);

    return vendor.current === targetPlatform + '-' + arch;
  } catch (e) {
    console.log('checkSharpPlatform: ', e);
    return false;
  }
}*/

let platform = 'node';
let installCmd;
const dir = path.join(__dirname, '../app/node_modules');

if (process.env.PD_PLATFORM) {
  platform = process.env.PD_PLATFORM;
}

if (platform === 'node') {
  if (
    //!checkSharpPlatform(process.env.TARGET_PLATFORM, process.env.TARGET_ARCH) ||
    !dirExist(dir) ||
    !isInstalled('@tagspaces/tagspaces-ws')
  ) {
    installCmd = 'npm run-script install-ext-node';
  }
} else if (platform === 'web') {
  if (!dirExist(dir) || isInstalled('@tagspaces/tagspaces-ws')) {
    installCmd = 'npm run-script install-ext-web';
  }
}
if (installCmd) {
  if (shell.exec(installCmd).code !== 0) {
    shell.echo(
      'Error: Install ' + process.env.PD_PLATFORM + ' platform failed'
    );
    shell.exit(1);
  }
}
