//const path = require('path');

// const testDir = path.join(__dirname, 'tests', 'e2e');
const pwConfig = {
  testDir: './tests/e2e', //testDir,
  // Use the grep option to filter tests by title and file extension
  // grep: /.*\.pw\.js$/,
  testMatch: /.*\.pw\.e2e\.js/,
  // Set the timeout for each test
  timeout: process.env.CI ? 120000 : 300000,
  // (2 hours) Maximum time in milliseconds the whole test suite can run. Useful on CI to prevent broken setup from running too long and wasting resources.
  globalTimeout: process.env.CI ? 2 * 60 * 60 * 1000 : undefined,
  ignoreSnapshots: !process.env.CI,
  retries: process.env.CI ? 3 : 0,
  // The maximum number of test failures for the whole test suite run. After reaching this number, testing will stop and exit with an error
  maxFailures: 0, // process.env.CI ? 20 : 0,
  globalSetup: './tests/global-setup.js',
  globalTeardown: './tests/global-teardown.js',
  /*use: {
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    trace: 'retain-on-failure',
    // Record trace only when retrying a test for the first time.
    // trace: 'on-first-retry',
    // Record video only when retrying a test for the first time.
    // video: 'on-first-retry'
  },*/
  // 'github' for GitHub Actions CI to generate annotations, plus a concise 'dot'
  // default 'list' when running locally
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github'], ['list', { printSteps: true }]]
    : [
        ['html', { open: 'never' }],
        ['list', { printSteps: true }],
      ],
  workers: 1,
};

export default pwConfig;
