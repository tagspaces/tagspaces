const fs = require('fs-extra');
const pathLib = require('path');
const shell = require('shelljs');
// const packageJson = require('../package.json');

/**
 * check only if index.js exist - TODO check installed version
 * TODO rethink to replace this from @tagspaces/dynamic-packages-loading
 * @param npmPackage
 * @returns {boolean}
 */
/*function isInstalled(npmPackage) {
  try {
    const path = require.resolve('@tagspaces/tagspaces-platforms');
    if (
      !fs.existsSync(path) // || !fs.existsSync(pathLib.join(path, '..', 'node_modules'))
    ) {
      return false;
    }
    const data = fs.readFileSync(path, 'utf8');
    return data.indexOf(npmPackage) !== -1; // fs.existsSync(path)
    // process.moduleLoadList.indexOf("NativeModule " + npmPackage) >= 0 ||
  } catch (e) {
    return false;
  }
}*/

function isInstalled(npmPackage) {
  try {
    // const path = require.resolve(npmPackage);
    const pkg = pathLib.join(__dirname, '..', 'node_modules', npmPackage);
    return fs.existsSync(pkg);
  } catch (e) {
    return false;
  }
}

if (!process.env.PD_PLATFORM) {
  console.log('PD_PLATFORM environment variable is not set');
  shell.exit(1);
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
} else if (process.env.PD_PLATFORM === 'aws') {
  if (
    !isInstalled('@tagspaces/tagspaces-common-aws') ||
    isInstalled('@tagspaces/tagspaces-common-node') ||
    isInstalled('@tagspaces/tagspaces-common-web')
  ) {
    install = true;
  }
} else if (process.env.PD_PLATFORM === 'web') {
  if (
    !isInstalled('@tagspaces/tagspaces-common-web') ||
    isInstalled('@tagspaces/tagspaces-common-node')
  ) {
    install = true;
  }
} else if (process.env.PD_PLATFORM === 'webdav') {
  if (!isInstalled('@tagspaces/tagspaces-common-webdav')) {
    install = true;
  }
} else if (process.env.PD_PLATFORM === 'cordova') {
  if (!isInstalled('@tagspaces/tagspaces-common-cordova')) {
    install = true;
  }
}
shell.exec('npm -v');

/**
 * If the installed tagspaces-platforms changed (with deleted node_modules) npm install will not update it -> change version or delete the tagspaces-platforms folder
 * @type {string}
 */

if (install) {
  const cmd =
    'npm run-script --prefix ./node_modules/@tagspaces/tagspaces-platforms install';
  // 'npm install @tagspaces/tagspaces-platforms@' + // --force --foreground-scripts
  /*stripFromStart(
      packageJson.dependencies['@tagspaces/tagspaces-platforms'],
      '^'
    );*/
  if (!fs.existsSync('./node_modules/@tagspaces/tagspaces-platforms')) {
    shell.exec('npm install');
  }
  if (shell.exec(cmd).code !== 0) {
    shell.echo(
      'Error: Install ' + process.env.PD_PLATFORM + ' platform failed'
    );
    shell.exit(1);
  }
  // fix: npm postinstall and install scripts not runs automatically after 'npm install' with npm v8
  // if (process.platform === 'win32') {
  const projectDir = pathLib.join(__dirname, '..');
  const platformDir = pathLib.join(
    projectDir,
    'node_modules',
    '@tagspaces',
    'tagspaces-platforms'
  );
  const cmd2 =
    'npx @tagspaces/dynamic-packages-loading ' +
    platformDir +
    ' -p ' +
    process.env.PD_PLATFORM +
    ' --prefix=' +
    projectDir;
  //
  if (shell.exec(cmd2).code !== 0) {
    shell.echo('Error: PostInstall ' + process.env.PD_PLATFORM + ' platform');
    shell.exit(1);
  }
  // }
}

/*function stripFromStart(input, character) {
  if (input.startsWith(character)) {
    return input.substr(character.length);
  }
  return input;
}*/

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
