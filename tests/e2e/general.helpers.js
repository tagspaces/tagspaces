/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import { firstFile } from './test-utils';

export const defaultLocationPath =
  './testdata-tmp/file-structure/supported-filestypes';
export const defaultLocationName = 'supported-filestypes';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location Name Changed';
export const tsFolder = '\\.ts'; // escape dot
export const selectorFile = '//*[@data-tid="perspectiveGridFileTable"]/span';
export const selectorFolder = '//*[@data-tid="perspectiveGridFileTable"]/div';

// const newHTMLFileName = 'newHTMLFile.html';
const testFolder = 'testFolder';
const testLocationName = '' + new Date().getTime();

export async function clickOn(selector, options = {}) {
  const element = await global.client.$(selector);
  await element.waitUntil(
    async function() {
      const displayed = await this.isDisplayed();
      // const clickable = await this.isClickable();
      // const displayed = await this.isDisplayedInViewport();
      return displayed; // && clickable;
    },
    {
      timeout: 5000,
      timeoutMsg: 'clickOn selector ' + selector + ' to exist after 5s'
    }
  );
  //await element.scrollIntoView();
  //await element.moveTo(selector);
  await element.click(options);
}

/*export async function waitUntilOpen(element) {
  // const element = await global.client.$(selector);
  await element.waitUntil(async () => await this.isOpen());
}*/
/**
 *
 * @param selector
 * @param className
 * @returns {Promise<void>} newClassName
 */
export async function waitUntilClassChanged(selector, className) {
  const element = await global.client.$(selector);
  await element.waitUntil(
    async function() {
      const newClassName = await this.getAttribute('class');
      return newClassName !== className;
    },
    {
      timeout: 5000,
      timeoutMsg:
        'waitUntilClassChanged selector ' +
        selector +
        ' className:' +
        className +
        ' to changed after 5s'
    }
  );
  return await element.getAttribute('class');
}

export async function doubleClickOn(selector) {
  const element = await global.client.$(selector);
  await element.waitUntil(
    async function() {
      const displayed = await this.isDisplayed();
      // const displayed = await this.isDisplayedInViewport();
      return displayed; //=== true;
    },
    {
      timeout: 5000,
      timeoutMsg: 'doubleClick selector ' + selector + ' to exist after 5s'
    }
  );
  await element.doubleClick();
}

export async function setInputValue(selector, value) {
  const element = await global.client.$(selector);
  await element.waitUntil(
    async function() {
      // const displayed = await this.isDisplayed();
      const displayed = await this.isDisplayedInViewport();
      return displayed === true;
    },
    {
      timeout: 5000,
      timeoutMsg: 'setInputValue selector ' + selector + ' to exist after 5s'
    }
  );
  await element.setValue(value);
}

export async function addInputKeys(tid, value) {
  const element = await global.client.$('[data-tid=' + tid + ']');
  await element.waitUntil(
    async function() {
      const displayed = await this.isDisplayedInViewport();
      return displayed === true;
    },
    {
      timeout: 5000,
      timeoutMsg:
        'setInputKeys selector ' + element.selector + ' to exist after 5s'
    }
  );
  await element.click();

  const elemInput = await global.client.$('[data-tid=' + tid + '] input');
  await elemInput.waitUntil(
    async function() {
      // const displayed = await this.isDisplayed();
      const displayed = await this.isDisplayedInViewport();
      return displayed === true;
    },
    {
      timeout: 5000,
      timeoutMsg:
        'setInputKeys selector ' + element.selector + ' to exist after 5s'
    }
  );
  await elemInput.click();
  await elemInput.keys(value);
}

export async function setInputKeys(tid, value) {
  return await setSelectorKeys('[data-tid=' + tid + ']', value);
}

