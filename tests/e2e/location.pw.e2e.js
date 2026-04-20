/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */
import pathLib from 'path';
import fse from 'fs-extra';
import AppConfig from '../../src/renderer/AppConfig';
import { expect, test } from './fixtures';
import {
  addDescription,
  clickOn,
  createFile,
  createLocation,
  createNewDirectory,
  expectElementExist,
  expectMetaFileContain,
  getGridFileSelector,
  openFile,
  openFolder,
  openFolderProp,
  setInputValue
} from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import {
  createPwLocation,
  createS3Location,
  getPwLocationTid,
  openLocationMenu,
  startupLocation
} from './location.helpers';
import { getS3File } from '../s3rver/S3DataRefresh';
import { clearDataStorage } from './welcome.helpers';

export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
export const newLocationName = 'Location_Name_Changed';

let testLocationName;

test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  await startTestingApp(
    { isWeb, isS3, webServerPort, testInfo },
    'extconfig-without-locations.js',
  );
  //await clearDataStorage();
});

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async ({ page }, testInfo) => {
  /*if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }*/
  await clearDataStorage();
});

test.beforeEach(async ({ isS3, testDataDir }) => {
  testLocationName = '' + new Date().getTime();

  if (isS3) {
    await createS3Location('', testLocationName, true);
  } else {
    await createPwLocation(testDataDir, testLocationName, true);
  }

  await clickOn('[data-tid=location_' + testLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 15000);
  // await delay(500);
  // await closeFileProperties();
});

