/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { Application } from 'spectron';
import electronPath from 'electron';
import path from 'path';
import { closeWelcome } from './welcome.helpers';

// Spectron API https://github.com/electron/spectron
// Webdriver.io http://webdriver.io/api.html

export const delay = time => new Promise(resolve => setTimeout(resolve, time));

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
export const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// the default timeout before starting every test
jasmine.DEFAULT_TIMEOUT_INTERVAL = 150000;

// use this pause only for visual debuging on places where you want to see the result after a given operation
// global.msDebugPause = 0;

// the default timeout before starting every test
// global.msPause = 3000;

global.isWin = /^win/.test(process.platform);

export function clearLocalStorage() {
  // global.app.client.localStorage('DELETE');
  // global.app.client.reload(false);
}

// the path the electron app, that will be tested
/* let testPath = '../tsn/app'; // '../repo/app';
if (global.isWin) {
  testPath = '..\\tsn\\app'; // '..\\repo\\app';
}

for (var index in process.argv) {
  let str = process.argv[index];
  if (str.indexOf('--webdav') == 0) {
    testPath = 'electron-app';
  }
} */

beforeEach(async () => {
  global.app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..', '..', 'app')]
  });
  await global.app.start();
  global.client = global.app.client;
  await global.client.waitUntilWindowLoaded();
  // global.app.browserWindow.focus();
  //let windowCount = await global.client.getWindowCount();
  // expect(windowCount).to.equal(2);
  // const mainWindow = await global.client.getWindowHandle();
  await closeWelcome();
  //windowCount = await global.client.getWindowCount();
  //expect(windowCount).to.equal(1);
  //const windowHandles = await global.client.getWindowHandles();
  //global.client.switchToWindow(windowHandles[0]);
  //global.client.switchToWindow(mainWindow);
});

afterEach(() => {
  if (global.app && global.app.isRunning()) {
    clearLocalStorage();
    return global.app.stop();
  }
});
