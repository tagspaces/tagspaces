import { AppConfig } from '@tagspaces/tagspaces-common';

AppConfig.editableFiles = [
  'txt',
  'md',
  'markdown',
  'mdown',
  'mmdown',
  'mmd',
  'html',
  'htm',
  'coffee',
  'c',
  'cpp',
  'css',
  'groovy',
  'haxe',
  'xml',
  'java',
  'js',
  'ts',
  'tsx',
  'json',
  'less',
  'php',
  'pl',
  'py',
  'rb',
  'ini',
  'sh',
  'sql',
];

AppConfig.aiSupportedFiletypes = {
  text: ['pdf', ...AppConfig.editableFiles],
  image: ['jpg', 'jpeg', 'png'],
};
AppConfig.SearchTypes = {
  any: 'any',
  images: 'images',
  notes: 'notes',
  documents: 'documents',
  audio: 'audio',
  video: 'video',
  archives: 'archives',
  bookmarks: 'bookmarks',
  ebooks: 'ebooks',
  emails: 'emails',
  folders: 'folders',
  files: 'files',
  untagged: 'untagged',
};
AppConfig.SearchSizes = {
  empty: { key: 'sizeEmpty', thresholdBytes: 0 }, // empty
  tiny: { key: 'sizeTiny', thresholdBytes: 10 * 1024 }, // 1KB - 10KB
  verySmall: { key: 'sizeVerySmall', thresholdBytes: 100 * 1024 }, // 10KB - 100KB
  small: { key: 'sizeSmall', thresholdBytes: 1024 * 1024 }, // 100KB - 1MB
  medium: { key: 'sizeMedium', thresholdBytes: 100 * 1024 * 1024 }, // 1MB - 50MB
  large: { key: 'sizeLarge', thresholdBytes: 1024 * 1024 * 1024 }, // 50MB - 1GB
  huge: { key: 'sizeHuge', thresholdBytes: 1024 * 1024 * 1024 }, // over 1GB
};
// periodSpan is currently not used
AppConfig.SearchTimePeriods = {
  today: { key: 'today', periodSpan: 86400000 },
  yesterday: { key: 'yesterday', periodSpan: 172800000 }, // 48 hours
  past7Days: { key: 'past7Days', periodSpan: 604800000 },
  past30Days: { key: 'past30Days', periodSpan: 2592000000 },
  past6Months: { key: 'past6Months', periodSpan: 15778476000 },
  pastYear: { key: 'pastYear', periodSpan: 31556952000 },
  moreThanYear: { key: 'moreThanYear', periodSpan: 31556952001 },
};
AppConfig.SearchTypeGroups =
  typeof window !== 'undefined' && window.ExtSearchTypeGroups !== undefined
    ? window.ExtSearchTypeGroups
    : {
        [AppConfig.SearchTypes.any]: [''],
        [AppConfig.SearchTypes.images]: [
          'jpg',
          'jpeg',
          'jfif',
          'jif',
          'jiff',
          'png',
          'gif',
          'svg',
          'heic',
          'webp',
          'bmp',
          'tga',
          'tif',
          'tiff',
          'nef',
          'cr2',
          'dng',
          'psd',
          'avif',
          'nef',
        ],
        [AppConfig.SearchTypes.notes]: ['md', 'mdown', 'txt', 'html', 'mdx'],
        [AppConfig.SearchTypes.documents]: [
          'pdf',
          'doc',
          'docx',
          'xls',
          'xlsx',
          'odt',
          'ods',
          'odp',
          'pptx',
          'numbers',
          'potx',
          'sldx',
          'dotx',
        ],
        [AppConfig.SearchTypes.audio]: [
          'ogg',
          'mp3',
          'wav',
          'wave',
          'flac',
          'acc',
          'm4a',
          'm4b',
          'm4p',
          'opus',
          'aiff',
          'speex',
          'wma',
        ],
        [AppConfig.SearchTypes.video]: [
          'ogv',
          'mp4',
          'webm',
          'm4v',
          'mkv',
          'avi',
          '3gp',
          '3g2',
          'mov',
        ],
        [AppConfig.SearchTypes.archives]: [
          'zip',
          'rar',
          'gz',
          'tgz',
          'arc',
          '7z',
        ],
        [AppConfig.SearchTypes.bookmarks]: [
          'url',
          'lnk',
          'sym',
          'desktop',
          'website',
        ],
        [AppConfig.SearchTypes.ebooks]: [
          'epub',
          'mobi',
          'azw',
          'prc',
          'azw1',
          'azw3',
          'azw4',
          'azw8',
          'azk',
        ],
        [AppConfig.SearchTypes.emails]: ['eml', 'msg'],
        [AppConfig.SearchTypes.folders]: ['folders'],
        [AppConfig.SearchTypes.files]: ['files'],
        [AppConfig.SearchTypes.untagged]: ['untagged'],
      };
