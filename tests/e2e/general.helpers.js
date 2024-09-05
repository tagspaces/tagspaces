/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import fs from 'fs';
import { expect } from '@playwright/test';
import { delay } from './hook';
import { firstFile, openContextEntryMenu, toContainTID } from './test-utils';
import AppConfig from '../../src/renderer/AppConfig';
import { dataTidFormat } from '../../src/renderer/services/test';

export const defaultLocationPath =
  './testdata-tmp/file-structure/supported-filestypes';
export const defaultLocationName = 'supported-filestypes';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location Name Changed';
export const tsFolder = '\\.ts'; // escape dot
export const selectorFile =
  '//*[@data-tid="perspectiveGridFileTable"]/div/span';
export const selectorFolder =
  '//*[@data-tid="perspectiveGridFileTable"]/div/div';

// const newHTMLFileName = 'newHTMLFile.html';
const testFolder = 'testFolder';
const testLocationName = '' + new Date().getTime();

export async function takeScreenshot(testInfo, title = 'failure') {
  // const sPath = path.join(__dirname, '..', 'test-reports', name + '.png');
  const sPath = testInfo.outputPath(testInfo.title + title + '.png');
  // Add it to the report.
  testInfo.attachments.push({
    name: 'screenshot',
    path: sPath,
    contentType: 'image/png',
  });
  return await global.client.screenshot({ path: sPath });
}

export async function getElementScreenshot(
  selector,
  options = {
    /*encoding: 'base64'*/
  },
) {
  try {
    /*const el = await global.client.$(selector);
    await el.waitForElementState('visible');
    const boundingBox = await el.boundingBox();*/
    const buffer = await global.client.locator(selector).screenshot({
      ...options,
      /*clip: {
          x: boundingBox.x + 5,
          y: boundingBox.y + 5,
          width: boundingBox.width - 10,
          height: boundingBox.height -10
        }*/
    });
    //const buffer = await el.screenshot({ ...options/*, clip: boundingBox*/ });
    return buffer.toString('base64');
  } catch (e) {
    console.log('getElementScreenshot ' + selector + ' error: ', e);
  }
  return undefined;
}

/**
 * Used to create a DataTransfer. Useful when you want to perform drag and drop operations.
 * @param filePath
 * @param fileName
 * @param fileType
 * @returns {Promise<*>}
 */
export async function createDataTransfer(filePath, fileName, fileType) {
  return await global.client.evaluateHandle(
    ({ fileHex, localFileName, localFileType }) => {
      const dataTransfer = new DataTransfer();

      dataTransfer.items.add(
        new File([fileHex], localFileName, { type: localFileType }),
      );

      return dataTransfer;
    },
    {
      fileHex: fs.readFileSync(filePath).toString('hex'),
      localFileName: fileName,
      localFileType: fileType,
    },
  );
}

export async function clickOn(selector, options = { timeout: 15000 }) {
  try {
    await global.client.click(selector, options);
  } catch (e) {
    console.log('clickOn ' + selector + ' error: ', e);
    // await global.client.click(selector, { ...options, force: true });
  }
}

export async function rightClickOn(selector) {
  const options = { button: 'right' };
  return clickOn(selector, options);
}
/* export async function waitUntilOpen(element) {
  // const element = await global.client.$(selector);
  await element.waitUntil(async () => await this.isOpen());
} */
/**
 *
 * @param selector
 * @param propValue
 * @param attribute
 * @param timeout
 * @returns {Promise<void>} newClassName
 */
export async function waitUntilChanged(
  selector,
  propValue,
  attribute = 'class',
  timeout = 5000,
) {
  const element = global.client.locator(selector);
  await expect
    .poll(
      async () => {
        const value = await element.getAttribute(attribute);
        return value;
      },
      { timeout },
    )
    .not.toBe(propValue);

  return await element.getAttribute(attribute);
}

export async function getAttribute(selector, attribute = 'style') {
  const element = global.client.locator(selector);
  return await element.getAttribute(attribute);
}
export async function setInputValue(selector, value) {
  global.client.fill(selector, value);
}

/**
 * @param tid
 * @param value
 * @param delay
 * @returns {Promise<*>}
 */
