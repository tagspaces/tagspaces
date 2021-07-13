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

import { app, Menu } from 'electron';
import i18n from './i18n';
import Links from '-/links';

export default function buildDesktopMenu(mainPageProps: any) {
  function quitApp() {
    app.quit();
  }

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
          click: mainPageProps.toggleCreateFileDialog
        },
        {
          label: i18n.t('core:createDirectory'),
          accelerator: '',
          click: mainPageProps.showCreateDirectoryDialog
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('core:openLink'),
          accelerator: 'Ctrl+o',
          click: mainPageProps.toggleOpenLinkDialog
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
        }, */
        {
          type: 'separator'
        },
        {
          label: i18n.t('core:exitApp'),
          accelerator: 'CmdOrCtrl+Q',
          click: quitApp // PlatformIO.quitApp
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
        }
      ]
    },
    {
      label: i18n.t('core:view'),
      submenu: [
        {
          label: i18n.t('core:showLocationManager'),
          accelerator: mainPageProps.keyBindings.showLocationManager,
          click: mainPageProps.openLocationManagerPanel
        },
        {
          label: i18n.t('core:showTagLibrary'),
          accelerator: mainPageProps.keyBindings.showTagLibrary,
          click: mainPageProps.openTagLibraryPanel
        },
        {
          label: i18n.t('core:showSearch'),
          accelerator: mainPageProps.keyBindings.showSearch,
          click: mainPageProps.openSearchPanel
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
          label: i18n.t('core:goback'),
          accelerator: 'Alt+Left',
          click: () => {
            window.history.back();
            console.log('navigate to: ' + window.location.href);
          }
        },
        {
          label: i18n.t('core:goforward'),
          accelerator: 'Alt+Right',
          click: () => {
            window.history.forward();
            console.log('navigate to: ' + window.location.href);
          }
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('core:zoomReset'),
          accelerator: 'CmdOrCtrl+0',
          click: mainPageProps.setZoomResetApp
        },
        {
          label: i18n.t('core:zoomIn'),
          accelerator: 'CmdOrCtrl+Plus',
          click: mainPageProps.setZoomInApp
        },
        {
          label: i18n.t('core:zoomOut'),
          accelerator: 'CmdOrCtrl+-',
          click: mainPageProps.setZoomOutApp
        },
        {
          label: i18n.t('core:toggleFullScreen'),
          accelerator: mainPageProps.keyBindings.toggleFullScreen,
          click: (item, focusedWindow) => {
            if (focusedWindow.isFullScreen()) {
              document.exitFullscreen();
              focusedWindow.setFullScreen(false);
            } else {
              focusedWindow.setFullScreen(true);
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('core:settings'),
          click: mainPageProps.toggleSettingsDialog
        }
      ]
    },
    {
      label: '&' + i18n.t('core:help'),
      submenu: [
        {
          label: '&' + i18n.t('core:documentation'),
          accelerator: mainPageProps.keyBindings.showHelp,
          click: mainPageProps.openHelpFeedbackPanel
        },
        {
          label: '&' + i18n.t('core:shortcutKeys'),
          click: mainPageProps.toggleKeysDialog
        },
        {
          label: 'Welcome Wizzard',
          click: mainPageProps.toggleOnboardingDialog
        },
        {
          label: '&' + i18n.t('core:whatsNew'),
          click: () => {
            mainPageProps.openURLExternally(Links.links.changelogURL, true);
          }
        },
        {
          type: 'separator'
        },
        {
          label: '&' + i18n.t('core:likeUsOnFacebook'),
          click: () => {
            mainPageProps.openURLExternally(Links.links.facebook);
          }
        },
        {
          label: '&' + i18n.t('core:followOnTwitter'),
          click: () => {
            mainPageProps.openURLExternally(Links.links.twitter);
          }
        },
        {
          type: 'separator'
        },
        {
          label: '&' + i18n.t('core:suggestNewFeatures'),
          click: () => {
            mainPageProps.openURLExternally(Links.links.suggestFeature);
          }
        },
        {
          label: '&' + i18n.t('core:reportIssues'),
          click: () => {
            mainPageProps.openURLExternally(Links.links.reportIssue);
          }
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('core:webClipperChrome'),
          click: () => {
            mainPageProps.openURLExternally(Links.links.webClipperChrome, true);
          }
        },
        {
          label: i18n.t('core:webClipperFirefox'),
          click: () => {
            mainPageProps.openURLExternally(
              Links.links.webClipperFirefox,
              true
            );
          }
        },
        {
          type: 'separator'
        },
        {
          label: '&' + i18n.t('core:license'),
          click: mainPageProps.toggleLicenseDialog
        },
        {
          label: '&' + i18n.t('core:thirdPartyLibs'),
          click: mainPageProps.toggleThirdPartyLibsDialog
        },
        {
          label: '&' + i18n.t('core:aboutTagSpaces'),
          click: mainPageProps.toggleAboutDialog
        }
      ]
    }
  ];
  // PlatformIO.initMainMenu(templateDefault);

  // @ts-ignore
  const defaultMenu = Menu.buildFromTemplate(templateDefault); // menuConfig);
  Menu.setApplicationMenu(defaultMenu);
}
