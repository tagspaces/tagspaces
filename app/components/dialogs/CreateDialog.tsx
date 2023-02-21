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

import React, { useReducer, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { saveAs } from 'file-saver';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import HTMLFileIcon from '@mui/icons-material/PhotoAlbumOutlined';
import InputAdornment from '@mui/material/InputAdornment';
import TextFileIcon from '@mui/icons-material/InsertDriveFileOutlined';
import MarkdownFileIcon from '@mui/icons-material/DescriptionOutlined';
import AddFileIcon from '@mui/icons-material/NoteAddOutlined';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import withStyles from '@mui/styles/withStyles';
import Dialog from '@mui/material/Dialog';
import { Progress } from 'aws-sdk/clients/s3';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import i18n from '-/services/i18n';
import { getKeyBindingObject } from '-/reducers/settings';
import {
  actions as AppActions,
  getDirectoryPath,
  getSelectedEntries,
  getCurrentDirectoryPerspective
} from '-/reducers/app';
import IOActions from '-/reducers/io-actions';
import {
  getLocations,
  getFirstRWLocation,
  getCurrentLocation
} from '-/reducers/locations';
import { TS } from '-/tagspaces.namespace';
import PlatformIO from '-/services/platform-facade';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import Spacer from '-/components/Spacer';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import { FormControl } from '@mui/material';
import { fileNameValidation } from '-/services/utils-io';
import { PerspectiveIDs } from '-/perspectives';

const styles: any = () => ({
  createButton: {
    minHeight: 100,
    width: '100%',
    textAlign: 'center',
    textTransform: 'none'
  }
});

interface Props {
  open: boolean;
  classes: any;
  // locations: Array<TS.Location>;
  firstRWLocation: TS.Location;
  // currentLocation: TS.Location;
  selectedEntries: Array<TS.FileSystemEntry>;
  currentDirectoryPath: string | null;
  currentDirectoryPerspective: string;
  openLocation: (location: TS.Location) => void;
  // selectedDirectoryPath: string;
  // chooseDirectoryPath: (path: string) => void;
  showNotification: (message: string, type: string) => void;
  reflectCreateEntries: (fsEntries: Array<TS.FileSystemEntry>) => void;
  createFileAdvanced: (
    targetPath: string,
    fileName: string,
    content: string,
    fileType: string
  ) => void;
  onClose: () => void;
  uploadFilesAPI: (
    files: Array<File>,
    destination: string,
    onUploadProgress?: (progress: Progress, response: any) => void
  ) => any;
  onUploadProgress: (progress: Progress, response: any) => void;
  toggleUploadDialog: () => void;
  resetProgress: () => void;
}

function CreateDialog(props: Props) {
  const {
    classes,
    open,
    onClose,
    createFileAdvanced,
    openLocation,
    currentDirectoryPath,
    currentDirectoryPerspective,
    selectedEntries,
    // currentLocation,
    showNotification,
    firstRWLocation
  } = props;
  const fileUrl = useRef<string>();
  const fileName = useRef<string>(
    'note' +
      AppConfig.beginTagContainer +
      formatDateTime4Tag(new Date(), true) +
      AppConfig.endTagContainer
  );
  const [inputError, setInputError] = useState<boolean>(false);
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  let fileInput: HTMLInputElement;
  const fileContent = '';

  let targetDirectoryPath = currentDirectoryPath;
  if (
    currentDirectoryPerspective === PerspectiveIDs.KANBAN &&
    selectedEntries &&
    selectedEntries.length === 1 &&
    !selectedEntries[0].isFile
  ) {
    targetDirectoryPath = selectedEntries[0].path;
  }

  if (!targetDirectoryPath && firstRWLocation) {
    targetDirectoryPath = firstRWLocation.path;
  }

  const noSuitableLocation = !targetDirectoryPath;

  // function handleKeyPress(event: any) {
  //   if (event.key === 'n') {
  //     event.stopPropagation();
  //     createRichTextFile();
  //   } else if (event.key === 't') {
  //     event.stopPropagation();
  //     createTextFile();
  //   } else if (event.key === 'm') {
  //     event.stopPropagation();
  //     createMarkdownFile();
  //   } else if (event.key === 'a') {
  //     event.stopPropagation();
  //     addFile();
  //   }
  // }

  function loadLocation() {
    if (!currentDirectoryPath && firstRWLocation) {
      openLocation(firstRWLocation);
    }
  }

  function createRichTextFile() {
    if (targetDirectoryPath && !fileNameValidation(fileName.current)) {
      loadLocation();
      createFileAdvanced(
        targetDirectoryPath,
        fileName.current,
        fileContent,
        'html'
      );
      onClose();
    }
  }

  function createTextFile() {
    if (targetDirectoryPath && !fileNameValidation(fileName.current)) {
      loadLocation();
      createFileAdvanced(
        targetDirectoryPath,
        fileName.current,
        fileContent,
        'txt'
      );
      onClose();
    }
  }

  function createMarkdownFile() {
    if (targetDirectoryPath && !fileNameValidation(fileName.current)) {
      loadLocation();
      createFileAdvanced(
        targetDirectoryPath,
        fileName.current,
        fileContent,
        'md'
      );
      onClose();
    }
  }

  function addFile() {
    loadLocation();
    fileInput.click();
  }

  function handleFileInputChange(selection: any) {
    // console.log("Selected File: "+JSON.stringify(selection.currentTarget.files[0]));
    // const file = selection.currentTarget.files[0];
    props.resetProgress();
    props.toggleUploadDialog();
    props
      .uploadFilesAPI(
        Array.from(selection.currentTarget.files),
        targetDirectoryPath,
        props.onUploadProgress
      )
      .then(fsEntries => {
        props.reflectCreateEntries(fsEntries);
        return true;
      })
      .catch(error => {
        console.log('uploadFiles', error);
      });
    onClose();
  }

  const onInputFocus = event => {
    if (fileName.current) {
      event.preventDefault();
      const { target } = event;
      target.focus();
      const indexOfBracket = fileName.current.indexOf(
        AppConfig.beginTagContainer
      );
      let endRange = fileName.current.length;
      // if (indexOfBracket > 0) {
      //   endRange = indexOfBracket;
      // }
      target.setSelectionRange(0, endRange);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    fileName.current = event.target.value;
    handleValidation();
  };

  const handleValidation = () => {
    let noValid = fileNameValidation(fileName.current);

    if (noValid) {
      if (inputError !== noValid) {
        setInputError(noValid);
      } else {
        forceUpdate();
      }
    } else {
      setInputError(noValid);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    fileUrl.current = event.target.value;
  };

  function downloadURL() {
    if (fileUrl.current) {
      /*if (AppConfig.isElectron) {
        PlatformIO.saveFilePromise()
      } else {*/
      saveAs(
        fileUrl.current,
        fileUrl.current.substring(fileUrl.current.lastIndexOf('/') + 1)
      );
      onClose();
    }
  }

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      scroll="paper"
      // onKeyDown={event => {
      //   // if (event.key === 'N' || event.key === 'n') {
      //   //   createRichTextFile();
      //   // } else if (event.key === 'T' || event.key === 't') {
      //   //   createTextFile();
      //   // } else if (event.key === 'M' || event.key === 'm') {
      //   //   createMarkdownFile();
      //   // } else if (event.key === 'A' || event.key === 'a') {
      //   //   addFile();
      //   // } else
      // }}
    >
      <DialogTitle>
        {i18n.t('createNewContent')}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent
        // onKeyPress={handleKeyPress}
        style={{
          display: 'flex',
          minWidth: 200,
          minHeight: 300,
          marginBottom: 20,
          overflow: 'overlay',
          alignSelf: 'center'
        }}
        data-tid="keyboardShortCutsDialog"
      >
        <Grid style={{ flexGrow: 1, width: '100%' }} container spacing={1}>
          {noSuitableLocation && (
            <Grid item xs={12}>
              <Typography>
                File can not be created. No suitable location found!
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <FormControl fullWidth={true} error={inputError}>
              <TextField
                autoFocus
                error={inputError}
                margin="dense"
                name="entryName"
                label={i18n.t('core:newFileName')}
                onChange={handleInputChange}
                onFocus={onInputFocus}
                defaultValue={fileName.current}
                disabled={noSuitableLocation}
                fullWidth={true}
                data-tid="newEntryDialogInputTID"
                helperText={'File will be created in : ' + targetDirectoryPath}
              />
              {inputError && (
                <FormHelperText>{i18n.t('core:fileNameHelp')}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={createMarkdownFile}
              className={classes.createButton}
              // title={i18n.t('createMarkdownTitle')}
              data-tid="createMarkdownButton"
              disabled={noSuitableLocation}
            >
              <Avatar>
                <MarkdownFileIcon />
              </Avatar>
              <Container>
                <Typography variant="button" display="block" gutterBottom>
                  {i18n.t('createMarkdown')}
                </Typography>
                <Spacer height={10} />
                <Typography variant="caption" display="block" gutterBottom>
                  {i18n.t('createMarkdownTitle')}
                </Typography>
              </Container>
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={createRichTextFile}
              className={classes.createButton}
              // title={i18n.t('createNoteTitle')}
              data-tid="createRichTextFileButton"
              disabled={noSuitableLocation}
            >
              <Avatar>
                <HTMLFileIcon />
              </Avatar>
              <Container>
                <Typography variant="button" display="block" gutterBottom>
                  {i18n.t('createRichTextFile')}
                </Typography>
                <Spacer height={10} />
                <Typography variant="caption" display="block" gutterBottom>
                  {i18n.t('createNoteTitle')}
                </Typography>
              </Container>
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={createTextFile}
              className={classes.createButton}
              // title={i18n.t('createTextFileTitle')}
              data-tid="createTextFileButton"
              disabled={noSuitableLocation}
            >
              <Avatar>
                <TextFileIcon />
              </Avatar>
              <Container>
                <Typography variant="button" display="block" gutterBottom>
                  {i18n.t('createTextFile')}
                </Typography>
                <Spacer height={10} />
                <Typography variant="caption" display="block" gutterBottom>
                  {i18n.t('createTextFileTitle')}
                </Typography>
              </Container>
            </Button>
          </Grid>
          <Grid style={{ marginTop: 40 }} item xs={12}>
            <Button
              variant="outlined"
              onClick={addFile}
              className={classes.createButton}
              // title={i18n.t('addFilesTitle')}
              data-tid="addFilesButton"
              disabled={noSuitableLocation}
            >
              <Avatar>
                <AddFileIcon />
              </Avatar>
              <Container>
                <Typography variant="button" display="block" gutterBottom>
                  {i18n.t('addFiles')}
                </Typography>
                <Spacer height={10} />
                <Typography variant="caption" display="block" gutterBottom>
                  {i18n.t('addFilesTitle')}
                </Typography>
              </Container>
            </Button>
          </Grid>
          <Grid style={{ marginTop: 40 }} item xs={12}>
            <TextField
              label={i18n.t('core:url')}
              margin="dense"
              name="name"
              fullWidth={true}
              data-tid="newUrlTID"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      data-tid="cancelRenameEntryTID"
                      onClick={() => downloadURL()}
                    >
                      {i18n.t('core:downloadFile')}
                    </Button>
                  </InputAdornment>
                )
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  downloadURL();
                }
              }}
              onChange={handleUrlChange}
            />
          </Grid>
        </Grid>
        <input
          style={{ display: 'none' }}
          ref={input => {
            fileInput = input;
          }}
          accept="*"
          type="file"
          multiple
          onChange={handleFileInputChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function mapStateToProps(state) {
  return {
    // locations: getLocations(state),
    firstRWLocation: getFirstRWLocation(state),
    keyBindings: getKeyBindingObject(state),
    selectedEntries: getSelectedEntries(state),
    currentDirectoryPath: getDirectoryPath(state),
    currentDirectoryPerspective: getCurrentDirectoryPerspective(state)
    // currentLocation: getCurrentLocation(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      openLocation: AppActions.openLocation,
      createFileAdvanced: AppActions.createFileAdvanced,
      showNotification: AppActions.showNotification,
      reflectCreateEntries: AppActions.reflectCreateEntries,
      uploadFilesAPI: IOActions.uploadFilesAPI,
      onUploadProgress: AppActions.onUploadProgress,
      toggleUploadDialog: AppActions.toggleUploadDialog,
      resetProgress: AppActions.resetProgress
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withStyles(styles)(CreateDialog));
