module.exports = async function() {
  async function stopWebServer(app) {
    await app.close();
  }

  async function stopMinio(process) {
    // Send SIGHUP to process.
    console.log('stopMinio');
    process.stdin.pause();
    process.kill(); //'SIGHUP');
  }

  async function stopChromeDriver(chromeDriver) {
    chromeDriver.stop();
    // Send SIGHUP to process.
    /*console.log('stopChromeDriver');
    process.stdin.pause();
    process.kill(); //'SIGHUP');*/
  }

  /*if (global.isWeb) {
    // await stopWebServer(global.webserver); TODO stop webserver
    await stopChromeDriver(global.chromeDriver);
  }
  if (global.isMinio) {
    await stopMinio(global.minio);
  } else {*/
  // cleanup extconfig
  const fse = require('fs-extra');
  const path = require('path');
  fse.removeSync(path.join(__dirname, '..', 'app', 'extconfig.js'));
  // }
};
