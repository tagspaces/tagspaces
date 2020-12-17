import { stopChromeDriver, stopMinio, stopWebServer } from './setup-functions';

module.exports = async function() {
  await stopChromeDriver(global.chromeDriver);
  await stopWebServer(global.webserver);

  stopMinio(global.minio);
};
