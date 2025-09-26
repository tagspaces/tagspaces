import { defineConfig, devices } from '@playwright/test';
import pwConfig from './playwright.config.common';

const isWin = /win32|mswin(?!ce)|mingw|bccwin|cygwin/i.test(process.platform);
//const isHeadlessMode = process.env.HEADLESS_MODE === 'true';

// support either 'electron' or ['electron','!_pro'] form
function projectTagGrep(names) {
  const arr = Array.isArray(names) ? names : [names];

  // split include / exclude (exclude tokens start with '!')
  const include = arr.filter((s) => !s.startsWith('!'));
  const exclude = arr.filter((s) => s.startsWith('!')).map((s) => s.slice(1));

  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const negLookaheads = exclude.map((n) => `(?![^\\]]*${escape(n)})`).join('');
  const posLookaheads = include.map((n) => `(?=[^\\]]*${escape(n)})`).join('');

  // If there are no include tokens, this will match any bracketed tag that doesn't contain excluded tokens.
  const re = new RegExp(`\\[${negLookaheads}${posLookaheads}[^\\]]*\\]`);
  console.log('projectTagGrep regex for', names, '=>', re.toString());
  //return new RegExp('(?:TST4915a)'); // return new RegExp(`TST01.*`);
  return re;
}

export default defineConfig({
  ...pwConfig,
  projects: [
    {
      name: 'electron-light',
      // require 'electron' AND forbid '_pro'
      grep: projectTagGrep(['electron', '!_pro']),
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
      grep: projectTagGrep(['electron', 's3']),
      use: {
        isElectron: true,
        isS3: true,
        isWin,
      },
    },
    {
      name: 'electron-minio',
      grep: projectTagGrep(['electron', 'minio']),
      use: {
        isElectron: true,
        isMinio: true,
        isWin,
      },
    },
    {
      name: 'web-s3',
      grep: projectTagGrep(['web', 's3']),
      use: {
        isWeb: true,
        isS3: true,
        isWin,
        // ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'web-minio',
      grep: projectTagGrep(['web', 'minio']),
      use: {
        isWeb: true,
        isMinio: true,
        isWin,
      },
    },
  ],
});
