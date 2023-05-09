window.ExtIsFirstRun = true;
window.ExtCheckForUpdatesOnStartup = false;
window.ExtUseGenerateThumbnails = true;
window.ExtLocations = [
  {
    uuid: '30565f09-c7fd-2333-fc67-a75db27rt5ba', // an unique id of the location
    type: '1', // 1 defines the locations a cloud based
    name: 'supported-filestypes', // the name of the location
    path: '', // the path to sub folder in the location
    accessKeyId: 'minioadmin', // the access key of the user
    secretAccessKey: 'minioadmin', // the secret case of the user
    bucketName: 'supported-filestypes', // the name of the S3 bucket
    endpointURL: 'http://127.0.0.1:9000', // the name of the S3 bucket
    // region: 'eu-central-1', // the AWS region
    isDefault: false, // if true this location will be loaded by the application start
    isReadOnly: false, // if true the user interface of the application turns to read-only mode
    disableIndexing: false, // if true the search index will be persisted and loaded by default on location opening
    fullTextIndex: false, // activated the full-text search for TXT, MD and HTML files
    watchForChanges: false // activates the watching for changed files in the current location
  }
];
/*window.ExtSearches = [
  {
    uuid: '16474266-0445-4f47-b092-25b884448d04', // an unique id of the search
    title: 'search by tag 1star', // the name of the search
    tagsAND: [
      {
        id: '6040a658-5e95-44da-acd0-b48d7aade9ce',
        type: 'plain',
        title: '1star',
        color: '#ffcc24',
        textcolor: '#ffffff'
      }
    ], // the tagsAND
    searchBoxing: 'location',
    searchType: 'semistrict',
    fileTypes: ['files'],
    maxSearchResults: 1000,
    forceIndexing: false
  }
];*/
