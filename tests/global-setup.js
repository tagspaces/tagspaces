module.exports = async function (config) {
  // copy extconfig
  const fs = require('fs');
  const path = require('path');

  // console.log(JSON.stringify(config));
  let srcDir = path.join(
    __dirname,
    '..',
    'scripts',
    config.configFile.endsWith('playwright.config.web.js')
      ? 'extconfig-s3-location.js'
      : 'extconfig-with-welcome.js',
  );
  let destDir = path.join(
    __dirname,
    '..',
    config.configFile.endsWith('playwright.config.web.js')
      ? 'web'
      : 'release/app/dist/renderer',
    'extconfig.js',
  );
  try {
    fs.copyFileSync(srcDir, destDir);
  } catch (err) {
    console.error('Error copying file:', err);
  }
};
