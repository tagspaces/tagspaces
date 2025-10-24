/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import { extensionsFound, supportedFileTypes } from '-/extension-config';
import { PerspectiveIDs } from '-/perspectives';
import keyBindings from '-/reducers/keybindings-default';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';

let desktopMode = !AppConfig.isMobile;
if (window.ExtDisplayMode && window.ExtDisplayMode === 'mobile') {
  desktopMode = false;
} else if (window.ExtDisplayMode && window.ExtDisplayMode === 'desktop') {
  desktopMode = true;
}
let checkForUpdates = true;
if (window.ExtCheckForUpdatesOnStartup !== undefined) {
  checkForUpdates = window.ExtCheckForUpdatesOnStartup;
}
let filenameTagPlacedAtEnd = true;
if (window.ExtFilenameTagPlacedAtEnd !== undefined) {
  filenameTagPlacedAtEnd = window.ExtFilenameTagPlacedAtEnd;
}
let useOnlyTagsFromTagLibrary = false;
if (window.ExtUseOnlyTagsFromTagLibrary !== undefined) {
  useOnlyTagsFromTagLibrary = window.ExtUseOnlyTagsFromTagLibrary;
}

let author = '';
if (window.ExtAuthor !== undefined) {
  author = window.ExtAuthor;
} else if (AppConfig.isElectron) {
  try {
    author = window.electronIO.ipcRenderer.getSync('getAuthor');
  } catch (err) {
    console.error('Error retrieving author:', err);
  }
}

