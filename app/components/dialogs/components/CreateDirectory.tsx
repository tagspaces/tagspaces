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
import { useDispatch } from 'react-redux';
import { saveAs } from 'file-saver';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';
import withStyles from '@mui/styles/withStyles';
import AppConfig from '-/AppConfig';
import i18n from '-/services/i18n';
import {
  actions as AppActions,
  AppDispatch,
  NotificationTypes
} from '-/reducers/app';
import IOActions from '-/reducers/io-actions';
import { TS } from '-/tagspaces.namespace';
import PlatformIO from '-/services/platform-facade';
import Tooltip from '-/components/Tooltip';
import TextField from '@mui/material/TextField';
import { useTargetPathContext } from '-/components/dialogs/hooks/useTargetPathContext';
import Typography from '@mui/material/Typography';
import FileUploadContainer, {
  FileUploadContainerRef
} from '-/components/FileUploadContainer';

const styles: any = () => ({
  createButton: {
    width: '100%',
    textAlign: 'center'
  }
});

interface Props {
  classes: any;
  onClose: () => void;
}

function CreateDirectory(props: Props) {
  const { classes, onClose } = props;
  const fileUploadContainerRef = useRef<FileUploadContainerRef>(null);
  const dispatch: AppDispatch = useDispatch();

  const { targetDirectoryPath } = useTargetPathContext();
  const fileUrl = useRef<string>();
  const [invalidURL, setInvalidURL] = useState<boolean>(false);

  const noSuitableLocation = !targetDirectoryPath;

  /*function loadLocation() {
    if (!currentDirectoryPath && firstRWLocation) {
      openLocation(firstRWLocation);
    }
  }*/

  function addFile() {
    // loadLocation();
    fileUploadContainerRef.current.onFileUpload();
    onClose();
  }

  const onUploadProgress = (progress, abort, fileName) => {
    dispatch(AppActions.onUploadProgress(progress, abort, fileName));
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
          dispatch(AppActions.resetProgress());
          dispatch(AppActions.toggleUploadDialog());
          dispatch(
            IOActions.downloadFile(
              fileUrl.current,
              targetDirectoryPath +
                PlatformIO.getDirSeparator() +
                decodeURIComponent(fileName),
              onUploadProgress
            )
          )
            .then(() => {
              if (PlatformIO.haveObjectStoreSupport()) {
                // currently objectStore location in downloadFile use saveFilePromise and this function not have progress handling
                dispatch(AppActions.setProgress(fileUrl.current, 100));
              }
            })
            .catch(e => {
              console.log('downloadFile error:', e);
              dispatch(
                AppActions.setProgress(
                  fileUrl.current,
                  -1,
                  i18n.t('core:errorCORS')
                )
              );
              dispatch(
                AppActions.showNotification(
                  'downloadFile error' + e.message,
                  NotificationTypes.error,
                  true
                )
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
            dispatch(AppActions.toggleLocationDialog());
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
      <Grid style={{ marginTop: 20 }} item xs={12}>
        <Button
          variant="outlined"
          onClick={() => {
            onClose();
            dispatch(AppActions.toggleCreateDirectoryDialog());
          }}
          className={classes.createButton}
          data-tid="newSubDirTID"
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
      <FileUploadContainer
        id="createDirId"
        ref={fileUploadContainerRef}
        directoryPath={targetDirectoryPath}
      />
    </>
  );
}

export default withStyles(styles)(CreateDirectory);
