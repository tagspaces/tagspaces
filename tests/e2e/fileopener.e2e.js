import {
  closeFileProperties,
  createLocation,
  createMinioLocation,
  defaultLocationName,
  defaultLocationPath
} from './location.helpers';
import { clickOn, setSettings } from './general.helpers';
import { AddRemoveTagsToFile } from './file.properties.helpers';

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
    await AddRemoveTagsToFile();
  });

  it('TST0809 - Add and remove tag to a file (sidecar files) [TST0809,web,minio,electron]', async () => {
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]');
    await AddRemoveTagsToFile();
  });
});
