import { AppConfig } from '@tagspaces/tagspaces-common';

AppConfig.aiSupportedFiletypes = {
  text: ['pdf', 'txt', 'md', 'html'],
  image: ['jpg', 'jpeg', 'png'],
};
AppConfig.editableFiles = [
  'txt',
  'md',
  'markdown',
  'mdown',
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
AppConfig.SearchTypeGroups =
  typeof window !== 'undefined' && window.ExtSearchTypeGroups !== undefined
    ? window.ExtSearchTypeGroups
    : {
        any: [''],
        images: [
          'jpg',
          'jpeg',
          'jfif',
          'jif',
          'jiff',
          'png',
          'gif',
          'svg',
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
        notes: ['md', 'mdown', 'txt', 'html'],
        documents: [
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
        audio: ['ogg', 'mp3', 'wav', 'wave', 'flac', 'acc', 'm4a', 'opus'],
        video: ['ogv', 'mp4', 'webm', 'm4v', 'mkv', 'avi', '3gp', '3g2', 'mov'],
        archives: ['zip', 'rar', 'gz', 'tgz', 'arc', '7z'],
        bookmarks: ['url', 'lnk', 'sym', 'desktop', 'website'],
        ebooks: [
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
        emails: ['eml', 'msg'],
        folders: ['folders'],
        files: ['files'],
        untagged: ['untagged'],
      };
AppConfig.autoSaveInterval = 40000;
AppConfig.maxCollectedTag = 500;
AppConfig.maxLoops = 2;
AppConfig.defaultFolderColor = '#a466aa'; // 'gray';
AppConfig.defaultFileColor = '#33b5be';
AppConfig.defaultCSSRadius = 10;
AppConfig.defaultSpaceBetweenButtons = 10;
AppConfig.aiFolder = 'ai';

export default AppConfig;
