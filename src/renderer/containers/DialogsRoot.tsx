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
import { ProgressDialogContextProvider } from '-/components/dialogs/hooks/ProgressDialogContextProvider';
import { NewEntryDialogContextProvider } from '-/components/dialogs/hooks/NewEntryDialogContextProvider';
import { NewFileDialogContextProvider } from '-/components/dialogs/hooks/NewFileDialogContextProvider';
import { NewAudioDialogContextProvider } from '-/components/dialogs/hooks/NewAudioDialogContextProvider';
import { LicenseDialogContextProvider } from '-/components/dialogs/hooks/LicenseDialogContextProvider';
import { ThirdPartyLibsDialogContextProvider } from '-/components/dialogs/hooks/ThirdPartyLibsDialogContextProvider';
import { AboutDialogContextProvider } from '-/components/dialogs/hooks/AboutDialogContextProvider';
import { OnboardingDialogContextProvider } from '-/components/dialogs/hooks/OnboardingDialogContextProvider';
import { KeyboardDialogContextProvider } from '-/components/dialogs/hooks/KeyboardDialogContextProvider';
import { LinkDialogContextProvider } from '-/components/dialogs/hooks/LinkDialogContextProvider';
import { ProTeaserDialogContextProvider } from '-/components/dialogs/hooks/ProTeaserDialogContextProvider';
import { SettingsDialogContextProvider } from '-/components/dialogs/hooks/SettingsDialogContextProvider';
import { DeleteMultipleEntriesDialogContextProvider } from '-/components/dialogs/hooks/DeleteMultipleEntriesDialogContextProvider';

export type DialogsRootProps = {
  children: React.ReactNode;
};

function DialogsRoot({ children }: DialogsRootProps) {
  return (
    <EntryExistDialogContextProvider>
      <DeleteMultipleEntriesDialogContextProvider>
        <FileUploadDialogContextProvider>
          <CreateEditLocationDialogContextProvider>
            <MoveOrCopyFilesDialogContextProvider>
              <CreateDirectoryDialogContextProvider>
                <ProgressDialogContextProvider>
                  <NewEntryDialogContextProvider>
                    <NewFileDialogContextProvider>
                      <NewAudioDialogContextProvider>
                        <LicenseDialogContextProvider>
                          <ThirdPartyLibsDialogContextProvider>
                            <AboutDialogContextProvider>
                              <OnboardingDialogContextProvider>
                                <KeyboardDialogContextProvider>
                                  <LinkDialogContextProvider>
                                    <ProTeaserDialogContextProvider>
                                      <SettingsDialogContextProvider>
                                        {children}
                                      </SettingsDialogContextProvider>
                                    </ProTeaserDialogContextProvider>
                                  </LinkDialogContextProvider>
                                </KeyboardDialogContextProvider>
                              </OnboardingDialogContextProvider>
                            </AboutDialogContextProvider>
                          </ThirdPartyLibsDialogContextProvider>
                        </LicenseDialogContextProvider>
                      </NewAudioDialogContextProvider>
                    </NewFileDialogContextProvider>
                  </NewEntryDialogContextProvider>
                </ProgressDialogContextProvider>
              </CreateDirectoryDialogContextProvider>
            </MoveOrCopyFilesDialogContextProvider>
          </CreateEditLocationDialogContextProvider>
        </FileUploadDialogContextProvider>
      </DeleteMultipleEntriesDialogContextProvider>
    </EntryExistDialogContextProvider>
  );
}

export default DialogsRoot;
