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
