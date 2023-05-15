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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
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
  extractFileName
} from '@tagspaces/tagspaces-common/paths';
import DraggablePaper from '-/components/DraggablePaper';
import AppConfig from '-/AppConfig';
import i18n from '-/services/i18n';
import { actions as AppActions, getLastSelectedEntry } from '-/reducers/app';
import PlatformIO from '-/services/platform-facade';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { dirNameValidation, fileNameValidation } from '-/services/utils-io';

interface Props {
  open: boolean;
  currentDirectoryPath?: string;
  lastSelectedEntry: any;
  onClose: () => void;
  renameFile: (source: string, target: string) => void;
  renameDirectory: (directoryPath: string, newDirectoryName: string) => void;
}

function RenameEntryDialog(props: Props) {
  const [inputError, setInputError] = useState<boolean>(false);
  const disableConfirmButton = useRef<boolean>(true);

  let defaultName = '';
  let originPath;
  let isFile;
  if (props.lastSelectedEntry) {
    ({ isFile } = props.lastSelectedEntry);
    if (isFile) {
      defaultName = extractFileName(
        props.lastSelectedEntry.path,
        PlatformIO.getDirSeparator()
      );
    } else {
      defaultName = extractDirectoryName(
        props.lastSelectedEntry.path,
        PlatformIO.getDirSeparator()
      );
    }
    originPath = props.lastSelectedEntry.path;
  } else if (props.currentDirectoryPath) {
    isFile = false;
    defaultName = extractDirectoryName(
      props.currentDirectoryPath,
      PlatformIO.getDirSeparator()
    );
    originPath = props.currentDirectoryPath;
  } else {
    return (
      <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>{i18n.t('core:noSelectedEntryError')}</DialogTitle>
      </Dialog>
    );
  }
  const name = useRef<string>(defaultName);

  // eslint-disable-next-line no-unused-vars
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  const onInputFocus = event => {
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
      if (isFile) {
        const fileDirectory = extractContainingDirectoryPath(
          props.lastSelectedEntry.path,
          PlatformIO.getDirSeparator()
        );
        const newFilePath =
          fileDirectory + PlatformIO.getDirSeparator() + name.current;
        props.renameFile(originPath, newFilePath);
      } else {
        props.renameDirectory(originPath, name.current);
      }
      props.onClose();
    }
  };

  const { open, onClose } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      aria-labelledby="draggable-dialog-title"
      PaperComponent={DraggablePaper}
      onKeyDown={event => {
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
        {i18n.t('core:' + (isFile ? 'renameFile' : 'renameDirectory'))}
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
            label={i18n.t(
              'core:' +
                (isFile ? 'renameNewFileName' : 'createNewDirectoryTitleName')
            )}
            onChange={handleInputChange}
            onFocus={onInputFocus}
            defaultValue={name.current}
            fullWidth={true}
            data-tid="renameEntryDialogInput"
          />
          <FormHelperText>
            {i18n.t('core:' + (isFile ? 'fileNameHelp' : 'directoryNameHelp'))}
          </FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button data-tid="closeRenameEntryDialog" onClick={props.onClose}>
          {i18n.t('core:cancel')}
        </Button>
        <Button
          disabled={disableConfirmButton.current}
          onClick={onConfirm}
          data-tid="confirmRenameEntry"
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function mapStateToProps(state) {
  return {
    lastSelectedEntry: getLastSelectedEntry(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      renameFile: AppActions.renameFile,
      renameDirectory: AppActions.renameDirectory
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(RenameEntryDialog);
