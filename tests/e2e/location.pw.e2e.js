/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */
import { test, expect } from './fixtures';
import {
  openLocationMenu,
  startupLocation,
  getPwLocationTid,
  createPwMinioLocation,
  createPwLocation,
  createS3Location,
  defaultLocationName,
} from './location.helpers';
import AppConfig from '../../src/renderer/AppConfig';
import {
  addDescription,
  clickOn,
  createFile,
  createLocation,
  createNewDirectory,
  expectElementExist,
  expectMetaFileContain,
  getGridFileSelector,
  openFile,
  openFolder,
  openFolderProp,
  setInputKeys,
} from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location_Name_Changed';

let testLocationName;

test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  await startTestingApp(
    { isWeb, isS3, webServerPort, testInfo },
    'extconfig-without-locations.js',
  );
  //await clearDataStorage();
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

test.beforeEach(async ({ isMinio, isS3, testDataDir }) => {
  testLocationName = '' + new Date().getTime();

  if (isMinio) {
    await createPwMinioLocation('', testLocationName, true);
  } else if (isS3) {
    await createS3Location('', testLocationName, true);
  } else {
    await createPwLocation(testDataDir, testLocationName, true);
  }

  await clickOn('[data-tid=location_' + testLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 8000);
  // await delay(500);
  // await closeFileProperties();
});

test.describe('TST03 - Testing locations:', () => {
  test('TST0301 - Should create a location [web,minio,s3,electron]', async () => {
    await expectElementExist(
      '[data-tid=location_' + testLocationName + ']',
      true,
      4500,
    );
  });

  test('TST0302 - Should remove a location [web,minio,s3,electron]', async () => {
    await expectElementExist(
      '[data-tid=location_' + testLocationName + ']',
      true,
      4500,
    );
    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=removeLocation]');
    await clickOn('[data-tid=confirmDeleteLocationDialog]');
    //const locationList = await global.client.$('[data-tid=locationList]');
    //await locationList.waitForDisplayed();
    await expectElementExist(
      '[data-tid=location_' + testLocationName + ']',
      false,
    );
    await expectElementExist('[data-tid=WelcomePanelTID]', true);
  });

  test('TST0303 - Rename location [web,minio,s3,electron]', async () => {
    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=editLocation]');
    await global.client.dblclick('[data-tid=locationName] input');
    await setInputKeys('locationName', newLocationName);
    await clickOn('[data-tid=confirmLocationCreation]');

    await expectElementExist(
      '[data-tid=location_' + newLocationName + ']',
      true,
      5000,
    );
  });

  test('TST0305 - Set as startup location [web,minio,s3,electron]', async () => {
    await openLocationMenu(testLocationName);
    await startupLocation();
    await expectElementExist('[data-tid=startupIndication]', false);
    // await global.client.pause(500);
    await openLocationMenu(testLocationName);
    await startupLocation();
    await expectElementExist('[data-tid=startupIndication]', true, 5000);
    // TODO check if the indicator is setted on the correct location
    // TODO evlt reastart the applcatio and see if the loading of default locations works
  });

  /**
   * You can create two locations with the same name now
   */
  test('TST0306 - should test duplication warning on creating locations with the same name', async () => {
    // TODO test duplication warning on creating locations
  });

  test('TST0307 - Move location Up and Down [web,minio,s3,electron]', async ({
    isWeb,
    isMinio,
    isS3,
  }) => {
    if (isWeb) {
      // in web there is no other locations
      if (isMinio) {
        await createPwMinioLocation('', 'dummyLocation', false);
      } else if (isS3) {
        await createS3Location('empty_folder');
      }
    }
    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=moveLocationUp]');

    const prevLocation = await getPwLocationTid(-2);
    expect(prevLocation).toBe(testLocationName);

    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=moveLocationDown]');

    const lastLocation = await getPwLocationTid(-1);
    expect(lastLocation).toBe(testLocationName);
  });

  test('TST0328 - Creating location index [web,minio,s3,electron,_pro]', async ({
    isS3,
    isMinio,
    isWeb,
    testDataDir,
  }) => {
    test.setTimeout(520000);
    const props = { isS3, isMinio, testDataDir };
    const file1 = 'test_file1[tag1 tag2].md'; // todo sidecar tags + ids
    const file1content = 'test md file 1';
    const file1desc = 'test file 1 desc';
    const file2 = 'test_file2[tag3 tag4].txt';
    const file2content = 'test txt file 2';
    const file2desc = 'test file 2 desc';
    const locationFolderName = 'indexingLocation';

    //await createFile(props, 'tsm.json', '{id=f998c4e9349044288c93f096f5cebca8}', '.ts');
    await createNewDirectory(locationFolderName);

    await createFile(props, file1, file1content, locationFolderName);
    await createFile(props, file2, file2content, locationFolderName);
    await openFolder(locationFolderName);

    const testFolder = await createNewDirectory();
    const folderDesc = 'test folder desc';

    await openFolderProp(testFolder);
    await addDescription(folderDesc);

    //await global.client.waitForTimeout(880000);
    await expectElementExist(
      '[data-tid=gridCellDescription]',
      true,
      10000,
      getGridFileSelector(testFolder),
    );
    await openFile(file1, 'showPropertiesTID');
    await addDescription(file1desc);
    await openFile(file2, 'showPropertiesTID');
    await addDescription(file2desc);
    await createLocation(
      props,
      locationFolderName,
      locationFolderName,
      true,
      true,
      testFolder,
    );
    await openLocationMenu(locationFolderName);
    await clickOn('[data-tid=indexLocation]');
    //await global.client.waitForTimeout(880000);
    const indexFileContent =
      '[{"name":"testFolder","path":"testFolder","meta":{"description":"test folder desc"},"isFile":false},{"name":"test_file1[tag1 tag2].md","path":"test_file1[tag1 tag2].md","meta":{"description":"test file 1 desc"},"isFile":true,"textContent":"test md file 1","extension":"md"},{"name":"test_file2[tag3 tag4].txt","path":"test_file2[tag3 tag4].txt","meta":{"description":"test file 2 desc"},"isFile":true,"textContent":"test txt file 2","extension":"txt"}]';
    //await setFileTypeExtension('json');
    const rootFolder = locationFolderName + '/' + AppConfig.metaFolder;
    // await global.client.waitForTimeout(180000);
    await expectMetaFileContain(
      { testDataDir, isS3, isMinio },
      'tsi.json',
      rootFolder,
      indexFileContent,
      8000,
    );
  });
});
/*
describe.skip('TST03 - Testing locations - test Context Menu in Tree Directory', () => {
  beforeEach(async () => {
    const locationPath = defaultLocationPath; // to local path
    const locationName = 'test-data';
    await createLocation(locationPath, locationName);
  });

  afterEach(() => {
    // global.shouldClearLocaleStorage = true;
  });
});
*/
