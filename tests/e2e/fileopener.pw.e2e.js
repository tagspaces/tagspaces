import { expect, test } from '@playwright/test';
import {
  createPwMinioLocation,
  createPwLocation,
  defaultLocationName,
  defaultLocationPath,
} from './location.helpers';
import {
  checkSettings,
  clickOn,
  dnd,
  expectElementExist,
  expectFileContain,
  expectMetaFilesExist,
  getGridFileName,
  getGridFileSelector,
  getRevision,
  selectorFile,
  selectorFolder,
  setInputKeys,
  setInputValue,
  setSettings,
  takeScreenshot,
  waitForNotification,
  writeTextInIframeInput,
} from './general.helpers';
import {
  AddRemovePropertiesTags,
  getPropertiesFileName,
  getPropertiesTags,
} from './file.properties.helpers';
import { openContextEntryMenu } from './test-utils';
import { createFile, startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage } from './welcome.helpers';
import { dataTidFormat } from '../../src/renderer/services/test';

/*test.beforeAll(async () => {
  await startTestingApp('extconfig.js');
  // await clearDataStorage();
});

test.afterAll(async () => {
  await stopApp();
  // await testDataRefresh();
});*/

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }
  await clearDataStorage();
  await stopApp();
  await testDataRefresh();
});

