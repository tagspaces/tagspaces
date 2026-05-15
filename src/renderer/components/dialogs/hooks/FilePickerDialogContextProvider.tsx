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
 * Extension postMessage protocol for requesting a file picker. Implemented
 * by the host-side router in `EntryContainer.handleMessage`.
 *
 * Request (extension → host):
 *   {
 *     command: 'requestFilePicker',
 *     eventID: string,                   // must match the iframe's eventID
 *     options?: {
 *       mode?: 'file' | 'folder' | 'any',  // default 'any'
 *       allowedExtensions?: string[],    // accepted but currently ignored (TODO)
 *       title?: string,                  // optional dialog title override
 *       sourceLocationId?: string,       // optional; defaults to openedEntry.locationID
 *       sourceDir?: string,              // optional; defaults to the openedEntry's
 *                                        // containing folder (file) or itself (folder)
 *       showLabelField?: boolean,        // when true, the dialog renders an editable
 *                                        // "Link text" field; returned in response.label
 *       initialLabel?: string,           // default value for the Link-text field
 *                                        // (e.g. the user's current editor selection)
 *     },
 *   }
 *
 * Response (host → extension iframe via `iframe.contentWindow.postMessage`):
 *   {
 *     eventID: string,
 *     cancelled?: true,                  // mutually exclusive with the rest
 *     link?: 'ts://...' | '../foo.md',
 *     linkType?: 'ts' | 'relative',
 *     label?: string,                    // user-edited link text (when showLabelField)
 *     name?: string,
 *     path?: string,                     // absolute path inside the location
 *     locationId?: string,
 *     isFile?: boolean,
 *     extension?: string,
 *   }
 *
 * Constraints:
 * - Only one outstanding `requestFilePicker` per iframe. Sending a second
 *   before the first resolves silently replaces it — no `cancelled` reply
 *   will arrive for the abandoned request.
 * - The host defaults `initialLocationId` to the current entry's location
 *   (least-privilege). The user can switch locations manually inside the
 *   dialog; the eventual response carries the picked entry's `locationId`.
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
  /** Fired exactly once when the dialog closes without a confirmed selection
   *  (X / Cancel / Esc / backdrop). Mutually exclusive with onSelect for any
   *  single open cycle. Required for callers that need a definitive "the user
   *  walked away" signal — e.g. the extension postMessage router has to reply
   *  with `{ cancelled: true }` so the requesting extension stops waiting. */
  onCancel?: () => void;
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
        onCancel={() => {
          options.current?.onCancel?.();
        }}
      />
      {children}
    </FilePickerDialogContext.Provider>
  );
};
