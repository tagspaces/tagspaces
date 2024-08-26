window.ExtIsFirstRun = false;
window.ExtCheckForUpdatesOnStartup = false;
window.ExtUseGenerateThumbnails = true;
window.ExtLocations = [
  {
    uuid: '30575f19-c7fd-2333-fc67-a75db27rt5ba', // an unique id of the location
    type: '1', // 1 defines the locations a cloud based
    name: 'empty_folder', // the name of the location
    path: '/empty_folder', // the path to sub folder in the location
    endpointURL: 'http://localhost:4569',
    accessKeyId: 'S3RVER', // the access key of the user
    secretAccessKey: 'S3RVER', // the secret case of the user
    bucketName: 'supported-filestypes', // the name of the S3 bucket
    region: 'eu-central-1', // the AWS region
    isDefault: false, // if true this location will be loaded by the application start
    isReadOnly: false, // if true the user interface of the application turns to read-only mode
    disableIndexing: false, // if true the search index will be persisted and loaded by default on location opening
    fullTextIndex: true, // activated the full-text search for TXT, MD and HTML files
    watchForChanges: false, // activates the watching for changed files in the current location
    maxIndexAge: 600000,
    maxLoops: 2,
    creationDate: '2024-06-01T08:46:50.449Z',
  },
  {
    uuid: '40675f09-c7fd-2333-fc67-a75db27rt5bb', // an unique id of the location
    type: '1', // 1 defines the locations a cloud based
    name: 'supported-filestypes', // the name of the location
    path: '', // the path to sub folder in the location
    endpointURL: 'http://localhost:4569',
    accessKeyId: 'S3RVER', // the access key of the user
    secretAccessKey: 'S3RVER', // the secret case of the user
    bucketName: 'supported-filestypes', // the name of the S3 bucket
    region: 'eu-central-1', // the AWS region
    isDefault: true, // if true this location will be loaded by the application start
    isReadOnly: false, // if true the user interface of the application turns to read-only mode
    disableIndexing: false, // if true the search index will be persisted and loaded by default on location opening
    fullTextIndex: true, // activated the full-text search for TXT, MD and HTML files
    watchForChanges: false, // activates the watching for changed files in the current location
    maxIndexAge: 600000,
    maxLoops: 2,
    creationDate: '2024-06-01T08:46:50.449Z',
  },
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
