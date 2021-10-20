import {
  closeFileProperties,
  createPwMinioLocation,
  createPwLocation,
  defaultLocationName,
  defaultLocationPath,
  getPropertiesTags
} from './location.helpers';
import {
  clickOn,
  createTxtFile,
  dragDrop,
  expectElementExist,
  getGridFileName,
  isDisplayed,
  selectorFile,
  selectorFolder,
  setInputKeys,
  setInputValue,
  setSettings,
  takeScreenshot,
  waitForNotification
} from './general.helpers';
import { expect } from '@playwright/test';
import {
  AddRemovePropertiesTags,
  getPropertiesFileName
} from './file.properties.helpers';
import { searchEngine } from './search.helpers';
import { openContextEntryMenu } from './test-utils';
import { startTestingApp, stopSpectronApp, testDataRefresh } from './hook';

describe('TST08 - File folder properties', () => {
  beforeAll(async () => {
    await startTestingApp('extconfig-with-welcome.js');
  });

  afterAll(async () => {
    await stopSpectronApp();
    await testDataRefresh();
  });

  beforeEach(async () => {
    if (global.isMinio) {
      await createPwMinioLocation('', defaultLocationName, true);
    } else {
      await createPwLocation(defaultLocationPath, defaultLocationName, true);
    }
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    // If its have opened file
    // await closeFileProperties();
  });

  it('TST0801 - Arrow keys select next prev file (keybindings) [web,minio,electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

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

  it('TST0802 - Open next file buttons [web,minio,electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

    const propsFileName = await getPropertiesFileName();
    const firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe(propsFileName);

    await clickOn('[data-tid=fileContainerNextFile]');
    const propsNextFileName = await getPropertiesFileName();

    const secondFileName = await getGridFileName(1);
    expect(secondFileName).toBe(propsNextFileName);
  });

  it('TST0803 - Open previous files buttons [web,minio,electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

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
  it('TST0804 - Open file in full width [web,minio]', async () => {
    //expect.extend(matchers);
    //await clickOn('[data-tid=location_supported-filestypes]');
    // open fileProperties
    await clickOn(selectorFile);
    //await clickOn('[data-tid=openInFullWidthTID]'); // dummy click -first click in openInFullWidthTID dont work
    await clickOn('[data-tid=openInFullWidthTID]');
    const folderSelector = await global.client.$(
      '[data-tid=folderContainerTID]'
    ); //.isHidden();
    expect(await folderSelector.isHidden()).toBe(true);
    // expect(global.client).toHaveSelector('[data-tid=folderContainerTID]');
  });

  it('TST0805 - Rename opened file [web,minio,electron]', async () => {
    const newTile = 'renamed.txt';
    // await searchEngine('txt');
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

    const propsFileName = await getPropertiesFileName();
    await clickOn('[data-tid=startRenameEntryTID]');
    // await setInputKeys('fileNameProperties', newTile);
    await setInputValue('[data-tid=fileNameProperties] input', newTile);
    await clickOn('[data-tid=confirmRenameEntryTID]');
    // await waitForNotification();
    // await isDisplayed('[data-tid=confirmRenameEntryTID]', false);
    await global.client.waitForSelector(
      '[data-tid=fileNameProperties] input[value="' + newTile + '"]'
    );
    const propsNewFileName = await getPropertiesFileName();
    expect(propsFileName).not.toBe(propsNewFileName);

    //turn fileName back
    await clickOn('[data-tid=startRenameEntryTID]');
    // await setInputKeys('fileNameProperties', propsFileName);
    await setInputValue('[data-tid=fileNameProperties] input', propsFileName);
    await clickOn('[data-tid=confirmRenameEntryTID]');
    // await waitForNotification();
    // await isDisplayed('[data-tid=confirmRenameEntryTID]', false);
    await global.client.waitForSelector(
      '[data-tid=fileNameProperties] input[value="' + propsFileName + '"]'
    );
    const propsOldFileName = await getPropertiesFileName();
    expect(propsOldFileName).toBe(propsFileName);
  });

  it.skip('TST0806 - Download file [manual]', async () => {});

  it('TST0807 - Rename opened folder [web,minio,electron]', async () => {
    const newTile = 'folderRenamed';
    // open folderProperties
    await openContextEntryMenu(selectorFolder, 'showProperties');

    const propsFolderName = await getPropertiesFileName();
    await clickOn('[data-tid=startRenameEntryTID]');
    await setInputValue('[data-tid=fileNameProperties] input', newTile);
    await clickOn('[data-tid=confirmRenameEntryTID]');
    // await waitForNotification();
    await global.client.waitForSelector(
      '[data-tid=fileNameProperties] input[value="' + newTile + '"]'
    );
    const propsNewFolderName = await getPropertiesFileName();
    expect(propsFolderName).not.toBe(propsNewFolderName);

    //turn folderName back
    await clickOn('[data-tid=startRenameEntryTID]');
    await setInputValue('[data-tid=fileNameProperties] input', propsFolderName);
    await clickOn('[data-tid=confirmRenameEntryTID]');
    // await waitForNotification();
    await global.client.waitForSelector(
      '[data-tid=fileNameProperties] input[value="' + propsFolderName + '"]'
    );
    const propsOldFileName = await getPropertiesFileName();
    expect(propsOldFileName).toBe(propsFolderName);
  });

  it('TST0808 - Add and remove tags to a file (file names) [web,minio,electron]', async () => {
    // await searchEngine('bmp');
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
  });

  it('TST0809 - Add and remove tag to a file (sidecar files) [web,minio,electron]', async () => {
    // global.client.setDefaultTimeout(300000);
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    // await searchEngine('bmp');
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
  });

  it('TST0810 - Tag file drag&drop in file opener [web]', async () => {
    const tagName = 'article';
    await clickOn('[data-tid=tagLibrary]');
    await dragDrop('button[title=' + tagName + ']', selectorFile);

    await clickOn(selectorFile);
    await clickOn('[data-tid=fileContainerToggleProperties]');
    const propsTags = await getPropertiesTags();
    expect(propsTags.includes(tagName)).toBe(true);
  });

  it('TST3002 - Add and remove tag to a folder [web,minio,electron]', async () => {
    await openContextEntryMenu(selectorFolder, 'showProperties');
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
  });

  it.skip('TST3004 - Folder Tagging [Pro]', async () => {});

  it.skip('TST3001 - Description for files [Pro]', async () => {});

  it.skip('TST3005 - Description for folders [Pro]', async () => {});

  /**
   * reload file button not visible on electron (github app size specific)
   */
  it('TST0812 - Reload file [web,minio]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');
    await clickOn('[data-tid=reloadFileTID]');
    // TODO externally change the file to check if its reloaded
  });

  it('TST0813 - Delete file [web,minio,electron]', async () => {
    await global.client.dblclick(selectorFolder);

    await createTxtFile();
    // await searchEngine('note');
    // await waitForNotification();
    // await global.client.waitForTimeout(1500); // To do wait for search results
    await expectElementExist(selectorFile, true);

    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

    // const propsFileName = await getPropertiesFileName();
    await clickOn('[data-tid=deleteEntryTID]');
    await clickOn('[data-tid=confirmSaveBeforeCloseDialog]');
    await waitForNotification();
    await expectElementExist(selectorFile, false, 2000);
    //const firstFileName = await getGridFileName(0);
    //expect(propsFileName).not.toBe(firstFileName);
  });

  /**
   * TODO dont work on web tests https://trello.com/c/93iEURf4/731-migrate-fullscreen-to-https-githubcom-snakesilk-react-fullscreen
   */
  it('TST0814 - Open file fullscreen and exit with close button [minio,electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    await clickOn('[data-tid=fileContainerSwitchToFullScreen]');
    await expectElementExist('[data-tid=fullscreenTID]', true, 2000);
    // await takeScreenshot('TST0814 fullscreenTID exist true');
    await clickOn('[data-tid=fullscreenTID]');
    // await takeScreenshot('TST0814 fullscreenTID exist false');
    await expectElementExist('[data-tid=fullscreenTID]', false, 2000);
  });

  it.skip('TST0815 - Test opening file, while TS is in fullscreen(F11) [manual]', async () => {});

  it.skip('TST0817 - Open file fullscreen and exit with ESC button [electron]', async () => {});

  it.skip('TST0818 - Open in new tab in the web version [Web]', async () => {});

  it.skip('TST0819 - Open file natively [manual]', async () => {});

  it.skip('TST0820 - Open containing folder [manual]', async () => {});

  it.skip('TST0821 - Toggle File Properties [electron]', async () => {});

  it.skip('TST0822 - Open Folder Properties [electron]', async () => {});

  it.skip('TST0823 - Show thumbnail in the properties if available [Pro]', async () => {});

  it.skip('TST0824 - Change file thumbnail / Reset thumbnail [Pro]', async () => {});

  it.skip('TST0825 - Change folder thumbnail / Reset thumbnail [Pro]', async () => {});
});
