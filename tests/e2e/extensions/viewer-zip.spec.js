/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import { searchEngine } from './search.spec';
import { openFile } from './perspective.spec';
import { createLocation, openLocation, aboutDialogExt, defaultLocationPath, defaultLocationName, perspectiveGridTable } from './location.spec';

const extButton = '/tbody/tr/td[1]/button[1]';
const firstFile = '/div[1]/div';

const iFrame = '#iframeViewer';
const someFileNameInExt = 'TestData-DirectoryMeta/201410/.ts/tsm.json';
const firstFileNameInExt = 'TestData-DirectoryMeta/.ts/034-IMG_29263[5star 20130809].jpg.png';
let text = 'Contents of file';

describe('TST64 - Zip viewer', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it('TST6401 - Open zip file', async () => {
    await searchEngine('url');
    await openFile(perspectiveGridTable, firstFile);
    //   .waitForExist(iFrame).frame(0)
    //   .waitForVisible('//*[@id="htmlContent"]/h4')
    //   .getText('//*[@id="htmlContent"]/h4').should.eventually.contain(text)
    //   .waitForVisible('//*[@id="htmlContent"]/li[1]/a')
    //   .getText('//*[@id="htmlContent"]/li[1]/a')
    //   .should.eventually.equals(firstFileNameInExt)
  });

  it('TST6402 - Find in document', async () => {
    await searchEngine('url');
    await openFile(perspectiveGridTable, firstFile);
    //   .waitForVisible('//*[@id="htmlContent"]/li[13]/a/span')
    //   .getAttribute('//*[@id="htmlContent"]/li[13]/a/span', 'class')
    //   .should.eventually.equals('highlight')
  });

  it('TST6404 - Open About Dialog', async () => {
    await searchEngine('url');
    await openFile(perspectiveGridTable, firstFile);
    await aboutDialogExt('About URL Viewer');
  });
});

