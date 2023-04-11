/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation
} from './location.helpers';
import { clickOn, expectElementExist, setInputKeys } from './general.helpers';
import { startTestingApp, stopSpectronApp, testDataRefresh } from './hook';
import { createSavedSearch } from './search.helpers';

describe('TST09 - Quick access', () => {
  beforeAll(async () => {
    await startTestingApp();
  });

  afterAll(async () => {
    await stopSpectronApp();
    await testDataRefresh();
  });
  beforeEach(async () => {
    if (global.isMinio) {
      await createPwMinioLocation('', defaultLocationName, true);
    } else {
      await createPwLocation(defaultLocationPath, defaultLocationName, true);
    }
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    // If its have opened file
    // await closeFileProperties();
  });

  test('TST0901 - Create, rename and delete stored search [electron,_pro]', async () => {
    const storedSearchTitle = 'jpgSearch';
    await createSavedSearch({ title: storedSearchTitle, textQuery: 'jpg' });
    //await expectElementExist('[data-tid=quickAccessButton]');
    await clickOn('[data-tid=quickAccessButton]');
    // await clickOn('[data-tid=storedSearchesVisibleTID]');
    await expectElementExist(
      '[data-tid=StoredSearchTID' + storedSearchTitle + ']'
    );
    // Rename
    await clickOn('[data-tid=editSearchTID]');
    await setInputKeys('savedSearchTID', 'Renamed');
    await clickOn('[data-tid=confirmSavedSearchTID]');
    await expectElementExist(
      '[data-tid=StoredSearchTID' + storedSearchTitle + 'Renamed]'
    );
    //Delete
    await clickOn('[data-tid=editSearchTID]');
    await clickOn('[data-tid=deleteSavedSearchTID]');
    await expectElementExist(
      '[data-tid=StoredSearchTID' + storedSearchTitle + 'Renamed]',
      false
    );
  });

  test('TST0902 - Create, execute and delete stored search [electron,_pro]', async () => {
    const storedSearchTitle = 'jpgExecutedSearch';
    const textQuery = 'jpg';
    await createSavedSearch({ title: storedSearchTitle, textQuery });
    //await expectElementExist('[data-tid=quickAccessButton]');
    await clickOn('[data-tid=quickAccessButton]');
    // await clickOn('[data-tid=storedSearchesVisibleTID]');
    await expectElementExist(
      '[data-tid=StoredSearchTID' + storedSearchTitle + ']'
    );
    // Execute
    await clickOn('[data-tid=StoredSearchTID' + storedSearchTitle + ']');
    const inputValue = await global.client.inputValue('#textQuery');
    expect(inputValue).toBe(textQuery);
    //Delete
    await clickOn('[data-tid=editSearchTID]');
    await clickOn('[data-tid=deleteSavedSearchTID]');
    await expectElementExist(
      '[data-tid=StoredSearchTID' + storedSearchTitle + ']',
      false
    );
  });
});
