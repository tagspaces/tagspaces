/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */

import { delay, clearLocalStorage } from './hook';
import {
  createLocation,
  openLocation,
  defaultLocationPath,
  defaultLocationName
} from './location.helpers';

export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const firstFile = '/span';
export const firstFileName = '/span/div/div/div/p';

// add perspective, remove perspective, change perspective
// const perspectiveList = 'perspectiveList';
// const perspectiveGrid = 'perspectiveGrid';
// const select = '//*[@id="perspectiveList"]/div[5]/div/select';

export async function openFile(perspectiveSelector, inDepth) {
  // perspectiveSelector is selector for current perspective
  // inDepth is selector for the depth of the elements
  //await delay(500);

  const resetSearch = await global.client.$('#resetSearchButton');
  await resetSearch.waitForDisplayed();
  await resetSearch.click();

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
