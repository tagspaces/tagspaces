window.ExtLightThemeLightColor = '#a6def4';
window.ExtLightThemeMainColor = '#3bc8ff';
window.ExtDarkThemeLightColor = '#a6def4';
window.ExtDarkThemeMainColor = '#3bc8ff';
window.ExtUseGenerateThumbnails = true;
window.ExtSaveLocationsInBrowser = true
window.ExtLocations = [
  {
    uuid: '40565f09-c7fd-2333-fc67-a75db27rt5ba', // an unique id of the location
    type: '1', // 1 defines the locations a cloud based
    name: 'S3 zenko', // the name of the location
    path: '', // the path to sub folder in the location
    accessKeyId: 'accessKey1', // the access key of the user
    secretAccessKey: 'verySecretKey1', // the secret case of the user
    endpointURL: 'http://localhost:8000',
    // endpointURL: 'http://172.173.100.2:8000/api/buckets',
    bucketName: 'tsbucket', // the name of the S3 bucket
    // region: 'eu-central-1', // the AWS region
    isDefault: false, // if true this location will be loaded by the application start
    isReadOnly: false, // if true the user interface of the application turns to read-only mode
    disableIndexing: false, // if true the search index will be persisted and loaded by default on location opening
    fullTextIndex: false, // activated the full-text search for TXT, MD and HTML files
    watchForChanges: false // activates the watching for changed files in the current location
  }
];
