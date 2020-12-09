import {
  addInputKeys,
  clickOn,
  expectTagsExist,
  waitForNotification
} from './general.helpers';
import { firstFile, perspectiveGridTable } from './test-utils.spec';

/**
 *
 * @param tagNames
 * @param addTag = true - add tags; false - remove tags
 * @returns {Promise<void>}
 * @constructor
 */
export async function AddRemoveTagsToSelectedFiles(
  tagNames = ['test-tag'], // TODO fix camelCase tag name
  addTag = true
) {
  await clickOn('[data-tid=gridPerspectiveAddRemoveTags]');

  for (let i = 0; i < tagNames.length; i++) {
    const tagName = tagNames[i];
    await addInputKeys('AddRemoveTagsSelectTID', tagName);
    await global.client.keys('Enter');
    await global.client.pause(500);
  }

  if (addTag) {
    await clickOn('[data-tid=addTagsMultipleEntries]');
  } else {
    await clickOn('[data-tid=removeTagsMultipleEntries]');
  }
  await waitForNotification();

  /*const filesList = await global.client.$$(perspectiveGridTable + firstFile); // Selected file can be only one this check all files
  for (let i = 0; i < filesList.length; i++) {
    await expectTagsExist(filesList[i], tagNames, addTag);
  }*/
}
