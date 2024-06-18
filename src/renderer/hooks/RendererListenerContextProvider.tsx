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
import { getNextFile, getPrevFile } from '-/services/utils-io';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import useEventListener from '-/utils/useEventListener';
import { useCreateDirectoryDialogContext } from '-/components/dialogs/hooks/useCreateDirectoryDialogContext';
import { useNewFileDialogContext } from '-/components/dialogs/hooks/useNewFileDialogContext';
import { useLicenseDialogContext } from '-/components/dialogs/hooks/useLicenseDialogContext';
import { useThirdPartyLibsDialogContext } from '-/components/dialogs/hooks/useThirdPartyLibsDialogContext';
import { useAboutDialogContext } from '-/components/dialogs/hooks/useAboutDialogContext';
import { useOnboardingDialogContext } from '-/components/dialogs/hooks/useOnboardingDialogContext';
import { useKeyboardDialogContext } from '-/components/dialogs/hooks/useKeyboardDialogContext';
import { useLinkDialogContext } from '-/components/dialogs/hooks/useLinkDialogContext';
import { useSettingsDialogContext } from '-/components/dialogs/hooks/useSettingsDialogContext';
import { usePanelsContext } from '-/hooks/usePanelsContext';

type RendererListenerContextData = {
  openNextFile: (path?: string) => void;
  openPrevFile: (path?: string) => void;
};

export const RendererListenerContext =
  createContext<RendererListenerContextData>({
    openNextFile: undefined,
    openPrevFile: undefined,
  });

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
  const { selectedEntries, setSelectedEntries } = useSelectedEntriesContext();
  const { setSearchQuery } = useDirectoryContentContext();
  const { goForward, goBack, openFsEntry } = useOpenedEntryContext();
  const { sortedDirContent } = useSortedDirContext();
  const { openCreateDirectoryDialog } = useCreateDirectoryDialogContext();
  const { openNewFileDialog } = useNewFileDialogContext();
  const { openLicenseDialog } = useLicenseDialogContext();
  const { openThirdPartyLibsDialog } = useThirdPartyLibsDialogContext();
  const { openAboutDialog } = useAboutDialogContext();
  const { openOnboardingDialog } = useOnboardingDialogContext();
  const { openKeyboardDialog } = useKeyboardDialogContext();
  const { openLinkDialog } = useLinkDialogContext();
  const { openSettingsDialog } = useSettingsDialogContext();
  const { showPanel } = usePanelsContext();

  useEffect(() => {
    if (AppConfig.isElectron) {
      //const electron = window.require('electron');
      //({ ipcRenderer } = electron);

      destroy();

      window.electronIO.ipcRenderer.on('cmd', (arg) => {
        // console.log('Global events: ' + arg);
        switch (arg) {
          case 'new-text-file':
            openNewFileDialog();
            break;
          case 'open-search':
            setSearchQuery({ textQuery: '' });
            break;
          case 'open-location-manager-panel':
            showPanel('locationManagerPanel');
            break;
          case 'open-tag-library-panel':
            showPanel('tagLibraryPanel');
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
            openCreateDirectoryDialog();
            break;
          }
          case 'toggle-open-link-dialog': {
            openLinkDialog();
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
            openSettingsDialog();
            break;
          }
          case 'open-help-feedback-panel': {
            showPanel('helpFeedbackPanel');
            break;
          }
          case 'toggle-keys-dialog': {
            openKeyboardDialog();
            break;
          }
          case 'toggle-onboarding-dialog': {
            openOnboardingDialog();
            break;
          }
          /*case 'open-url-externally': {
            props.openURLExternally();
            break;
          }*/
          case 'toggle-license-dialog': {
            openLicenseDialog();
            break;
          }
          case 'toggle-third-party-libs-dialog': {
            openThirdPartyLibsDialog();
            break;
          }
          case 'toggle-about-dialog': {
            openAboutDialog();
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

      /* window.electronIO.ipcRenderer.on('set_extensions', (arg: Extensions) => {
        const { extensions, supportedFileTypes } = arg;
        dispatch(AppActions.addExtensions(extensions));
        dispatch(SettingsActions.addSupportedFileTypes(supportedFileTypes));
        //console.debug('extensions', extensions);
        //console.debug('supportedFileTypes', supportedFileTypes);
      });*/

      /*ipcRenderer.on('start_ws', (event, arg) => {
        const { port } = arg;
        console.debug('RendererListener start_ws port:' + port);
        settings.setUsedWsPort(port);
      });*/
      return () => {
        destroy();
      };
    }
  }, [sortedDirContent, selectedEntries]);

  useEventListener('previous-file', (e) => {
    openPrevFile();
  });
  useEventListener('next-file', (e) => {
    openNextFile();
  });

  function destroy() {
    if (window.electronIO.ipcRenderer) {
      window.electronIO.ipcRenderer.removeAllListeners('cmd');
      window.electronIO.ipcRenderer.removeAllListeners('play-pause');
      //window.electronIO.ipcRenderer.removeAllListeners('set_extensions');
      window.electronIO.ipcRenderer.removeAllListeners('start_ws');
    }
  }

  function openNextFile(path?: string) {
    const nextFile = getNextFile(
      path,
      selectedEntries && selectedEntries.length > 0
        ? selectedEntries[selectedEntries.length - 1].path
        : undefined,
      sortedDirContent,
    );
    if (nextFile !== undefined) {
      openFsEntry(nextFile);
      // dispatch(actions.setLastSelectedEntry(nextFile.path));
      setSelectedEntries([nextFile]);
      return nextFile;
    }
  }

  function openPrevFile(path?: string) {
    const prevFile = getPrevFile(
      path,
      selectedEntries && selectedEntries.length > 0
        ? selectedEntries[selectedEntries.length - 1].path
        : undefined,
      sortedDirContent,
    );
    if (prevFile !== undefined) {
      openFsEntry(prevFile);
      // dispatch(actions.setLastSelectedEntry(prevFile.path));
      setSelectedEntries([prevFile]);
    }
  }

  const context = useMemo(() => {
    return {
      openNextFile,
      openPrevFile,
    };
  }, [sortedDirContent, selectedEntries]);

  return (
    <RendererListenerContext.Provider value={context}>
      {children}
    </RendererListenerContext.Provider>
  );
};
