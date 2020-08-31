/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay } from './hook';

const testTagName = 'testTag';
const newTagName = 'newTagName';
const commaSeparatedTags = 'tag1, tag2, tag3';
const testGroup = 'testGroupName';
const editedGroupName = 'testGroup';
const defaultDelay = 1500;

// TODO add test id for the create tag group

export async function openTagLibrary() {
  await global.client.click('[data-tid=tagLibrary]');
  await delay(defaultDelay);
}

export async function createTagGroup(tagGroupName) {
  await global.client.click('[data-tid=tagLibraryMenu]');
  await global.client.click('[data-tid=createNewTagGroup]');
  await delay(500);
  await global.client
    .$('[data-tid=createTagGroupInput] input')
    .setValue(tagGroupName);
  await delay(500);
  await global.client.click('[data-tid=createTagGroupConfirmButton]');
  await delay(defaultDelay);
}

export async function openTagGroupMenu(tagGroupName) {
  await delay(500);
  await global.client.waitForVisible(
    '[data-tid=tagLibraryMoreButton_' + tagGroupName + ']'
  );
  await global.client.click(
    '[data-tid=tagLibraryMoreButton_' + tagGroupName + ']'
  );
}

export async function addTag(tagName) {
  await global.client.waitForVisible('[data-tid=createTags]');
  await global.client.click('[data-tid=createTags]');
  await delay(500);
  await global.client.$('[data-tid=addTagsInput] input').setValue(tagName);
  await global.client.click('[data-tid=createTagsConfirmButton]');
}

export async function tagMenu(tagName, menuOperation) {
  await global.client.waitForVisible(
    '[data-tid=tagMoreButton_' + tagName + ']'
  );
  await global.client.click('[data-tid=tagMoreButton_' + tagName + ']');
  await global.client.waitForVisible('[data-tid=' + menuOperation + ']');
  await global.client.click('[data-tid=' + menuOperation + ']');
}

