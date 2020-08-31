/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import { searchEngine } from './search.spec';
import { openFile } from './perspective.spec';
import { createLocation, openLocation, defaultLocationPath, defaultLocationName, perspectiveGridTable } from './location.spec';

const extButton = '/tbody/tr/td[1]/button[1]';
const firstFile = '/div[1]/div';

let iFrame = '#iframeViewer';
let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

describe('TST62 - Text viewer', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it('TST6201 - Open text file', async () => {
    await searchEngine('txt');
    await openFile(perspectiveGridTable, firstFile);
    //   // should switch focus to iFrame
    //   .waitForVisible('//*[@id="mainLayout"]/textarea')
    //   .getText('//*[@id="mainLayout"]/textarea').should.eventually.contain(text)
  });
});


