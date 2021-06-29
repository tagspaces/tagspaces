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

import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Dialog from '@material-ui/core/Dialog';
import i18n from '-/services/i18n';
import { actions as AppActions } from '-/reducers/app';
import { joinPaths } from '-/utils/paths';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import PlatformIO from '-/services/platform-io';

interface Props {
  open: boolean;
  onClose: () => void;
  fullScreen?: boolean;
  selectedDirectoryPath: string;
  createDirectory: (directoryPath: string) => void;
}

const CreateDirectoryDialog = (props: Props) => {
  const [inputError, setInputError] = useState(false);
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [name, setName] = useState('');
  const { open, onClose, fullScreen } = props;

  useEffect(() => {
    handleValidation();
  });

  function handleValidation() {
    // const pathRegex = '^((\.\./|[a-zA-Z0-9_/\-\\])*\.[a-zA-Z0-9]+)$';
    // const nameRegex = '^[A-Z][-a-zA-Z]+$';
    if (name.length > 0) {
      setInputError(false);
      setDisableConfirmButton(false);
    } else {
      setInputError(true);
      setDisableConfirmButton(true);
    }
  }

  function onConfirm() {
    if (!disableConfirmButton && name) {
      const dirPath = joinPaths(
        PlatformIO.getDirSeparator(),
        props.selectedDirectoryPath,
        name
      );
      props.createDirectory(dirPath);
      resetState();
      props.onClose();
    }
  }

  function onCancel() {
    resetState();
    onClose();
  }

  function resetState() {
    setName('');
    setInputError(false);
    setDisableConfirmButton(true);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
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
        {i18n.t('core:createNewDirectoryTitle')}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth={true} error={inputError}>
          <TextField
            fullWidth
            error={inputError}
            margin="dense"
            autoFocus
            name="name"
            label={i18n.t('core:createNewDirectoryTitleName')}
            onChange={event => {
              const { target } = event;
              setName(target.value);
            }}
            value={name}
            data-tid="directoryName"
            id="directoryName"
          />
          <FormHelperText>{i18n.t('core:directoryNameHelp')}</FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button data-tid="closeCreateNewDirectory" onClick={onCancel}>
          {i18n.t('core:cancel')}
        </Button>
        <Button
          disabled={disableConfirmButton}
          onClick={onConfirm}
          data-tid="confirmCreateNewDirectory"
          id="confirmCreateNewDirectory"
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      createDirectory: AppActions.createDirectory
    },
    dispatch
  );
}

export default connect(
  undefined,
  mapActionCreatorsToProps
)(CreateDirectoryDialog);
