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
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import HTMLFileIcon from '@mui/icons-material/PhotoAlbumOutlined';
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
import { formatDateTime4Tag } from '@tagspaces/tagspaces-platforms/misc';
import AppConfig from '@tagspaces/tagspaces-platforms/AppConfig';
import i18n from '-/services/i18n';
import { getKeyBindingObject } from '-/reducers/settings';
import {
  actions as AppActions,
  getDirectoryPath,
  getSelectedEntries
} from '-/reducers/app';
import IOActions from '-/reducers/io-actions';
import { TS } from '-/tagspaces.namespace';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import Spacer from '-/components/Spacer';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import { FormControl } from '@mui/material';
import { fileNameValidation } from '-/services/utils-io';

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
  selectedEntries: Array<TS.FileSystemEntry>;
  currentDirectoryPath: string | null;
  // selectedDirectoryPath: string;
  // chooseDirectoryPath: (path: string) => void;
  showNotification: (message: string, type: string, autohide: boolean) => void;
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
  const { classes, open, onClose } = props;
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

  const selectedDirectoryPath =
    props.selectedEntries && props.selectedEntries.length === 1
      ? props.selectedEntries[0].path
      : props.currentDirectoryPath;
  if (!selectedDirectoryPath) {
    return null;
  }

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

  function createRichTextFile() {
    if (selectedDirectoryPath && !fileNameValidation(fileName.current)) {
      props.createFileAdvanced(
        selectedDirectoryPath,
        fileName.current,
        fileContent,
        'html'
      );
      props.onClose();
    }
  }

  function createTextFile() {
    if (selectedDirectoryPath && !fileNameValidation(fileName.current)) {
      props.createFileAdvanced(
        selectedDirectoryPath,
        fileName.current,
        fileContent,
        'txt'
      );
      props.onClose();
    }
  }

  function createMarkdownFile() {
    if (selectedDirectoryPath && !fileNameValidation(fileName.current)) {
      props.createFileAdvanced(
        selectedDirectoryPath,
        fileName.current,
        fileContent,
        'md'
      );
      props.onClose();
    }
  }

  function addFile() {
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
        selectedDirectoryPath,
        props.onUploadProgress
      )
      .then(fsEntries => {
        props.reflectCreateEntries(fsEntries);
        return true;
      })
      .catch(error => {
        console.log('uploadFiles', error);
      });
    props.onClose();
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

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      scroll="paper"
      onKeyDown={event => {
        // if (event.key === 'N' || event.key === 'n') {
        //   createRichTextFile();
        // } else if (event.key === 'T' || event.key === 't') {
        //   createTextFile();
        // } else if (event.key === 'M' || event.key === 'm') {
        //   createMarkdownFile();
        // } else if (event.key === 'A' || event.key === 'a') {
        //   addFile();
        // } else
        /* if (event.key === 'Escape') {
          onClose();
        } */
      }}
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
          overflow: 'overlay',
          alignSelf: 'center'
        }}
        data-tid="keyboardShortCutsDialog"
      >
        <Grid style={{ flexGrow: 1, width: '100%' }} container spacing={1}>
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
                fullWidth={true}
                data-tid="newEntryDialogInputTID"
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
    keyBindings: getKeyBindingObject(state),
    selectedEntries: getSelectedEntries(state),
    currentDirectoryPath: getDirectoryPath(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
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
