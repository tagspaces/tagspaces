const fs = require('fs-extra');
const pathLib = require('path');
const npm = require('npm');

function isInstalled(npmPackage) {
  // TODO check installed version
  try {
    const path = require.resolve('tagspaces-common-index');
    if (!fs.existsSync(pathLib.join(path, '..', 'node_modules'))) {
      return false;
    }
    const data = fs.readFileSync(path, 'utf8');
    return data.indexOf(npmPackage) !== -1; // fs.existsSync(path)
    // process.moduleLoadList.indexOf("NativeModule " + npmPackage) >= 0 ||
  } catch (e) {
    return false;
  }
}
if (process.env.PD_PLATFORM === 'node') {
  if (!isInstalled('tagspaces-common-node')) {
    npm.load(er => {
      if (er) {
        console.log('err:', er);
        return;
      }
      npm.commands.run(['postinstall-node'], err => {
        if (err) {
          console.log('err:', err);
        }
      });
      npm.on('log', message => {
        console.log('npm:' + message);
      });
    });
  }
} else if (process.env.PD_PLATFORM === 'web') {
  if (!isInstalled('tagspaces-common-aws')) {
    npm.load(er => {
      if (er) {
        console.log('err:', er);
        return;
      }
      npm.commands.run(['postinstall-web'], err => {
        if (err) {
          console.log('err:', err);
        }
      });
      npm.on('log', message => {
        console.log('npm:' + message);
      });
    });
  }
}
