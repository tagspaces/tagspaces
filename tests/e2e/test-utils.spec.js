/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */

import { clearLocalStorage, delay } from './hook';
import pathLib from 'path';
import {
  createLocation,
  defaultLocationName,
  defaultLocationPath,
  openLocation
} from './location.helpers';

const winMinio = pathLib.resolve(__dirname, '../bin/minio.exe');
const unixMinio = 'minio';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const firstFile = '/span';
export const firstFileName = '/span/div/div/div/p';

// add perspective, remove perspective, change perspective
// const perspectiveList = 'perspectiveList';
// const perspectiveGrid = 'perspectiveGrid';
// const select = '//*[@id="perspectiveList"]/div[5]/div/select';

export async function startMinio() {
  const command = global.isWin ? pathLib.resolve(winMinio) : unixMinio;
  const minioProcess = await require('child_process').spawn(command, [
    'server',
    pathLib.resolve('./testdata/file-structure')
  ]);

  minioProcess.on('exit', function(code) {
    // console.log('exit here with code: ', code);
  });
  minioProcess.on('close', (code, signal) => {
    // console.log(`child process terminated due to receipt of signal ${signal}`);
  });

  minioProcess.stdout.on('data', function(data) {
    // console.log('stdout: ' + data);
  });

  minioProcess.stderr.on('data', function(data) {
    console.log('stderr: ' + data);
  });
  return minioProcess;
}

export async function startChromeDriver() {
  //const childProcess = await require('child_process');
  const chromeDriver = await require('chromedriver');
  //const binPath = chromedriver.path;

  const args = ['--url-base=/', '--port=9515'];

  await chromeDriver.start(args);
  /*const process = await childProcess.execFile(binPath, args, function (err, stdout, stderr) {
    // handle results
    console.log('err: ' + err);
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
  });*/
  return chromeDriver;
}

export async function startWebServer() {
  const express = await require('express');
  const serveStatic = await require('serve-static');

  const port = 8000;
  const app = await express();

  await app.use(
    serveStatic(pathLib.resolve(__dirname, '../../web'), {
      index: ['index.html']
    })
  );
  if (global.isMac) {
    //todo copyfiles do not work for MacOS
    await app.use(serveStatic('../app'));
  }
  await app.listen(port);
  console.log('Webserver listining on http://127.0.0.1:' + port);
  return app;
}

export async function stopWebServer(app) {
  await app.close();
}

export async function stopMinio(process) {
  // Send SIGHUP to process.
  console.log('stopMinio');
  process.stdin.pause();
  process.kill(); //'SIGHUP');
}

export async function stopChromeDriver(chromeDriver) {
  chromeDriver.stop();
  // Send SIGHUP to process.
  /*console.log('stopChromeDriver');
  process.stdin.pause();
  process.kill(); //'SIGHUP');*/
}

export async function openFile(perspectiveSelector, inDepth) {
  // perspectiveSelector is selector for current perspective
  // inDepth is selector for the depth of the elements
  //await delay(500);

  /*const resetSearch = await global.client.$('#resetSearchButton');
  await resetSearch.waitForDisplayed();
  await resetSearch.click();*/

  const fileSelector = await global.client.$(perspectiveSelector + inDepth);
  await fileSelector.waitForDisplayed();
  await fileSelector.click();
}

export async function openDirectoryMenu(menuOperation) {
  // menuOption is selector for current menu operation
  const folderContainerOpenDirMenu = await global.client.$(
    '[data-tid=folderContainerOpenDirMenu]'
  );
  await folderContainerOpenDirMenu.click();
  const menuElem = await global.client.$('[data-tid=' + menuOperation + ']');
  menuElem.click();
}

export async function openContextEntryMenu(selector, menuOperation) {
  await delay(500);
  // selector is current selector location for element in perspectiveGridTable or perspectiveListTable (full xpath path to element)
  // menuOption is selector for current menu operation
  const elem = await global.client.$(selector);
  await elem.waitForDisplayed();
  await elem.click({ button: 'right' });
  //const xoffset = await elem.getLocation('x');
  //const yoffset = await elem.getLocation('y');
  /*const folderContainerOpenDirMenu = await global.client.$(
    '[data-tid=folderContainerOpenDirMenu]'
  );*/
  await delay(500);
  const operation = await global.client.$('[data-tid=' + menuOperation + ']');
  await operation.waitForDisplayed();
  await operation.click();
}

export async function checkFilenameForExist(filename, selector) {
  // selector is current selector location for element in perspectiveGridTable or perspectiveListTable (full xpath path to element)

  const file = await global.client.$(
    selector || perspectiveGridTable + firstFileName
  );
  const fileTxt = await file.getText();
  await delay(500);
  expect(fileTxt).toBe(filename);
}

export function toContainTID(text) {
  let pass = false;
  const tids = ['etete&5435'];
  tids.forEach(tid => {
    pass = text.indexOf(tid) !== -1;
  });
  return pass;
}
