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
  ExtLocationsReadOnly?: string;
  ExtTagLibrary?: Array<any>;
  ExtLocations?: Array<any>;
  ExtTheme?: string;
  ExtIsFirstRun?: boolean;
  ExtDefaultVerticalPanel?: string;
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
