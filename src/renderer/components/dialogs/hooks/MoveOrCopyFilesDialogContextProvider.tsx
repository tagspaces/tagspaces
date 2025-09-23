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

import React, { createContext, useMemo, useReducer, useRef } from 'react';
import { extractFileExtension } from '@tagspaces/tagspaces-common/paths';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import LoadingLazy from '-/components/LoadingLazy';
import { TS } from '-/tagspaces.namespace';
import AppConfig from '-/AppConfig';

type MoveOrCopyFilesDialogContextData = {
  openMoveOrCopyFilesDialog: (
    files: File[] | TS.FileSystemEntry[],
    targetDirectory?: string,
    targetLocationId?: string,
  ) => void;
  closeMoveOrCopyFilesDialog: () => void;
};

export const MoveOrCopyFilesDialogContext =
  createContext<MoveOrCopyFilesDialogContextData>({
    openMoveOrCopyFilesDialog: undefined,
    closeMoveOrCopyFilesDialog: undefined,
  });

export type MoveOrCopyFilesDialogContextProviderProps = {
  children: React.ReactNode;
};

const MoveOrCopyFilesDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "MoveOrCopyFilesDialog" */ '../MoveOrCopyFilesDialog'
    ),
);

export const MoveOrCopyFilesDialogContextProvider = ({
  children,
}: MoveOrCopyFilesDialogContextProviderProps) => {
  const open = useRef<boolean>(false);
  const files = useRef<TS.FileSystemEntry[]>(undefined);
  const targetDir = useRef<string>(undefined);
  const targetLocationId = useRef<string>(undefined);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function isFileArray(value: unknown): value is File[] {
    return Array.isArray(value) && value.every((item) => item instanceof File);
  }

  function openDialog(
    selectedFiles: File[] | TS.FileSystemEntry[],
    targetDirectory?: string,
    targetLocationID?: string,
  ) {
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }
    open.current = true;
    targetDir.current = targetDirectory;
    targetLocationId.current = targetLocationID;
    if (isFileArray(selectedFiles)) {
      isDirs(selectedFiles).then((isDirsArray) => {
        files.current = selectedFiles.map((file, index) => ({
          uuid: getUuid(),
          name: file.name,
          path: file.path,
          isFile: !isDirsArray[index],
          extension: extractFileExtension(file.path),
          size: file.size,
          cdt: (file as any).cdt,
          lmdt: file.lastModified,
        }));
        forceUpdate();
      });
    } else {
      files.current = selectedFiles;
    }
    forceUpdate();
  }

  function isDirs(files: Array<File>): Promise<boolean[]> {
    if (AppConfig.isElectron) {
      const filesPromises = files.map((file) =>
        window.electronIO.ipcRenderer.invoke('isDirectory', file.path),
      );
      return Promise.all(filesPromises);
    }
    return Promise.resolve(files.map(() => true));
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  function MoveOrCopyFilesDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <MoveOrCopyFilesDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openMoveOrCopyFilesDialog: openDialog,
      closeMoveOrCopyFilesDialog: closeDialog,
    };
  }, []);

  return (
    <MoveOrCopyFilesDialogContext.Provider value={context}>
      <MoveOrCopyFilesDialogAsync
        open={open.current}
        onClose={closeDialog}
        selectedFiles={files.current?.filter((file) => file.isFile)} // todo enable for dir
        targetDir={targetDir.current}
        targetLocationId={targetLocationId.current}
      />
      {children}
    </MoveOrCopyFilesDialogContext.Provider>
  );
};
