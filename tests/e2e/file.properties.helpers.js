/* Copyright (c) 2020-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */

import { addInputKeys, clickOn } from './general.helpers';
import { getPropertiesTags } from './location.helpers';

export async function AddRemoveTagsToFile(
  fileSelector,
  tagNames = ['test-props-tag'], // TODO fix camelCase tag name
  options = { add: true, remove: true }
) {
  // open fileProperties
  await clickOn(fileSelector);
  //Toggle Properties
  await clickOn('[data-tid=fileContainerToggleProperties]');

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
      await clickOn('[data-tid=tagMoreButton_' + tagName + ']');
      await global.client.pause(500);
      await clickOn('[data-tid=deleteTagMenu]');
      await global.client.pause(500);
      await clickOn('[data-tid=confirmRemoveTagFromFile]');
      await global.client.pause(500);
      const propsNewTags = await getPropertiesTags();
      expect(propsNewTags.includes(tagName)).toBe(false);
    }
  }
}
