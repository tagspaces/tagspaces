#! /usr/bin/env node
/**
 * @deprecated (replaced by @tagspaces/dynamic-packages-loading)
 * write the package.json file from package-template.json
 */
/*const fs = require('fs-extra');
const path = require('path');
const pkg = require('../app/package.json');
const pkgTemplate = require('../app/package-template.json');

let platform = 'node';

if (process.env.PD_PLATFORM) {
  platform = process.env.PD_PLATFORM;
}

if (process.env.TARGET_PLATFORM && process.env.TARGET_ARCH) {
  process.argv.push('--platform=' + process.env.TARGET_PLATFORM);
  process.argv.push('--arch=' + process.env.TARGET_ARCH);
}

const dep = platform + 'Dependencies';

const dependencies = pkgTemplate[dep];

if (dependencies && Object.keys(dependencies).length) {
  console.log('Installing dependencies for ' + platform);
  fs.writeFileSync(
    'package.json',
    JSON.stringify({ ...pkg, dependencies }, null, 2),
  );
} else {
  console.log('No specific dependencies on this platform: ' + platform);
  fs.removeSync(path.join(__dirname, '..', 'app', 'node_modules'));
}*/
