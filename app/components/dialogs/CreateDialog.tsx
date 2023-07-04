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
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import withStyles from '@mui/styles/withStyles';
import Dialog from '@mui/material/Dialog';
import Paper from '@mui/material/Paper';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import DraggablePaper from '-/components/DraggablePaper';
import { Progress } from 'aws-sdk/clients/s3';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import i18n from '-/services/i18n';
import { getKeyBindingObject } from '-/reducers/settings';
import {
  actions as AppActions,
  getDirectoryPath,
  getSelectedEntries,
  getCurrentDirectoryPerspective,
  NotificationTypes
} from '-/reducers/app';
import IOActions from '-/reducers/io-actions';
import { getFirstRWLocation, getCurrentLocation } from '-/reducers/locations';
import { TS } from '-/tagspaces.namespace';
import PlatformIO from '-/services/platform-facade';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import Tooltip from '-/components/Tooltip';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import { FormControl } from '@mui/material';
import { fileNameValidation } from '-/services/utils-io';
import { PerspectiveIDs } from '-/perspectives';
import { ExpandIcon, InfoIcon } from '-/components/CommonIcons';

const styles: any = () => ({
  createButton: {
    width: '100%',
    textAlign: 'center'
  }
});

interface Props {
  open: boolean;
  classes: any;
  firstRWLocation: TS.Location;
  currentLocation: TS.Location;
  selectedEntries: Array<TS.FileSystemEntry>;
  currentDirectoryPath: string | null;
  currentDirectoryPerspective: string;
  openLocation: (location: TS.Location) => void;
  showNotification: (
    message: string,
    notificationType?: string,
    autohide?: boolean
  ) => void;
  toggleLocationDialog: () => void;
  toggleCreateDirectoryDialog: () => void;
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
  downloadFile: (
    url: string,
    destination: string,
    onDownloadProgress?: (progress: Progress, response: any) => void
  ) => any;
  onUploadProgress: (progress: Progress, response: any) => void;
  toggleUploadDialog: () => void;
  resetProgress: () => void;
  setProgress: (path: string, progress: number, abort?: string) => void;
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
    showNotification,
    currentLocation,
    firstRWLocation,
    toggleLocationDialog,
    toggleCreateDirectoryDialog
  } = props;
  const fileUrl = useRef<string>();
  const fileName = useRef<string>(
    'note' +
      AppConfig.beginTagContainer +
      formatDateTime4Tag(new Date(), true) +
      AppConfig.endTagContainer
  );
  const [inputError, setInputError] = useState<boolean>(false);
  const [invalidURL, setInvalidURL] = useState<boolean>(false);
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
      try {
        const url = new URL(fileUrl.current);
        if (invalidURL) {
          setInvalidURL(false);
        }
        let fileName;
        let pathParts;
        if (url.pathname) {
          const delimiterIndex = url.pathname.lastIndexOf('/');
          if (delimiterIndex > -1) {
            fileName = url.pathname.substring(delimiterIndex + 1);
            if (!fileName) {
              pathParts = url.pathname.split('/').filter(Boolean);
            }
          } else {
            fileName = url.pathname;
          }
        }
        if (!fileName) {
          fileName =
            url.hostname +
            (pathParts && pathParts.length > 0 ? pathParts.join('-') : '') +
            '.html';
        } else if (fileName.indexOf('.') === -1) {
          fileName = url.hostname + '-' + fileName + '.html';
        }
        if (PlatformIO.haveObjectStoreSupport() || AppConfig.isElectron) {
          props.resetProgress();
          props.toggleUploadDialog();
          props
            .downloadFile(
              fileUrl.current,
              targetDirectoryPath +
                PlatformIO.getDirSeparator() +
                decodeURIComponent(fileName),
              props.onUploadProgress
            )
            .then(() => {
              if (PlatformIO.haveObjectStoreSupport()) {
                // currently objectStore location in downloadFile use saveFilePromise and this function not have progress handling
                props.setProgress(fileUrl.current, 100);
              }
            })
            .catch(e => {
              console.log('downloadFile error:', e);
              props.setProgress(fileUrl.current, -1, i18n.t('core:errorCORS'));
              showNotification(
                'downloadFile error' + e.message,
                NotificationTypes.error,
                true
              );
            });
        } else {
          saveAs(fileUrl.current, decodeURIComponent(fileName));
        }
        onClose();
      } catch (ex) {
        setInvalidURL(true);
        console.error('downloadURL', ex);
      }
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
      aria-labelledby="draggable-dialog-title"
      PaperComponent={fullScreen ? Paper : DraggablePaper}
      scroll="paper"
    >
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {i18n.t('core:create') + '...'}
        <DialogCloseButton testId="closeCreateDialogTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent
        style={{
          minWidth: 200,
          minHeight: 300,
          marginBottom: 20,
          overflow: 'overlay'
        }}
        data-tid="keyboardShortCutsDialog"
      >
        <Accordion style={{ marginTop: 5 }} defaultExpanded>
          <AccordionDetails style={{ paddingTop: 16 }}>
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
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.keyCode === 13) {
                        event.preventDefault();
                        event.stopPropagation();
                        createMarkdownFile();
                      }
                    }}
                    defaultValue={fileName.current}
                    disabled={noSuitableLocation}
                    fullWidth={true}
                    data-tid="newEntryDialogInputTID"
                  />
                  {inputError && (
                    <FormHelperText>
                      {i18n.t('core:fileNameHelp')}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <ButtonGroup
                  style={{
                    textAlign: 'center',
                    width: '100%'
                  }}
                >
                  <Button
                    // variant="contained"
                    onClick={createMarkdownFile}
                    className={classes.createButton}
                    data-tid="createMarkdownButton"
                    disabled={noSuitableLocation}
                  >
                    <Tooltip title={i18n.t('createMarkdownTitle')}>
                      <Typography
                        variant="button"
                        style={{ fontWeight: 'bold' }}
                        display="block"
                        gutterBottom
                      >
                        {i18n.t('createMarkdown')}
                      </Typography>
                    </Tooltip>
                  </Button>
                  <Button
                    // variant="contained"
                    onClick={createRichTextFile}
                    className={classes.createButton}
                    data-tid="createRichTextFileButton"
                    disabled={noSuitableLocation}
                  >
                    <Tooltip title={i18n.t('createNoteTitle')}>
                      <Typography variant="button" display="block" gutterBottom>
                        {i18n.t('createRichTextFile')}
                      </Typography>
                    </Tooltip>
                  </Button>
                  <Button
                    // variant="contained"
                    onClick={createTextFile}
                    className={classes.createButton}
                    data-tid="createTextFileButton"
                    disabled={noSuitableLocation}
                  >
                    <Tooltip title={i18n.t('createTextFileTitle')}>
                      <Typography variant="button" display="block" gutterBottom>
                        {i18n.t('createTextFile')}
                      </Typography>
                    </Tooltip>
                  </Button>
                </ButtonGroup>
              </Grid>
              <Grid style={{ marginTop: 20 }} item xs={12}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    onClose();
                    toggleLocationDialog();
                  }}
                  className={classes.createButton}
                  data-tid="createLocationButton"
                >
                  <Tooltip title={i18n.t('createLocationTitle')}>
                    <Typography variant="button" display="block" gutterBottom>
                      {i18n.t('core:createLocation')}
                    </Typography>
                  </Tooltip>
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandIcon />}
            aria-controls="panelGeneral-content"
            id="panelGeneral-header"
          >
            <Typography>{i18n.t('core:moreOperations')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                onClick={() => {
                  onClose();
                  toggleCreateDirectoryDialog();
                }}
                className={classes.createButton}
                data-tid="newSubDirectory"
                disabled={noSuitableLocation}
              >
                {i18n.t('core:newSubdirectory')}
              </Button>
            </Grid>
            <Grid style={{ marginTop: 20 }} item xs={12}>
              <Tooltip title={i18n.t('core:addFilesTitle')}>
                <Button
                  variant="outlined"
                  onClick={addFile}
                  className={classes.createButton}
                  data-tid="addFilesButton"
                  disabled={noSuitableLocation}
                >
                  {i18n.t('addFiles')}
                </Button>
              </Tooltip>
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={invalidURL}
                label={i18n.t('core:url')}
                margin="dense"
                name="name"
                fullWidth={true}
                data-tid="newUrlTID"
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    downloadURL();
                  }
                }}
                onChange={handleUrlChange}
              />
            </Grid>
            <Grid item xs={12}>
              <ButtonGroup
                style={{
                  textAlign: 'center',
                  width: '100%'
                }}
              >
                <Button
                  data-tid="cancelRenameEntryTID"
                  className={classes.createButton}
                  onClick={() => downloadURL()}
                >
                  {i18n.t('core:downloadFile')}
                </Button>
              </ButtonGroup>
            </Grid>
            {/* </Grid> */}
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
          </AccordionDetails>
        </Accordion>
        <Grid item style={{ marginTop: 20 }} xs={12}>
          {noSuitableLocation ? (
            <Typography variant="caption">
              {i18n.t('noSuitableLocation')}
            </Typography>
          ) : (
            <Typography
              style={{ display: 'flex', alignItems: 'center' }}
              variant="caption"
            >
              <InfoIcon style={{ paddingRight: 10 }} />
              {i18n.t('core:entriesWillBeCreatedIn') +
                ' ' +
                (currentLocation ? currentLocation.name : '') +
                ' ' +
                targetDirectoryPath}
            </Typography>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

function mapStateToProps(state) {
  return {
    firstRWLocation: getFirstRWLocation(state),
    keyBindings: getKeyBindingObject(state),
    selectedEntries: getSelectedEntries(state),
    currentDirectoryPath: getDirectoryPath(state),
    currentDirectoryPerspective: getCurrentDirectoryPerspective(state),
    currentLocation: getCurrentLocation(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      openLocation: AppActions.openLocation,
      createFileAdvanced: AppActions.createFileAdvanced,
      showNotification: AppActions.showNotification,
      reflectCreateEntries: AppActions.reflectCreateEntries,
      toggleLocationDialog: AppActions.toggleLocationDialog,
      toggleCreateDirectoryDialog: AppActions.toggleCreateDirectoryDialog,
      uploadFilesAPI: IOActions.uploadFilesAPI,
      downloadFile: IOActions.downloadFile,
      onUploadProgress: AppActions.onUploadProgress,
      toggleUploadDialog: AppActions.toggleUploadDialog,
      resetProgress: AppActions.resetProgress,
      setProgress: AppActions.setProgress
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withStyles(styles)(CreateDialog));
