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
import { installGlobalErrorHandlers } from './services/globalErrorHandlers';
import {
  probeBootstrap,
  seedKeySourceFromProbe,
} from './services/credentialsBootstrap';
import { installTabGuardListener } from './services/credentialsTabGuard';
import UnlockScreen from './components/UnlockScreen';
import './app.global.css';

installGlobalErrorHandlers();
installTabGuardListener();

document.addEventListener('contextmenu', (event) => event.preventDefault());

if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

// Synchronous: seed the at-rest key-source singleton BEFORE configureStore
// so redux-persist's outbound transform sees the right provider during
// rehydration. Critical for shipped Electron-keychain users — without
// this, their encrypted credentials would be blanked on first run after
// this build's upgrade.
const credBootstrap = probeBootstrap();
seedKeySourceFromProbe(credBootstrap);

function bootApp() {
  // Re-probe in case the unlock/reset flow modified storage. Idempotent
  // and cheap (sync localStorage reads only).
  seedKeySourceFromProbe(probeBootstrap());
  const { store, persistor } = configureStore({});
  // https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/2395#issuecomment-651328378
  const Root = require('./containers/Root').default;
  root.render(<Root store={store} persistor={persistor} />);
}

if (
  credBootstrap.needsUnlock &&
  credBootstrap.kdf &&
  credBootstrap.verifierBlob
) {
  const { kdf, verifierBlob } = credBootstrap;
  root.render(
    <UnlockScreen
      kdf={kdf}
      verifierBlob={verifierBlob}
      onUnlocked={bootApp}
      onReset={bootApp}
    />,
  );
} else {
  bootApp();
}

/*// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);*/
