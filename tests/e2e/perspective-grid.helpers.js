import { clickOn, isDisplayed, setInputKeys } from './general.helpers';

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
    await setInputKeys('AddRemoveTagsSelectTID', tagName);
    await global.client.keyboard.press('Enter');
  }

  if (addTag) {
    await clickOn('[data-tid=addTagsMultipleEntries]');
  } else {
    await clickOn('[data-tid=removeTagsMultipleEntries]');
  }
  // await waitForNotification();
  await isDisplayed('[data-tid=notificationTID]', false, 2500);

  /*const filesList = await global.client.$$(perspectiveGridTable + firstFile); // Selected file can be only one this check all files
  for (let i = 0; i < filesList.length; i++) {
    await expectTagsExist(filesList[i], tagNames, addTag);
  }*/
}
