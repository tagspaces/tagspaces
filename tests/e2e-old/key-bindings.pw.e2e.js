/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { defaultLocationName } from './location.helpers';
import {
  clickOn,
  expectElementExist,
  selectorFile,
  setInputValue
} from './general.helpers';
import { startTestingApp, stopSpectronApp, testDataRefresh } from './hook';

describe('TST13 - Settings Key Bindings [electron]', () => {
  beforeAll(async () => {
    await startTestingApp('extconfig-with-welcome.js');
  });

  afterAll(async () => {
    await stopSpectronApp();
    await testDataRefresh();
  });
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

  it('TST1311 - Test show search [electron]', async () => {
    const isMac = /^darwin/.test(process.platform);
    await clickOn(selectorFile);
    if (isMac) {
      await global.client.keyboard.press('Meta+KeyF');
    } else {
      await global.client.keyboard.press('Control+KeyF');
    }
    await expectElementExist('#textQuery', true, 2000);
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

  it('TST1315 - Test delete file [electron]', async () => {
    await clickOn(selectorFile);
    await global.client.keyboard.press('Delete');
    await clickOn('[data-tid=confirmDeleteFileDialog]');
    // await expectElementExist('[data-tid=confirmDeleteFileDialog]', true);
  });

  it('TST1316 - Show help and feedback panel in the left [electron]', async () => {
    await clickOn(selectorFile);
    await global.client.keyboard.press('F1');
    await expectElementExist('[data-tid=aboutDialog]', true);
  });

  it.skip('TST1301 - Change a key binding [electron]', async () => {});

  it.skip('TST1302 - Test select all [electron]', async () => {});

  it.skip('TST1303 - Test reload of document [electron]', async () => {});

  it.skip('TST1304 - Test close document [electron]', async () => {});

  it.skip('TST1305 - Test document properties [electron]', async () => {});

  it.skip('TST1306 - Test save document [electron]', async () => {});

  it.skip('TST1307 - Test show next document [electron]', async () => {});

  it.skip('TST1308 - Test show previous document [electron]', async () => {});

  it.skip('TST1309 - Test edit document [electron]', async () => {});

  it.skip('TST1310 - Test add / remove tags [electron]', async () => {});

  it.skip('TST1314 - Test open file externally [electron]', async () => {});
});