export async function setSelectorKeys(selector, value) {
  const element = await global.client.$(selector);
  await element.waitUntil(
    async function() {
      // const displayed = await this.isDisplayed();
      const displayed = await this.isDisplayedInViewport();
      return displayed === true;
    },
    {
      timeout: 5000,
      timeoutMsg:
        'setSelectorKeys selector ' + element.selector + ' to exist after 5s'
    }
  );
  await element.click();

  const elemInput = await element.$('input');
  // const elemInput = await global.client.$(selector + ' input');
  await elemInput.waitUntil(
    async function() {
      // const displayed = await this.isDisplayed();
      const displayed = await this.isDisplayedInViewport();
      return displayed === true;
    },
    {
      timeout: 5000,
      timeoutMsg:
        'setSelectorKeys selector ' + element.selector + ' to exist after 5s'
    }
  );

  // await elemInput.clearValue();
  const oldValue = await clearInputValue(elemInput);
  await element.click();
  await elemInput.keys(value);
  return oldValue;
}

export async function clearInputValue(inputElement) {
  const oldValue = await inputElement.getValue();
  const count = oldValue.length;
  for (let i = 0; i < count; i++) {
    const value = await inputElement.getValue();
    if (value === '') {
      break;
    }
    await inputElement.click();
    await inputElement.doubleClick();
    await global.client.keys('Delete');
    await inputElement.clearValue();
  }
  return oldValue;
}

/**
 *
 * @param fileIndex
 * @returns {Promise<string>} fileName; example usage: getFileName(-1) will return the last one
 */
export async function getGridFileName(fileIndex) {
  try {
    const filesList = await global.client.$$(perspectiveGridTable + firstFile);
    if (filesList.length > 0) {
      let file =
        fileIndex < 0
          ? filesList[filesList.length + fileIndex]
          : filesList[fileIndex];
      file = await file.$('div');
      file = await file.$('div');
      file = await file.$('div');
      const fileNameElem = await file.$('p');
      const fileName = await fileNameElem.getText();
      const divs = await file.$$('div');
      const lastDiv = await divs[divs.length - 1];
      const fileExtElem = await lastDiv.$('span');
      const fileExt = await fileExtElem.getText();
      return fileName + '.' + fileExt.toLowerCase();
    }
  } catch (e) {
    console.log("Can't find getGridFileName:" + fileIndex, e);
  }
  return undefined;
}

export async function getGridElement(fileIndex = 0) {
  const filesList = await global.client.$$(perspectiveGridTable + firstFile);
  let file =
    fileIndex < 0
      ? filesList[filesList.length + fileIndex]
      : filesList[fileIndex];
  file = await file.$('div');
  file = await file.$('div');
  return file;
}

export async function getGridCellClass(fileIndex = 0) {
  const file = await getGridElement(fileIndex);
  return file.getAttribute('class');
}

export async function expectElementExist(
  selector,
  exist = true,
  timeout = 5000
) {
  const element = await global.client.$(selector);
  await expectExist(element, exist, timeout);
  return element;
}

export async function expectExist(element, exist = true, timeout = 5000) {
  await element.waitForDisplayed({
    timeout: timeout,
    reverse: !exist,
    timeoutMsg:
      'expectElementExist selector:' +
      element.selector +
      ' to exist=' +
      exist +
      ' after ' +
      timeout / 1000 +
      's'
  });
  /*await element.waitUntil(
    async function() {
      const displayed = await this.isDisplayed();
      // const displayed = await this.isDisplayedInViewport();
      return displayed === exist;
    },
    {
      timeout: timeout,
      timeoutMsg:
        'expectElementExist selector:' +
        element.selector +
        ' to exist=' +
        exist +
        ' after ' +
        timeout / 1000 +
        's'
    }
  );*/
  expect(await element.isDisplayed()).toBe(exist);
  return element;
}

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

export async function createTxtFile() {
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await global.client.pause(500);
  await clickOn('[data-tid=createNewFile]');
  //await global.client.pause(1500);
  await clickOn('[data-tid=createTextFileButton]');
  await waitForNotification();
}

/**
 *
 * @param classNotSelected
 * @returns {Promise<void>} classSelected
 */
