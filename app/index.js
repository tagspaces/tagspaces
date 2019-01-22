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
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
// import { push } from 'react-router-redux';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';

const { store, persistor } = configureStore();

document.addEventListener('contextmenu', event => event.preventDefault());

if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
}

render(
  <AppContainer>
    <Root store={store} persistor={persistor} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

/* if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} persistor={persistor} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
} */
