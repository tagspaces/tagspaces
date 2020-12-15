/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */

import pathLib from 'path';
import { clickOn, setInputKeys } from './general.helpers';

const newDirectoryName = 'newDirectory';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const firstFile = '/span';
export const firstFolder = '/div';
export const firstFileName = '/span/div/div/div/p';

// add perspective, remove perspective, change perspective
// const perspectiveList = 'perspectiveList';
// const perspectiveGrid = 'perspectiveGrid';
// const select = '//*[@id="perspectiveList"]/div[5]/div/select';

/**
 * @deprecated use: clickOn();
 * @param perspectiveSelector
 * @param inDepth
 * @returns {Promise<void>}
 */
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

// export async function openDirectoryMenu(menuOperation) {
//   // menuOption is selector for current menu operation
//   const folderContainerOpenDirMenu = await global.client.$(
//     '[data-tid=folderContainerOpenDirMenu]'
//   );
//   await folderContainerOpenDirMenu.click();
//   const menuElem = await global.client.$('[data-tid=' + menuOperation + ']');
//   menuElem.click();
// }

export async function openContextEntryMenu(selector, menuOperation) {
  // selector is current selector location for element in perspectiveGridTable or perspectiveListTable (full xpath path to element)
  // menuOption is selector for current menu operation
  await clickOn(selector, { button: 'right' });
  await global.client.pause(500);
  await clickOn('[data-tid=' + menuOperation + ']');
}

/**
 * @deprecated use getGridFileName(fileIndex) instead
 * @param filename
 * @param selector
 * @returns {Promise<void>}
 */
export async function checkFilenameForExist(filename, selector) {
  // selector is current selector location for element in perspectiveGridTable or perspectiveListTable (full xpath path to element)

  const file = await global.client.$(
    selector || perspectiveGridTable + firstFileName
  );
  const fileTxt = await file.getText();
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

export async function renameFolder() {
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await clickOn('[data-tid=renameDirectory]');
  // set new dir name
  await setInputKeys('renameDirectoryDialogInput', newDirectoryName);
  await clickOn('[data-tid=confirmRenameDirectory]');
  return newDirectoryName;
}

export async function openParentDir() {
  await clickOn('[data-tid=gridPerspectiveOnBackButton]');
}