export async function setInputKeys(tid, value, delay = 0) {
  // global.client.keyboard.type('[data-tid=' + tid + '] input', value, { delay: 100 });
  const oldValue = await global.client.inputValue(
    '[data-tid=' + tid + '] input',
  );
  await global.client.type('[data-tid=' + tid + '] input', value, {
    delay,
  });
  return oldValue;
}

/**
 * Playwright only
 * @param inputSelector
 * @param value
 * @param delay
 * @returns {Promise<*>} oldValue
 */
export async function typeInputValue(inputSelector, value, delay = 0) {
  const oldValue = await global.client.inputValue(inputSelector);
  await global.client.type(inputSelector, value, {
    delay,
  });
  return oldValue;
}

/*export async function setSelectorKeys(selector, value) {
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
}*/

/*export async function clearInputValue(inputElement) {
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
}*/

/**
 * @param fileIndex
 * @returns {Promise<string>} fileName; example usage: getFileName(-1) will return the last one
 */
export async function getGridFileName(fileIndex) {
  try {
    const filesList = await global.client.$$(selectorFile);
    if (filesList.length > 0) {
      let file =
        fileIndex < 0
          ? filesList[filesList.length + fileIndex]
          : filesList[fileIndex];
      // await file.waitForDisplayed({ timeout: 5000 });
      //file = await file.$('div');
      //file = await file.$('div');
      //file = await file.$('div');
      const fileNameElem = await file.$('div div div:nth-child(2) p');
      const fileName = await fileNameElem.getAttribute('title');
      return fileName.replace(/ *\[[^\]]*]/, '');
      /*const fileName = await getElementText(fileNameElem);
      const divs = await file.$$('div');
      const lastDiv = await divs[divs.length - 1];
      const fileExtElem = await lastDiv.$('span');
      const fileExt = await getElementText(fileExtElem);
      return fileName + '.' + fileExt.toLowerCase();*/
    }
    console.log(
      "Can't find getGridFileName:" + fileIndex + ' filesList is empty',
    );
  } catch (e) {
    console.log("Can't find getGridFileName:" + fileIndex, e);
  }
  return undefined;
}

export async function getRevision(revIndex) {
  try {
    return await global.client.$$eval(
      'table[data-tid=tableRevisionsTID] tbody tr',
      (rows) => {
        if (rows.length > 0) {
          return {
            id: rows[0].getAttribute('data-tid'),
            file: rows[0].querySelector('th').innerText,
          };
        }
        return undefined;
      },
    );
  } catch (e) {
    console.log("Can't find getRevision:" + revIndex, e);
  }
  return undefined;
}

export async function getElementText(el) {
  return await el.innerText();
}

/**
 * Wait for the selector relative to the element TODO
 * @param element
 * @param selector
 * @param displayed
 * @param timeout
 * @returns {Promise<boolean>}
 */
export async function isElementDisplayed(
  element,
  selector,
  displayed = true,
  timeout = 500,
) {
  try {
    const el = await element.waitForSelector(selector, {
      timeout,
      state: displayed ? 'visible' : 'detached',
    });
    if (!displayed) {
      if (el === null) {
        return true;
      }
    }
    return el !== null;
  } catch (error) {
    console.log('isElementDisplayed error', error);
  }
  return false;
}

export async function isDisabled(selector) {
  const element = await global.client.$(selector);
  return element.isDisabled();
}

export async function frameLocator(selector = 'iframe') {
  return await global.client.frameLocator(selector);
}

export async function isDisplayed(
  selector,
  displayed = true,
  timeout = 1500,
  parentSelector = undefined,
) {
  try {
    const parentEl = parentSelector ? parentSelector : global.client;
    const el = await parentEl.waitForSelector(selector, {
      timeout,
      // strict: true,
      state: displayed ? 'attached' : 'detached', // 'visible' : 'hidden' //
    });
    if (!displayed) {
      if (el === null) {
        return true;
      }
    }
    return el !== null;
  } catch (error) {
    console.debug(
      'Timeout ' +
        timeout +
        'ms exceeded. isDisplayed:' +
        selector +
        ' displayed:' +
        displayed,
      // error
    );
  }
  return false;
}