describe('TST04 - Testing the tag library:', () => {
  beforeEach(async () => {
    await openTagLibrary();
  });

  it('TST0401 - Should create a tag group', async () => {
    await createTagGroup(testGroup);
    const addedGroup = await global.client.getText(
      '//h3[text()="' + testGroup + '"]'
    );
    expect(addedGroup).toBe(testGroup);
  });

  it('TST0402 - Should delete tag group', async () => {
    await createTagGroup(testGroup);
    await delay(500);
    await openTagGroupMenu(testGroup);
    await global.client.waitForVisible('[data-tid=deleteTagGroup]');
    await global.client.click('[data-tid=deleteTagGroup]');
    await delay(500);
    await global.client.click('[data-tid=confirmDeleteTagGroupDialog]');
    await delay(500);
    const group = await global.client.getText(
      '[data-tid=tagLibraryTagGroupList]'
    );
    await delay(500);
    expect(group.indexOf('tagGroupContainer_' + testGroup + '') >= 0).toBe(
      false
    );
  });

  it('TST0403 - Rename tag group', async () => {
    await createTagGroup(testGroup);
    await openTagGroupMenu(testGroup);
    await delay(defaultDelay);
    await global.client.waitForVisible('[data-tid=editTagGroup]');
    await global.client.click('[data-tid=editTagGroup]');
    await delay(500);
    await global.client
      .$('[data-tid=editTagGroupInput] input')
      .setValue(editedGroupName);
    await delay(500);
    await global.client.click('[data-tid=editTagGroupConfirmButton]');
    await delay(500);
    const renamedGroup = await global.client.getText(
      '//h3[text()="' + editedGroupName + '"]'
    );
    expect(renamedGroup).toBe(editedGroupName);
  });

  it('TST0404 - Change default tag group tag colors', async () => {
    await createTagGroup(testGroup);
    await openTagGroupMenu(testGroup);
    await global.client.waitForVisible('[data-tid=editTagGroup]');
    await global.client.click('[data-tid=editTagGroup]');
    await delay(500);
    await global.client.waitForVisible(
      '[data-tid=editTagGroupBackgroundColor]'
    );
    await global.client.click('[data-tid=editTagGroupBackgroundColor]');
    await delay(500);
    // select color from ColorChoosier Dialog
    await global.client.click(
      '/html/body/div[18]/div/div[2]/div[2]/div/div[4]/div[4]/span/div'
    ); // TODO xpath is not accepted
    await delay(500);
    // modal confirmation
    await global.client.click(
      '/html/body/div[18]/div/div[2]/div[3]/div[2]/button'
    ); // ('[data-tid=editTag]'); // TODO xpath is not accepted
    await delay(500);
    await global.client.waitForVisible('[data-tid=editTagGroupSwitch]');
    await global.client.click('[data-tid=editTagGroupSwitch]');
    await global.client.waitForVisible('[data-tid=editTagGroupConfirmButton]');
    await global.client.click('[data-tid=editTagGroupConfirmButton]');
    await delay(500);
    await openTagGroupMenu(testGroup);
    await delay(500);
    await addTag(newTagName);
    const style = await global.client.getAttribute(
      '//button[contains(., "' + newTagName + '")]',
      'style'
    );
    await delay(500);
    expect(style).toContain('rgb(208, 107, 100)');
  });

  it('TST0405 - Should add tag to a tag group', async () => {
    await createTagGroup(testGroup);
    await openTagGroupMenu(testGroup);
    await addTag(newTagName);
    const addedTag = await global.client.element(
      '[data-tid=' + newTagName + ']'
    );
    // // const addedTag = await global.client.getValue('[data-tid=' + newTagName + ']');
    // // const addedTag = await global.client.getText('//button[contains(., "newTagName")');
    await delay(500);
    expect(addedTag.selector).toBe('[data-tid=' + newTagName + ']');
  });

  it('TST0405 - Add tag (s) / Should add comma separated tags to a tag group', async () => {
    await createTagGroup(testGroup);
    await openTagGroupMenu(testGroup);
    await global.client.waitForVisible('[data-tid=createTags]');
    await global.client.click('[data-tid=createTags]');
    await delay(500);
    await global.client
      .$('[data-tid=addTagsInput] input')
      .setValue(commaSeparatedTags);
    await global.client.click('[data-tid=createTagsConfirmButton]');
    await delay(500);
    // const addedTag = await global.client.getText('//button[text()="' + commaSeparatedTags.split(',')[0] + '"]');
    const tag1 = await global.client.element(
      '[data-tid=' + commaSeparatedTags.split(',')[0] + ']'
    );
    const tag2 = await global.client.element(
      '[data-tid=' + commaSeparatedTags.split(',')[1] + ']'
    );
    const tag3 = await global.client.element(
      '[data-tid=' + commaSeparatedTags.split(',')[2] + ']'
    );
    // expect(tag1).toBe(commaSeparatedTags.split(',')[0]); // TODO try make it like this, evtl use getText
    // expect(tag2.selector).toBe('[data-tid=' + commaSeparatedTags.split(',')[1] + ']');
    // expect(tag3.selector).toBe('[data-tid=' + commaSeparatedTags.split(',')[2] + ']');
  });

  it('TST0407 - Should rename tag', async () => {
    await tagMenu('done', 'editTagDialog');
    await delay(500);
    await global.client
      .$('[data-tid=editTagInput] input')
      .setValue(testTagName);
    await global.client.waitForVisible('[data-tid=editTagConfirm]');
    await global.client.click('[data-tid=editTagConfirm]');
    const editedTag = await global.client.getText(
      '//button[contains(., "' + testTagName + '")]'
    );
    expect(editedTag).toBe(testTagName);
  });

  it('TST0408 - Should delete tag from a tag group', async () => {
    await tagMenu('done', 'deleteTagDialog');
    await delay(500);
    await global.client.click('[data-tid=confirmDeleteTagDialogTagMenu]');
    await delay(500);
    const elements = await global.client.getText(
      '[data-tid=tagGroupContainer_ToDo_Workflow]'
    ); // TODO do not use preexisting tag groups
    await delay(500);
    expect(elements.indexOf('done') >= 0).toBe(false);
  });

  it('TST0409 - Should sort tags in a tag group lexicographically', async () => {
    await openTagGroupMenu('ToDo_Workflow');
    await global.client.waitForVisible('[data-tid=sortTagGroup]');
    await global.client.click('[data-tid=sortTagGroup]'); // TODO no validation, expect
    // const tagGroupElements = await global.client.getText('//button[contains(., "' + testTagName + '")]');
    // const tagGroupElements = await global.client.elements('tagGroupContainer_ToDo_Workflow');
    // expect(editedTag).toBe(testTagName);
  });

  it('TST0410 - Default colors for tags from settings', async () => {
    await global.client.waitForVisible('[data-tid=settings]');
    await global.client.click('[data-tid=settings]');
    await global.client.waitForVisible('[data-tid=settingsDialog]');
    await global.client.scroll(
      '[data-tid=settingsToggleDefaultTagBackgroundColor]',
      200,
      200
    );
    await global.client.waitForVisible(
      '[data-tid=settingsToggleDefaultTagBackgroundColor]'
    );
    await global.client.click(
      '[data-tid=settingsToggleDefaultTagBackgroundColor]'
    );
    await delay(500);
    // select color from ColorChoosier Dialog
    await global.client.click(
      '/html/body/div[33]/div/div[2]/div[2]/div/div[4]/div[4]/span/div'
    ); // TODO xpath not accpeted
    await delay(500);
    // modal confirmation
    await global.client.click(
      '/html/body/div[18]/div/div[2]/div[3]/div[2]/button'
    ); // TODO xpath not accepted
    await delay(500);
    await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    await global.client.click('[data-tid=closeSettingsDialog]');
    await global.client.waitForVisible('[data-tid=tagLibrary]');
    await global.client.click('[data-tid=tagLibrary]');
    await global.client.waitForVisible('[data-tid=tagLibraryMenu]');
    await global.client.click('[data-tid=tagLibraryMenu]');
    await global.client.waitForVisible('[data-tid=createNewTagGroup]');
    await global.client.click('[data-tid=createNewTagGroup]');
    await delay(500);
    const style = await global.client.getAttribute(
      '[data-tid=createTagGroupBackgroundColor]',
      'style'
    );
    await delay(500);
    expect(style).toContain('rgb(208, 107, 100)');
  });

  it('TST0411 - Should move tag group down', async () => {
    await openTagGroupMenu('ToDo_Workflow');
    await global.client.waitForVisible('[data-tid=moveTagGroupDown]');
    await global.client.click('[data-tid=moveTagGroupDown]'); // TODO no test confirmation, expect
    // await global.client.getText('[data-tid=tagLibraryTagGroupList]').then((name) => {
    //   let answerExpected = name.split(name.indexOf(groupName));
    //   answerExpected = answerExpected[0];
    //   // expect(groupName).toBe(answerExpected);
    //   expect(answerExpected).toBe(groupName);
    //   return true;
    // });
  });

  it('TST0412 - Should move tag group up', async () => {
    await openTagGroupMenu('Common_Tags');
    await global.client.waitForVisible('[data-tid=moveTagGroupUp]');
    await global.client.click('[data-tid=moveTagGroupUp]'); // TODO no test confirmation
    // await global.client.getText('[data-tid=tagLibraryTagGroupList]').then((name) => {
    //   let answerExpected = name.split(name.indexOf(groupName));
    //   answerExpected = answerExpected[0];
    //   expect(groupName).toBe(answerExpected);
    //   return true;
    // });
  });
});
