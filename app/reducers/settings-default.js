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
 * @flow
 */

import AppConfig from '../config';

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
  tagDelimiter: ' ',
  maxSearchResult: 1000,
  desktopMode: true,
  newHTMLFileContent:
    '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><style type="text/css">body{overflow:auto;width:100%;height:100%;font:13.34px Ubuntu,arial,clean,sans-serif;color:#000;line-height:1.4em;background-color:#fff;padding:15px}p{margin:1em 0;line-height:1.5em}table{font:100%;margin:1em}table th{border-bottom:1px solid #bbb;padding:.2em 1em}table td{border-bottom:1px solid #ddd;padding:.2em 1em}input[type=image],input[type=password],input[type=text],textarea{font:99% helvetica,arial,freesans,sans-serif}option,select{padding:0 .25em}optgroup{margin-top:.5em}code,pre{font:12px Monaco, Courier ,monospace}pre{margin:1em 0;font-size:12px;background-color:#eee;border:1px solid #ddd;padding:5px;line-height:1.5em;color:#444;overflow:auto;-webkit-box-shadow:rgba(0,0,0,.07) 0 1px 2px inset;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px}pre code{padding:0;font-size:12px;background-color:#eee;border:none}code{font-size:12px;background-color:#f8f8ff;color:#444;padding:0 .2em;border:1px solid #dedede}img{border:0;max-width:100%}abbr{border-bottom:none}a{color:#4183c4;text-decoration:none}a:hover{text-decoration:underline}a code,a:link code,a:visited code{color:#4183c4}h2,h3{margin:1em 0}h1,h2,h3,h4,h5,h6{border:0}h1{font-size:170%;border-top:4px solid #aaa;padding-top:.5em;margin-top:1.5em}h1:first-child{margin-top:0;padding-top:.25em;border-top:none}h2{font-size:150%;margin-top:1.5em;border-top:4px solid #e0e0e0;padding-top:.5em}h3{font-size:130%;margin-top:1em}h4{font-size:120%;margin-top:1em}h5{font-size:115%;margin-top:1em}h6{font-size:110%;margin-top:1em}hr{border:1px solid #ddd}ol,ul{margin:1em 0 1em 2em}ol li,ul li{margin-top:.5em;margin-bottom:.5em}ol ol,ol ul,ul ol,ul ul{margin-top:0;margin-bottom:0}blockquote{margin:1em 0;border-left:5px solid #ddd;padding-left:.6em;color:#555}dt{font-weight:700;margin-left:1em}dd{margin-left:2em;margin-bottom:1em}</style></head><body></body></html>',
  showUnixHiddenEntries: false,
  checkForUpdates: true,
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
  tagBackgroundColor: '#008000',
  currentTheme: 'light',
  enableGlobalKeyboardShortcuts: true,
  zoomFactor: 1,
  lastPublishedVersion: '',
  entryPropertiesSplitSize: 103,
  leftVerticalSplitSize: 350,
  mainVerticalSplitSize: '50%',
  supportedPerspectives: [
    {
      id: 'perspectiveList',
      name: 'List'
    }
  ],
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
      title: '台灣 (Chinese Taiwan BIG5)'
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
    }
  ],
  keyBindings: [
    {
      name: 'selectAll',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '+a',
    },
    {
      name: 'closeViewer',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '+w',
    },
    {
      name: 'saveDocument',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '+s',
    },
    {
      name: 'reloadDocument',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '+r',
    },
    {
      name: 'editDocument',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '+e',
    },
    {
      name: 'deleteDocument',
      command: 'del',
    },
    {
      name: 'showLocationManager',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '+1',
    },
    {
      name: 'showTagLibrary',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '+2',
    },
    {
      name: 'showSearch',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '+3',
    },
    {
      name: 'toggleShowHiddenEntries',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '+h',
    },
    {
      name: 'addRemoveTags',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '+t',
    },
    /* {
      name: 'propertiesDocument',
      command: 'alt+enter',
    }, */
    {
      name: 'nextDocument',
      command: [
        'right',
        'down'
      ],
    },
    {
      name: 'prevDocument',
      command: [
        'left',
        'up'
      ],
    },
    {
      name: 'showHelp',
      command: 'f1',
    },
    {
      name: 'reloadApplication',
      command: 'r a',
    },
    {
      name: 'toggleFullScreen',
      command: 'f11',
    },
    {
      name: 'openDevTools',
      command: 'f10',
    },
    {
      name: 'openSearch',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '+f',
    },
    {
      name: 'renameFile',
      command: 'f2',
    },
    {
      name: 'openEntry',
      command: 'enter',
    },
    {
      name: 'openParentDirectory',
      command: 'backspace',
    },
    {
      name: 'openFileExternally',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '+enter',
    },
    {
      name: 'zoomIn',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '+',
    },
    {
      name: 'zoomOut',
      command: (AppConfig.isMacLike ? 'command' : 'ctrl') + '-',
    }
  ],
  supportedFileTypes: [
    {
      type: 'bmp',
      viewer: '@tagspaces/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'c',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'clj',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'coffee',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'cpp',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'cs',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'css',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'desktop',
      viewer: '@tagspaces/url-viewer',
      color: ''
    },
    {
      type: 'eml',
      viewer: '@tagspaces/mhtml-viewer',
      color: ''
    },
    // {
    //   type: 'epub',
    //   viewer: '@tagspaces/ebook-viewer',
    //   color: ''
    // },
    {
      type: 'flac',
      viewer: '@tagspaces/media-player',
      color: ''
    },
    {
      type: 'gif',
      viewer: '@tagspaces/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'groovy',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'h',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'haxe',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'htm',
      viewer: '@tagspaces/html-viewer',
      editor: '@tagspaces/html-editor',
      color: '#beefed'
    },
    {
      type: 'html',
      viewer: '@tagspaces/html-viewer',
      editor: '@tagspaces/html-editor',
      color: ''
    },
    {
      type: 'ico',
      viewer: '@tagspaces/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'java',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'jpeg',
      viewer: '@tagspaces/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'jpg',
      viewer: '@tagspaces/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'js',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: '#d7ff78'
    },
    {
      type: 'jsm',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'json',
      viewer: '@tagspaces/json-editor',
      editor: '@tagspaces/json-editor',
      color: ''
    },
    {
      type: 'less',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'lua',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'm4a',
      viewer: '@tagspaces/media-player',
      color: '#e5c3ca'
    },
    {
      type: 'm4p',
      viewer: '@tagspaces/media-player',
      color: ''
    },
    {
      type: 'm4v',
      viewer: '@tagspaces/media-player',
      color: ''
    },
    {
      type: 'markdown',
      viewer: '@tagspaces/md-viewer',
      editor: '@tagspaces/text-editor',
      color: '#beefed'
    },
    {
      type: 'md',
      viewer: '@tagspaces/md-viewer',
      editor: '@tagspaces/text-editor',
      color: '#beefed'
    },
    {
      type: 'mdown',
      viewer: '@tagspaces/md-viewer',
      editor: '@tagspaces/text-editor',
      color: '#beefed'
    },
    {
      type: 'mdwn',
      viewer: '@tagspaces/md-viewer',
      editor: '@tagspaces/text-editor',
      color: '#beefed'
    },
    {
      type: 'mht',
      viewer: '@tagspaces/mhtml-viewer',
      color: ''
    },
    {
      type: 'mhtml',
      viewer: '@tagspaces/mhtml-viewer',
      color: ''
    },
    {
      type: 'mkd',
      viewer: '@tagspaces/md-viewer',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'ml',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'mli',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'mp3',
      viewer: '@tagspaces/media-player',
      color: '#e5c3ca'
    },
    {
      type: 'mp4',
      viewer: '@tagspaces/media-player',
      color: '#efc0b8'
    },
    {
      type: 'oga',
      viewer: '@tagspaces/media-player',
      color: ''
    },
    {
      type: 'ogg',
      viewer: '@tagspaces/media-player',
      color: '#e5c3ca'
    },
    {
      type: 'ogv',
      viewer: '@tagspaces/media-player',
      color: '#efc0b8'
    },
    {
      type: 'ogx',
      viewer: '@tagspaces/media-player',
      color: ''
    },
    {
      type: 'opus',
      viewer: '@tagspaces/media-player',
      color: ''
    },
    {
      type: 'pdf',
      viewer: '@tagspaces/pdf-viewer',
      color: '#f5897f'
    },
    {
      type: 'php',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'pl',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'png',
      viewer: '@tagspaces/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'psd',
      viewer: '@tagspaces/image-viewer'
    },
    {
      type: 'py',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'rb',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'rtf',
      viewer: '@tagspaces/rtf-viewer',
      color: ''
    },
    {
      type: 'sh',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'spx',
      viewer: '@tagspaces/media-player',
      color: ''
    },
    {
      type: 'sql',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'svg',
      viewer: '@tagspaces/image-viewer',
      editor: '@tagspaces/text-editor',
      color: '#9fd5ba'
    },
    {
      type: 'tif',
      viewer: '@tagspaces/image-viewer'
    },
    {
      type: 'tiff',
      viewer: '@tagspaces/image-viewer'
    },
    {
      type: 'txt',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor'
    },
    {
      type: 'url',
      viewer: '@tagspaces/url-viewer',
      color: ''
    },
    {
      type: 'wav',
      viewer: '@tagspaces/media-player',
      color: '#e5c3ca'
    },
    {
      type: 'wave',
      viewer: '@tagspaces/media-player',
      color: ''
    },
    {
      type: 'webm',
      viewer: '@tagspaces/media-player',
      color: '#efc0b8'
    },
    {
      type: 'webp',
      viewer: '@tagspaces/image-viewer',
      color: '#9fd5ba'
    },
    {
      type: 'website',
      viewer: '@tagspaces/url-viewer',
      color: ''
    },
    {
      type: 'xhtml',
      viewer: '@tagspaces/html-viewer',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'xml',
      viewer: '@tagspaces/text-editor',
      editor: '@tagspaces/text-editor',
      color: ''
    },
    {
      type: 'zip',
      viewer: '@tagspaces/archive-viewer',
      color: '#ffe766'
    },
    {
      type: 'docx',
      viewer: '@tagspaces/document-viewer',
      color: '#2196f3'
    },
    /* {
      type: 'xlsx',
      viewer: '@tagspaces/document-viewer',
      color: '#b2f30e'
    } */
  ]
};
