/* Copyright (c) 2020-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */


import {searchEngine} from "./search.spec";
import {addInputKeys, clickOn} from "./general.helpers";
import {firstFile, perspectiveGridTable} from "./test-utils.spec";
import {getPropertiesTags} from "./location.helpers";

const testTagName = 'test-tag'; // TODO fix camelCase tag name

export async function AddRemoveTagsToFile () {
  await searchEngine('bmp');

  // open fileProperties
  await clickOn(perspectiveGridTable + firstFile);
  //Toggle Properties
  await clickOn('[data-tid=fileContainerToggleProperties]');

  const propsTags = await getPropertiesTags();

  expect(propsTags.includes(testTagName)).toBe(false);

  await addInputKeys('PropertiesTagsSelectTID', testTagName);
  await global.client.keys('Enter');
  await global.client.pause(500);
  let propsNewTags = await getPropertiesTags();

  expect(propsNewTags.includes(testTagName)).toBe(true);

  await clickOn('[data-tid=tagMoreButton_' + testTagName + ']');
  await global.client.pause(500);
  await clickOn('[data-tid=deleteTagMenu]');
  await global.client.pause(500);
  await clickOn('[data-tid=confirmRemoveTagFromFile]');
  await global.client.pause(500);
  propsNewTags = await getPropertiesTags();
  expect(propsNewTags.includes(testTagName)).toBe(false);
}
