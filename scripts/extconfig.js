window.ExtLogoURL = 'assets/images/text-logo-dev.svg';
window.ExtShowAdvancedSearch = false;
window.ExtSidebarColor = '#3bc8ff';
window.ExtSidebarSelectionColor = '#85d5f5';
window.ExtLightThemeLightColor = '#a6def4';
window.ExtLightThemeMainColor = '#3bc8ff';
window.ExtDarkThemeLightColor = '#a6def4';
window.ExtDarkThemeMainColor = '#3bc8ff';
window.ExtIsFirstRun = false;
window.ExtLocations = [
  {
    uuid: '30565f09-c7fd-2333-fc67-a75db27rt5ba', // an inique id of the location
    type: '0', // 1 defines the locations a cloud based
    name: 'supported-filestypes', // the name of the location
    path: './testdata-tmp/file-structure/supported-filestypes', // the path to sub folder in the location
    // accessKeyId: 'your_access_key', // the access key of the user
    // secretAccessKey: 'your_secret_key', // the secret case of the user
    // bucketName: 'demo-bucket', // the name of the S3 bucket
    // region: 'eu-central-1', // the AWS region
    isDefault: false, // if true this location will be loaded by the application start
    isReadOnly: false, // if true the user interface of the application turns to read-only mode
    persistIndex: false, // if true the search index will be persisted and loaded by default on location opening
    fullTextIndex: false, // activated the full-text search for TXT, MD and HTML files
    watchForChanges: false // activates the watching for changed files in the current location
  }
];
