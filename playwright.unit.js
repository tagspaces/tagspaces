const { defineConfig } = require('@playwright/test');

global.isUnitTest = true;

module.exports = defineConfig({
  testDir: './tests/unit',
  // Use the grep option to filter tests by title and file extension
  // grep: /.*\.pw\.js$/,
  testMatch: /.*\.test\.js/,
  // Set the timeout for each test
  timeout: 30000,
  // (3 hours) Maximum time in milliseconds the whole test suite can run. Useful on CI to prevent broken setup from running too long and wasting resources.
  globalTimeout: process.env.CI ? 3 * 60 * 60 * 1000 : undefined,
  reporter: process.env.CI ? 'github' : 'list'
});
