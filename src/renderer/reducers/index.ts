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
import { loadJSONString } from '@tagspaces/tagspaces-common/utils-io';
import { persistCombineReducers, PersistConfig } from 'redux-persist';
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4';
import storage from 'redux-persist/lib/storage';
import app from './app';
import locations from './locations';
import searches from './searches';
import settings from './settings';

function configureApp(extConfigObj) {
  if (!extConfigObj) return;
  if (extConfigObj.ExtLocations) {
    externalLocations = extConfigObj.ExtLocations;
  }
  if (extConfigObj.ExtSearches) {
    externalSearches = extConfigObj.ExtSearches;
  }
  AppConfig.showTSLogo =
    extConfigObj.ExtShowTSLogo !== undefined
      ? extConfigObj.ExtShowTSLogo
      : true;
  AppConfig.showTSVersion =
    extConfigObj.ExtShowTSVersion !== undefined
      ? extConfigObj.ExtShowTSVersion
      : true;
  AppConfig.ExtShowWelcomePanel =
    extConfigObj.ExtShowWelcomePanel !== undefined
      ? extConfigObj.ExtShowWelcomePanel
      : true;
  AppConfig.ExtAuthor = extConfigObj.ExtAuthor ?? AppConfig.ExtAuthor;
  AppConfig.ExtPrivacyURL =
    extConfigObj.ExtPrivacyURL ?? AppConfig.ExtPrivacyURL;
  AppConfig.ExtImprintURL =
    extConfigObj.ExtImprintURL ?? AppConfig.ExtImprintURL;
  AppConfig.ExtLogoURL = extConfigObj.ExtLogoURL ?? AppConfig.ExtLogoURL;
  AppConfig.ExtIsFirstRun =
    extConfigObj.ExtIsFirstRun ?? AppConfig.ExtIsFirstRun;
  AppConfig.ExtDisplayMode =
    extConfigObj.ExtDisplayMode ?? AppConfig.ExtDisplayMode;
  AppConfig.ExtCheckForUpdatesOnStartup =
    extConfigObj.ExtCheckForUpdatesOnStartup ??
    AppConfig.ExtCheckForUpdatesOnStartup;
  AppConfig.ExtUseSidecarsForFileTagging =
    extConfigObj.ExtUseSidecarsForFileTagging ??
    AppConfig.ExtUseSidecarsForFileTagging;
  AppConfig.ExtUseOnlyTagsFromTagLibrary =
    extConfigObj.ExtUseOnlyTagsFromTagLibrary ??
    AppConfig.ExtUseOnlyTagsFromTagLibrary;
  AppConfig.ExtFilenameTagPlacedAtEnd =
    extConfigObj.ExtFilenameTagPlacedAtEnd ??
    AppConfig.ExtFilenameTagPlacedAtEnd;
  AppConfig.ExtTagLibrary =
    extConfigObj.ExtTagLibrary ?? AppConfig.ExtTagLibrary;
  AppConfig.SearchTypeGroups =
    extConfigObj.ExtSearchTypeGroups ?? AppConfig.SearchTypeGroups;
  AppConfig.ExtMapTileServers =
    extConfigObj.ExtMapTileServers ?? AppConfig.ExtMapTileServers;
  AppConfig.ExtGeoTaggingFormat =
    extConfigObj.ExtGeoTaggingFormat ?? AppConfig.ExtGeoTaggingFormat;
  AppConfig.ExtDefaultMapBounds =
    extConfigObj.ExtDefaultMapBounds ?? AppConfig.ExtDefaultMapBounds;
  AppConfig.ExtDefaultVerticalPanel =
    extConfigObj.ExtDefaultVerticalPanel ?? AppConfig.ExtDefaultVerticalPanel; // do not work should be refactored in app.ts
  AppConfig.ExtShowSmartTags = extConfigObj.ExtShowSmartTags ?? true;
  AppConfig.ExtUseLocationTags =
    extConfigObj.ExtUseLocationTags ?? AppConfig.ExtUseLocationTags;
  AppConfig.ExtHideProFeatures =
    extConfigObj.ExtHideProFeatures ?? AppConfig.ExtHideProFeatures;
  AppConfig.ExtTheme = extConfigObj.ExtTheme ?? AppConfig.ExtTheme;
  AppConfig.ExtDefaultPerspective =
    extConfigObj.ExtDefaultPerspective ?? AppConfig.ExtDefaultPerspective;
  // ExtEnabledPerspectives: array of perspective IDs to expose to the user.
  // When set, this is authoritative on every app load — the Settings tab
  // toggles become read-only and end-user preferences in
  // state.settings.enabledPerspectives are ignored. Unknown IDs are silently
  // dropped by getVisiblePerspectives at render time. Frozen so a buggy
  // reducer or component can't mutate the deployer-pinned whitelist —
  // matches how externalLocations / externalSearches are treated below.
  if (Array.isArray(extConfigObj.ExtEnabledPerspectives)) {
    AppConfig.ExtEnabledPerspectives = extConfigObj.ExtEnabledPerspectives;
    Object.freeze(AppConfig.ExtEnabledPerspectives);
  }
  AppConfig.ExtLightThemeLightColor =
    extConfigObj.ExtLightThemeLightColor ?? AppConfig.ExtLightThemeLightColor; // do not apply currently
  AppConfig.ExtLightThemeMainColor =
    extConfigObj.ExtLightThemeMainColor ?? AppConfig.ExtLightThemeMainColor; // do not apply currently
  AppConfig.ExtDarkThemeLightColor =
    extConfigObj.ExtDarkThemeLightColor ?? AppConfig.ExtDarkThemeLightColor; // do not apply currently
  AppConfig.ExtDarkThemeMainColor =
    extConfigObj.ExtDarkThemeMainColor ?? AppConfig.ExtDarkThemeMainColor; // do not apply currently
  AppConfig.ExtDefaultSystemPrompt =
    extConfigObj.ExtDefaultSystemPrompt ?? AppConfig.ExtDefaultSystemPrompt;
  AppConfig.ExtDefaultQuestionPrompt =
    extConfigObj.ExtDefaultQuestionPrompt ?? AppConfig.ExtDefaultQuestionPrompt;
  AppConfig.ExtSummarizePrompt =
    extConfigObj.ExtSummarizePrompt ?? AppConfig.ExtSummarizePrompt;
  AppConfig.ExtDescriptionFromImageStructuredPrompt =
    extConfigObj.ExtDescriptionFromImageStructuredPrompt ??
    AppConfig.ExtDescriptionFromImageStructuredPrompt;
  AppConfig.ExtDescriptionFromImagePrompt =
    extConfigObj.ExtDescriptionFromImagePrompt ??
    AppConfig.ExtDescriptionFromImagePrompt;
  AppConfig.ExtDescriptionFromTextPrompt =
    extConfigObj.ExtDescriptionFromTextPrompt ??
    AppConfig.ExtDescriptionFromTextPrompt;
  AppConfig.ExtDescriptionFromTextPrompt =
    extConfigObj.ExtDescriptionFromTextPrompt ??
    AppConfig.ExtDescriptionFromTextPrompt;
  AppConfig.ExtTagsFromImagePrompt =
    extConfigObj.ExtTagsFromImagePrompt ?? AppConfig.ExtTagsFromImagePrompt;
  AppConfig.ExtTagsFromTextPrompt =
    extConfigObj.ExtTagsFromTextPrompt ?? AppConfig.ExtTagsFromTextPrompt;
  AppConfig.ExtDefaultFileTemplate = extConfigObj.ExtDefaultFileTemplate ?? {
    id: 'default',
    name: 'Default',
    content: '{createdInApp} ({date}) {author}',
    fileNameTmpl: 'note[{timestamp}]',
  };
  AppConfig.ExtFileTemplates =
    extConfigObj.ExtFileTemplates ?? AppConfig.ExtFileTemplates;
  AppConfig.ExtDevMode = extConfigObj.ExtDevMode ?? AppConfig.ExtDevMode; // not documented
  AppConfig.ExtIsAmplify = extConfigObj.ExtIsAmplify ?? AppConfig.ExtIsAmplify; // not documented
  AppConfig.ExtWorkSpaces =
    extConfigObj.ExtWorkSpaces ?? AppConfig.ExtWorkSpaces; // not documented
  AppConfig.ExtAI = extConfigObj.ExtAI ?? AppConfig.ExtAI; // not documented
  AppConfig.ExtAutoSaveEnabled =
    extConfigObj.ExtAutoSaveEnabled ?? AppConfig.ExtAutoSaveEnabled; // not documented and not fully impl.
  AppConfig.ExtRevisionsEnabled =
    extConfigObj.ExtRevisionsEnabled ?? AppConfig.ExtRevisionsEnabled; // not documented and not fully impl.
  AppConfig.ExtDemoUser = extConfigObj.ExtDemoUser ?? AppConfig.ExtDemoUser; // not used anymore
  AppConfig.ExtRegularTheme =
    extConfigObj.ExtRegularTheme ?? AppConfig.ExtRegularTheme; // not documented
  AppConfig.ExtDarkTheme = extConfigObj.ExtDarkTheme ?? AppConfig.ExtDarkTheme; // not documented
  AppConfig.ExtSupportedFileTypes =
    extConfigObj.ExtSupportedFileTypes ?? AppConfig.ExtSupportedFileTypes; // not documented, can be used for initialization only
  AppConfig.ExtExtensionsFound =
    extConfigObj.ExtExtensionsFound ?? AppConfig.ExtExtensionsFound; // not documented
  AppConfig.ExtUseGenerateThumbnails =
    extConfigObj.ExtUseGenerateThumbnails ?? AppConfig.ExtUseGenerateThumbnails; // not documented
  AppConfig.ExtDefaultFolderColor =
    extConfigObj.ExtDefaultFolderColor ?? AppConfig.ExtDefaultFolderColor;
  AppConfig.ExtSaveLocationsInBrowser =
    extConfigObj.ExtSaveLocationsInBrowser ?? false;
  AppConfig.ExtLocationsReadOnly = // computed value
    AppConfig.ExtLocations !== undefined &&
    AppConfig.ExtLocations instanceof Array
      ? AppConfig.ExtLocations.length > 0
      : false;
}

