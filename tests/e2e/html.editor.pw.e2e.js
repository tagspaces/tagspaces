import { test, expect } from './fixtures';
import {
  createPwMinioLocation,
  createPwLocation,
  defaultLocationName,
  defaultLocationPath,
  createS3Location,
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  expectFileContain,
  getGridFileSelector,
  writeTextInIframeInput,
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';
import { dataTidFormat } from '../../src/renderer/services/test';
import { stopServices } from '../setup-functions';

let s3ServerInstance;
let webServerInstance;
let minioServerInstance;

test.beforeAll(async ({ s3Server, webServer, minioServer }) => {
  s3ServerInstance = s3Server;
  webServerInstance = webServer;
  minioServerInstance = minioServer;
});

test.afterAll(async () => {
  await stopServices(s3ServerInstance, webServerInstance, minioServerInstance);
});

test.afterEach(async ({ page }, testInfo) => {
  /*if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }*/
  await testDataRefresh(s3ServerInstance);
  await clearDataStorage();
  await stopApp();
});

test.beforeEach(async ({ isMinio, isS3, isWeb }) => {
  await startTestingApp(
    { isWeb, isS3 },
    isMinio || isS3 ? undefined : 'extconfig.js',
  );
  if (isMinio) {
    await closeWelcomePlaywright();
    await createPwMinioLocation('', defaultLocationName, true);
  } else if (isS3) {
    await closeWelcomePlaywright();
    await createS3Location('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 8000);
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST56 - HTML viewer/editot', () => {
  test('TST5603 - Save html content [web,s3,electron]', async () => {
    // open fileProperties
    const fileName = 'sample.html';
    const newFileContent = 'etete5435newtextsaved';
    await clickOn(getGridFileSelector(fileName));
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']',
      true,
      8000,
    );
    await clickOn('[data-tid=fileContainerEditFile]');
    await writeTextInIframeInput(
      newFileContent,
      'div[class=note-editing-area] div[contenteditable=true]',
    );
    await clickOn('[data-tid=fileContainerSaveFile]');
    await clickOn('[data-tid=cancelEditingTID]');
    await clickOn('[data-tid=propsActionsMenuTID]');
    await clickOn('[data-tid=reloadPropertiesTID]');
    await expectFileContain(newFileContent, 10000);
  });
});
