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

declare module '*.json';
declare module '*.md';
declare module '*.txt';
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';
declare module '*.woff';
declare module '*.woff2';
declare module '*.xml';

type ExternalAI = {
  defaultEngine: string;
  engines: Array<any>;
};

declare interface Window {
  // interface TSCustomWindow extends Window {
  ExtMapTileServers?: Array<any>; //TS.MapTileServer>;
  //walkCanceled?: boolean;
  ExtLogoURL?: string;
  ExtDefaultVerticalPanel?: string;
  ExtDisplayMode?: string;
  ExtDevMode?: boolean;
  ExtDefaultPerspective?: string;
  ExtTagLibrary?: Array<any>;
  ExtLocations?: Array<any>;
  ExtSearches?: Array<any>;
  ExtTheme?: string;
  ExtRegularTheme?: string;
  ExtDarkTheme?: string;
  ExtIsFirstRun?: boolean;
  ExtIsAmplify?: boolean;
  ExtUseSidecarsForFileTagging?: boolean;
  ExtSaveLocationsInBrowser?: boolean;
  ExtLightThemeLightColor?: string;
  ExtLightThemeMainColor?: string;
  ExtDarkThemeLightColor?: string;
  ExtDarkThemeMainColor?: string;
  ExtShowWelcomePanel?: string;
  ExtShowSmartTags?: string;
  ExtUseGenerateThumbnails?: boolean;
  ExtGeoTaggingFormat?: string;
  ExtDemoUser?: any;
  ExtPrivacyURL?: string;
  ExtImprintURL?: string;
  ExtCheckForUpdatesOnStartup?: boolean;
  ExtFilenameTagPlacedAtEnd?: boolean;
  ExtRevisionsEnabled?: boolean;
  ExtAutoSaveEnabled?: boolean;
  ExtAI?: ExternalAI;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  plugins?: any; // needed for Cordova
  resolveLocalFileSystemURL?: any; // needed for Cordova
  device?: any; // needed for Cordova
  ExtSupportedFileTypes?: Array<any>;
  ExtExtensionsFound?: Array<any>;
  ExtSearchTypeGroups?: any;
  ExtDefaultMapBounds?: any;
  ExtShowTSLogo?: boolean;
  ExtShowTSVersion?: boolean;
  ExtUseOnlyTagsFromTagLibrary?: boolean;
  ExtUseLocationTags?: boolean;
  ExtDefaultQuestionPrompt?: string;
  ExtDefaultSystemPrompt?: string;
  ExtSummarizePrompt?: string;
  ExtDescriptionFromTextPrompt?: string;
  ExtDescriptionFromImageStructuredPrompt?: string;
  ExtDescriptionFromImagePrompt?: string;
  ExtTagsFromTextPrompt?: string;
  ExtTagsFromImagePrompt?: string;
  ExtFileTemplates?: Array<any>;
  ExtDefaultFileTemplate?: any;
  ExtWorkSpaces?: Array<any>;
  ExtAuthor?: string;
}

declare interface NodeModule {
  /** https://webpack.js.org/api/hot-module-replacement */
  hot: {
    accept(file: string, update: () => void): void;
  };
}

declare interface Document {
  webkitExitFullscreen: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    'swiper-container': any;
    'swiper-slide': any;
  }
}
