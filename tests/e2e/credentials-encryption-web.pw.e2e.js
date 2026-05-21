/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */
import { expect, test } from './fixtures';
import {
  clickOn,
  expectElementExist,
  setInputValue,
} from './general.helpers';
import { createLocation } from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

/**
 * Web-only coverage for the at-rest credentials encryption feature.
 *
 * Flow exercised:
 *   1. create an S3 location (its credentials end up in `state.locations`,
 *      persisted because `extconfig.js` has `ExtSaveLocationsInBrowser=true`)
 *   2. enable encryption from Settings → set a password → password-setup
 *      dialog closes, toggle shows ON
 *   3. read raw `localStorage.persist:root` and assert it contains a
 *      `tsenc:p1:` blob for the location's `secretAccessKey` AND that no
 *      plaintext access key leaks
 *   4. reload the tab → UnlockScreen appears → enter the password → app
 *      hydrates → location is back in the location manager
 *   5. disable encryption from Settings → assert plaintext returns to
 *      localStorage and the KDF/verifier keys are gone
 *   6. reload the tab → no UnlockScreen (feature off) → location still
 *      loads.
 *
 * Test data IDs come from CredentialsPasswordSetupDialog.tsx,
 * UnlockScreen.tsx, and the toggle in SettingsGeneral.tsx.
 */

const TEST_PASSWORD = 'correct horse battery staple';
const LOCATION_NAME = 'TST91-Encrypted-S3';
const PERSIST_KEY = 'persist:root';
const KDF_KEY = 'tsCredKdf';
const VERIFIER_KEY = 'tsCredVerify';

async function reloadWebApp() {
  await global.client.reload();
  await global.client.waitForLoadState('load');
  await closeWelcomePlaywright();
}

async function readLs(key) {
  return global.client.evaluate((k) => localStorage.getItem(k), key);
}

async function openSettings() {
  await clickOn('[data-tid=settings]');
  await global.client.waitForSelector(
    '[data-tid=settingsEncryptCredentialsAtRest]',
    { state: 'visible', timeout: 5000 },
  );
}

async function closeSettings() {
  await clickOn('[data-tid=closeSettingsDialog]');
}

async function enableEncryptionWithPassword(password) {
  await openSettings();
  await clickOn('[data-tid=settingsEncryptCredentialsAtRest]');
  await global.client.waitForSelector('[data-tid=credentialsPasswordTID]', {
    state: 'visible',
    timeout: 5000,
  });
  await setInputValue('[data-tid=credentialsPasswordTID] input', password);
  await setInputValue(
    '[data-tid=credentialsPasswordConfirmTID] input',
    password,
  );
  await clickOn('[data-tid=submitCredentialsSetupTID]');
  // Dialog closes on submit; wait until it's gone before continuing.
  await global.client.waitForSelector('[data-tid=credentialsPasswordTID]', {
    state: 'hidden',
    timeout: 5000,
  });
  await closeSettings();
}

async function disableEncryption() {
  await openSettings();
  await clickOn('[data-tid=settingsEncryptCredentialsAtRest]');
  // Confirm dialog: click the default confirm action.
  await clickOn('[data-tid=confirmDialogTID]');
  await closeSettings();
}

async function unlock(password) {
  await global.client.waitForSelector(
    '[data-tid=credentialsUnlockPasswordTID]',
    { state: 'visible', timeout: 8000 },
  );
  await setInputValue(
    '[data-tid=credentialsUnlockPasswordTID] input',
    password,
  );
  await clickOn('[data-tid=credentialsUnlockButtonTID]');
  // UnlockScreen unmounts when the app boots.
  await global.client.waitForSelector(
    '[data-tid=credentialsUnlockPasswordTID]',
    { state: 'hidden', timeout: 8000 },
  );
}

test.afterEach(async () => {
  await clearDataStorage();
  await stopApp();
});

test.beforeEach(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  test.skip(!isWeb, 'TST91 covers the web-only password mode');
  // Custom extconfig: ExtSaveLocationsInBrowser=true (locations persisted)
  // and no `ExtLocations` (so the locations reducer is the regular one and
  // the test can add an S3 location to encrypt). See
  // `scripts/extconfig-credentials-encryption.js`.
  await startTestingApp(
    { isWeb, isS3, webServerPort, testInfo },
    'extconfig-credentials-encryption.js',
  );
  await closeWelcomePlaywright();
});

test.describe('TST91 - Credentials encryption on web (password mode):', () => {
  test('TST9101 - Encrypt, reload + unlock, then disable + reload [web,s3]', async ({
    isS3,
  }) => {
    // Step 1: create an S3 location whose credentials we will encrypt.
    await createLocation(
      { isS3, testDataDir: '' },
      '',
      LOCATION_NAME,
      false,
      false,
      null, // no folder-exists assertion: the bucket path lookup is not
      //                                              part of this test
    );

    // Sanity check: pre-encrypt the location is in persist:root in
    // plaintext (the access keys we used in createS3Location). The TID
    // for the location entry is `location_<name>`.
    await expectElementExist(`[data-tid=location_${LOCATION_NAME}]`, true);
    const beforeEnc = await readLs(PERSIST_KEY);
    expect(beforeEnc, 'persist:root must exist on web (ExtSaveLocationsInBrowser=true)')
      .toBeTruthy();
    expect(beforeEnc).toContain('secretAccessKey');
    expect(beforeEnc).not.toContain('tsenc:');

    // Step 2: enable encryption with a password.
    await enableEncryptionWithPassword(TEST_PASSWORD);

    // Step 3: persist:root contains tsenc:p1: blobs for the credential
    // fields; no plaintext access key remains.
    const afterEnc = await readLs(PERSIST_KEY);
    expect(afterEnc, 'persist:root after enable').toBeTruthy();
    expect(afterEnc).toContain('tsenc:p1:');
    // The literal "test" access key we set in createS3Location should
    // not be present anywhere in the persisted root (it's been replaced
    // by a tsenc:p1: blob).
    expect(afterEnc.includes('"accessKeyId":"test"')).toBeFalsy();
    expect(afterEnc.includes('"secretAccessKey":"test"')).toBeFalsy();
    // KDF metadata + verifier are written to dedicated keys.
    expect(await readLs(KDF_KEY)).toBeTruthy();
    expect(await readLs(VERIFIER_KEY)).toBeTruthy();

    // Step 4: reload → UnlockScreen → enter password → app loads, the
    // location is back in the manager.
    await reloadWebApp();
    await unlock(TEST_PASSWORD);
    await expectElementExist(`[data-tid=location_${LOCATION_NAME}]`, true);

    // Step 5: disable encryption. Plaintext returns to localStorage and
    // the KDF/verifier helpers are removed.
    await disableEncryption();
    const afterDisable = await readLs(PERSIST_KEY);
    expect(afterDisable, 'persist:root after disable').toBeTruthy();
    expect(afterDisable).not.toContain('tsenc:');
    expect(afterDisable).toContain('secretAccessKey');
    expect(await readLs(KDF_KEY)).toBeFalsy();
    expect(await readLs(VERIFIER_KEY)).toBeFalsy();

    // Step 6: reload — no UnlockScreen (feature off), location still
    // loads from plaintext.
    await reloadWebApp();
    await expectElementExist(
      '[data-tid=credentialsUnlockPasswordTID]',
      false,
      3000,
    );
    await expectElementExist(`[data-tid=location_${LOCATION_NAME}]`, true);
  });
});
