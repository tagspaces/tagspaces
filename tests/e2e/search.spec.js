import {
  clickOn,
  expectElementExist,
  setInputValue,
  waitForNotification
} from './general.helpers';

export const regexQuery = '!"#$%&\'()*+,-./@:;<=>[\\]^_`{|}~';
export const searchTag = 'tag1';
export const searchTagDate = '201612';
export const searchSubFolder = '/search';
export const testFileInSubDirectory = 'sample_exif';
export const testFilename = 'sample.desktop';
export const firstTagButton = '/tbody/tr[1]/td[3]/button[1]';

/**
 *
 * @param filename
 * @param options = {
 *     tagName: true
 *     resetSearchButton: true
 *     reindexing: true
 * }
 * @returns {Promise<void>}
 */
export async function searchEngine(filename, options = {}) {
  const textQuery = await global.client.$('#textQuery');
  if (!(await textQuery.isDisplayed())) {
    await clickOn('[data-tid=search]');
  }
  await expectElementExist('#textQuery', true);
  await setInputValue('#textQuery', filename);

  if (options.tagName) {
    await setInputValue('#searchTags', filename);
  }

  if (options.reindexing) {
    await clickOn('[data-tid=forceIndexingTID]');
  }

  if (options.resetSearchButton) {
    await clickOn('#resetSearchButton');
  } else {
    await clickOn('#searchButton');
  }
  await waitForNotification('TIDSearching');
  await global.client.pause(1500); //todo: for minio search is slow
}

/*describe('TST06 - Test Search in file structure:', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, false);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it('TST0601 - Simple Search / filter the current folder', async () => {
    await searchEngine(testFilename);
    // expected current filename
    await checkFilenameForExist(testFilename);
  });

  it('TST0602 - Search in sub folder: word with "?" in front of the query', async () => {
    await searchEngine('? ' + testFileInSubDirectory);
    // expected current filename
    await checkFilenameForExist(testFileInSubDirectory);
  });

  it('TST0602 - Advanced Search: word with "?" in front of the query', async () => {
    await searchEngine('? ' + testFileInSubDirectory);
    // expected current filename
    await checkFilenameForExist(testFileInSubDirectory);
  });

  it('TST0603 - Advanced Search: word with "!" symbol in front of the query', async () => {
    await searchEngine('! ' + testFileInSubDirectory);
    // expected current filename
    await checkFilenameForExist(testFileInSubDirectory);
  });

  it('TST0604 - Search for tag', async () => {
    await searchEngine('! ' + testFileInSubDirectory, searchTag);
    // expected current filename and tag
    await checkFilenameForExist(testFileInSubDirectory);
  });

  it('TST0604 - Advanced Search: word with "+" symbol in front of the query', async () => {
    await searchEngine('+ ' + testFileInSubDirectory);
  });

  it('TST0604 - Advanced Search: word and tag', async () => {
    await searchEngine('+ ' + testFileInSubDirectory);
    // expected current filename and tag
    await checkFilenameForExist(testFilename, searchTag);
  });

  it('Advanced Search: test with regex query', async () => {
    await searchEngine(regexQuery);
    // expected current filename
    await checkFilenameForExist(testFileInSubDirectory);
  });

  it('Advanced Search: reset button', async () => {
    await searchEngine(testFileInSubDirectory, searchTag, true);
    // expected to reset all search engine
  });
});*/
