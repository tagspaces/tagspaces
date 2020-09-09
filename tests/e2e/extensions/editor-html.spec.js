/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from '../hook';
import { searchEngine } from '../search.spec';
import { openFile } from '../test-utils.spec';
import { createLocation, openLocation, aboutDialogExt, defaultLocationPath, defaultLocationName, perspectiveGridTable } from '../location.e2e';

const extButton = '/div[1]/div[2]/button';
const firstExtButton = 'div[1]/button';
const firstFile = '/div[1]/div';

const iFrame = '#iframeViewer';
const extTitle = 'About HTML Viewer';

describe('TST56 - Editor Extension', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it.only('TST5601 - Save html', async () => {
    const webview = document.querySelector('webview');
    await searchEngine('html');
    await openFile(perspectiveGridTable, firstFile);
    // .waitForVisible('#viewer').should.eventually.exist
    // .waitForVisible('#editDocument').click('#editDocument')
    // // should switch focus to iFrame
    // await global.client.waitForVisible(iFrame).frame(0).execute(() => {
    //   window.$htmlEditor.append('Opening dialog simulated');
    // });

    await webview.executeJavaScript((e) => {
      console.log(e);
      window.$htmlEditor.append('Opening dialog simulated');
    });
    await delay(2000);
    // .waitForVisible('.note-editor').getText('.note-editor ')
    // .should.eventually.contain("Opening dialog simulated")
    // .frame(null)
    // .waitForVisible('#saveDocument').click('#saveDocument')
    // .waitForVisible('#closeOpenedFile').click('#closeOpenedFile')
    // .waitForVisible('#searchBox').setValue('#searchBox', 'sample-for-editing.html')
    // .click('#searchButton')
    // .waitForVisible(extButton).click(extButton)
    // .waitForVisible('#editDocument').click('#editDocument')
    // .waitForExist(iFrame).frame(0)
    // .pause(2000)
    // .execute(function() {
    //   window.$htmlEditor.append('Lorem ipsum dolor sit amet, consectetur adipiscing elit');
    // })
    // .waitForVisible('#editorText').getText('#editorText')
    // .should.eventually.contain("Lorem ipsum dolor sit amet, consectetur adipiscing elit")
    // .frame(null)
    // .waitForVisible('#saveDocument').click('#saveDocument')
  });

  it('TST5604 - Open About Dialog', async () => {
    await searchEngine('html');
    await openFile(perspectiveGridTable, firstFile);
    await aboutDialogExt(extTitle);
    // return app.client
    //   .waitForVisible('#showSearchButton').click('#showSearchButton')
    //   .waitForVisible('#searchBox').setValue('#searchBox', 'sample-reader-mode.html').click('#searchButton')
    //   .waitForVisible(extButton).getText(extButton,  'HTML')
    //   .should.eventually.equals('HTML')
    //   .waitForVisible(firstFile).click(firstFile)
    //   // should switch focus to iFrame
    //   .waitForExist('#viewer').frame(0)
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .waitForVisible('#aboutButton').click('#aboutButton')
    //   .waitForVisible('h4=About HTML Viewer').getText('h4=About HTML Viewer')
    //   .should.eventually.equals('About HTML Viewer')
    //   .waitForVisible('#closeAboutDialogButton').click('#closeAboutDialogButton')
  });
});

