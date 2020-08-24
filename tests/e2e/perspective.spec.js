/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */

import { delay, clearLocalStorage } from './hook';
import {
  createLocation,
  openLocation,
  defaultLocationPath,
  defaultLocationName
} from './location.helpers';

export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const firstFile = '/div[1]/div';
export const firstFileName = '/div[1]/div/p';

// add perspective, remove perspective, change perspective
// const perspectiveList = 'perspectiveList';
// const perspectiveGrid = 'perspectiveGrid';
// const select = '//*[@id="perspectiveList"]/div[5]/div/select';

export async function openFile(perspectiveSelector, inDepth) {
  // perspectiveSelector is selector for current perspective
  // inDepth is selector for the depth of the elements
  await delay(500);
  await global.client
    .waitForVisible(perspectiveSelector + inDepth)
    .click(perspectiveSelector + inDepth);
}

export async function openDirectoryMenu(menuOperation) {
  // menuOption is selector for current menu operation
  await global.client
    .waitForVisible('[data-tid=folderContainerOpenDirMenu]')
    .click('[data-tid=folderContainerOpenDirMenu]');
  await global.client
    .waitForVisible('[data-tid=' + menuOperation + ']')
    .click('[data-tid=' + menuOperation + ']');
}

export async function openContextEntryMenu(selector, menuOperation) {
  // selector is current selector location for element in perspectiveGridTable or perspectiveListTable (full xpath path to element)
  // menuOption is selector for current menu operation
  const xoffset = await global.client
    .waitForVisible(selector)
    .getLocation(selector, 'x');
  const yoffset = await global.client
    .waitForVisible(selector)
    .getLocation(selector, 'y');
  await global.client
    .waitForVisible('[data-tid=folderContainerOpenDirMenu]')
    .rightClick(selector, xoffset, yoffset);
  await global.client
    .waitForVisible('[data-tid=' + menuOperation + ']')
    .click('[data-tid=' + menuOperation + ']');
}

export async function checkFilenameForExist(filename, selector) {
  // selector is current selector location for element in perspectiveGridTable or perspectiveListTable (full xpath path to element)
  const file = await global.client.getText(
    selector || perspectiveGridTable + firstFileName
  );
  await delay(500);
  expect(file).toBe(filename);
}

describe('TST11 - Perspective tests', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it.skip('TST1101 - Add perspective', () => {});

  it.skip('TST1102 - Remove perspective', () => {});

  it.skip('TST1103 - Change perspective order', () => {});

  it.skip('TST1104 - Should switch perspective to grid perspective', () => {});
});
