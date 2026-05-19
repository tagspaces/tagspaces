/**
 * Verifies that fulltext indexing in Lite/Pro behaves correctly:
 *   - Lite: plain-text content (.md, .txt) is indexed and searchable.
 *     PDF/Office content is NOT indexed.
 *   - Pro:  same plain-text behavior, AND PDF content is indexed too.
 *
 * The Lite test (TST0701) is tagged `[electron,_lite]` and runs only in the
 * `electron-light` Playwright project — see playwright.config.js. The Pro
 * test (TST0702) is tagged `[electron,_pro]` and runs only in the `electron`
 * project, where the Pro module is installed and bundled.
 *
 * Search vocabulary (taken from the existing testdata files):
 *   - "Lorem"     — present in sample.txt
 *   - "embedding" — present in sample.md prose (headings). NOTE: it must be
 *     body/heading text, not a link URL — extractMarkdownText() indexes only
 *     marked "text" tokens and drops link/emphasis/code tokens, so a term
 *     that lives only inside a markdown link href is never in the index.
 *   - "Klasirane" — present ONLY in sample.pdf (extracted via pdfjs)
 */
import { expect, test } from './fixtures';
import {
  clickOn,
  expectElementExist,
  getGridFileSelector,
  isDisplayed,
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import {
  closeLocation,
  createPwLocation,
  createS3Location,
  defaultLocationName,
} from './location.helpers';
import { searchEngine } from './search.helpers';
import { clearDataStorage } from './welcome.helpers';

const pdfSearchTerm = 'Klasirane';
const mdSearchTerm = 'embedding';
const txtSearchTerm = 'Lorem';

test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  await startTestingApp(
    { isWeb, isS3, webServerPort, testInfo },
    'extconfig-two-locations.js',
  );
});

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async ({ isS3, testDataDir }) => {
  await testDataRefresh(isS3, testDataDir);
  await clearDataStorage();
});

test.beforeEach(async ({ isS3, testDataDir }) => {
  if (isS3) {
    await createS3Location('', defaultLocationName, true, true);
  } else {
    await createPwLocation(testDataDir, defaultLocationName, true, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 15000);
  if (await isDisplayed('#clearSearchID', true, 1000)) {
    await clickOn('#clearSearchID');
    await expectElementExist('#textQuery', false, 5000);
  }
});

test.describe('TST07 - Fulltext indexing scope (Lite vs Pro):', () => {
  test('TST0701 - Lite: plain-text indexed, PDF skipped [electron,_lite]', async () => {
    // Force a fresh fulltext index so we know `extractTextContent` ran.
    await searchEngine(txtSearchTerm, { reindexing: true });
    await expectElementExist(
      getGridFileSelector('sample.txt'),
      true,
      15000,
    );
    await clickOn('#clearSearchID');
    await expectElementExist('#textQuery', false, 5000);

    await searchEngine(mdSearchTerm);
    await expectElementExist(getGridFileSelector('sample.md'), true, 10000);
    await clickOn('#clearSearchID');
    await expectElementExist('#textQuery', false, 5000);

    // PDF must NOT be indexed in Lite — the search returns no hit on
    // a phrase that lives only inside the PDF stream.
    await searchEngine(pdfSearchTerm);
    await expectElementExist(
      getGridFileSelector('sample.pdf'),
      false,
      5000,
    );
  });

  test('TST0702 - Pro: plain-text and PDF both indexed [electron,_pro]', async () => {
    await searchEngine(txtSearchTerm, { reindexing: true });
    await expectElementExist(
      getGridFileSelector('sample.txt'),
      true,
      15000,
    );
    await clickOn('#clearSearchID');
    await expectElementExist('#textQuery', false, 5000);

    await searchEngine(mdSearchTerm);
    await expectElementExist(getGridFileSelector('sample.md'), true, 10000);
    await clickOn('#clearSearchID');
    await expectElementExist('#textQuery', false, 5000);

    // In Pro, the PDF text is extracted via pdfjs and "Klasirane" should hit.
    await searchEngine(pdfSearchTerm);
    await expectElementExist(getGridFileSelector('sample.pdf'), true, 15000);
  });
});
