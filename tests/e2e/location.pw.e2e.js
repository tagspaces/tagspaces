/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */
import { test, expect } from './fixtures';
import {
  defaultLocationPath,
  openLocationMenu,
  startupLocation,
  getPwLocationTid,
  createPwMinioLocation,
  createPwLocation,
  createS3Location,
  defaultLocationName,
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  setInputKeys,
  takeScreenshot,
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage } from './welcome.helpers';
import { stopServices } from '../setup-functions';

export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location_Name_Changed';

let testLocationName;

let s3ServerInstance;
let webServerInstance;
let minioServerInstance;

test.beforeAll(async ({ s3Server, webServer, minioServer }) => {
  s3ServerInstance = s3Server;
  webServerInstance = webServer;
  minioServerInstance = minioServer;
  await startTestingApp('extconfig-without-locations.js');
  //await clearDataStorage();
});

test.afterAll(async () => {
  await stopServices(s3ServerInstance, webServerInstance, minioServerInstance);
  await testDataRefresh(s3ServerInstance);
  await stopApp();
});

test.afterEach(async ({ page }, testInfo) => {
  /*if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }*/
  await clearDataStorage();
});

test.beforeEach(async () => {
  testLocationName = '' + new Date().getTime();

  if (global.isMinio || global.isS3) {
    await createPwMinioLocation('', testLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, testLocationName, true);
  }
  await clickOn('[data-tid=location_' + testLocationName + ']');
  // await delay(500);
  // await closeFileProperties();
});

test.describe('TST03 - Testing locations:', () => {
  test('TST0301 - Should create a location [web,electron]', async () => {
    await expectElementExist(
      '[data-tid=location_' + testLocationName + ']',
      true,
      4500,
    );
  });

  test('TST0302 - Should remove a location [web,electron]', async () => {
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

  test('TST0303 - Rename location [web,electron]', async () => {
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

  test('TST0305 - Set as startup location [web,electron]', async () => {
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

  test('TST0307 - Move location Up and Down [web,electron]', async () => {
    if (global.isWeb) {
      // in web there is no other locations
      if (global.isMinio) {
        await createPwMinioLocation('', 'dummyLocation', false);
      } else if (global.isS3) {
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
