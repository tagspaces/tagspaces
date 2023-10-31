/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { expect, test } from '@playwright/test';
import {
  defaultLocationPath,
  defaultLocationName,
  deleteFileFromMenu,
  createPwMinioLocation,
  createPwLocation,
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  expectMetaFilesExist,
  getGridCellClass,
  getGridFileName,
  getGridFileSelector,
  selectAllFiles,
  selectFilesByID,
  selectorFile,
  selectorFolder,
  selectRowFiles,
  setInputKeys,
  setSettings,
  takeScreenshot,
} from './general.helpers';
import { AddRemoveTagsToSelectedFiles } from './perspective-grid.helpers';
import {
  AddRemovePropertiesTags,
  getPropertiesFileName,
} from './file.properties.helpers';
import { createFile, startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage } from './welcome.helpers';

test.beforeAll(async () => {
  await startTestingApp('extconfig.js');
  //await clearDataStorage();
});

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }
  await clearDataStorage();
  await testDataRefresh();
});

test.beforeEach(async () => {
  if (global.isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST50 - Perspective Grid', () => {
  test('TST5002 - Open file with click [web,minio,electron]', async () => {
    // await searchEngine('txt'); //testTestFilename);
    const fileName = 'sample.txt';

    // const firstFileName = await getGridFileName(0);
    await clickOn(getGridFileSelector(fileName));
    await clickOn('[data-tid=detailsTabTID]');
    // Toggle Properties
    //await clickOn('[data-tid=fileContainerToggleProperties]');
    const propsFileName = await getPropertiesFileName();
    expect(fileName).toBe(propsFileName);
    // await checkFilenameForExist(testTestFilename);
  });

  test('TST5004 - Select-deselect all files [web,minio,electron]', async () => {
    const classNotSelected = await getGridCellClass(0);
    await selectAllFiles(); // classNotSelected);
    const classSelected = await getGridCellClass(0);

    expect(classNotSelected).not.toBe(classSelected);

    let filesList = await global.client.$$(selectorFile);
    for (let i = 0; i < filesList.length; i++) {
      let file = await filesList[i].$('div');
      file = await file.$('div');
      file = await file.$('div');
      const style = await file.getAttribute('class');
      expect(style).toBe(classSelected);
    }
    //deselect
    /*await selectAllFiles();
    filesList = await global.client.$$(selectorFile);
    for (let i = 0; i < filesList.length; i++) {
      let file = await filesList[i].$('div');
      file = await file.$('div');
      file = await file.$('div');
      const style = await file.getAttribute('class');
      expect(style).toBe(classNotSelected);
    }*/
  });

  // This scenario includes "Add tags" && "Remove tags" to be fulfilled
  test('TST5005 - Add/Remove tags from selected files [web,minio,electron]', async () => {
    let selectedIds = await selectRowFiles([0, 1, 2]);

    const tags = ['test-tag1', 'test-tag2'];
    await AddRemoveTagsToSelectedFiles('list', tags);

    for (let i = 0; i < tags.length; i++) {
      await expectElementExist(
        '[data-tid=tagContainer_' + tags[i] + ']',
        true,
        5000,
      );
      // const selectBox = await global.client.$('[data-tid=perspectiveGridFileTable]');
      /* await expectTagsExistBySelector(
        '[data-entry-id="' + selectedIds[i] + '"]',
        tags,
        true
      ); */
    }

    selectedIds = await selectRowFiles([0, 1, 2]);

    // tags = ['test-tag1', 'test-tag2'];
    await AddRemoveTagsToSelectedFiles('list', tags, false);

    for (let i = 0; i < tags.length; i++) {
      await expectElementExist(
        '[data-tid=tagContainer_' + tags[i] + ']',
        false,
        5000,
      );
      /*await expectTagsExistBySelector(
        '[data-entry-id="' + selectedIds[i] + '"]',
        tags,
        false
      );*/
    }
  });

  /**
   * todo in [web] its need more time to wait for removed files
   */
  test('TST5007 - Remove all tags from selected files [web,minio,electron]', async () => {
    const selectedIds = await selectRowFiles([0, 1, 2]);
    const tags = ['test-tag1', 'test-tag2', 'test-tag3'];
    await AddRemoveTagsToSelectedFiles('list', tags, true);

    await selectFilesByID(selectedIds);

    await clickOn('[data-tid=listPerspectiveAddRemoveTags]');
    await clickOn('[data-tid=cleanTagsMultipleEntries]');

    for (let i = 0; i < tags.length; i++) {
      await expectElementExist(
        '[data-tid=tagMoreButton_' + tags[i] + ']',
        false,
        5000,
      );
    }
    /* for (let i = 0; i < selectedIds.length; i++) {
      const gridElement = await global.client.$(
        '[data-entry-id="' + selectedIds[i] + '"]'
      );
      await isElementDisplayed(gridElement);
      const tags = await extractTags(gridElement);
      expect(tags.length).toBe(0);
    } */
  });

  test('TST5008 - Copy file [web,minio,electron]', async () => {
    const fileName = 'sample.svg';
    await clickOn(getGridFileSelector(fileName));
    //Toggle Properties
    await clickOn('[data-tid=detailsTabTID]');
    // add meta json to file
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2'], {
      add: true,
      remove: false,
    });
    // open Copy/Move File Dialog
    await clickOn('[data-tid=gridPerspectiveCopySelectedFiles]');
    await clickOn('[data-tid=MoveTargetempty_folder]');
    await clickOn('[data-tid=confirmCopyFiles]');
    await clickOn('[data-tid=uploadCloseAndClearTID]');

    await global.client.dblclick(getGridFileSelector('empty_folder'));
    await expectElementExist(getGridFileSelector(fileName));

    const arrayMeta =
      global.isWeb || global.isMinio
        ? [fileName + '.json'] // check meta, thumbnails are not created on web or minio
        : [fileName + '.json', fileName + '.jpg']; // check meta and thumbnail

    await expectMetaFilesExist(arrayMeta, true);

    await clickOn('[data-tid=gridPerspectiveOnBackButton]');

    await expectElementExist(getGridFileSelector(fileName), true);
    await expectMetaFilesExist(arrayMeta, true);
  });

  test.skip('TST5009 - Copy file on different partition [manual]', async () => {});

  test('TST5010 - Move file [web,minio,electron]', async () => {
    const fileName = 'sample.svg';
    await clickOn(getGridFileSelector(fileName));
    //Toggle Properties
    await clickOn('[data-tid=detailsTabTID]');
    // add meta json to file
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2'], {
      add: true,
      remove: false,
    });
    // open Copy/Move File Dialog
    await clickOn('[data-tid=gridPerspectiveCopySelectedFiles]');
    await clickOn('[data-tid=MoveTargetempty_folder]');
    await clickOn('[data-tid=confirmMoveFiles]');

    await global.client.dblclick(getGridFileSelector('empty_folder'));
    await expectElementExist(getGridFileSelector(fileName));

    const arrayMeta =
      global.isWeb || global.isMinio
        ? [fileName + '.json'] // check meta, thumbnails are not created on web or minio
        : [fileName + '.json', fileName + '.jpg']; // check meta and thumbnail

    await expectMetaFilesExist(arrayMeta, true);

    await clickOn('[data-tid=gridPerspectiveOnBackButton]');

    await expectElementExist(getGridFileSelector(fileName), false, 8000);
    await expectMetaFilesExist(arrayMeta, false);
  });

  test.skip('TST5011 - Move file drag&drop in location navigator [manual]', async () => {});

  test.skip('TST5012 - Move file different partition [manual]', async () => {});

  test('TST5013 - Delete files from selection (many files) [web,minio,electron]', async () => {
    const selectedIds = await selectRowFiles([0, 1, 2]);

    await clickOn('[data-tid=listPerspectiveDeleteMultipleFiles]');
    await clickOn('[data-tid=confirmDeleteFileDialog]');

    await clickOn('[data-tid=openDefaultPerspective]');
    for (let i = 0; i < selectedIds.length; i++) {
      await expectElementExist(
        '[data-entry-id="' + selectedIds[i] + '"]',
        false,
        5000,
      );
    }
  });

  test.skip('TST5015 - Tag file drag&drop in perspective [manual]', async () => {});

  /* test('TST51** - Show/Hide directories in perspective view', async () => { //TODO
    await global.client.waitForVisible(
      '[data-tid=gridPerspectiveToggleShowDirectories]'
    );
    await global.client.click(
      '[data-tid=gridPerspectiveToggleShowDirectories]'
    );
    // Check if the directories are displayed
  }); */
});
