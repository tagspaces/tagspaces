import { test as base, expect } from '@playwright/test';
import { runS3Server, startMinio, startWebServer } from '../setup-functions';
import { uploadTestDirectory } from '../s3rver/S3DataRefresh';
import { copyExtConfig, removeExtConfig } from './hook';
import pathLib from 'path';
import fse from 'fs-extra';

// Extend base test with a fixture for the S3 server
const test = base.extend({
  isWeb: [false, { option: true, scope: 'worker' }],
  isS3: [false, { option: true, scope: 'worker' }],
  isMinio: [false, { option: true, scope: 'worker' }],
  isWin: [false, { option: true, scope: 'worker' }],
  /* TODO
  // 1) Launch Electron once per test (or per worker if you prefer beforeAll)
  electronApp: async ({}, use) => {
    const app = await electron.launch({ args: ['.'] });
    await use(app);
    await app.close();
  },

  // 2) Override the default `page` to be the first Electron window
  page: async ({ electronApp }, use) => {
    const window = await electronApp.firstWindow();
    await use(window);
  },*/
  webServerPort: [
    async ({ isWeb, isS3 }, use, testInfo) => {
      if (isWeb) {
        await copyExtConfig({ isWeb, isS3 }, 'extconfig-s3-location.js');
        const { app, port, server } = await startWebServer();
        // make port and server available to tests
        await use(port);
        // teardown
        await new Promise((f) => server.close(f));
        //await removeExtConfig(isWeb);
        await copyExtConfig({ isWeb }, 'extconfig-default.js');
      } else {
        // If the test does not require the S3 server, just use a dummy value
        await use(null);
      }
    },
    { scope: 'worker', auto: true },
  ],
  s3Server: [
    async ({ isS3 }, use, testInfo) => {
      if (isS3) {
        //testInfo.title.includes('web')) {
        const s3Server = await runS3Server(`testdata-${testInfo.workerIndex}`);
        const src = pathLib.join(
          __dirname,
          '..',
          'testdata',
          'file-structure',
          'supported-filestypes',
        );
        await uploadTestDirectory(src);
        await use(s3Server);
        await s3Server.close();
        await fse.rm(
          pathLib.join(__dirname, '..', `testdata-${testInfo.workerIndex}`),
          {
            recursive: true,
            force: true,
            maxRetries: 5, // retry on EBUSY/EMFILE/ENFILE
            retryDelay: 100, // optional back‑off in ms
          },
        );
      } else {
        // If the test does not require the S3 server, just use a dummy value
        await use(null);
      }
    },
    { scope: 'worker', auto: true },
  ],
  minioServer: [
    async ({ isMinio, isWin, testDataDir }, use, testInfo) => {
      if (isMinio) {
        const minioProcess = await startMinio(
          isWin,
          `testdata-${testInfo.workerIndex}`,
        );
        await use(minioProcess);
        minioProcess.stdin.pause();
        minioProcess.kill();
      } else {
        // If the test does not require the S3 server, just use a dummy value
        await use(null);
      }
    },
    { scope: 'worker', auto: true },
  ],
  testDataDir: [
    async ({ isS3 }, use, testInfo) => {
      if (!isS3) {
        const src = pathLib.join(
          __dirname,
          '..',
          'testdata',
          'file-structure',
          'supported-filestypes',
        );

        const testdata = pathLib.join(
          __dirname,
          '..',
          `testdata-${testInfo.workerIndex}`,
        );
        const dst = pathLib.join(testdata, 'file-structure');
        let newPath = pathLib.join(dst, pathLib.basename(src));
        await fse.copy(src, newPath);

        await use(newPath);
        await fse.rm(testdata, {
          recursive: true,
          force: true,
          maxRetries: 5, // retry on EBUSY/EMFILE/ENFILE
          retryDelay: 100, // optional back‑off in ms
        });
      } else {
        await use(
          pathLib.join(
            __dirname,
            '..',
            `testdata-${testInfo.workerIndex}`,
            'file-structure',
            'supported-filestypes',
          ),
        );
      }
    },
    { scope: 'worker', auto: true },
  ],
});

const extendedExpect = expect.extend({
  /**
   * @param videoLocator: Locator
   * @param seeksTo: number
   * @param playsUntil: number
   * @returns {Promise<{pass: boolean, name: string, message: (function(): string)}>}
   */
  async toBeSeekableMediaElement(videoLocator, seeksTo, playsUntil) {
    let pass = true;

    let nextAssertionStep = '';
    const assertionName = 'toBeSeekableMediaElement';
    let resultMessage = () => `${assertionName}: Passed`;

    try {
      await extendedExpect(videoLocator).toBeVisible();

      const getDuration = () => {
        return videoLocator.evaluate((video) => {
          if (!(video instanceof HTMLMediaElement)) {
            throw new Error('Not a media element');
          }

          return video.duration;
        });
      };

      nextAssertionStep = 'Media should be long enough to seek and play';
      await extendedExpect
        .poll(getDuration)
        .toBeGreaterThanOrEqual(Math.max(seeksTo, playsUntil));

      nextAssertionStep = 'Should not have a loading error';
      await extendedExpect(videoLocator).toHaveJSProperty('error', null);

      nextAssertionStep = `Should seek to ${this.utils.printExpected(seeksTo)}`;
      /**
       *     video: HTMLMediaElement
       *     playsFrom: number
       */
      await videoLocator.evaluate((video, playsFrom) => {
        video.pause();
        video.currentTime = playsFrom;
      }, seeksTo);

      const getCurrentTime = () => {
        return videoLocator.evaluate((video) => {
          return video.currentTime;
        });
      };
      await extendedExpect.poll(getCurrentTime).toBeCloseTo(seeksTo);

      nextAssertionStep = `Should play until ${this.utils.printExpected(playsUntil)}`;
      await videoLocator.evaluate((video) => video.play());
      await extendedExpect.poll(getCurrentTime).toBeGreaterThan(playsUntil);
    } catch (error) {
      pass = false;
      resultMessage = () => error.toString();
    }

    return {
      pass,
      message: () =>
        `${assertionName}: ${nextAssertionStep}:\n  ${resultMessage()}`,
      name: assertionName,
    };
  },
});

module.exports = {
  test,
  expect: extendedExpect,
};
