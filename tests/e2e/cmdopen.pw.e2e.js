/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */
import pathLib from 'path';
import { dataTidFormat } from '../../src/renderer/services/test';
import {
  getPropertiesFileName,
  getPropertiesTags,
} from './file.properties.helpers';
import { expect, test } from './fixtures';
import {
  clickOn,
  expectElementExist,
  removeTagFromTagMenu,
  setInputValue,
} from './general.helpers';
import {
  startTestingApp,
  stopApp,
  testDataRefresh,
} from './hook';
import { closeFileProperties } from './location.helpers';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

const testFileName = 'sample.md';

/**
 * Opens a file via the cmdopen URL parameter, simulating CLI file opening.
 * Uses Playwright's goto so the navigation lifecycle is properly tracked.
 * @param {string} filePath - Absolute path to the file to open
 */
async function openFileViaCmdOpen(filePath) {
  const encodedPath = encodeURIComponent(filePath);

  // Get the base URL from the main process
  const baseUrl = await global.app.evaluate(async ({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) throw new Error('No window found');
    const currentUrl = win.webContents.getURL();
    return currentUrl.split('?')[0].split('#')[0];
  });

  // Use Playwright's goto so it properly tracks the navigation lifecycle
  const newUrl = baseUrl + '?cmdopen=' + encodedPath;
  await global.client.goto(newUrl, { waitUntil: 'load' });

  await closeWelcomePlaywright();
}

/**
 * Add a tag via the properties panel and verify it appears there.
 * Unlike AddRemovePropertiesTags, this does NOT assert against perspectiveGridFileTable
 * which is absent when a file is opened in full-width mode via cmdopen.
 */
async function addTagInProperties(tagName) {
  const propsTags = await getPropertiesTags();
  expect(propsTags.includes(tagName)).toBe(false);
  await clickOn('[data-tid=PropertiesTagsSelectTID] input');
  await global.client.keyboard.type(tagName);
  await global.client.keyboard.press('Enter');
  await expectElementExist(
    '[data-tid=tagContainer_' + tagName + ']',
    true,
    8000,
    '[data-tid=PropertiesTagsSelectTID]',
  );
}

/**
 * Remove a tag and verify it disappears from the properties panel.
 */
async function removeTagInProperties(tagName) {
  await removeTagFromTagMenu(tagName);
  await expectElementExist(
    '[data-tid=tagContainer_' + tagName + ']',
    false,
    8000,
    '[data-tid=PropertiesTagsSelectTID]',
  );
}

test.afterEach(async ({ isS3, testDataDir }) => {
  await testDataRefresh(isS3, testDataDir);
  await clearDataStorage();
  await stopApp();
});

test.beforeEach(
  async ({ isS3, isWeb, webServerPort }, testInfo) => {
    // Start with extconfig.js which defines a location pointing to testdata
    await startTestingApp(
      { isWeb, isS3, webServerPort, testInfo },
      'extconfig.js',
    );
  },
);

test.describe('TST51 - Command line file opening', () => {
  test('TST5101 - Open file via cmdopen and verify it is displayed [electron]', async ({
    testDataDir,
  }) => {
    // pathLib.join (not string concat) — testDataDir is native-separator
    // (backslashes on Windows); concatenating '/' yields a mixed-separator
    // path that cmdopen can't resolve on Windows.
    const filePath = pathLib.join(testDataDir, testFileName);
    await openFileViaCmdOpen(filePath);

    // Verify the file is opened in the entry viewer
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(testFileName) + ']',
      true,
      15000,
    );

    // Verify the file name is shown in properties
    const propsFileName = await getPropertiesFileName();
    expect(propsFileName).toBe('sample.md');
  });

  test.skip('TST5102 - Add tags to file opened via cmdopen [electron]', async ({
    testDataDir,
  }) => {
    // pathLib.join (not string concat) — testDataDir is native-separator
    // (backslashes on Windows); concatenating '/' yields a mixed-separator
    // path that cmdopen can't resolve on Windows.
    const filePath = pathLib.join(testDataDir, testFileName);
    await openFileViaCmdOpen(filePath);

    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(testFileName) + ']',
      true,
      15000,
    );

    // Use the locator to ensure focus stays on the tag input
    const tagInput = global.client.locator(
      '[data-tid=PropertiesTagsSelectTID] input',
    );
    await tagInput.click();
    await tagInput.pressSequentially('cmdopen-tag');
    await tagInput.press('Enter');

    // Verify tag was added - check properties panel
    await expectElementExist(
      '[data-tid=tagContainer_cmdopen-tag]',
      true,
      8000,
      '[data-tid=PropertiesTagsSelectTID]',
    );
  });

  test.skip('TST5103 - Add and remove tags from file opened via cmdopen [electron]', async ({
    testDataDir,
  }) => {
    // pathLib.join (not string concat) — testDataDir is native-separator
    // (backslashes on Windows); concatenating '/' yields a mixed-separator
    // path that cmdopen can't resolve on Windows.
    const filePath = pathLib.join(testDataDir, testFileName);
    await openFileViaCmdOpen(filePath);

    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(testFileName) + ']',
      true,
      15000,
    );

    // Add then remove tag, asserting in properties panel
    await addTagInProperties('test-cmdopen');
    await removeTagInProperties('test-cmdopen');
  });

  test('TST5104 - Add description to file opened via cmdopen [electron]', async ({
    testDataDir,
  }) => {
    // pathLib.join (not string concat) — testDataDir is native-separator
    // (backslashes on Windows); concatenating '/' yields a mixed-separator
    // path that cmdopen can't resolve on Windows.
    const filePath = pathLib.join(testDataDir, testFileName);
    await openFileViaCmdOpen(filePath);

    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(testFileName) + ']',
      true,
      15000,
    );

    // Switch to description tab and enter edit mode
    await clickOn('[data-tid=descriptionTabTID]');
    await clickOn('[data-tid=editDescriptionTID]');
    const editor = await global.client.waitForSelector(
      '[data-tid=descriptionTID] [contenteditable=true]',
      { timeout: 8000 },
    );
    await editor.fill('Test description via cmdopen');

    // Verify the save button appears (indicating description changed)
    await expectElementExist('[data-tid=saveDescriptionTID]', true, 8000);
    await clickOn('[data-tid=saveDescriptionTID]');
  });

  test('TST5105 - Close file opened via cmdopen [electron]', async ({
    testDataDir,
  }) => {
    // pathLib.join (not string concat) — testDataDir is native-separator
    // (backslashes on Windows); concatenating '/' yields a mixed-separator
    // path that cmdopen can't resolve on Windows.
    const filePath = pathLib.join(testDataDir, testFileName);
    await openFileViaCmdOpen(filePath);

    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(testFileName) + ']',
      true,
      15000,
    );

    // Close the file
    await closeFileProperties();

    // Verify the file is no longer open
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(testFileName) + ']',
      false,
      5000,
    );
  });
});
