/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
// import { createLocation, defaultLocationPath, checkForIdExist } from './location.spec';

const testLocationName = '' + new Date().getTime();

export async function openSettings(selectedTab) {
  await global.client.waitForVisible('[data-tid=settings]');
  await global.client.click('[data-tid=settings]');
  if (selectedTab) {
    await global.client.waitForVisible('[data-tid=' + selectedTab + ']');
    await global.client.click('[data-tid=' + selectedTab + ']');
  }
}

describe('TST07 - General', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
  });

  it('TST0701 - Open About TagSpaces', async () => {
    await global.client.waitForVisible('[data-tid=aboutTagSpaces]');
    await global.client.click('[data-tid=aboutTagSpaces]');
    await global.client.waitForVisible('[data-tid=closeAboutDialog]');
    await global.client.click('[data-tid=closeAboutDialog]');
  });

  it('TST0705 - Open Settings Dialog', async () => {
    await global.client.waitForVisible('[data-tid=settings]');
    await global.client.click('[data-tid=settings]');
    await checkForIdExist('settingsDialog');
    await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    await global.client.click('[data-tid=closeSettingsDialog]');
  });

  it('TST07** - Change theme color', async () => {
    await global.client.waitForVisible('[data-tid=settings]');
    await global.client.click('[data-tid=settings]');
    await delay(500);
    // activate dark theme
    await global.client.waitForVisible('[data-tid=settingsSetCurrentTheme]');
    await global.client.selectByValue(
      '[data-tid=settingsSetCurrentTheme]/div/select',
      'dark'
    );
    await delay(500);
    // const style = await global.client.getAttribute('//button[contains(., "done")]', 'style');
    // await delay(500);
    // expect(style).toContain('rgb(208, 107, 100)');
    // await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    // await global.client.click('[data-tid=closeSettingsDialog]');
  });

  /* it('TST10** - Desktop Mode', async () => {
    await createLocation(defaultLocationPath, testLocationName, false);
    await checkForIdExist('folderContainerLocationChooser');
    await delay(500);
    await global.client.waitForVisible('[data-tid=settings]');
    await global.client.click('[data-tid=settings]');
    await global.client.waitForVisible('[data-tid=settingsSetDesktopMode]');
    await global.client.click('[data-tid=settingsSetDesktopMode]');
    await delay(2000);
    await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    await global.client.click('[data-tid=closeSettingsDialog]');
    // set desktop mode and check for desktop text / Location Chooser bottom in Toolbar
    const isDesktopMode = await global.client.element('[data-tid=folderContainerLocationChooser]');
    await delay(500);
    expect(isDesktopMode.selector).not.toBe('[data-tid=folderContainerLocationChooser]');
  }); */

  // it('TST1003 - Checkbox in the settings to open the tag library on startup', async () => {
  //
  // });
});
