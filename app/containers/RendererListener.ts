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

import AppConfig from '-/config';

export default function listen(props) {
  let ipcRenderer;
  if (AppConfig.isElectron && window.require) {
    const electron = window.require('electron');
    ({ ipcRenderer } = electron);

    ipcRenderer.on('cmd', (event, arg) => {
      // console.log('Global events: ' + arg);
      switch (arg) {
        case 'new-text-file':
          props.toggleCreateFileDialog();
          break;
        case 'open-search':
          props.openSearchPanel();
          break;
        case 'open-location-manager-panel':
          props.openLocationManagerPanel();
          break;
        case 'open-tag-library-panel':
          props.openTagLibraryPanel();
          break;
        case 'audio':
          // console.log('showAudioRecordingDialog');
          break;
        case 'next-file': {
          props.openNextFile();
          break;
        }
        case 'previous-file': {
          props.openPrevFile();
          break;
        }
        case 'show-create-directory-dialog': {
          props.showCreateDirectoryDialog();
          break;
        }
        case 'toggle-open-link-dialog': {
          props.toggleOpenLinkDialog();
          break;
        }
        case 'go-back': {
          window.history.back();
          // console.log('navigate to: ' + window.location.href);
          break;
        }
        case 'go-forward': {
          window.history.forward();
          break;
        }
        case 'set-zoom-reset-app': {
          props.setZoomResetApp();
          break;
        }
        case 'set-zoom-in-app': {
          props.setZoomInApp();
          break;
        }
        case 'set-zoom-out-app': {
          props.setZoomOutApp();
          break;
        }
        case 'exit-fullscreen': {
          document.exitFullscreen();
          break;
        }
        case 'toggle-settings-dialog': {
          props.toggleSettingsDialog();
          break;
        }
        case 'open-help-feedback-panel': {
          props.openHelpFeedbackPanel();
          break;
        }
        case 'toggle-keys-dialog': {
          props.toggleKeysDialog();
          break;
        }
        case 'toggle-onboarding-dialog': {
          props.toggleOnboardingDialog();
          break;
        }
        case 'open-url-externally': {
          props.openURLExternally();
          break;
        }
        case 'toggle-license-dialog': {
          props.toggleLicenseDialog();
          break;
        }
        case 'toggle-third-party-libs-dialog': {
          props.toggleThirdPartyLibsDialog();
          break;
        }
        case 'toggle-about-dialog': {
          props.toggleAboutDialog();
          break;
        }
        default:
          return false;
      }
    });

    ipcRenderer.on('open-url-externally', (event, arg) => {
      const { url, skipConfirm } = arg;
      props.openURLExternally(url, skipConfirm);
    });

    ipcRenderer.on('play-pause', (event, arg) => {
      // Create the event.
      const audioEvent = new CustomEvent('toggle-resume', { detail: '' });
      window.dispatchEvent(audioEvent);
    });
  }
  return ipcRenderer;
}
