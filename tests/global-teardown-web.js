import { stopWebServer } from './setup-functions';

module.exports = async function () {
  // await stopChromeDriver(global.chromeDriver);
  await stopWebServer(global.webserver);
  await global.S3instance.close();
  //stopMinio(global.minio);
};
