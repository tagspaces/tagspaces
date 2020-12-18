import pathLib from 'path';
import {
  globalSetup,
  startChromeDriver,
  startMinio,
  startWebServer
} from './setup-functions';

module.exports = async function() {
  await globalSetup();

  const fse = require('fs-extra');
  fse.removeSync(pathLib.join(__dirname, '..', 'app', 'extconfig.js'));

  global.webserver = await startWebServer();
  global.chromeDriver = await startChromeDriver();
  global.minio = await startMinio();
};
