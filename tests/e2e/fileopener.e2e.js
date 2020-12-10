import {
  closeFileProperties,
  createLocation,
  createMinioLocation,
  defaultLocationName,
  defaultLocationPath,
  getPropertiesFileName
} from './location.helpers';
import { clickOn, getGridFileName, setSettings } from './general.helpers';
import { AddRemoveTagsToFile } from './file.properties.helpers';
import { searchEngine } from './search.spec';
import { firstFile, perspectiveGridTable } from './test-utils.spec';

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
