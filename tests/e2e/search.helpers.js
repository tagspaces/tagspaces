import {
  clickOn,
  expectElementExist,
  expectTagsExistBySelector,
  getGridFileSelector,
  isDisabled,
  isDisplayed,
  selectorFile,
  selectRowFiles,
  setInputKeys,
  setInputValue,
  typeInputValue,
  waitForNotification,
} from './general.helpers';
import { AddRemoveTagsToSelectedFiles } from './perspective-grid.helpers';
import { findAction } from '../../src/renderer/components/SearchOptions';

export const regexQuery = '!"#$%&\'()*+,-./@:;<=>[\\]^_`{|}~';
export const searchTag = 'tag1';
export const searchTagDate = '201612';
export const searchSubFolder = '/search';
export const testFileInSubDirectory = 'sample_exif';
export const testFilename = 'sample.desktop';
export const emptyFolderName = 'empty_folder';
export const firstTagButton = '/tbody/tr[1]/td[3]/button[1]';

export async function addSearchCommand(
  command,
  executeSearch = true,
  forceOpenMenu = false,
) {
  if (!(await isDisplayed('#textQuery'))) {
    await clickOn('[data-tid=toggleSearch]');
  }
  await typeInputValue('#textQuery', command);
  if (!findAction(command, true)) {
    await global.client.keyboard.press('Enter');
  }
  if (executeSearch) {
    await global.client.keyboard.press('Enter');
    await global.client.keyboard.press('Enter');
  } else if (forceOpenMenu) {
    await global.client.keyboard.press('ArrowDown');
  }
}
/**
 * @param filename
 * @param options = {
 *     tagName: true
 *     resetSearchButton: true
 *     reindexing: true
 * }
 * @param executeSearch
 * @returns {Promise<void>}
 */
export async function searchEngine(
  filename,
  options = {},
  executeSearch = true,
) {
  if (!(await isDisplayed('#textQuery'))) {
    await clickOn('[data-tid=toggleSearch]');
  }
  await typeInputValue('#textQuery', filename);
  if (executeSearch) {
    if (!(await isDisplayed('[data-tid=searchAdvancedTID]'))) {
      await clickOn('[data-tid=advancedSearch]');
    }
    if (options.tagName) {
      await setInputValue('[data-tid=searchTagsAndTID] input', filename);
    }

    if (options.reindexing) {
      await clickOn('[data-tid=forceIndexingTID]');
    }
    if (options.searchType) {
      await clickOn('[data-tid=' + options.searchType + ']');
    } else {
      await clickOn('[data-tid=strictSearchTID]');
    }

    if (options.resetSearchButton) {
      await clickOn('#resetSearchButton');
    } else {
      await clickOn('#searchButtonAdvTID');
    }
    await waitForNotification('TIDSearching');
  }
}

/**
 * @param searchQuery TS.SearchQuery
 * @returns {Promise<void>}
 */
export async function createSavedSearch(searchQuery) {
  //if (!(await global.client.$('#textQuery'))) {
  // await isDisplayed('#textQuery', false)) {
  await global.client.waitForTimeout(1000); // todo remove timeout (toggleSearch and advancedSearch is not click)
  await clickOn('[data-tid=toggleSearch]');
  await clickOn('[data-tid=advancedSearch]');

  await typeInputValue('#searchTerm', searchQuery.textQuery, 0);
  //await typeInputValue('#textQuery', searchQuery.textQuery, 10);
  //await clickOn('#searchButton');
  await clickOn('#searchButtonAdvTID');
  await clickOn('[data-tid=advancedSearch]');
  await clickOn('[data-tid=addSearchBtnTID]');
  await global.client.dblclick('[data-tid=savedSearchTID]');
  await setInputKeys('savedSearchTID', searchQuery.title);
  await clickOn('[data-tid=confirmSavedSearchTID]');
  await clickOn('[data-tid=closeSearchTID]');
}

export async function addRemoveTagsInSearchResults(
  tags = ['test-tag3', 'test-tag4'],
) {
  await global.client.dblclick(
    '[data-tid=fsEntryName_' + emptyFolderName + ']',
  );
  await searchEngine(testFilename); //, { reindexing: true });
  // expected current filename
  await expectElementExist(getGridFileSelector(testFilename), true, 5000);

  let selectedIds = await selectRowFiles([0]);

  await AddRemoveTagsToSelectedFiles('list', tags);

  for (let i = 0; i < tags.length; i++) {
    await expectElementExist(
      '[data-tid=tagContainer_' + tags[i] + ']',
      true,
      5000,
    );
  }
  if (await isDisabled('[data-tid=listPerspectiveAddRemoveTags]')) {
    //select rows to enable button
    selectedIds = await selectRowFiles([0]);
  }
  await AddRemoveTagsToSelectedFiles('list', tags, false);

  for (let i = 0; i < tags.length; i++) {
    await expectElementExist(
      '[data-tid=tagContainer_' + tags[i] + ']',
      false,
      5000,
    );
    /*await expectElementExist(
      selectorFile + '[' + (i + 1) + ']//div[@id="gridCellTags"]//button[1]',
      false,
      1500
    );*/
    /*await expectTagsExistBySelector(
      '[data-entry-id="' + selectedIds[i] + '"]',
      tags,
      false
    );*/
  }
}