test.beforeEach(async () => {
  await startTestingApp('extconfig.js');
  if (global.isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST08 - File folder properties', () => {
  test('TST0801 - Arrow keys select next prev file (keybindings) [web,minio,electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    //await clickOn('[data-tid=fileContainerToggleProperties]');
    await expectElementExist('[data-tid=detailsTabTID]', true, 5000);
    await clickOn('[data-tid=detailsTabTID]');
    const propsFileName = await getPropertiesFileName();
    const firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe(propsFileName);

    await global.client.keyboard.press('ArrowDown');
    const propsNextFileName = await getPropertiesFileName();
    const secondFileName = await getGridFileName(1);
    expect(secondFileName).toBe(propsNextFileName);

    await global.client.keyboard.press('ArrowUp');
    const propsPrevFileName = await getPropertiesFileName();
    expect(propsPrevFileName).toBe(firstFileName);
  });

  test('TST0802 - Open next file buttons [web,minio,electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    //await clickOn('[data-tid=fileContainerToggleProperties]');

    await expectElementExist('[data-tid=detailsTabTID]', true, 5000);
    await clickOn('[data-tid=detailsTabTID]');
    const propsFileName = await getPropertiesFileName();
    const firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe(propsFileName);

    await clickOn('[data-tid=fileContainerNextFile]');
    const propsNextFileName = await getPropertiesFileName();

    const secondFileName = await getGridFileName(1);
    expect(secondFileName).toBe(propsNextFileName);
  });

  test('TST0803 - Open previous files buttons [web,minio,electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    //await clickOn('[data-tid=fileContainerToggleProperties]');
    await expectElementExist('[data-tid=detailsTabTID]', true, 5000);
    await clickOn('[data-tid=detailsTabTID]');
    const propsFileName = await getPropertiesFileName();
    const firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe(propsFileName);

    await clickOn('[data-tid=fileContainerPrevFile]');
    const propsNextFileName = await getPropertiesFileName();

    const lastFileName = await getGridFileName(-1);
    expect(lastFileName).toBe(propsNextFileName);
  });

  /**
   * full width button not visible on electron (github app size specific)
   */
  test('TST0804 - Open file in full width [web,minio]', async () => {
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

  test('TST0805 - Rename opened file [web,minio,electron]', async () => {
    const fileName = 'sample.svg';
    const newTitle = 'renamed.svg';
    // set setting PersistTagsInSidecarFile in order to add meta json file
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);

    // open fileProperties
    await openContextEntryMenu(
      getGridFileSelector(fileName),
      'showPropertiesTID',
    );
    //await clickOn(getGridFileSelector(fileName));

    //Toggle Properties
    //await clickOn('[data-tid=detailsTabTID]');

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

    const arrayMeta =
      global.isWeb || global.isMinio
        ? [propsNewFileName + '.json'] // check meta file renamed, thumbnails are not created on web or minio
        : [propsNewFileName + '.json', propsNewFileName + '.jpg']; // check meta and thumbnail renamed
    await expectMetaFilesExist(arrayMeta);

    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
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

  test('TST0808 - Add and remove tags to a file (file names) [web,minio,electron]', async () => {
    // open fileProperties
    const fileName = 'sample.svg';
    await openContextEntryMenu(
      getGridFileSelector(fileName),
      'showPropertiesTID',
    );
    /*await clickOn(selectorFile);
    await clickOn('[data-tid=detailsTabTID]');*/
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
  });

  test('TST0809 - Add and remove tag to a file (sidecar files) [web,minio,electron]', async () => {
    // global.client.setDefaultTimeout(300000);
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    // open fileProperties
    const fileName = 'sample.bmp';
    await openContextEntryMenu(
      getGridFileSelector(fileName),
      'showPropertiesTID',
    );
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
  });

  test('TST0810 - Tag file drag&drop in file opener [web,minio,electron]', async () => {
    const tagName = 'article';
    await clickOn('[data-tid=tagLibrary]');
    await dnd(
      '[data-tid=tagContainer_' + tagName + ']',
      getGridFileSelector('sample.txt'),
    );
    await expectElementExist(
      '[data-tid=tagContainer_' + tagName + ']',
      true,
      8000,
      '[data-tid=perspectiveGridFileTable]',
    );

    await openContextEntryMenu(
      getGridFileSelector('sample[' + tagName + '].txt'),
      'showPropertiesTID',
    );

    //await clickOn(getGridFileSelector('sample[' + tagName + '].txt'));
    //await clickOn('[data-tid=detailsTabTID]');

    const propsTags = await getPropertiesTags();
    expect(propsTags).toContain(tagName);
  });

  test('TST0811 - Duplicate file [web,minio,electron]', async () => {
    await openContextEntryMenu(selectorFile, 'fileMenuDuplicateFileTID');
    await expectElementExist('[data-tid=tagContainer_copy]', true, 5000);
  });

  test.skip('TST3004 - Folder Tagging [Pro]', async () => {});

  /**
   * Description is Pro feature (if no Pro editDescription button is disabled)
   */
  test('TST3001 - Description for files [web,minio,electron,_pro]', async () => {
    const desc = 'testDescription';
    const fileSelector = getGridFileSelector('sample.pdf');
    // open fileProperties
    await clickOn(fileSelector);
    //await clickOn('[data-tid=fileContainerToggleProperties]');
    await clickOn('[data-tid=descriptionTabTID]');
    await clickOn('[data-tid=editDescriptionTID]');
    //await global.client.dblclick('[data-tid=descriptionTID]');
    await clickOn('[data-tid=descriptionTID]');

    const editor = await global.client.waitForSelector(
      '[data-tid=descriptionTID] [contenteditable=true]',
    );
    await editor.type(desc, {
      delay: 0,
    });

    await clickOn('[data-tid=editDescriptionTID]');
    await expectElementExist(
      '[data-tid=gridCellDescription]',
      true,
      10000,
      fileSelector,
    );
  });

  /**
   * duplicate TST0213
   */
  test.skip('TST3005 - Description for folders [Pro]', async () => {});

  /**
   * reload file button not visible on electron (github app size specific)
   */
  test('TST0812 - Reload file [web,minio,electron]', async () => {
    // open fileProperties
    await clickOn(getGridFileSelector('sample.txt'));
    //Toggle Properties
    //await clickOn('[data-tid=fileContainerToggleProperties]');

    await expectFileContain();

    const newFileContent = 'testing_file_content';
    await createFile('sample.txt', newFileContent, '.');
    await clickOn('[data-tid=propsActionsMenuTID]');
    await clickOn('[data-tid=reloadPropertiesTID]');
    await expectFileContain(newFileContent);
  });

  test('TST0813 - Delete file and check meta and thumbnails deleted [web,minio,electron]', async () => {
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
    await createFile(fileName, svg);
    await openContextEntryMenu(
      getGridFileSelector('empty_folder'),
      'showProperties',
    );
    await global.client.dblclick(getGridFileSelector('empty_folder'));
    await expectElementExist(getGridFileSelector(fileName));
    //await clickOn(getGridFileSelector(fileName));
    await openContextEntryMenu(
      getGridFileSelector(fileName),
      'showPropertiesTID', //'fileMenuOpenFile'
    );

    //Toggle Properties
    //await clickOn('[data-tid=fileContainerToggleProperties]');
    // add meta json to file
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2'], {
      add: true,
      remove: false,
    });
    const arrayMeta =
      global.isWeb || global.isMinio
        ? [fileName + '.json'] // check meta, thumbnails are not created on web or minio
        : [fileName + '.json', fileName + '.jpg']; // check meta and thumbnail

    await expectMetaFilesExist(arrayMeta, true);

    await clickOn('[data-tid=propsActionsMenuTID]');
    await clickOn('[data-tid=deleteEntryTID]');
    await clickOn('[data-tid=confirmSaveBeforeCloseDialog]');
    await expectElementExist(getGridFileSelector(fileName), false, 5000);

    await expectMetaFilesExist(arrayMeta, false);
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
  });

  test('TST0813a - Delete file and check revisions deleted [web,minio,electron,_pro]', async () => {
    const fileName = 'sample.txt';
    await clickOn(getGridFileSelector(fileName));
    await clickOn('[data-tid=fileContainerEditFile]');
    await writeTextInIframeInput('txt');
    await clickOn('[data-tid=fileContainerSaveFile]');

    //Toggle Revisions
    await clickOn('[data-tid=revisionsTabTID]');
    //await clickOn('[data-tid=revisionsTID]');
    await expectElementExist('[data-tid=viewRevisionTID]');

    const revision = await getRevision(0);
    expect(revision).not.toBeUndefined();
    await expectMetaFilesExist([revision.file], true, revision.id);

    await clickOn('[data-tid=propsActionsMenuTID]');
    await clickOn('[data-tid=deleteEntryTID]');
    await clickOn('[data-tid=confirmSaveBeforeCloseDialog]');
    await expectElementExist(getGridFileSelector(fileName), false, 5000);

    await expectMetaFilesExist([revision.file], false, revision.id);
  });

  /**
   * TODO dont work on web tests https://trello.com/c/93iEURf4/731-migrate-fullscreen-to-https-githubcom-snakesilk-react-fullscreen
   * dont work on electron Mac https://github.com/microsoft/playwright/issues/1086
   */
  test('TST0814 - Open file fullscreen and exit with close button [minio,electron]', async () => {
    if (global.isWin) {
      // open fileProperties
      await clickOn(selectorFile);
      await clickOn('[data-tid=propsActionsMenuTID]');
      await clickOn('[data-tid=fileContainerSwitchToFullScreen]');
      await expectElementExist('[data-tid=fullscreenTID]', true, 10000);
      // await takeScreenshot('TST0814 fullscreenTID exist true');
      await clickOn('[data-tid=fullscreenTID]');
      // await takeScreenshot('TST0814 fullscreenTID exist false');
      await expectElementExist('[data-tid=fullscreenTID]', false, 10000);
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

  test('TST0827 - Link for internal sharing + copy [web,minio,electron]', async () => {
    const fileName = 'sample.jpg';
    await clickOn(getGridFileSelector(fileName));
    await expectElementExist('[data-tid=detailsTabTID]', true, 5000);
    await clickOn('[data-tid=detailsTabTID]');

    const sharingLink = await global.client.$(
      '[data-tid=sharingLinkTID] input',
    );
    const sharingLinkValue = await sharingLink.getAttribute('value');

    await clickOn('[data-tid=fileContainerCloseOpenedFile]');

    await clickOn('[data-tid=locationManagerMenu]');
    await clickOn('[data-tid=locationManagerMenuOpenLink]');
    await setInputKeys('directoryName', sharingLinkValue);
    await clickOn('[data-tid=confirmOpenLink]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']',
      true,
      5000,
    );
  });
});
