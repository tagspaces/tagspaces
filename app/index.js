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
import { actions as AppActions } from './reducers/app';
import { getDefaultLocationId } from './reducers/locations';
import { actions as SettingsActions, getCheckForUpdateOnStartup } from './reducers/settings';

const store = configureStore();

document.addEventListener('contextmenu', event => event.preventDefault());

if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
}

/*
Needed for drag and drop from desktop
let dragTimer;
document.addEventListener('dragover', (event) => {
  const dt = event.dataTransfer;
  if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') !== -1 : dt.types.contains('Files'))) {
    console.log('Dragging files ' + JSON.stringify(event.dataTransfer.items));
    store.dispatch(AppActions.setFileDragged(true));
    window.clearTimeout(dragTimer);
  }
  event.preventDefault();
});

document.addEventListener('dragleave', (event) => {
  const dt = event.dataTransfer;
  if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') !== -1 : dt.types.contains('Files'))) {
    // console.log('Dragging files ended' + JSON.stringify(event.dataTransfer.items));
    dragTimer = window.setTimeout(() => {
      store.dispatch(AppActions.setFileDragged(false));
    }, 25);
  }
  // event.preventDefault();
}); */

document.addEventListener('storeLoaded', () => {
  checkIsFirstRun();
  store.dispatch(SettingsActions.setZoomRestoreApp());
  store.dispatch(SettingsActions.upgradeSettings()); // TODO call this only on app version update
  const state = store.getState();
  const defaultLocationId = getDefaultLocationId(state);
  if (defaultLocationId && defaultLocationId.length > 0) {
    store.dispatch(AppActions.openLocation(defaultLocationId));
  }
  if (getCheckForUpdateOnStartup(state)) {
    store.dispatch(SettingsActions.checkForUpdate());
  }
});

function checkIsFirstRun() {
  // history.push('/login');
}

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