let externalLocations = false;
let externalSearches = false;

configureApp(window); // Configuring from extconfig.js if loaded

// for electron prod: '../../../../extconfig.json' for run dev 'extconfig.json' in public/
const extConfigPath = AppConfig.isWeb
  ? 'extconfig.json'
  : '../../../../extconfig.json';

// Sanity ceiling for the config file. The repo's own extconfig.json is
// only a few KB, but deployers may inline larger assets — most commonly
// a base64 data: URL for ExtLogoURL — which can push the file into the
// hundreds of KB or low MB range. 5 MB leaves comfortable headroom for
// a custom logo while still bailing well before loadJSONString's 50 MB
// hard cap, so a runaway payload (corrupted install, dev-server
// misconfiguration) doesn't make it into JSON.parse.
const EXTCONFIG_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const xhr = new XMLHttpRequest();
xhr.open('GET', extConfigPath, false); // false = synchronous
try {
  xhr.send(); // Will pause execution here until it finishes or fails
  // Status 200 is for HTTP servers, Status 0 is for local file:// protocol
  if ((xhr.status === 200 || xhr.status === 0) && xhr.responseText) {
    // Content-Type guard — only accept what the server claims is JSON.
    // file:// responses (status 0) typically don't set a Content-Type;
    // empty header is tolerated. We only reject when something explicit
    // and non-JSON came back (e.g. a dev-server fallback HTML page or a
    // CDN error page with a 200).
    const contentType = (
      xhr.getResponseHeader('Content-Type') || ''
    ).toLowerCase();
    if (contentType && !contentType.startsWith('application/json')) {
      console.warn(
        `extconfig.json had unexpected Content-Type ${contentType} — ignored.`,
      );
    } else if (xhr.responseText.length > EXTCONFIG_MAX_SIZE) {
      console.warn(
        `extconfig.json exceeded ${EXTCONFIG_MAX_SIZE} bytes — ignored.`,
      );
    } else {
      const jsonConfig = loadJSONString(xhr.responseText);
      // Shape guard — loadJSONString returns undefined on malformed
      // input and may parse legitimate-looking JSON that isn't a plain
      // object (array, primitive). configureApp expects a record-like
      // object.
      if (
        jsonConfig &&
        typeof jsonConfig === 'object' &&
        !Array.isArray(jsonConfig)
      ) {
        // Log keys only — never the values. extconfig.json may contain
        // secrets (ExtAI[].apiKey, ExtLocations[].secretAccessKey, etc.)
        // and dumping the full object to the console exposes them in
        // DevTools, screenshots, and shared bug-report transcripts.
        console.log('extconfig.json loaded — keys:', Object.keys(jsonConfig));
        configureApp(jsonConfig);
      } else {
        console.warn('extconfig.json had unexpected shape — ignored.');
      }
    }
  } else {
    // Handled case: File exists but returned 404, 403, etc.
    console.warn(`extconfig.json returned status ${xhr.status}.`);
  }
} catch (error) {
  // Handled case: File completely missing, network offline, or CORS error
  console.warn('extconfig.json is not available or could not be loaded.');
}

const blacklist = ['app'];
if (
  !AppConfig.ExtSaveLocationsInBrowser &&
  (externalLocations || AppConfig.isWeb)
) {
  blacklist.push('locations');
}
if (externalSearches) {
  blacklist.push('searches');
}

const rootPersistConfig: PersistConfig = {
  key: 'root',
  getStoredState: getStoredStateMigrateV4({ blacklist }),
  storage,
  version: 2,
  blacklist,
  debug: false,
};

// Freeze externally-pinned slices so accidental mutations (e.g. a
// reducer or component pushing into the array) throw in strict mode
// instead of silently corrupting the deployer-locked config. The
// constant-returning reducers below stop normal action-driven mutation
// — freezing makes that contract explicit.
if (externalLocations && Array.isArray(externalLocations)) {
  Object.freeze(externalLocations);
}
if (externalSearches && Array.isArray(externalSearches)) {
  Object.freeze(externalSearches);
}

const rootReducer = persistCombineReducers(rootPersistConfig, {
  settings,
  app,
  locations: externalLocations ? () => externalLocations : locations,
  searches: externalSearches ? () => externalSearches : searches,
});

export default rootReducer;
