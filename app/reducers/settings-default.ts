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

import AppConfig from '-/AppConfig';
import keyBindings from '-/reducers/keybindings-default';
import { PerspectiveIDs } from '-/perspectives/types';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { supportedFileTypes } from '-/extension-config';

let desktopMode = !AppConfig.isMobile;
let checkForUpdates = true;
let devMode = false;
let isRevisionsEnabled = true;
let isAutoSaveEnabled = false;
try {
  if (window.ExtDisplayMode && window.ExtDisplayMode === 'mobile') {
    desktopMode = false;
  } else if (window.ExtDisplayMode && window.ExtDisplayMode === 'desktop') {
    desktopMode = true;
  }
  if (window.ExtCheckForUpdatesOnStartup !== undefined) {
    checkForUpdates = window.ExtCheckForUpdatesOnStartup;
  }
  if (window.ExtDevMode !== undefined) {
    devMode = window.ExtDevMode;
  }
  if (typeof window.ExtRevisionsEnabled !== undefined) {
    isRevisionsEnabled = window.ExtRevisionsEnabled;
  }
  if (typeof window.ExtAutoSaveEnabled !== undefined) {
    isAutoSaveEnabled = window.ExtAutoSaveEnabled;
  }
} catch (ex) {
  console.debug(ex.message);
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
  devMode: devMode,
  saveTagInLocation: false,
  newHTMLFileContent:
    '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body></body></html>',
  showUnixHiddenEntries: false,
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
  addTagsToLibrary: true,
  interfaceLanguage: 'en',
  useTrashCan: true,
  useOCR: false,
  useTextExtraction: false,
  useGenerateThumbnails: true,
  tagTextColor: 'white',
  tagBackgroundColor: '#61DD61',
  currentTheme: 'light',
  currentLightTheme: 'legacy',
  currentDarkTheme: 'darklegacy',
  geoTaggingFormat: 'pluscodes',
  defaultPerspective: PerspectiveIDs.GRID,
  enableGlobalKeyboardShortcuts: true,
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
  isRevisionsEnabled: isRevisionsEnabled,
  prefixTagContainer: AppConfig.prefixTagContainer,
  isAutoSaveEnabled: isAutoSaveEnabled,
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
    },
    {
      iso: 'zh_HK',
      title: '漢語 (Chinese Hong Kong)'
    }
  ],
  keyBindings: keyBindings(AppConfig.isMacLike),
  supportedFileTypes: supportedFileTypes,
  enabledExtensions: [],
  mapTileServers: [
    {
      uuid: getUuid(),
      name: 'Standard',
      serverURL: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
      serverInfo:
        '<b>Leaflet</b> | Map data: &copy; <b>https://openstreetmap.org/copyright</b> contributors, <b>CC-BY-SA</b>, Imagery © <b>Mapbox</b>'
    },
    {
      uuid: getUuid(),
      name: 'Topographic',
      serverURL: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      serverInfo:
        '<b>Leaflet</b> | Map data: &copy; <b>https://openstreetmap.org/copyright</b> contributors, SRTM | Map style: &copy; <b>https://opentopomap.org</b> - OpenTopoMap (<b>https://creativecommons.org/licenses/by-sa/3.0/</b> - CC-BY-SA'
    }
  ]
};
