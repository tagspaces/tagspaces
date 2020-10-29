/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay } from './hook';
import {
  createLocation,
  defaultLocationPath,
  openLocationMenu,
  checkForIdExist,
  createMinioLocation,
  defaultLocationName,
  openLocation,
  closeFileProperties,
  clearInputValue,
  startupLocation
} from './location.helpers';

export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location_Name_Changed';

let testLocationName;

describe('TST03 - Testing locations:', () => {
  beforeEach(async () => {
    testLocationName = '' + new Date().getTime();
    await delay(500);
    //await createLocation(defaultLocationPath, testLocationName, true);
    if (global.isMinio) {
      await createMinioLocation('', testLocationName, true);
    } else {
      await createLocation(defaultLocationPath, testLocationName, true);
    }
    await delay(500);

    await openLocation(testLocationName);
    // await delay(500);
    await closeFileProperties();
  });

  it('TST0301 - Should create a location [web,electron]', async () => {
    // const allLocations = await global.client.$$('[data-tid=locationTitleElement]');
    // expect(allLocations.length).toBeGreaterThan(0);
    // const lastLocation = allLocations[allLocations.length - 1];
    // const lastLocationNameInDom = (await global.client.elementIdText(lastLocation.ELEMENT)).value;
    // const addedLocation = await global.client.getText('//button[contains(., "' + testTagName + '")]');
    await delay(500);
    const addedLocation = await global.client.$(
      '[data-tid=location_' + testLocationName + ']'
    );
    await delay(1500);
    expect(await addedLocation.isDisplayed()).toBe(true);
    //expect(testLocationName).toBe(addedLocation);
  });

  it('TST0302 - Should remove a location [web,electron]', async () => {
    // await global.client.waitForVisible('[data-tid=locationList]');
    // const allLocations = await global.client.$$('[data-tid=locationList]');
    // await delay(500);
    // expect(allLocations.length).toBeGreaterThan(0);
    // const lastLocation = allLocations[allLocations.length - 1];
    // await global.client.elementIdClick(lastLocation.ELEMENT);
    await openLocationMenu(testLocationName);
    //await delay(1500);
    const removeLocation = await global.client.$('[data-tid=removeLocation]');
    await removeLocation.waitForDisplayed();
    await removeLocation.click();
    //await delay(1500);
    const confirmDeleteLocationDialog = await global.client.$(
      '[data-tid=confirmDeleteLocationDialog]'
    );
    await confirmDeleteLocationDialog.click();
    //await delay(1500);
    const locationList = await global.client.$('[data-tid=locationList]');
    await locationList.waitForDisplayed();
    //await locationList.click();
    //await global.client.waitForVisible('[data-tid=locationList]');
    //const allLocationsList = await global.client.$$('[data-tid=locationList]');
    //await delay(1500);
    const testLocation = await global.client.$(
      '[data-tid=location_' + testLocationName + ']'
    );
    expect(await testLocation.isDisplayed()).toBe(false);
    //expect(locationList.indexOf(testLocationName) >= 0).toBe(false);
  });

  it('TST0303 - Rename location [web,electron]', async () => {
    await openLocationMenu(testLocationName);
    //await delay(1500);
    const editLocation = await global.client.$('[data-tid=editLocation]');
    await editLocation.waitForDisplayed();
    await editLocation.click();
    await delay(2000);
    /*const locationName = await global.client.$('[data-tid=locationName]');
    await locationName.waitForDisplayed();
    await locationName.click();
    await delay(1500);*/
    const locationInput = await global.client.$(
      '[data-tid=locationName] input'
    );
    await locationInput.waitForDisplayed();
    // await locationInput.click();
    await clearInputValue(locationInput);
    await locationInput.keys(newLocationName);
    // await global.client.$('[data-tid=locationName] input').setValue(newLocationName);
    await delay(500);
    const confirmEditLocationDialog = await global.client.$(
      '[data-tid=confirmEditLocationDialog]'
    );
    await confirmEditLocationDialog.waitForDisplayed();
    await confirmEditLocationDialog.click();
    /*await delay(500);
    await global.client.$('[data-tid=locationList]');
    const allLocationsList = await global.client.getText(
      '[data-tid=locationList]'
    );*/
    //await delay(500);
    //expect(allLocationsList.indexOf(newLocationName) >= 0).toBe(true);

    const testLocation = await global.client.$(
      '[data-tid=location_' + newLocationName + ']'
    );
    expect(await testLocation.isDisplayed()).toBe(true);
  });

  it('TST0305 - Set as startup location [web,electron]', async () => {
    await openLocationMenu(testLocationName);
    await delay(500);
    // await global.client.waitForVisible('[data-tid=editLocation]');
    // await global.client.click('[data-tid=editLocation]');
    // await delay(1500);
    // await global.client.waitForVisible('[data-tid=locationIsDefault]');
    // await global.client.click('[data-tid=locationIsDefault]');
    // await delay(1500);
    // await global.client.waitForVisible('[data-tid=confirmEditLocationDialog]');
    // await global.client.click('[data-tid=confirmEditLocationDialog]');
    // await delay(1500);
    await startupLocation();
    await openLocationMenu(testLocationName);
    await delay(500);
    await startupLocation();
    await delay(500);
    const startupIndication = await global.client.$(
      '[data-tid=startupIndication]'
    );
    await startupIndication.waitForDisplayed();
    await checkForIdExist('startupIndication'); // TODO check if the indicator is setted on the correct location
    // TODO evlt reastart the applcatio and see if the loading of default locations works
  });

  it('TST0306 - should test duplication warning on creating locations with the same name', async () => {
    // TODO test duplication warning on creating locations
  });

  it('TST0307 - Move location Up and Down [web,electron]', async () => {
    await openLocationMenu(testLocationName);
    await delay(500);
    // await createLocation(defaultLocationPath + '/test', 'New Test Location');
    // await delay(1500);
    // await openLocationMenu(testLocationName);
    // await delay(1500);
    const moveUp = await global.client.$('[data-tid=moveLocationUp]');
    await moveUp.click();
    await delay(1500);
    await openLocationMenu(testLocationName);
    await delay(1500);
    const moveDown = await global.client.$('[data-tid=moveLocationDown]');
    await moveDown.click();
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
