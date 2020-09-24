/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay } from './hook';
import { firstFile, openContextEntryMenu } from './test-utils.spec';

export const defaultLocationPath =
  './testdata/file-structure/supported-filestypes';
export const defaultLocationName = 'supported-filestypes';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location Name Changed';
export const tsFolder = 'empty_folder';

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

export async function openSettingsDialog() {
  await delay(500);
  const openSettings = await global.client.$('[data-tid=settings]');
  await openSettings.waitForDisplayed();
  await openSettings.click();
  // await checkForIdExist('settingsDialog');
  // await global.client.waitForDisplayed('[data-tid=closeSettingsDialog]');
  // await global.client.click('[data-tid=closeSettingsDialog]');
  await delay(500);
}

export async function closeSettingsDialog() {
  await delay(500);
  const closeSettings = await global.client.$('[data-tid=closeSettingsDialog]');
  await closeSettings.waitForDisplayed();
  await closeSettings.click();
  await delay(500);
}

export async function reloadDirectory() {
  await delay(500);
  const openDirMenu = await global.client.$(
    '[data-tid=folderContainerOpenDirMenu]'
  );
  await openDirMenu.waitForDisplayed();
  await openDirMenu.click();
  await delay(500);
  const reloadDirectory = await global.client.$('[data-tid=reloadDirectory]');
  await reloadDirectory.waitForDisplayed();
  await reloadDirectory.click();
  await delay(500);
}

export async function openEntry(entryName) {
  await delay(500);
  const lName = await global.client.$(
    '[data-tid=fsEntryName_' + entryName + ']'
  );
  // await delay(1500);
  await lName.waitForDisplayed();
  await lName.click();
}
