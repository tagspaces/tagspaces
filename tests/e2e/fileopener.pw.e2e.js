// import { expect, test } from '@playwright/test';
import { dataTidFormat } from '../../src/renderer/services/test';
import {
  AddRemovePropertiesTags,
  getPropertiesFileName,
} from './file.properties.helpers';
import { expect, test } from './fixtures';
import {
  addDescription,
  clickOn,
  createRevision,
  dnd,
  expectElementExist,
  expectFileContain,
  expectFileSizeGt,
  expectMetaFilesExist,
  frameLocator,
  getGridFileName,
  getGridFileSelector,
  getRevision,
  isDisplayed,
  openFile,
  openFolder,
  selectorFile,
  setInputKeys,
  setInputValue,
  setSettings
} from './general.helpers';
import {
  createFileS3,
  createLocalFile,
  startTestingApp,
  stopApp,
  testDataRefresh,
} from './hook';
import {
  createPwLocation,
  createPwMinioLocation,
  createS3Location,
  defaultLocationName,
} from './location.helpers';
import { openContextEntryMenu } from './test-utils';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

test.afterEach(async ({ isS3, testDataDir }, testInfo) => {
  /*if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }*/

  await testDataRefresh(isS3, testDataDir);
  await clearDataStorage();
  await stopApp();
});

test.beforeEach(
  async ({ isMinio, isS3, isWeb, webServerPort, testDataDir }, testInfo) => {
    await startTestingApp(
      { isWeb, isS3, webServerPort, testInfo },
      isMinio || isS3 ? undefined : 'extconfig.js',
    );
    if (isMinio) {
      await closeWelcomePlaywright();
      await createPwMinioLocation('', defaultLocationName, true);
    } else if (isS3) {
      await closeWelcomePlaywright();
      await createS3Location('', defaultLocationName, true);
    } else {
      await createPwLocation(testDataDir, defaultLocationName, true);
    }
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await expectElementExist(getGridFileSelector('empty_folder'), true, 8000);
    global.client.on('dialog', (dialog) => dialog.accept());
    // If its have opened file
    // await closeFileProperties();
  },
);

