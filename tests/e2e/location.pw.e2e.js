/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { expect, test } from '@playwright/test';
import {
  defaultLocationPath,
  openLocationMenu,
  startupLocation,
  getPwLocationTid,
  createPwMinioLocation,
  createPwLocation
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  setInputKeys,
  takeScreenshot
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { init } from './welcome.helpers';

export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location_Name_Changed';

let testLocationName;

test.beforeAll(async () => {
  await startTestingApp('extconfig-without-locations.js');
  await init();
});

test.afterAll(async () => {
  await stopApp();
  await testDataRefresh();
});

test.afterEach(async () => {
  await init();
});

test.beforeEach(async () => {
  testLocationName = '' + new Date().getTime();

  if (global.isMinio) {
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
    // const allLocations = await global.client.$$('[data-tid=locationTitleElement]');
    // expect(allLocations.length).toBeGreaterThan(0);
    // const lastLocation = allLocations[allLocations.length - 1];
    // const lastLocationNameInDom = (await global.client.elementIdText(lastLocation.ELEMENT)).value;
    // const addedLocation = await global.client.getText('//button[contains(., "' + testTagName + '")]');
    await takeScreenshot('TST0301 Should create a location');
    await expectElementExist(
      '[data-tid=location_' + testLocationName + ']',
      true,
      1500
    );
  });

  test('TST0302 - Should remove a location [web,electron]', async () => {
    // await global.client.waitForVisible('[data-tid=locationList]');
    // const allLocations = await global.client.$$('[data-tid=locationList]');
    // await delay(500);
    // expect(allLocations.length).toBeGreaterThan(0);
    // const lastLocation = allLocations[allLocations.length - 1];
    // await global.client.elementIdClick(lastLocation.ELEMENT);
    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=removeLocation]');
    await clickOn('[data-tid=confirmDeleteLocationDialog]');
    //const locationList = await global.client.$('[data-tid=locationList]');
    //await locationList.waitForDisplayed();
    await expectElementExist(
      '[data-tid=location_' + testLocationName + ']',
      false
    );
  });

  test('TST0303 - Rename location [web,electron]', async () => {
    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=editLocation]');
    await global.client.dblclick('[data-tid=locationName] input');
    await setInputKeys('locationName', newLocationName);
    await clickOn('[data-tid=confirmLocationCreation]');
    /*await delay(500);
    await global.client.$('[data-tid=locationList]');
    const allLocationsList = await global.client.getText(
      '[data-tid=locationList]'
    );*/
    //await delay(500);
    //expect(allLocationsList.indexOf(newLocationName) >= 0).toBe(true);

    await expectElementExist(
      '[data-tid=location_' + newLocationName + ']',
      true,
      5000
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
      /*await takeScreenshot(
        'TST0307 Move location Up and Down before create dummyLocation'
      );*/
      // in web there is no other locations
      await createPwMinioLocation('', 'dummyLocation', false);
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