export default {
  //isLoading: false,
  error: null,
  userId: null,
  loggedIn: false,
  isOnline: false,
  appDataPath: '',
  contentHash: '',
  isUpdateInProgress: false,
  isUpdateAvailable: false,
  enableWS: AppConfig.isElectron,
  warningOpeningFilesExternally: true,
  tagDelimiter: AppConfig.tagDelimiter,
  maxSearchResult: 1000,
  desktopMode,
  devMode: window.ExtDevMode ? window.ExtDevMode : false,
  saveTagInLocation:
    typeof window.ExtUseLocationTags === 'undefined'
      ? false
      : window.ExtUseLocationTags,
  newHTMLFileContent:
    '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body></body></html>',
  showUnixHiddenEntries: false,
  entryContainerTab: 0,
  entryPropertiesHeight: 100,
  checkForUpdates,
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
  filenameTagPlacedAtEnd,
  addTagsToLibrary: true,
  interfaceLanguage: 'en',
  useTrashCan: true,
  useOCR: false,
  useTextExtraction: false,
  useGenerateThumbnails: true,
  useOnlyTagsFromTagLibrary,
  tagTextColor: 'white',
  tagBackgroundColor: '#61DD61',
  currentTheme: 'light',
  currentRegularTheme: 'legacy',
  currentDarkTheme: 'darklegacy',
  geoTaggingFormat: 'pluscodes',
  defaultPerspective: PerspectiveIDs.GRID,
  enableGlobalKeyboardShortcuts: false,
  zoomFactor: 1,
  lastPublishedVersion: '',
  entrySplitSize: '45%', // AppConfig.isElectron ? '560px' : '360px',
  mainVSplitSize: '50%',
  supportedGeoTagging: ['pluscodes', 'mgrs'],
  supportedThemes: ['light', 'dark', 'system'],
  supportedRegularThemes: ['legacy', 'newlight'],
  supportedDarkThemes: ['darklegacy', 'darkblue', 'dracula'],
  tsLastOpenedFilesHistory: 10,
  tsLastOpenedFoldersHistory: 10,
  tsLastEditedFilesHistory: 10,
  tsSearchHistory: 10,
  storedSearchesVisible: true,
  showBookmarks: true,
  fileOpenHistory: false,
  folderOpenHistory: false,
  fileEditHistory: false,
  isRevisionsEnabled:
    typeof window.ExtRevisionsEnabled === 'undefined'
      ? true
      : window.ExtRevisionsEnabled,
  prefixTagContainer: AppConfig.prefixTagContainer,
  author: author,
  aiProviders: [],
  isAutoSaveEnabled:
    typeof window.ExtAutoSaveEnabled === 'undefined'
      ? false
      : window.ExtAutoSaveEnabled,
  supportedLanguages: [
    {
      iso: 'en',
      title: 'English',
    },
    {
      iso: 'de_DE',
      title: 'Deutsch (German)',
    },
    {
      iso: 'it',
      title: 'Italiano (Italian)',
    },
    {
      iso: 'zh_CN',
      title: '简体中文 (Chinese)',
    },
    {
      iso: 'bg',
      title: 'Български (Bulgarian)',
    },
    {
      iso: 'ja',
      title: '日本語 (Japanese)',
    },
    {
      iso: 'pt_BR',
      title: 'Português (Brazil)',
    },
    {
      iso: 'pt_PT',
      title: 'Português (Portugal)',
    },
    {
      iso: 'fr',
      title: 'Français (French)',
    },
    {
      iso: 'sk_SK',
      title: 'Slovenský (Slovak)',
    },
    {
      iso: 'es',
      title: 'Español (Spanish)',
    },
    {
      iso: 'uk',
      title: 'Український (Ukrainian)',
    },
    {
      iso: 'ru',
      title: 'Русский (Russian)',
    },
    {
      iso: 'tr',
      title: 'Türk (Turkish)',
    },
    {
      iso: 'cs',
      title: 'Čeština (Czech)',
    },
    {
      iso: 'ca',
      title: 'Catalan (Català)',
    },
    {
      iso: 'ko',
      title: '한국의 (Korean)',
    },
    {
      iso: 'el',
      title: 'ελληνικά (Greek)',
    },
    {
      iso: 'sv',
      title: 'svenska (Swedish)',
    },
    {
      iso: 'nl_NL',
      title: 'Nederlands (Dutch)',
    },
    {
      iso: 'zh_TW',
      title: '繁体中文（台灣）- Chinese Taiwan',
    },
    {
      iso: 'hu',
      title: 'Magyar (Hungarian)',
    },
    {
      iso: 'id_ID',
      title: 'bahasa Indonesia (Indonesian)',
    },
    {
      iso: 'hy',
      title: 'հայերեն (Armenian)',
    },
    {
      iso: 'nb',
      title: 'Bokmål (Norwegian)',
    },
    {
      iso: 'fr_CA',
      title: 'français canadien (Canadian French)',
    },
    {
      iso: 'zh_HK',
      title: '繁体中文（香港）- Chinese Hong Kong',
    },
    {
      iso: 'he',
      title: 'עִבְרִית (Hebrew)',
    },
    {
      iso: 'es_CL',
      title: 'Español chileno (Chilean Spanish)',
    },
  ],
  keyBindings: keyBindings(AppConfig.isMacLike),
  supportedFileTypes: window.ExtSupportedFileTypes
    ? [...supportedFileTypes, ...window.ExtSupportedFileTypes]
    : supportedFileTypes,
  explicitlyDeletedFileTypes: [],
  extensionsFound: window.ExtExtensionsFound
    ? [...extensionsFound, ...window.ExtExtensionsFound]
    : extensionsFound,
  enabledExtensions: [],
  mapTileServers: [
    {
      uuid: getUuid(),
      name: 'Standard',
      serverURL: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
      serverInfo:
        '<b>Leaflet</b> | Map data: &copy; <b>https://openstreetmap.org/copyright</b> contributors',
    },
    {
      uuid: getUuid(),
      name: 'Topographic',
      serverURL: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      serverInfo:
        '<b>Leaflet</b> | Map data: &copy; <b>https://openstreetmap.org/copyright</b> contributors, SRTM | Map style: &copy; <b>https://opentopomap.org</b> - OpenTopoMap (<b>https://creativecommons.org/licenses/by-sa/3.0/</b> - CC-BY-SA',
    },
  ],
};
