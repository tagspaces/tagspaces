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
import { DefaultEnabledPerspectives, PerspectiveIDs } from '-/perspectives';
import keyBindings from '-/reducers/keybindings-default';

let desktopMode = !AppConfig.isMobile;
if (AppConfig.ExtDisplayMode === 'mobile') {
  desktopMode = false;
} else if (AppConfig.ExtDisplayMode === 'desktop') {
  desktopMode = true;
}
let checkForUpdates = true;
if (AppConfig.ExtCheckForUpdatesOnStartup !== undefined) {
  checkForUpdates = AppConfig.ExtCheckForUpdatesOnStartup;
}
let filenameTagPlacedAtEnd = true;
if (AppConfig.ExtFilenameTagPlacedAtEnd !== undefined) {
  filenameTagPlacedAtEnd = AppConfig.ExtFilenameTagPlacedAtEnd;
}
let useOnlyTagsFromTagLibrary = false;
if (AppConfig.ExtUseOnlyTagsFromTagLibrary !== undefined) {
  useOnlyTagsFromTagLibrary = AppConfig.ExtUseOnlyTagsFromTagLibrary;
}

let author = '';
if (AppConfig.ExtAuthor !== undefined) {
  author = AppConfig.ExtAuthor;
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
  devMode: AppConfig.ExtDevMode ? AppConfig.ExtDevMode : false,
  hideProFeatures: false,
  autoSaveDescription: false,
  saveTagInLocation:
    typeof AppConfig.ExtUseLocationTags === 'undefined'
      ? false
      : AppConfig.ExtUseLocationTags,
  newHTMLFileContent:
    '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body></body></html>',
  showUnixHiddenEntries: false,
  entryContainerTab: 0,
  checkForUpdates,
  reorderTags: false,
  coloredFileExtension: false,
  loadsLocationMetaData: false,
  searchInSubfolders: true,
  watchCurrentDirectory: false,
  firstRun: true,
  onboardingCompleted: false,
  hideHowToStart: false,
  onboardingVersion: 0,
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
  defaultFolderColor: '#a466aa',
  currentTheme: 'light',
  currentRegularTheme: 'legacy',
  currentDarkTheme: 'darklegacy',
  geoTaggingFormat: 'pluscodes',
  defaultPerspective: PerspectiveIDs.GRID,
  enableGlobalKeyboardShortcuts: false,
  zoomFactor: 1,
  lastPublishedVersion: '',
  entrySplitSize: 200, // px — height of the title+tabs pane inside EntryContainer
  mainVSplitSize: '50%',
  leftPanelWidth: 320, // px — desktop drawer width (bounds 250–600)
  supportedGeoTagging: ['pluscodes', 'mgrs'],
  supportedThemes: ['light', 'dark', 'system'],
  tsLastOpenedFilesHistory: 10,
  tsLastOpenedFoldersHistory: 10,
  tsLastEditedFilesHistory: 10,
  tsSearchHistory: 10,
  tsRecentMoveCopyDestinations: 5,
  lastMoveCopyMode: 'move' as 'move' | 'copy',
  storedSearchesVisible: true,
  showBookmarks: true,
  fileOpenHistory: false,
  folderOpenHistory: false,
  fileEditHistory: false,
  isRevisionsEnabled:
    typeof AppConfig.ExtRevisionsEnabled === 'undefined'
      ? true
      : AppConfig.ExtRevisionsEnabled,
  prefixTagContainer: AppConfig.prefixTagContainer,
  author: author,
  aiProviders: [],
  isAutoSaveEnabled:
    typeof AppConfig.ExtAutoSaveEnabled === 'undefined'
      ? false
      : AppConfig.ExtAutoSaveEnabled,
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
    {
      iso: 'da_DK',
      title: 'dansk (Danish Denmark)',
    },
    {
      iso: 'pl',
      title: 'polski (Polish)',
    },
    {
      iso: 'zh_Hant',
      title: '繁體中文 (Traditional Chinese)',
    },
  ],
  keyBindings: keyBindings(AppConfig.isMacLike),
  supportedFileTypes: AppConfig.ExtSupportedFileTypes
    ? [...supportedFileTypes, ...AppConfig.ExtSupportedFileTypes]
    : supportedFileTypes,
  explicitlyDeletedFileTypes: [],
  extensionsFound: AppConfig.ExtExtensionsFound
    ? [...extensionsFound, ...AppConfig.ExtExtensionsFound]
    : extensionsFound,
  enabledExtensions: [],
  enabledPerspectives: DefaultEnabledPerspectives,
  seenPerspectiveOnboardings: {} as Record<string, boolean>,
  mapTileServers: [],
};
