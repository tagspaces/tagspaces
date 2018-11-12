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
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import FileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Typography } from '@material-ui/core';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
// import { extractContainingDirectoryPath } from '../../utils/paths';
import PlatformIO from '../../services/platform-io';
import AppConfig from '../../config';
import IOActions from '../../reducers/io-actions';
import { extractFileName } from '../../utils/paths';

type Props = {
  open?: boolean,
  onClose: () => void,
  copyFiles: (files: Array<string>, destination: string) => void,
  moveFiles: (files: Array<string>, destination: string) => void,
  selectedFiles: Array<string>
};

type State = {
  inputError?: boolean,
  disableConfirmButton?: boolean,
  targetPath?: string
};

class MoveCopyFilesDialog extends React.Component<Props, State> {
  state = {
    inputError: false,
    disableConfirmButton: true,
    targetPath: ''
  };

  handleValidation() {
    if (this.state.targetPath && this.state.targetPath.length > 0) {
      this.setState({ inputError: false, disableConfirmButton: false });
    } else {
      this.setState({ inputError: true, disableConfirmButton: true });
    }
  }

  handleCopyFiles = () => {
    if (!this.state.disableConfirmButton) {
      this.props.copyFiles(this.props.selectedFiles, this.state.targetPath);
      this.setState({
        inputError: false,
        disableConfirmButton: true,
        targetPath: ''
      });
      this.props.onClose();
    }
  };

  handleMoveFiles = () => {
    if (!this.state.disableConfirmButton) {
      this.props.moveFiles(this.props.selectedFiles, this.state.targetPath);
      this.setState({
        inputError: false,
        disableConfirmButton: true,
        targetPath: ''
      });
      this.props.onClose();
    }
  };

  handleInputChange = (event: Object) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    }, this.handleValidation);
  };

  selectDirectory = () => {
    if (AppConfig.isElectron) {
      PlatformIO.selectDirectoryDialog().then(selectedPaths => {
        this.setState({
          targetPath: selectedPaths[0],
        });
        this.handleValidation();
        return true;
      }).catch((err) => {
        console.log('selectDirectoryDialog failed with: ' + err);
      });
    } else {
      // TODO handle case on other platforms
      // this.props.showSelectDirectoryDialog();
    }
  }

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:copyMoveFilesTitle')}</DialogTitle>
  );

  renderContent = () => (
    <DialogContent>
      <List dense style={{ width: 550 }}>
        {this.props.selectedFiles && this.props.selectedFiles.length > 0 && this.props.selectedFiles.map(path => (
          <ListItem title={path}>
            <ListItemIcon>
              <FileIcon />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>{extractFileName(path)}</Typography>
          </ListItem>
        ))}
      </List>
      <FormControl fullWidth={true}>
        <Input
          autoFocus
          required
          margin="dense"
          name="targetPath"
          placeholder={i18n.t('core:moveCopyToPath')}
          fullWidth={true}
          data-tid="targetPathInput"
          onChange={e => this.handleInputChange(e)}
          value={this.state.targetPath}
          endAdornment={
            <InputAdornment position="end" style={{ height: 33 }}>
              <IconButton
                data-tid="openDirectoryMoveCopyDialog"
                onClick={this.selectDirectory}
              >
                <FolderIcon />
              </IconButton>
            </InputAdornment>
          }
        />
        {this.state.inputError && <FormHelperText>Empty Input Field</FormHelperText>}
      </FormControl>
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="closeMoveCopyDialog"
        onClick={this.props.onClose}
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        data-tid="confirmMoveFiles"
        disabled={this.state.disableConfirmButton}
        onClick={this.handleMoveFiles}
      >
        {i18n.t('core:moveFilesButton')}
      </Button>
      <Button
        onClick={this.handleCopyFiles}
        data-tid="confirmCopyFiles"
        disabled={this.state.disableConfirmButton}
      >
        {i18n.t('core:copyFilesButton')}
      </Button>
    </DialogActions>
  );

  render() {
    return (
      <GenericDialog
        open={this.props.open}
        onClose={this.props.onClose}
        // onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators({
    copyFiles: IOActions.copyFiles,
    moveFiles: IOActions.moveFiles
  }, dispatch);
}

export default connect(null, mapActionCreatorsToProps)(MoveCopyFilesDialog);
