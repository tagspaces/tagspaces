/**
 * https://jestjs.io/docs/configuration#globalsetup-string
 * Note: Any global variables that are defined through globalSetup can only be read in globalTeardown. You cannot retrieve globals defined here in your test suites.
 */
module.exports = async function() {
  // await globalSetup();

  // copy extconfig
  const fse = require('fs-extra');
  const path = require('path');

  let srcDir = path.join(
    __dirname,
    '..',
    'scripts',
    'extconfig-with-welcome.js'
  );
  let destDir = path.join(__dirname, '..', 'app', 'extconfig.js');

  fse.copySync(srcDir, destDir);
};
