/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay } from './hook';
import { firstFile, openContextEntryMenu } from './test-utils';
import {
  clickOn,
  getElementText,
  isDisplayed,
  selectorFile,
  setInputKeys,
  takeScreenshot,
  waitForNotification
} from './general.helpers';

export const defaultLocationPath =
  './tests/testdata-tmp/file-structure/supported-filestypes';
export const defaultLocationName = 'supported-filestypes';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location Name Changed';
const minioAccessKey = 'minioadmin';
const minioSecretAccessKey = 'minioadmin';
const minioEndpointURL = 'http://127.0.0.1:9000';

export async function createLocation(
  locationPath,
  locationName,
  isDefault = false
) {
  const lastLocationTID = await getLocationTid(-1);
  // Check if location not exist (from extconfig.js)
  if (locationName !== lastLocationTID) {
    await clickOn('[data-tid=createNewLocation]');
    await clickOn('[data-tid=locationPath]');
    await setInputKeys('locationPath', locationPath || defaultLocationPath);
    /*const locationPathInput = await global.client.$(
      '[data-tid=locationPath] input'
    );
    await locationPathInput.keys(locationPath || defaultLocationPath);*/
    // keys is workarround for not working setValue await global.client.$('[data-tid=locationPath] input').setValue(locationPath || defaultLocationPath);
    await setInputKeys(
      'locationName',
      locationName || 'Test Location' + new Date().getTime()
    );
    /* await clickOn('[data-tid=locationName]');
    const locationNameInput = await global.client.$(
      '[data-tid=locationName] input'
    );
    locationNameInput.keys(
      locationName || 'Test Location' + new Date().getTime()
    );*/
    if (isDefault) {
      await clickOn('[data-tid=locationIsDefault]');
    }
    await clickOn('[data-tid=confirmLocationCreation]');
  }
}

export async function createPwMinioLocation(
  locationPath,
  locationName,
  isDefault = false
) {
  const lastLocationTID = await getPwLocationTid(-1);
  // Check if location not exist (from extconfig.js)
  if (locationName !== lastLocationTID) {
    await clickOn('[data-tid=createNewLocation]');
    if (global.isMinio) {
      // await clickOn('[data-tid=objectStorageLocation]');
    }
    await clickOn('[data-tid=switchAdvancedModeTID]');

    // SET LOCATION NAME
    await global.client.fill(
      '[data-tid=locationName] input',
      locationName || 'Test Location' + new Date().getTime()
    );
    await global.client.fill('[data-tid=locationPath] input', locationPath);
    await global.client.fill('[data-tid=accessKeyId] input', minioAccessKey);
    await global.client.fill(
      '[data-tid=secretAccessKey] input',
      minioSecretAccessKey
    );
    await global.client.fill('[data-tid=bucketName] input', locationName);
    await global.client.fill('[data-tid=endpointURL] input', minioEndpointURL);

    if (isDefault) {
      await clickOn('[data-tid=locationIsDefault]');
    }
    await clickOn('[data-tid=confirmLocationCreation]');
  }
}

export async function createPwLocation(
  locationPath,
  locationName,
  isDefault = false
) {
  const lastLocationTID = await getPwLocationTid(-1);
  // Check if location not exist (from extconfig.js)
  if (locationName !== lastLocationTID) {
    await global.client.click('[data-tid=createNewLocation]');
    //   await global.client.click('[data-tid=locationPath]');
    await setInputKeys('locationPath', locationPath || defaultLocationPath, 20);
    await setInputKeys(
      'locationName',
      locationName || 'Test Location' + new Date().getTime(),
      20
    );

    if (isDefault) {
      await global.client.check('[data-tid=locationIsDefault] input');
    }
    await global.client.click('[data-tid=confirmLocationCreation]');
    await takeScreenshot('after createPwLocation');
  }
}

export async function createMinioLocation(
  locationPath,
  locationName,
  isDefault = false
) {
  const lastLocationTID = await getLocationTid(-1);
  // Check if location not exist (from extconfig.js)
  if (locationName !== lastLocationTID) {
    await clickOn('[data-tid=createNewLocation]');
    if (global.isMinio) {
      await clickOn('[data-tid=objectStorageLocation]');
    }
    await clickOn('[data-tid=switchAdvancedModeTID]');

    // SET LOCATION NAME
    await setInputKeys(
      'locationName',
      locationName || 'Test Location' + new Date().getTime()
    );
    await setInputKeys('locationPath', locationPath);
    await setInputKeys('accessKeyId', minioAccessKey);
    await setInputKeys('secretAccessKey', minioSecretAccessKey);
    await setInputKeys('bucketName', locationName);
    await setInputKeys('endpointURL', minioEndpointURL);

    if (isDefault) {
      await clickOn('[data-tid=locationIsDefault]');
    }
    await clickOn('[data-tid=confirmLocationCreation]');
  }
}

/*async function setInputValue(tid, value) {
  // keys is workarround for not working setValue await global.client.$('[data-tid=locationPath] input').setValue(locationPath || defaultLocationPath);
  const elem = await global.client.$('[data-tid=' + tid + ']');
  await elem.click();

  const elemInput = await global.client.$('[data-tid=' + tid + '] input');
  await elemInput.keys(value);
}*/

