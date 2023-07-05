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

import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { saveAs } from 'file-saver';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';
import withStyles from '@mui/styles/withStyles';
import { Progress } from 'aws-sdk/clients/s3';
import AppConfig from '-/AppConfig';
import i18n from '-/services/i18n';
import { actions as AppActions, NotificationTypes } from '-/reducers/app';
import IOActions from '-/reducers/io-actions';
import { TS } from '-/tagspaces.namespace';
import PlatformIO from '-/services/platform-facade';
import Tooltip from '-/components/Tooltip';
import TextField from '@mui/material/TextField';

const styles: any = () => ({
  createButton: {
    width: '100%',
    textAlign: 'center'
  }
});

interface Props {
  classes: any;
  onClose: () => void;
  onUploadProgress: (progress: Progress, response: any) => void;
  toggleUploadDialog: () => void;
  resetProgress: () => void;
  setProgress: (path: string, progress: number, abort?: string) => void;
  downloadFile: (
    url: string,
    destination: string,
    onDownloadProgress?: (progress: Progress, response: any) => void
  ) => any;
  uploadFilesAPI: (
    files: Array<File>,
    destination: string,
    onUploadProgress?: (progress: Progress, response: any) => void
  ) => any;
  toggleCreateDirectoryDialog: () => void;
  reflectCreateEntries: (fsEntries: Array<TS.FileSystemEntry>) => void;
  showNotification: (
    message: string,
    notificationType?: string,
    autohide?: boolean
  ) => void;
  targetDirectoryPath: string;
}

function CreateDirectory(props: Props) {
  const {
    classes,
    onClose,
    showNotification,
    toggleCreateDirectoryDialog,
    targetDirectoryPath
  } = props;
  const fileUrl = useRef<string>();
  const [invalidURL, setInvalidURL] = useState<boolean>(false);
  let fileInput: HTMLInputElement;

  const noSuitableLocation = !targetDirectoryPath;

  /*function loadLocation() {
    if (!currentDirectoryPath && firstRWLocation) {
      openLocation(firstRWLocation);
    }
  }*/

  function addFile() {
    // loadLocation();
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

  return (
    <>
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
    </>
  );
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      showNotification: AppActions.showNotification,
      reflectCreateEntries: AppActions.reflectCreateEntries,
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
  undefined,
  mapActionCreatorsToProps
)(withStyles(styles)(CreateDirectory));
