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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import AppConfig from '-/config';
import i18n from '-/services/i18n';
import { extractFileName, extractContainingDirectoryPath } from '-/utils/paths';
import { actions as AppActions } from '-/reducers/app';
import PlatformIO from '-/services/platform-io';

interface Props {
  open: boolean;
  selectedFilePath: string;
  classes: any;
  renameFile: (source: string, target: string) => void;
  onClose: (clearSelection?: boolean) => void;
}

interface State {
  inputError: boolean;
  disableConfirmButton: boolean;
  fileName: string;
}

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
    fileName: ''
  };

  componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open) {
      const fileName = extractFileName(
        nextProps.selectedFilePath,
        PlatformIO.getDirSeparator()
      );
      this.setState({ fileName }, () => {
        this.fileName.focus();
        if (fileName) {
          const indexOfBracket = fileName.indexOf(AppConfig.beginTagContainer);
          const indexOfDot = fileName.lastIndexOf('.');
          let endRange = fileName.length;
          if (indexOfBracket > 0) {
            endRange = indexOfBracket;
          } else if (indexOfDot > 0) {
            endRange = indexOfDot;
          }
          this.fileName.setSelectionRange(0, endRange);
        }
        return {
          fileName
        };
      });
    }
  };

  fileName;

  handleRenameFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'fileName') {
      this.setState({ fileName: value }, this.handleValidation);
    }
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
      const fileDirectory = extractContainingDirectoryPath(
        this.props.selectedFilePath,
        PlatformIO.getDirSeparator()
      );
      const newFilePath =
        fileDirectory + PlatformIO.getDirSeparator() + this.state.fileName;
      this.props.renameFile(this.props.selectedFilePath, newFilePath);
      this.props.onClose(true);
      this.setState({ inputError: false, disableConfirmButton: true });
    } else {
      this.handleValidation();
    }
  };

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:renameFileTitle')}</DialogTitle>
  );

  renderContent = () => (
    <DialogContent className={this.props.classes.root}>
      <FormControl
        data-tid="renameFileDialog"
        fullWidth={true}
        error={this.state.inputError}
      >
        <TextField
          error={this.state.inputError}
          margin="dense"
          name="fileName"
          autoFocus
          inputRef={ref => {
            this.fileName = ref;
          }}
          label={i18n.t('core:renameNewFileName')}
          onChange={this.handleRenameFile}
          value={this.state.fileName}
          data-tid="renameFileDialogInput"
          fullWidth={true}
        />
        {this.state.inputError && (
          <FormHelperText>Empty File Name</FormHelperText>
        )}
      </FormControl>
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="closeRenameFileDialog"
        onClick={() => this.props.onClose()}
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
    const { onClose, open } = this.props;
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={onClose}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            event.stopPropagation();
            this.onConfirm();
          } else if (event.key === 'Escape') {
            onClose();
          }
        }}
      >
        {this.renderTitle()}
        {this.renderContent()}
        {this.renderActions()}
      </Dialog>
    );
  }
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      renameFile: AppActions.renameFile
    },
    dispatch
  );
}

export default connect(
  null,
  mapActionCreatorsToProps
)(withStyles(styles)(RenameFileDialog));
