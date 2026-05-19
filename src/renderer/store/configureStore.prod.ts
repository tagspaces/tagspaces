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

import { compose, createStore, applyMiddleware } from 'redux';
import { persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
import AppConfig from '-/AppConfig';
import rootReducer from '../reducers';
import onlineListener from '../services/onlineListener';
import { getEncryptCredentialsAtRest } from '../reducers/settings';
import {
  setEncryptAtRestEnabled,
  setPersistorRef,
} from '../services/encryptAtRestState';

const enhancer = compose(
  applyMiddleware(thunk), // , router)
  // autoRehydrate()
);

function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);
  onlineListener(store.dispatch);
  const syncEncryptFlag = () => {
    try {
      setEncryptAtRestEnabled(getEncryptCredentialsAtRest(store.getState()));
    } catch (e) {
      /* ignore */
    }
  };
  syncEncryptFlag();
  store.subscribe(syncEncryptFlag);
  const persistor = persistStore(store, null, () => {
    // document.dispatchEvent(new Event('storeLoaded'));
    // console.log('Store rehydrated.');
    setTimeout(() => {
      if (AppConfig.isElectron) {
        window.electronIO.ipcRenderer.sendMessage(
          'set-language',
          // @ts-ignore
          store.getState().settings.interfaceLanguage,
        );
      }
    }, 500);
  });
  setPersistorRef(persistor);
  return { store, persistor };
}

export default { configureStore };
