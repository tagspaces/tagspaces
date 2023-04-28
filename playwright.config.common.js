//const path = require('path');

// const testDir = path.join(__dirname, 'tests', 'e2e');
const pwConfig = {
  testDir: './tests/e2e', //testDir,
  // Use the grep option to filter tests by title and file extension
  // grep: /.*\.pw\.js$/,
  testMatch: /.*\.pw\.e2e\.js/,
  // Set the timeout for each test
  timeout: process.env.CI ? 60000 : 30000,
  // (3 hours) Maximum time in milliseconds the whole test suite can run. Useful on CI to prevent broken setup from running too long and wasting resources.
  globalTimeout: process.env.CI ? 3 * 60 * 60 * 1000 : undefined,
  ignoreSnapshots: !process.env.CI,
  retries: process.env.CI ? 3 : 1,
  // The maximum number of test failures for the whole test suite run. After reaching this number, testing will stop and exit with an error
  maxFailures: process.env.CI ? 8 : 0,
  globalSetup: './tests/global-setup.js',
  globalTeardown: './tests/global-teardown.js',
  // 'github' for GitHub Actions CI to generate annotations, plus a concise 'dot'
  // default 'list' when running locally
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [
        ['html', { open: 'never' }],
        ['list', { printSteps: true }]
      ]
};

export default pwConfig;
