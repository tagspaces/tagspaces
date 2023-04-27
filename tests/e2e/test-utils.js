/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { expect } from '@playwright/test';
import { clickOn, setInputKeys } from './general.helpers';

const newDirectoryName = 'newDirectory';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const firstFile = '/span';
export const firstFolder = '/div';
export const firstFileName = '/span/div/div/div/p';

export async function openContextEntryMenu(selector, menuOperation) {
  // selector is current selector location for element in perspectiveGridTable or perspectiveListTable (full xpath path to element)
  // menuOption is selector for current menu operation
  await clickOn(selector, { button: 'right' });
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
  await setInputKeys('renameEntryDialogInput', newDirectoryName);
  await clickOn('[data-tid=confirmRenameEntry]');
  return newDirectoryName;
}
