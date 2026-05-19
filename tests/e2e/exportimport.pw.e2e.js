/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */
import { expect, test } from './fixtures';
import { clickOn, expectElementExist } from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

/**
 * Coverage for the unified Export/Import feature (Settings → Backup tab).
 * Import-centric on purpose: import is deterministic and asserts the
 * data-loss-relevant outcome (state persisted, survives a reload), whereas
 * export goes through a real file download that is awkward to capture in
 * Electron. Encrypted/round-trip/locations(Pro) paths are intentionally out
 * of scope here (covered by unit tests / left as a follow-up).
 */

const envelope = (parts) =>
  JSON.stringify({
    appName: 'TagSpaces',
    appVersion: '6.0.0',
    exportVersion: 1,
    exportDate: new Date().toISOString(),
    ...parts,
  });

async function setImportFile(tid, content) {
  await global.client.setInputFiles('[data-tid=' + tid + ']', {
    name: 'tst44-import.json',
    mimeType: 'application/json',
    buffer: Buffer.from(content),
  });
}

async function reloadApp() {
  await global.client.reload();
  await global.client.waitForLoadState('load');
  await closeWelcomePlaywright();
}

async function readLocalStorage(key) {
  return global.client.evaluate((k) => localStorage.getItem(k), key);
}

test.afterEach(async () => {
  await clearDataStorage();
  await stopApp();
});

test.beforeEach(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  await startTestingApp(
    { isWeb, isS3, webServerPort, testInfo },
    'extconfig.js',
  );
  await closeWelcomePlaywright();
});

test.describe('TST44 - Unified Export / Import:', () => {
  test('TST4401 - Import tag groups via the Tag Library menu [electron]', async () => {
    const content = envelope({
      tagGroups: [
        {
          uuid: 'e2e-tg-uuid',
          title: 'E2EImportedGroup',
          color: '#61DD61',
          textcolor: 'white',
          children: [
            {
              title: 'e2etag',
              color: '#61DD61',
              textcolor: 'white',
              type: 'sidecar',
            },
          ],
        },
      ],
    });

    await clickOn('[data-tid=tagLibrary]');
    // open the Tag Library menu so its (hidden) file input is mounted
    await clickOn('[data-tid=tagLibraryMenu]');
    // selecting a file reroutes into Settings → Backup tab (import, scoped)
    await setImportFile('tagLibraryImportFileInput', content);
    // Settings dialog opens on the Backup tab in import mode; confirm.
    // Playwright auto-waits until the file is parsed and the button enabled.
    await clickOn('[data-tid=exportImportConfirmTID]');
    await clickOn('[data-tid=closeSettingsDialog]');
    await global.client.keyboard.press('Escape'); // dismiss any lingering menu

    await clickOn('[data-tid=tagLibrary]');
    await expectElementExist(
      '[data-tid=tagLibraryTagGroupTitle_E2EImportedGroup]',
      true,
      10000,
    );
    // persisted (not just optimistic)
    expect(await readLocalStorage('tsTagLibrary')).toContain('e2e-tg-uuid');

    // survives a hard reload
    await reloadApp();
    await clickOn('[data-tid=tagLibrary]');
    await expectElementExist(
      '[data-tid=tagLibraryTagGroupTitle_E2EImportedGroup]',
      true,
      10000,
    );
    expect(await readLocalStorage('tsTagLibrary')).toContain('e2e-tg-uuid');
  });

  test('TST4402 - Import application settings, merged + persisted [electron]', async () => {
    // showUnixHiddenEntries defaults to false; the import flips it to true.
    const content = envelope({ settings: { showUnixHiddenEntries: true } });
    const toggle = '[data-tid=settingsSetShowUnixHiddenEntries] input';

    await clickOn('[data-tid=settings]');
    expect(await global.client.isChecked(toggle)).toBe(false); // baseline

    await clickOn('[data-tid=backupRestoreSettingsDialog]');
    await setImportFile('backupImportFileInput', content);
    await clickOn('[data-tid=exportImportConfirmTID]');
    await clickOn('[data-tid=closeSettingsDialog]');

    await clickOn('[data-tid=settings]');
    expect(await global.client.isChecked(toggle)).toBe(true);
    await clickOn('[data-tid=closeSettingsDialog]');

    // survives a hard reload (redux-persist rehydration)
    await reloadApp();
    await clickOn('[data-tid=settings]');
    expect(await global.client.isChecked(toggle)).toBe(true);
    await clickOn('[data-tid=closeSettingsDialog]');
  });

  test('TST4403 - Import saved searches, persisted + survives reload [electron,_pro]', async () => {
    const content = envelope({
      searches: [
        { uuid: 'e2e-s-uuid', title: 'E2EImpSearch', textQuery: 'e2e' },
      ],
    });

    // Saved-searches section is Pro-gated; in the _pro project it is enabled.
    await clickOn('[data-tid=settings]');
    await clickOn('[data-tid=backupRestoreSettingsDialog]');
    await setImportFile('backupImportFileInput', content);
    await clickOn('[data-tid=exportImportConfirmTID]');
    await clickOn('[data-tid=closeSettingsDialog]');

    expect(await readLocalStorage('tsSavedSearches')).toContain('e2e-s-uuid');

    await reloadApp();
    expect(await readLocalStorage('tsSavedSearches')).toContain('e2e-s-uuid');
  });
});
