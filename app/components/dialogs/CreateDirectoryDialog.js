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

import React from 'react';
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
  open: boolean,
  onClose: () => void,
  selectedDirectoryPath: string,
  createDirectory: (directoryPath: string) => void
};

type State = {
  disableConfirmButton?: boolean,
  inputError?: boolean,
  name?: string
};

class CreateDirectoryDialog extends React.Component<Props, State> {
  state = {
    inputError: false,
    disableConfirmButton: true,
    name: '',
  };

  handleInputChange = (event: Object) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    }, this.handleValidation());
  };

  handleValidation() {
    // const pathRegex = '^((\.\./|[a-zA-Z0-9_/\-\\])*\.[a-zA-Z0-9]+)$';
    // const nameRegex = '^[A-Z][-a-zA-Z]+$';
    if (this.state.name.length > 0) {
      this.setState({ inputError: false, disableConfirmButton: false });
    } else {
      this.setState({ inputError: true, disableConfirmButton: true });
    }
  }

  onConfirm = () => {
    if (!this.state.disableConfirmButton && this.state.name) {
      const dirPath = this.props.selectedDirectoryPath + AppConfig.dirSeparator + this.state.name;
      this.props.createDirectory(dirPath);
      this.resetState();
      this.props.onClose();
    }
  };

  onCancel = () => {
    this.resetState();
    this.props.onClose();
  }

  resetState = () => {
    this.setState({
      name: '',
      inputError: false,
      disableConfirmButton: true
    });
  }

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:createNewDirectoryTitle')}</DialogTitle>
  );

  renderContent = () => (
    <DialogContent>
      <FormControl
        fullWidth={true}
        error={this.state.inputError}
      >
        <TextField
          fullWidth={true}
          error={this.state.inputError}
          margin="dense"
          name="name"
          label={i18n.t('core:createNewDirectoryTitleName')}
          onChange={this.handleInputChange}
          value={this.state.name}
          data-tid="directoryName"
          id="directoryName"
        />
        <FormHelperText>{i18n.t('core:directoryNameHelp')}</FormHelperText>
      </FormControl>
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="closeCreateNewDirectory"
        onClick={this.onCancel}
        color="primary"
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        disabled={this.state.disableConfirmButton}
        onClick={this.onConfirm}
        data-tid="confirmCreateNewDirectory"
        id="confirmCreateNewDirectory"
        color="primary"
      >
        {i18n.t('core:ok')}
      </Button>
    </DialogActions>
  );

  render() {
    return (
      <GenericDialog
        open={this.props.open}
        onClose={this.onCancel}
        onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators({
    createDirectory: AppActions.createDirectory
  }, dispatch);
}

export default connect(undefined, mapActionCreatorsToProps)(CreateDirectoryDialog);
