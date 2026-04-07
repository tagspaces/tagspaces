/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */
import { expect } from '@playwright/test';
import {
  clickOn,
  isDisplayed,
  selectorFile,
  setInputValue,
  waitForNotification
} from './general.helpers';
import { delay } from './hook';
import { openContextEntryMenu } from './test-utils';

export const defaultLocationName = 'supported-filestypes';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location Name Changed';

export async function createS3Location(
  locationPath,
  locationName,
  isDefault = false,
  fullTextIndexing = false,
) {
  const lastLocationTID = await getPwLocationTid(-1);
  // Check if location not exist (from extconfig.js)
  if (locationName !== lastLocationTID) {
    await clickOn('[data-tid=locationManagerMenu]');
    await clickOn('[data-tid=locationManagerMenuCreateLocation]');
    await clickOn('[data-tid=locationTypeTID]');
    await clickOn('[data-tid=cloudLocationTID]');

    await setInputValue('[data-tid=locationName] input', locationName || 'Test Location' + new Date().getTime(),); 
    await setInputValue('[data-tid=locationPath] input', locationPath); 
    await setInputValue('[data-tid=accessKeyId] input', 'test');
    await setInputValue('[data-tid=secretAccessKey] input', 'test'); 
    await setInputValue('[data-tid=bucketName] input', 'supported-filestypes'); 
    await setInputValue('[data-tid=endpointURL] input', 'http://localhost:4569'); 

    if (isDefault) {
      await clickOn('[data-tid=switchAdvancedModeTID]');
      await global.client.check('[data-tid=locationIsDefault] input');
    }
    if (fullTextIndexing) {
      await global.client.check('[data-tid=changeFullTextIndex] input');
    }
    await clickOn('[data-tid=confirmLocationCreation]');
  }
}

export async function createPwLocation(
  locationPath,
  locationName,
  isDefault = false,
  fullTextIndexing = false,
) {
  const lastLocationTID = await getPwLocationTid(-1);
  // Check if location not exist (from extconfig.js)
  if (locationName !== lastLocationTID) {
    await clickOn('[data-tid=locationManagerMenu]');
    await clickOn('[data-tid=locationManagerMenuCreateLocation]');
    await setInputValue('[data-tid=locationPath] input', locationPath); 
    await setInputValue(
      '[data-tid=locationName] input',
      locationName || 'Test Location' + new Date().getTime()
    );

    if (isDefault) {
      await global.client.check('[data-tid=locationIsDefault] input');
    }
    if (fullTextIndexing) {
      await global.client.check('[data-tid=changeFullTextIndex] input');
    }
    await global.client.click('[data-tid=confirmLocationCreation]');
  }
}

export async function openLocationMenu(locationName) {
  await clickOn('[data-tid=locationMoreButton_' + locationName + ']');
}

/**
 * @param locationName = undefined -> closeAll
 * @returns {Promise<void>}
 */
export async function closeLocation(locationName = undefined) {
  if (locationName) {
    const locationSelector =
      '[data-tid=locationMoreButton_' + locationName + ']';
    if (!(await isDisplayed(locationSelector))) {
      await clickOn('[data-tid=mobileMenuButton]');
    }
    await clickOn(locationSelector);
    await clickOn('[data-tid=closeLocationTID]');
  } else {
    await clickOn('[data-tid=locationManagerMenu]');
    await clickOn('[data-tid=locationManagerMenuCloseAll]');
  }
}

/**
 * @deprecated use await clickOn('[data-tid=location_' + defaultLocationName + ']');
 * @param locationName
 * @returns {Promise<void>}
 */
export async function openLocation(locationName) {
  await delay(500);
  const lName = await global.client.$(
    '[data-tid=location_' + locationName || defaultLocationName + ']',
  );
  await lName.waitForDisplayed();
  await lName.click();
}

export async function closeFileProperties() {
  if (await isDisplayed('[data-tid=fileContainerCloseOpenedFile]')) {
    await clickOn('[data-tid=fileContainerCloseOpenedFile]');
  }
}

/**
 * @deprecated use expectElementExist(selector, exist = true) instead
 * @param tid
 * @returns {Promise<void>}
 */
export async function checkForIdExist(tid) {
  await delay(500);
  const dataTid = await global.client.$('[data-tid=' + tid + ']');
  await delay(500);
  expect(await dataTid.isDisplayed()).toBe(true);
}

/**
 * @param newFileName
 * @param selector
 * @returns {Promise<oldFileName: string>}
 */
export async function renameFileFromMenu(newFileName, selector = selectorFile) {
  await openContextEntryMenu(selector, 'fileMenuRenameFile'); 
  const input = await global.client.locator(`[data-tid='renameEntryDialogInput'] input`);
  const fileName = await input.inputValue();
  await input.fill(newFileName)
  await clickOn('[data-tid=confirmRenameEntry]');
  await waitForNotification();
  return fileName;
}

export async function deleteFileFromMenu(fileSelector) {
  await openContextEntryMenu(fileSelector, 'fileMenuDeleteFile');
  await clickOn('[data-tid=confirmDeleteFileDialog]');
}

/**
 * @deprecated too heavy
 * @returns {Promise<string>}
 */
export async function getFirstFileName() {
  let fileName;
  await openContextEntryMenu(selectorFile, 'fileMenuRenameFile');
  const renameFileDialogInput = await global.client.$(
    '[data-tid=renameEntryDialogInput] input',
  );
  await renameFileDialogInput.waitForDisplayed({ timeout: 5000 });
  fileName = await renameFileDialogInput.getValue();
  await clickOn('[data-tid=closeRenameFileDialog]');
  return fileName;
}

export async function aboutDialogExt(title, ext) {
  await delay(500);
  const viewerMainMneuButton = await global.client.$('#viewerMainMenuButton');
  await viewerMainMneuButton.waitForDisplayed();
  await viewerMainMneuButton.click();
  const aboutButton = await global.client.$('#aboutButton');
  await aboutButton.waitForDisplayed();
  await aboutButton.click();
  await delay(1500);
  const getTitle = await global.client.$('h4=' + title);
  await getTitle.waitForDisplayed();
  expect(getTitle).toBe(title);
  await delay(1500);
}

export async function startupLocation() {
  await clickOn('[data-tid=editLocation]');
  // await global.client.pause(500);
  await clickOn('[data-tid=locationIsDefault]');
  await clickOn('[data-tid=confirmLocationCreation]');
}

/**
 *
 * @param locationIndex - order index in locations Array starting from 0 if index < 0 it will return reversed from the last items
 * @returns {Promise<string|null>} Location Tid ('location_' + name); example usage: getLocationName(-1) will return the last one
 */
export async function getLocationTid(locationIndex) {
  const locationList = await global.client.$$(
    '[data-tid=locationTitleElement]',
  );
  const location =
    locationIndex < 0
      ? locationList[locationList.length + locationIndex]
      : locationList[locationIndex];
  if (location !== undefined) {
    return await location.getText();
  }
  return undefined;
}

export async function getPwLocationTid(locationIndex) {
  try {
    await global.client.waitForSelector('[data-tid=locationTitleElement]', {
      timeout: 4000,
    });
  } catch (error) {
    console.log("The element didn't appear.");
    return undefined;
  }
  const locationList = await global.client.$$(
    '[data-tid=locationTitleElement]',
  );
  const location =
    locationIndex < 0
      ? locationList[locationList.length + locationIndex]
      : locationList[locationIndex];
  if (location !== undefined) {
    return await location.innerText();
  }
  return undefined;
}
