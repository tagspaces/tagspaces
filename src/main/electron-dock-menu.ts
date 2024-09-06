/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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

import { app, Menu } from 'electron';

export default function buildDockMenu(mainPageProps: any, i18n) {
  function openNextFile() {
    mainPageProps.openNextFile();
  }

  function openPrevFile() {
    mainPageProps.openPrevFile();
  }

  function playResumePlayback() {
    mainPageProps.resumePlayback();
  }

  const dockMenuTemplate = [
    {
      label: i18n.t('newWindow'),
      click: () => mainPageProps.createNewWindowInstance(),
    },
    {
      type: 'separator',
    },
    {
      label: i18n.t('showTagSpaces'),
      click: mainPageProps.showTagSpaces,
    },
    {
      label: i18n.t('showSearch'),
      click: mainPageProps.openSearch,
    },
    {
      type: 'separator',
    },
    {
      label: i18n.t('newFileNote'),
      click: mainPageProps.toggleNewFileDialog,
    },
    {
      type: 'separator',
    },
    {
      label: i18n.t('openNextFileTooltip'),
      click: openNextFile,
    },
    {
      label: i18n.t('openPrevFileTooltip'),
      click: openPrevFile,
    },
    {
      type: 'separator',
    },
    {
      label: i18n.t('pauseResumePlayback'),
      click: playResumePlayback,
    },
  ];

  // @ts-ignore
  const dockMenu = Menu.buildFromTemplate(dockMenuTemplate);
  return dockMenu;
}
