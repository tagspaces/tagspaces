window.ExtIsFirstRun = false;
window.ExtLocations = [
  // an array containing one or many locations
  {
    uuid: '10565f09-c7fd-2333-fc67-a75db27rt5ba', // an inique id of the location
    type: '0', // 1 defines the locations a cloud based
    name: 'root-location', // the name of the location
    paths: ['/'], // the path to sub folder in the location
    // accessKeyId: 'your_access_key', // the access key of the user
    // secretAccessKey: 'your_secret_key', // the secret case of the user
    // bucketName: 'demo-bucket', // the name of the S3 bucket
    // region: 'eu-central-1', // the AWS region
    isDefault: false, // if true this location will be loaded by the application start
    isReadOnly: false, // if true the user interface of the application turns to read-only mode
    persistIndex: false, // if true the search index will be persisted and loaded by default on location opening
    fullTextIndex: false, // activated the full-text search for TXT, MD and HTML files
    watchForChanges: false // activates the watching for changed files in the current location
  },
  {
    uuid: '20565f09-c7fd-2333-fc67-a75db27rt5ba', // an inique id of the location
    type: '1', // 1 defines the locations a cloud based
    name: 'readonly-S3-location', // the name of the location
    paths: ['demo'], // the path to sub folder in the location
    accessKeyId: 'AKIA22AFB5B3R23AH2OR', // the access key of the user
    secretAccessKey: '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', // the secret case of the user
    bucketName: 'tagspaces-demo', // the name of the S3 bucket
    region: 'eu-central-1', // the AWS region
    isDefault: false, // if true this location will be loaded by the application start
    isReadOnly: true, // if true the user interface of the application turns to read-only mode
    persistIndex: false, // if true the search index will be persisted and loaded by default on location opening
    fullTextIndex: false, // activated the full-text search for TXT, MD and HTML files
    watchForChanges: false // activates the watching for changed files in the current location
  },
  {
    uuid: '30565f09-c7fd-2333-fc67-a75db27rt5ba', // an inique id of the location
    type: '0', // 1 defines the locations a cloud based
    name: 'supported-filestypes', // the name of the location
    paths: ['./testdata/file-structure/supported-filestypes'], // the path to sub folder in the location
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