test.describe('TST03 - Testing locations:', () => {
  test('TST0301 - Should create a location [web,s3,electron]', async () => {
    await expectElementExist(
      '[data-tid=location_' + testLocationName + ']',
      true,
      4500,
    );
  });

  test('TST0302 - Should remove a location [web,s3,electron]', async () => {
    await expectElementExist(
      '[data-tid=location_' + testLocationName + ']',
      true,
      4500,
    );
    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=removeLocation]');
    await clickOn('[data-tid=confirmDeleteLocationDialog]');
    //const locationList = await global.client.$('[data-tid=locationList]');
    //await locationList.waitForDisplayed();
    await expectElementExist(
      '[data-tid=location_' + testLocationName + ']',
      false,
    );
    await expectElementExist('[data-tid=WelcomePanelTID]', true);
  });

  test('TST0303 - Rename location [web,s3,electron]', async () => {
    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=editLocation]');
    await global.client.dblclick('[data-tid=locationName] input');
    await setInputValue('[data-tid=locationName] input', newLocationName); 
    await clickOn('[data-tid=confirmLocationCreation]');

    await expectElementExist(
      '[data-tid=location_' + newLocationName + ']',
      true,
      5000,
    );
  });

  test('TST0305 - Set as startup location [web,s3,electron]', async () => {
    await openLocationMenu(testLocationName);
    await startupLocation();
    await expectElementExist('[data-tid=startupIndication]', false);
    // await global.client.pause(500);
    await openLocationMenu(testLocationName);
    await startupLocation();
    await expectElementExist('[data-tid=startupIndication]', true, 5000);
    // TODO check if the indicator is setted on the correct location
    // TODO evlt reastart the applcatio and see if the loading of default locations works
  });

  /**
   * You can create two locations with the same name now
   */
  test('TST0306 - should test duplication warning on creating locations with the same name', async () => {
    // TODO test duplication warning on creating locations
  });

  test('TST0307 - Move location Up and Down [web,s3,electron]', async ({
    isWeb,
    isS3,
  }) => {
    if (isWeb) {
      // in web there is no other locations
      if (isS3) {
        await createS3Location('empty_folder');
      }
    }
    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=moveLocationUp]');

    const prevLocation = await getPwLocationTid(-2);
    expect(prevLocation).toBe(testLocationName);

    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=moveLocationDown]');

    const lastLocation = await getPwLocationTid(-1);
    expect(lastLocation).toBe(testLocationName);
  });

  test('TST0328 - Creating location index [web,electron,_pro]', async ({
    isS3,
    isWeb,
    testDataDir,
  }) => {
    test.setTimeout(520000);
    const props = { isS3, testDataDir };
    const file1 = 'test_file1[tag1 tag2].md'; // todo sidecar tags + ids
    const file1content = 'test md file 1';
    const file1desc = 'test file 1 desc';
    const file2 = 'test_file2[tag3 tag4].txt';
    const file2content = 'test txt file 2';
    const file2desc = 'test file 2 desc';
    const locationFolderName = 'indexingLocation';

    //await createFile(props, 'tsm.json', '{id=f998c4e9349044288c93f096f5cebca8}', '.ts');
    await createNewDirectory(locationFolderName);

    await createFile(props, file1, file1content, locationFolderName);
    await createFile(props, file2, file2content, locationFolderName);
    await openFolder(locationFolderName);

    const testFolder = await createNewDirectory();
    const folderDesc = 'test folder desc';

    await openFolderProp(testFolder);
    await addDescription(folderDesc);

    //await global.client.waitForTimeout(880000);
    await expectElementExist(
      '[data-tid=gridCellDescription]',
      true,
      10000,
      getGridFileSelector(testFolder),
    );
    await openFile(file1, 'showPropertiesTID');
    await addDescription(file1desc);
    await openFile(file2, 'showPropertiesTID');
    await addDescription(file2desc);
    await createLocation(
      props,
      locationFolderName,
      locationFolderName,
      true,
      true,
      testFolder,
    );
    await openLocationMenu(locationFolderName);
    await clickOn('[data-tid=indexLocation]');
    //await global.client.waitForTimeout(880000);
    const indexFileContent =
      '[{"name":"testFolder","path":"testFolder","meta":{"description":"test folder desc"},"isFile":false},{"name":"test_file1[tag1 tag2].md","path":"test_file1[tag1 tag2].md","meta":{"description":"test file 1 desc"},"isFile":true,"textContent":"test md file 1","extension":"md"},{"name":"test_file2[tag3 tag4].txt","path":"test_file2[tag3 tag4].txt","meta":{"description":"test file 2 desc"},"isFile":true,"textContent":"test txt file 2","extension":"txt"}]';
    //await setFileTypeExtension('json');
    const rootFolder = locationFolderName + '/' + AppConfig.metaFolder;
    // await global.client.waitForTimeout(180000);
    await expectMetaFileContain(
      { testDataDir, isS3 },
      'tsi.json',
      rootFolder,
      indexFileContent,
      8000,
    );
  });

  test('TST0329 - Index must persist only relative paths (worker + non-worker) [web,s3,electron]', async ({
    isS3,
    testDataDir,
  }) => {
    // Covers all three persist paths:
    //   * electron-local    → WS worker (indexer package persistIndex)
    //   * electron-s3       → renderer persistIndex (non-worker, S3 IO)
    //   * web-s3            → renderer persistIndex (non-worker, S3 IO)
    // The invariant we assert: tsi.json on disk must only contain paths
    // relative to the location root. Absolute paths would break search
    // on the next load because enhanceDirectoryIndex double-joins the
    // location path onto entries.
    test.setTimeout(180000);

    const readTsiJson = async () => {
      const rel = AppConfig.metaFolder + '/' + AppConfig.folderIndexFile;
      try {
        if (isS3) {
          return await getS3File(rel);
        }
        return await fse.readFile(
          pathLib.join(testDataDir, rel),
          'utf-8',
        );
      } catch (e) {
        return undefined;
      }
    };

    // An earlier test in the same worker may have left a tsi.json behind
    // (testDataDir fixture is worker-scoped). Snapshot it so we can wait
    // for indexLocation to replace it before reading.
    const before = await readTsiJson();

    await openLocationMenu(testLocationName);
    await clickOn('[data-tid=indexLocation]');

    let after;
    await expect
      .poll(
        async () => {
          after = await readTsiJson();
          return !!after && after !== before;
        },
        { timeout: 120000, intervals: [500, 1000, 2000] },
      )
      .toBeTruthy();

    const entries = JSON.parse(after);
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);

    // Absolute-path shapes we must never find in the persisted index:
    //   Unix / S3-on-disk: leading "/"
    //   Windows:           drive letter like "C:\" or "C:/"
    const absPathRegex = /^(?:\/|[a-zA-Z]:[\\/])/;

    const offenders = entries.filter(
      (e) =>
        !e ||
        typeof e.path !== 'string' ||
        absPathRegex.test(e.path) ||
        // Belt-and-suspenders for unusual separator combinations: the
        // filesystem path of the location itself must not leak in.
        // Skipped for S3 — there the backing-store path and the bucket
        // root coincide by design.
        (!isS3 && e.path.includes(testDataDir)),
    );
    if (offenders.length > 0) {
      throw new Error(
        'tsi.json contains entries with absolute or location-prefixed paths: ' +
          JSON.stringify(offenders.slice(0, 5), null, 2) +
          (offenders.length > 5
            ? `\n…and ${offenders.length - 5} more.`
            : ''),
      );
    }

    // Best-effort: the fulltext index (tsft.jsonl) shares the same
    // relative-path contract. Only written when full-text indexing is
    // enabled, so its absence is fine — but if it exists, its `p` keys
    // must pass the same check.
    const ftRel =
      AppConfig.metaFolder + '/' + AppConfig.folderFullTextFile;
    let ftContent;
    try {
      ftContent = isS3
        ? await getS3File(ftRel)
        : await fse.readFile(pathLib.join(testDataDir, ftRel), 'utf-8');
    } catch (e) {
      ftContent = undefined;
    }
    if (ftContent) {
      const ftLines = ftContent.split('\n').filter((l) => l.trim());
      const ftOffenders = [];
      for (const line of ftLines) {
        let parsed;
        try {
          parsed = JSON.parse(line);
        } catch (e) {
          continue;
        }
        if (
          parsed &&
          typeof parsed.p === 'string' &&
          (absPathRegex.test(parsed.p) ||
            (!isS3 && parsed.p.includes(testDataDir)))
        ) {
          ftOffenders.push(parsed.p);
        }
      }
      if (ftOffenders.length > 0) {
        throw new Error(
          'tsft.jsonl contains absolute or location-prefixed keys: ' +
            JSON.stringify(ftOffenders.slice(0, 5)),
        );
      }
    }
  });
});
/*
describe.skip('TST03 - Testing locations - test Context Menu in Tree Directory', () => {
  beforeEach(async () => {
    const locationPath = defaultLocationPath; // to local path
    const locationName = 'test-data';
    await createLocation(locationPath, locationName);
  });

  afterEach(() => {
    // global.shouldClearLocaleStorage = true;
  });
});
*/
