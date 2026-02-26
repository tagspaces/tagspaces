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
import { persistCombineReducers, PersistConfig } from 'redux-persist';
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4';
import storage from 'redux-persist/lib/storage';
import app from './app';
import locations from './locations';
import searches from './searches';
import settings from './settings';

// const xhr = new XMLHttpRequest();
// xhr.open('GET', 'extconfig.json', true); // ../../../../extconfig.js
// xhr.onreadystatechange = function () {
//   if (xhr.readyState === 4 && xhr.status === 200) {
//     const data = JSON.parse(xhr.responseText);
//     console.log(data);
//     window.ExtAuthor = data.ExtAuthor;
//     AppConfig.showTSVersion = false;
//     window.ExtLocations = data.ExtLocations;
//   }
// };
// xhr.send();

const externalLocations = window.ExtLocations || false;
const externalSearches = window.ExtSearches || false;

const blacklist = ['app'];
if (
  !AppConfig.saveLocationsInBrowser &&
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

const rootReducer = persistCombineReducers(rootPersistConfig, {
  settings,
  app,
  locations: externalLocations ? () => externalLocations : locations,
  searches: externalSearches ? () => externalSearches : searches,
});

export default rootReducer;
