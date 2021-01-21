/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import {
  createLocation,
  defaultLocationPath,
  openLocationMenu,
  createMinioLocation,
  closeFileProperties,
  startupLocation,
  getLocationTid
} from './location.helpers';
import { clickOn, expectElementExist, setInputKeys } from './general.helpers';
import { startSpectronApp, stopSpectronApp } from './hook';

export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location_Name_Changed';

let testLocationName;

describe('TST03 - Testing locations:', () => {
  beforeAll(async () => {
    const fse = require('fs-extra');
    const path = require('path');

    const srcDir = path.join(
      __dirname,
      '..',
      '..',
      'scripts',
      'extconfig-without-locations.js'
    );
    const destDir = path.join(__dirname, '..', '..', 'app', 'extconfig.js');

    fse.copySync(srcDir, destDir);

    await stopSpectronApp();
    await startSpectronApp();
  });

  afterAll(async () => {
    const fse = require('fs-extra');
    const path = require('path');

    const srcDir = path.join(__dirname, '..', '..', 'scripts', 'extconfig.js');
    const destDir = path.join(__dirname, '..', '..', 'app', 'extconfig.js');

    fse.copySync(srcDir, destDir);

    await stopSpectronApp();
    await startSpectronApp();
  });

  beforeEach(async () => {
    testLocationName = '' + new Date().getTime();

    if (global.isMinio) {
      await createMinioLocation('', testLocationName, true);
    } else {
      await createLocation(defaultLocationPath, testLocationName, true);
    }
    await clickOn('[data-tid=location_' + testLocationName + ']');
    // await delay(500);
    await closeFileProperties();
  });

  it('TST0301 - Should create a location [web,electron]', async () => {
    // const allLocations = await global.client.$$('[data-tid=locationTitleElement]');
    // expect(allLocations.length).toBeGreaterThan(0);
    // const lastLocation = allLocations[allLocations.length - 1];
    // const lastLocationNameInDom = (await global.client.elementIdText(lastLocation.ELEMENT)).value;
    // const addedLocation = await global.client.getText('//button[contains(., "' + testTagName + '")]');
    await expectElementExist('[data-tid=location_' + testLocationName + ']');
  });

  it('TST0302 - Should remove a location [web,electron]', async () => {
    // await global.client.waitForVisible('[data-tid=locationList]');
    // const allLocations = await global.client.$$('[data-tid=locationList]');
    // await delay(500);
    // expect(allLocations.length).toBeGreaterThan(0);
    // const lastLocation = allLocations[allLocations.length - 1];
    // await global.client.elementIdClick(lastLocation.ELEMENT);
    await openLocationMenu(testLocationName);
    await global.client.pause(200);
    await clickOn('[data-tid=removeLocation]');
    await global.client.pause(200);
    await clickOn('[data-tid=confirmDeleteLocationDialog]');
    //const locationList = await global.client.$('[data-tid=locationList]');
    //await locationList.waitForDisplayed();
    await expectElementExist(
      '[data-tid=location_' + testLocationName + ']',
      false
    );
  });

  it('TST0303 - Rename location [web,electron]', async () => {
    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=editLocation]');
    await setInputKeys('locationName', newLocationName);
    await clickOn('[data-tid=confirmLocationCreation]');
    /*await delay(500);
    await global.client.$('[data-tid=locationList]');
    const allLocationsList = await global.client.getText(
      '[data-tid=locationList]'
    );*/
    //await delay(500);
    //expect(allLocationsList.indexOf(newLocationName) >= 0).toBe(true);

    await expectElementExist('[data-tid=location_' + newLocationName + ']');
  });

  it('TST0305 - Set as startup location [web,electron]', async () => {
    await openLocationMenu(testLocationName);
    await startupLocation();
    await expectElementExist('[data-tid=startupIndication]', false);
    // await global.client.pause(500);
    await openLocationMenu(testLocationName);
    await startupLocation();
    await expectElementExist('[data-tid=startupIndication]');
    // TODO check if the indicator is setted on the correct location
    // TODO evlt reastart the applcatio and see if the loading of default locations works
  });

  /**
   * You can create two locations with the same name now
   */
  it('TST0306 - should test duplication warning on creating locations with the same name', async () => {
    // TODO test duplication warning on creating locations
  });

  it('TST0307 - Move location Up and Down [web,electron]', async () => {
    if (global.isWeb) {
      // in web there is no other locations
      await createMinioLocation('', 'dummyLocation', false);
    }
    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=moveLocationUp]');

    const prevLocation = await getLocationTid(-2);
    expect(prevLocation).toBe(testLocationName);

    await global.client.pause(500);
    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=moveLocationDown]');

    const lastLocation = await getLocationTid(-1);
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
