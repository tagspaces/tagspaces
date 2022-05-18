/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import AppConfig from '../config';
import keyBindings from '-/reducers/keybindings-default';
import { PerspectiveIDs } from '-/perspectives';

let desktopMode = !AppConfig.isMobile;
if (window.ExtDisplayMode && window.ExtDisplayMode === 'mobile') {
  desktopMode = false;
} else if (window.ExtDisplayMode && window.ExtDisplayMode === 'desktop') {
  desktopMode = true;
}

export function findAvailableExtensions() {
  // TODO Search in users tagspaces folder
  // Search in the installation folder
  const extensionsFound = [
    {
      extensionId: '@tagspaces/extensions/archive-viewer',
      extensionName: 'Archive Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/extensions/3d-viewer',
      extensionName: '3D Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/extensions/document-viewer',
      extensionName: 'Documents Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/extensions/ebook-viewer',
      extensionName: 'eBook Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/extensions/html-editor',
      extensionName: 'HTML Editor',
      extensionType: 'editor'
    },
    {
      extensionId: '@tagspaces/extensions/html-viewer',
      extensionName: 'HTML Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/extensions/image-viewer',
      extensionName: 'Image Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/extensions/json-editor',
      extensionName: 'JSON Viewer',
      extensionType: 'editor'
    },
    {
      extensionId: '@tagspaces/extensions/md-viewer',
      extensionName: 'MarkDown Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/extensions/md-editor/build',
      extensionName: 'MarkDown Editor',
      extensionType: 'editor'
    },
    {
      extensionId: '@tagspaces/extensions/media-player',
      extensionName: 'Media Player',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/extensions/mhtml-viewer',
      extensionName: 'MHTML Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/extensions/pdf-viewer',
      extensionName: 'PDF Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/extensions/rtf-viewer',
      extensionName: 'RTF Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/extensions/spreadsheet-viewer',
      extensionName: 'Spreadsheet Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/extensions/text-editor',
      extensionName: 'Text Editor',
      extensionType: 'editor'
    },
    {
      extensionId: '@tagspaces/extensions/text-viewer',
      extensionName: 'Text Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/extensions/url-viewer',
      extensionName: 'URL Viewer',
      extensionType: 'viewer'
    }
  ];
  return extensionsFound;
}

