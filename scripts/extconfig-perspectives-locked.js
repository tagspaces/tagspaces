// Test fixture: simulates a deployer who pins the available perspectives
// via extconfig. With ExtEnabledPerspectives set, the Settings → Perspectives
// tab becomes read-only and the switcher shows only the listed IDs.
// Used by tests/e2e/perspective-config.pw.e2e.js (TST7110).
window.ExtIsFirstRun = false;
window.ExtCheckForUpdatesOnStartup = false;
window.ExtUseGenerateThumbnails = true;
window.ExtEnabledPerspectives = ['grid', 'list'];
window.ExtDefaultPerspective = 'grid';
window.ExtLocations = [
  {
    uuid: '30565f09-c7fd-2333-fc67-a75db27rt5ba',
    type: '0',
    name: 'supported-filestypes',
    path: './tests/testdata-tmp/file-structure/supported-filestypes',
    isDefault: false,
    isReadOnly: false,
    disableIndexing: false,
    fullTextIndex: false,
    watchForChanges: false,
  },
];
