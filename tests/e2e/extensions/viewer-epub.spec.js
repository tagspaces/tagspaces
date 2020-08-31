/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import { searchEngine } from './search.spec';
import { openFile } from './perspective.spec';
import { createLocation, openLocation, defaultLocationPath, defaultLocationName, perspectiveGridTable } from './location.spec';

const extButton = '/div[1]/div[2]/button';
const firstExtButton = '/div[1]/button';
const firstFile = '/div[1]/div';

describe('TST60 - Epub viewer', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it('TST6001 - Open Epub file v1', async () => {
    await searchEngine('epub');
    await openFile(perspectiveGridTable, firstFile);
    // return app.client
    //   .waitForVisible('#showSearchButton').click('#showSearchButton')
    //   .waitForVisible('#searchBox').setValue('#searchBox', 'sample.epub').click('#searchButton')
    //   .waitForVisible(extButton).getText(extButton).should.eventually.equals('EPUB')
    //   .waitForVisible(firstFile).click(firstFile)
    //   .waitForVisible('#viewer').should.eventually.exist
    //   // TODO should search for a exact string
    //   .waitForVisible('#closeOpenedFile').click('#closeOpenedFile')
    //   .waitForVisible('#viewContainers').should.eventually.exist
  });
});