export async function selectAllFiles(classNotSelected) {
  await clickOn('[data-tid=gridPerspectiveOptionsMenu]');
  // todo temp fix: is not clickable
  await clickOn('[data-tid=gridPerspectiveToggleShowDirectories]');
  await global.client.pause(500);

  //SelectAllFiles
  await clickOn('[data-tid=gridPerspectiveSelectAllFiles]');

  return await waitUntilClassChanged(
    perspectiveGridTable + firstFile + '/div/div',
    classNotSelected
  );
}

export async function selectFilesByID(arrEntryIds = []) {
  await global.client.pause(500);
  await clickOn('[data-tid=gridPerspectiveSwitchLayoutToRow]');
  for (let i = 0; i < arrEntryIds.length; i++) {
    let entry = await global.client.$(
      '[data-entry-id="' + arrEntryIds[i] + '"]'
    );
    entry = await entry.$('[data-tid=rowCellTID]');
    await entry.click();
  }
  await clickOn('[data-tid=gridPerspectiveSwitchLayoutToGrid]');
}

export async function selectRowFiles(arrIndex = []) {
  await global.client.pause(500);
  await clickOn('[data-tid=gridPerspectiveSwitchLayoutToRow]');
  // const filesList = await global.client.$('[data-tid=perspectiveGridFileTable]');
  const filesList = await global.client.$$('[data-tid=rowCellTID]');
  const arrElements = [];
  for (let i = 0; i < arrIndex.length; i++) {
    const index =
      arrIndex[i] < 0 ? filesList.length + arrIndex[i] : arrIndex[i];
    if (filesList[index]) {
      let parent = await filesList[index].$('..');
      parent = await parent.$('..');
      parent = await parent.$('..');
      arrElements.push(await parent.getAttribute('data-entry-id'));
      filesList[index].click();
    } else {
      console.log(
        'selectRowFiles filesList.length:' +
          filesList.length +
          ' with index:' +
          index +
          ' not exist'
      );
    }
  }
  await clickOn('[data-tid=gridPerspectiveSwitchLayoutToGrid]');
  return arrElements;
}

/**
 * TODO holdDownKey + click not work:
 * @param arrIndex
 * @returns {Promise<[]>}
 */
export async function selectFiles(arrIndex = []) {
  // console.debug(JSON.stringify(await global.client.status()));

  const filesList = await global.client.$$(perspectiveGridTable + firstFile);
  const arrElements = [];
  //await global.client.keys('Shift');
  await holdDownKey('\uE008');
  for (let i = 0; i < arrIndex.length; i++) {
    const index =
      arrIndex[i] < 0 ? filesList.length + arrIndex[i] : arrIndex[i];

    // await holdDownKey('\uE008');
    filesList[index].click();
    //await global.client.keys('Shift');
    //await releaseKey('\uE008');
    // await global.client.releaseActions();
    arrElements.push(filesList[index]);
  }
  await releaseKey('\uE008');
  await global.client.releaseActions();
  return arrElements;
}

export async function holdDownKey(character) {
  await global.client.performActions([
    {
      type: 'key',
      id: 'keyboard',
      actions: [{ type: 'keyDown', value: character }]
    }
  ]);
}

export async function releaseKey(character) {
  await global.client.performActions([
    {
      type: 'key',
      id: 'keyboard',
      actions: [{ type: 'keyUp', value: character }]
    }
  ]);
}

export async function extractTags(selectorElement) {
  const arrTags = [];
  const tags = await selectorElement.$('#gridCellTags');
  if (tags) {
    const tagsList = await tags.$$('button');
    for (let i = 0; i < tagsList.length; i++) {
      arrTags.push(await tagsList[i].getAttribute('title'));
    }
  }
  return arrTags;
}

export async function removeTagFromTagMenu(tagName) {
  await clickOn('[data-tid=tagMoreButton_' + tagName + ']');
  await global.client.pause(500);
  await clickOn('[data-tid=deleteTagMenu]');
  await global.client.pause(500);
  await clickOn('[data-tid=confirmRemoveTagFromFile]');
}

export async function showFilesWithTag(tagName) {
  await clickOn('[data-tid=tagMoreButton_' + tagName + ']');
  await global.client.pause(500);
  await clickOn('[data-tid=showFilesWithThisTag]');
  await waitForNotification();
  await global.client.pause(1500); // web && minio search is slow
}

