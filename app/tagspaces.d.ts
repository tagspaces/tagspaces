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

declare module '*.json';
declare module '*.md';
declare module '*.txt';
declare module '*.png';
declare module '*.svg';
declare module '*.woff';
declare module '*.woff2';
declare module '*.xml';

declare interface Window {
  // interface TSCustomWindow extends Window {
  walkCanceled?: boolean;
  ExtLogoURL?: string;
  ExtDefaultVerticalPanel?: string;
  ExtDisplayMode?: string;
  ExtDefaultPerspective?: string;
  ExtTagLibrary?: Array<any>;
  ExtLocations?: Array<any>;
  ExtSearches?: Array<any>;
  ExtTheme?: string;
  ExtIsFirstRun?: boolean;
  ExtIsAmplify?: boolean;
  ExtUseSidecarsForFileTagging?: boolean;
  ExtSaveLocationsInBrowser?: boolean;
  ExtSidebarColor?: string;
  ExtSidebarSelectionColor?: string;
  ExtLightThemeLightColor?: string;
  ExtLightThemeMainColor?: string;
  ExtDarkThemeLightColor?: string;
  ExtDarkThemeMainColor?: string;
  ExtShowWelcomePanel?: string;
  ExtShowSmartTags?: string;
  ExtShowAdvancedSearch?: string;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  plugins?: any; // needed for Cordova
  resolveLocalFileSystemURL?: any; // needed for Cordova
  device?: any; // needed for Cordova
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

declare namespace TagSpaces {
  interface Location {
    uuid: string;
    newuuid?: string;
    name: string;
    type: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
    bucketName?: string;
    region?: string;
    paths?: Array<string>; // deprecated
    path?: string;
    endpointURL?: string;
    children?: Array<any>;
    perspective?: string; // id of the perspective
    creationDate?: string;
    isDefault: boolean;
    isReadOnly?: boolean;
    isNotEditable?: boolean;
    watchForChanges?: boolean;
    persistIndex?: boolean;
    fullTextIndex?: boolean;
    maxIndexAge?: number;
  }

  interface SearchQuery {
    uuid?: string; // for saved searches
    title?: string; // for saved searches
    // creationDate?: number; // for saved searches TODO rethink if this needed ?
    textQuery?: string;
    fileTypes?: Array<string>;
    tagsAND?: Array<Tag>;
    tagsOR?: Array<Tag>;
    tagsNOT?: Array<Tag>;
    lastModified?: string;
    fileSize?: string;
    searchBoxing?: 'location' | 'folder' | 'global';
    searchType?: 'fussy' | 'semistrict' | 'strict';
    forceIndexing?: boolean;
    currentDirectory?: string;
    tagTimePeriodFrom?: number | null;
    tagTimePeriodTo?: number | null;
    tagPlaceLat?: number | null;
    tagPlaceLong?: number | null;
    tagPlaceRadius?: number | null;
    maxSearchResults?: number;
  }

  type Uuid = string;

  interface Tag {
    title?: string;
    type?: 'plain' | 'sidecar' | 'smart'; // smart should be eventually removed from this list, functionality should be enough
    id?: Uuid;
    icon?: string;
    description?: string;
    style?: string;
    path?: string; // needed for geo tagging should be removed
    modified_date?: string;
    functionality?: string;
    keyBinding?: string;
    color?: string;
    textcolor?: string;
    originTitle?: string;
  }

  interface TagGroup {
    uuid: Uuid;
    title: string;
    expanded?: boolean;
    description?: string;
    categoryId?: string;
    readOnly?: boolean;
    color?: string;
    textcolor?: string;
    children?: Array<Tag>;
  }
}
