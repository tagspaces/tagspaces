/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import { searchEngine } from './search.spec';
import { openFile } from './perspective.spec';
import { createLocation, openLocation, defaultLocationPath, defaultLocationName, perspectiveGridTable } from './location.spec';

const extButton = '/div[1]/div[2]/button';
const firstFile = '/div[1]/div';

describe('TST58 - PDF viewer', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it('TST5801 - Open PDF file', async () => {
    await searchEngine('pdf');
    await openFile(perspectiveGridTable, firstFile);
  });
});


