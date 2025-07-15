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

import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import FileUploadDialog from '-/components/dialogs/FileUploadDialog';
import { useSelector } from 'react-redux';
import { getProgress } from '-/reducers/app';
import useFirstRender from '-/utils/useFirstRender';

type FileUploadDialogContextData = {
  openFileUploadDialog: (
    targetPath?: string,
    dialogTitle?: string,
    //transferMeta?: boolean,
  ) => void;
  closeFileUploadDialog: () => void;
};

export const FileUploadDialogContext =
  createContext<FileUploadDialogContextData>({
    openFileUploadDialog: undefined,
    closeFileUploadDialog: undefined,
  });

export type FileUploadDialogContextProviderProps = {
  children: React.ReactNode;
};

export const FileUploadDialogContextProvider = ({
  children,
}: FileUploadDialogContextProviderProps) => {
  const open = useRef<boolean>(false);
  const targetPath = useRef<string>(undefined);
  //const transferMeta = useRef<boolean>(undefined);
  const dialogTitle = useRef<string>('importDialogTitle');
  const progress = useSelector(getProgress);
  const firstRender = useFirstRender();

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (
      !firstRender &&
      !open.current &&
      Array.isArray(progress) &&
      progress.length > 0
    ) {
      openDialog();
    }
  }, [progress]);

  function openDialog(tPath?: string, dTitle?: string) {
    //, tMeta?: boolean) {
    open.current = true;
    targetPath.current = tPath;
    //transferMeta.current = tMeta;
    if (dTitle) {
      dialogTitle.current = dTitle;
    }
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    targetPath.current = undefined;
    //transferMeta.current = undefined;
    dialogTitle.current = 'importDialogTitle';
    forceUpdate();
  }
  const context = useMemo(() => {
    return {
      openFileUploadDialog: openDialog,
      closeFileUploadDialog: closeDialog,
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
