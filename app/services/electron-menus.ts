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
import Links from '-/links';

export default function buildDesktopMenu(props: any, i18n) {
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
          click: props.toggleCreateFileDialog
        },
        {
          label: i18n.t('core:createDirectory'),
          accelerator: '',
          click: props.showCreateDirectoryDialog
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('core:openLink'),
          accelerator: 'Ctrl+o',
          click: props.toggleOpenLinkDialog
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
          accelerator: props.keyBindings.showLocationManager,
          click: props.openLocationManagerPanel
        },
        {
          label: i18n.t('core:showTagLibrary'),
          accelerator: props.keyBindings.showTagLibrary,
          click: props.openTagLibraryPanel
        },
        {
          label: i18n.t('core:showSearch'),
          accelerator: props.keyBindings.showSearch,
          click: props.openSearchPanel
        },
        {
          label: i18n.t('core:showDevTools'),
          accelerator: props.keyBindings.openDevTools,
          click: (item, focusedWindow) => {
            focusedWindow.toggleDevTools();
          }
        },
        {
          label: i18n.t('core:reloadApplication'),
          accelerator: props.keyBindings.reloadApplication,
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
          click: props.goBack
        },
        {
          label: i18n.t('core:goforward'),
          accelerator: 'Alt+Right',
          click: props.goForward
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('core:zoomReset'),
          accelerator: 'CmdOrCtrl+0',
          click: props.setZoomResetApp
        },
        {
          label: i18n.t('core:zoomIn'),
          accelerator: 'CmdOrCtrl+Plus',
          click: props.setZoomInApp
        },
        {
          label: i18n.t('core:zoomOut'),
          accelerator: 'CmdOrCtrl+-',
          click: props.setZoomOutApp
        },
        {
          label: i18n.t('core:toggleFullScreen'),
          accelerator: props.keyBindings.toggleFullScreen,
          click: (item, focusedWindow) => {
            // props.toggleFullScreen
            if (focusedWindow.isFullScreen()) {
              props.exitFullscreen();
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
          click: props.toggleSettingsDialog
        }
      ]
    },
    {
      label: '&' + i18n.t('core:help'),
      submenu: [
        {
          label: '&' + i18n.t('core:documentation'),
          accelerator: props.keyBindings.showHelp,
          click: props.openHelpFeedbackPanel
        },
        {
          label: '&' + i18n.t('core:shortcutKeys'),
          click: props.toggleKeysDialog
        },
        {
          label: 'Welcome Wizzard',
          click: props.toggleOnboardingDialog
        },
        {
          label: '&' + i18n.t('core:whatsNew'),
          click: () => {
            props.openURLExternally({
              url: Links.links.changelogURL,
              skipConfirm: true
            });
          }
        },
        {
          type: 'separator'
        },
        {
          label: '&' + i18n.t('core:likeUsOnFacebook'),
          click: () => {
            props.openURLExternally({
              url: Links.links.facebook
            });
          }
        },
        {
          label: '&' + i18n.t('core:followOnTwitter'),
          click: () => {
            props.openURLExternally({
              url: Links.links.twitter
            });
          }
        },
        {
          type: 'separator'
        },
        {
          label: '&' + i18n.t('core:suggestNewFeatures'),
          click: () => {
            props.openURLExternally({
              url: Links.links.suggestFeature
            });
          }
        },
        {
          label: '&' + i18n.t('core:reportIssues'),
          click: () => {
            props.openURLExternally({
              url: Links.links.reportIssue
            });
          }
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('core:webClipperChrome'),
          click: () => {
            props.openURLExternally({
              url: Links.links.webClipperChrome,
              skipConfirm: true
            });
          }
        },
        {
          label: i18n.t('core:webClipperFirefox'),
          click: () => {
            props.openURLExternally({
              url: Links.links.webClipperFirefox,
              skipConfirm: true
            });
          }
        },
        {
          type: 'separator'
        },
        {
          label: '&' + i18n.t('core:license'),
          click: props.toggleLicenseDialog
        },
        {
          label: '&' + i18n.t('core:thirdPartyLibs'),
          click: props.toggleThirdPartyLibsDialog
        },
        {
          label: '&' + i18n.t('core:aboutTagSpaces'),
          click: props.toggleAboutDialog
        }
      ]
    }
  ];
  // PlatformIO.initMainMenu(templateDefault);

  // @ts-ignore
  const defaultMenu = Menu.buildFromTemplate(templateDefault); // menuConfig);
  Menu.setApplicationMenu(defaultMenu);
}
