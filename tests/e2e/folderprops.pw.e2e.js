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
  getGridFileSelector
} from './general.helpers';
import { openContextEntryMenu } from './test-utils';
import { createFile, startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage } from './welcome.helpers';
import { getPropertiesTags } from './file.properties.helpers';

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
    expect(description.replace(/[\s*#]/g, '')).toMatch(tsmJson.description.replace(/[\s*#]/g, ''));
  });
});
