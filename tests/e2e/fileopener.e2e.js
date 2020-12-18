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
  setInputKeys,
  setSettings,
  waitForNotification
} from './general.helpers';
import {
  AddRemovePropertiesTags,
  getPropertiesFileName
} from './file.properties.helpers';
import { searchEngine } from './search.spec';
import {
  firstFile,
  firstFolder,
  openContextEntryMenu,
  perspectiveGridTable
} from './test-utils.spec';

describe('TST08 - File / folder properties', () => {
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

  it('TST0801 - Arrow keys select next/prev file (keybindings) [TST0801,web,minio,electron]', async () => {
    const firstFileName = await getGridFileName(0);

    // open fileProperties
    await clickOn(perspectiveGridTable + firstFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

    const propsFileName = await getPropertiesFileName();
    expect(firstFileName).toBe(propsFileName);

    await global.client.keys('ArrowDown');
    const propsNextFileName = await getPropertiesFileName();

    const secondFileName = await getGridFileName(1);
    expect(secondFileName).toBe(propsNextFileName);

    await global.client.keys('ArrowUp');
    const propsPrevFileName = await getPropertiesFileName();
    expect(propsPrevFileName).toBe(propsFileName);
  });

  it('TST0802 - Open next file buttons [TST0802,web,minio,electron]', async () => {
    const firstFileName = await getGridFileName(0);

    // open fileProperties
    await clickOn(perspectiveGridTable + firstFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

    const propsFileName = await getPropertiesFileName();
    expect(firstFileName).toBe(propsFileName);

    await clickOn('[data-tid=fileContainerNextFile]');
    const propsNextFileName = await getPropertiesFileName();

    const secondFileName = await getGridFileName(1);
    expect(secondFileName).toBe(propsNextFileName);
  });

  it('TST0803 - Open previous files buttons [TST0803,web,minio,electron]', async () => {
    const firstFileName = await getGridFileName(0);

    // open fileProperties
    await clickOn(perspectiveGridTable + firstFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

    const propsFileName = await getPropertiesFileName();
    expect(firstFileName).toBe(propsFileName);

    await clickOn('[data-tid=fileContainerPrevFile]');
    const propsNextFileName = await getPropertiesFileName();

    const lastFileName = await getGridFileName(-1);
    expect(lastFileName).toBe(propsNextFileName);
  });

  // TODO the last button full width is not visible (maybe its need to add scroll)
  it('TST0804 - Open file in full width [TST0804]', async () => {
    // open fileProperties
    await clickOn(perspectiveGridTable + firstFile);
    await global.client.pause(500);
    await clickOn('[data-tid=openInFullWidthTID]'); // dummy click -first click in openInFullWidthTID dont work
    await clickOn('[data-tid=openInFullWidthTID]');
    await expectElementExist('[data-tid=folderContainerTID]', false);
  });

  it('TST0805 - Rename opened file [TST0805,web,minio,electron]', async () => {
    const newTile = 'fileRenamed.txt';
    await searchEngine('txt');
    // open fileProperties
    await clickOn(perspectiveGridTable + firstFile);
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

  it('TST0807 - Rename opened folder [TST0807, electron]', async () => {
    const newTile = 'folderRenamed';
    // open folderProperties
    await openContextEntryMenu(
      perspectiveGridTable + firstFolder,
      'showProperties'
    );

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

  it('TST0808 - Add and remove tags to a file (file names) [TST0808,web,minio,electron]', async () => {
    await searchEngine('bmp');
    // open fileProperties
    await clickOn(perspectiveGridTable + firstFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
  });

  it('TST0809 - Add and remove tag to a file (sidecar files) [TST0809,web,minio,electron]', async () => {
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]');
    await searchEngine('bmp');
    // open fileProperties
    await clickOn(perspectiveGridTable + firstFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
  });

  it('TST3002 - Add and remove tag to a folder [TST3002,web,minio,electron]', async () => {
    await openContextEntryMenu(
      perspectiveGridTable + firstFolder,
      'showProperties'
    );
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
  });

  it('TST0812 - Reload file [TST0812,web,minio,electron]', async () => {
    // open fileProperties
    await clickOn(perspectiveGridTable + firstFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');
    await clickOn('[data-tid=reloadFileTID]');
    // TODO externally change the file to check if its reloaded
  });

  /** TODO
   * web clickOn selector [data-tid=confirmSaveBeforeCloseDialog] to exist after 5s
   */
  it('TST0813 - Delete file [TST0813,minio,electron]', async () => {
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

  it('TST0814 - Open file fullscreen and exit with close button [TST0803,web,minio,electron]', async () => {
    // open fileProperties
    await clickOn(perspectiveGridTable + firstFile);
    await clickOn('[data-tid=fileContainerSwitchToFullScreen]');
    await expectElementExist('[data-tid=fullscreenTID]', true);
    await clickOn('[data-tid=fullscreenTID]');
    await expectElementExist('[data-tid=fullscreenTID]', false);
  });
});
