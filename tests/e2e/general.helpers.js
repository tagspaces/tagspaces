/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */
import { expect } from '@playwright/test';
import pathLib from 'path';
import AppConfig from '../../src/renderer/AppConfig';
import { dataTidFormat } from '../../src/renderer/services/test';
import { getS3File } from '../s3rver/S3DataRefresh';
import { createFileS3, createLocalFile, delay } from './hook';
import { firstFile, openContextEntryMenu, toContainTID } from './test-utils';

import fse from 'fs-extra';
import {
  createPwLocation,
  createS3Location,
} from './location.helpers';

export const defaultLocationName = 'supported-filestypes';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location Name Changed';
export const tsFolder = '\\.ts'; // escape dot
export const selectorFile =
  '//*[@data-tid="perspectiveGridFileTable"]/div/span';
export const selectorFolder =
  '//*[@data-tid="perspectiveGridFileTable"]/div/div';

const testFolder = 'testFolder';
const testLocationName = '' + new Date().getTime();

export async function takeScreenshot(testInfo, title = 'failure') {
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
    const buffer = await global.client.locator(selector).screenshot({
      ...options,
    });
    return buffer.toString('base64');
  } catch (e) {
    console.log('getElementScreenshot ' + selector + ' error: ', e);
  }
  return undefined;
}

export async function clickOn(selector, options = { timeout: 15000 }) {
  try {
    await global.client.click(selector, options);
  } catch (e) {
    console.log('clickOn ' + selector + ' error: ', e);
    throw e;
  }
}

/**
 * Click an element if it's visible, otherwise silently skip.
 * Use for optional UI elements like upload dialogs that may auto-dismiss.
 */
export async function clickOnIfVisible(selector, timeout = 3000) {
  try {
    await global.client.waitForSelector(selector, {
      state: 'visible',
      timeout,
    });
    await global.client.click(selector);
  } catch (e) {
    // Element didn't appear — that's OK for optional UI
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

/**
 * Checks if a locator has a background-image property that resolves to a loadable URL.
 * @param {string} locator
 * @returns {Promise<boolean>}
 */
export async function isBackgroundImageLoaded(targetSelector) {
  const locator = global.client.locator(targetSelector);
  return await locator.evaluate((el) => {

    const style = window.getComputedStyle(el);
    const bgImage = style.backgroundImage;

    // 1. Check if property exists and is not 'none'
    if (!bgImage || bgImage === 'none') {
      return false;
    }

    // 2. Extract URL (Handles quotes/no-quotes: url("...") or url(...))
    // Note: This grabs the first URL if multiple backgrounds exist
    const urlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
    
    // If no URL found (e.g., it's a linear-gradient), return false
    if (!urlMatch) return false;
    
    const url = urlMatch[1];

    // 3. Verify image loads
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      
      // Check if already cached/complete
      if (img.complete && img.naturalWidth > 0) return resolve(true);

      img.onload = () => resolve(img.naturalWidth > 0);
      img.onerror = () => resolve(false);
    });
  });
}



// Utility to get style attribute
export async function getAttribute(selector, attribute = 'style') {
  return await global.client
    .locator(selector)
    .evaluate((el, attr) => el.getAttribute(attr), attribute);
  //const element = global.client.locator(selector);
  //return await element.getAttribute(attribute);
}

export async function setInputValue(selector, value) {
  await global.client.locator(selector).fill(value);
}

/**
 * @param tid
 * @param value
 * @param delay
 * @returns {Promise<*>}
 * @deprecated use typeInputValue instead
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
  await global.client.fill(inputSelector, value, {
    delay,
  });
  /*if (global.isWin) {
    // todo on windows not always wait for typing value
    await global.client.waitForTimeout(1000);
  }*/
  return oldValue;
}


/**
 * @param fileIndex
 * @param cleanTags
 * @returns {Promise<string>} fileName; example usage: getFileName(-1) will return the last one
 */
