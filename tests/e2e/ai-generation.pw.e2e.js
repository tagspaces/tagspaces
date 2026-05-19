/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */

// AI generation dialog coverage. Two tiers:
//
//  Tier 1 — guard / UI-state, no AI service needed (deterministic):
//    TST7001  no AI provider configured -> Start disabled + warning + CTA
//    TST7002  only unsupported files selected -> Start disabled; selecting a
//             supported file re-enables it
//    TST7003  "Max tags" cannot be set to 0 (clamps to >=1)
//
//  Tier 2 — generation flow against a mocked Ollama (Playwright route):
//    TST7004  tags generated -> file renamed by tag embedding -> the per-file
//             "processed" check stays visible (regression: entry uuid churns
//             on the tag-rename, the dialog must not lose the check)
//
// All AI features are Pro and don't apply to S3 — tagged [electron,_pro].

import { expect, test } from './fixtures';
import {
  clickOn,
  createLocation,
  expectElementExist,
  expectElementSelected,
  getGridFileSelector,
  isDisabled,
  reloadDirectory,
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';
import {
  armOllamaMock,
  disarmOllamaMock,
  openAiGenerationDialog,
} from './ai.helpers';

async function bootWithLocation(
  { isWeb, isS3, webServerPort, testInfo },
  testDataDir,
  extconfig,
) {
  await startTestingApp({ isWeb, isS3, webServerPort, testInfo }, extconfig);
  await closeWelcomePlaywright();
  // Use the suite's blessed helper — it opens the location and waits for the
  // directory grid (not the location-tree) to be populated.
  await createLocation({ isS3, testDataDir }, '', undefined, true);
  // Make sure the files we interact with are actually listed before clicking,
  // so selection isn't racing the directory render.
  await expectElementExist(getGridFileSelector('sample.txt'), true, 30000);
}

async function selectFile(name) {
  await expectElementExist(getGridFileSelector(name), true, 15000);
  await clickOn(getGridFileSelector(name));
  // Selection can lag a beat behind the click under full-suite load.
  await expectElementSelected(name, true, 10000);
}

test.describe('TST70 - AI generation dialog guards [electron,_pro]', () => {
  test.afterEach(async ({ isS3, testDataDir }) => {
    await testDataRefresh(isS3, testDataDir);
    await clearDataStorage();
    await stopApp();
  });

  test('TST7001 - No AI provider: Start disabled, warning + settings CTA [electron,_pro]', async ({
    isWeb,
    isS3,
    webServerPort,
    testDataDir,
  }, testInfo) => {
    await bootWithLocation(
      { isWeb, isS3, webServerPort, testInfo },
      testDataDir,
      'extconfig-ai-no-provider.js',
    );
    // A supported file is selected so the only reason generation can't
    // start is the missing provider.
    await selectFile('sample.txt');
    await openAiGenerationDialog();

    await expectElementExist('[data-tid=aiCannotGenerateAlertTID]', true, 4000);
    // The "open AI settings" action only renders when there is no provider —
    // this distinguishes the no-provider case from no-supported-files.
    await expectElementExist(
      '[data-tid=openAiSettingsFromAlertTID]',
      true,
      4000,
    );
    expect(await isDisabled('[data-tid=startTagsGenTID]')).toBe(true);
  });

  test('TST7003 - Max tags cannot be 0 (clamps to >=1) [electron,_pro]', async ({
    isWeb,
    isS3,
    webServerPort,
    testDataDir,
  }, testInfo) => {
    await bootWithLocation(
      { isWeb, isS3, webServerPort, testInfo },
      testDataDir,
      'extconfig-ai-mock.js',
    );
    await selectFile('sample.txt');
    await openAiGenerationDialog();

    const maxTags = '[data-tid=maxTagsTID] input';
    await global.client.fill(maxTags, '0');
    // onChange clamps non-positive/NaN to 1; the controlled input reflects it.
    await expect
      .poll(() => global.client.inputValue(maxTags), {
        timeout: 4000,
        intervals: [150],
      })
      .toBe('1');
  });
});

test.describe('TST70 - AI generation: supported-files guard [electron,_pro]', () => {
  test.afterEach(async ({ isS3, testDataDir }) => {
    await testDataRefresh(isS3, testDataDir);
    await clearDataStorage();
    await stopApp();
  });

  test('TST7002 - Only unsupported selected disables Start; supported re-enables [electron,_pro]', async ({
    isWeb,
    isS3,
    webServerPort,
    testDataDir,
  }, testInfo) => {
    await bootWithLocation(
      { isWeb, isS3, webServerPort, testInfo },
      testDataDir,
      'extconfig-ai-mock.js',
    );

    // sample.bmp is neither an AI-supported text nor image type.
    await selectFile('sample.bmp');
    await openAiGenerationDialog();
    await expectElementExist('[data-tid=aiCannotGenerateAlertTID]', true, 4000);
    // Provider IS configured here, so the no-provider CTA must NOT show —
    // the block is purely the unsupported-selection guard.
    await expectElementExist(
      '[data-tid=openAiSettingsFromAlertTID]',
      false,
      2000,
    );
    expect(await isDisabled('[data-tid=startTagsGenTID]')).toBe(true);

    // Close, select a supported file, reopen -> Start enabled, no warning.
    await clickOn('[data-tid=cancelTagsGenTID]');
    await selectFile('sample.txt');
    await openAiGenerationDialog();
    await expectElementExist('[data-tid=aiCannotGenerateAlertTID]', false, 2000);
    expect(await isDisabled('[data-tid=startTagsGenTID]')).toBe(false);
  });
});

test.describe('TST70 - AI generation: mocked Ollama [electron,_pro]', () => {
  test.afterEach(async ({ isS3, testDataDir }) => {
    await testDataRefresh(isS3, testDataDir);
    await clearDataStorage();
    await stopApp();
  });

  test('TST7004 - Tags generated, file renamed, processed check persists [electron,_pro]', async ({
    isWeb,
    isS3,
    webServerPort,
    testDataDir,
  }, testInfo) => {
    await bootWithLocation(
      { isWeb, isS3, webServerPort, testInfo },
      testDataDir,
      'extconfig-ai-mock.js',
    );

    const capture = { tags: 0, chat: 0, requests: [] };
    await armOllamaMock(capture, ['e2ealpha', 'e2ebeta', 'e2egamma']);
    try {
      await selectFile('sample.txt');
      await openAiGenerationDialog();
      await clickOn('[data-tid=startTagsGenTID]');

      // Mock was actually exercised (model list + at least one chat call).
      await expect
        .poll(() => capture.chat, { timeout: 30000, intervals: [300] })
        .toBeGreaterThan(0);

      // The per-file processed check appears…
      await expectElementExist('[data-tid=aiEntryProcessedTID]', true, 40000);
      // …and it must STILL be there after the tag-rename has reflected.
      // This is the regression: pre-fix the renamed entry got a fresh uuid
      // (files without a sidecar are re-enhanced with getUuid() on every
      // listing) and the frozen-snapshot was swapped out, losing the check.
      await global.client.waitForTimeout(4000);
      await expectElementExist('[data-tid=aiEntryProcessedTID]', true, 3000);

      // Close the dialog before checking the grid: with the modal open the
      // grid sits behind the backdrop (reflect timing + visibility are
      // racy). Closing + an explicit reload reads the on-disk state, which
      // is the source of truth — the rename already completed on disk by
      // the time the processed check appeared.
      await clickOn('[data-tid=cancelTagsGenTID]');
      await reloadDirectory();
      await expectElementExist(
        getGridFileSelector('sample[e2ealpha e2ebeta e2egamma].txt'),
        true,
        15000,
      );
      await expectElementExist(getGridFileSelector('sample.txt'), false, 3000);
    } finally {
      await disarmOllamaMock();
    }
  });
});
