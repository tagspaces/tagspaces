/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import { searchEngine } from './search.spec';
import { openFile } from './perspective.spec';
import { createLocation, openLocation, defaultLocationPath, defaultLocationName, perspectiveGridTable } from './location.spec';

const dirPath ='./tagspacestests/webdav-app';

const extButton = '//*[@id="perspectiveGridGroupContent0"]/div[1]/div[2]/button';
const firstFile = '/div[1]/div';
const iFrame = '#iframeViewer';

describe('TST57 - JSON Editor Extension', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it('TST5701 - Open JSON file', async () => {
    await searchEngine('json');
    await openFile(perspectiveGridTable, firstFile);
    //   // should switch focus to iFrame
    //   .waitForExist(iFrame).frame(0)
    //   .waitForVisible('//*[@id="jsonEditor"]').getText('//*[@id="jsonEditor"]')
    //   .should.eventually.contain('tagspaces-webdav-tester')
    //   .waitForVisible('//*[@id="jsonEditor"]').getText('//*[@id="jsonEditor"]')
    //   .should.eventually.contain('main.js')
    //   .waitForVisible('//*[@id="jsonEditor"]').getText('//*[@id="jsonEditor"]')
    //   .should.eventually.contain('version')
  });
});


