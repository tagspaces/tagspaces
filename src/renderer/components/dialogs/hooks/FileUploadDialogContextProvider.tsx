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

import React, { createContext, useMemo, useReducer, useRef } from 'react';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';
import FileUploadDialog from '-/components/dialogs/FileUploadDialog';
import AppConfig from '-/AppConfig';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDispatch } from 'react-redux';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { selectDirectoryDialog } from '-/services/utils-io';

type FileUploadDialogContextData = {
  openFileUploadDialog: (targetPath?: string, dialogTitle?: string) => void;
  closeFileUploadDialog: () => void;
  downloadFileURL: (fileUrl: string) => void;
};

export const FileUploadDialogContext =
  createContext<FileUploadDialogContextData>({
    openFileUploadDialog: undefined,
    closeFileUploadDialog: undefined,
    downloadFileURL: undefined,
  });

export type FileUploadDialogContextProviderProps = {
  children: React.ReactNode;
};

export const FileUploadDialogContextProvider = ({
  children,
}: FileUploadDialogContextProviderProps) => {
  const { t } = useTranslation();
  const { currentLocation, findLocalLocation } = useCurrentLocationContext();
  const { downloadFile } = useIOActionsContext();
  const { showNotification } = useNotificationContext();
  const open = useRef<boolean>(false);
  const targetPath = useRef<string>(undefined);
  const dialogTitle = useRef<string>('importDialogTitle');

  const dispatch: AppDispatch = useDispatch();

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog(tPath?: string, dTitle?: string) {
    open.current = true;
    targetPath.current = tPath;
    if (dTitle) {
      dialogTitle.current = dTitle;
    }
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    targetPath.current = undefined;
    dialogTitle.current = 'importDialogTitle';
    forceUpdate();
  }

  function downloadFileURL(fileUrl: string) {
    if (fileUrl) {
      try {
        const url = new URL(fileUrl);
        let fileName;
        let pathParts;
        if (url.pathname) {
          const delimiterIndex = url.pathname.lastIndexOf('/');
          if (delimiterIndex > -1) {
            fileName = url.pathname.substring(delimiterIndex + 1);
            if (!fileName) {
              pathParts = url.pathname.split('/').filter(Boolean);
            }
          } else {
            fileName = url.pathname;
          }
        }
        if (!fileName) {
          fileName =
            url.hostname +
            (pathParts && pathParts.length > 0 ? pathParts.join('-') : '');
        } else if (fileName.indexOf('.') === -1) {
          fileName = url.hostname + '-' + fileName;
        }
        if (AppConfig.isElectron) {
          selectDirectoryDialog()
            .then((selectedPaths) => {
              const selectedPath = decodeURI(selectedPaths[0]);
              dispatch(AppActions.resetProgress());
              openDialog();
              window.electronIO.ipcRenderer
                .invoke(
                  'downloadFile',
                  { path: selectedPath + '/' + decodeURIComponent(fileName) },
                  fileUrl,
                  true,
                )
                .then((success) => console.log('downloadFile:' + success));

              /*const onUploadProgress = (progress, abort, fileName) => {
                dispatch(
                  AppActions.onUploadProgress(progress, abort, fileName),
                );
              };
              // todo move download file in Electron main thread
              downloadFile(
                fileUrl,
                selectedPath + '/' + decodeURIComponent(fileName),
                findLocalLocation().uuid,
                onUploadProgress,
              )
                .then(() => {
                  if (currentLocation.haveObjectStoreSupport()) {
                    // currently objectStore location in downloadFile use saveFilePromise and this function not have progress handling
                    dispatch(AppActions.setProgress(fileUrl, 100));
                  }
                })
                .catch((e) => {
                  console.log('downloadFile error:', e);
                  dispatch(
                    AppActions.setProgress(fileUrl, -1, t('core:errorCORS')),
                  );
                  showNotification(
                    'downloadFile error' + e.message,
                    'error',
                    true,
                  );
                });*/
            })
            .catch((err) => {
              console.log('selectDirectoryDialog failed with: ' + err);
            });
        } else {
          saveAs(fileUrl, decodeURIComponent(fileName));
        }
      } catch (ex) {
        console.log('downloadURL', ex);
      }
    }
  }

  const context = useMemo(() => {
    return {
      openFileUploadDialog: openDialog,
      closeFileUploadDialog: closeDialog,
      downloadFileURL,
    };
  }, []);

  return (
    <FileUploadDialogContext.Provider value={context}>
      {children}
      <FileUploadDialog
        open={open.current}
        onClose={() => closeDialog()}
        title={dialogTitle.current}
        targetPath={targetPath.current}
      />
    </FileUploadDialogContext.Provider>
  );
};