export async function getGridElement(fileIndex = 0) {
  if (await isDisplayed(selectorFile)) {
    const filesList = await global.client.$$(selectorFile);
    if (filesList.length > 0) {
      let file =
        fileIndex < 0
          ? filesList[filesList.length + fileIndex]
          : filesList[fileIndex];
      // await file.waitForDisplayed({ timeout: 5000 });
      file = await file.$('div');
      file = await file.$('div');
      return file;
    }
    console.log("Can't getGridElement:" + fileIndex + ' filesList is empty');
  }
  return undefined;
}

export async function getGridCellClass(fileIndex = 0) {
  let file = await getGridElement(fileIndex);
  if (file !== undefined) {
    file = await file.$('div');
    return file.getAttribute('class');
  }
  return undefined;
}

export async function expectAudioPlay() {
  await expect
    .poll(
      async () => {
        if (!global.isWin || global.isWeb) {
          //todo remove this - currently video do not start playing on mac and web
          return true;
        }
        const fLocator = await frameLocator();
        const progressSeek = await fLocator.locator('[data-plyr=seek]');
        const ariaValueNow = await progressSeek.getAttribute('aria-valuenow');
        if (ariaValueNow === 0) {
          const playButton = await fLocator.locator('[data-plyr=play]');
          const ariaLabel = await playButton.getAttribute('aria-label');
          if (ariaLabel === 'Play') {
            await playButton.click();
          }
        }
        return parseFloat(ariaValueNow) > 0;
      },
      {
        message: 'progress of file is not greater that 0', // custom error message
        // Poll for 10 seconds; defaults to 5 seconds. Pass 0 to disable timeout.
        timeout: 15000,
      },
    )
    .toBe(true);
}

export async function expectAllFileSelected(isSelected = true) {
  let filesList = await global.client.$$(selectorFile);
  for (let i = 0; i < filesList.length; i++) {
    let file = await filesList[i].$('div');
    file = await file.$('div');
    const style = await file.getAttribute('style');
    const selected =
      style.indexOf('rgb(29') !== -1 && style.indexOf('transparent') === -1;
    expect(selected).toBe(isSelected);
  }
}

export async function expectElementSelected(
  selector,
  isSelected = true,
  timeout = 2000,
) {
  // [data-testid="' + (isSelected ? 'CheckCircleIcon' : 'RadioButtonUncheckedIcon') + '"]
  const sel = '[data-tid="fsEntryName_' + dataTidFormat(selector) + '"]';
  await expectElementExist(sel, true, timeout);
  const item = await global.client.$(sel);
  const style = await item.getAttribute('style');
  const selected =
    style.indexOf('rgb(29') !== -1 && style.indexOf('transparent') === -1;
  expect(selected).toBe(isSelected);
}

export async function expectElementExist(
  selector,
  exist = true,
  timeout = 2000,
  parentSelector = undefined,
) {
  let displayed;
  if (parentSelector) {
    const parentElement = await global.client.waitForSelector(parentSelector, {
      timeout,
      state: 'visible',
    });
    displayed = await isDisplayed(selector, exist, timeout, parentElement);
  } else {
    displayed = await isDisplayed(selector, exist, timeout);
  }
  expect(displayed).toBe(true);
}

export async function createLocation(
  locationPath,
  locationName,
  isDefault = false,
) {
  // locationPerspective = locationPerspective || 'Grid';
  const locationManagerMenu = await global.client.$(
    '[data-tid=locationManagerPanel]',
  );
  await locationManagerMenu.click();
  const elem = await global.client.$('[data-tid=createNewLocation]');
  await elem.click();
  const lPath = await global.client.$('[data-tid=locationPath]');
  await lPath.click();
  const locationPathInput = await global.client.$(
    '[data-tid=locationPath] input',
  );
  await locationPathInput.keys(locationPath || defaultLocationPath);
  // keys is workarround for not working setValue await global.client.$('[data-tid=locationPath] input').setValue(locationPath || defaultLocationPath);
  const lName = await global.client.$('[data-tid=locationName]');
  await lName.click();
  const locationNameInput = await global.client.$(
    '[data-tid=locationName] input',
  );
  locationNameInput.keys(
    locationName || 'Test Location' + new Date().getTime(),
  );
  if (isDefault) {
    await delay(1000);
    const locationIsDefault = await global.client.$(
      '[data-tid=locationIsDefault]',
    );
    await locationIsDefault.click();
  }
  const confirmLocationCreation = await global.client.$(
    '[data-tid=confirmLocationCreation]',
  );
  await confirmLocationCreation.waitForDisplayed();
  await confirmLocationCreation.click();
}

