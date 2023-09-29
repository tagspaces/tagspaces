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

import React, { ReactNode, useRef } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { classes, DnD } from '-/components/DnD.css';
import { useTranslation } from 'react-i18next';
import AppConfig from '-/AppConfig';
import PlatformIO from '-/services/platform-facade';
import { useDispatch, useSelector } from 'react-redux';
import {
  actions as AppActions,
  AppDispatch,
  getDirectoryPath
} from '-/reducers/app';
import IOActions from '-/reducers/io-actions';
import { TS } from '-/tagspaces.namespace';
import { Identifier } from 'dnd-core';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';

type DragItem = { files: File[]; items: DataTransferItemList };
type DragProps = { isActive: boolean; handlerId: Identifier | null };

interface Props {
  children: ReactNode;
  accepts: Array<string>;
  setMoveCopyDialogOpened: (files: Array<File>) => void;
}

function TargetFileBox(props: Props) {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { isReadOnlyMode } = useCurrentLocationContext();
  const readOnlyMode = isReadOnlyMode();
  const ref = useRef<HTMLDivElement>(null);
  const directoryPath = useSelector(getDirectoryPath);
  const { setMoveCopyDialogOpened } = props;

  const onUploadProgress = (progress, abort, fileName) => {
    dispatch(AppActions.onUploadProgress(progress, abort, fileName));
  };

  const handleCopyFiles = (files: Array<File>) => {
    if (readOnlyMode) {
      dispatch(
        AppActions.showNotification(
          t('core:dndDisabledReadOnlyMode'),
          'error',
          true
        )
      );
      return Promise.reject(t('core:dndDisabledReadOnlyMode'));
    }
    if (files) {
      console.log('Dropped files: ' + JSON.stringify(files));
      if (!directoryPath) {
        dispatch(
          AppActions.showNotification(
            'Importing files failed, because no folder is opened in TagSpaces!',
            'error',
            true
          )
        );
        return Promise.reject(
          new Error(
            'Importing files failed, because no folder is opened in TagSpaces!'
          )
        );
      }
      dispatch(AppActions.resetProgress());
      dispatch(AppActions.toggleUploadDialog());
      return dispatch(
        IOActions.uploadFilesAPI(files, directoryPath, onUploadProgress)
      )
        .then((fsEntries: Array<TS.FileSystemEntry>) => {
          dispatch(AppActions.reflectCreateEntries(fsEntries));
          return true;
        })
        .catch(error => {
          console.log('uploadFiles', error);
        });
    }
    return Promise.reject(new Error('on files'));
  };

  const [collectedProps, drop] = useDrop<DragItem, unknown, DragProps>(
    () => ({
      accept: props.accepts,
      drop: ({ files }) => {
        if (files && files.length) {
          if (
            AppConfig.isElectron &&
            !PlatformIO.haveObjectStoreSupport() &&
            !PlatformIO.haveWebDavSupport()
          ) {
            return setMoveCopyDialogOpened(files);
          } else {
            return handleCopyFiles(files);
          }
        }
      },
      collect: (m: DropTargetMonitor) => ({
        handlerId: m.getHandlerId(),
        isActive: m.isOver({ shallow: true }) && m.canDrop()
      })
    }),
    [directoryPath]
  );

  drop(ref);

  const { isActive } = collectedProps;
  const { children } = props;
  const dragContent = isActive ? (
    <div className={classes.dropzone}>{t('core:releaseToDrop')}</div>
  ) : (
    undefined
  );
  return (
    <DnD ref={ref} style={{ height: '100%' }}>
      {dragContent}
      {children}
    </DnD>
  );
}

export default TargetFileBox;
