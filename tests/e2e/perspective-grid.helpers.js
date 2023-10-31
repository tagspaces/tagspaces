import { clickOn, isDisplayed, setInputKeys } from './general.helpers';
import {
  cleanFileName,
  extractFileExtension,
  extractTagsAsObjects,
} from '@tagspaces/tagspaces-common/paths';
import {
  dirSeparator,
  tagDelimiter,
} from '@tagspaces/tagspaces-common/AppConfig';
import { sortByCriteria } from '@tagspaces/tagspaces-common/misc';

/**
 *
 * @param tagNames
 * @param addTag = true - add tags; false - remove tags
 * @param perspective - current Perspective
 * @returns {Promise<void>}
 * @constructor
 */
export async function AddRemoveTagsToSelectedFiles(
  perspective = 'grid',
  tagNames = ['test-tag'], // TODO fix camelCase tag name
  addTag = true,
) {
  await clickOn('[data-tid=' + perspective + 'PerspectiveAddRemoveTags]');

  for (let i = 0; i < tagNames.length; i++) {
    const tagName = tagNames[i];
    await setInputKeys('AddRemoveTagsSelectTID', tagName);
    await global.client.keyboard.press('Enter');
  }

  if (addTag) {
    await clickOn('[data-tid=addTagsMultipleEntries]');
  } else {
    await clickOn('[data-tid=removeTagsMultipleEntries]');
  }
  // await waitForNotification();
  // await isDisplayed('[data-tid=notificationTID]', false, 4500);

  /*const filesList = await global.client.$$(perspectiveGridTable + firstFile); // Selected file can be only one this check all files
  for (let i = 0; i < filesList.length; i++) {
    await expectTagsExist(filesList[i], tagNames, addTag);
  }*/
}

export async function getDirEntries(sortCriteria, sortAsc) {
  const path = require('path');
  const fs = require('fs-extra');
  const testDir = path.join(
    __dirname,
    '..',
    'testdata-tmp',
    'file-structure',
    'supported-filestypes',
  );
  const dirEntries = (await fs.readdir(testDir, { withFileTypes: true }))
    .filter((item) => !item.isDirectory() && !item.name.startsWith('.'))
    .map((item) => {
      const entryPath = testDir + dirSeparator + item.name;
      const stats = fs.statSync(entryPath);
      return {
        name: cleanFileName(item.name),
        isFile: item.isFile(),
        size: stats.size,
        lmdt: stats.mtime.getTime ? stats.mtime.getTime() : stats.mtime,
        extension: extractFileExtension(item.name, dirSeparator),
        tags: extractTagsAsObjects(item.name, tagDelimiter, dirSeparator),
      };
    });
  return sortByCriteria(dirEntries, sortCriteria, sortAsc);
}
