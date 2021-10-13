#! /usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const npm = require('npm');
const pkg = require('../app/package.json');

let platform = 'node';

if (process.env.PD_PLATFORM) {
  platform = process.env.PD_PLATFORM;
}

function checkSharpPlatform(targetPlatform, arch) {
  const platformInstalled = require.resolve('../app/sharp');
  if (platformInstalled) {
    console.log(JSON.stringify(platformInstalled));
  }
  /* try {
    let shrapPath = require.resolve('sharp');
    shrapPath = path.join(
      shrapPath,
      '..',
      '..',
      'vendor',
      '8.11.3',
      'platform.json'
    );
    if (!fs.existsSync(shrapPath)) {
      return false;
    }
    const data = fs.readFileSync(shrapPath, 'utf8');
    return data === '"' + targetPlatform + '-' + arch + '"';
  } catch (e) {
    return false;
  } */
}

/* if (platform === 'node' && process.env.npm_config_platform && process.env.npm_config_arch) {
TODO check shrap platform installed
  // process.argv.push('--platform=' + process.env.TARGET_PLATFORM);
  // process.argv.push('--arch=' + process.env.TARGET_ARCH);
  if (
    !checkSharpPlatform(
      process.env.npm_config_platform,
      process.env.npm_config_arch
    )
  ) {
    fs.removeSync(path.join(__dirname, '..', 'app', 'node_modules'));
  }
} */

const dependencies = platform + 'Dependencies';
const dependenciesObj = pkg[dependencies];

if (dependenciesObj && Object.keys(dependenciesObj).length) {
  console.log('Installing dependencies for ' + platform);
  const npmArgs = [];
  let npmInstall = false;

  for (const dep in dependenciesObj) {
    // eslint-disable-next-line no-prototype-builtins
    if (dependenciesObj.hasOwnProperty(dep)) {
      npmArgs.push(dep.concat('@').concat(dependenciesObj[dep]));
      const packagePath = path.join(
        __dirname,
        '..',
        'app',
        'node_modules',
        dep
      );
      if (!fs.existsSync(packagePath)) {
        npmInstall = true;
      } else {
        const packageJson = require(path.join(packagePath, 'package.json'));
        const cleanVersion = dependenciesObj[dep].startsWith('^')
          ? dependenciesObj[dep].substr(1)
          : dependenciesObj[dep];
        if (
          packageJson.version !== cleanVersion &&
          !cleanVersion.endsWith('#main')
        ) {
          // TODO Temp fix tagspaces-extension is not npm package with version
          npmInstall = true;
        }
      }
    }
  }
  if (platform === 'web') {
    npmInstall = true;
    fs.removeSync(path.join(__dirname, '..', 'app', 'node_modules'));
  }
  // npmArgs.push('--no-save --force');
  if (npmInstall && npmArgs.length > 0) {
    npm.load(er => {
      if (er) {
        console.log('err:', er);
        return; // handlError(er)
      }
      npm.config.set('save', false);
      npm.config.set('package-lock', false);
      // npm.config.set('no-save', true);
      // npm.config.set('no-package-lock', true);
      npm.commands.install(npmArgs, (err, data) => {
        if (err) {
          console.log('err:', err);
        }
      });
      npm.on('log', message => {
        console.log('npm:' + message);
      });
    });
  } else {
    console.log(
      'Installing dependencies for ' + platform + ' are already installed.'
    );
  }
} else {
  console.log('No specific dependencies on this platform: ' + platform);
  // fs.removeSync(path.join(__dirname, '..', 'node_modules'));
  /* const dir = path.join(__dirname, 'node_modules');
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.log(err);
    }

    files.forEach(file => {
      if (file !== '@tagspaces') {
        const fileDir = path.join(dir, file);
        const isDir = fs.lstatSync(fileDir).isDirectory();
        if (isDir) {
          fs.rmdirSync(fileDir, { recursive: true });
          // fs.emptyDirSync(fileDir);
        } else {
          fs.unlinkSync(fileDir);
        }
      }
    });
  }); */
}
