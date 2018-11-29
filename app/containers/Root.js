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

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ConnectedRouter } from 'react-router-redux';
import Routes from '../routes';
import LoadingScreen from '../components/LoadingScreen';

type RootType = {
  store: {},
  persistor: {},
  history: {}
};

export default function Root({ store, persistor, history }: RootType) {
  return (
    <Provider store={store}>
      {/**
       * PersistGate delays the rendering of the app's UI until the persisted state has been retrieved
       * and saved to redux.
       * The `loading` prop can be `null` or any react instance to show during loading (e.g. a splash screen),
       * for example `loading={<SplashScreen />}`.
       * @see https://github.com/rt2zz/redux-persist/blob/master/docs/PersistGate.md
       */}
      <PersistGate
        // loading={<SplashScreen />}
        persistor={persistor}
      >
        {(bootstrapped) => {
          if (bootstrapped) {
            return (
              <ConnectedRouter history={history}>
                <Routes />
              </ConnectedRouter>
            );
          }

          return (<LoadingScreen />);
        }}
      </PersistGate>
    </Provider>
  );
}
