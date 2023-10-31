import { clickOn, setInputKeys } from './general.helpers';

export const testTagName = 'testTag';
export const newTagName = 'newTagName';
export const arrTags = ['tag1', 'tag2', 'tag3'];
export const testGroup = 'testGroupName';
export const editedGroupName = 'testGroup';

export async function createTagGroup(tagGroupName, locationName = undefined) {
  const tagGroup = await global.client.$(
    '[data-tid=tagLibraryMoreButton_' + tagGroupName + ']',
  );
  if (!tagGroup) {
    await clickOn('[data-tid=tagLibraryMenu]');
    await clickOn('[data-tid=createNewTagGroup]');

    await setInputKeys('createTagGroupInput', tagGroupName);
    if (locationName) {
      await clickOn('[data-tid=tagGroupLocationTID]');
      await clickOn('[data-tid=tglocation_' + locationName + ']');
    }
    await clickOn('[data-tid=createTagGroupConfirmButton]');
  }
}

export async function addTags(arrTags) {
  await clickOn('[data-tid=createTags]');
  await setInputKeys('addTagsInput', arrTags.join());
  await clickOn('[data-tid=createTagsConfirmButton]');
}

export async function tagMenu(tagName, menuOperation) {
  await clickOn('[data-tid=tagMoreButton_' + tagName + ']');
  await clickOn('[data-tid=' + menuOperation + ']');
}
