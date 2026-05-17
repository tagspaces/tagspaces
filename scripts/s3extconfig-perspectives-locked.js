// S3 variant of extconfig-perspectives-locked.js — used by the web-s3 and
// electron-s3 projects (copyExtConfig() resolves "s3extconfig-..." for both).
// The base extconfig-perspectives-locked.js injects a type:'0' local-FS
// location, which a browser web build cannot open, so the perspective-lock
// tests (TST7301-7303) timed out in beforeEach on web-s3. This mirrors the
// S3Proxy connection settings used by createS3Location()/setup-functions.js.
window.ExtIsFirstRun = false;
window.ExtCheckForUpdatesOnStartup = false;
window.ExtUseGenerateThumbnails = true;
window.ExtEnabledPerspectives = ['grid', 'list'];
window.ExtDefaultPerspective = 'grid';
window.ExtLocations = [
  {
    uuid: '30565f09-c7fd-2333-fc67-a75db27rt5ba',
    type: '1', // cloud / S3 location
    name: 'supported-filestypes',
    path: '', // bucket root — so empty_folder shows in the grid
    accessKeyId: 'test',
    secretAccessKey: 'test',
    bucketName: 'supported-filestypes',
    endpointURL: 'http://localhost:4569',
    region: 'eu-central-1',
    isDefault: false,
    isReadOnly: false,
    disableIndexing: false,
    fullTextIndex: false,
    watchForChanges: false,
  },
];
