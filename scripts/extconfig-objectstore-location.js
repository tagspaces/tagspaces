window.ExtIsFirstRun = false;
window.ExtCheckForUpdatesOnStartup = false;
window.ExtUseGenerateThumbnails = true;
window.ExtLocationsReadOnly = false;
window.ExtSaveLocationsInBrowser = true;
window.ExtLocations = [
  {
    uuid: '40565f09-c7fd-2333-fc67-a75db27rt5ba', // an unique id of the location
    type: '1', // 1 defines the locations a cloud based
    name: 'supported-filestypes-s3', // the name of the location
    path: '', // the path to sub folder in the location
    endpointURL: 'http://127.0.0.1:9000',
    accessKeyId: 'minioadmin', // the access key of the user
    secretAccessKey: 'minioadmin', // the secret case of the user
    bucketName: 'supported-filestypes', // the name of the S3 bucket
    region: '', // the AWS region
    isDefault: true, // if true this location will be loaded by the application start
    isReadOnly: false, // if true the user interface of the application turns to read-only mode
    disableIndexing: false, // if true the search index will be persisted and loaded by default on location opening
    fullTextIndex: false, // activated the full-text search for TXT, MD and HTML files
    watchForChanges: false, // activates the watching for changed files in the current location
    maxIndexAge: 600000,
    maxLoops: 2,
    creationDate: '2024-06-01T08:46:50.449Z',
  },
  {
    uuid: '30565f09-c7fd-2333-fc67-a75db27rt5ba', // an unique id of the location
    type: '0', // 1 defines the locations a cloud based
    name: 'supported-filestypes', // the name of the location
    path: './tests/testdata-tmp/file-structure/supported-filestypes', // the path to sub folder in the location
    // accessKeyId: 'your_access_key', // the access key of the user
    // secretAccessKey: 'your_secret_key', // the secret case of the user
    // bucketName: 'demo-bucket', // the name of the S3 bucket
    // region: 'eu-central-1', // the AWS region
    isDefault: false, // if true this location will be loaded by the application start
    isReadOnly: false, // if true the user interface of the application turns to read-only mode
    disableIndexing: false, // if true the search index will be persisted and loaded by default on location opening
    fullTextIndex: false, // activated the full-text search for TXT, MD and HTML files
    watchForChanges: false, // activates the watching for changed files in the current location
  },
];
