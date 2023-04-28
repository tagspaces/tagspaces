import { defineConfig } from '@playwright/test';
import pwConfig from './playwright.config.common';

global.isWeb = false;
global.isWin = /win32|mswin(?!ce)|mingw|bccwin|cygwin/i.test(process.platform);
global.isHeadlessMode = process.env.HEADLESS_MODE === 'true';
global.isMinio = true;
global.isElectron = true;
global.isUnitTest = false;

export default defineConfig({
  ...pwConfig,
  globalSetup: './tests/global-setup-minio.js',
  globalTeardown: './tests/global-teardown-minio.js'
});
