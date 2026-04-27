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

import { AboutDialogContextProvider } from '-/components/dialogs/hooks/AboutDialogContextProvider';
import { AiGenerationDialogContextProvider } from '-/components/dialogs/hooks/AiGenerationDialogContextProvider';
import { CreateDirectoryDialogContextProvider } from '-/components/dialogs/hooks/CreateDirectoryDialogContextProvider';
import { CreateEditLocationDialogContextProvider } from '-/components/dialogs/hooks/CreateEditLocationDialogContextProvider';
import { DeleteMultipleEntriesDialogContextProvider } from '-/components/dialogs/hooks/DeleteMultipleEntriesDialogContextProvider';
import { DownloadUrlContextProvider } from '-/components/dialogs/hooks/DownloadUrlDialogContextProvider';
import { EntryExistDialogContextProvider } from '-/components/dialogs/hooks/EntryExistDialogContextProvider';
import { ImportMacTagDialogContextProvider } from '-/components/dialogs/hooks/ImportMacTagDialogContextProvider';
import { KeyboardDialogContextProvider } from '-/components/dialogs/hooks/KeyboardDialogContextProvider';
import { LicenseDialogContextProvider } from '-/components/dialogs/hooks/LicenseDialogContextProvider';
import { LinkDialogContextProvider } from '-/components/dialogs/hooks/LinkDialogContextProvider';
import { MenuContextProvider } from '-/components/dialogs/hooks/MenuContextProvider';
import { MoveOrCopyFilesDialogContextProvider } from '-/components/dialogs/hooks/MoveOrCopyFilesDialogContextProvider';
import { NewAudioDialogContextProvider } from '-/components/dialogs/hooks/NewAudioDialogContextProvider';
import { NewFileDialogContextProvider } from '-/components/dialogs/hooks/NewFileDialogContextProvider';
import { OnboardingDialogContextProvider } from '-/components/dialogs/hooks/OnboardingDialogContextProvider';
import { ProTeaserDialogContextProvider } from '-/components/dialogs/hooks/ProTeaserDialogContextProvider';
import { ProgressDialogContextProvider } from '-/components/dialogs/hooks/ProgressDialogContextProvider';
import { ResolveConflictContextProvider } from '-/components/dialogs/hooks/ResolveConflictContextProvider';
import { SettingsDialogContextProvider } from '-/components/dialogs/hooks/SettingsDialogContextProvider';
import { ThirdPartyLibsDialogContextProvider } from '-/components/dialogs/hooks/ThirdPartyLibsDialogContextProvider';
import React from 'react';

export type DialogsRootProps = {
  children: React.ReactNode;
};

// Ordered list of providers - can be easily added/removed/reordered
const providers = [
  EntryExistDialogContextProvider,
  DeleteMultipleEntriesDialogContextProvider,
  CreateEditLocationDialogContextProvider,
  MoveOrCopyFilesDialogContextProvider,
  CreateDirectoryDialogContextProvider,
  ProgressDialogContextProvider,
  SettingsDialogContextProvider,
  NewFileDialogContextProvider,
  NewAudioDialogContextProvider,
  // OnboardingDialogContextProvider must wrap LicenseDialogContextProvider
  // so the license-accept handler can chain into openOnboardingDialog().
  OnboardingDialogContextProvider,
  LicenseDialogContextProvider,
  ThirdPartyLibsDialogContextProvider,
  AboutDialogContextProvider,
  KeyboardDialogContextProvider,
  LinkDialogContextProvider,
  ProTeaserDialogContextProvider,
  AiGenerationDialogContextProvider,
  ResolveConflictContextProvider,
  DownloadUrlContextProvider,
  ImportMacTagDialogContextProvider,
  MenuContextProvider,
];

function DialogsRoot({ children }: DialogsRootProps) {
  return providers.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children as any,
  ) as JSX.Element;
}

export default DialogsRoot;
