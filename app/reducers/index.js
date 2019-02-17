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

import { persistCombineReducers } from 'redux-persist';
import { routerReducer as router } from 'react-router-redux';
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4';
// import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import settings from './settings';
import app from './app';
import locations from './locations';
import taglibrary from './taglibrary';
import locationIndex from './location-index';


const rootPersistConfig = {
  key: 'root',
  getStoredState: getStoredStateMigrateV4({ blacklist: ['app', 'locationIndex'] }),
  storage,
  version: 1,
  blacklist: ['app', 'locationIndex'],
  debug: false,
  // https://github.com/rt2zz/redux-persist/blob/b6a60bd653d59c4fe462e2e0ea827fd76eb190e1/README.md#state-reconciler
  // stateReconciler: autoMergeLevel2,
};

const rootReducer = persistCombineReducers(rootPersistConfig, {
  /* settings: persistReducer(
    {
      key: 'settings',
      getStoredState: getStoredStateMigrateV4({ keyPrefix: 'reduxPersist' }),
      storage
    },
    settings,
  ), */
  settings,
  app,
  locations,
  taglibrary,
  router,
  locationIndex
});

export default rootReducer;
