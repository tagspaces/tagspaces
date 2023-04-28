import { defineConfig } from '@playwright/test';
import pwConfig from './playwright.config.common';

global.isWeb = false;
global.isWin = /win32|mswin(?!ce)|mingw|bccwin|cygwin/i.test(process.platform);
global.isHeadlessMode = process.env.HEADLESS_MODE === 'true';
global.isMinio = false;
global.isElectron = true;
global.isUnitTest = false;

const config = defineConfig(pwConfig);

export default config;
