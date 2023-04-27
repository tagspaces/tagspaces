const { defineConfig } = require('@playwright/test');
const path = require('path');

global.isWeb = false;
global.isWin = /win32|mswin(?!ce)|mingw|bccwin|cygwin/i.test(process.platform);
global.isHeadlessMode = process.env.HEADLESS_MODE === 'true';
global.isMinio = false;
global.isElectron = true;
global.isUnitTest = false;

const testDir = path.join(__dirname, 'tests', 'e2e');
const config = defineConfig({
  testDir: testDir,
  // Use the grep option to filter tests by title and file extension
  // grep: /.*\.pw\.js$/,
  testMatch: /.*\.pw\.e2e\.js/,
  // Set the timeout for each test
  timeout: 30000,
  // (3 hours) Maximum time in milliseconds the whole test suite can run. Useful on CI to prevent broken setup from running too long and wasting resources.
  globalTimeout: process.env.CI ? 3 * 60 * 60 * 1000 : undefined,
  ignoreSnapshots: !process.env.CI,
  retries: 3,
  // The maximum number of test failures for the whole test suite run. After reaching this number, testing will stop and exit with an error
  // maxFailures: 8, //process.env.CI ? 3 : 0,
  globalSetup: './tests/global-setup.js',
  globalTeardown: './tests/global-teardown.js',
  // 'github' for GitHub Actions CI to generate annotations, plus a concise 'dot'
  // default 'list' when running locally
  reporter: process.env.CI ? 'github' : 'list',
});

console.log('in playwright.config.ts, testDir is', testDir);

export default config;