test.describe('TST08 - File folder properties', () => {
  test('TST0801 - Arrow keys select next prev file (keybindings) [web,s3,electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    const firstFileName = await getGridFileName(0);

    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(firstFileName) + ']',
      true,
      8000,
    );

    const propsFileName = await getPropertiesFileName();
    expect(firstFileName).toBe(propsFileName);

    if (await isDisplayed('[data-tid=fileNameProperties] input', true, 3000)) {
      await clickOn('[data-tid=detailsTabTID]');
    }
    await global.client.keyboard.press('ArrowDown');
    const secondFileName = await getGridFileName(1);
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(secondFileName) + ']',
      true,
      5000,
    );
    const propsNextFileName = await getPropertiesFileName();
    expect(secondFileName).toBe(propsNextFileName);

    if (await isDisplayed('[data-tid=fileNameProperties] input', true, 3000)) {
      await clickOn('[data-tid=detailsTabTID]');
    }
    await global.client.keyboard.press('ArrowUp');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(firstFileName) + ']',
      true,
      5000,
    );
    const propsPrevFileName = await getPropertiesFileName();
    expect(propsPrevFileName).toBe(firstFileName);
  });

  test('TST0802 - Open next file buttons [web,s3,electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    const firstFileName = await getGridFileName(0);
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(firstFileName) + ']',
      true,
      8000,
    );
    const propsFileName = await getPropertiesFileName();
    expect(firstFileName).toBe(propsFileName);

    await clickOn('[data-tid=fileContainerNextFile]');

    const secondFileName = await getGridFileName(1);
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(secondFileName) + ']',
      true,
      5000,
    );
    const propsNextFileName = await getPropertiesFileName();
    expect(secondFileName).toBe(propsNextFileName);
  });

  test('TST0803 - Open previous files buttons [web,s3,electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);

    const firstFileName = await getGridFileName(0);
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(firstFileName) + ']',
      true,
      8000,
    );
    const propsFileName = await getPropertiesFileName();
    expect(firstFileName).toBe(propsFileName);

    await clickOn('[data-tid=fileContainerPrevFile]');
    const lastFileName = await getGridFileName(-1, false);
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(lastFileName) + ']',
      true,
      5000,
    );
    const propsNextFileName = await getPropertiesFileName();
    expect(lastFileName.replace(/ *\[[^\]]*]/, '')).toBe(propsNextFileName);
  });

  /**
   * full width button not visible on electron (github app size specific)
   */
  test('TST0804 - Open file in full width [web,s3]', async () => {
    //expect.extend(matchers);
    //await clickOn('[data-tid=location_supported-filestypes]');
    // open fileProperties
    await clickOn(selectorFile);
    await clickOn('[data-tid=propsActionsMenuTID]');
    await clickOn('[data-tid=openInFullWidthTID]');
    const folderSelector = await global.client.$(
      '[data-tid=folderContainerTID]',
    ); //.isHidden();
    expect(await folderSelector.isHidden()).toBe(true);
    await clickOn('[data-tid=propsActionsMenuTID]');
    await clickOn('[data-tid=openInFullWidthTID]');
    await clickOn('[id=mobileMenuButton]');
    // expect(global.client).toHaveSelector('[data-tid=folderContainerTID]');
  });

  test('TST0805 - Rename opened file [web,s3,electron]', async ({}) => {
    const fileName = 'sample.svg';
    const newTitle = 'renamed.svg';
    // set setting PersistTagsInSidecarFile in order to add meta json file
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);

    // open fileProperties
    await openFile(fileName, 'showPropertiesTID');

    await AddRemovePropertiesTags(['test-tag1', 'test-tag2'], {
      add: true,
      remove: false,
    });
    const propsFileName = await getPropertiesFileName();
    expect(propsFileName).toBe(fileName);

    await clickOn('[data-tid=startRenameEntryTID]');
    await setInputValue('[data-tid=fileNameProperties] input', newTitle);
    await clickOn('[data-tid=confirmRenameEntryTID]');

    await global.client.waitForSelector(
      '[data-tid=fileNameProperties] input[value="' + newTitle + '"]',
    );
    const propsNewFileName = await getPropertiesFileName();
    expect(propsNewFileName).toBe(newTitle);

    const arrayMeta = [propsNewFileName + '.json'];
    /*global.isWeb || global.isMinio
        ? [propsNewFileName + '.json'] // check meta file renamed, thumbnails are not created on web or minio
        : [propsNewFileName + '.json', propsNewFileName + '.jpg'];*/ // check meta and thumbnail renamed
    await expectMetaFilesExist(arrayMeta);

    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    //await testDataRefresh(isS3, testDataDir);
    //turn fileName back
    /*await clickOn('[data-tid=startRenameEntryTID]');
    await setInputValue('[data-tid=fileNameProperties] input', propsFileName);
    await clickOn('[data-tid=confirmRenameEntryTID]');
    await global.client.waitForSelector(
      '[data-tid=fileNameProperties] input[value="' + propsFileName + '"]'
    );
    const propsOldFileName = await getPropertiesFileName();
    expect(propsOldFileName).toBe(propsFileName);*/
  });

  test.skip('TST0806 - Download file [manual]', async () => {});

  test('TST0808 - Add and remove tags to a file (file names) [web,s3,electron]', async () => {
    // open fileProperties
    const fileName = 'sample.epub'; //'sample.svg';
    await openFile(fileName, 'showPropertiesTID');
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
  });

  test('TST0809 - Add and remove tag to a file (sidecar files) [web,s3,electron]', async () => {
    // global.client.setDefaultTimeout(300000);
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    // open fileProperties
    const fileName = 'sample.bmp';
    await openFile(fileName, 'showPropertiesTID');
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
  });

  test('TST0810 - Tag file drag&drop in file opener [web,s3,electron]', async () => {
    const tagName = 'article';
    await clickOn('[data-tid=tagLibrary]');
    await dnd(
      '[data-tid=tagContainer_' + tagName + ']',
      getGridFileSelector('sample.ico'),
    );
    await expectElementExist(
      '[data-tid=tagContainer_' + tagName + ']',
      true,
      8000,
      '[data-tid=perspectiveGridFileTable]',
    );

    await openContextEntryMenu(
      getGridFileSelector('sample[' + tagName + '].ico'),
      'showPropertiesTID',
    );

    //const propsTags = await getPropertiesTags();
    // expect(propsTags).toContain(tagName);
    await expectElementExist(
      '[data-tid=PropertiesTagsSelectTID] [data-tid=tagContainer_' +
        tagName +
        ']',
      true,
      4000,
    );
  });

  test('TST0811 - Duplicate file [web,s3,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.jpg'),
      'fileMenuDuplicateFileTID',
    );
    await expectElementExist('[data-tid=tagContainer_copy]', true, 10000);
  });

  test.skip('TST3004 - Folder Tagging [Pro]', async () => {});

  /**
   * Description is Pro feature (if no Pro editDescription button is disabled)
   */
  test('TST3001 - Description for files [web,s3,electron,_pro]', async () => {
    const desc = 'testDescription';
    // open fileProperties
    await openFile('sample.pdf');
    await addDescription(desc);
    await expectElementExist(
      '[data-tid=gridCellDescription]',
      true,
      10000,
      getGridFileSelector('sample.pdf'),
    );

    /* await clickOn('[data-tid=descriptionTabTID]');
    await clickOn('[data-tid=descriptionTID]');

    const editor = await global.client.waitForSelector(
      '[data-tid=descriptionTID] [contenteditable=true]',
    );
    await editor.type(desc, {
      delay: 0,
    });

    await clickOn('[data-tid=editDescriptionTID]');
    await clickOn('[data-tid=editDescriptionTID]');
    await clickOn('[data-tid=editDescriptionTID]');
    await expectElementExist(
      '[data-tid=gridCellDescription]',
      true,
      10000,
      fileSelector,
    );*/
  });

  /**
   * duplicate TST0213
   */
  test.skip('TST3005 - Description for folders [Pro]', async () => {});

  /**
   * reload file button failed on web windows only but the problem is in test only
   */
  test('TST0812 - Reload file [s3,electron]', async ({ isS3, testDataDir }) => {
    // open fileProperties
    await clickOn(getGridFileSelector('sample.txt'));
    //Toggle Properties
    //await clickOn('[data-tid=fileContainerToggleProperties]');

    await expectFileContain();

    const newFileContent = 'testing_file_content';
    if (isS3) {
      await createFileS3('sample.txt', newFileContent, '.');
    } else {
      await createLocalFile(testDataDir, 'sample.txt', newFileContent, '.');
    }
    await clickOn('[data-tid=propsActionsMenuTID]');
    await clickOn('[data-tid=reloadPropertiesTID]');
    await expectFileContain(newFileContent, 15000);
  });

  test('TST0813 - Delete file and check meta and thumbnails deleted [web,minio,s3,electron]', async ({
    isMinio,
    isS3,
    testDataDir,
  }) => {
    const fileName = 'new_file.svg';
    const svg = `<svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="32"
      height="32"
      fill="none"
      stroke="#bbbbbb22"
    ><path d="M6 2 L6 30 26 30 26 10 18 2 Z M18 2 L18 10 26 10" />
    </svg>`;
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    if (isS3) {
      await createFileS3(fileName, svg);
    } else {
      await createLocalFile(testDataDir, fileName, svg);
    }
    await openFolder('empty_folder');
    await expectElementExist(getGridFileSelector(fileName));
    await openFile(fileName, 'showPropertiesTID');

    const tags = isMinio ? ['test-tag1'] : ['test-tag1', 'test-tag2'];
    // add meta json to file
    await AddRemovePropertiesTags(tags, {
      add: true,
      remove: false,
    });
    const arrayMeta = [fileName + '.json'];
    /*global.isWeb || global.isMinio || global.isS3
        ? [fileName + '.json'] // check meta, thumbnails are not created on web or minio
        : [fileName + '.json', fileName + '.jpg'];*/ // check meta and thumbnail

    await expectMetaFilesExist(arrayMeta, true);

    await clickOn('[data-tid=propsActionsMenuTID]');
    await clickOn('[data-tid=deleteEntryTID]');
    await clickOn('[data-tid=confirmDeleteTID]');
    await expectElementExist(getGridFileSelector(fileName), false, 5000);

    await expectMetaFilesExist(arrayMeta, false);
    await setSettings('[data-tid=settingsSetPersistTagsInFileName]', true);
  });

  test('TST0813a - Delete file and check revisions deleted [web,minio,s3,electron,_pro]', async () => {
    const fileName = 'sample.txt';
    await openFile(fileName);
    await createRevision();

    const revision = await getRevision(0);
    expect(revision).not.toBeUndefined();
    await expectMetaFilesExist([revision.file], true, revision.id);

    await clickOn('[data-tid=propsActionsMenuTID]');
    await clickOn('[data-tid=deleteEntryTID]');
    await clickOn('[data-tid=confirmDeleteTID]');
    await expectElementExist(getGridFileSelector(fileName), false, 5000);

    await expectMetaFilesExist([revision.file], false, revision.id);
  });

  /**
   * TODO dont work on web tests https://trello.com/c/93iEURf4/731-migrate-fullscreen-to-https-githubcom-snakesilk-react-fullscreen
   * dont work on electron Mac https://github.com/microsoft/playwright/issues/1086
   */
  test('TST0814 - Open file fullscreen and exit with close button [s3,electron]', async ({
    isWin,
  }) => {
    if (isWin) {
      // open fileProperties
      await clickOn(getGridFileSelector('sample.mp4'));
      await clickOn('[data-tid=propsActionsMenuTID]');
      await clickOn('[data-tid=fileContainerSwitchToFullScreen]');
      // todo there is not close button expect...
      //await expectElementExist('[data-tid=fullscreenTID]', true, 10000);
      // await takeScreenshot('TST0814 fullscreenTID exist true');
      //await clickOn('[data-tid=fullscreenTID]');
      // await takeScreenshot('TST0814 fullscreenTID exist false');
      //await expectElementExist('[data-tid=fullscreenTID]', false, 10000);
    }
  });

  test.skip('TST0815 - Test opening file, while TS is in fullscreen(F11) [manual]', async () => {});

  test.skip('TST0817 - Open file fullscreen and exit with ESC button [electron]', async () => {});

  test.skip('TST0818 - Open in new tab in the web version [Web]', async () => {});

  test.skip('TST0819 - Open file natively [manual]', async () => {});

  test.skip('TST0820 - Open containing folder [manual]', async () => {});

  test.skip('TST0821 - Toggle File Properties [electron]', async () => {});

  test.skip('TST0823 - Show thumbnail in the properties if available [Pro]', async () => {});

  test.skip('TST0824 - Change file thumbnail / Reset thumbnail [Pro]', async () => {});

  test.skip('TST0825 - Change folder thumbnail / Reset thumbnail [Pro]', async () => {});

  test('TST0827 - Link for internal sharing + copy [web,minio,s3,electron]', async () => {
    const fileName = 'sample.jpg';
    await openFile(fileName, 'showPropertiesTID');

    const sharingLinkValue = await global.client.inputValue(
      '[data-tid=sharingLinkTID] input',
    );

    await clickOn('[data-tid=fileContainerCloseOpenedFile]');

    //await clickOn('[data-tid=locationManagerMenu]');
    //await clickOn('[data-tid=locationManagerMenuOpenLink]');
    await clickOn('[data-tid=openLinkNavigationTID]');
    await setInputKeys('directoryName', sharingLinkValue);
    await clickOn('[data-tid=confirmOpenLink]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']',
      true,
      5000,
    );
  });

  test('TST0828 - Toggle file revisions [web,minio,s3,electron,_pro]', async () => {
    const fileName = 'sample.html';
    await openFile(fileName);
    await createRevision('revision content', 'div[class="note-editing-area"]');
    const revision = await getRevision(0);
    expect(revision).not.toBeUndefined();
  });

  test('TST0829 - Create and restore revision [web,minio,s3,electron,_pro]', async () => {
    const fileName = 'sample.txt';
    await openFile(fileName);
    await expectFileSizeGt(2);
    const fLocator = await frameLocator('iframe[allowfullscreen]');
    const initContent = await fLocator.locator('body').innerText();

    const revisionContent = 'file changed';
    await createRevision(revisionContent);

    const revision = await getRevision(0);
    expect(revision).not.toBeUndefined();
    await clickOn(
      '[data-tid="' + revision.id + '"] [data-tid="restoreRevisionTID"]',
    );
    await expectFileContain(initContent, 15000);
  });

  test('TST0830 - Create, open and delete revision [web,minio,s3,electron,_pro]', async () => {
    //create revision
    const fileName = 'sample.md';
    await openFile(fileName);
    await expectFileSizeGt(2);
    const fLocator = await frameLocator('iframe[allowfullscreen]');
    const initContent = await fLocator.locator('body').innerText();

    const revisionContent = 'file revision';
    await createRevision(
      revisionContent,
      '.milkdown div[contenteditable=true]',
    );

    const revision = await getRevision(0);
    expect(revision).not.toBeUndefined();

    // open revision preview
    await clickOn(
      '[data-tid="' + revision.id + '"] [data-tid="viewRevisionTID"]',
    );

    await expectFileContain(
      initContent,
      15000,
      '[data-tid="filePreviewTID"] iframe[allowfullscreen]',
    );
    await clickOn('[data-tid="closeFilePreviewTID"]');

    //delete revision
    await clickOn(
      '[data-tid="' + revision.id + '"] [data-tid="deleteRevisionTID"]',
    );
    await expectElementExist(
      'table[data-tid=tableRevisionsTID] tbody tr',
      false,
      8000,
    );
  });
  test('TST0831 - Create 2 revisions and delete all revision [web,minio,s3,electron,_pro]', async () => {
    const fileName = 'sample.md';
    await openFile(fileName);
    await createRevision(
      'file revision 1',
      '.milkdown div[contenteditable=true]',
    );
    await createRevision(
      'file revision 2',
      '.milkdown div[contenteditable=true]',
    );

    await clickOn('[data-tid="deleteRevisionsTID"]');

    await expectElementExist(
      'table[data-tid=tableRevisionsTID] tbody tr',
      false,
      8000,
    );
  });
});
