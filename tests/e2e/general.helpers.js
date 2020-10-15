/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay } from './hook';
import { firstFile, checkFilenameForExist } from './test-utils.spec';

export const defaultLocationPath =
  './testdata/file-structure/supported-filestypes';
export const defaultLocationName = 'supported-filestypes';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location Name Changed';
export const tsFolder = '\\.ts';

// const newHTMLFileName = 'newHTMLFile.html';
const testFolder = 'testFolder';

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
  const lPath = await global.client.$('[data-tid=locationPath]');
  await lPath.click();
  const locationPathInput = await global.client.$(
    '[data-tid=locationPath] input'
  );
  await locationPathInput.keys(locationPath || defaultLocationPath);
  // keys is workarround for not working setValue await global.client.$('[data-tid=locationPath] input').setValue(locationPath || defaultLocationPath);
  const lName = await global.client.$('[data-tid=locationName]');
  await lName.click();
  const locationNameInput = await global.client.$(
    '[data-tid=locationName] input'
  );
  locationNameInput.keys(
    locationName || 'Test Location' + new Date().getTime()
  );
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

export async function openSettingsDialog() {
  await delay(500);
  const openSettings = await global.client.$('[data-tid=settings]');
  await openSettings.waitForDisplayed();
  await openSettings.click();
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
  const eName = await global.client.$(
    '[data-tid=fsEntryName_' + entryName + ']'
  );
  await eName.waitForDisplayed();
  await eName.doubleClick();
  await delay(500);
}

export async function openDirectoryMenu() {
  const openDirMenu = await global.client.$(
    '[data-tid=folderContainerOpenDirMenu]'
  );
  await openDirMenu.waitForDisplayed();
  await openDirMenu.click();
  await delay(500);
}

export async function createNewDirectory() {
  const newSubDirectoty = await global.client.$('[data-tid=newSubDirectory]');
  await newSubDirectoty.waitForDisplayed();
  await delay(500);
  await newSubDirectoty.click();
  await delay(1500);
  // set new dir name
  const directoryName = await global.client.$('[data-tid=directoryName] input');
  await delay(500);
  await directoryName.keys(testFolder);
  await directoryName.click();
  await delay(1500);
  const confirmCreateNewDirectory = await global.client.$(
    '[data-tid=confirmCreateNewDirectory]'
  );
  await delay(1500);
  await confirmCreateNewDirectory.waitForDisplayed();
  await confirmCreateNewDirectory.click();
}

export async function newHTMLFile() {
  const newFile = await global.client.$('[data-tid=locationManager]');
  await newFile.waitForDisplayed();
  await newFile.click();
  await delay(500);
  const newNoteFile = await global.client.$(
    '[data-tid=createRichTextFileButton]'
  );
  await newNoteFile.waitForDisplayed();
  await newNoteFile.click();
  await delay(500);
}

export async function newMDFile() {
  const newFile = await global.client.$('[data-tid=locationManager]');
  await newFile.waitForDisplayed();
  await newFile.click();
  await delay(500);
  const newNoteFile = await global.client.$('[data-tid=createMarkdownButton]');
  await newNoteFile.waitForDisplayed();
  await newNoteFile.click();
  await delay(500);
}

export async function newTEXTFile() {
  const newFile = await global.client.$('[data-tid=locationManager]');
  await newFile.waitForDisplayed();
  await newFile.click();
  await delay(500);
  const newNoteFile = await global.client.$('[data-tid=createTextFileButton]');
  await newNoteFile.waitForDisplayed();
  await newNoteFile.click();
  await delay(500);
}

export async function closeOpenedFile() {
  const closeFile = await global.client.$(
    '[data-tid=fileContainerCloseOpenedFile]'
  );
  await closeFile.waitForDisplayed();
  await closeFile.click();
  await delay(500);
}

export async function deleteDirectory() {
  await openDirectoryMenu();
  await delay(500);
  const deleteDirectory = await global.client.$('[data-tid=deleteDirectory]');
  await deleteDirectory.waitForDisplayed();
  await delay(500);
  await deleteDirectory.click();
  const confirmDeleteDirectory = await global.client.$(
    '[data-tid=confirmDeleteDirectoryDialog]'
  );
  await confirmDeleteDirectory.waitForDisplayed();
  await delay(500);
  await confirmDeleteDirectory.click();
  await delay(500);
}

export async function disableTrashBin() {
  await openSettingsDialog();
  await delay(500);
  const disableTrashBin = await global.client.$(
    '[data-tid=settingsSetUseTrashCan]'
  );
  await disableTrashBin.waitForDisplayed();
  await disableTrashBin.click();
  await delay(500);
  await closeSettingsDialog();
}

export async function returnDirectoryBack() {
  await delay(500);
  const backButton = await global.client.$(
    '[data-tid=gridPerspectiveOnBackButton]'
  );
  await backButton.click();
  await delay(500);
}

export async function toHaveText() {
  await delay(500);
  const file = await global.client.$(perspectiveGridTable + firstFile);
  console.log(file.getText());
  expect(file).toBe(filename);
  // const classNameAndText = await global.client.$('<img>');
  // await checkFilenameForExist(filename, selector)
  // expect(file).toEquale(expect.toHaveTextContaining('jpg'));
  // expect.stringContaining('jpg');
  // expect(text1==text2).toBe(true);
}
