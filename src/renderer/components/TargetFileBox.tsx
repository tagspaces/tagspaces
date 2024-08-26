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

import React, { ReactNode } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import AppConfig from '-/AppConfig';
import { useDispatch } from 'react-redux';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import { Identifier } from 'dnd-core';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useMoveOrCopyFilesDialogContext } from '-/components/dialogs/hooks/useMoveOrCopyFilesDialogContext';

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
  const { readOnlyMode, findLocalLocation, findLocation } =
    useCurrentLocationContext();
  const { uploadFilesAPI } = useIOActionsContext();
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

  const handleCopyFiles = (files: Array<File>) => {
    if (readOnlyMode) {
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
      openFileUploadDialog();
      const localLocation = findLocalLocation();
      const sourceLocationId = localLocation ? localLocation.uuid : undefined;
      return uploadFilesAPI(
        files,
        dirPath,
        onUploadProgress,
        true,
        false,
        undefined,
        sourceLocationId,
      )
        .then((fsEntries: Array<TS.FileSystemEntry>) => {
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
          const location = findLocation(locationId);
          if (
            AppConfig.isElectron &&
            !location.haveObjectStoreSupport() &&
            !location.haveWebDavSupport()
          ) {
            return openMoveOrCopyFilesDialog(files, dirPath, location.uuid);
          } else {
            return handleCopyFiles(files);
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
          boxShadow: 'inset 0px 0px 0 5px ' + theme.palette.primary.main,
          borderRadius: 5,
          backgroundColor: alpha(theme.palette.primary.main, 0.5),
        }),
      }}
    >
      {children}
    </div>
  );
}

export default TargetFileBox;
