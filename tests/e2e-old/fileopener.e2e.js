import {
  closeFileProperties,
  createLocation,
  createMinioLocation,
  defaultLocationName,
  defaultLocationPath
} from './location.helpers';
import {
  clickOn,
  createTxtFile,
  expectElementExist,
  getGridFileName,
  selectorFile,
  selectorFolder,
  setInputKeys,
  setSettings,
  waitForNotification
} from './general.helpers';
import {
  AddRemovePropertiesTags,
  getPropertiesFileName
} from './file.properties.helpers';
import { searchEngine } from './search.helpers';
import { openContextEntryMenu } from './test-utils';

describe('TST08 - File folder properties', () => {
  beforeEach(async () => {
    if (global.isMinio) {
      await createMinioLocation('', defaultLocationName, true);
    } else {
      await createLocation(defaultLocationPath, defaultLocationName, true);
    }
    // openLocation
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    // If its have opened file
    await closeFileProperties();
  });

  it('TST0801 - Arrow keys select next prev file (keybindings) [web,minio,electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

    const propsFileName = await getPropertiesFileName();
    const firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe(propsFileName);

    await global.client.keys('ArrowDown');
    const propsNextFileName = await getPropertiesFileName();
    const secondFileName = await getGridFileName(1);
    expect(secondFileName).toBe(propsNextFileName);

    await global.client.keys('ArrowUp');
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

  // TODO the last button full width is not visible (maybe its need to add scroll)
  it.skip('TST0804 - Open file in full width [electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    await global.client.pause(500);
    await clickOn('[data-tid=openInFullWidthTID]'); // dummy click -first click in openInFullWidthTID dont work
    await clickOn('[data-tid=openInFullWidthTID]');
    await expectElementExist('[data-tid=folderContainerTID]', false);
  });

  it('TST0805 - Rename opened file [web,minio,electron]', async () => {
    const newTile = 'fileRenamed.txt';
    await searchEngine('txt');
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

    const propsFileName = await getPropertiesFileName();
    await clickOn('[data-tid=startRenameEntryTID]');
    await setInputKeys('fileNameProperties', newTile);
    await clickOn('[data-tid=confirmRenameEntryTID]');
    await waitForNotification();
    const propsNewFileName = await getPropertiesFileName();
    expect(propsFileName).not.toBe(propsNewFileName);

    //turn fileName back
    await clickOn('[data-tid=startRenameEntryTID]');
    await setInputKeys('fileNameProperties', propsFileName);
    await clickOn('[data-tid=confirmRenameEntryTID]');
    await waitForNotification();
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
    await setInputKeys('fileNameProperties', newTile);
    await clickOn('[data-tid=confirmRenameEntryTID]');
    await waitForNotification();
    const propsNewFolderName = await getPropertiesFileName();
    expect(propsFolderName).not.toBe(propsNewFolderName);

    //turn folderName back
    await clickOn('[data-tid=startRenameEntryTID]');
    await setInputKeys('fileNameProperties', propsFolderName);
    await clickOn('[data-tid=confirmRenameEntryTID]');
    await waitForNotification();
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
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]');
    // await searchEngine('bmp');
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
  });

  it.skip('TST0810 - Tag file drag&drop in file opener [manual]', async () => {});

  it('TST3002 - Add and remove tag to a folder [web,minio,electron]', async () => {
    await openContextEntryMenu(selectorFolder, 'showProperties');
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
  });

  it.skip('TST3004 - Folder Tagging [Pro]', async () => {});

  it.skip('TST3001 - Description for files [Pro]', async () => {});

  it.skip('TST3005 - Description for folders [Pro]', async () => {});

  it('TST0812 - Reload file [web,minio,electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');
    await clickOn('[data-tid=reloadFileTID]');
    // TODO externally change the file to check if its reloaded
  });

  it('TST0813 - Delete file [web,minio,electron]', async () => {
    await createTxtFile();
    await searchEngine('note');

    await expectElementExist(selectorFile, true);

    // open fileProperties
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

    const propsFileName = await getPropertiesFileName();
    await clickOn('[data-tid=deleteEntryTID]');
    /*if (global.isWeb) {
      await global.client.pause(500);
    }*/
    await clickOn('[data-tid=confirmSaveBeforeCloseDialog]');
    await waitForNotification();
    const firstFileName = await getGridFileName(0);
    expect(propsFileName).not.toBe(firstFileName);
  });

  it('TST0814 - Open file fullscreen and exit with close button [web,minio,electron]', async () => {
    // open fileProperties
    await clickOn(selectorFile);
    await clickOn('[data-tid=fileContainerSwitchToFullScreen]');
    await expectElementExist('[data-tid=fullscreenTID]', true);
    await clickOn('[data-tid=fullscreenTID]');
    await expectElementExist('[data-tid=fullscreenTID]', false);
    await global.client.waitForTimeout(500);
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
