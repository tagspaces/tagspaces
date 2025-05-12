import { defineConfig } from '@playwright/test';
import pwConfig from './playwright.config.common';

const isWin = /win32|mswin(?!ce)|mingw|bccwin|cygwin/i.test(process.platform);
//const isHeadlessMode = process.env.HEADLESS_MODE === 'true';

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
      grep: /\bweb\b/,
      use: {
        isElectron: false,
        isWeb: true,
        isUnitTest: false,
        isMinio: false,
        isS3: true,
        isWin,
      },
    },
    {
      name: 'web-minio',
      grep: /\bweb\b/,
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
