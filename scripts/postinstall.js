const fs = require('fs-extra');
const pathLib = require('path');
const shell = require('shelljs');
const packageJson = require('../package.json');

function isInstalled(npmPackage) {
  // TODO check installed version
  try {
    const path = require.resolve('@tagspaces/tagspaces-platforms');
    if (
      !fs.existsSync(path) ||
      !fs.existsSync(pathLib.join(path, '..', 'node_modules'))
    ) {
      return false;
    }
    const data = fs.readFileSync(path, 'utf8');
    return data.indexOf(npmPackage) !== -1; // fs.existsSync(path)
    // process.moduleLoadList.indexOf("NativeModule " + npmPackage) >= 0 ||
  } catch (e) {
    return false;
  }
}

let install = false;
if (process.env.PD_PLATFORM === 'electron') {
  if (!isInstalled('@tagspaces/tagspaces-common-electron')) {
    install = true;
  }
} else if (process.env.PD_PLATFORM === 'node') {
  if (
    !isInstalled('@tagspaces/tagspaces-common-node') ||
    isInstalled('@tagspaces/tagspaces-common-electron')
  ) {
    install = true;
  }
} else if (process.env.PD_PLATFORM === 'web') {
  if (!isInstalled('@tagspaces/tagspaces-common-aws')) {
    install = true;
  }
} else if (process.env.PD_PLATFORM === 'webdav') {
  if (!isInstalled('@tagspaces/tagspaces-common-webdav')) {
    install = true;
  }
} else if (process.env.PD_PLATFORM === 'cordova') {
  if (!isInstalled('@tagspaces-common-cordova')) {
    install = true;
  }
}

if (
  install &&
  shell.exec(
    'npm install @tagspaces/tagspaces-platforms@' +
      packageJson.dependencies['@tagspaces/tagspaces-platforms']
  ).code !== 0
) {
  shell.echo('Error: Install ' + process.env.PD_PLATFORM + ' platform failed');
  shell.exit(1);
}

/* if (process.env.PD_PLATFORM === 'electron') {
  if (!isInstalled('@tagspaces/tagspaces-common-electron')) {
    npm.load(er => {
      if (er) {
        console.log('err:', er);
        return;
      }
      npm.commands.run(['postinstall-electron'], err => {
        if (err) {
          console.log('err:', err);
        }
      });
      npm.on('log', message => {
        console.log('npm:' + message);
      });
    });
  }
} else if (process.env.PD_PLATFORM === 'node') {
  if (!isInstalled('@tagspaces/tagspaces-common-node') || isInstalled('@tagspaces/tagspaces-common-electron')) {
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
  if (!isInstalled('@tagspaces/tagspaces-common-aws')) {
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
} else if (process.env.PD_PLATFORM === 'cordova') {
  if (!isInstalled('@tagspaces-common-cordova')) {
    npm.load(er => {
      if (er) {
        console.log('err:', er);
        return;
      }
      npm.commands.run(['postinstall-cordova'], err => {
        if (err) {
          console.log('err:', err);
        }
      });
      npm.on('log', message => {
        console.log('npm:' + message);
      });
    });
  }
} */