export async function expectTagsExistBySelector(
  selector,
  arrTagNames,
  exist = true
) {
  const gridElement = await global.client.$(selector);
  await expectTagsExist(gridElement, arrTagNames, exist);
}

export async function expectTagsExist(gridElement, arrTagNames, exist = true) {
  await expectExist(gridElement);
  const tags = await extractTags(gridElement);
  for (let i = 0; i < arrTagNames.length; i++) {
    const tagName = arrTagNames[i];
    expect(tags.includes(tagName)).toBe(exist);
  }
}

export async function waitForNotification(tid = 'notificationTID') {
  await global.client.pause(500);
  // await expectElementExist('[data-tid=' + tid + ']', true, 8000);
  const notificationTID = await global.client.$('[data-tid=' + tid + ']');
  if (await notificationTID.isDisplayed()) {
    const closeButton = await global.client.$('[data-tid=close' + tid + ']');
    if (await closeButton.isDisplayed()) {
      await closeButton.click();
    } else {
      // autohide Notification
      await expectElementExist('[data-tid=' + tid + ']', false, 10000);
    }
  }
}

export async function setSettings(selector) {
  await clickOn('[data-tid=settings]');
  await global.client.pause(500);
  await clickOn(selector);
  await clickOn('[data-tid=closeSettingsDialog]');
}

export async function reloadDirectory() {
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  /*const openDirMenu = await global.client.$(
    '[data-tid=folderContainerOpenDirMenu]'
  );
  await openDirMenu.waitForDisplayed();
  await openDirMenu.click();
  await delay(500);*/
  await clickOn('[data-tid=reloadDirectory]');
  /*const reloadDirectory = await global.client.$('[data-tid=reloadDirectory]');
  await reloadDirectory.waitForDisplayed();
  await reloadDirectory.click();
  await delay(500);*/
}

export async function createNewDirectory(dirName = testFolder) {
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await global.client.pause(500); // TODO the Menu is always in HTML
  await clickOn('[data-tid=newSubDirectory]');
  await global.client.pause(500);
  // set new dir name
  await setInputKeys('directoryName', dirName);
  /*const directoryName = await global.client.$('[data-tid=directoryName] input');
  await delay(500);
  await directoryName.keys(testFolder);
  await directoryName.click();
  await delay(1500);*/
  await clickOn('[data-tid=confirmCreateNewDirectory]');
  /*const confirmCreateNewDirectory = await global.client.$(
    '[data-tid=confirmCreateNewDirectory]'
  );
  await delay(1500);
  await confirmCreateNewDirectory.waitForDisplayed();
  await confirmCreateNewDirectory.click();*/
  await waitForNotification();
  // await global.client.pause(500); // minio
  return dirName;
}

export async function newHTMLFile() {
  await clickOn('[data-tid=locationManager]');
  /*const newFile = await global.client.$('[data-tid=locationManager]');
  await newFile.waitForDisplayed();
  await newFile.click();
  await delay(500);*/
  await clickOn('[data-tid=createRichTextFileButton]');
  /*const newNoteFile = await global.client.$(
    '[data-tid=createRichTextFileButton]'
  );
  await newNoteFile.waitForDisplayed();
  await newNoteFile.click();
  await delay(500);*/
}

export async function newMDFile() {
  await clickOn('[data-tid=locationManager]');
  await clickOn('[data-tid=createMarkdownButton]');
}

export async function newTEXTFile() {
  await clickOn('[data-tid=locationManager]');
  await clickOn('[data-tid=createTextFileButton]');
}

export async function closeOpenedFile() {
  await clickOn('[data-tid=fileContainerCloseOpenedFile]');
  /*const closeFile = await global.client.$(
    '[data-tid=fileContainerCloseOpenedFile]'
  );
  await closeFile.waitForDisplayed();
  await closeFile.click();
  await delay(500);*/
}

