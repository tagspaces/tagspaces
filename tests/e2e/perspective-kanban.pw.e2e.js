/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { dataTidFormat } from '../../src/renderer/services/test';
import { AddRemovePropertiesTags } from './file.properties.helpers';
import { expect, test } from './fixtures';
import {
  clickOn,
  expectElementExist,
  getAttribute,
  getElementScreenshot,
  getGridFileSelector,
  isBackgroundImageLoaded,
  isDisplayed,
  rightClickOn,
  setPerspectiveSetting,
  typeInputValue,
  waitUntilChanged,
} from './general.helpers';
import {
  createFolderS3,
  createLocalFolder,
  startTestingApp,
  stopApp,
} from './hook';
import {
  createPwLocation,
  createS3Location,
  defaultLocationName,
} from './location.helpers';
import {
  createColumn,
  createMdCard,
  dragKanBanColumn,
  expectFirstColumnElement,
  getColumnsIds,
} from './perspective-kanban.helpers';
import { openContextEntryMenu } from './test-utils';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  if (isS3) {
    await startTestingApp({ isWeb, isS3, webServerPort, testInfo });
    await closeWelcomePlaywright();
  } else {
    await startTestingApp(
      { isWeb, isS3, webServerPort, testInfo },
      'extconfig.js',
    );
  }
});

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async ({ page }, testInfo) => {
  /*if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }*/
  await clearDataStorage();
});

