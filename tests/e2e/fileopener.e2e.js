import {
  closeFileProperties,
  createLocation,
  createMinioLocation,
  defaultLocationName,
  defaultLocationPath,
  getPropertiesTags
} from './location.helpers';
import { addInputKeys, clickOn } from './general.helpers';
import { searchEngine } from './search.spec';
import { firstFile, perspectiveGridTable } from './test-utils.spec';

const testTagName = 'test-tag'; // TODO fix camelCase tag name

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

    // open fileProperties
    await clickOn(perspectiveGridTable + firstFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

    const propsTags = await getPropertiesTags();

    expect(propsTags.includes(testTagName)).toBe(false);

    await addInputKeys('PropertiesTagsSelectTID', testTagName);
    await global.client.keys('Enter');
    await global.client.pause(500);
    let propsNewTags = await getPropertiesTags();

    expect(propsNewTags.includes(testTagName)).toBe(true);

    await clickOn('[data-tid=tagMoreButton_' + testTagName + ']');
    await global.client.pause(500);
    await clickOn('[data-tid=deleteTagMenu]');
    await global.client.pause(500);
    await clickOn('[data-tid=confirmRemoveTagFromFile]');
    await global.client.pause(500);
    propsNewTags = await getPropertiesTags();
    expect(propsNewTags.includes(testTagName)).toBe(false);
  });
});
