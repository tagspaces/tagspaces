import { expect, test } from './fixtures';
import { clickOn, expectElementExist } from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import { createPwLocation, defaultLocationName } from './location.helpers';
import { clearDataStorage } from './welcome.helpers';

test.beforeAll(
  async ({ isWeb, isS3, webServerPort, testDataDir }, testInfo) => {
    // Create a sample file for testing
    const fs = require('fs');
    const path = require('path');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(testDataDir, 'sample.txt'),
      'This is a sample file for AI tests.',
    );

    await startTestingApp(
      { isWeb, isS3, webServerPort, testInfo },
      'extconfig-ai.js', // Using AI config
    );

    if (isWeb) {
      // For web, we need to ensure the test data is accessible.
      // This might involve configuring the web server or using a specific URL structure.
      // For now, assuming testDataDir is served and accessible.
      // The test 'TSTXX02' navigates to '/?location=default' and expects 'sample.txt'.
      // This setup needs to align with how web tests access local file structures or mock them.
      // If direct file system access isn't possible, this might need a mock server or different setup.
    } else {
      // Create a default location for Electron tests
      await createPwLocation(testDataDir, defaultLocationName, true);
      await clickOn('[data-tid=location_' + defaultLocationName + ']');
      await expectElementExist('[data-tid=fsEntryName_sample.txt]', true, 8000);
    }
  },
);

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async ({ page }, testInfo) => {
  await clearDataStorage();
});

test.describe('OpenRouter Integration Tests', () => {
  test('TSTXX01 - Configure OpenRouter API Key', async ({ page }) => {
    // Navigate to Settings
    await clickOn('[data-tid=settingsButton]');
    await expectElementExist('[data-tid=settingsDialog]', true);

    // Navigate to AI Settings
    await clickOn('[data-tid=settingsCategory-AI]');
    await expectElementExist('[data-tid=aiSettingsPanel]', true);

    // Add OpenRouter Provider
    await clickOn('[data-tid=aiProviderAddButton]');
    await clickOn('[data-tid=aiCreateNewOpenRouterTID]'); // Select OpenRouter from dropdown

    // Configure API Key
    const apiKey = 'TEST_OPENROUTER_API_KEY';
    await page.fill('[data-tid=aiProviderApiKey_OpenRouter_0]', apiKey);
    await clickOn('[data-tid=aiProviderSaveButton_OpenRouter_0]');

    // Reopen settings to verify
    await clickOn('[data-tid=dialogCloseButton]');
    await clickOn('[data-tid=settingsButton]');
    await clickOn('[data-tid=settingsCategory-AI]');

    // Verify API Key is saved (input value is masked, check for existence of the provider)
    await expectElementExist('[data-tid=aiProviderCard_OpenRouter_0]', true);
    // Further verification might be needed if the API key itself is displayed or has a specific state indicator
  });

  test('TSTXX02 - Send message using OpenRouter model', async ({
    page,
    isWeb,
  }) => {
    // First, configure the API key (similar to the previous test)
    await clickOn('[data-tid=settingsButton]');
    await clickOn('[data-tid=settingsCategory-AI]');
    await clickOn('[data-tid=aiProviderAddButton]');
    await clickOn('[data-tid=aiCreateNewOpenRouterTID]');
    const apiKey = process.env.OPENROUTER_API_KEY || 'TEST_OPENROUTER_API_KEY'; // Use real key from env if available
    await page.fill('[data-tid=aiProviderApiKey_OpenRouter_0]', apiKey);
    await clickOn('[data-tid=aiProviderSaveButton_OpenRouter_0]');
    await clickOn('[data-tid=dialogCloseButton]');

    // Navigate to a file and open AI Properties tab
    // This assumes a file 'sample.txt' exists. We might need to create one.
    if (isWeb) {
      // In web, locations are handled differently, this part might need adjustment
      // or ensure a location is pre-loaded with 'sample.txt'
      await page.goto('/?location=default'); // Adjust if necessary
      await expectElementExist(
        '[data-tid=fsEntryName_sample.txt]',
        true,
        15000,
      );
    }
    // For electron, default location with 'sample.txt' should be created by beforeAll
    await clickOn('[data-tid=fsEntryName_sample.txt]');
    await expectElementExist('[data-tid=fileOpenedTitle_sample.txt]', true);
    await clickOn('[data-tid=entryPropertiesTab_AI]');
    await expectElementExist('[data-tid=chatViewTID]', true);

    // Select an OpenRouter model
    // The selector for the model dropdown and specific model needs to be identified
    await clickOn('[data-tid=selectChatModelButton]');
    // We need a way to wait for models to load
    await page.waitForTimeout(2000); // Crude wait, replace with a proper selector if possible
    // Selecting a specific model, e.g., "openrouter/auto" or a known free model
    // This selector will need to be verified from the actual UI
    await clickOn('[data-tid=chatModelListItem_openrouter/mythomist-7b]'); // Adjust model name/TID
    await expectElementExist(
      '[data-tid=chatModelListItem_openrouter/mythomist-7b][aria-selected="true"]',
      true,
    );

    // Send a message
    const message = 'Hello, OpenRouter!';
    await page.fill('[data-tid=chatInputTextField]', message);
    await clickOn('[data-tid=chatSendMessageButton]');

    // Verify response is received
    // The selector for the response message area needs to be identified
    await expectElementExist(
      '[data-tid^=chatMessageContent_assistant_]',
      true,
      30000,
    ); // Wait up to 30s for response
    const responseElement = await page
      .locator('[data-tid^=chatMessageContent_assistant_]')
      .last();
    const responseText = await responseElement.textContent();
    expect(responseText).not.toBeNull();
    expect(responseText?.length).toBeGreaterThan(0);
  });
});