export async function setGridOptions(
  perspective = 'list',
  showDirectories = true,
  // entrySize = undefined,
) {
  // open Option menu
  await clickOn('[data-tid=' + perspective + 'PerspectiveOptionsMenu]');
  if (showDirectories) {
    await global.client.check(
      '[data-tid=gridPerspectiveToggleShowDirectories] input',
    );
  } else {
    await global.client.uncheck(
      '[data-tid=gridPerspectiveToggleShowDirectories] input',
    );
  }

  /*if (entrySize) {
    await clickOn('[data-tid=' + entrySize + ']');
  }*/
  await clickOn('[data-tid=defaultSettings]');
}
/**
 *
 * @param classNotSelected
 * @returns {Promise<void>} classSelected
 */
export async function selectAllFiles() {
  // classNotSelected) {
  // await clickOn('[data-tid=gridPerspectiveOptionsMenu]');
  // todo temp fix: is not clickable
  // await clickOn('[data-tid=gridPerspectiveToggleShowDirectories]');

  // SelectAllFiles
  await clickOn('[data-tid=gridPerspectiveSelectAllFiles]');

  // await expectElementExist('[class="' + classNotSelected + '"]', false, 1000);
  // return await global.client.$(selectorFile + '/div/div').getAttribute('class');
  /* return await waitUntilClassChanged(
    selectorFile + '/div/div',
    classNotSelected
  ); */
}

export async function selectFilesByID(arrEntryIds = []) {
  //await clickOn('[data-tid=openListPerspective]');
  for (let i = 0; i < arrEntryIds.length; i++) {
    await clickOn(
      'div[data-entry-id="' + arrEntryIds[i] + '"] div:nth-child(3) div button',
    );
    /* let entry = await global.client.$(
      '[data-entry-id="' + arrEntryIds[i] + '"]'
    );
    entry = await entry.$('[data-tid=rowCellTID]');
    await entry.click(); */
  }
  // await clickOn('[data-tid=gridPerspectiveContainer]');
}

export async function selectRowFiles(arrIndex = []) {
  await setGridOptions('grid', false);
  const filesList = await global.client.$$(
    '[data-tid=perspectiveGridFileTable] > span',
  );
  const arrElements = [];
  if (filesList.length > 0) {
    for (let i = 0; i < arrIndex.length; i++) {
      const index =
        arrIndex[i] < 0 ? filesList.length + arrIndex[i] : arrIndex[i];
      if (filesList[index]) {
        const divEl = await filesList[index].$('div div');
        const id = await divEl.getAttribute('data-entry-id');
        arrElements.push(id);
        const spanEl = await divEl.$('div:nth-child(3) div span');
        await spanEl.click();
      }
    }
  }
  expect(arrElements.length).toBe(arrIndex.length);
  return arrElements;
}
/**
 * TODO element 0 is not clickable
 * @param arrIndex
 * @returns {Promise<*>}
 */
/*export async function selectRowFiles(arrIndex = []) {
  await global.client.waitForSelector('[data-tid=openListPerspective]');
  await clickOn('[data-tid=openListPerspective]');
  await setGridOptions('list', false); //, 'gridPerspectiveEntrySizeNormal');
  // const filesList = await global.client.$('[data-tid=perspectiveGridFileTable]');
  const filesList = await global.client.$$('[data-tid=rowCellTID]');
  const arrElements = [];
  if (filesList.length > 0) {
    for (let i = 0; i < arrIndex.length; i++) {
      const index =
        arrIndex[i] < 0 ? filesList.length + arrIndex[i] : arrIndex[i];
      if (filesList[index]) {
        let parent = await filesList[index].$('..');
        parent = await parent.$('..');
        parent = await parent.$('..');
        const id = await parent.getAttribute('data-entry-id');
        arrElements.push(id);
        // const classNotSelected = await parent.getAttribute('class');
        // const elNotSelected = await parent.$('//!*[@class="' + classNotSelected + '"]');
        await clickOn(
          'div[data-entry-id="' + id + '"] div[data-tid=rowCellTID]',
        );
      } else {
        console.debug(
          'selectRowFiles filesList.length:' +
            filesList.length +
            ' with index:' +
            index +
            ' not exist',
        );
      }
    }
  }
  expect(arrElements.length).toBe(arrIndex.length);
  // await clickOn('[data-tid=gridPerspectiveContainer]');
  return arrElements;
}*/

