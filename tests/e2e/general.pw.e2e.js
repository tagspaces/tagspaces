/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { expect, test } from '@playwright/test';
import AppConfig from '../../src/renderer/AppConfig';
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation,
} from './location.helpers';
import {
  createNewDirectory,
  newHTMLFile,
  newMDFile,
  closeOpenedFile,
  deleteDirectory,
  clickOn,
  expectElementExist,
  selectorFile,
  takeScreenshot,
  createTxtFile,
  expectMetaFilesExist,
  getGridFileSelector,
  isDisplayed,
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage } from './welcome.helpers';

export const firstFile = '/span';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
const subFolderName = '/test-perspective-grid';
const subFolderContentExtractionPath =
  defaultLocationPath + '/content-extraction';
const subFolderThumbnailsPath = defaultLocationPath + '/thumbnails';
const testFolder = 'testFolder';

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
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST51 - Perspective Grid', () => {
  test('TST0501 - Create HTML file [electron,web]', async () => {
    await global.client.waitForLoadState('networkidle');
    await createNewDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      true,
      2000,
    );
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    // create new file
    await newHTMLFile();
    await closeOpenedFile();
    // await reloadDirectory();
    await expectElementExist(selectorFile, true);

    // delete directory
    await deleteDirectory(testFolder);

    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false,
      2000,
    );
    // await takeScreenshot('TST0501 after deleteDirectory');
  });

  test('TST0502 - Create MD file [electron,web]', async () => {
    await createNewDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      true,
      2000,
    );
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');

    // create new file
    await newMDFile();
    await closeOpenedFile();
    // await reloadDirectory();
    await expectElementExist(selectorFile, true);

    // await deleteFirstFile();
    await deleteDirectory(testFolder);
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false,
      2000,
    );
    // await takeScreenshot('TST0502 after deleteDirectory');
  });

  test('TST0503 - Create TEXT file [electron,web]', async () => {
    await createNewDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      true,
      2000,
    );
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');

    // create new file
    await createTxtFile();
    await closeOpenedFile();
    // await reloadDirectory();
    await expectElementExist(selectorFile, true);

    // await deleteFirstFile();
    await deleteDirectory(testFolder);
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false,
      2000,
    );
    // await takeScreenshot('TST0503 after deleteDirectory');
  });

  test('TST0510 - Generate thumbnail from Images [electron]', async () => {
    const metaFiles = AppConfig.ThumbGenSupportedFileTypes.image
      .filter((ext) => ext !== 'ico' && ext !== 'tiff' && ext !== 'tif') // ico file thumbnail generation not work TODO in not PRO version tiff tif is not generated in tests environment only
      .map((imgExt) => 'sample.' + imgExt + '.jpg');

    await expectMetaFilesExist(metaFiles);
  });

  test('TST0510a - Generate thumbnail from JPG w. rotation from EXIF [web,minio,electron]', async () => {
    await clickOn(getGridFileSelector('sample_exif[iptc].jpg'));

    const iframeElement = await global.client.waitForSelector('iframe');
    const frame = await iframeElement.contentFrame();

    await frame.click('#extFabMenu');
    await frame.click('#exifButton');

    let latExists = await isDisplayed(
      '#exifTableBody tr:has(th:has-text("GPSLatitude")) td',
      true,
      5000,
      frame,
    );
    expect(latExists).toBeTruthy();
  });

  test('TST0511 - Generate thumbnail from Videos [electron]', async () => {
    const metaFiles = AppConfig.ThumbGenSupportedFileTypes.video.map(
      (imgExt) => 'sample.' + imgExt + '.jpg',
    );
    await expectMetaFilesExist(metaFiles);
  });

  test('TST0516 - Generate thumbnail from PDF [electron,_pro]', async () => {
    await expectMetaFilesExist(['sample.pdf.jpg']);
  });

  test('TST0517 - Generate thumbnail from ODT [electron,_pro]', async () => {
    await expectMetaFilesExist([
      'sample.odt.jpg',
      'sample.ods.jpg',
      'sample.epub.jpg',
    ]);
  });

  test('TST0519 - Generate thumbnail from TIFF [electron,_pro]', async () => {
    await expectMetaFilesExist(['sample.tiff.jpg']);
  });

  test.skip('TST0520 - Generate thumbnail from PSD [electron,_pro]', async () => {
    // TODO fix
    await expectMetaFilesExist(['sample.psd.jpg']);
  });

  test('TST0522 - Generate thumbnail from URL [electron,_pro]', async () => {
    await expectMetaFilesExist(['sample.url.jpg']);
  });

  test('TST0523 - Generate thumbnail from HTML [electron,_pro]', async () => {
    await expectMetaFilesExist(['sample.html.jpg']);
  });

  test('TST0524 - Generate thumbnail from TXT,MD [electron,_pro]', async () => {
    // MD thumbs generation is stopped
    await expectMetaFilesExist(['sample.txt.jpg']);
  });
});
