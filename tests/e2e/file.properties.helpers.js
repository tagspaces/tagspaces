/* Copyright (c) 2020-present - TagSpaces GmbH. All rights reserved. */
import { expect } from '@playwright/test';
import {
  clickOn,
  expectElementExist,
  getElementText,
  isDisplayed,
  removeTagFromTagMenu,
  selectorFile,
  setInputKeys,
  setInputValue,
} from './general.helpers';

export async function getPropertiesTags() {
  const arrTags = [];
  const tags = await global.client.$$(
    '[data-tid=PropertiesTagsSelectTID] div div div',
  );
  for (let i = 0; i < tags.length; i++) {
    const dataTid = await tags[i].getAttribute('data-tid');
    if (dataTid && dataTid.startsWith('tagContainer_')) {
      const label = await tags[i].$('button span');
      arrTags.push(await getElementText(label));
    }
  }
  return arrTags;
}

/**
 * Add and then Remove tags from file/folder Properties (open Properties first)
 * @param tagNames
 * @param options
 * @returns {Promise<void>}
 * @constructor
 */
export async function AddRemovePropertiesTags(
  tagNames = ['test-props-tag'], // TODO fix camelCase tag name
  options = { add: true, remove: true, expectProp: false },
) {
  if (options.add) {
    for (let i = 0; i < tagNames.length; i++) {
      const tagName = tagNames[i];
      const propsTags = await getPropertiesTags();
      expect(propsTags.includes(tagName)).toBe(false);
      // await setInputKeys('PropertiesTagsSelectTID', tagName, 100);
      await setInputValue('[data-tid=PropertiesTagsSelectTID] input', tagName);
      // await clickOn('[data-tid=PropertiesTagsSelectTID]');
      await global.client.keyboard.press('Enter');
      await expectElementExist(
        '[data-tid=tagContainer_' + tagName + ']',
        true,
        8000,
        '[data-tid=perspectiveGridFileTable]',
      );
      if (options.expectProp) {
        // todo selecting by parent PropertiesTagsSelectTID not work for web..
        await expectElementExist(
          '[data-tid=tagContainer_' + tagName + ']',
          true,
          8000,
          '[data-tid=PropertiesTagsSelectTID]',
        );
      }
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
        '[data-tid=perspectiveGridFileTable]',
      );
      /*await expectElementExist(
        '[data-tid=tagContainer_' + tagName + ']',
        false,
        8000,
        '[data-tid=PropertiesTagsSelectTID]',
      );*/
      // await global.client.waitForTimeout(1500);
      //const propsNewTags = await getPropertiesTags();
      //expect(propsNewTags.includes(tagName)).toBe(false);
    }
  }
}

export async function getPropertiesFileName() {
  let fileName;
  const selectorFileProps = '[data-tid=fileNameProperties] input';
  if (!(await isDisplayed(selectorFileProps, true, 3000))) {
    await clickOn('[data-tid=detailsTabTID]');
  }
  fileName = await global.client.inputValue(selectorFileProps); // https://github.com/microsoft/playwright/issues/3265
  /*.getAttribute(
      '[data-tid=fileNameProperties] input',
      'value'
    ); */
  return fileName ? fileName.replace(/ *\[[^\]]*]/, '') : undefined;
}