export default {
  settingsVersion: 3,
  isLoading: false,
  error: null,
  userId: null,
  loggedIn: false,
  isOnline: false,
  appDataPath: '',
  contentHash: '',
  isUpdateInProgress: false,
  isUpdateAvailable: false,
  enableWS: true,
  warningOpeningFilesExternally: true,
  tagDelimiter: ' ',
  maxSearchResult: 1000,
  desktopMode,
  saveTagInLocation: false,
  newHTMLFileContent:
    '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><style type="text/css">body{overflow:auto;width:100%;height:100%;font:13.34px Ubuntu,arial,clean,sans-serif;color:#000;line-height:1.4em;background-color:#fff;padding:15px}p{margin:1em 0;line-height:1.5em}table{font:100%;margin:1em}table th{border-bottom:1px solid #bbb;padding:.2em 1em}table td{border-bottom:1px solid #ddd;padding:.2em 1em}input[type=image],input[type=password],input[type=text],textarea{font:99% helvetica,arial,freesans,sans-serif}option,select{padding:0 .25em}optgroup{margin-top:.5em}code,pre{font:12px Monaco, Courier ,monospace}pre{margin:1em 0;font-size:12px;background-color:#eee;border:1px solid #ddd;padding:5px;line-height:1.5em;color:#444;overflow:auto;-webkit-box-shadow:rgba(0,0,0,.07) 0 1px 2px inset;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px}pre code{padding:0;font-size:12px;background-color:#eee;border:none}code{font-size:12px;background-color:#f8f8ff;color:#444;padding:0 .2em;border:1px solid #dedede}img{border:0;max-width:100%}abbr{border-bottom:none}a{color:#4183c4;text-decoration:none}a:hover{text-decoration:underline}a code,a:link code,a:visited code{color:#4183c4}h2,h3{margin:1em 0}h1,h2,h3,h4,h5,h6{border:0}h1{font-size:170%;border-top:4px solid #aaa;padding-top:.5em;margin-top:1.5em}h1:first-child{margin-top:0;padding-top:.25em;border-top:none}h2{font-size:150%;margin-top:1.5em;border-top:4px solid #e0e0e0;padding-top:.5em}h3{font-size:130%;margin-top:1em}h4{font-size:120%;margin-top:1em}h5{font-size:115%;margin-top:1em}h6{font-size:110%;margin-top:1em}hr{border:1px solid #ddd}ol,ul{margin:1em 0 1em 2em}ol li,ul li{margin-top:.5em;margin-bottom:.5em}ol ol,ol ul,ul ol,ul ul{margin-top:0;margin-bottom:0}blockquote{margin:1em 0;border-left:5px solid #ddd;padding-left:.6em;color:#555}dt{font-weight:700;margin-left:1em}dd{margin-left:2em;margin-bottom:1em}</style></head><body></body></html>',
  showUnixHiddenEntries: false,
  checkForUpdates: true,
  reorderTags: false,
  coloredFileExtension: false,
  loadsLocationMetaData: false,
  searchInSubfolders: true,
  watchCurrentDirectory: false,
  firstRun: true,
  lastOpenedDirectory: '',
  showWarningRecursiveScan: true,
  calculateTags: false,
  loadLocationMeta: true,
  showMainMenu: false,
  lastOpenedLocation: '',
  useDefaultLocation: false, // TODO for remove
  persistTagsInSidecarFile: false, // old name writeMetaToSidecarFile -> persistTagsInSidecarFile
  addTagsToLibrary: true,
  interfaceLanguage: 'en',
  useTrashCan: true,
  useOCR: false,
  useTextExtraction: false,
  useGenerateThumbnails: true,
  tagTextColor: 'white',
  tagBackgroundColor: '#61DD61',
  currentTheme: 'light',
  geoTaggingFormat: 'pluscodes',
  defaultPerspective: PerspectiveIDs.GRID,
  enableGlobalKeyboardShortcuts: true,
  zoomFactor: 1,
  lastPublishedVersion: '',
  entrySplitSize: '45%', // AppConfig.isElectron ? '560px' : '360px',
  mainVSplitSize: '50%',
  supportedGeoTagging: ['pluscodes', 'mgrs'],
  supportedThemes: ['light', 'dark'],
  supportedLanguages: [
    {
      iso: 'en',
      title: 'English'
    },
    {
      iso: 'de_DE',
      title: 'Deutsch (German)'
    },
    {
      iso: 'it',
      title: 'Italiano (Italian)'
    },
    {
      iso: 'zh_CN',
      title: '中国的 (Chinese)'
    },
    {
      iso: 'bg',
      title: 'Български (Bulgarian)'
    },
    {
      iso: 'ja',
      title: '日本の (Japanese)'
    },
    {
      iso: 'pt_BR',
      title: 'Português (Brazil)'
    },
    {
      iso: 'pt_PT',
      title: 'Português (Portugal)'
    },
    {
      iso: 'fr',
      title: 'Français (French)'
    },
    {
      iso: 'sk_SK',
      title: 'Slovenský (Slovak)'
    },
    {
      iso: 'es',
      title: 'Español (Spanish)'
    },
    {
      iso: 'uk',
      title: 'Український (Ukrainian)'
    },
    {
      iso: 'ru',
      title: 'Русский (Russian)'
    },
    {
      iso: 'tr',
      title: 'Türk (Turkish)'
    },
    {
      iso: 'cs',
      title: 'Čeština (Czech)'
    },
    {
      iso: 'ca',
      title: 'Catalan (Català)'
    },
    {
      iso: 'ko',
      title: '한국의 (Korean)'
    },
    {
      iso: 'el',
      title: 'ελληνικά (Greek)'
    },
    {
      iso: 'sv',
      title: 'svenska (Swedish)'
    },
    {
      iso: 'nl_NL',
      title: 'Nederlands (Dutch)'
    },
    {
      iso: 'zh_TW',
      title: '台灣 (Chinese Taiwan)'
    },
    {
      iso: 'hu',
      title: 'Magyar (Hungarian)'
    },
    {
      iso: 'id_ID',
      title: 'bahasa Indonesia (Indonesian)'
    },
    {
      iso: 'hy',
      title: 'հայերեն (Armenian)'
    },
    {
      iso: 'nb',
      title: 'Bokmål (Norwegian)'
    },
    {
      iso: 'fr_CA',
      title: 'français canadien (Canadian French)'
    }
  ],
  keyBindings: keyBindings(AppConfig.isMacLike),
  supportedFileTypes: [
    {
      type: 'bmp',
      viewer: '@tagspaces/extensions/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'c',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'cpp',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'cs',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'css',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'desktop',
      viewer: '@tagspaces/extensions/url-viewer',
      color: ''
    },
    {
      type: 'eml',
      viewer: '@tagspaces/extensions/mhtml-viewer',
      color: ''
    },
    {
      type: 'epub',
      viewer: '@tagspaces/extensions/ebook-viewer',
      color: ''
    },
    {
      type: 'flac',
      viewer: '@tagspaces/extensions/media-player',
      color: ''
    },
    {
      type: 'acc',
      viewer: '@tagspaces/extensions/media-player',
      color: ''
    },
    {
      type: 'gif',
      viewer: '@tagspaces/extensions/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'h',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'htm',
      viewer: '@tagspaces/extensions/html-viewer',
      editor: '@tagspaces/extensions/html-editor',
      color: ''
    },
    {
      type: 'html',
      viewer: '@tagspaces/extensions/html-viewer',
      editor: '@tagspaces/extensions/html-editor',
      color: ''
    },
    {
      type: 'ico',
      viewer: '@tagspaces/extensions/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'java',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'jpeg',
      viewer: '@tagspaces/extensions/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'jpg',
      viewer: '@tagspaces/extensions/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'jif',
      viewer: '@tagspaces/extensions/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'jfif',
      viewer: '@tagspaces/extensions/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'js',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: '#d7ff78'
    },
    {
      type: 'jsm',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'json',
      viewer: '@tagspaces/extensions/json-editor',
      editor: '@tagspaces/extensions/json-editor',
      color: ''
    },
    {
      type: 'less',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'mkv',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'md',
      viewer: '@tagspaces/extensions/md-editor/build',
      editor: '@tagspaces/extensions/md-editor/build',
      color: '#beefed'
    },
    {
      type: 'mdx',
      viewer: '@tagspaces/extensions/md-editor/build',
      editor: '@tagspaces/extensions/text-editor',
      color: '#beefed'
    },
    {
      type: 'mht',
      viewer: '@tagspaces/extensions/mhtml-viewer',
      color: ''
    },
    {
      type: 'mhtml',
      viewer: '@tagspaces/extensions/mhtml-viewer',
      color: ''
    },
    {
      type: 'ml',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'mp3',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'lrv',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'mp4',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'm4a',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'oga',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'ogg',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'ogv',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'ogx',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'opus',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'pdf',
      viewer: '@tagspaces/extensions/pdf-viewer',
      color: '#f5897f'
    },
    {
      type: 'php',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'pl',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'png',
      viewer: '@tagspaces/extensions/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'psd',
      viewer: '@tagspaces/extensions/image-viewer'
    },
    {
      type: 'py',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'rb',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'rtf',
      viewer: '@tagspaces/extensions/rtf-viewer',
      color: ''
    },
    {
      type: 'sh',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'spx',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'sql',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'svg',
      viewer: '@tagspaces/extensions/image-viewer',
      editor: '@tagspaces/extensions/text-editor',
      color: '#9fd5ba'
    },
    {
      type: 'tif',
      viewer: '@tagspaces/extensions/image-viewer'
    },
    {
      type: 'tiff',
      viewer: '@tagspaces/extensions/image-viewer'
    },
    {
      type: 'txt',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor'
    },
    {
      type: 'url',
      viewer: '@tagspaces/extensions/url-viewer',
      color: ''
    },
    {
      type: 'wav',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'wave',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'webm',
      viewer: '@tagspaces/extensions/media-player',
      color: '#c5e4f9'
    },
    {
      type: 'webp',
      viewer: '@tagspaces/extensions/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'website',
      viewer: '@tagspaces/extensions/url-viewer',
      color: ''
    },
    {
      type: 'xhtml',
      viewer: '@tagspaces/extensions/html-viewer',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'xml',
      viewer: '@tagspaces/extensions/text-editor',
      editor: '@tagspaces/extensions/text-editor',
      color: ''
    },
    {
      type: 'zip',
      viewer: '@tagspaces/extensions/archive-viewer',
      color: '#ffe766'
    },
    {
      type: 'docx',
      viewer: '@tagspaces/extensions/document-viewer',
      color: '#2196f3'
    },
    {
      type: 'xlsx',
      viewer: '@tagspaces/extensions/spreadsheet-viewer',
      color: '#b2f30e'
    },
    {
      type: 'xls',
      viewer: '@tagspaces/extensions/spreadsheet-viewer',
      color: '#b2f30e'
    },
    {
      type: 'csv',
      viewer: '@tagspaces/extensions/spreadsheet-viewer',
      color: '#b2f30e'
    },
    {
      type: 'ods',
      viewer: '@tagspaces/extensions/spreadsheet-viewer',
      color: '#b2f30e'
    }
  ],
  mapTileServers: [
    {
      uuid: '1b25af5e-dd15-4415-83cb-7eb53d15e336',
      name: 'Standard',
      serverURL: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
      serverInfo:
        '<b>Leaflet</b> | Map data: &copy; <b>https://openstreetmap.org/copyright</b> contributors, <b>CC-BY-SA</b>, Imagery © <b>Mapbox</b>'
    },
    {
      uuid: '5b4be90f-3c7b-4157-8ee3-2c7a3e7cf827',
      name: 'Topographic',
      serverURL: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      serverInfo:
        '<b>Leaflet</b> | Map data: &copy; <b>https://openstreetmap.org/copyright</b> contributors, SRTM | Map style: &copy; <b>https://opentopomap.org</b> - OpenTopoMap (<b>https://creativecommons.org/licenses/by-sa/3.0/</b> - CC-BY-SA'
    }
  ]
};
