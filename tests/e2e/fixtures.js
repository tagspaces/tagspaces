import { test as base, expect } from '@playwright/test';
import { runS3Server, startMinio, startWebServer } from '../setup-functions';
import { uploadTestDirectory } from '../s3rver/S3DataRefresh';
import { removeExtConfig } from './hook';

// Extend base test with a fixture for the S3 server
const test = base.extend({
  webServer: async ({}, use) => {
    if (global.isWeb) {
      await removeExtConfig();
      const webserver = await startWebServer();
      await use(webserver);
    } else {
      // If the test does not require the S3 server, just use a dummy value
      await use(null);
    }
  },
  s3Server: async ({}, use, testInfo) => {
    if (global.isS3) {
      //testInfo.title.includes('web')) {
      const s3Server = await runS3Server();
      await uploadTestDirectory();
      await use(s3Server);
      //await s3Server.close();
    } else {
      // If the test does not require the S3 server, just use a dummy value
      await use(null);
    }
  },
  minioServer: async ({}, use, testInfo) => {
    if (global.isMinio) {
      const minioProcess = await startMinio();
      await use(minioProcess);
    } else {
      // If the test does not require the S3 server, just use a dummy value
      await use(null);
    }
  },
});

module.exports = {
  test,
  expect,
};
