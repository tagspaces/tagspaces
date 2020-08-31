/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import { searchEngine } from './search.spec';
import { openFile } from './perspective.spec';
import { createLocation, openLocation, aboutDialogExt, defaultLocationPath, defaultLocationName, perspectiveGridTable } from './location.spec';

const dirPath = defaultLocationPath + '/content-extraction';
const extButton = '//*[@id="perspectiveGridGroupContent0"]/div[1]/div[2]/button';
const firstFile = '/div[1]/div';

const iFrame = '#viewer';
const aboutTitle = 'About HTML Viewer';

describe('TST55 - Editor Text', async () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it('TST5501 - Save Text', async () => {
    await searchEngine('txt');
    await openFile(perspectiveGridTable, firstFile);
    // return app.client
    //   .waitForVisible('#showSearchButton').click('#showSearchButton')
    //   .waitForVisible('#searchBox').setValue('#searchBox', 'sample.txt').click('#searchButton')
    //   .waitForVisible(firstFile).click(firstFile)
    //   .waitForVisible('#editDocument').click('#editDocument')
    //   // should switch focus to iFrame
    //   .waitForExist(iFrame).frame(0)
    //   .pause(2000)
    //   .execute(function() {
    //       window.cmEditor.setValue("Opening dialog simulated");
    //   }).frame(null)
    //   .waitForVisible('#saveDocument').click('#saveDocument')
    //   .waitForVisible('#closeOpenedFile').click('#closeOpenedFile')
    //   .waitForVisible('#searchBox').setValue('#searchBox', 'sample.txt').click('#searchButton')
    //   .waitForVisible(firstFile).click(firstFile)
    //   .waitForVisible('#editDocument').click('#editDocument')
    //   .waitForExist(iFrame).frame(0)
    //   .waitForVisible('#editorText').getText('#editorText')
    //   //.should.eventually.contain("Opening printing dialog simulated")
    //   .pause(2000)
    //   .execute(function() {
    //     window.cmEditor.setValue("Lorem ipsum dolor sit amet, " +
    //       "consectetur adipiscing elit. Vestibulum luctus nulla et nisi malesuada, " +
    //       "a posuere augue adipiscing. Nam odio ipsum, laoreet sit amet sagittis a," +
    //       " dictum in est. Sed sed lacus id sem euismod consequat sit amet at augue. " +
    //       "Nam mollis magna dolor, id vulputate eros ultricies eget. Nulla ante ipsum," +
    //       " tincidunt eu massa pharetra, dignissim bibendum elit." +
    //       " Morbi dictum sem magna, in consectetur lacus suscipit dapibus." +
    //       " Duis in turpis eget lorem vestibulum placerat eu id orci." +
    //       " Cras eu semper dolor. Nullam iaculis vel tortor vel condimentum." +
    //       " Nunc convallis, massa at fermentum mattis, dolor eros faucibus leo," +
    //       " non gravida neque ipsum eu sem. Integer congue scelerisque commodo." +
    //       " Etiam scelerisque lectus purus.");
    //   })
    //   .waitForVisible('#editorText').getText('#editorText')
    //   .should.eventually.contain("Lorem ipsum dolor sit amet")
    //   .frame(null)
    //   .waitForVisible('#saveDocument').click('#saveDocument')
  });

  it('TST5503 - Open print dialog', async () => {
    await searchEngine('txt');
    await openFile(perspectiveGridTable, firstFile);
    // return app.client
    //   .waitForVisible('#showSearchButton').click('#showSearchButton')
    //   .waitForVisible('#searchBox').setValue('#searchBox', 'sample.txt').click('#searchButton')
    //   .waitForVisible(firstFile).click(firstFile)
    //   // should switch focus to iFrame
    //   .waitForExist(iFrame).frame(0)
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .pause(2000)
    //   .execute(function() {
    //       window.print = function() {
    //           window.cmEditor.setValue("Opening printing dialog simulated");
    //       };
    //       console.log("print tested");
    //   })
    //   //.pause(2000)
    //   //.waitForVisible('#editorText').getText('#editorText')
    //   //.should.eventually.equals("Opening printing dialog simulated")
    //   .waitForVisible('#printButton').click('#printButton')
    //   // Search for the text: Opening printing dialog simulated
    //   .pause(1000)
    //   .waitForVisible('#editorText').getText('#editorText')
    //   .should.eventually.contain("Opening printing dialog simulated");
  });

  it('TST5504 - Open and close about dialog', async () => {
    await searchEngine('txt');
    await openFile(perspectiveGridTable, firstFile);
    await aboutDialogExt(aboutTitle);
  });
});


