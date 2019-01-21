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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import AppConfig from '../../config';
import i18n from '../../services/i18n';
import { extractFileName, extractContainingDirectoryPath } from '../../utils/paths';
import { actions as AppActions } from '../../reducers/app';

type Props = {
  open: boolean,
  selectedFilePath: string,
  classes: Object,
  renameFile: (source: string, target: string) => void,
  onClose: () => void
};

type State = {
  inputError?: boolean,
  disableConfirmButton?: boolean,
  fileName?: string
};

const styles = theme => ({
  root: {
    width: 550,
    height: '100%',
    marginBottom: 30,
    background: theme.palette.background.paper
  }
});

class RenameFileDialog extends React.Component<Props, State> {
  state = {
    inputError: false,
    disableConfirmButton: true,
    fileName: '',
  };

  componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open) {
      const fileName = extractFileName(nextProps.selectedFilePath);
      this.setState({ fileName }, () => {
        this.fileName.focus();
        if (fileName) {
          const indexOfBracket = fileName.indexOf(AppConfig.beginTagContainer);
          const indexOfDot = fileName.indexOf('.');
          let endRange = fileName.length;
          if (indexOfBracket > 0) {
            endRange = indexOfBracket;
          } else if (indexOfDot > 0) {
            endRange = indexOfDot;
          }
          this.fileName.setSelectionRange(0, endRange);
        }
        return {
          fileName,
        };
      });
    }
  };

  fileName;

  handleInputChange = (event: Object) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    }, this.handleValidation);
  };

  handleValidation() {
    if (this.state.fileName.length > 0) {
      this.setState({ inputError: false, disableConfirmButton: false });
    } else {
      this.setState({ inputError: true, disableConfirmButton: true });
    }
  }

  onConfirm = () => {
    if (!this.state.disableConfirmButton) {
      const fileDirectory = extractContainingDirectoryPath(this.props.selectedFilePath);
      const newFilePath = fileDirectory + AppConfig.dirSeparator + this.state.fileName;
      this.props.renameFile(this.props.selectedFilePath, newFilePath);
      this.props.onClose();
      this.setState({ inputError: false, disableConfirmButton: true });
    } else {
      this.handleValidation();
    }
  };

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:renameFileTitle')}</DialogTitle>
  );

  renderContent = () => (
    <DialogContent>
      <div className={this.props.classes.root} data-tid="renameFileDialog">
        <FormControl
          fullWidth={true}
          error={this.state.inputError}
        >
          <TextField
            error={this.state.inputError}
            margin="dense"
            name="fileName"
            // autoFocus
            inputRef={(ref) => { this.fileName = ref; }}
            label={i18n.t('core:renameNewFileName')}
            onChange={this.handleInputChange}
            value={this.state.fileName}
            data-tid="renameFileDialogInput"
            fullWidth={true}
          />
          {this.state.inputError && <FormHelperText>Empty File Name</FormHelperText>}
        </FormControl>
      </div>
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="closeRenameFileDialog"
        onClick={this.props.onClose}
        color="primary"
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        disabled={this.state.disableConfirmButton}
        onClick={this.onConfirm}
        data-tid="confirmRenameFileDialog"
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
        onClose={this.props.onClose}
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
    renameFile: AppActions.renameFile,
  }, dispatch);
}

export default connect(null, mapActionCreatorsToProps)(withStyles(styles)(RenameFileDialog));
