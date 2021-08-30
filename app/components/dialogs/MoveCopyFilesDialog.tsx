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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import FolderIcon from '@material-ui/icons/Folder';
import FileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import i18n from '-/services/i18n';
import PlatformIO from '-/services/platform-io';
import AppConfig from '-/config';
import IOActions from '-/reducers/io-actions';
import { extractFileName } from '-/utils/paths';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

interface Props {
  open: boolean;
  fullScreen: boolean;
  onClose: (clearSelection?: boolean) => void;
  copyFiles: (files: Array<string>, destination: string) => void;
  moveFiles: (files: Array<string>, destination: string) => void;
  selectedFiles: Array<string>;
}

const MoveCopyFilesDialog = (props: Props) => {
  const [inputError, setInputError] = useState(false);
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [targetPath, setTargetPath] = useState('');
  const { open, onClose, fullScreen } = props;

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
    props.onClose(true);
  }

  function handleMoveFiles() {
    if (!disableConfirmButton) {
      props.moveFiles(props.selectedFiles, targetPath);
      setInputError(false);
      setDisableConfirmButton(true);
      setTargetPath('');
    }
    props.onClose(true);
  }

  function selectDirectory() {
    PlatformIO.selectDirectoryDialog()
      .then(selectedPaths => {
        setTargetPath(selectedPaths[0]);
        return true;
      })
      .catch(err => {
        console.log('selectDirectoryDialog failed with: ' + err);
      });
  }

  function onCloseDialog() {
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      fullScreen={fullScreen}
    >
      <DialogTitle>
        {i18n.t('core:copyMoveFilesTitle')}
        <DialogCloseButton onClose={onCloseDialog} />
      </DialogTitle>
      <DialogContent>
        <List dense style={{ width: 550 }}>
          {props.selectedFiles &&
            props.selectedFiles.length > 0 &&
            props.selectedFiles.map(path => (
              <ListItem title={path} key={path}>
                <ListItemIcon>
                  <FileIcon />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  {extractFileName(path, PlatformIO.getDirSeparator())}
                </Typography>
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
              const { target } = event;
              setTargetPath(target.value);
            }}
            value={targetPath}
            endAdornment={
              PlatformIO.haveObjectStoreSupport() || AppConfig.isWeb ? (
                undefined
              ) : (
                <InputAdornment position="end" style={{ height: 33 }}>
                  <IconButton
                    data-tid="openDirectoryMoveCopyDialog"
                    onClick={selectDirectory}
                  >
                    <FolderIcon />
                  </IconButton>
                </InputAdornment>
              )
            }
          />
          {inputError && <FormHelperText>Empty Input Field</FormHelperText>}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button data-tid="closeMoveCopyDialog" onClick={() => props.onClose()}>
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
    </Dialog>
  );
};

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      copyFiles: IOActions.copyFiles,
      moveFiles: IOActions.moveFiles
    },
    dispatch
  );
}

export default connect(
  null,
  mapActionCreatorsToProps
)(withMobileDialog()(MoveCopyFilesDialog));