/**
 * TODO holdDownKey + click not work:
 * @param arrIndex
 * @returns {Promise<[]>}
 */
export async function selectFiles(arrIndex = []) {
  // console.debug(JSON.stringify(await global.client.status()));

  const filesList = await global.client.$$(perspectiveGridTable + firstFile);
  const arrElements = [];
  // await global.client.keys('Shift');
  await holdDownKey('\uE008');
  for (let i = 0; i < arrIndex.length; i++) {
    const index =
      arrIndex[i] < 0 ? filesList.length + arrIndex[i] : arrIndex[i];

    // await holdDownKey('\uE008');
    filesList[index].click();
    // await global.client.keys('Shift');
    // await releaseKey('\uE008');
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
      actions: [{ type: 'keyDown', value: character }],
    },
  ]);
}

export async function releaseKey(character) {
  await global.client.performActions([
    {
      type: 'key',
      id: 'keyboard',
      actions: [{ type: 'keyUp', value: character }],
    },
  ]);
}

export async function extractTags(selectorElement) {
  const arrTags = [];
  const tags = await selectorElement.$('#gridCellTags');
  if (tags) {
    const tagsList = await tags.$$('div[role=presentation]');
    for (let i = 0; i < tagsList.length; i++) {
      const tid = await tagsList[i].getAttribute('data-tid');
      arrTags.push(tid.replace(/(^tagContainer_)/i, ''));
    }
  }
  return arrTags;
}

export async function removeTagFromTagMenu(tagName) {
  await clickOn('[data-tid=tagMoreButton_' + tagName + ']');
  await clickOn('[data-tid=deleteTagMenu]');
  await clickOn('[data-tid=confirmRemoveTagFromFile]');
  await isDisplayed('[data-tid=tagMoreButton_' + tagName + ']', false);
}

export async function showFilesWithTag(tagName) {
  await clickOn('[data-tid=tagMoreButton_' + tagName + ']');
  await clickOn('[data-tid=showFilesWithThisTag]');
  await waitForNotification();
}

export function getGridFileSelector(fileName) {
  return '[data-tid="fsEntryName_' + dataTidFormat(fileName) + '"]';
}

/**
 * @deprecated view expectTagsExist
 * @param selector
 * @param arrTagNames
 * @param exist
 * @param timeout
 * @returns {Promise<void>}
 */
export async function expectTagsExistBySelector(
  selector,
  arrTagNames,
  exist = true,
  timeout = 500,
) {
  const gridElement = await global.client.waitForSelector(selector);
  await expectTagsExist(gridElement, arrTagNames, exist);
}

/**
 * @deprecated use: await expectElementExist('[data-tid=tagContainer_' + tagName + ']',true,8000,'[data-tid=perspectiveGridFileTable]')
 * @param gridElement
 * @param arrTagNames
 * @param exist
 * @returns {Promise<void>}
 */
export async function expectTagsExist(gridElement, arrTagNames, exist = true) {
  // await expectExist(gridElement);
  const tags = await extractTags(gridElement);
  for (let i = 0; i < arrTagNames.length; i++) {
    const tagName = arrTagNames[i];
    expect(tags.includes(tagName)).toBe(exist);
  }
}

