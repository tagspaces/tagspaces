import { defineConfig, devices } from '@playwright/test';
import pwConfig from './playwright.config.common';

const isWin = /win32|mswin(?!ce)|mingw|bccwin|cygwin/i.test(process.platform);
//const isHeadlessMode = process.env.HEADLESS_MODE === 'true';

function projectTagGrep(name) {
  //name = 'TST08';
  //return new RegExp(`${name}.*`);
  // \b ensures we match whole words (so “web” doesn’t match “webhook”)
  return new RegExp(`\\[.*\\b${name}\\b.*\\]`);
  //return new RegExp('TST0812');
}

export default defineConfig({
  ...pwConfig,
  projects: [
    {
      name: 'electron-light',
      grep: new RegExp('^(?!.*\\b_pro\\b).*\\belectron\\b.*'),
      use: {
        isElectron: true,
        isWin,
      },
    },
    {
      name: 'electron',
      grep: projectTagGrep('electron'),
      use: {
        isElectron: true,
        isWin,
      },
    },
    {
      name: 'electron-s3',
      grep: projectTagGrep('minio'),
      use: {
        isElectron: true,
        isS3: true,
        isWin,
      },
    },
    {
      name: 'electron-minio',
      grep: projectTagGrep('minio'),
      use: {
        isElectron: true,
        isMinio: true,
        isWin,
      },
    },
    {
      name: 'web-s3',
      grep: projectTagGrep('web'),
      use: {
        isWeb: true,
        isS3: true,
        isWin,
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'web-minio',
      grep: projectTagGrep('web'),
      use: {
        isWeb: true,
        isMinio: true,
        isWin,
      },
    },
  ],
});
