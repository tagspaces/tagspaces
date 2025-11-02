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

import AppConfig from '-/AppConfig';
import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { dirNameValidation, fileNameValidation } from '-/services/utils-io';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  extractContainingDirectoryPath,
  extractDirectoryName,
  extractFileName,
} from '@tagspaces/tagspaces-common/paths';
import React, { useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
}

function RenameEntryDialog(props: Props) {
  const { open, onClose } = props;
  const { t } = useTranslation();
  const { renameDirectory, renameFile } = useIOActionsContext();
  const { currentLocation } = useCurrentLocationContext();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const { lastSelectedEntry } = useSelectedEntriesContext();
  const [inputError, setInputError] = useState<boolean>(false);
  const disableConfirmButton = useRef<boolean>(true);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  let defaultName = '';
  let originPath;
  let isFile;
  if (lastSelectedEntry) {
    ({ isFile } = lastSelectedEntry);
    if (isFile) {
      defaultName = extractFileName(
        lastSelectedEntry.path,
        currentLocation?.getDirSeparator(),
      );
    } else {
      defaultName = extractDirectoryName(
        lastSelectedEntry.path,
        currentLocation?.getDirSeparator(),
      );
    }
    originPath = lastSelectedEntry.path;
  } else if (currentDirectoryPath) {
    isFile = false;
    defaultName = extractDirectoryName(
      currentDirectoryPath,
      currentLocation?.getDirSeparator(),
    );
    originPath = currentDirectoryPath;
  }
  const name = useRef<string>(defaultName);

  // eslint-disable-next-line no-unused-vars
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const onInputFocus = (event) => {
    if (name.current) {
      event.preventDefault();
      const { target } = event;
      target.focus();
      const indexOfBracket = name.current.indexOf(AppConfig.beginTagContainer);
      const indexOfDot = name.current.lastIndexOf('.');
      let endRange = name.current.length;
      if (indexOfBracket > 0) {
        endRange = indexOfBracket;
      } else if (indexOfDot > 0) {
        endRange = indexOfDot;
      }
      target.setSelectionRange(0, endRange);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    name.current = event.target.value;
    handleValidation();
  };

  const handleValidation = () => {
    const initValid = disableConfirmButton.current;
    let noValid;
    if (isFile) {
      noValid = fileNameValidation(name.current);
    } else {
      noValid = dirNameValidation(name.current);
    }
    disableConfirmButton.current = noValid;

    if (noValid || initValid !== noValid) {
      if (inputError !== noValid) {
        setInputError(noValid);
      } else {
        forceUpdate();
      }
    }
  };

  const onConfirm = () => {
    if (!disableConfirmButton.current) {
      onClose();
      if (isFile) {
        const dirSeparator = currentLocation?.getDirSeparator();
        const fileDirectory = extractContainingDirectoryPath(
          lastSelectedEntry.path,
          dirSeparator,
        );
        const newFilePath =
          (fileDirectory && fileDirectory !== dirSeparator
            ? fileDirectory + dirSeparator
            : '') + name.current;
        return renameFile(originPath, newFilePath, currentLocation.uuid);
      } else {
        return renameDirectory(originPath, name.current, currentLocation.uuid);
      }
    }
  };

  const okButton = (
    <TsButton
      disabled={disableConfirmButton.current}
      onClick={onConfirm}
      data-tid="confirmRenameEntry"
      variant="contained"
      sx={
        {
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties & { WebkitAppRegion?: string }
      }
    >
      {t('core:ok')}
    </TsButton>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      keepMounted
      scroll="paper"
      aria-labelledby="draggable-dialog-title"
      PaperComponent={DraggablePaper}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        } /*else if (event.key === 'Escape') {
          onClose();
        }*/
      }}
    >
      <TsDialogTitle
        dialogTitle={t('core:' + (isFile ? 'renameFile' : 'renameDirectory'))}
        closeButtonTestId="closeRenameEntryTID"
        onClose={onClose}
        actionSlot={okButton}
      />
      <DialogContent>
        <FormControl fullWidth={true} error={inputError}>
          <TsTextField
            autoFocus
            required
            error={inputError}
            name="entryName"
            label={t(
              'core:' +
                (isFile ? 'renameNewFileName' : 'createNewDirectoryTitleName'),
            )}
            onChange={handleInputChange}
            onFocus={onInputFocus}
            defaultValue={name.current}
            data-tid="renameEntryDialogInput"
          />
          <FormHelperText>
            {t('core:' + (isFile ? 'fileNameHelp' : 'directoryNameHelp'))}
          </FormHelperText>
        </FormControl>
      </DialogContent>
      {!smallScreen && (
        <TsDialogActions>
          <TsButton data-tid="closeRenameEntryDialog" onClick={onClose}>
            {t('core:cancel')}
          </TsButton>
          {okButton}
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default RenameEntryDialog;