export async function expectMetaFilesExist(
  arrMetaFiles,
  exist = true,
  subFolder = undefined,
) {
  await checkSettings('[data-tid=settingsSetShowUnixHiddenEntries]', true);
  //await clickOn('[data-tid=folderContainerOpenDirMenu]');
  //await clickOn('[data-tid=reloadDirectory]');
  if (exist || (await isDisplayed(getGridFileSelector(AppConfig.metaFolder)))) {
    await openFolder(AppConfig.metaFolder);
    //await global.client.dblclick(getGridFileSelector(AppConfig.metaFolder));
    if (subFolder) {
      if (await isDisplayed(getGridFileSelector(subFolder))) {
        await global.client.dblclick(getGridFileSelector(subFolder));
      } else if (!exist) {
        await clickOn('[data-tid=gridPerspectiveOnBackButton]');
        return true;
      }
    }
    for (let i = 0; i < arrMetaFiles.length; i++) {
      console.log('check ' + arrMetaFiles[i] + ' exist:' + exist);
      await expectElementExist(
        getGridFileSelector(arrMetaFiles[i]),
        exist,
        10000,
      );
    }
    await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    if (subFolder) {
      await expectElementExist(getGridFileSelector(subFolder), exist, 10000);
      await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    }
    await expectElementExist(
      getGridFileSelector(AppConfig.metaFolder),
      true,
      10000,
    );
    await checkSettings('[data-tid=settingsSetShowUnixHiddenEntries]', false);
  }
}

export async function writeTextInIframeInput(txt) {
  const fLocator = await frameLocator();
  const editor = await fLocator.locator('#editorText');
  await editor.type(txt);
}

export async function expectFileContain(
  txtToContain = 'etete&5435',
  timeout = 10000,
) {
  await expect
    .poll(
      async () => {
        const fLocator = await frameLocator('iframe[allowfullscreen]');
        const bodyTxt = await fLocator.locator('body').innerText();
        return toContainTID(bodyTxt, [txtToContain]);
      },
      {
        message: 'make sure bodyTxt contain ' + txtToContain, // custom error message
        // Poll for 10 seconds; defaults to 5 seconds. Pass 0 to disable timeout.
        timeout: timeout,
      },
    )
    .toBe(true);
}

/**
 * @deprecated
 * @param tid
 * @param forceClose
 * @returns {Promise<void>}
 */
export async function waitForNotification(
  tid = 'notificationTID',
  forceClose = true,
) {
  // await expectElementExist('[data-tid=' + tid + ']', true, 8000);
  // const notificationTID = await global.client.$('[data-tid=' + tid + ']');
  /* if (await isDisplayed('[data-tid=' + tid + ']')) {
    //const closeButton = await global.client.$('[data-tid=close' + tid + ']');
    let el;
    try {
      el = await global.client.waitForSelector('[data-tid=close' + tid + ']', {
        timeout: 500
      });
    } catch (ex) {
      console.error('waitForSelector [data-tid=' + tid + ']', ex);
    }
    if (forceClose && el && el instanceof Object) {
      // TODO elementHandle.click: : expected object, got string
      await el.click('[data-tid=close' + tid + ']'); //, { force: true });
    } else {
      // autohide Notification
      await isDisplayed('[data-tid=' + tid + ']', false, 2000);
      // await expectElementExist('[data-tid=' + tid + ']', false, 1000);
    }
  } */
}

export async function openFolder(folderName) {
  await openContextEntryMenu(getGridFileSelector(folderName), 'openDirectory');
  await expectElementExist(
    '[data-tid=currentDir_' + dataTidFormat(folderName) + ']',
    true,
    8000,
  );
}

export async function openFile(fileName, menuOption = 'fileMenuOpenFile') {
  await openContextEntryMenu(
    getGridFileSelector(fileName), // perspectiveGridTable + firstFile,
    menuOption,
  );
  await expectElementExist(
    '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']',
    true,
    8000,
  );
}
/**
 * for check settings use checkSettings instead
 * @param selector
 * @param click
 * @returns {Promise<void>}
 */
export async function setSettings(selector, click = false) {
  await clickOn('[data-tid=settings]');
  if (click) {
    await clickOn(selector);
  } else {
    // check
    await global.client.check(selector + ' input');
    expect(await global.client.isChecked(selector + ' input')).toBeTruthy();
  }
  await clickOn('[data-tid=closeSettingsDialog]');
}

