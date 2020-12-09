import {
  closeFileProperties,
  createLocation,
  createMinioLocation,
  defaultLocationName,
  defaultLocationPath
} from './location.helpers';
import { clickOn, setSettings } from './general.helpers';
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
