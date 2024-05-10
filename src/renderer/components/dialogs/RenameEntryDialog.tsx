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

import React, { useReducer, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Dialog from '@mui/material/Dialog';
import {
  extractContainingDirectoryPath,
  extractDirectoryName,
  extractFileName,
} from '@tagspaces/tagspaces-common/paths';
import DraggablePaper from '-/components/DraggablePaper';
import AppConfig from '-/AppConfig';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { dirNameValidation, fileNameValidation } from '-/services/utils-io';
import { useTranslation } from 'react-i18next';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';

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
  const { selectedEntries } = useSelectedEntriesContext();
  const lastSelectedEntry = selectedEntries[selectedEntries.length - 1];
  const [inputError, setInputError] = useState<boolean>(false);
  const disableConfirmButton = useRef<boolean>(true);

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
  } else {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{t('core:noSelectedEntryError')}</DialogTitle>
      </Dialog>
    );
  }
  const name = useRef<string>(defaultName);

  // eslint-disable-next-line no-unused-vars
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

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
        const fileDirectory = extractContainingDirectoryPath(
          lastSelectedEntry.path,
          currentLocation?.getDirSeparator(),
        );
        const newFilePath =
          fileDirectory + currentLocation.getDirSeparator() + name.current;
        return renameFile(originPath, newFilePath, currentLocation.uuid);
      } else {
        return renameDirectory(originPath, name.current, currentLocation.uuid);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {t('core:' + (isFile ? 'renameFile' : 'renameDirectory'))}
        <DialogCloseButton testId="closeRenameEntryTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth={true} error={inputError}>
          <TextField
            autoFocus
            required
            error={inputError}
            margin="dense"
            name="entryName"
            label={t(
              'core:' +
                (isFile ? 'renameNewFileName' : 'createNewDirectoryTitleName'),
            )}
            onChange={handleInputChange}
            onFocus={onInputFocus}
            defaultValue={name.current}
            fullWidth={true}
            data-tid="renameEntryDialogInput"
          />
          <FormHelperText>
            {t('core:' + (isFile ? 'fileNameHelp' : 'directoryNameHelp'))}
          </FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button data-tid="closeRenameEntryDialog" onClick={onClose}>
          {t('core:cancel')}
        </Button>
        <Button
          disabled={disableConfirmButton.current}
          onClick={onConfirm}
          data-tid="confirmRenameEntry"
          color="primary"
          variant="contained"
        >
          {t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RenameEntryDialog;
