import {
  closeFileProperties,
  createLocation,
  createMinioLocation,
  defaultLocationName,
  defaultLocationPath
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  getGridFileName,
  setInputKeys,
  setSettings,
  waitForNotification
} from './general.helpers';
import {
  AddRemoveTagsToFile,
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

  it('TST0804 - Open file in full width [TST0804,web,minio,electron]', async () => {
    // open fileProperties
    await clickOn(perspectiveGridTable + firstFile);
    await clickOn('[data-tid=fileContainerSwitchToFullScreen]');
    await expectElementExist('[data-tid=fullscreenTID]', true);
    await clickOn('[data-tid=fullscreenTID]');
    await expectElementExist('[data-tid=fullscreenTID]', false);
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

  it('TST0807 - Rename opened folder [TST0807,web,minio,electron]', async () => {
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
    await AddRemoveTagsToFile(perspectiveGridTable + firstFile, [
      'test-tag1',
      'test-tag2'
    ]);
  });

  it('TST0809 - Add and remove tag to a file (sidecar files) [TST0809,web,minio,electron]', async () => {
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]');
    await searchEngine('bmp');
    await AddRemoveTagsToFile(perspectiveGridTable + firstFile);
  });
});