test.beforeEach(async ({ isS3, testDataDir }) => {
  if (isS3) {
    await createS3Location('', defaultLocationName, true);
  } else {
    await createPwLocation(testDataDir, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await clickOn('[data-tid=openKanbanPerspective]');
  await expectElementExist(
    '[data-tid=kanbanSettingsDialogOpenTID]',
    true,
    10000,
  );
  // Reload folder to ensure fresh S3 data is loaded
  await clickOn('[data-tid=kanbanPerspectiveOnReloadDirectory]');
  await expectElementExist(
    '[data-tid=empty_folderKanBanColumnTID]',
    true,
    20000,
  );
});

test.describe('TST49 - Perspective KanBan', () => {
  test('TST4901 - Folder which is opened in kanban for the first time [web,s3,electron,_pro]', async ({
    isS3,
    testDataDir,
  }) => {
    // Open max 3 sub-folders as columns on fresh folder
    await expectElementExist(
      '[data-tid=kanbanSettingsDialogOpenTID]',
      true,
      5000,
    );
    if (isS3) {
      await createFolderS3('test_kanban_column1');
      await createFolderS3('test_kanban_column2');
      await createFolderS3('test_kanban_column3');
      await createFolderS3('test_kanban_column4');
      // Allow S3 to settle after folder creation
      await global.client.waitForTimeout(2000);
    } else {
      await createLocalFolder(testDataDir, 'test_kanban_column1');
      await createLocalFolder(testDataDir, 'test_kanban_column2');
      await createLocalFolder(testDataDir, 'test_kanban_column3');
      await createLocalFolder(testDataDir, 'test_kanban_column4');
    }

    await global.client.dblclick('[data-tid=empty_folderKanBanColumnTID]');
    // dblclick navigates into folder, which may switch to default Grid perspective
    // re-open Kanban perspective after navigation
    await clickOn('[data-tid=openKanbanPerspective]');
    await expectElementExist(
      '[data-tid=kanbanSettingsDialogOpenTID]',
      true,
      10000,
    );
    await expectElementExist(
      '[data-tid=test_kanban_column1KanBanColumnTID]',
      true,
      20000,
    );
    await expectElementExist(
      '[data-tid=test_kanban_column2KanBanColumnTID]',
      true,
      10000,
    );
    await expectElementExist(
      '[data-tid=test_kanban_column3KanBanColumnTID]',
      true,
      10000,
    );
    await expectElementExist(
      '[data-tid=test_kanban_column4KanBanColumnTID]',
      false,
      5000,
    );
  });

  test('TST4902 - Show current folder [web,s3,electron,_pro]', async () => {
    if (await isDisplayed('[data-tid=hideFolderContentTID]')) {
      await clickOn('[data-tid=hideFolderContentTID]');
    }
    await expectElementExist(
      '[data-tid=empty_folderKanBanColumnTID]',
      true,
      5000,
    );
    await expectElementExist(
      '[data-tid=currentFolderKanBanColumnTID]',
      false,
      5000,
    );

    await clickOn('[data-tid=showFolderContentTID]');

    await expectElementExist(
      '[data-tid=currentFolderKanBanColumnTID]',
      true,
      5000,
    );
  });

  test('TST4903 - Create new columns(sub-folder) [web,s3,electron,_pro]', async () => {
    await createColumn('testFolder');
  });

  test('TST4904 - Rename column [web,s3,electron,_pro]', async () => {
    const columnName = 'testFolderTmp';
    const newColumnName = 'testFolderRenamed';
    //create new folder
    await createColumn(columnName);

    //rename folder
    await clickOn('[data-tid=' + columnName + 'KanBanColumnActionTID]');
    await clickOn('[data-tid=renameDirectory]');

    await typeInputValue(
      '[data-tid=renameEntryDialogInput] input',
      newColumnName,
      0,
    );
    await clickOn('[data-tid=confirmRenameEntry]');
    await expectElementExist(
      '[data-tid=' + newColumnName + 'KanBanColumnTID]',
      true,
      5000,
    );
  });

  test('TST4905 - Create card in column [web,s3,electron,_pro]', async () => {
    await createMdCard('testCard');
  });

  test('TST4906 - Rename card in column [web,s3,electron,_pro]', async () => {
    const cardName = 'testCard1';
    const newCardName = 'testCard2';
    const {id, name} = await createMdCard(cardName);

    await rightClickOn('[data-entry-id="' + id + '"]');
    await clickOn('[data-tid=fileMenuRenameFile]');
    await typeInputValue(
      '[data-tid=renameEntryDialogInput] input',
      newCardName,
      0,
    );
    await clickOn('[data-tid=confirmRenameEntry]');

    await expectElementExist(
      '[data-tid=fsEntryName_' + dataTidFormat(name) + '_md]',
      true,
    );
  });

  test('TST4907 - Add and show tag to column [web,s3,electron,_pro]', async () => {
    const columnName = 'tagsColumn';

    await setPerspectiveSetting(
      'kanban',
      '[data-tid=kanBanPerspectiveToggleShowDetails]',
    );
    //create new folder
    await createColumn(columnName);
    await clickOn('[data-tid=' + columnName + 'KanBanColumnActionTID]');
    await clickOn('[data-tid=showProperties]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(columnName) + ']',
      true,
      10000,
    );
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2'], {
      add: true,
      remove: false,
      expectProp: true,
    });
  });

  test('TST4908 - Add and show tag to board [web,s3,electron,_pro]', async () => {
    if (await isDisplayed('[data-tid=hideFolderContentTID]')) {
      await clickOn('[data-tid=hideFolderContentTID]');
    }
    await setPerspectiveSetting(
      'kanban',
      '[data-tid=kanBanPerspectiveToggleShowDetails]',
    );
    await clickOn('[data-tid=folderContainerOpenDirMenu]');
    await clickOn('[data-tid=showProperties]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(defaultLocationName) + ']',
      true,
      8000,
    );
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2'], {
      add: true,
      remove: false,
    });
  });

  test('TST4909 - move with copy/move file dialog [web,s3,electron,_pro]', async () => {
    const fileName = 'sample.bmp';

    await setPerspectiveSetting(
      'kanban',
      '[data-tid=kanbanPerspectiveToggleShowFolderContent]',
    );

    await expectElementExist(getGridFileSelector(fileName), true, 8000);
    await openContextEntryMenu(
      getGridFileSelector(fileName),
      'fileMenuMoveCopyFile',
    );
    await clickOn('[data-tid=MoveTargetempty_folder]');
    await clickOn('[data-tid=confirmMoveFiles]');

    // hide empty_folder in order to expect moved file is not shown
    /* await clickOn('[data-tid=empty_folderKanBanColumnActionTID]');
    await clickOn('[data-tid=columnVisibilityTID]');
    await expectElementExist(getGridFileSelector(fileName), false, 5000);*/

    await openContextEntryMenu(
      getGridFileSelector('empty_folder'),
      'openDirectory',
    );
    /*
    todo fileName not always show in KanBan empty_folder dir content is hidden -> hideFolderContentTID must be clicked on
    if (await isDisplayed('[data-tid=showFolderContentTID]')) {
     await clickOn('[data-tid=showFolderContentTID]');
    }*/
    await clickOn('[data-tid=openDefaultPerspective]');
    await expectElementExist(getGridFileSelector(fileName), true, 5000);
    await clickOn('[data-tid=openKanbanPerspective]');
  });

  test('TST4910 - prev/next button [web,s3,electron,_pro]', async () => {
    const fileName = 'sample.3gp';
    const nextFileName = 'sample.avif';
    if (await isDisplayed('[data-tid=showFolderContentTID]')) {
      await clickOn('[data-tid=showFolderContentTID]');
    }
    await expectElementExist(getGridFileSelector(fileName), true, 8000);
    await clickOn(getGridFileSelector(fileName));
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']',
      true,
      5000,
    );
    await clickOn('[data-tid=fileContainerNextFile]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(nextFileName) + ']',
      true,
      5000,
    );
    await clickOn('[data-tid=fileContainerPrevFile]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']',
      true,
      5000,
    );
  });

  test('TST4911 - Load folder color [web,s3,electron,_pro]', async () => {
    const columnName = 'testColorColumn';

    //create new folder
    await createColumn(columnName);
    await clickOn('[data-tid=' + columnName + 'KanBanColumnActionTID]');
    await clickOn('[data-tid=showProperties]');

    const targetSelector =
      '[data-tid="' + columnName + 'CTID"]';
    const initScreenshot = await getElementScreenshot(targetSelector);
    const initClass = await getAttribute(targetSelector, 'class');
    await clickOn('[data-tid=changeBackgroundColorTID]');
    await clickOn('[data-tid=backgroundTID1]');

    await waitUntilChanged(
      targetSelector,
      initClass,
      'class',
      15000,
    );

    const withBgnColorScreenshot = await getElementScreenshot(targetSelector);
    const bgClass = await getAttribute(targetSelector, 'class');
    expect(initScreenshot).not.toBe(withBgnColorScreenshot);

    // remove background
    await clickOn('[data-tid=backgroundClearTID]');
    await clickOn('[data-tid=confirmConfirmResetColorDialog]');

    await waitUntilChanged(targetSelector, bgClass, 'class', 15000);

    //const bgRemovedStyle = await getAttribute(targetSelector, 'style');
    //expect(initStyle).toBe(bgRemovedStyle);

    //const bgnRemovedScreenshot = await getElementScreenshot(targetSelector);
    //expect(initScreenshot).toBe(withBgnColorScreenshot);
  });
  test('TST4912 - Move card to top / bottom [web,s3,electron,_pro]', async () => {
    const cardName1 = 'testCard1';
    const cardName2 = 'testCard2';
    const card1 = await createMdCard(cardName1);
    const card2 = await createMdCard(cardName2);

    // Close any opened file panel so it doesn't block right-click on cards
    await clickOn('[data-tid=fileContainerCloseOpenedFile]');

    const sel1 = '[data-tid=fsEntryName_' + dataTidFormat(cardName1) + '_md]';
    const sel2 = '[data-tid=fsEntryName_' + dataTidFormat(cardName2) + '_md]';

    // card2 (newest) should appear first in the column
    await expectFirstColumnElement(card2.id);

    await rightClickOn(sel2);
    await clickOn('[data-tid=reorderBottomTID]');
    await expectElementExist(sel2, true, 5000);
    // card2 at bottom: card1 should now be first
    await expectFirstColumnElement(card1.id);

    await rightClickOn(sel1);
    await clickOn('[data-tid=reorderBottomTID]');
    await expectElementExist(sel1, true, 5000);
    // card1 also at bottom: card2 should now be first
    await expectFirstColumnElement(card2.id);

    await rightClickOn(sel1);
    await clickOn('[data-tid=reorderTopTID]');
    await expectElementExist(sel1, true, 5000);
    // card1 moved to top: card1 should now be first
    await expectFirstColumnElement(card1.id);
  });

  test('TST4913 - Show column details [web,s3,electron,_pro]', async () => {
    const columnName = 'empty_folder';
    await clickOn('[data-tid=' + columnName + 'KanBanColumnActionTID]');
    await clickOn('[data-tid=showProperties]');
    await expectElementExist('[data-tid=OpenedTIDempty_folder]', true, 10000);
  });

  test('TST4914 - Show current folder details [web,s3,electron,_pro]', async () => {
    const columnName = 'empty_folder';
    await global.client.dblclick(
      '[data-tid=' + columnName + 'KanBanColumnTID]',
    );
    await clickOn('[data-tid=folderContainerOpenDirMenu]');
    await clickOn('[data-tid=showProperties]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(columnName) + ']',
      true,
      8000,
    );
  });

  test('TST4915a - Load thumbnails for board [web,s3,electron,_pro]', async ({isWin}) => {
    if(!isWin) {
      //board thumbnail
      await setPerspectiveSetting(
        'kanban',
        '[data-tid=kanBanPerspectiveToggleShowDetails]',
      );
      const targetSelector = '[data-tid=folderThumbTID]'; 

      const loaded = await isBackgroundImageLoaded(targetSelector);
      // test if the columns uses the first tmb in .ts as folder tmb
      expect(loaded).toBe(true);

      // TODO continue test
      // await clickOn('[data-tid=showFolderContentTID]');
      // await openContextEntryMenu(
      //   getGridFileSelector('sample.bmp'),
      //   'setAsThumbTID',
      // );

      // global.client.on('dialog', async dialog => {
      //   await dialog.accept();
      // });

      // const loaded2 = await isBackgroundImageLoaded(targetSelector);
      // expect(loaded).toBe(true);



    }
  });

  test('TST4915b - Load thumbnails for column [web,s3,electron,_pro]', async ({isWin}) => {
    if(!isWin) {
      await setPerspectiveSetting(
        'kanban',
        '[data-tid=kanBanPerspectiveToggleShowSubFolderDetails]',
      );
      const columnName = 'empty_folder2';
      await createColumn(columnName);
      await clickOn('[data-tid=' + columnName + 'KanBanColumnActionTID]');
      await clickOn('[data-tid=showProperties]');
      await expectElementExist(
        '[data-tid=OpenedTID' + columnName + ']',
        true,
        5000,
      );

      await clickOn('[data-tid=changeThumbnailTID]');
      await clickOn('[data-tid=predefinedThumbnailsTID] > li');
      await clickOn('[data-tid=confirmCustomThumb]');
      const targetSelector = '[data-tid=' + columnName + 'KanBanColumnThumbTID]';

      // Wait for thumbnail to be applied and rendered
      await global.client.waitForTimeout(2000);
      const loaded = await isBackgroundImageLoaded(targetSelector);
      expect(loaded).toBe(true);

      await clickOn('[data-tid=changeThumbnailTID]');
      await clickOn('[data-tid=predefinedThumbnailsTID] > li:nth-child(2)');
      await clickOn('[data-tid=confirmCustomThumb]');

      // Wait for thumbnail to be applied and rendered
      await global.client.waitForTimeout(2000);
      const loaded2 = await isBackgroundImageLoaded(targetSelector);
      expect(loaded2).toBe(true);
    }
  });

  /**
   * todo web minio not work with thumbnails on Windows
   */
  test('TST4915c - Load thumbnails for cards [web,s3,electron,_pro]', async ({isWin}) => {
    if(!isWin) {
      const columnName = 'empty_folder3';
      await createColumn(columnName);
      //card thumbnail
      const cardName = 'testCard';
      const { name } = await createMdCard(cardName, columnName);

      await expectElementExist(
        '[data-tid=OpenedTID' + dataTidFormat(name) + '_md]',
        true,
        5000,
      );

      const cardSelector = '[data-tid="' + columnName + 'CTID"] [data-tid=fsEntryName_' + dataTidFormat(name) + '_md]';
      const initScreenshot = await getElementScreenshot(cardSelector);
      expect(initScreenshot).toBeDefined();

      await clickOn('[data-tid=changeThumbnailTID]');
      await clickOn('[data-tid=predefinedThumbnailsTID] > li');
      await clickOn('[data-tid=confirmCustomThumb]');

      // Wait for thumbnail to be applied and rendered, poll until screenshot changes
      await expect
        .poll(
          async () => {
            const screenshot = await getElementScreenshot(cardSelector);
            return screenshot !== initScreenshot;
          },
          { timeout: 15000 },
        )
        .toBe(true);
    }
  });

  test('TST4916 - Move columns with dnd [web,s3,electron,_pro]', async () => {
    const srcColumnName = 'column1';
    const midColumnName = 'column2';
    const destColumnName = 'column3';

    await createColumn(srcColumnName);
    await createColumn(midColumnName);
    await createColumn(destColumnName);

    const initColumns = await getColumnsIds();
    console.log(initColumns);
    expect(initColumns.slice(-3)).toEqual([
      srcColumnName,
      midColumnName,
      destColumnName,
    ]);

    await dragKanBanColumn(srcColumnName, destColumnName);
    await global.client.waitForTimeout(1000);
    const movedColumns = await getColumnsIds();
    console.log(movedColumns);

    expect(movedColumns.slice(-3)).toEqual([
      midColumnName,
      destColumnName,
      srcColumnName,
    ]);
  });

  test('TST4917 - Move column with buttons from the context menu [web,s3,electron,_pro]', async () => {
    const col1Name = 'col1';
    const col2Name = 'col2';

    await createColumn(col1Name);
    await createColumn(col2Name);

    const initColumns = await getColumnsIds();
    console.log(initColumns);
    expect(initColumns.slice(-2)).toEqual([col1Name, col2Name]);

    await clickOn('[data-tid=' + col2Name + 'KanBanColumnActionTID]');
    await clickOn('[data-tid=moveLeftTID]');

    await global.client.waitForTimeout(1000);
    const movedColumns = await getColumnsIds();
    console.log(movedColumns);
    expect(movedColumns.slice(-2)).toEqual([col2Name, col1Name]);
  });

  test('TST4918 - Open import Trello board dialog [web,s3,electron,_pro]', async () => {
    await clickOn('[data-tid=importKanBanTID]');
    await expectElementExist('[data-tid=kanBanImportDialogTID]', true, 5000);
    await clickOn('[data-tid=closeImportDialogTID]');
  });
});
