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

// import { webFrame, ipcRenderer } from 'electron';
import PlatformIO from './platform-io';
import i18n from './i18n';
import AppConfig from '../config';

export default function buildTrayIconMenu(mainPageProps: any) {
  if (!AppConfig.isElectron) {
    return;
  }

  const cKey = AppConfig.isMacLike ? '  -  Cmd' : ' - Ctrl';

  function openNextFile() {
    mainPageProps.openNextFile();
  }

  function openPrevFile() {
    mainPageProps.openPrevFile();
  }

  function playResumePlayback() {
    const audioEvent = new CustomEvent('toggle-resume', { detail: '' });
    window.dispatchEvent(audioEvent);
  }

  const trayMenuTemplate = [
    {
      label: i18n.t('core:showTagSpaces') + cKey + '+Shift+W',
      click: PlatformIO.showMainWindow
    },
    {
      label: i18n.t('core:showSearch') + cKey + '+Shift+F',
      click: mainPageProps.openSearchPanel
    },
    {
      type: 'separator'
    },
    {
      label: i18n.t('core:newFileNote') + cKey + '+Shift+N',
      click: mainPageProps.toggleCreateFileDialog
    },
    {
      type: 'separator'
    },
    {
      label: i18n.t('core:openNextFileTooltip') + cKey + '+Shift+D',
      click: openNextFile
    },
    {
      label: i18n.t('core:openPrevFileTooltip') + cKey + '+Shift+A',
      click: openPrevFile
    },
    {
      type: 'separator'
    },
    {
      label: i18n.t('core:pauseResumePlayback') + cKey + '+Shift+P',
      click: playResumePlayback
    },
    {
      type: 'separator'
    },
    {
      label: i18n.t('core:quitTagSpaces') + cKey + '+Q',
      click: PlatformIO.quitApp
    }
  ];
  PlatformIO.initTrayMenu(trayMenuTemplate);
}
