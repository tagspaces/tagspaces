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
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import { FolderIcon, FileIcon } from '-/components/CommonIcons';
import DraggablePaper from '-/components/DraggablePaper';
import i18n from '-/services/i18n';
import PlatformIO from '-/services/platform-facade';
import IOActions from '-/reducers/io-actions';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { actions as AppActions, getSelectedEntries } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import DirectoryListView from '-/components/DirectoryListView';
import AppConfig from '-/AppConfig';
import Tooltip from '-/components/Tooltip';

interface Props {
  open: boolean;
  onClose: (clearSelection?: boolean) => void;
  copyFiles: (files: Array<string>, destination: string) => void;
  copyDirs: (
    dirs: Array<string>,
    totalCount: number,
    destination: string,
    onUploadProgress?: (progress: Progress, abort: () => void) => void
  ) => void;
  moveFiles: (files: Array<string>, destination: string) => void;
  moveDirs: (
    dirs: Array<string>,
    totalCount: number,
    destination: string,
    onUploadProgress?: (progress: Progress, abort: () => void) => void
  ) => void;
  selectedEntries: Array<TS.FileSystemEntry>;
  selectedFiles?: Array<string>;
  onUploadProgress: (progress: Progress, abort: () => void) => void;
  toggleUploadDialog: (title?) => void;
  resetProgress: () => void;
}

function MoveCopyFilesDialog(props: Props) {
  // const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [targetPath, setTargetPath] = useState('');
  const dirProp = useRef({});

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
    if (selectedDirs.length > 0 && AppConfig.isElectron) {
      // getDirProperties have Electron impl only
      const promises = selectedDirs.map(dirPath => {
        return PlatformIO.getDirProperties(dirPath).then(prop => {
          dirProp.current[dirPath] = prop;
          return true;
        });
      });
      Promise.all(promises).then(() => forceUpdate());
    }
  }, []);

  /*useEffect(() => {
    handleValidation();
  }, [targetPath]);*/

  /*function handleValidation() {
    if (targetPath && targetPath.length > 0) {
      setDisableConfirmButton(false);
    } else {
      setDisableConfirmButton(true);
    }
  }*/

  function getEntriesCount(): number {
    let total = 0;
    const arr = Object.values(dirProp.current);
    arr.forEach((n: TS.DirProp) => (total += n.filesCount + n.dirsCount));
    return total;
  }

  function handleCopyFiles() {
    //if (!disableConfirmButton) {
    if (selectedFiles.length > 0) {
      props.copyFiles(selectedFiles, targetPath);
      //setDisableConfirmButton(true);
      setTargetPath('');
    }
    if (selectedDirs.length > 0) {
      props.resetProgress();
      props.toggleUploadDialog('copyEntriesTitle');
      props.copyDirs(
        selectedDirs,
        getEntriesCount(),
        targetPath,
        props.onUploadProgress
      );
    }
    props.onClose(true);
  }

  function handleMoveFiles() {
    // if (!disableConfirmButton) {
    if (selectedFiles.length > 0) {
      props.moveFiles(selectedFiles, targetPath);
      // setDisableConfirmButton(true);
      setTargetPath('');
    }
    if (selectedDirs.length > 0) {
      props.resetProgress();
      props.toggleUploadDialog('moveEntriesTitle');
      props.moveDirs(
        selectedDirs,
        getEntriesCount(),
        targetPath,
        props.onUploadProgress
      );
    }
    props.onClose(true);
  }

  /*function selectDirectory() {
    PlatformIO.selectDirectoryDialog()
      .then(selectedPaths => {
        setTargetPath(selectedPaths[0]);
        return true;
      })
      .catch(err => {
        console.log('selectDirectoryDialog failed with: ' + err);
      });
  }*/

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
      aria-labelledby="draggable-dialog-title"
      PaperComponent={fullScreen ? Paper : DraggablePaper}
      fullScreen={fullScreen}
    >
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {i18n.t('core:copyMoveEntriesTitle')}
        <DialogCloseButton onClose={onCloseDialog} />
      </DialogTitle>
      <DialogContent style={{ overflow: 'hidden' }}>
        <Typography variant="subtitle2">
          {i18n.t('selectedFilesAndFolders')}
        </Typography>
        <List
          dense
          style={{
            overflowY: 'auto',
            width: 550,
            maxHeight: 200,
            marginLeft: -15,
            marginBottom: 20
          }}
        >
          {props.selectedEntries &&
            props.selectedEntries.length > 0 &&
            props.selectedEntries.map(entry => (
              <ListItem title={entry.path} key={entry.path}>
                <ListItemIcon>
                  {entry.isFile ? <FileIcon /> : <FolderIcon />}
                </ListItemIcon>
                <Typography variant="subtitle2" noWrap>
                  {entry.name}
                  {dirProp.current[entry.path] &&
                    ' (' +
                      i18n.t('fileSize') +
                      ': ' +
                      formatBytes(dirProp.current[entry.path]['totalSize']) +
                      ')'}
                </Typography>
              </ListItem>
            ))}
        </List>
        {targetPath ? (
          <Typography variant="subtitle2">
            {i18n.t('moveCopyToPath') + ': ' + targetPath}
          </Typography>
        ) : (
          <Typography variant="subtitle2">
            {i18n.t('chooseTargetLocationAndPath')}
          </Typography>
        )}
        <DirectoryListView setTargetDir={setTargetPath} />
      </DialogContent>
      <DialogActions
      // style={{
      //   justifyContent: 'space-between'
      // }}
      >
        <Button data-tid="closeMoveCopyDialog" onClick={() => props.onClose()}>
          {i18n.t('core:cancel')}
        </Button>
        <Tooltip
          title={i18n.t(
            AppConfig.isAndroid
              ? 'core:platformImplMissing'
              : 'core:moveEntriesButton'
          )}
        >
          <span>
            <Button
              data-tid="confirmMoveFiles"
              disabled={!targetPath || AppConfig.isAndroid}
              onClick={handleMoveFiles}
              color="primary"
            >
              {i18n.t('core:moveEntriesButton')}
            </Button>
          </span>
        </Tooltip>
        <Button
          onClick={handleCopyFiles}
          data-tid="confirmCopyFiles"
          disabled={!targetPath}
          color="primary"
        >
          {i18n.t('core:copyEntriesButton')}
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
