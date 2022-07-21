import { clearLocalStorage, takeScreenshot } from './e2e/hook';
import { closeWelcome, closeWelcomePlaywright } from './e2e/welcome.helpers';
import { clearStorage } from './e2e/clearstorage.helpers';

// the default timeout before starting every test
jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

// global.isWin = /^win/.test(process.platform);
// global.isMac = /^darwin/.test(process.platform);
global.isWeb = process.env.NODE_JEST === 'test_web';
global.isPlaywright = process.env.PLAYWRIGHT === 'test_playwright';
global.isHeadlessMode = process.env.HEADLESS_MODE === 'true';
global.isMinio = global.isWeb || process.env.NODE_JEST === 'test_minio';
global.isElectron = process.env.NODE_JEST === 'test_electron';
global.isUnitTest =
  process.env.NODE_JEST === 'unit_test' ||
  (!global.isElectron && !global.isMinio && !global.isWeb);

/*jasmine.getEnv().addReporter({
  specStarted: function(result) {
    console.log(`Spec name: ${result.fullName}, description: ${result.description}`);
  }
});*/

jasmine.getEnv().addReporter({
  specStarted: result => (jasmine.currentTest = result),
  specDone: result => (jasmine.previousTest = result)
});

/*jasmine.getEnv().addReporter({
  specDone: async result => {
    if (result.status !== 'disabled') {
      // console.log('specDone Done' + JSON.stringify(result));
      if (result.status === 'failed') {
        await takeScreenshot();
      }
      // await clearLocalStorage(); //todo https://trello.com/c/hMCSKXWU/554-fix-takescreenshots-in-tests
    }
  }
});*/

/*beforeAll(async () => {
  await startSpectronApp();
});

afterAll(async () => {
  await stopSpectronApp();
  await testDataRefresh();
});*/

beforeEach(async () => {
  if (global.isPlaywright) {
    /*if (global.context) {
      if (jasmine.currentTest && jasmine.currentTest.status !== 'disabled') {
        // Start tracing before creating / navigating a page.
        await global.context.tracing.start({
          screenshots: true,
          snapshots: true
        });
      }
    }*/

    await closeWelcomePlaywright();

    if (global.isWeb) {
      await global.client.evaluate(() => {
        window.history.pushState('', document.title, window.location.pathname);
        localStorage.clear();
      });
      await global.client.reload();
    } else {
      await clearStorage();
    }

    await closeWelcomePlaywright();
  } else {
    if (jasmine.currentTest && jasmine.currentTest.status !== 'disabled') {
      // console.log('specDone Done' + JSON.stringify(result));
      if (jasmine.previousTest && jasmine.previousTest.status === 'failed') {
        await takeScreenshot(jasmine.previousTest.description);
      }
      await clearLocalStorage(); //todo https://trello.com/c/hMCSKXWU/554-fix-takescreenshots-in-tests
    }

    if (global.isWeb) {
      await global.client.pause(500);
    }
    await closeWelcome();
  }
});

// afterEach(async () => {
//   // takeScreenshot();
//   // await clearLocalStorage();
// testDataRefresh();
/*if (global.context) {
    if (jasmine.currentTest && jasmine.currentTest.status !== 'disabled') {
      // console.log('specDone Done' + JSON.stringify(result));
      // if (jasmine.previousTest && jasmine.previousTest.status === 'failed') {
      await global.context.tracing.stop({
        path: pathLib.join(
          __dirname,
          'test-reports/' + jasmine.currentTest.description + '.zip'
        )
      });
      //}
    }
  }*/
// await clearStorage();
// });
