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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import { extractDirectoryName } from '../../utils/paths';
import { actions as AppActions } from '../../reducers/app';

type Props = {
  open: boolean,
  selectedDirectoryPath: string,
  onClose: () => void,
  renameDirectory: (directoryPath: string, newDirectoryName: string) => void
};

const RenameDirectoryDialog = (props: Props) => {
  const [inputError, setInputError] = useState(false);
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [name, setName] = useState(props.selectedDirectoryPath ? extractDirectoryName(props.selectedDirectoryPath) : '');

  /* handleInputChange = (event: Object) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    }, this.handleValidation);
  }; */

  useEffect(() => {
    handleValidation();
  });

  function handleValidation() {
    // const nameRegex = this.state.name.match('^[A-Z][-a-zA-Z]+$');
    if (name.length > 0) {
      setInputError(false);
      setDisableConfirmButton(false);
    } else {
      setInputError(true);
      setDisableConfirmButton(true);
    }
  }

  function onConfirm() {
    if (!disableConfirmButton) {
      props.renameDirectory(props.selectedDirectoryPath, name);
      setInputError(false);
      setDisableConfirmButton(true);
      props.onClose();
    }
  }

  function renderTitle() {
    return (
      <DialogTitle>{i18n.t('core:renameDirectory')}</DialogTitle>
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
            fullWidth={true}
            autoFocus
            required
            error={inputError}
            margin="dense"
            name="name"
            label={i18n.t('core:renameDirectoryTitleName')}
            onChange={event => {
              const target = event.target;
              setName(target.value);
            }}
            // onChange={this.handleInputChange}
            value={name}
            data-tid="renameDirectoryDialogInput"
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
          data-tid="closeRenameDirectoryDialog"
          onClick={props.onClose}
          color="primary"
        >
          {i18n.t('core:cancel')}
        </Button>
        <Button
          disabled={disableConfirmButton}
          onClick={onConfirm}
          data-tid="confirmRenameDirectory"
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
      onClose={props.onClose}
      autoFocus
      onEnterKey={(event) => onEnterKeyHandler(event, onConfirm)}
      renderTitle={renderTitle}
      renderContent={renderContent}
      renderActions={renderActions}
    />
  );
};

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators({
    renameDirectory: AppActions.renameDirectory,
  }, dispatch);
}

export default connect(null, mapActionCreatorsToProps)(RenameDirectoryDialog);
