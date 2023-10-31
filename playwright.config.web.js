import { defineConfig } from '@playwright/test';
import pwConfig from './playwright.config.common';
//const dotenv = require('dotenv');
//dotenv.config({ path: path.resolve(__dirname, 'tests', 'env', 'web.env') });

global.isWeb = true;
global.isWin = /win32|mswin(?!ce)|mingw|bccwin|cygwin/i.test(process.platform);
global.isHeadlessMode = process.env.HEADLESS_MODE === 'true';
global.isMinio = true;
global.isElectron = false;
global.isUnitTest = false;

const config = defineConfig({
  ...pwConfig,
  globalSetup: './tests/global-setup-web.js',
  globalTeardown: './tests/global-teardown-web.js',
});
export default config;
