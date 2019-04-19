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

import i18n from './i18n';
import PlatformIO from './platform-io';
import AppConfig from '../config';

let ipcRenderer;

if (AppConfig.isElectron && window.require) {
  const electron = window.require('electron');
  ipcRenderer = electron.ipcRenderer;
}

export default function buildDesktopMenu(mainPageProps: Object) {
  if (!AppConfig.isElectron) {
    return;
  }

  ipcRenderer.on('file', (event, arg) => {
    // console.log('Global events: ' + arg);
    switch (arg) {
    case 'new-text-file':
      mainPageProps.toggleCreateFileDialog();
      break;
    case 'audio':
      // console.log('showAudioRecordingDialog');
      break;
    case 'next-file': {
      const path = mainPageProps.getNextFile();
      mainPageProps.openFile(path);
      mainPageProps.setLastSelectedEntry(path);
      break;
    }
    case 'previous-file': {
      const path = mainPageProps.getPrevFile();
      mainPageProps.openFile(path);
      mainPageProps.setLastSelectedEntry(path);
      break;
    }
    default:
      return false;
    }
  });

  ipcRenderer.on('play-pause', (event, arg) => {
    // Create the event.
    const audioEvent = new CustomEvent('toggle-resume', { detail: '' });
    window.dispatchEvent(audioEvent);
  });

  const templateDefault = [
    {
      label: i18n.t('core:file'),
      submenu: [
        /* {
          label: i18n.t('core:openNewInstance'),
          accelerator: '',
          click: () => {
            // ipcRenderer.send('new-win', 'newWin');
          }
        }, */
        /* {
          type: 'separator'
        }, */
        {
          label: i18n.t('core:newFileNote'),
          // accelerator: 'CommandOrControl+Alt+N',
          click: () => {
            mainPageProps.toggleCreateFileDialog();
          }
        },
        /* {
          label: i18n.t('core:createMarkdown'),
          accelerator: '',
          // click: createMDFile
        },
        {
          label: i18n.t('core:createRichTextFile'),
          accelerator: '',
          // click: createHTMLFile
        },
        */
        {
          type: 'separator'
        },
        {
          label: i18n.t('core:createDirectory'),
          accelerator: '',
          click: () => {
            mainPageProps.showCreateDirectoryDialog();
          }
        },
        {
          type: 'separator'
        },
        /* {
          label: i18n.t('core:saveFile'),
          accelerator: mainPageProps.keyBindings.saveDocument,
          click: () => {
            mainPageProps.saveFile();
          }
        },
        {
          type: 'separator'
        }, */
        /* {
          label: i18n.t('core:closeWin'),
          accelerator: '',
          click: (item, focusedWindow) => {
            focusedWindow.destroy();
          }
        }, */
        {
          label: i18n.t('core:exitApp'),
          accelerator: 'CmdOrCtrl+Q',
          click: PlatformIO.quitApp
        }
      ]
    },
    {
      label: i18n.t('core:edit'),
      submenu: [
        {
          label: i18n.t('core:undo'),
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: i18n.t('core:redo'),
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('core:cut'),
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: i18n.t('core:copy'),
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: i18n.t('core:paste'),
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: i18n.t('core:selectAll'),
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        },
      ]
    },
    {
      label: i18n.t('core:view'),
      submenu: [
        {
          label: i18n.t('core:showLocationManager'),
          accelerator: mainPageProps.keyBindings.showLocationManager,
          click: () => {
            mainPageProps.toggleLocationManager();
          }
        },
        {
          label: i18n.t('core:showTagLibrary'),
          accelerator: mainPageProps.keyBindings.showTagLibrary,
          click: () => {
            mainPageProps.toggleTagLibrary();
          }
        },
        {
          label: i18n.t('core:showSearch'),
          accelerator: mainPageProps.keyBindings.showSearch,
          click: () => {
            mainPageProps.toggleSearch();
          }
        },
        {
          label: i18n.t('core:showDevTools'),
          accelerator: mainPageProps.keyBindings.openDevTools,
          click: (item, focusedWindow) => {
            focusedWindow.toggleDevTools();
          }
        },
        {
          label: i18n.t('core:reloadApplication'),
          accelerator: mainPageProps.keyBindings.reloadApplication,
          click: (item, focusedWindow) => {
            // ipcRenderer.send('relaunch-app', 'relaunch');
            focusedWindow.webContents.reload();
          }
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('core:zoomReset'),
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainPageProps.setZoomResetApp();
          }
        },
        {
          label: i18n.t('core:zoomIn'),
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            mainPageProps.setZoomInApp();
          }
        },
        {
          label: i18n.t('core:zoomOut'),
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            mainPageProps.setZoomOutApp();
          }
        },
        {
          label: i18n.t('core:toggleFullScreen'),
          accelerator: mainPageProps.keyBindings.toggleFullScreen,
          click: (item, focusedWindow) => {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('core:settings'),
          click: () => {
            mainPageProps.toggleSettingsDialog();
          }
        },
      ]
    },
    {
      label: '&' + i18n.t('core:help'),
      submenu: [
        {
          label: '&' + i18n.t('core:documentation'),
          accelerator: mainPageProps.keyBindings.showHelp,
          click: () => {
            mainPageProps.openFileNatively('http://docs.tagspaces.org');
          }
        },
        {
          label: '&' + i18n.t('core:shortcutKeys'),
          click: () => {
            mainPageProps.toggleKeysDialog();
          }
        },
        {
          label: 'Welcome Wizzard',
          click: () => {
            mainPageProps.toggleOnboardingDialog();
          }
        },
        {
          label: '&' + i18n.t('core:whatsNew'),
          click: () => {
            mainPageProps.openFileNatively('http://www.tagspaces.org/whatsnew/');
          }
        },
        {
          type: 'separator'
        },
        {
          label: '&' + i18n.t('core:likeUsOnFacebook'),
          click: () => {
            mainPageProps.openFileNatively('https://www.facebook.com/tagspacesapp');
          }
        },
        {
          label: '&' + i18n.t('core:followOnTwitter'),
          click: () => {
            mainPageProps.openFileNatively('https://twitter.com/intent/user?screen_name=tagspaces');
          }
        },
        {
          type: 'separator'
        },
        {
          label: '&' + i18n.t('core:suggestNewFeatures'),
          click: () => {
            mainPageProps.openFileNatively('https://trello.com/b/TGeG5bi9');
          }
        },
        {
          label: '&' + i18n.t('core:reportIssues'),
          click: () => {
            mainPageProps.openFileNatively('https://github.com/tagspaces/tagspaces/issues/');
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Web clipper extension for Chrome',
          click: () => {
            mainPageProps.openFileNatively('https://chrome.google.com/webstore/detail/tagspaces-web-clipper/ldalmgifdlgpiiadeccbcjojljeanhjk');
          }
        },
        {
          label: 'Web clipper extension for Firefox',
          click: () => {
            mainPageProps.openFileNatively('https://addons.mozilla.org/en-US/firefox/addon/tagspaces/');
          }
        },
        {
          type: 'separator'
        },
        {
          label: '&' + i18n.t('core:license'),
          click: () => {
            mainPageProps.toggleLicenseDialog();
          }
        },
        {
          label: '&' + i18n.t('core:thirdPartyLibs'),
          click: () => {
            mainPageProps.toggleThirdPartyLibsDialog();
          }
        },
        {
          label: '&' + i18n.t('core:aboutTagSpaces'),
          click: () => {
            mainPageProps.toggleAboutDialog();
          }
        },
      ]
    }
  ];
  PlatformIO.initMainMenu(templateDefault);
}