export async function getGridFileName(fileIndex, cleanTags = true) {
  try {
    await global.client.waitForSelector(selectorFile, {
      state: 'visible',
      timeout: 8000,
    });
    const filesList = await global.client.$$(selectorFile);
    if (filesList.length > 0) {
      let file =
        fileIndex < 0
          ? filesList[filesList.length + fileIndex]
          : filesList[fileIndex];
      const fileNameElem = await file.$('div div div:nth-child(2) p');
      const fileName = await fileNameElem.getAttribute('title');
      return cleanTags ? fileName.replace(/ *\[[^\]]*]/, '') : fileName;
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
      (rows, revIndex) => {
        if (rows.length > 0 && revIndex <= rows.length) {
          return {
            id: rows[revIndex].getAttribute('data-tid'),
            file: rows[revIndex].querySelector('th').innerText,
          };
        }
        return undefined;
      },
      revIndex
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

export async function expectMediaPlay(visible = true, expectedFileName) {
  const fLocator = await frameLocator();
  const videoLocator = fLocator.locator('video');
  await expect(videoLocator).toBeVisible({
    timeout: 15000,
    visible: visible,
  });
  if (visible) {
    // Integration smoke test for the media-player (Vidstack) extension:
    // opening a video file mounts the player and TS wires the correct source
    // into it through the tsfile: protocol. We deliberately do NOT assert
    // decode/duration/seek/error. Confirmed on CI: the Lite Electron build on
    // the GH Actions runner cannot decode video for ANY codec — ogv, mp4 and
    // webm all yield video.error.code === 4 (MEDIA_ERR_SRC_NOT_SUPPORTED)
    // even though currentSrc is correctly attached. That is a runner media-
    // stack limitation, not a TagSpaces bug, and no test can make the runner
    // decode — which is why every past format swap (ogv→mp4→webm) failed and
    // a webm test was deleted. The decode-independent signal we CAN assert:
    // the player mounted and currentSrc resolves to the opened file.
    await videoLocator.evaluate((v) => v.scrollIntoView());
    await expect
      .poll(() => videoLocator.evaluate((v) => v.currentSrc || ''), {
        timeout: 20000,
      })
      .not.toBe('');
    const { src, errorCode } = await videoLocator.evaluate((v) => ({
      src: v.currentSrc || '',
      errorCode: v.error ? v.error.code : 0,
    }));
    // Logged for diagnostics only — NOT asserted. errorCode 4 here is the
    // runner failing to decode, not a TS regression (see comment above).
    if (errorCode !== 0) {
      console.log(
        'expectMediaPlay: media element error code ' +
          errorCode +
          ' (expected on CI — decode not asserted) src=' +
          src,
      );
    }
    if (expectedFileName) {
      expect(decodeURIComponent(src)).toContain(expectedFileName);
    }
  }
}

export async function expectAllFileSelected(isSelected = true) {
  let filesList = await global.client.$$(selectorFile);
  for (let i = 0; i < filesList.length; i++) {
    let file = await filesList[i].$('div');
    file = await file.$('div');
    const selectedAttr = await file.getAttribute('data-selected'); 
    const selected = selectedAttr === 'true';
    expect(selected).toBe(isSelected);
  }
}

export async function expectElementSelected(
  selector,
  isSelected = true,
  timeout = 4000,
) {
  const sel = `[data-tid="fsEntryName_${dataTidFormat(selector)}"]`;

  await expectElementExist(sel, true, timeout);

  const item = await global.client.$(sel);

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const selectionAttribute = await item.evaluate(el => el.getAttribute('data-selected'));
    const selected = selectionAttribute === 'true';
    if (selected === isSelected) {
      expect(selected).toBe(isSelected); // Pass the test if the condition is met
      return;
    }

    await global.client.waitForTimeout(100); // Small delay to avoid excessive CPU usage
  }

  throw new Error(
    `Element ${sel} did not reach expected selected state: ${isSelected} within ${timeout}ms`,
  );
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
  { isS3, testDataDir },
  locationPath = '',
  locationName = defaultLocationName,
  isDefault = false,
  fullTextIndexing = false,
  expectFolderExist = 'empty_folder',
) {
  await clickOn('[data-tid=locationManager]');
  if (isS3) {
    await createS3Location(
      locationPath,
      locationName,
      isDefault,
      fullTextIndexing,
    );
  } else {
    await createPwLocation(
      pathLib.join(testDataDir, locationPath),
      locationName,
      isDefault,
      fullTextIndexing,
    );
  }
  await clickOn('[data-tid=location_' + locationName + ']');
  if (expectFolderExist) {
    await expectElementExist(
      getGridFileSelector(expectFolderExist),
      true,
      30000,
    );
  }
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
      '[data-tid=' + perspective + 'PerspectiveToggleShowDirectories] input',
    );
  } else {
    await global.client.uncheck(
      '[data-tid=' + perspective + 'PerspectiveToggleShowDirectories] input',
    );
  }

  await clickOn('[data-tid=defaultSettings]');
}
/**
 *
 * @param classNotSelected
 * @returns {Promise<void>} classSelected
 */
