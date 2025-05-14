import { defineConfig, devices } from '@playwright/test';
import pwConfig from './playwright.config.common';

const isWin = /win32|mswin(?!ce)|mingw|bccwin|cygwin/i.test(process.platform);
//const isHeadlessMode = process.env.HEADLESS_MODE === 'true';

function projectTagGrep(name) {
  // \b ensures we match whole words (so “web” doesn’t match “webhook”)
  return new RegExp(`\\[.*\\b${name}\\b.*\\]`);
  //return new RegExp('TST5706');
}

export default defineConfig({
  ...pwConfig,
  projects: [
    {
      name: 'electron',
      use: {
        isElectron: true,
        isWeb: false,
        isUnitTest: false,
        isMinio: false,
        isS3: false,
        isWin,
      },
    },
    {
      name: 'electron-s3',
      use: {
        isElectron: true,
        isWeb: false,
        isUnitTest: false,
        isMinio: false,
        isS3: true,
        isWin,
      },
    },
    {
      name: 'electron-minio',
      use: {
        isElectron: true,
        isWeb: false,
        isUnitTest: false,
        isMinio: true,
        isS3: false,
        isWin,
      },
    },
    {
      name: 'web-s3',
      grep: projectTagGrep('web'),
      use: {
        isElectron: false,
        isWeb: true,
        isUnitTest: false,
        isMinio: false,
        isS3: true,
        isWin,
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'web-minio',
      grep: projectTagGrep('web'),
      use: {
        isElectron: false,
        isWeb: true,
        isUnitTest: false,
        isMinio: true,
        isS3: false,
        isWin,
      },
    },
  ],
});
