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
 * @flow
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
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import AppConfig from '../../config';
import { actions as AppActions } from '../../reducers/app';

type Props = {
  classes: Object,
  open: boolean,
  onClose: () => void,
  selectedDirectoryPath: string,
  createDirectory: (directoryPath: string) => void
};

const CreateDirectoryDialog = (props: Props) => {
  const [inputError, setInputError] = useState(false);
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [name, setName] = useState('');

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
      const dirPath = props.selectedDirectoryPath + AppConfig.dirSeparator + name;
      props.createDirectory(dirPath);
      resetState();
      props.onClose();
    }
  }

  function onCancel() {
    resetState();
    props.onClose();
  }

  function resetState() {
    setName('');
    setInputError(false);
    setDisableConfirmButton(true);
  }

  function renderTitle() {
    return (
      <DialogTitle>{i18n.t('core:createNewDirectoryTitle')}</DialogTitle>
    );
  }

  function renderContent() {
    return (
      <DialogContent>
        <FormControl
          fullWidth={true}
          error={inputError}
        >
          <TextField
            fullWidth
            error={inputError}
            margin="dense"
            autoFocus
            name="name"
            label={i18n.t('core:createNewDirectoryTitleName')}
            onChange={event => {
              const target = event.target;
              setName(target.value);
            }}
            value={name}
            data-tid="directoryName"
            id="directoryName"
          />
          <FormHelperText>{i18n.t('core:directoryNameHelp')}</FormHelperText>
        </FormControl>
      </DialogContent>
    );
  }

  function renderActions() {
    return (
      <DialogActions>
        <Button
          data-tid="closeCreateNewDirectory"
          onClick={onCancel}
          color="primary"
        >
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
    );
  }

  return (
    <GenericDialog
      open={props.open}
      onClose={onCancel}
      onEnterKey={(event) => onEnterKeyHandler(event, onConfirm)}
      renderTitle={renderTitle}
      renderContent={renderContent}
      renderActions={renderActions}
    />
  );
};

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators({
    createDirectory: AppActions.createDirectory
  }, dispatch);
}

export default connect(undefined, mapActionCreatorsToProps)(CreateDirectoryDialog);
