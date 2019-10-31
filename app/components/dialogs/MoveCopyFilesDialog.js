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
import withMobileDialog from '@material-ui/core/withMobileDialog';
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
import Typography from '@material-ui/core/Typography';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
// import { extractContainingDirectoryPath } from '../../utils/paths';
import PlatformIO from '../../services/platform-io';
import AppConfig from '../../config';
import IOActions from '../../reducers/io-actions';
import { extractFileName } from '../../utils/paths';

type Props = {
  classes: Object,
  open: boolean,
  fullScreen: boolean,
  onClose: () => void,
  copyFiles: (files: Array<string>, destination: string) => void,
  moveFiles: (files: Array<string>, destination: string) => void,
  selectedFiles: Array<string>
};

const MoveCopyFilesDialog = (props: Props) => {
  const [inputError, setInputError] = useState(false);
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [targetPath, setTargetPath] = useState('');

  useEffect(() => {
    handleValidation();
  });

  function handleValidation() {
    if (targetPath && targetPath.length > 0) {
      setInputError(false);
      setDisableConfirmButton(false);
    } else {
      setInputError(true);
      setDisableConfirmButton(true);
    }
  }

  function handleCopyFiles() {
    if (!disableConfirmButton) {
      props.copyFiles(props.selectedFiles, targetPath);
      setInputError(false);
      setDisableConfirmButton(true);
      setTargetPath('');
    }
    props.onClose();
  }

  function handleMoveFiles() {
    if (!disableConfirmButton) {
      props.moveFiles(props.selectedFiles, targetPath);
      setInputError(false);
      setDisableConfirmButton(true);
      setTargetPath('');
    }
    props.onClose();
  }

  function selectDirectory() {
    if (AppConfig.isElectron) {
      PlatformIO.selectDirectoryDialog().then(selectedPaths => {
        setTargetPath(selectedPaths[0]);
        return true;
      }).catch((err) => {
        console.log('selectDirectoryDialog failed with: ' + err);
      });
    } else {
      // TODO handle case on other platforms
      // this.props.showSelectDirectoryDialog();
    }
  }

  function renderTitle() {
    return (
      <DialogTitle>{i18n.t('core:copyMoveFilesTitle')}</DialogTitle>
    );
  }

  function renderContent() {
    return (
      <DialogContent>
        <List dense style={{ width: 550 }}>
          {props.selectedFiles && props.selectedFiles.length > 0 && props.selectedFiles.map(path => (
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
            onChange={event => {
              const target = event.target;
              setTargetPath(target.value);
            }}
            value={targetPath}
            endAdornment={
              PlatformIO.haveObjectStoreSupport() || AppConfig.isWeb ? undefined :
                (<InputAdornment position="end" style={{ height: 33 }}>
                  <IconButton
                    data-tid="openDirectoryMoveCopyDialog"
                    onClick={selectDirectory}
                  >
                    <FolderIcon />
                  </IconButton>
                </InputAdornment>)
            }
          />
          {inputError && <FormHelperText>Empty Input Field</FormHelperText>}
        </FormControl>
      </DialogContent>
    );
  }

  function renderActions() {
    return (
      <DialogActions>
        <Button
          data-tid="closeMoveCopyDialog"
          onClick={props.onClose}
        >
          {i18n.t('core:cancel')}
        </Button>
        <Button
          data-tid="confirmMoveFiles"
          disabled={disableConfirmButton}
          onClick={handleMoveFiles}
          color="primary"
        >
          {i18n.t('core:moveFilesButton')}
        </Button>
        <Button
          onClick={handleCopyFiles}
          data-tid="confirmCopyFiles"
          disabled={disableConfirmButton}
          color="primary"
        >
          {i18n.t('core:copyFilesButton')}
        </Button>
      </DialogActions>
    );
  }

  return (
    <GenericDialog
      open={props.open}
      onClose={props.onClose}
      fullScreen={props.fullScreen}
      // onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
      renderTitle={renderTitle}
      renderContent={renderContent}
      renderActions={renderActions}
    />
  );
};

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators({
    copyFiles: IOActions.copyFiles,
    moveFiles: IOActions.moveFiles
  }, dispatch);
}

export default connect(null, mapActionCreatorsToProps)(
  withMobileDialog()(MoveCopyFilesDialog)
);