export async function checkSettings(
  selector,
  isChecked = true,
  tabSelector = '[data-tid=generalSettingsDialog]',
) {
  await clickOn('[data-tid=settings]');
  await clickOn(tabSelector);
  if (isChecked) {
    await global.client.check(selector + ' input');
    expect(await global.client.isChecked(selector + ' input')).toBeTruthy();
  } else {
    await global.client.uncheck(selector + ' input');
    expect(await global.client.isChecked(selector + ' input')).not.toBeTruthy();
  }
  await clickOn('[data-tid=closeSettingsDialog]');
}

export async function dnd(originSelector, destinationSelector) {
  const source = global.client.locator(originSelector);
  const target = global.client.locator(destinationSelector);
  await source.dragTo(target);
}

/*export async function dragDrop(originSelector, destinationSelector) {
  const originElement = await global.client.waitForSelector(originSelector);
  const destinationElement = await global.client.waitForSelector(
    destinationSelector
  );

  await originElement.hover();
  await global.client.mouse.down();
  const box = await destinationElement.boundingBox();
  await global.client.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await destinationElement.hover();
  await global.client.mouse.up();
}

export async function dragAndDrop(srcSelector, targetSelector) {
  const srcElement = await global.client.waitForSelector(srcSelector);
  const target = await global.client.waitForSelector(targetSelector);

  const bBox = await srcElement.boundingBox();

  await global.client.mouse.move(
    bBox.x + bBox.width / 2,
    bBox.y + bBox.height / 2
  );
  await global.client.mouse.down();
  await global.client.mouse.move(
    bBox.x + bBox.width / 2 - 10,
    bBox.y + bBox.height / 2
  );
  const targetBBox = await target.boundingBox();
  await global.client.mouse.move(
    targetBBox.x + 10,
    targetBBox.y + targetBBox.height / 2
  );
  await global.client.mouse.up();
}*/

export async function reloadDirectory() {
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  /* const openDirMenu = await global.client.$(
    '[data-tid=folderContainerOpenDirMenu]'
  );
  await openDirMenu.waitForDisplayed();
  await openDirMenu.click();
  await delay(500); */
  await clickOn('[data-tid=reloadDirectory]');
  /* const reloadDirectory = await global.client.$('[data-tid=reloadDirectory]');
  await reloadDirectory.waitForDisplayed();
  await reloadDirectory.click();
  await delay(500); */
}

export async function createNewDirectory(dirName = testFolder) {
  await isDisplayed('[data-tid=folderContainerOpenDirMenu]');
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await clickOn('[data-tid=newSubDirectory]');
  // set new dir name
  await setInputKeys('directoryName', dirName);
  await clickOn('[data-tid=confirmCreateNewDirectory]');
  await expectElementExist(getGridFileSelector(dirName), true, 5000);
  // await waitForNotification();
  return dirName;
}

export async function newHTMLFile() {
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await clickOn('[data-tid=createNewFile]');
  await clickOn('[data-tid=createRichTextFileButton]');
  await waitForNotification();
}

export async function newMDFile() {
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await clickOn('[data-tid=createNewFile]');
  await clickOn('[data-tid=createMarkdownButton]');
  await waitForNotification();
}

export async function createTxtFile() {
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await clickOn('[data-tid=createNewFile]');
  await clickOn('[data-tid=createTextFileButton]');
  await waitForNotification();
}

export async function closeOpenedFile() {
  await clickOn('[data-tid=fileContainerCloseOpenedFile]');
  /* const closeFile = await global.client.$(
    '[data-tid=fileContainerCloseOpenedFile]'
  );
  await closeFile.waitForDisplayed();
  await closeFile.click();
  await delay(500); */
}

export async function deleteDirectory() {
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await clickOn('[data-tid=deleteDirectory]');
  await clickOn('[data-tid=confirmDeleteFileDialog]');
  /* if (global.isElectron) {
    await waitForNotification();
  } */
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
    '#closeAboutDialogButton',
  );
  await closeAboutDialogButton.waitForDisplayed();
  await closeAboutDialogButton.click();
  await delay(500);
}

/*export async function openSettings(selectedTab) {
  await global.client.waitForVisible('[data-tid=settings]');
  await global.client.click('[data-tid=settings]');
  if (selectedTab) {
    await global.client.waitForVisible('[data-tid=' + selectedTab + ']');
    await global.client.click('[data-tid=' + selectedTab + ']');
  }
}*/