export async function openLocationMenu(locationName) {
  await clickOn('[data-tid=locationMoreButton_' + locationName + ']');
}

export async function closeLocation(locationName) {
  const locationSelector = '[data-tid=locationMoreButton_' + locationName + ']';
  const element = await global.client.$(locationSelector);
  if (!(await element.isDisplayed())) {
    await clickOn('[data-tid=locationManagerPanel]');
  }
  await global.client.pause(500);
  await clickOn(locationSelector);
  await clickOn('[data-tid=closeLocationTID]');
}

/**
 * @deprecated use await clickOn('[data-tid=location_' + defaultLocationName + ']');
 * @param locationName
 * @returns {Promise<void>}
 */
export async function openLocation(locationName) {
  await delay(500);
  const lName = await global.client.$(
    '[data-tid=location_' + locationName || defaultLocationName + ']'
  );
  // await delay(1500);
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
  // expect(dataTid.selector).toBe('[data-tid=' + tid + ']');
}

/**
 * @param newFileName
 * @param selector
 * @returns {Promise<oldFileName: string>}
 */
export async function renameFileFromMenu(newFileName, selector = selectorFile) {
  await openContextEntryMenu(selector, 'fileMenuRenameFile');
  const fileName = await global.client.inputValue(
    '[data-tid=renameEntryDialogInput] input'
  );

  await setInputKeys('renameEntryDialogInput', newFileName);
  await clickOn('[data-tid=confirmRenameEntry]');
  await waitForNotification();
  return fileName;
}

export async function deleteFileFromMenu(fileSelector = selectorFile) {
  await openContextEntryMenu(fileSelector, 'fileMenuDeleteFile');
  await clickOn('[data-tid=confirmDeleteFileDialog]');
  await waitForNotification();
}

/**
 * @deprecated too heavy
 * @returns {Promise<string>}
 */
export async function getFirstFileName() {
  let fileName;
  await openContextEntryMenu(selectorFile, 'fileMenuRenameFile');
  const renameFileDialogInput = await global.client.$(
    '[data-tid=renameEntryDialogInput] input'
  );
  await renameFileDialogInput.waitForDisplayed({ timeout: 5000 });
  fileName = await renameFileDialogInput.getValue();
  await clickOn('[data-tid=closeRenameFileDialog]');
  return fileName;
}

export async function getPropertiesTags() {
  const arrTags = [];
  const tags = await global.client.$$(
    '[data-tid=PropertiesTagsSelectTID] div div'
  );
  for (let i = 0; i < tags.length; i++) {
    const dataTid = await tags[i].getAttribute('data-tid');
    if (dataTid && dataTid.startsWith('tagContainer_')) {
      const label = await tags[i].$('button span span');
      arrTags.push(await getElementText(label));
    }
  }
  return arrTags;
}

/*export async function checkForValidExt(selector, ext) {
  const getExt = await global.client
    .waitForVisible(selector)
    .getText(selector, ext);
  await delay(500);
  expect(getExt).toBe(ext);
}*/

export async function aboutDialogExt(title, ext) {
  await delay(500);
  // should switch focus to iFrame
  // await global.client.waitForExist('#viewer').frame(0);
  const viewerMainMneuButton = await global.client.$('#viewerMainMenuButton');
  await viewerMainMneuButton.waitForDisplayed();
  await viewerMainMneuButton.click();
  const aboutButton = await global.client.$('#aboutButton');
  await aboutButton.waitForDisplayed();
  await aboutButton.click();
  await delay(1500);
  const getTitle = await global.client.$('h4=' + title);
  await getTitle.waitForDisplayed();
  // .waitForVisible('h4=' + title)
  // .getText('h4=' + title);
  // should eventually equals('About HTML Viewer');
  expect(getTitle).toBe(title);
  await delay(1500);
  // await global.client
  //   .waitForVisible('#closeAboutDialogButton')
  //   .click('#closeAboutDialogButton');
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
  /*const locationList = await global.client.$$(
    '//!*[@data-tid="locationList"]/div'
  );*/
  const locationList = await global.client.$$(
    '[data-tid=locationTitleElement]'
  );
  const location =
    locationIndex < 0
      ? locationList[locationList.length + locationIndex]
      : locationList[locationIndex];
  // location = await location.$('li');
  // location = await location.$('div');
  // return location.getAttribute('data-tid');
  if (location !== undefined) {
    return await location.getText();
  }
  return undefined;
}

export async function getPwLocationTid(locationIndex) {
  /*const locationList = await global.client.$$(
    '//!*[@data-tid="locationList"]/div'
  );*/
  try {
    await global.client.waitForSelector('[data-tid=locationTitleElement]', {
      // state: 'attached',
      timeout: 1000
    });
  } catch (error) {
    console.log("The element didn't appear.");
    return undefined;
  }
  const locationList = await global.client.$$(
    '[data-tid=locationTitleElement]'
  );
  const location =
    locationIndex < 0
      ? locationList[locationList.length + locationIndex]
      : locationList[locationIndex];
  // location = await location.$('li');
  // location = await location.$('div');
  // return location.getAttribute('data-tid');
  if (location !== undefined) {
    return await location.innerText();
  }
  return undefined;
}
