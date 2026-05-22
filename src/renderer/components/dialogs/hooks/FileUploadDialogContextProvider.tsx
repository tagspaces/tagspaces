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
  // True minimize: the user explicitly hid the dialog mid-batch. We keep the
  // progress data so the small indicator near the search bar stays visible,
  // and we do NOT re-open the dialog on subsequent progress dispatches.
  // Reset on (a) a fresh batch (empty → non-empty transition) or
  // (b) explicit reopen via the indicator / openFileUploadDialog call.
  const userMinimized = useRef<boolean>(false);
  const prevProgressLength = useRef<number>(0);
  const targetPath = useRef<string>(undefined);
  //const transferMeta = useRef<boolean>(undefined);
  const dialogTitle = useRef<string>('importDialogTitle');
  const progress = useSelector(getProgress);
  const firstRender = useFirstRender();

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (firstRender) {
      prevProgressLength.current = Array.isArray(progress)
        ? progress.length
        : 0;
      return;
    }
    const len = Array.isArray(progress) ? progress.length : 0;
    const wasEmpty = prevProgressLength.current === 0;
    prevProgressLength.current = len;

    if (wasEmpty && len > 0) {
      // Fresh batch — surface the dialog regardless of previous minimize.
      userMinimized.current = false;
      if (!open.current) {
        open.current = true;
        forceUpdate();
      }
    } else if (!wasEmpty && len === 0) {
      // Genuine N→0 transition (e.g. "Close and Clear"). Reset state and
      // hide the dialog. We deliberately ignore 0→0 here so that callers
      // like MoveCopyFilesDialog.handleCopy can dispatch resetProgress()
      // and then synchronously call openFileUploadDialog() without us
      // racing in to close what they just opened.
      userMinimized.current = false;
      if (open.current) {
        open.current = false;
        forceUpdate();
      }
    }
    // Else: ongoing batch (N→M) or no-op 0→0. Don't re-open if the user
    // minimized — the indicator near the search bar continues to surface
    // progress.
  }, [progress]);

  function openDialog(tPath?: string, dTitle?: string) {
    open.current = true;
    userMinimized.current = false;
    targetPath.current = tPath;
    if (dTitle) {
      dialogTitle.current = dTitle;
    }
    forceUpdate();
  }

  // "Minimize" — hide the dialog but keep progress in the store so the
  // indicator near the search bar stays visible.
  function minimizeDialog() {
    open.current = false;
    userMinimized.current = true;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    userMinimized.current = false;
    targetPath.current = undefined;
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
        onClose={() => minimizeDialog()}
        title={dialogTitle.current}
        targetPath={targetPath.current}
      />
    </FileUploadDialogContext.Provider>
  );
};
