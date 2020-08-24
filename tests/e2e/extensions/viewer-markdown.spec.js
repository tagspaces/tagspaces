/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import { searchEngine } from './search.spec';
import { openFile } from './perspective.spec';
import { createLocation, openLocation, defaultLocationPath, defaultLocationName, perspectiveGridTable } from './location.spec';

const extButton = '/div[1]/div[2]/button';
const firstFile = '/div[1]/div';

describe('TST54 - Markdown viewer extension', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it('TST5401 - Open and render MD file', async () => {
    await searchEngine('md');
    await openFile(perspectiveGridTable, firstFile);
    //   .waitForVisible('#editDocument').click('#editDocument')
    //   // should switch focus to iFrame
    //   .waitForVisible(iFrame).frame(0)
    //   .execute(function() {
    //     window.$('.CodeMirror-code').append("Opening md file");
    //   })
    //   .pause(5000)
    //   .waitForVisible('#editorText').getText('#editorText')
    //   .should.eventually.contain("Opening md file")
    //   .frame(null)
    //   .waitForVisible('#saveDocument').click('#saveDocument')
    //   .waitForVisible('#closeOpenedFile').click('#closeOpenedFile')
    //   .waitForVisible('#searchBox').setValue('#searchBox', 'x-sample.md')
    //   .click('#searchButton')
    //   .waitForVisible(firstFile).click(firstFile)
    //   .waitForVisible('#editDocument').click('#editDocument')
    //   .waitForExist(iFrame).frame(0)
    //   .pause(5000)
    //   .execute(function() {
    //     window.$('.CodeMirror-line').append('Lorem ipsum dolor sit amet');
    //   })
    //   .waitForVisible('#editorText').getText('#editorText')
    //   .should.eventually.contain("Lorem ipsum dolor sit amet")
    //   .frame(null)
    //   .waitForVisible('#saveDocument').click('#saveDocument')
  });

  it('TST5408 - Testing embedding local content like images', async () => {
    await searchEngine('md');
    await openFile(perspectiveGridTable, firstFile);
    //   .waitForVisible('#mdContent').getText('#mdContent')
    //   .should.eventually.contain('sample.png')
    //   .waitForVisible('//*[@id="mdContent"]/p[7]/img')
    //   .getAttribute('//*[@id="mdContent"]/p[7]/img', 'src')
    //   .should.eventually.contain('content-extraction/sample.png')
    //   .waitForVisible('//*[@id="mdContent"]/p[7]/img')
    //   .getElementSize('//*[@id="mdContent"]/p[7]/img', 'width').should.eventually.equals(200)
  });
});

