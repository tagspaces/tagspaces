/* Copyright (c) 2020-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */

import {
  addInputKeys,
  clickOn,
  expectElementExist,
  isDisplayed,
  removeTagFromTagMenu,
  setInputKeys,
  setInputValue
} from './general.helpers';
import { getPropertiesTags } from './location.helpers';

/**
 * Add and then Remove tags from file/folder Properties (open Properties first)
 * @param tagNames
 * @param options
 * @returns {Promise<void>}
 * @constructor
 */
export async function AddRemovePropertiesTags(
  tagNames = ['test-props-tag'], // TODO fix camelCase tag name
  options = { add: true, remove: true }
) {
  if (options.add) {
    for (let i = 0; i < tagNames.length; i++) {
      const tagName = tagNames[i];
      const propsTags = await getPropertiesTags();
      expect(propsTags.includes(tagName)).toBe(false);
      await setInputKeys('PropertiesTagsSelectTID', tagName);
      //await setInputValue('[data-tid=PropertiesTagsSelectTID] input', tagName);
      // await clickOn('[data-tid=PropertiesTagsSelectTID]');
      await global.client.keyboard.press('Enter');
      await expectElementExist(
        '[data-tid=tagContainer_' + tagName + ']',
        true,
        8000,
        '[data-tid=perspectiveGridFileTable]'
      );
      await expectElementExist(
        '[data-tid=tagContainer_' + tagName + ']',
        true,
        8000,
        '[data-tid=PropertiesTagsSelectTID]'
      );
      //const propsNewTags = await getPropertiesTags();
      //expect(propsNewTags.includes(tagName)).toBe(true);
    }
  }

  if (options.remove) {
    for (let i = 0; i < tagNames.length; i++) {
      const tagName = tagNames[i];
      await removeTagFromTagMenu(tagName);
      await expectElementExist(
        '[data-tid=tagContainer_' + tagName + ']',
        false,
        8000,
        '[data-tid=perspectiveGridFileTable]'
      );
      await expectElementExist(
        '[data-tid=tagContainer_' + tagName + ']',
        false,
        8000,
        '[data-tid=PropertiesTagsSelectTID]'
      );
      // await global.client.waitForTimeout(1500);
      //const propsNewTags = await getPropertiesTags();
      //expect(propsNewTags.includes(tagName)).toBe(false);
    }
  }
}

export async function getPropertiesFileName() {
  let fileName;

  if (global.isPlaywright) {
    fileName = await global.client.inputValue(
      '[data-tid=fileNameProperties] input'
    ); // https://github.com/microsoft/playwright/issues/3265
    /*.getAttribute(
      '[data-tid=fileNameProperties] input',
      'value'
    ); */
  } else {
    const propsFileNameInput = await global.client.$(
      '[data-tid=fileNameProperties] input'
    );
    await propsFileNameInput.waitForDisplayed({ timeout: 5000 });
    fileName = await propsFileNameInput.getValue();
  }
  return fileName ? fileName.replace(/ *\[[^\]]*]/, '') : undefined;
}
