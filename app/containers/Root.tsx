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

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
// import { BrowserRouter } from 'react-router-dom';
// import Routes from '../routes';
import LoadingScreen from '../components/LoadingScreen';
import { actions as AppActions } from '../reducers/app';
import {
  actions as SettingsActions,
  getCheckForUpdateOnStartup,
  isGlobalKeyBindingEnabled,
  isFirstRun
} from '../reducers/settings';
import { getDefaultLocationId } from '-/reducers/locations';
import PlatformIO from '../services/platform-io';
// import MainPage from './MainPage';
import { getURLParameter } from '-/utils/misc';
import AppConfig from '-/config';
import App from '-/containers/App';
import MainPage from '-/containers/MainPage';

type RootType = {
  store: {};
  persistor: {};
};

function disableBackGestureMac() {
  if (AppConfig.isMacLike) {
    const element = document.getElementById('root');
    element.addEventListener('touchstart', (e: MouseEvent) => {
      // is not near edge of view, exit
      if (e.pageX > 10 && e.pageX < window.innerWidth - 10) return;

      // prevent swipe to navigate gesture
      e.preventDefault();
    });
  }
}

function onBeforeLift(store) {
  disableBackGestureMac();

  store.dispatch(SettingsActions.setZoomRestoreApp());
  store.dispatch(SettingsActions.upgradeSettings()); // TODO call this only on app version update
  const state = store.getState();
  const defaultLocationId = getDefaultLocationId(state);
  if (defaultLocationId && defaultLocationId.length > 0) {
    store.dispatch(AppActions.openLocationById(defaultLocationId));
  }
  if (getCheckForUpdateOnStartup(state)) {
    store.dispatch(SettingsActions.checkForUpdate());
  }
  if (isFirstRun(state)) {
    store.dispatch(AppActions.toggleOnboardingDialog());
    setTimeout(store.dispatch(AppActions.toggleLicenseDialog()), 2000);
  }
  PlatformIO.setGlobalShortcuts(isGlobalKeyBindingEnabled(state));
  const langURLParam = getURLParameter('locale');
  if (
    langURLParam &&
    langURLParam.length > 1 &&
    /^[a-zA-Z\-_]+$/.test('langURLParam')
  ) {
    store.dispatch(SettingsActions.setLanguage(langURLParam));
  }

  const lid = getURLParameter('tslid');
  const dPath = getURLParameter('tsdpath');
  const ePath = getURLParameter('tsepath');
  const cmdOpen = getURLParameter('cmdopen');
  if (lid || dPath || ePath) {
    setTimeout(() => {
      store.dispatch(AppActions.openLink(window.location.href));
    }, 1000);
  } else if (cmdOpen) {
    setTimeout(() => {
      store.dispatch(
        AppActions.openLink(
          window.location.href.split('?')[0] + '?cmdopen=' + cmdOpen
        )
      );
    }, 1000);
  }
}

export default function Root({ store, persistor }: RootType) {
  return (
    <Provider
      // @ts-ignore
      store={store}
    >
      {/**
       * PersistGate delays the rendering of the app's UI until the persisted state has been retrieved
       * and saved to redux.
       * The `loading` prop can be `null` or any react instance to show during loading (e.g. a splash screen),
       * for example `loading={<SplashScreen />}`.
       * @see https://github.com/rt2zz/redux-persist/blob/master/docs/PersistGate.md
       */}
      <PersistGate
        loading={<LoadingScreen />}
        onBeforeLift={() => onBeforeLift(store)}
        // @ts-ignore
        persistor={persistor}
      >
        <App>
          <MainPage />
        </App>
        {/* <BrowserRouter>
          <Routes />
        </BrowserRouter> */}
      </PersistGate>
    </Provider>
  );
}
