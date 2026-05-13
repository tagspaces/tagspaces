/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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

/**
 * Extension postMessage protocol for requesting a file picker (spec only —
 * the host-side router that translates these messages into
 * `openFilePickerDialog` calls is a follow-up).
 *
 * Request (extension → host):
 *   {
 *     command: 'requestFilePicker',
 *     eventID: string,
 *     options?: {
 *       mode?: 'file' | 'folder' | 'any',
 *       allowedExtensions?: string[],
 *       title?: string,
 *       sourceLocationId?: string,
 *       sourceDir?: string,
 *     },
 *   }
 *
 * Response (host → extension iframe via `iframe.contentWindow.postMessage`):
 *   {
 *     eventID: string,
 *     cancelled?: true,                  // mutually exclusive with the rest
 *     link?: 'ts://...' | '../foo.md',
 *     linkType?: 'ts' | 'relative',
 *     name?: string,
 *     path?: string,                     // absolute path inside the location
 *     locationId?: string,
 *     isFile?: boolean,
 *     extension?: string,
 *   }
 */

import LoadingLazy from '-/components/LoadingLazy';
import { TS } from '-/tagspaces.namespace';
import React, { createContext, useMemo, useReducer, useRef } from 'react';
import type { FilePickerLinkType, FilePickerMode } from '../FilePickerDialog';

export interface FilePickerDialogOpenOptions {
  mode?: FilePickerMode;
  initialLocationId?: string;
  initialPath?: string;
  sourceLocationId?: string;
  sourceDir?: string;
  title?: string;
  confirmLabel?: string;
  /** Render an editable "Link text" field. Defaults to `initialLabel` if
   *  provided, otherwise the picked entry's name. The final value is returned
   *  in onSelect's 4th arg. */
  showLabelField?: boolean;
  initialLabel?: string;
  onSelect: (
    entry: TS.FileSystemEntry,
    link: string,
    linkType: FilePickerLinkType,
    label: string,
  ) => void;
}

type FilePickerDialogContextData = {
  openFilePickerDialog: (options: FilePickerDialogOpenOptions) => void;
  closeFilePickerDialog: () => void;
};

export const FilePickerDialogContext =
  createContext<FilePickerDialogContextData>({
    openFilePickerDialog: () => undefined,
    closeFilePickerDialog: () => undefined,
  });

export type FilePickerDialogContextProviderProps = {
  children: React.ReactNode;
};

const FilePickerDialog = React.lazy(
  () =>
    import(/* webpackChunkName: "FilePickerDialog" */ '../FilePickerDialog'),
);

export const FilePickerDialogContextProvider = ({
  children,
}: FilePickerDialogContextProviderProps) => {
  const open = useRef<boolean>(false);
  const options = useRef<FilePickerDialogOpenOptions | undefined>(undefined);

  const [, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog(next: FilePickerDialogOpenOptions) {
    open.current = true;
    options.current = next;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  function FilePickerDialogAsync(props: Record<string, unknown>) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <FilePickerDialog {...(props as any)} />
      </React.Suspense>
    );
  }

  const context = useMemo(
    () => ({
      openFilePickerDialog: openDialog,
      closeFilePickerDialog: closeDialog,
    }),
    [],
  );

  const current = options.current;

  return (
    <FilePickerDialogContext.Provider value={context}>
      <FilePickerDialogAsync
        open={open.current}
        onClose={closeDialog}
        mode={current?.mode}
        initialLocationId={current?.initialLocationId}
        initialPath={current?.initialPath}
        sourceLocationId={current?.sourceLocationId}
        sourceDir={current?.sourceDir}
        title={current?.title}
        confirmLabel={current?.confirmLabel}
        showLabelField={current?.showLabelField}
        initialLabel={current?.initialLabel}
        onSelect={(
          entry: TS.FileSystemEntry,
          link: string,
          linkType: FilePickerLinkType,
          label: string,
        ) => {
          // Read from the ref so callers can pass freshly-closed-over handlers.
          options.current?.onSelect(entry, link, linkType, label);
        }}
      />
      {children}
    </FilePickerDialogContext.Provider>
  );
};
