/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay } from './hook';
import {
  createLocation,
  defaultLocationPath,
  openLocationMenu,
  checkForIdExist
} from './location.helpers';

export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location Name Changed';

let testLocationName;

describe('TST03 - Testing locations:', () => {
  beforeEach(async () => {
    testLocationName = '' + new Date().getTime();
    await delay(1500);
    await createLocation(defaultLocationPath, testLocationName, true);
    await delay(2000);
  });

  it('TST0301 - Should create a location', async () => {
    // const allLocations = await global.client.$$('[data-tid=locationTitleElement]');
    // expect(allLocations.length).toBeGreaterThan(0);
    // const lastLocation = allLocations[allLocations.length - 1];
    // const lastLocationNameInDom = (await global.client.elementIdText(lastLocation.ELEMENT)).value;
    // const addedLocation = await global.client.getText('//button[contains(., "' + testTagName + '")]');
    await delay(1500);
    const addedLocation = await global.client.getText(
      '[data-tid=location_' + testLocationName + ']'
    );
    await delay(1500);
    expect(testLocationName).toBe(addedLocation);
  });

  it('TST0302 - Should remove a location', async () => {
    // await global.client.waitForVisible('[data-tid=locationList]');
    // const allLocations = await global.client.$$('[data-tid=locationList]');
    // await delay(500);
    // expect(allLocations.length).toBeGreaterThan(0);
    // const lastLocation = allLocations[allLocations.length - 1];
    // await global.client.elementIdClick(lastLocation.ELEMENT);
    await openLocationMenu(testLocationName);
    await delay(1500);
    await global.client.waitForVisible('[data-tid=removeLocation]');
    await global.client.click('[data-tid=removeLocation]');
    await delay(1500);
    await global.client.click('[data-tid=confirmDeleteLocationDialog]');
    await delay(1500);
    await global.client.waitForVisible('[data-tid=locationList]');
    const allLocationsList = await global.client.$$('[data-tid=locationList]');
    await delay(1500);
    expect(allLocationsList.indexOf(testLocationName) >= 0).toBe(false);
  });

  it('TST0303 - Rename location', async () => {
    await openLocationMenu(testLocationName);
    await delay(1500);
    await global.client.waitForVisible('[data-tid=editLocation]');
    await global.client.click('[data-tid=editLocation]');
    await delay(1500);
    await global.client.waitForVisible('[data-tid=locationName]');
    await global.client.click('[data-tid=locationName]');
    await delay(1500);
    await global.client
      .$('[data-tid=locationName] input')
      .keys(newLocationName);
    // await global.client.$('[data-tid=locationName] input').setValue(newLocationName);
    await delay(500);
    await global.client.waitForVisible('[data-tid=confirmEditLocationDialog]');
    await global.client.click('[data-tid=confirmEditLocationDialog]');
    await delay(500);
    await global.client.waitForVisible('[data-tid=locationList]');
    const allLocationsList = await global.client.getText(
      '[data-tid=locationList]'
    );
    await delay(500);
    expect(allLocationsList.indexOf(newLocationName) >= 0).toBe(true);
  });

  it('TST0305 - Set as startup location', async () => {
    await openLocationMenu(testLocationName);
    await delay(1500);
    // await global.client.waitForVisible('[data-tid=editLocation]');
    // await global.client.click('[data-tid=editLocation]');
    // await delay(1500);
    // await global.client.waitForVisible('[data-tid=locationIsDefault]');
    // await global.client.click('[data-tid=locationIsDefault]');
    // await delay(1500);
    // await global.client.waitForVisible('[data-tid=confirmEditLocationDialog]');
    // await global.client.click('[data-tid=confirmEditLocationDialog]');
    // await delay(1500);
    await global.client.waitForVisible('[data-tid=startupIndication]');
    await checkForIdExist('startupIndication'); // TODO check if the indicator is setted on the correct location
    // TODO evlt reastart the applcatio and see if the loading of default locations works
  });

  it('TST0306 - should test duplication warning on creating locations with the same name', async () => {
    // TODO test duplication warning on creating locations
  });

  it('TST0307 - Move location Up and Down', async () => {
    await openLocationMenu(testLocationName);
    await delay(500);
    // await createLocation(defaultLocationPath + '/test', 'New Test Location');
    // await delay(1500);
    // await openLocationMenu(testLocationName);
    // await delay(1500);
    await global.client.waitForVisible('[data-tid=moveLocationUp]');
    await global.client.click('[data-tid=moveLocationUp]');
    await delay(1500);
    await openLocationMenu(testLocationName);
    await delay(1500);
    await global.client.waitForVisible('[data-tid=moveLocationDown]');
    await global.client.click('[data-tid=moveLocationDown]');
    // TODO no expect, validation
  });
});

describe.skip('TST03 - Testing locations - start up location', () => {
  beforeEach(() => {
    // global.shouldClearLocaleStorage = false;
    // return createLocation(defaultLocationPath, locationName);
  });

  afterEach(() => {
    // global.shouldClearLocaleStorage = true;
  });

  // it.skip('TST0304 - Changing default perspective', async () => {
  // });
  //
  // it.skip('TST0305 - should make a start up location and test if it load on startup', async () => {
  // });
});

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
