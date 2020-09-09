/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay } from './hook';
import { firstFile, openContextEntryMenu } from './test-utils.spec';

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
  // locationPerspective = locationPerspective || 'Grid';
  const locationManagerMenu = await global.client.$(
    '[data-tid=locationManagerPanel]'
  );
  await locationManagerMenu.click();
  const elem = await global.client.$('[data-tid=createNewLocation]');
  await elem.click();
  // await delay(1500);
  //await global.client.waitForVisible('[data-tid=locationPath]');
  // await delay(1500);
  const lPath = await global.client.$('[data-tid=locationPath]');
  await lPath.click();
  // await global.client.click('[data-tid=locationPath]');
  // await delay(1500);
  const locationPathInput = await global.client.$(
    '[data-tid=locationPath] input'
  );
  await locationPathInput.keys(locationPath || defaultLocationPath);
  // await delay(1500);
  // keys is workarround for not working setValue await global.client.$('[data-tid=locationPath] input').setValue(locationPath || defaultLocationPath);
  const lName = await global.client.$('[data-tid=locationName]');
  await lName.click();
  // await delay(1500);
  const locationNameInput = await global.client.$(
    '[data-tid=locationName] input'
  );
  locationNameInput.keys(
    locationName || 'Test Location' + new Date().getTime()
  );
  // await delay(1500);
  if (isDefault) {
    // await global.client.waitForVisible('[data-tid=locationIsDefault]');
    await delay(1000);
    const locationIsDefault = await global.client.$(
      '[data-tid=locationIsDefault]'
    );
    await locationIsDefault.click();
  }
  // await delay(1500);
  // await global.client.waitForVisible('[data-tid=confirmLocationCreation]');
  // await delay(1500);
  const confirmLocationCreation = await global.client.$(
    '[data-tid=confirmLocationCreation]'
  );
  await confirmLocationCreation.waitForDisplayed();
  await confirmLocationCreation.click();
}

export async function createMinioLocation(
  locationPath,
  locationName,
  isDefault = false
) {
  // locationPerspective = locationPerspective || 'Grid';
  if (!global.isWeb) {
    //TODO rethink this!!
    const locationManagerMenu = await global.client.$(
      '[data-tid=locationManagerPanel]'
    );
    await locationManagerMenu.click();
  }
  const elem = await global.client.$('[data-tid=createNewLocation]');
  await elem.click();

  const objectStorageLocation = await global.client.$(
    '[data-tid=objectStorageLocation]'
  );
  await objectStorageLocation.click();

  // SET LOCATION NAME
  await setInputValue(
    'locationName',
    locationName || 'Test Location' + new Date().getTime()
  );
  await setInputValue('locationPath', locationPath);
  await setInputValue('accessKeyId', minioAccessKey);
  await setInputValue('secretAccessKey', minioSecretAccessKey);
  await setInputValue('bucketName', locationName);
  await setInputValue('endpointURL', minioEndpointURL);

  // await delay(1500);
  if (isDefault) {
    await delay(1000);
    const locationIsDefault = await global.client.$(
      '[data-tid=locationIsDefault]'
    );
    await locationIsDefault.click();
  }

  const confirmLocationCreation = await global.client.$(
    '[data-tid=confirmLocationCreation]'
  );
  await confirmLocationCreation.waitForDisplayed();
  await confirmLocationCreation.click();
}

async function setInputValue(selector, value) {
  // keys is workarround for not working setValue await global.client.$('[data-tid=locationPath] input').setValue(locationPath || defaultLocationPath);
  const elem = await global.client.$('[data-tid=' + selector + ']');
  await elem.click();

  const elemInput = await global.client.$('[data-tid=' + selector + '] input');
  await elemInput.keys(value);
}

export async function openFilesOptionMenu() {
  const gridPerspectiveOptionsMenu = await global.client.$(
    '[data-tid=gridPerspectiveOptionsMenu]'
  );
  // await gridPerspectiveOptionsMenu.waitForDisplayed();
  await gridPerspectiveOptionsMenu.click();
}

export async function toggleShowDirectoriesClick() {
  const gridPerspectiveToggleShowDirectories = await global.client.$(
    '[data-tid=gridPerspectiveToggleShowDirectories]'
  );
  await gridPerspectiveToggleShowDirectories.waitForDisplayed();
  await gridPerspectiveToggleShowDirectories.click();
}

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

export async function checkForIdExist(tid) {
  await delay(500);
  const dataTid = await global.client.$('[data-tid=' + tid + ']');
  await delay(500);
  expect(await dataTid.isDisplayed()).toBe(true);
  // expect(dataTid.selector).toBe('[data-tid=' + tid + ']');
}

export async function clearInputValue(inputElement) {
  const value = await inputElement.getValue();
  const count = value.length;
  for (let i = 0; i < count; i++) {
    const value = await inputElement.getValue();
    if (value === '') {
      break;
    }
    await inputElement.doubleClick();
    await global.client.keys('Delete');
    await inputElement.clearValue();
  }
  await delay(500);
}

export async function renameFirstFile(newFileName) {
  await openContextEntryMenu(
    perspectiveGridTable + firstFile,
    'fileMenuRenameFile'
  );
  await delay(500);
  const renameFileDialogInput = await global.client.$(
    '[data-tid=renameFileDialogInput] input'
  );
  await renameFileDialogInput.waitForDisplayed();
  await clearInputValue(renameFileDialogInput);
  await renameFileDialogInput.keys(newFileName);
  //await delay(1500);
  const confirmRenameFileDialog = await global.client.$(
    '[data-tid=confirmRenameFileDialog]'
  );
  await confirmRenameFileDialog.click();
}

export async function deleteFirstFile() {
  await openContextEntryMenu(
    perspectiveGridTable + firstFile,
    'fileMenuDeleteFile'
  );
  await delay(500);
  // Check if the directories are displayed
  const confirmDelete = await global.client.$(
    '[data-tid=confirmDeleteFileDialog]'
  );
  await confirmDelete.click();
}

export async function getFirstFileName() {
  let fileName;
  await openContextEntryMenu(
    perspectiveGridTable + firstFile,
    'fileMenuRenameFile'
  );
  await delay(500);
  const renameFileDialogInput = await global.client.$(
    '[data-tid=renameFileDialogInput] input'
  );
  fileName = await renameFileDialogInput.getValue();
  const cancelButton = await global.client.$(
    '[data-tid=closeRenameFileDialog]'
  );
  //await cancelButton.waitForDisplayed();
  await cancelButton.click();
  return fileName;
}

export async function checkForValidExt(selector, ext) {
  const getExt = await global.client
    .waitForVisible(selector)
    .getText(selector, ext);
  await delay(500);
  expect(getExt).toBe(ext);
}

export async function aboutDialogExt(title, ext) {
  await delay(500);
  // should switch focus to iFrame
  // await global.client.waitForExist('#viewer').frame(0);
  await global.client
    .waitForVisible('#viewerMainMenuButton')
    .click('#viewerMainMenuButton');
  await global.client.waitForVisible('#aboutButton').click('#aboutButton');
  await delay(1500);
  const getTitle = await global.client
    .waitForVisible('h4=' + title)
    .getText('h4=' + title);
  // should eventually equals('About HTML Viewer');
  expect(getTitle).toBe(title);
  await delay(1500);
  await global.client
    .waitForVisible('#closeAboutDialogButton')
    .click('#closeAboutDialogButton');
}
