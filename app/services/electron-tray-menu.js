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

// import { webFrame, ipcRenderer } from 'electron';
import PlatformIO from './platform-io';
import i18n from './i18n';
import AppConfig from '../config';

export default function buildTrayIconMenu(mainPageProps: Object) {
  if (!AppConfig.isElectron) {
    return;
  }
  const trayMenuTemplate = [
    {
      label: 'TagSpaces', // (' + ctrlName + '+Alt+W)',
      accelerator: 'CmdOrCtrl+Alt+W',
      click: () => {
        PlatformIO.showMainWindow();
      }
    },
    {
      type: 'separator'
    },
    {
      label: i18n.t('core:newFileNote'), //  (' + ctrlName + '+Alt+N)',
      // accelerator: '',
      click: () => {
        mainPageProps.toggleCreateFileDialog();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Open Next File',
      accelerator: 'CmdOrCtrl+Alt+D',
      click: () => {
        mainPageProps.getNextFile();
      }
    },
    {
      label: 'Open Previous File',
      accelerator: 'CmdOrCtrl+Alt+A',
      click: () => {
        mainPageProps.getPrevFile();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Pause/Resume Playback',
      accelerator: 'CmdOrCtrl+Alt+P',
      click: () => {
        const audioEvent = new CustomEvent('toggle-resume', { detail: 'audioevent' });
        window.dispatchEvent(audioEvent);
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit TagSpaces',
      click: () => {
        PlatformIO.quitApp();
      }
    }
  ];
  PlatformIO.initTrayMenu(trayMenuTemplate);
}
