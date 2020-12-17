import { globalSetup } from './setup-functions';

module.exports = async function() {
  await globalSetup();

  // copy extconfig
  const fse = require('fs-extra');
  const path = require('path');

  let srcDir = path.join(__dirname, '..', 'scripts', 'extconfig.js');
  let destDir = path.join(__dirname, '..', 'app', 'extconfig.js');

  fse.copySync(srcDir, destDir);
};
