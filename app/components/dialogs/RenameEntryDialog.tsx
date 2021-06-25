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
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Dialog from '@material-ui/core/Dialog';
import i18n from '-/services/i18n';
import {
  extractContainingDirectoryPath,
  extractDirectoryName,
  extractFileName
} from '-/utils/paths';
import { actions as AppActions, getLastSelectedEntry } from '-/reducers/app';
import PlatformIO from '-/services/platform-io';
import AppConfig from '-/config';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

interface Props {
  open: boolean;
  currentDirectoryPath?: string;
  lastSelectedEntry: any;
  onClose: () => void;
  renameFile: (source: string, target: string) => void;
  renameDirectory: (directoryPath: string, newDirectoryName: string) => void;
}

const RenameEntryDialog = (props: Props) => {
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
    // https://github.com/mui-org/material-ui/issues/1594
    // const timer = setTimeout(() => {
    if (name.current) {
      event.preventDefault();
      const { target } = event;
      target.focus();
      // inputElement.focus();
      // if (defaultName) {
      const indexOfBracket = name.current.indexOf(AppConfig.beginTagContainer);
      const indexOfDot = name.current.lastIndexOf('.');
      let endRange = name.current.length;
      if (indexOfBracket > 0) {
        endRange = indexOfBracket;
      } else if (indexOfDot > 0) {
        endRange = indexOfDot;
      }
      target.setSelectionRange(0, endRange);
      // }
    }
    // }, 100);

    // return () => clearTimeout(timer);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    name.current = event.target.value;
    handleValidation();
  };

  const handleValidation = () => {
    const initValid = disableConfirmButton.current;
    if (name.current.length > 0) {
      const rg1 = /^[^#\\/:*?"<>|]+$/; // forbidden characters # \ / : * ? " < > |
      if (isFile) {
        // https://stackoverflow.com/a/11101624/2285631
        const rg2 = /^\./; // cannot start with dot (.)
        const rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
        disableConfirmButton.current = !(
          rg1.test(name.current) &&
          !rg2.test(name.current) &&
          !rg3.test(name.current)
        );
      } else disableConfirmButton.current = !rg1.test(name.current);
      setInputError(disableConfirmButton.current);
    } else {
      disableConfirmButton.current = true;
    }
    if (initValid !== disableConfirmButton.current) {
      setInputError(disableConfirmButton.current);
      forceUpdate();
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
      onKeyDown={event => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        } else if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      <DialogTitle>
        {i18n.t('core:' + (isFile ? 'renameFileTitle' : 'renameDirectory'))}
        <DialogCloseButton onClose={onClose} />
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
                (isFile ? 'renameNewFileName' : 'renameDirectoryTitleName')
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
};

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
