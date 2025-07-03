/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */

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

  await expectElementExist('[data-tid=fsEntryName_' + cardName + '_md]', false);
}
