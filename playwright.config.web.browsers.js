import { defineConfig, devices } from '@playwright/test';
import pwConfig from './playwright.config.common';

global.isWeb = true;
global.isWin = /win32|mswin(?!ce)|mingw|bccwin|cygwin/i.test(process.platform);
global.isHeadlessMode = process.env.HEADLESS_MODE === 'true';
global.isMinio = true;
global.isElectron = false;
global.isUnitTest = false;

export default defineConfig({
  ...pwConfig,
  globalSetup: './tests/global-setup-web.js',
  globalTeardown: './tests/global-teardown-web.js',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    /*{
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    },*/

    /* Test against branded browsers. */
    /*{
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge'
      }
    },*/
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
});
