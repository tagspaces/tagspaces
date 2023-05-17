/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { expect, test } from '@playwright/test';
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  takeScreenshot,
  getGridFileSelector,
  setInputValue,
  createNewDirectory,
  dnd,
  setInputKeys
} from './general.helpers';
import { openContextEntryMenu } from './test-utils';
import { createFile, startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage } from './welcome.helpers';
import {
  AddRemovePropertiesTags,
  getPropertiesFileName,
  getPropertiesTags
} from './file.properties.helpers';

test.beforeAll(async () => {
  await startTestingApp('extconfig.js');
  // await clearDataStorage();
});

test.afterAll(async () => {
  await stopApp();
  await testDataRefresh();
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }
  await clearDataStorage();
});

test.beforeEach(async () => {
  if (global.isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');

  await openContextEntryMenu(
    '[data-tid=fsEntryName_empty_folder]',
    'showProperties'
  );
});

test.describe('TST02 - Folder properties', () => {
  test('TST0201 - Open in main area [web,minio,electron]', async () => {
    const testFile = 'file_in_empty_folder.txt';
    await createFile(testFile);

    await clickOn('[data-tid=openInMainAreaTID]');
    await expectElementExist(getGridFileSelector(testFile), true, 5000);
  });

  test('TST0204 - Reload folder from toolbar [web,minio,electron]', async () => {
    let propsTags = await getPropertiesTags();
    expect(propsTags).toHaveLength(0);
    const tagTitle = 'test-tag';
    const tsmJson = {
      appName: 'TagSpaces',
      appVersion: '5.3.5',
      description:
        "**Lorem Ipsum** is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\n## Why do we use it?\n\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose \n",
      lastUpdated: 1684224090695,
      tags: [
        {
          title: 'test-tag',
          color: '#61DD61',
          textcolor: 'white',
          type: 'sidecar'
        }
      ],
      id: '73e839b38d034a4a807971e755c17091'
    };
    await createFile('tsm.json', JSON.stringify(tsmJson), 'empty_folder/.ts');

    await clickOn('[data-tid=reloadFolderTID]');

    propsTags = await getPropertiesTags();
    expect(propsTags).toContain(tagTitle);

    const editor = await global.client.waitForSelector(
      '[data-tid=descriptionTID] .milkdown'
    );
    const description = await editor.innerText();
    expect(description.replace(/[\s*#]/g, '')).toMatch(
      tsmJson.description.replace(/[\s*#]/g, '')
    );
  });

  test('TST0205 - Delete folder from toolbar [web,minio,electron]', async () => {
    await clickOn('[data-tid=deleteFolderTID]');
    await clickOn('[data-tid=confirmSaveBeforeCloseDialog]');
    await expectElementExist('OpenedTIDempty_folder', false, 5000);
    await expectElementExist(getGridFileSelector('empty_folder'), false, 5000);
    await testDataRefresh();
  });

  test('TST0206 - Rename folder [web,minio,electron]', async () => {
    const newTile = 'folderRenamed';

    const propsFolderName = await getPropertiesFileName();
    await clickOn('[data-tid=startRenameEntryTID]');
    await setInputValue('[data-tid=fileNameProperties] input', newTile);
    await clickOn('[data-tid=confirmRenameEntryTID]');
    // await waitForNotification();
    await global.client.waitForSelector(
      '[data-tid=fileNameProperties] input[value="' + newTile + '"]'
    );
    const propsNewFolderName = await getPropertiesFileName();
    expect(propsFolderName).not.toBe(propsNewFolderName);

    //turn folderName back
    await clickOn('[data-tid=startRenameEntryTID]');
    await setInputValue('[data-tid=fileNameProperties] input', propsFolderName);
    await clickOn('[data-tid=confirmRenameEntryTID]');
    // await waitForNotification();
    await global.client.waitForSelector(
      '[data-tid=fileNameProperties] input[value="' + propsFolderName + '"]'
    );
    const propsOldFileName = await getPropertiesFileName();
    expect(propsOldFileName).toEqual(propsFolderName);
  });

  test('TST0207 - Move folder [web,minio,electron]', async () => {
    const newFolder = await createNewDirectory('targetFolder');
    await clickOn('[data-tid=moveCopyEntryTID]');
    await clickOn('[data-tid=MoveTarget' + newFolder + ']');
    await clickOn('[data-tid=confirmMoveFiles]');
    await clickOn('[data-tid=uploadCloseAndClearTID]');
    await expectElementExist(getGridFileSelector('empty_folder'), false, 5000);
    await global.client.dblclick('[data-tid=fsEntryName_' + newFolder + ']');
    await expectElementExist(getGridFileSelector('empty_folder'), true, 5000);
    await testDataRefresh();
  });

  test('TST0210 - Add and remove tag to folder with dropdown menu [web,minio,electron]', async () => {
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
  });
  test('TST0211 - Add tag folder with DnD from tag library [web,minio,electron]', async () => {
    const tagName = 'article';
    await clickOn('[data-tid=tagLibrary]');
    await dnd(
      '[data-tid=tagContainer_' + tagName + ']',
      '[data-tid=PropertiesTagsSelectTID]'
    );
    await expectElementExist(
      '[data-tid=tagContainer_' + tagName + ']',
      true,
      8000,
      '[data-tid=perspectiveGridFileTable]'
    );

    const propsTags = await getPropertiesTags();
    expect(propsTags).toContain(tagName);
  });

  test('TST0213 - Add description to folder [web,minio,electron,_pro]', async () => {
    const desc = 'test description';

    await global.client.dblclick('[data-tid=descriptionTID]');
    await clickOn('[data-tid=descriptionTID]');
    const editor = await global.client.waitForSelector(
      '[data-tid=descriptionTID] .milkdown'
    );
    await editor.type(desc);

    await clickOn('[data-tid=editDescriptionTID]');
    await expectElementExist(
      '[data-tid=gridCellDescription]',
      true,
      10000,
      getGridFileSelector('empty_folder')
    );
  });

  test('TST0215 - Link for internal sharing + copy [web,minio,electron]', async () => {
    // await clickOn('[data-tid=copyLinkToClipboardTID]');
    const sharingLink = await global.client.$(
      '[data-tid=sharingLinkTID] input'
    );
    const sharingLinkValue = await sharingLink.getAttribute('value');

    await clickOn('[data-tid=locationManagerMenu]');
    await clickOn('[data-tid=locationManagerMenuOpenLink]');
    /*const clipboardContent = await global.client.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(clipboardContent.length > 0).toBe(true);*/
    //await setInputKeys('directoryName', clipboardContent);
    await setInputValue('[data-tid=directoryName] input', sharingLinkValue);
    await clickOn('[data-tid=directoryName] input');
    await clickOn('[data-tid=confirmOpenLink]');
    await expectElementExist('[data-tid=currentDir_empty_folder]', true, 5000);
    /*
    await clickOn('[data-tid=editDescriptionTID]');
    await global.client.dblclick('[data-tid=descriptionTID]');
    await clickOn('[data-tid=descriptionTID]');
    const editor = await global.client.waitForSelector(
      '[data-tid=descriptionTID] .milkdown'
    );
    await editor.type(
      '[sharingLink](' + clipboardContent + ' "sharingLinkTitle")'
    );
    await global.client.waitForSelector('a[title="' + clipboardContent + '"]');
    await clickOn('[data-tid=descriptionTID] .milkdown a');
    */
  });

  test('TST0216 - Set gallery perspective as default for folder [web,minio,electron,_pro]', async () => {
    const fileName = 'sample.jpg';
    await openContextEntryMenu(
      getGridFileSelector(fileName),
      'fileMenuMoveCopyFile'
    );
    await clickOn('[data-tid=MoveTargetempty_folder]');
    await clickOn('[data-tid=confirmCopyFiles]');

    await clickOn('[data-tid=changePerspectiveTID]');
    await clickOn('[data-value=gallery]');
    await global.client.dblclick('[data-tid=fsEntryName_empty_folder]');

    await expectElementExist(
      '[data-tid=perspectiveGalleryToolbar]',
      true,
      5000
    );
  });
});
