/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces UG (haftungsbeschraenkt)
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

import React, { createContext, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import AppConfig from '-/AppConfig';
import { actions as SettingsActions } from '-/reducers/settings';
import { Extensions } from '../../main/types';

type RendererListenerContextData = {};

export const RendererListenerContext =
  createContext<RendererListenerContextData>({});

export type RendererListenerContextProviderProps = {
  children: React.ReactNode;
};

/**
 * @deprecated find better places for this
 * @param children
 * @constructor
 */
export const RendererListenerContextProvider = ({
  children,
}: RendererListenerContextProviderProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { setSearchQuery } = useDirectoryContentContext();
  const { goForward, goBack, openNextFile, openPrevFile } =
    useOpenedEntryContext();

  useEffect(() => {
    if (AppConfig.isElectron) {
      //const electron = window.require('electron');
      //({ ipcRenderer } = electron);

      destroy();

      window.electronIO.ipcRenderer.on('cmd', (arg) => {
        // console.log('Global events: ' + arg);
        switch (arg) {
          case 'new-text-file':
            dispatch(AppActions.toggleNewFileDialog());
            break;
          case 'open-search':
            setSearchQuery({ textQuery: '' });
            break;
          case 'open-location-manager-panel':
            dispatch(AppActions.openLocationManagerPanel());
            break;
          case 'open-tag-library-panel':
            dispatch(AppActions.openTagLibraryPanel());
            break;
          case 'audio':
            // console.log('showAudioRecordingDialog');
            break;
          case 'next-file': {
            openNextFile();
            break;
          }
          case 'previous-file': {
            openPrevFile();
            break;
          }
          case 'show-create-directory-dialog': {
            dispatch(AppActions.showCreateDirectoryDialog());
            break;
          }
          case 'toggle-open-link-dialog': {
            dispatch(AppActions.toggleOpenLinkDialog());
            break;
          }
          case 'go-back': {
            goBack();
            break;
          }
          case 'go-forward': {
            goForward();
            break;
          }
          case 'set-zoom-reset-app': {
            dispatch(SettingsActions.setZoomResetApp());
            break;
          }
          case 'set-zoom-in-app': {
            dispatch(SettingsActions.setZoomInApp());
            break;
          }
          case 'set-zoom-out-app': {
            dispatch(SettingsActions.setZoomOutApp());
            break;
          }
          case 'exit-fullscreen': {
            try {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              }
            } catch (e) {
              console.log('Failed to exit fullscreen mode:', e);
            }
            break;
          }
          case 'toggle-settings-dialog': {
            dispatch(AppActions.toggleSettingsDialog());
            break;
          }
          case 'open-help-feedback-panel': {
            dispatch(AppActions.openHelpFeedbackPanel());
            break;
          }
          case 'toggle-keys-dialog': {
            dispatch(AppActions.toggleKeysDialog());
            break;
          }
          case 'toggle-onboarding-dialog': {
            dispatch(AppActions.toggleOnboardingDialog());
            break;
          }
          /*case 'open-url-externally': {
            props.openURLExternally();
            break;
          }*/
          case 'toggle-license-dialog': {
            dispatch(AppActions.toggleLicenseDialog());
            break;
          }
          case 'toggle-third-party-libs-dialog': {
            dispatch(AppActions.toggleThirdPartyLibsDialog());
            break;
          }
          case 'toggle-about-dialog': {
            dispatch(AppActions.toggleAboutDialog());
            break;
          }
          default:
            return false;
        }
      });

      /*ipcRenderer.on('open-url-externally', (event, arg) => {
        const { url, skipConfirm } = arg;
        props.openURLExternally(url, skipConfirm);
      });*/

      window.electronIO.ipcRenderer.on('play-pause', () => {
        // Create the event.
        const audioEvent = new CustomEvent('toggle-resume', { detail: '' });
        window.dispatchEvent(audioEvent);
      });

      window.electronIO.ipcRenderer.on('set_extensions', (arg: Extensions) => {
        const { extensions, supportedFileTypes } = arg;
        dispatch(AppActions.addExtensions(extensions));
        dispatch(SettingsActions.addSupportedFileTypes(supportedFileTypes));
        //console.debug('extensions', extensions);
        //console.debug('supportedFileTypes', supportedFileTypes);
      });

      /*ipcRenderer.on('start_ws', (event, arg) => {
        const { port } = arg;
        console.debug('RendererListener start_ws port:' + port);
        settings.setUsedWsPort(port);
      });*/
    }
    return () => {
      destroy();
    };
  }, [openNextFile, openPrevFile]);

  function destroy() {
    if (window.electronIO.ipcRenderer) {
      window.electronIO.ipcRenderer.removeAllListeners('cmd');
      window.electronIO.ipcRenderer.removeAllListeners('play-pause');
      window.electronIO.ipcRenderer.removeAllListeners('set_extensions');
      window.electronIO.ipcRenderer.removeAllListeners('start_ws');
    }
  }

  const context = useMemo(() => {
    return {};
  }, []);

  return (
    <RendererListenerContext.Provider value={context}>
      {children}
    </RendererListenerContext.Provider>
  );
};
