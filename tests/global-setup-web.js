import { startWebServer, runS3Server } from './setup-functions';
import { refreshS3testData } from './s3rver/S3DataRefresh';
import { removeExtConfig } from './e2e/hook';

module.exports = async function () {
  await removeExtConfig();

  global.webserver = await startWebServer();
  // global.chromeDriver = await startChromeDriver();
  //global.minio = await startMinio();
  await runS3Server();
  await refreshS3testData();
};
