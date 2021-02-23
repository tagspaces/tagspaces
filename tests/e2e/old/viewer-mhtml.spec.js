/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import { searchEngine } from './search.helpers';
import { openFile } from './perspective.spec';
import {
  createLocation,
  openLocation,
  aboutDialogExt,
  defaultLocationPath,
  defaultLocationName,
  perspectiveGridTable
} from './location.spec';

const extButton = '/div[1]/div[2]/button';
const firstFile = '/div[1]/div';

let iFrame = '#viewerMHTMLViewer';
let text =
  'This week at TechCrunch Disrupt ambitious startups took the stage and shared their vision of changing the world™.';

describe('TST61 - MHTML Viewer', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it('TST6101 - Open mhtml file', async () => {
    await searchEngine('mhtml');
    await openFile(perspectiveGridTable, firstFile);
    //   // should switch focus to iFrame
    //   .waitForExist(iFrame).frame(0).waitForVisible('//*[@id="readability-page-1"]/div/span')
    //   .getText('//*[@id="readability-page-1"]/div/span').should.eventually.contain(text)
  });

  it('TST6102 - Open Eml file', async () => {
    await searchEngine('eml');
    await openFile(perspectiveGridTable, firstFile);
    //   // should try to find a text string from the document
    //   .waitForExist('#viewer').frame(0)
    //   .waitForVisible('#readability-page-1').getText('#readability-page-1')
    //   .should.eventually.contain('© 2016 LinkedIn Ireland Limited. LinkedIn, the LinkedIn logo')
  });

  it('TST6103 - Change background', async () => {
    await searchEngine('mhtml');
    await openFile(perspectiveGridTable, firstFile);
    //   // should switch focus to iFrame
    //   .waitForExist(iFrame).frame(0)
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .pause(500)
    //   .waitForVisible('#sepiaBackgroundColor').click('#sepiaBackgroundColor')
    //   .waitForVisible('.close').click('.close')
    //   // changed background
    //   .waitForVisible('#mhtmlViewer')
    //   .getAttribute('#mhtmlViewer', 'style')
    //   .should.eventually.contain('font-family: Helvetica, Arial, sans-serif; background: rgb(244, 236, 216); color: rgb(91, 70, 54);')
  });

  it('TST6104 - Open print dialog', () => {
    // return app.client
    //   .waitForVisible('#showSearchButton').click('#showSearchButton')
    //   .waitForVisible('#searchBox').setValue('#searchBox', 'sample.mhtml').click('#searchButton')
    //   .waitForVisible(extButton).getText(extButton).should.eventually.equals('MHTML')
    //   .waitForVisible(firstFile).click(firstFile)
    //   .waitForVisible('#viewer').should.eventually.exist
    //   // should switch focus to iFrame
    //   .waitForExist(iFrame).frame(0)
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .waitForVisible('#printButton').click('#printButton')
  });

  it('TST6105 - Open about dialog', async () => {
    await searchEngine('txt');
    await openFile(perspectiveGridTable, firstFile);
    await aboutDialogExt('About ViewerMHTML extension');
    //   // should switch focus to iFrame
    //   .waitForExist(iFrame).frame(0)
  });

  it('TST6106 - Toggle readability mode', async () => {
    await searchEngine('mhtml');
    await openFile(perspectiveGridTable, firstFile);
    //   // should contain text in readability mode
    //   .waitForVisible('#readability-page-1').getText('#readability-page-1')
    //   .should.eventually.contain('This week at TechCrunch Disrupt ambitious startups')
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   // readability mode is off
    //   .waitForVisible('#readabilityOff').click('#readabilityOff')
    //   //.element('#readability-page-1').should.eventually.not.exist
    //   // check main menu for readability is off
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   //.element('#readabilityOff').should.eventually.not.exist
    //   .waitForVisible('#readabilityOn').should.eventually.exist
  });
});
