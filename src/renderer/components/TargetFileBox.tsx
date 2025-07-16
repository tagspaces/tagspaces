/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useMoveOrCopyFilesDialogContext } from '-/components/dialogs/hooks/useMoveOrCopyFilesDialogContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useFileUploadContext } from '-/hooks/useFileUploadContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import { alpha, useTheme } from '@mui/material/styles';
import { Identifier } from 'dnd-core';
import React, { ReactNode } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { CommonLocation } from '-/utils/CommonLocation';

type DragItem = { files: File[]; items: DataTransferItemList };
type DragProps = {
  isActive: boolean;
  handlerId: Identifier | null;
};

interface Props {
  children: ReactNode;
  accepts: Array<string>;
  directoryPath?: string;
  locationId?: string;
  style?: React.CSSProperties;
}

function TargetFileBox(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch: AppDispatch = useDispatch();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const { findLocalLocation, findLocation } = useCurrentLocationContext();
  const { setMetaUpload } = useFileUploadContext();
  const { uploadFilesAPI, uploadMeta } = useIOActionsContext();
  const { showNotification } = useNotificationContext();
  const { setReflectMetaActions } = useEditedEntryMetaContext();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const { openMoveOrCopyFilesDialog } = useMoveOrCopyFilesDialogContext();
  //const ref = useRef<HTMLDivElement>(null);
  const { children, accepts, directoryPath, style, locationId } = props;
  const dirPath = directoryPath ? directoryPath : currentDirectoryPath;

  const onUploadProgress = (progress, abort, fileName) => {
    dispatch(AppActions.onUploadProgress(progress, abort, fileName));
  };

  const handleCopyFiles = (
    files: Array<File>,
    targetLocation: CommonLocation,
  ) => {
    if (targetLocation?.isReadOnly) {
      showNotification(t('core:dndDisabledReadOnlyMode'), 'error', true);
      return Promise.reject(t('core:dndDisabledReadOnlyMode'));
    }
    if (files) {
      console.log('Dropped files: ' + JSON.stringify(files));
      if (dirPath === undefined) {
        showNotification(
          'Importing files failed, because no folder is opened in TagSpaces!',
          'error',
          true,
        );
        return Promise.reject(
          new Error(
            'Importing files failed, because no folder is opened in TagSpaces!',
          ),
        );
      }
      dispatch(AppActions.resetProgress());
      openFileUploadDialog(undefined, undefined);
      const localLocation = findLocalLocation();
      const sourceLocationId = localLocation ? localLocation.uuid : undefined;
      return uploadFilesAPI(
        files,
        dirPath,
        onUploadProgress,
        false,
        false,
        targetLocation.uuid,
        sourceLocationId,
      )
        .then((fsEntries: Array<TS.FileSystemEntry>) => {
          setMetaUpload(() =>
            uploadMeta(
              files.map((f) => f.path),
              dirPath,
              onUploadProgress,
              false,
              targetLocation.uuid,
              sourceLocationId,
            ),
          );
          const actions: TS.EditMetaAction[] = fsEntries.map((entry) => ({
            action: 'thumbGenerate',
            entry: entry,
          }));
          setReflectMetaActions(...actions);
          return true;
        })
        .catch((error) => {
          console.log('uploadFiles', error);
        });
    }
    return Promise.reject(new Error('on files'));
  };

  const [collectedProps, drop] = useDrop<DragItem, unknown, DragProps>(
    () => ({
      accept: accepts,
      drop: ({ files }, m) => {
        const didDrop = m.didDrop();
        if (didDrop) {
          return;
        }

        if (files && files.length) {
          if (AppConfig.isElectron) {
            files = files.map((file) => {
              if (!file.path) {
                file.path = window.electronIO.ipcRenderer.getPathForFile(file);
              }
              return file;
            });
          }
          const targetLocation = findLocation(locationId);
          if (
            AppConfig.isElectron &&
            !targetLocation.haveObjectStoreSupport() &&
            !targetLocation.haveWebDavSupport()
          ) {
            return openMoveOrCopyFilesDialog(
              files,
              dirPath,
              targetLocation.uuid,
            );
          } else {
            return handleCopyFiles(files, targetLocation);
          }
        }
      },
      collect: (m: DropTargetMonitor) => ({
        handlerId: m.getHandlerId(),
        /*isOver: m.isOver(),*/
        isActive: m.isOver({ shallow: true }) && m.canDrop(),
      }),
    }),
    [dirPath],
  );

  const { isActive, handlerId } = collectedProps;
  return (
    <div
      ref={drop}
      style={{
        ...style,
        ...(isActive && {
          // boxShadow: 'inset 0px 0px 0 5px ' + theme.palette.primary.main,
          borderRadius: 5,
          backgroundColor: alpha(theme.palette.primary.main, 0.7),
        }),
      }}
    >
      {children}
    </div>
  );
}

export default TargetFileBox;