export async function selectAllFiles() {

  // SelectAllFiles
  await clickOn('[data-tid=gridPerspectiveSelectAllFiles]');
}

export async function selectFilesByID(arrEntryIds = []) {
  for (let i = 0; i < arrEntryIds.length; i++) {
    await clickOn(
      'div[data-entry-id="' + arrEntryIds[i] + '"] div:nth-child(3) div button',
    );
  }
}

export async function selectRowFiles(arrIndex = []) {
  await setGridOptions('grid', false);
  const filesList = await global.client.$$(
    '[data-tid=perspectiveGridFileTable] > div > span',
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
        const spanEl = await divEl.$(
          'div:nth-child(3) div span',
        );
        await spanEl.click();
      }
    }
  }
  expect(arrElements.length).toBe(arrIndex.length);
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
  // await global.client.keys('Shift');
  await holdDownKey('\uE008');
  for (let i = 0; i < arrIndex.length; i++) {
    const index =
      arrIndex[i] < 0 ? filesList.length + arrIndex[i] : arrIndex[i];

    // await holdDownKey('\uE008');
    filesList[index].click();
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
  const moreSelector = '[data-tid=tagMoreButton_' + tagName + ']';
  // The tag chip in PropertiesTagsSelectTID can take a moment to render
  // after the input-Enter add path. In sidecar mode the file path does
  // not change, so the properties panel does not get a full re-render
  // and the more-button may attach to the DOM slightly later than the
  // grid tag chip. Wait for attachment first (cheaper than visible
  // check), then scroll it into the viewport — on smaller CI runners
  // the chip can render below the fold of the properties panel.
  const handle = await global.client.waitForSelector(moreSelector, {
    state: 'attached',
    timeout: 15000,
  });
  if (handle && handle.scrollIntoViewIfNeeded) {
    try {
      await handle.scrollIntoViewIfNeeded();
    } catch {
      /* element may have detached during scroll — clickOn below will
         retry/wait or report the real error */
    }
  }
  await clickOn(moreSelector);
  await clickOn('[data-tid=deleteTagMenu]');
  // await clickOn('[data-tid=confirmRemoveTagFromFile]');
  await isDisplayed(moreSelector, false, 4000);
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

/**
 * TODO fix scroll
 * @param fileType
 * @param extensionType
 * @param extension
 * @returns {Promise<void>}
 */
export async function setFileTypeExtension(
  fileType,
  extensionType = 'viewer',
  extension = 'Text_Editor',
) {
  await clickOn('[data-tid=settings]');
  await clickOn('[data-tid=fileTypeSettingsDialog]');
  const selector = '[data-tid=' + extensionType + 'TID' + fileType + ']';

  await clickOn(selector);
  await clickOn(
    '[data-tid=' + extension + extensionType + 'TID' + fileType + ']',
  );
  await clickOn('[data-tid=closeSettingsDialog]');
}

export async function expectMetaFileContain(
  { testDataDir, isS3 },
  metaFile,
  rootFolder,
  contain,
  timeout,
) {
  await checkSettings('[data-tid=settingsSetShowUnixHiddenEntries]', true);
  //await clickOn('[data-tid=folderContainerOpenDirMenu]');
  //await clickOn('[data-tid=reloadDirectory]');
  if (await isDisplayed(getGridFileSelector(AppConfig.metaFolder))) {
    await openFolder(AppConfig.metaFolder);

    await expectElementExist(getGridFileSelector(metaFile), true, timeout);
    await openFile(metaFile, 'showPropertiesTID');
    if (isS3) {
      await expectS3FileContain(metaFile, rootFolder, contain);
    } else {
      await expectLocalFileContain(
        { testDataDir },
        metaFile,
        rootFolder,
        contain,
      );
    }
    //await expectFileContain(contain, timeout);
    await clickOn('[data-tid=gridPerspectiveOnBackButton]');

    await expectElementExist(
      getGridFileSelector(AppConfig.metaFolder),
      true,
      timeout,
    );
    await checkSettings('[data-tid=settingsSetShowUnixHiddenEntries]', false);
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

export async function writeTextInIframeInput(
  txt,
  editorSelector = '#monaco_editor',
) {
  const fLocator = await frameLocator();
  const editor = await fLocator.locator(editorSelector);
  await editor.click();
  //await monacoEditor.fill(txt);
  await global.client.keyboard.press('ControlOrMeta+KeyA'); //'Meta+KeyA');
  try {
    await editor.fill(txt); // on mac it's have error for monaco editor is not input
  } catch (e) {
    await editor.type(txt);
  }
}

export async function createRevision(
  newFileContent = 'txt',
  editorSelector = '#monaco_editor',
) {
  await clickOn('[data-tid=fileContainerEditFile]');
  await writeTextInIframeInput(newFileContent, editorSelector);
  await clickOn('[data-tid=fileContainerSaveFile]');
  await clickOn('[data-tid=cancelEditingTID]');

  // The Revisions tab is rendered only once the just-created backup dir
  // is detected; on object-store/remote (S3) locations that can lag the
  // save. Wait for the tab to mount before clicking, unless a revision
  // row is already visible.
  if (!(await isDisplayed('[data-tid=viewRevisionTID]', true, 1000))) {
    await expectElementExist('[data-tid=revisionsTabTID]', true, 15000);
    await clickOn('[data-tid=revisionsTabTID]');
  }
  await expectElementExist('[data-tid=viewRevisionTID]');
}

export function normalized(content) {
  // Remove uuid/id string props and lmdt/cdt/size numeric props (supports decimals & exponents).
  // The pattern tries to consume an adjacent comma (either before or after the prop) to avoid leaving dangling commas.
  const withoutProps = content.replace(
    /(?:,\s*"(?:uuid|id)"\s*:\s*"[^"]*"|"(?:uuid|id)"\s*:\s*"[^"]*"\s*,|,\s*"(?:lmdt|cdt|size)"\s*:\s*-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|"(?:lmdt|cdt|size)"\s*:\s*-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\s*,)/g,
      '',
  );

  // Cleanup leftover commas and whitespace to keep JSON-like structure valid
  const cleaned = withoutProps
    .replace(/,\s*,/g, ',')     // collapse accidental double-commas
    .replace(/\{\s*,/g, '{')    // remove comma after opening brace
    .replace(/,\s*}/g, '}')     // remove comma before closing brace
    .replace(/\[\s*,/g, '[')    // same for arrays
    .replace(/,\s*\]/g, ']')
    .trim();

  return cleaned;
}
/**
 * Assert that a local file contains the given substring.
 *
 * @param filePath - Path to the file on disk.
 * @param fileName
 * @param rootFolder
 * @param txtToContain - Substring you expect to find in the file.
 */
export async function expectLocalFileContain(
  { testDataDir },
  fileName,
  rootFolder,
  txtToContain = 'etete&5435',
) {
  const filePath = pathLib.join(testDataDir, rootFolder, fileName);
  // Read the file as UTF-8 text
  const content = await fse.readFile(filePath, 'utf-8');
  const contentN = normalized(content);
  const txtToContainN = normalized(txtToContain);

  /*  if (!contentN.includes(txtToContainN)) {
    throw new Error(
      `Expected file ${filePath} to contain ${txtToContainN}, but it did not: ${contentN}`
    );
  }*/
  expect(contentN).toContain(txtToContainN);
}

export async function expectS3FileContain(
  fileName,
  rootFolder,
  txtToContain = 'etete&5435',
) {
  const filePath = rootFolder + '/' + fileName; //pathLib.join(rootFolder,fileName); //testDataDir, rootFolder, fileName);

  const content = await getS3File(filePath);
  const contentN = normalized(content);
  const txtToContainN = normalized(txtToContain);

  /*  if (!contentN.includes(txtToContainN)) {
    throw new Error(
      `Expected file ${filePath} to contain ${txtToContainN}, but it did not: ${contentN}`
    );
  }*/
  expect(contentN).toContain(txtToContainN);
}

export async function expectFileContain(
  txtToContain = 'etete&5435',
  timeout = 10000,
  iframeLocator = 'iframe[referrerpolicy="no-referrer"]',
) {
  await expect
    .poll(
      async () => {
        const fLocator = await frameLocator(iframeLocator);
        const bodyTxt = await fLocator.locator('body').innerText();
        // console.log('>>>>> '+ bodyTxt);
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

export async function expectFileSizeGt(
  greater = 2,
  timeout = 10000,
  iframeLocator = 'iframe[referrerpolicy="no-referrer"]',
) {
  await expect
    .poll(
      async () => {
        const fLocator = await frameLocator(iframeLocator);
        const bodyTxt = await fLocator.locator('body').innerText();
        //console.log(bodyTxt);
        return bodyTxt !== undefined && bodyTxt.length > greater;
      },
      {
        message: 'make sure bodyTxt size > ' + greater, // custom error message
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

export async function addDescription(desc) {
  await clickOn('[data-tid=descriptionTabTID]');
  // The Milkdown editor only exposes a contenteditable host once edit mode
  // is on. A single click on the description body does NOT toggle edit mode
  // (only `onDoubleClick` does), so click the dedicated edit button instead.
  await clickOn('[data-tid=editDescriptionTID]');
  const editor = await global.client.waitForSelector(
    '[data-tid=descriptionTID] [contenteditable=true]',
  );
  try {
    await editor.fill(desc);
  } catch (e) {
    await editor.type(desc);
  }
  await clickOn('[data-tid=saveDescriptionTID]');
}

export async function createFile(
  { isS3, testDataDir },
  fileName,
  fileContent,
  rootFolder,
) {
  if (isS3) {
    await createFileS3(fileName, fileContent, rootFolder);
  } else {
    await createLocalFile(testDataDir, fileName, fileContent, rootFolder);
  }
}

export async function openFolder(folderName) {
  await openContextEntryMenu(getGridFileSelector(folderName), 'openDirectory');
  await expectElementExist(
    '[data-tid=currentDir_' + dataTidFormat(folderName) + ']',
    true,
    8000,
  );
}

export async function openFolderProp(
  folderName,
  menuOption = 'showProperties',
) {
  await openContextEntryMenu(getGridFileSelector(folderName), menuOption);
  await expectElementExist(
    '[data-tid=OpenedTID' + dataTidFormat(folderName) + ']',
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

export async function setPerspectiveSetting(
  perspective,
  selector,
  isChecked = true,
  isDefault = true,
) {
  await clickOn('[data-tid=' + perspective + 'SettingsDialogOpenTID]');
  if (isChecked) {
    await global.client.check(selector + ' input');
    expect(await global.client.isChecked(selector + ' input')).toBeTruthy();
  } else {
    await global.client.uncheck(selector + ' input');
    expect(await global.client.isChecked(selector + ' input')).not.toBeTruthy();
  }
  if (isDefault) {
    await clickOn('[data-tid=defaultSettings]');
  } else {
    await clickOn('[data-tid=directorySettings]');
  }
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
  await clickOn('[data-tid=reloadDirectory]');
}

export async function createNewDirectory(dirName = testFolder) {
  await isDisplayed('[data-tid=folderContainerOpenDirMenu]', true, 8000);
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await clickOn('[data-tid=newSubDirectory]');
  // set new dir name
  await setInputValue('[data-tid=directoryName] input', dirName);
  await clickOn('[data-tid=confirmCreateNewDirectory]');
  await expectElementExist(getGridFileSelector(dirName), true, 50000);
  // await waitForNotification();
  return dirName;
}

export async function newHTMLFile() {
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await clickOn('[data-tid=createHTMLTextFileTID]');
  await clickOn('[data-tid=createTID]');
  await waitForNotification();
}

export async function newMDFile() {
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await clickOn('[data-tid=createNewMarkdownFileTID]');
  await clickOn('[data-tid=createTID]');
  await waitForNotification();
}

export async function createTxtFile() {
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await clickOn('[data-tid=createNewTextFileTID]');
  await clickOn('[data-tid=createTID]');
  await waitForNotification();
}

export async function closeOpenedFile() {
  await clickOn('[data-tid=fileContainerCloseOpenedFile]');
}

export async function deleteDirectory() {
  await clickOn('[data-tid=folderContainerOpenDirMenu]');
  await clickOn('[data-tid=deleteDirectory]');
  await clickOn('[data-tid=confirmDeleteFileDialog]');
}

export async function toHaveText() {
  await delay(500);
  const file = await global.client.$(perspectiveGridTable + firstFile);
  console.log(file.getText());
  expect(file).toBe(filename);
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
  const closeAboutDialogButton = await global.client.$(
    '#closeAboutDialogButton',
  );
  await closeAboutDialogButton.waitForDisplayed();
  await closeAboutDialogButton.click();
  await delay(500);
}

