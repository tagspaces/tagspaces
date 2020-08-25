/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay } from './hook';

export const defaultLocationPath =
  './tests/file-structure/supported-filestypes';
export const defaultLocationName = 'supported-filestype';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location Name Changed';

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
  await delay(500);
  await global.client.waitForVisible(
    '[data-tid=locationMoreButton_' + locationName + ']'
  );
  await delay(1500);
  await global.client.click(
    '[data-tid=locationMoreButton_' + locationName + ']'
  );
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
  if (fileContainerCloseOpenedFile.isClickable()) {
    await fileContainerCloseOpenedFile.click();
  }
}

export async function checkForIdExist(tid) {
  await delay(500);
  const dataTid = await global.client.element('[data-tid=' + tid + ']');
  await delay(500);
  expect(dataTid.selector).toBe('[data-tid=' + tid + ']');
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
