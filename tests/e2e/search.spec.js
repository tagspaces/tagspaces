import { delay, clearLocalStorage } from './hook';
import { checkFilenameForExist } from './test-utils.spec';
import {
  createLocation,
  openLocation,
  defaultLocationPath,
  defaultLocationName
} from './location.helpers';

export const regexQuery = '!"#$%&\'()*+,-./@:;<=>[\\]^_`{|}~';
export const searchTag = 'tag1';
export const searchTagDate = '201612';
export const searchSubFolder = '/search';
export const testFileInSubDirectory = 'sample_exif';
export const testFilename = 'sample.desktop';
export const firstTagButton = '/tbody/tr[1]/td[3]/button[1]';

export async function searchEngine(filename, tagName, resetSearchButton) {
  const searchElem = await global.client.$('[data-tid=search]');
  await searchElem.waitForDisplayed();
  await searchElem.click();
  await delay(1500);
  const searchInput = await global.client.$('#textQuery');
  await searchInput.waitForDisplayed();
  await searchInput.setValue(filename);

  if (tagName) {
    const searchTags = await global.client.$('#searchTags');
    await searchTags.waitForDisplayed();
    await searchTags.setValue(tagName);
  }

  if (resetSearchButton) {
    const resetSearch = await global.client.$('#resetSearchButton');
    await resetSearch.waitForDisplayed();
    await resetSearch.click();
  } else {
    const searchButton = await global.client.$('#searchButton');
    await searchButton.waitForDisplayed();
    await searchButton.click();
  }
  await delay(1000);
}

export async function createNewFile() {
  const dirMenu = await global.client.$(
    '[data-tid=folderContainerOpenDirMenu]'
  );
  await dirMenu.waitForDisplayed();
  await dirMenu.click();

  const createNewFile = await global.client.$('[data-tid=createNewFile]');
  await createNewFile.waitForDisplayed();
  await createNewFile.click();

  const createTextFileButton = await global.client.$(
    '[data-tid=createTextFileButton]'
  );
  await createTextFileButton.waitForDisplayed();
  await createTextFileButton.click();
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
