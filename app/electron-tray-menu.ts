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

import { app, Menu, nativeImage, Tray } from 'electron';
// import TrayIcon2x from '-/assets/icons/trayIcon@2x.png';
// import TrayIcon from '-/assets/icons/trayIcon.png';
// import TrayIcon3x from '-/assets/icons/trayIcon@3x.png';

let tray = null;

export default function buildTrayIconMenu(mainPageProps: any, i18n, isMacLike) {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,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'
  );
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
      click: mainPageProps.openSearch
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
  if (!tray) {
    tray = new Tray(icon);
  }
  /* tray.on('click', () => {
    mainPageProps.showTagSpaces();
  }); */

  // @ts-ignore
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  tray.setToolTip('TagSpaces');
  tray.setContextMenu(contextMenu);
  // return tray;
}
