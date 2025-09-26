/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */
import { expect } from './fixtures';
import { clickOn, expectElementExist, typeInputValue } from './general.helpers';
import { dataTidFormat } from '../../src/renderer/services/test';

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
  const newValue = await global.client.locator('[data-tid=newEntryDialogInputTID] input').inputValue();
  //console.log('newValue:'+dataTidFormat(newValue));
  await clickOn('[data-tid=createTID]');
  const cardSelector = '[data-tid=fsEntryName_' + dataTidFormat(newValue) + 'md]';
  await expectElementExist(cardSelector, true, 5000);
  const card = await global.client.locator(cardSelector);
  const parent = await card.locator('..');
  const id = await parent.getAttribute('data-entry-id');
  return {id,name: newValue};
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

export async function dragKanBanColumn(sourceColumn, targetColumn) {
  const src = global.client.locator(
    '[data-tid="' + sourceColumn + 'KanBanColumnTID"]',
  ); //`[data-rbd-draggable-id="${sourceColumn}"]`);
  const tgt = global.client.locator(
    '[data-tid="' + targetColumn + 'KanBanColumnTID"]',
  );
  const from = await src.boundingBox();
  const to = await tgt.boundingBox();
  if (!from || !to) throw new Error('Could not resolve bounding boxes');

  await global.client.mouse.move(
    from.x + from.width / 2,
    from.y + from.height / 2,
  );
  await global.client.mouse.down();
  await global.client.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
    steps: 8,
  });
  await global.client.mouse.up();

  /* await src.hover();
  await global.client.mouse.down();
  await tgt.hover();
  await global.client.mouse.up();*/
}

export async function getColumnsIds() {
  const draggables = global.client.locator(
    '[data-tid="perspectiveGridFileTable"] [data-rbd-draggable-id]',
  );

  // 2. Count how many there are
  const count = await draggables.count();

  // 3. Loop and collect their IDs
  const ids = [];
  for (let i = 0; i < count; i++) {
    const id = await draggables.nth(i).getAttribute('data-rbd-draggable-id');
    if (id) ids.push(id);
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
