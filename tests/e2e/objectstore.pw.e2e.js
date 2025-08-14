/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { test, expect } from './fixtures';
import { defaultLocationName } from './location.helpers';
import {
  clickOn,
  expectElementExist,
  getGridFileSelector,
} from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import { openContextEntryMenu } from './test-utils';
import { dataTidFormat } from '../../src/renderer/services/test';
import { clearDataStorage } from './welcome.helpers';

test.beforeAll(async ({ isWeb, isS3, isMinio, webServerPort }, testInfo) => {
  /*if (isS3) {
    await startTestingApp({ isWeb, isS3, webServerPort, testInfo });
    await closeWelcomePlaywright();
  } else if(isMinio) {*/
  await startTestingApp(
    { isWeb, isS3, webServerPort, testInfo },
    'extconfig-objectstore-location.js',
  );
  //}
  //await clearDataStorage();
});

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async () => {
  await clearDataStorage();
});

test.beforeEach(async ({ isMinio, isS3 }) => {
  if (isMinio) {
    //await createPwMinioLocation('', defaultLocationName, true);
    await clickOn('[data-tid=location_' + defaultLocationName + '-minio]');
  } else if (isS3) {
    //await createS3Location('', defaultLocationName, true);
    await clickOn('[data-tid=location_' + defaultLocationName + '-s3]');
  }
  await expectElementExist(getGridFileSelector('empty_folder'), true, 8000);
});

test.describe('TST09 - ObjectStore location', () => {
  test('TST0917 - Create, open and remove bookmark to S3 file in properties [web,minio,s3,_pro]', async () => {
    const bookmarkFileTitle = 'sample.txt';
    const bookmarkFileTid = dataTidFormat(bookmarkFileTitle);
    await openContextEntryMenu(
      getGridFileSelector(bookmarkFileTitle), // todo rethink selector here contain dot
      'fileMenuOpenFile',
    );

    // Create
    await clickOn('[data-tid=toggleBookmarkTID]');
    await clickOn('[data-tid=fileContainerCloseOpenedFile]');

    //await clickOn('[data-tid=location_' + defaultLocationName + ']');

    // Open
    await clickOn('[data-tid=quickAccessButton]');
    await expectElementExist(
      '[data-tid=tsBookmarksTID' + bookmarkFileTid + ']',
    );
    await clickOn('[data-tid=tsBookmarksTID' + bookmarkFileTid + ']');
    await expectElementExist('[data-tid=OpenedTID' + bookmarkFileTid + ']');

    //Delete
    await clickOn('[data-tid=toggleBookmarkTID]');

    //await clickOn('[data-tid=BookmarksMenuTID]');
    //await clickOn('[data-tid=refreshBookmarksTID]');

    await expectElementExist(
      '[data-tid=tsBookmarksTID' + bookmarkFileTid + ']',
      false,
    );
  });
});
