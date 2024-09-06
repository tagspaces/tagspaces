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

import { createRoot } from 'react-dom/client';
// import Root from './containers/Root';
import configureStore from './store/configureStore';
import './app.global.css';

const { store, persistor } = configureStore({});

document.addEventListener('contextmenu', (event) => event.preventDefault());

if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
// https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/2395#issuecomment-651328378
const Root = require('./containers/Root').default;
root.render(<Root store={store} persistor={persistor} />);

/*// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);*/
