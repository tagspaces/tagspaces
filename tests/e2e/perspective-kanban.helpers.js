/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */
import { expect } from './fixtures';
import { clickOn, expectElementExist, typeInputValue } from './general.helpers';

export async function createColumn(columnName) {
  await clickOn('[data-tid=createKanBanColumnTID]');
  await typeInputValue('[data-tid=directoryName] input', columnName, 0);
  await clickOn('[data-tid=confirmCreateNewDirectory]');

  await expectElementExist(
    '[data-tid=' + columnName + 'KanBanColumnTID]',
    true,
    5000,
  );
}

export async function createMdCard(cardName, column = 'empty_folder') {
  await clickOn('[data-tid=createCard_' + column + ']');
  await typeInputValue('[data-tid=newEntryDialogInputTID] input', cardName, 0);
  await clickOn('[data-tid=createMarkdownButton]');
  const cardSelector = '[data-tid=fsEntryName_' + cardName + '_md]';
  await expectElementExist(cardSelector, true, 5000);
  const card = await global.client.locator(cardSelector);
  const parent = await card.locator('..');
  return await parent.getAttribute('data-entry-id');
}

export async function getColumnEntries(column) {
  await global.client.waitForTimeout(1000); // for web
  // grab a Locator for the container
  const container = global.client.locator('[data-tid="' + column + 'CTID"]');

  // then find all descendants with a data-entry-id attribute
  const entries = container.locator('[data-entry-id]');

  const count = await entries.count();
  const ids = [];
  for (let i = 0; i < count; i++) {
    const entry = entries.nth(i);
    const id = await entry.getAttribute('data-entry-id');
    ids.push(id);
    //console.log(`Entry ${i}: ${id}`);
  }
  return ids;
}
export async function expectFirstColumnElement(elId, column = 'empty_folder') {
  const el = await getColumnEntries(column);
  expect(elId).toBe(el[0]);
}
export async function expectLastColumnElement(elId, column = 'empty_folder') {
  const el = await getColumnEntries(column);
  expect(elId).toBe(el[el.length - 1]);
}
