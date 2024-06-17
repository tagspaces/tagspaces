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

import React from 'react';
import { FileUploadDialogContextProvider } from '-/components/dialogs/hooks/FileUploadDialogContextProvider';
import { EntryExistDialogContextProvider } from '-/components/dialogs/hooks/EntryExistDialogContextProvider';
import { CreateEditLocationDialogContextProvider } from '-/components/dialogs/hooks/CreateEditLocationDialogContextProvider';
import { MoveOrCopyFilesDialogContextProvider } from '-/components/dialogs/hooks/MoveOrCopyFilesDialogContextProvider';
import { CreateDirectoryDialogContextProvider } from '-/components/dialogs/hooks/CreateDirectoryDialogContextProvider';

export type DialogsRootProps = {
  children: React.ReactNode;
};

function DialogsRoot({ children }: DialogsRootProps) {
  return (
    <EntryExistDialogContextProvider>
      <FileUploadDialogContextProvider>
        <CreateEditLocationDialogContextProvider>
          <MoveOrCopyFilesDialogContextProvider>
            <CreateDirectoryDialogContextProvider>
              {children}
            </CreateDirectoryDialogContextProvider>
          </MoveOrCopyFilesDialogContextProvider>
        </CreateEditLocationDialogContextProvider>
      </FileUploadDialogContextProvider>
    </EntryExistDialogContextProvider>
  );
}

export default DialogsRoot;
