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

import React, { useState, useRef, useReducer, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Progress } from 'aws-sdk/clients/s3';
import { formatBytes } from '@tagspaces/tagspaces-common/misc';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FolderIcon from '@mui/icons-material/Folder';
import FileIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import AppConfig from '-/AppConfig';
import i18n from '-/services/i18n';
import PlatformIO from '-/services/platform-facade';
import IOActions from '-/reducers/io-actions';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { actions as AppActions, getSelectedEntries } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';

interface Props {
  open: boolean;
  onClose: (clearSelection?: boolean) => void;
  copyFiles: (files: Array<string>, destination: string) => void;
  copyDirs: (dirs: Array<string>, destination: string) => void;
  moveFiles: (files: Array<string>, destination: string) => void;
  moveDirs: (
    dirs: Array<string>,
    destination: string,
    onUploadProgress?: (progress: Progress, response: any) => void,
    onAbort?: () => void
  ) => void;
  selectedEntries: Array<TS.FileSystemEntry>;
  selectedFiles?: Array<string>;
  onUploadProgress: (progress: Progress, response: any) => void;
  toggleUploadDialog: () => void;
  resetProgress: () => void;
}

function MoveCopyFilesDialog(props: Props) {
  const [inputError, setInputError] = useState(false);
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [targetPath, setTargetPath] = useState('');
  const dirSizes = useRef({});

  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const { open, onClose } = props;

  let selectedFiles = props.selectedFiles ? props.selectedFiles : [];
  if (props.selectedEntries) {
    selectedFiles = selectedFiles.concat(
      props.selectedEntries
        .filter(fsEntry => fsEntry.isFile)
        .map(fsentry => fsentry.path)
    );
  }

  const selectedDirs = props.selectedEntries
    ? props.selectedEntries
        .filter(fsEntry => !fsEntry.isFile)
        .map(fsentry => fsentry.path)
    : [];

  useEffect(() => {
    if (selectedDirs.length > 0) {
      const promises = selectedDirs.map(dirPath => {
        return PlatformIO.dirSize(dirPath).then(dirSize => {
          dirSizes.current[dirPath] = dirSize;
          return true;
        });
      });
      Promise.all(promises).then(() => forceUpdate());
    }
  }, []);

  useEffect(() => {
    handleValidation();
  }, [targetPath]);

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
      if (selectedFiles.length > 0) {
        props.copyFiles(selectedFiles, targetPath);
        setInputError(false);
        setDisableConfirmButton(true);
        setTargetPath('');
      }
      if (selectedDirs.length > 0) {
        props.copyDirs(selectedDirs, targetPath);
      }
    }
    props.onClose(true);
  }

  function handleMoveFiles() {
    if (!disableConfirmButton) {
      if (selectedFiles.length > 0) {
        props.moveFiles(selectedFiles, targetPath);
        setInputError(false);
        setDisableConfirmButton(true);
        setTargetPath('');
      }
      if (selectedDirs.length > 0) {
        props.resetProgress();
        props.toggleUploadDialog();
        props.moveDirs(selectedDirs, targetPath, props.onUploadProgress);
      }
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

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
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
      <DialogContent style={{ overflowX: 'hidden' }}>
        <List
          dense
          style={{ width: 550, marginLeft: -15 }}
          subheader={
            <ListSubheader
              style={{ backgroundColor: 'transparent' }}
              component="div"
            >
              {i18n.t('selectedFiles')}
            </ListSubheader>
          }
        >
          {props.selectedEntries &&
            props.selectedEntries.length > 0 &&
            props.selectedEntries.map(entry => (
              <ListItem title={entry.path} key={entry.path}>
                <ListItemIcon>
                  <FileIcon />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  {entry.name}
                  {dirSizes.current[entry.path] &&
                    ' (' +
                      i18n.t('fileSize') +
                      ': ' +
                      formatBytes(dirSizes.current[entry.path]) +
                      ')'}
                </Typography>
              </ListItem>
            ))}
        </List>
        <FormControl fullWidth={true}>
          <TextField
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
            InputProps={{
              endAdornment:
                PlatformIO.haveObjectStoreSupport() ||
                PlatformIO.haveWebDavSupport() ||
                AppConfig.isWeb ? (
                  undefined
                ) : (
                  <InputAdornment position="end" style={{ height: 33 }}>
                    <IconButton
                      data-tid="openDirectoryMoveCopyDialog"
                      onClick={selectDirectory}
                      size="large"
                    >
                      <FolderIcon />
                    </IconButton>
                  </InputAdornment>
                )
            }}
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
}

function mapStateToProps(state) {
  return {
    selectedEntries: getSelectedEntries(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      copyFiles: IOActions.copyFiles,
      moveFiles: IOActions.moveFiles,
      moveDirs: IOActions.moveDirs,
      copyDirs: IOActions.copyDirs,
      toggleUploadDialog: AppActions.toggleUploadDialog,
      onUploadProgress: AppActions.onUploadProgress,
      resetProgress: AppActions.resetProgress
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(MoveCopyFilesDialog);
