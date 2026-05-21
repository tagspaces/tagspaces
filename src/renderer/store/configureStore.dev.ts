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
/* global TagSpaces */
/* eslint no-undef: "error" */
import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import AppConfig from '-/AppConfig';
import rootReducer from '../reducers';
import onlineListener from '../services/onlineListener';
import { getEncryptCredentialsAtRest } from '../reducers/settings';
import {
  setEncryptAtRestEnabled,
  setKeySource,
  setPersistorRef,
} from '../services/encryptAtRestState';
import { inferKeySource } from '../services/credentialsBootstrap';

const configureStore = (initialState) => {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  // Thunk Middleware
  middleware.push(thunk);

  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true,
  });
  middleware.push(logger);

  // Redux DevTools Configuration
  const actionCreators = {
    // ...routerActions
  };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
        actionCreators,
      })
    : compose;
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  // enhancers.push(autoRehydrate()); removed in v5
  const enhancer = composeEnhancers(...enhancers);

  // Create Store
  const store = createStore(rootReducer, initialState, enhancer);

  onlineListener(store.dispatch);

  const syncEncryptState = () => {
    try {
      const state: any = store.getState();
      // CRITICAL: persistStore() synchronously dispatches PERSIST before
      // the async REHYDRATE arrives. Without this gate, the subscription
      // would fire on PERSIST while state.settings still holds defaults
      // (flag=false, source='off'), overwrite the probe seed to 'off',
      // and then transform.out during REHYDRATE would have no provider
      // and blank every `tsenc:*:` value. Skip until rehydration is done.
      if (!state._persist?.rehydrated) {
        return;
      }
      const enabled = getEncryptCredentialsAtRest(state);
      // Read raw so an undefined value (shipped users without the new
      // field) takes the back-compat path inside `inferKeySource`.
      const explicit = state.settings?.encryptCredentialsKeySource;
      setEncryptAtRestEnabled(enabled);
      setKeySource(inferKeySource(enabled, explicit, AppConfig.isElectron));
    } catch (e) {
      /* ignore */
    }
  };
  // The probe in index.tsx already seeded the singleton based on the
  // persisted settings; the subscription only takes over once rehydration
  // has run (the gate above).
  store.subscribe(syncEncryptState);

  const persistor = persistStore(store, null, () => {
    // languageChanged event is not handled in main process on store loaded (App is not ready)
    setTimeout(() => {
      if (AppConfig.isElectron) {
        window.electronIO.ipcRenderer.sendMessage(
          'set-language',
          // @ts-ignore
          store.getState().settings.interfaceLanguage,
        );
      }
    }, 500);
    // document.dispatchEvent(new Event('storeLoaded'));
    // store.dispatch(push('/main'));
    // console.log('Store rehydrated.');
  });

  setPersistorRef(persistor);

  if (module.hot) {
    module.hot.accept(
      '../reducers',
      () => store.replaceReducer(require('../reducers')), // eslint-disable-line global-require
    );
  }

  return { store, persistor };
};

export default { configureStore };
