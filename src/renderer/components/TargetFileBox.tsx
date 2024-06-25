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
import { useTranslation } from 'react-i18next';
import AppConfig from '-/AppConfig';
import { useDispatch, useSelector } from 'react-redux';
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
}

function TargetFileBox(props: Props) {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const { currentLocation, readOnlyMode, findLocalLocation } =
    useCurrentLocationContext();
  const { uploadFilesAPI } = useIOActionsContext();
  const { showNotification } = useNotificationContext();
  const { setReflectMetaActions } = useEditedEntryMetaContext();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const { openMoveOrCopyFilesDialog } = useMoveOrCopyFilesDialogContext();
  //const ref = useRef<HTMLDivElement>(null);
  const { children, accepts, directoryPath } = props;
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
          if (
            AppConfig.isElectron &&
            !currentLocation.haveObjectStoreSupport() &&
            !currentLocation.haveWebDavSupport()
          ) {
            return openMoveOrCopyFilesDialog(files, dirPath);
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

  //drop(ref);

  const { isActive, handlerId } = collectedProps;
  //console.log(handlerId+' isActive:'+isActive);
  /*const dragContent = isActive ? (
    <div>{t('core:releaseToDrop')}</div>
  ) : undefined;*/
  return (
    <div
      ref={drop}
      style={{
        minHeight: '100%',
        width: '100%',
        ...(isActive && {
          border: '3px dashed white',
          backgroundColor: '#1dd19f40',
        }),
      }}
    >
      {children}
    </div>
  );
}

export default TargetFileBox;
