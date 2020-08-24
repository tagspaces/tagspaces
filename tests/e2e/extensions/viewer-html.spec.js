/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import { searchEngine } from './search.spec';
import { openFile } from './perspective.spec';
import { createLocation, openLocation, aboutDialogExt, defaultLocationPath, defaultLocationName, perspectiveGridTable } from './location.spec';

const extButton = '/div[1]/div[2]/button';
const firstExtButton = '/div[1]/button';
const firstFile = '/div[1]/div';

describe('TST61 - HTML Viewer', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it('TST6501 - Open HTML', async () => {
    await searchEngine('html');
    await openFile(perspectiveGridTable, firstFile);
    //   .pause(500)
    //   .waitForVisible('#htmlContent').getText('#htmlContent')
    //   .should.eventually.contain('Aldo has nearly a decade of experience developing JavaScript apps')
  });

  it('TST6502 - Open HTML in readability mode', async () => {
    await searchEngine('html');
    await openFile(perspectiveGridTable, firstFile);
    // return app.client
    //   .waitForVisible('#showSearchButton').click('#showSearchButton')
    //   .waitForVisible('#searchBox').setValue('#searchBox', 'sample-reader-mode.html').click('#searchButton')
    //   .waitForVisible(extButton).getText(extButton).should.eventually.equals('HTML')
    //   .waitForVisible(firstFile).click(firstFile)
    //   .waitForVisible('#viewer').frame(0)
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .waitForVisible('#readabilityOn').click('#readabilityOn')
    //   .waitForVisible('#htmlContent').getText('#htmlContent')
    //   .should.eventually.contain('Aldo has nearly a decade of experience developing JavaScript apps')
  });

  it('TST6103 - Open about dialog', async () => {
    await searchEngine('html');
    await openFile(perspectiveGridTable, firstFile);
    await aboutDialogExt('About HTML Viewer');
  });

  it('TST6105 - Find in document', async () => {
    await searchEngine('html');
    await openFile(perspectiveGridTable, firstFile);
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .waitForVisible('#findInFile').click('#findInFile')
    //   .waitForVisible('#searchBox').setValue('#searchBox', 'JavaScript')
    //   .waitForVisible('#searchExtButton').click('#searchExtButton')
    //   .waitForVisible('//*[@id="htmlContent"]/div/main/article/figure/div/figcaption/span')
    //   .getAttribute('//*[@id="htmlContent"]/div/main/article/figure/div/figcaption/span', 'class')
    //   .should.eventually.equals('highlight')
  });

  it('TST6106 - Change theme', async () => {
    await searchEngine('html');
    await openFile(perspectiveGridTable, firstFile);
    //   // Change theme style and check current style
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .waitForVisible('#changeStyleButton').click('#changeStyleButton')
    //   .waitForVisible('#htmlContent').getAttribute('#htmlContent', 'class')
    //   .should.eventually.equals('markdown solarized-dark zoomDefault')
    //   // Change theme style and check current style
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .waitForVisible('#changeStyleButton').click('#changeStyleButton')
    //   .waitForVisible('#htmlContent').getAttribute('#htmlContent', 'class')
    //   .should.eventually.equals('markdown github zoomDefault')
    //   // Change theme style and check current style
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .waitForVisible('#changeStyleButton').click('#changeStyleButton')
    //   .waitForVisible('#htmlContent').getAttribute('#htmlContent', 'class')
    //   .should.eventually.equals('markdown metro-vibes zoomDefault')
    //   // Change theme style and check current style
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .waitForVisible('#changeStyleButton').click('#changeStyleButton')
    //   .waitForVisible('#htmlContent').getAttribute('#htmlContent', 'class')
    //   .should.eventually.equals('markdown clearness zoomDefault')
    //   // Change theme style and check current style
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .waitForVisible('#changeStyleButton').click('#changeStyleButton')
    //   .waitForVisible('#htmlContent').getAttribute('#htmlContent', 'class')
    //   .should.eventually.equals('markdown clearness-dark zoomDefault')
    //   // reset changed theme style
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .waitForVisible('#resetStyleButton').click('#resetStyleButton')
    //   .waitForVisible('#htmlContent').getAttribute('#htmlContent', 'class')
    //   .should.eventually.equals('markdown zoomDefault')
  });
});