AppConfig.autoSaveInterval = 40000;
AppConfig.maxCollectedTag = 500;
AppConfig.maxLoops = 2;
AppConfig.defaultFolderColor = '#a466aa'; // 'gray';
AppConfig.defaultFileColor = '#33b5be';
AppConfig.defaultCSSRadius = '10px';
AppConfig.defaultSpaceBetweenButtons = '10px';
AppConfig.aiFolder = 'ai';
AppConfig.aiChatFileName = 'tsc.json';
AppConfig.sidecarRevisionExtension = '.meta';
AppConfig.defaultMapBounds =
  typeof window !== 'undefined' && window.ExtDefaultMapBounds !== undefined
    ? window.ExtDefaultMapBounds
    : {
        southWest: { lat: 56, lng: -13 },
        northEast: { lat: 29, lng: 50 },
      };

AppConfig.showTSLogo =
  typeof window !== 'undefined' && window.ExtShowTSLogo !== undefined
    ? window.ExtShowTSLogo
    : true;

AppConfig.showTSVersion =
  typeof window !== 'undefined' && window.ExtShowTSVersion !== undefined
    ? window.ExtShowTSVersion
    : true;

AppConfig.defaultTemplate =
  typeof window !== 'undefined' && window.ExtDefaultFileTemplate !== undefined
    ? window.ExtDefaultFileTemplate
    : {
        id: 'default',
        name: 'Default',
        content: '{createdInApp} ({date}) {author}',
        fileNameTmpl: 'note[{timestamp}]',
      };

AppConfig.hideProFeatures =
  typeof window !== 'undefined' &&
  (window.ExtHideProFeatures !== undefined ? window.ExtHideProFeatures : false);

AppConfig.backgroundColors = [
  'transparent',
  '#00000044',
  '#ac725e44',
  '#f83a2244',
  '#ff753744',
  '#ffad4644',
  '#42d69244',
  '#00800044',
  '#7bd14844',
  '#fad16544',
  '#92e1c044',
  '#9fe1e744',
  '#9fc6e744',
  '#4986e744',
  '#9a9cff44',
  '#c2c2c244',
  '#cca6ac44',
  '#f691b244',
  '#cd74e644',
  '#a47ae244',
  '#845EC260',
  '#D65DB160',
  '#FF6F9160',
  '#FF967160',
  '#FFC75F60',
  '#F9F87160',
  '#008E9B60',
  '#008F7A60',
  'linear-gradient(43deg, rgb(65, 88, 208) 0%, rgb(200, 80, 190) 45%, rgb(255, 204, 112) 100%)',
  'linear-gradient( 102deg,  rgba(253,189,85,1) 8%, rgba(249,131,255,1) 100% )',
  'radial-gradient( circle farthest-corner at 1.4% 2.8%,  rgba(240,249,249,1) 0%, rgba(182,199,226,1) 100% )',
  'linear-gradient( 110deg,  rgba(48,207,208,1) 11.2%, rgba(51,8,103,1) 90% )',
];

export default AppConfig;
