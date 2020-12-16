/* Copyright (c) 2020-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */

import { addInputKeys, removeTagFromTagMenu } from './general.helpers';
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
      await addInputKeys('PropertiesTagsSelectTID', tagName);
      await global.client.keys('Enter');
      await global.client.pause(500);
      const propsNewTags = await getPropertiesTags();
      expect(propsNewTags.includes(tagName)).toBe(true);
    }
  }

  if (options.remove) {
    for (let i = 0; i < tagNames.length; i++) {
      const tagName = tagNames[i];
      await removeTagFromTagMenu(tagName);
      await global.client.pause(800);
      const propsNewTags = await getPropertiesTags();
      expect(propsNewTags.includes(tagName)).toBe(false);
    }
  }
}

export async function getPropertiesFileName() {
  const propsFileNameInput = await global.client.$(
    '[data-tid=fileNameProperties] input'
  );
  await propsFileNameInput.waitForDisplayed({ timeout: 10000 });
  const fileName = await propsFileNameInput.getValue();
  return fileName.replace(/ *\[[^\]]*]/, '');
}
