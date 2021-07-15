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

import { app, Menu, Tray } from 'electron';
import pathLib from 'path';
// import TrayIcon2x from '-/assets/icons/trayIcon@2x.png';
// import TrayIcon from '-/assets/icons/trayIcon.png';
// import TrayIcon3x from '-/assets/icons/trayIcon@3x.png';

export default function buildTrayIconMenu(mainPageProps: any, i18n, isMacLike) {
  const cKey = isMacLike ? ' -  Cmd' : ' - Ctrl';

  function openNextFile() {
    mainPageProps.openNextFile();
  }

  function openPrevFile() {
    mainPageProps.openPrevFile();
  }

  function playResumePlayback() {
    mainPageProps.resumePlayback();
  }

  function quitApp() {
    app.quit();
  }

  const trayMenuTemplate = [
    {
      label: i18n.t('showTagSpaces') + cKey + '+Shift+W',
      click: mainPageProps.showTagSpaces
    },
    {
      label: i18n.t('showSearch') + cKey + '+Shift+F',
      click: mainPageProps.openSearchPanel
    },
    {
      type: 'separator'
    },
    {
      label: i18n.t('newFileNote') + cKey + '+Shift+N',
      click: mainPageProps.toggleCreateFileDialog
    },
    {
      type: 'separator'
    },
    {
      label: i18n.t('openNextFileTooltip') + cKey + '+Shift+D',
      click: openNextFile
    },
    {
      label: i18n.t('openPrevFileTooltip') + cKey + '+Shift+A',
      click: openPrevFile
    },
    {
      type: 'separator'
    },
    {
      label: i18n.t('pauseResumePlayback') + cKey + '+Shift+P',
      click: playResumePlayback
    },
    {
      type: 'separator'
    },
    {
      label: i18n.t('quitTagSpaces') + cKey + '+Q',
      click: quitApp
    }
  ];

  /* let nImage;

  if (process.platform === 'win32') {
    nImage = nativeImage.createFromDataURL(TrayIcon2x);
  } else if (process.platform === 'darwin') {
    nImage = nativeImage.createFromDataURL(TrayIcon);
    nImage.addRepresentation({
      scaleFactor: 2.0,
      dataURL: TrayIcon2x
    });
    nImage.addRepresentation({
      scaleFactor: 3.0,
      dataURL: TrayIcon3x
    });
  } else {
    nImage = nativeImage.createFromDataURL(TrayIcon2x);
  } */

  // const tray = new Tray(nImage);
  const tray = new Tray(
    pathLib.resolve(__dirname, 'assets', 'icons', 'trayIcon@2x.png')
  );
  tray.on('click', () => {
    mainPageProps.showTagSpaces();
  });

  // @ts-ignore
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  tray.setToolTip('TagSpaces');
  tray.setContextMenu(contextMenu);
  return tray;
}
