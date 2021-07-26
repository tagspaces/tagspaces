/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import {
  createLocation,
  defaultLocationPath,
  defaultLocationName,
  closeFileProperties,
  createMinioLocation,
  createPwMinioLocation,
  createPwLocation
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  selectorFile,
  setInputValue
} from './general.helpers';

describe('TST13 - Settings Key Bindings [electron]', () => {
  beforeEach(async () => {
    // if (global.isMinio) {
    //   await createPwMinioLocation('', defaultLocationName, true);
    // } else {
    //   await createPwLocation(defaultLocationPath, defaultLocationName, true);
    // }
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    // If its have opened file
    // await closeFileProperties();
  });

  it('TST1312 - Test rename file [electron]', async () => {
    const newTitle = 'renamed.txt';
    await clickOn(selectorFile);
    await global.client.keyboard.press('F2');
    await setInputValue('[data-tid=renameEntryDialogInput] input', newTitle);
    await clickOn('[data-tid=closeRenameEntryDialog]');
  });

  it('TST1313 - Test open file [electron]', async () => {
    await clickOn(selectorFile);
    await global.client.keyboard.press('Enter');
    await expectElementExist('[data-tid=fileContainerToggleProperties]', true);
  });
});
