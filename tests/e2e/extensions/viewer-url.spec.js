/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import { searchEngine } from './search.spec';
import { openFile } from './perspective.spec';
import { createLocation, openLocation, aboutDialogExt, defaultLocationPath, defaultLocationName, perspectiveGridTable } from './location.spec';

const extButton = '/tbody/tr/td[1]/button[1]';
const firstFile = '/div[1]/div';

const iFrame = '#iframeViewer';
const url = 'http://www.cnet.com/news/';

describe('TST63 - URL viewer', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it('TST6302 - Open url files', async () => {
    await searchEngine('url');
    await openFile(perspectiveGridTable, firstFile);
    //   // should switch focus to iFrame
    //   .waitForExist(iFrame).frame(0)
    //   .waitForVisible('//*[@id="htmlContent"]/input')
    //   .getValue('//*[@id="htmlContent"]/input').should.eventually.contain(url)
  });

  it('TST6303 - Open About Dialog', async () => {
    await searchEngine('url');
    await openFile(perspectiveGridTable, firstFile);
    await aboutDialogExt('About URL Viewer');
    //   // should switch focus to iFrame
    //   .waitForVisible('#viewer').frame(0)
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .waitForVisible('#aboutButton').click('#aboutButton')
    //   .waitForVisible('h4=About URL Viewer').getText('h4=About URL Viewer')
    //   .should.eventually.equals('About URL Viewer')
    //   .waitForVisible('#closeAboutDialogButton').click('#closeAboutDialogButton')
  });
});


