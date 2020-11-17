/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay } from './hook';
import { firstFile, openContextEntryMenu } from './test-utils.spec';
import { clickOn, setInputKeys, setInputValue } from './general.helpers';

export const defaultLocationPath =
  './testdata/file-structure/supported-filestypes';
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

export async function createMinioLocation(
  locationPath,
  locationName,
  isDefault = false
) {
  /*if (!global.isWeb) {
    const locationManagerMenu = await global.client.$(
      '[data-tid=locationManagerPanel]'
    );
    await locationManagerMenu.click();
  }*/
  const elem = await global.client.$('[data-tid=createNewLocation]');
  await elem.click();

  const objectStorageLocation = await global.client.$(
    '[data-tid=objectStorageLocation]'
  );
  await objectStorageLocation.click();

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

  // await delay(1500);
  if (isDefault) {
    await clickOn('[data-tid=locationIsDefault]');
  }
  await clickOn('[data-tid=confirmLocationCreation]');
}

/*async function setInputValue(tid, value) {
  // keys is workarround for not working setValue await global.client.$('[data-tid=locationPath] input').setValue(locationPath || defaultLocationPath);
  const elem = await global.client.$('[data-tid=' + tid + ']');
  await elem.click();

  const elemInput = await global.client.$('[data-tid=' + tid + '] input');
  await elemInput.keys(value);
}*/

export async function selectAllFilesClick() {
  const gridPerspectiveSelectAllFiles = await global.client.$(
    '[data-tid=gridPerspectiveSelectAllFiles]'
  );
  await gridPerspectiveSelectAllFiles.waitForDisplayed();
  await gridPerspectiveSelectAllFiles.click();
}

export async function openLocationMenu(locationName) {
  //await delay(500);
  const locationMoreButton = await global.client.$(
    '[data-tid=locationMoreButton_' + locationName + ']'
  );
  await locationMoreButton.waitForDisplayed();
  await locationMoreButton.click();
  /*await global.client.waitForVisible(
    '[data-tid=locationMoreButton_' + locationName + ']'
  );
  await delay(1500);
  await global.client.click(
    '[data-tid=locationMoreButton_' + locationName + ']'
  ); */
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
  const fileContainerCloseOpenedFile = await global.client.$(
    '[data-tid=fileContainerCloseOpenedFile]'
  );
  if (await fileContainerCloseOpenedFile.isDisplayed()) {
    //.isClickable()) {
    await fileContainerCloseOpenedFile.click();
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

export async function renameFirstFile(newFileName) {
  await openContextEntryMenu(
    perspectiveGridTable + firstFile,
    'fileMenuRenameFile'
  );
  await global.client.pause(500);
  await setInputKeys('renameFileDialogInput', newFileName);
  /*const renameFileDialogInput = await global.client.$(
    '[data-tid=renameFileDialogInput] input'
  );
  await renameFileDialogInput.waitForDisplayed({ timeout: 5000 });
  //await renameFileDialogInput.clearValue();
  //await clearInputValue(renameFileDialogInput);
  await global.client.pause(50);
  await renameFileDialogInput.setValue(newFileName);*/
  //await delay(1500);
  await clickOn('[data-tid=confirmRenameFileDialog]');
}

export async function deleteFirstFile() {
  await openContextEntryMenu(
    perspectiveGridTable + firstFile,
    'fileMenuDeleteFile'
  );
  await clickOn('[data-tid=confirmDeleteFileDialog]');
}

export async function getFirstFileName() {
  let fileName;
  await openContextEntryMenu(
    perspectiveGridTable + firstFile,
    'fileMenuRenameFile'
  );
  const renameFileDialogInput = await global.client.$(
    '[data-tid=renameFileDialogInput] input'
  );
  await renameFileDialogInput.waitForDisplayed({ timeout: 5000 });
  fileName = await renameFileDialogInput.getValue();
  await clickOn('[data-tid=closeRenameFileDialog]');
  return fileName;
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
  await delay(500);
  const editLocation = await global.client.$('[data-tid=editLocation]');
  await editLocation.waitForDisplayed();
  await editLocation.click();
  await delay(1500);
  const defaultLocation = await global.client.$(
    '[data-tid=editStartupLocation]'
  );
  await defaultLocation.waitForDisplayed();
  await defaultLocation.click();
  await delay(1500);
  const closeEditLocationDialog = await global.client.$(
    '[data-tid=confirmEditLocationDialog]'
  );
  await closeEditLocationDialog.waitForDisplayed();
  await closeEditLocationDialog.click();
  await delay(1500);
}

/**
 *
 * @param locationIndex - order index in locations Array starting from 0 if index < 0 it will return reversed from the last items
 * @returns {Promise<string|null>} Location name; example usage: getLocationName(-1) will return the last one
 */
export async function getLocationName(locationIndex) {
  const locationList = await global.client.$$(
    '//*[@data-tid="locationList"]/div'
  );
  let location =
    locationIndex < 0
      ? locationList[locationList.length + locationIndex]
      : locationList[locationIndex];
  location = await location.$('li');
  location = await location.$('div');
  return location.getAttribute('data-tid');
}
