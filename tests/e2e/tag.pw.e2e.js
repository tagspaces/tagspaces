/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { expect, test } from '@playwright/test';
import {
  clickOn,
  expectElementExist,
  setInputKeys,
  setInputValue
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { init } from './welcome.helpers';

const testTagName = 'testTag';
const newTagName = 'newTagName';
const arrTags = ['tag1', 'tag2', 'tag3'];
const testGroup = 'testGroupName';
const editedGroupName = 'testGroup';

export async function createTagGroup(tagGroupName) {
  const tagGroup = await global.client.$(
    '[data-tid=tagLibraryMoreButton_' + testGroup + ']'
  );
  if (!tagGroup) {
    await clickOn('[data-tid=tagLibraryMenu]');
    await clickOn('[data-tid=createNewTagGroup]');

    await setInputKeys('createTagGroupInput', tagGroupName);
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

test.beforeAll(async () => {
  await startTestingApp();
  await init();
});

test.afterAll(async () => {
  await stopApp();
  await testDataRefresh();
});

test.afterEach(async () => {
  await init();
});

test.beforeEach(async () => {
  await clickOn('[data-tid=tagLibrary]');
});

test.describe('TST04 - Testing the tag library:', () => {
  test('TST0401 - Should create a tag group [web,minio,electron]', async () => {
    await createTagGroup(testGroup);
    await expectElementExist(
      '[data-tid=tagLibraryTagGroupTitle_' + testGroup + ']',
      true
    );
  });

  test('TST0402 - Should delete tag group [web,minio,electron]', async () => {
    await createTagGroup(testGroup);
    await expectElementExist(
      '[data-tid=tagLibraryTagGroupTitle_' + testGroup + ']',
      true
    );
    await clickOn('[data-tid=tagLibraryMoreButton_' + testGroup + ']');
    await clickOn('[data-tid=deleteTagGroup]');
    await clickOn('[data-tid=confirmDeleteTagGroupDialog]');
    await expectElementExist(
      '[data-tid=tagLibraryTagGroupTitle_' + testGroup + ']',
      false
    );
  });

  test('TST0403 - Rename tag group [web,minio,electron]', async () => {
    await createTagGroup(testGroup);
    await clickOn('[data-tid=tagLibraryMoreButton_' + testGroup + ']');
    await clickOn('[data-tid=editTagGroup]');
    await setInputValue('[data-tid=editTagGroupInput] input', editedGroupName);
    await clickOn('[data-tid=editTagGroupConfirmButton]');
    await expectElementExist(
      '[data-tid=tagLibraryTagGroupTitle_' + editedGroupName + ']',
      true
    );
  });

  test.skip('TST0404 - Change default tag group tag colors [web,minio,electron]', async () => {
    await createTagGroup(testGroup);
    await clickOn('[data-tid=tagLibraryMoreButton_' + testGroup + ']');
    await clickOn('[data-tid=editTagGroup]');
    await clickOn('[data-tid=editTagGroupBackgroundColor]');
    const inputElem = await global.client.$(
      '//*[@data-tid="colorPickerDialogContent"]/div/div[3]/div[1]/div/input'
    );
    await setInputValue(
      '//*[@data-tid="colorPickerDialogContent"]/div/div[3]/div[1]/div/input',
      '000000'
    );
    await clickOn('[data-tid=colorPickerConfirm]');
    await clickOn('[data-tid=editTagGroupSwitch]');
    await clickOn('[data-tid=editTagGroupConfirmButton]');
    await clickOn('[data-tid=tagLibraryMoreButton_' + testGroup + ']');
    await clickOn('[data-tid=editTagGroup]');
    const colorElem = await global.client.$(
      '[data-tid=editTagGroupBackgroundColor]'
    );
    let colorStyle = await colorElem.getAttribute('style');

    const rgb2hex = require('rgb2hex');
    const hex = rgb2hex(colorStyle); //color.value);
    expect(hex.hex).toBe('#000000'); //'rgb(0,0,0)');
    await clickOn('[data-tid=editTagGroupConfirmButton]');
  });

  test('TST0405 - Should add tag to a tag group [web,minio,electron]', async () => {
    await createTagGroup(testGroup);
    await clickOn('[data-tid=tagLibraryMoreButton_' + testGroup + ']');
    await addTags([newTagName]);
    await expectElementExist(
      '[data-tid=tagContainer_' + newTagName + ']',
      true
    );
  });

  test.skip('TST0406 - Import tag groups [manual]', async () => {});

  test('TST0405 - Add tag (s) Should add comma separated tags to a tag group [web,minio,electron]', async () => {
    await createTagGroup(testGroup);
    await clickOn('[data-tid=tagLibraryMoreButton_' + testGroup + ']');
    await addTags(arrTags);
    for (let i = 0; i < arrTags.length; i++) {
      await expectElementExist(
        '[data-tid=tagContainer_' + arrTags[i] + ']',
        true
      );
    }
  });

  test('TST0407 - Should rename tag [web,minio,electron]', async () => {
    await tagMenu('done', 'editTagDialog');
    await setInputValue('[data-tid=editTagInput] input', testTagName);
    await clickOn('[data-tid=editTagConfirm]');
    await expectElementExist(
      '[data-tid=tagContainer_' + testTagName + ']',
      true
    );
  });

  test('TST0408 - Should delete tag from a tag group [web,minio,electron]', async () => {
    await tagMenu('next', 'deleteTagDialog');
    await clickOn('[data-tid=confirmDeleteTagDialogTagMenu]');
    await expectElementExist('[data-tid=tagContainer_next]', false);
  });

  test.skip('TST0409 - Should sort tags in a tag group lexicographically [web,minio,electron]', async () => {
    await clickOn('[data-tid=tagLibraryMoreButton_ToDo_Workflow]');
    await clickOn('[data-tid=sortTagGroup]'); // TODO no validation, expect
    // const tagGroupElements = await global.client.getText('//button[contains(., "' + testTagName + '")]');
    // const tagGroupElements = await global.client.elements('tagGroupContainer_ToDo_Workflow');
    // expect(editedTag).toBe(testTagName);
  });

  test.skip('TST0410 - Default colors for tags from settings [web,minio,electron]', async () => {
    await clickOn('[data-tid=settings]');
    await clickOn('[data-tid=settingsToggleDefaultTagBackgroundColor]');
    const inputElem = await global.client.$(
      '//*[@data-tid="colorPickerDialogContent"]/div/div[3]/div[1]/div/input'
    );
    await setInputValue(
      '//*[@data-tid="colorPickerDialogContent"]/div/div[3]/div[1]/div/input',
      '000000'
    );
    await clickOn('[data-tid=colorPickerConfirm]');
    await clickOn('[data-tid=closeSettingsDialog]');
    await clickOn('[data-tid=tagLibraryMenu]');
    await clickOn('[data-tid=createNewTagGroup]');

    const colorElem = await global.client.$(
      '[data-tid=createTagGroupBackgroundColor]'
    );
    let colorStyle = await colorElem.getAttribute('style');
    const rgb2hex = require('rgb2hex');
    const hex = rgb2hex(colorStyle); // color.value);
    expect(hex.hex).toBe('#000000'); //'rgb(0,0,0)');
    await clickOn('[data-tid=createTagGroupCancelButton]');

    /* await global.client.waitForVisible('[data-tid=settings]');
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
    await delay(500);*/

    // select color from ColorChoosier Dialog
    /*await global.client.click(
      '/html/body/div[33]/div/div[2]/div[2]/div/div[4]/div[4]/span/div'
    ); // TODO xpath not accpeted
    await delay(500);
    // modal confirmation
    await global.client.click(
      '/html/body/div[18]/div/div[2]/div[3]/div[2]/button'
    ); // TODO xpath not accepted
    await delay(500);
    await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    await global.client.click('[data-tid=closeSettingsDialog]');*/

    /*await global.client.waitForVisible('[data-tid=tagLibrary]');
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
    expect(style).toContain('rgb(208, 107, 100)');*/
  });

  test.skip('TST0411 - Should move tag group down [electron]', async () => {
    await clickOn('[data-tid=tagLibraryMoreButton_ToDo_Workflow]');
    await clickOn('[data-tid=moveTagGroupDown]'); // TODO no test confirmation, expect
    // await global.client.getText('[data-tid=tagLibraryTagGroupList]').then((name) => {
    //   let answerExpected = name.split(name.indexOf(groupName));
    //   answerExpected = answerExpected[0];
    //   // expect(groupName).toBe(answerExpected);
    //   expect(answerExpected).toBe(groupName);
    //   return true;
    // });
  });

  test.skip('TST0412 - Should move tag group up [electron]', async () => {
    await clickOn('[data-tid=tagLibraryMoreButton_Common_Tags]');
    await clickOn('[data-tid=moveTagGroupUp]'); // TODO no test confirmation
    // await global.client.getText('[data-tid=tagLibraryTagGroupList]').then((name) => {
    //   let answerExpected = name.split(name.indexOf(groupName));
    //   answerExpected = answerExpected[0];
    //   expect(groupName).toBe(answerExpected);
    //   return true;
    // });
  });

  test.skip('TST0414 - Tag file with drag and drop [manual]', async () => {});

  test.skip('TST0415 - Open export tag groups dialog [electron]', async () => {});

  test.skip('TST0416 - Export tag groups / all / some [manual]', async () => {});

  test.skip('TST0417 - Collect tags from current location [electron, Pro]', async () => {});
});
