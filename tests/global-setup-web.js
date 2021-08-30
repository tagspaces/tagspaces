import { startMinio, startWebServer } from './setup-functions';
import { removeExtConfig } from './e2e/hook';

module.exports = async function() {
  await removeExtConfig();

  global.webserver = await startWebServer();
  // global.chromeDriver = await startChromeDriver();
  global.minio = await startMinio();
};
