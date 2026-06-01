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
  'url',
  'webloc',
  'website',
  'desktop',
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
AppConfig.FilenameTagFormats = {
  squareBrackets: 'squareBrackets',
  parentheses: 'parentheses',
  atSign: 'atSign',
};
AppConfig.ExtFilenameTagFormat = AppConfig.FilenameTagFormats.squareBrackets;
AppConfig.ExtDefaultMapBounds = {
  southWest: { lat: 56, lng: -13 },
  northEast: { lat: 29, lng: 50 },
};
AppConfig.ExtLightThemeLightColor = '#dcf3ec';
AppConfig.ExtLightThemeMainColor = '#1dd19f';
AppConfig.ExtDarkThemeLightColor = '#56454e';
AppConfig.ExtDarkThemeMainColor = '#ff9abe';
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
