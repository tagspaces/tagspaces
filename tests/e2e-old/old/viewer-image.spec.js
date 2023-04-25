/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import { searchEngine } from './search.helpers';
import { openFile } from './perspective.spec';
import {
  createLocation,
  openLocation,
  defaultLocationPath,
  defaultLocationName,
  perspectiveGridTable
} from './location.spec';

const extButton = '/tbody/tr/td[1]/button[1]';
const firstFile = '/div[1]/div';

describe('TST53 - Image viewer extension', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it('TST5301 - Open JPG', async () => {
    await searchEngine('jpg');
    await openFile(perspectiveGridTable, firstFile);
    //   .waitForVisible('#fileMenuOpenFile').click('#fileMenuOpenFile')
    //   .waitForVisible('#viewer').frame(0)
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
    //   .waitForVisible('#exifButton').click('#exifButton')
    //   .waitForVisible('#myModalLabel2')
    //   .waitForVisible('#closeExIf').click('#closeExIf')
  });

  it('TST5302 - Open BMP', async () => {
    await searchEngine('bmp');
    await openFile(perspectiveGridTable, firstFile);
    //   .waitForVisible('#viewer').should.eventually.exist
    //   .waitForVisible('#closeOpenedFile').click('#closeOpenedFile')
    //   .waitForVisible('#viewContainers').should.eventually.exist
  });

  it('TST5303 - Open GIF', async () => {
    await searchEngine('gif');
    await openFile(perspectiveGridTable, firstFile);
    //   .waitForVisible('#viewer').should.eventually.exist
    //   .waitForVisible('#closeOpenedFile').click('#closeOpenedFile')
    //   .waitForVisible('#viewContainers').should.eventually.exist
  });

  it('TST5305 - Open WEBP', async () => {
    await searchEngine('webp');
    await openFile(perspectiveGridTable, firstFile);
    //   .waitForVisible('#viewer').should.eventually.exist
    //   .waitForVisible('#closeOpenedFile').click('#closeOpenedFile')
    //   .waitForVisible('#viewContainers').should.eventually.exist
  });

  it('TST5306 - Open SVG', async () => {
    await searchEngine('svg');
    await openFile(perspectiveGridTable, firstFile);
    //   .waitForVisible('#viewer').should.eventually.exist
    //   .waitForVisible('#closeOpenedFile').click('#closeOpenedFile')
    //   .waitForVisible('#viewContainers').should.eventually.exist
  });

  it('TST5307 - Open PNG', async () => {
    await searchEngine('png');
    await openFile(perspectiveGridTable, firstFile);
    //   .waitForVisible('#viewer').should.eventually.exist
    //   .waitForVisible('#closeOpenedFile').click('#closeOpenedFile')
    //   .waitForVisible('#viewContainers').should.eventually.exist
  });

  it('TST5310 - Image viewer extension-options', async () => {
    await searchEngine('png');
    await openFile(perspectiveGridTable, firstFile);
    //   .waitForVisible('#viewer').frame(0)
    //   .waitForVisible('#viewerMainMenuButton').click('#viewerMainMenuButton')
  });
});