export async function deleteDirectory() {
  await global.client.pause(500);
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await clickOn('[data-tid=deleteDirectory]');
  /*const deleteDirectory = await global.client.$('[data-tid=deleteDirectory]');
  await deleteDirectory.waitForDisplayed();
  await delay(500);
  await deleteDirectory.click();*/
  await clickOn('[data-tid=confirmDeleteFileDialog]');
  await waitForNotification();
  /*const confirmDeleteDirectory = await global.client.$(
    '[data-tid=confirmDeleteDirectoryDialog]'
  );
  await confirmDeleteDirectory.waitForDisplayed();
  await delay(500);
  await confirmDeleteDirectory.click();
  await delay(500);*/
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

export async function openCloseAboutDialog(title) {
  await delay(500);
  const viewMainMenuButton = await global.client.$('#viewerMainMenuButton');
  await viewMainMenuButton.waitForDisplayed();
  await viewMainMenuButton.click();
  await delay(1500);
  const aboutButton = await global.client.$('#aboutButton');
  await aboutButton.waitForDisplayed();
  await aboutButton.click();
  await delay(1500);
  // const getTitle = await global.client.$('h4=' + title);
  // await getTitle.waitForDisplayed();
  // // should eventually equals('About HTML Viewer');
  // expect(getTitle).toBe(title);
  const closeAboutDialogButton = await global.client.$(
    '#closeAboutDialogButton'
  );
  await closeAboutDialogButton.waitForDisplayed();
  await closeAboutDialogButton.click();
  await delay(500);
}

export async function openSettings(selectedTab) {
  await global.client.waitForVisible('[data-tid=settings]');
  await global.client.click('[data-tid=settings]');
  if (selectedTab) {
    await global.client.waitForVisible('[data-tid=' + selectedTab + ']');
    await global.client.click('[data-tid=' + selectedTab + ']');
  }
}

describe('TST07 - General', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
  });

  it.skip('TST0701 - Open About TagSpaces', async () => {
    await global.client.waitForVisible('[data-tid=aboutTagSpaces]');
    await global.client.click('[data-tid=aboutTagSpaces]');
    await global.client.waitForVisible('[data-tid=closeAboutDialog]');
    await global.client.click('[data-tid=closeAboutDialog]');
  });

  it.skip('TST0705 - Open Settings Dialog', async () => {
    await global.client.waitForVisible('[data-tid=settings]');
    await global.client.click('[data-tid=settings]');
    await checkForIdExist('settingsDialog');
    await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    await global.client.click('[data-tid=closeSettingsDialog]');
  });

  it.skip('TST07** - Change theme color', async () => {
    await global.client.waitForVisible('[data-tid=settings]');
    await global.client.click('[data-tid=settings]');
    await delay(500);
    // activate dark theme
    await global.client.waitForVisible('[data-tid=settingsSetCurrentTheme]');
    await global.client.selectByValue(
      '[data-tid=settingsSetCurrentTheme]/div/select',
      'dark'
    );
    await delay(500);
    // const style = await global.client.getAttribute('//button[contains(., "done")]', 'style');
    // await delay(500);
    // expect(style).toContain('rgb(208, 107, 100)');
    // await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    // await global.client.click('[data-tid=closeSettingsDialog]');
  });

  /* it('TST10** - Desktop Mode', async () => {
    await createLocation(defaultLocationPath, testLocationName, false);
    await checkForIdExist('folderContainerLocationChooser');
    await delay(500);
    await global.client.waitForVisible('[data-tid=settings]');
    await global.client.click('[data-tid=settings]');
    await global.client.waitForVisible('[data-tid=settingsSetDesktopMode]');
    await global.client.click('[data-tid=settingsSetDesktopMode]');
    await delay(2000);
    await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    await global.client.click('[data-tid=closeSettingsDialog]');
    // set desktop mode and check for desktop text / Location Chooser bottom in Toolbar
    const isDesktopMode = await global.client.element('[data-tid=folderContainerLocationChooser]');
    await delay(500);
    expect(isDesktopMode.selector).not.toBe('[data-tid=folderContainerLocationChooser]');
  }); */

  // it('TST1003 - Checkbox in the settings to open the tag library on startup', async () => {
  //
  // });
});
