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
import { styled } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { saveAs } from 'file-saver';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';
import AppConfig from '-/AppConfig';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import Tooltip from '-/components/Tooltip';
import TextField from '@mui/material/TextField';
import { useTargetPathContext } from '-/components/dialogs/hooks/useTargetPathContext';
import Typography from '@mui/material/Typography';
import FileUploadContainer, {
  FileUploadContainerRef,
} from '-/components/FileUploadContainer';
import { useTranslation } from 'react-i18next';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { Pro } from '-/pro';
import { ProLabel } from '-/components/HelperComponents';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useCreateEditLocationDialogContext } from '-/components/dialogs/hooks/useCreateEditLocationDialogContext';
import { useCreateDirectoryDialogContext } from '-/components/dialogs/hooks/useCreateDirectoryDialogContext';
import { useNewAudioDialogContext } from '-/components/dialogs/hooks/useNewAudioDialogContext';

const PREFIX = 'CreateDirectory';

const classes = {
  createButton: `${PREFIX}-createButton`,
};

const Root = styled('div')(() => ({
  [`& .${classes.createButton}`]: {
    width: '100%',
    textAlign: 'center',
  },
}));

interface Props {
  onClose: () => void;
  tidPrefix?: string;
}

function CreateDirectory(props: Props) {
  const { onClose, tidPrefix } = props;
  const { t } = useTranslation();
  const { currentLocation } = useCurrentLocationContext();
  const { downloadFile } = useIOActionsContext();
  const { showNotification } = useNotificationContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const { openCreateEditLocationDialog } = useCreateEditLocationDialogContext();
  const { openCreateDirectoryDialog } = useCreateDirectoryDialogContext();
  const { openNewAudioDialog } = useNewAudioDialogContext();
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
        if (currentLocation?.haveObjectStoreSupport() || AppConfig.isElectron) {
          dispatch(AppActions.resetProgress());
          openFileUploadDialog();
          downloadFile(
            fileUrl.current,
            targetDirectoryPath + '/' + decodeURIComponent(fileName),
            onUploadProgress,
          )
            .then(() => {
              if (currentLocation.haveObjectStoreSupport()) {
                // currently objectStore location in downloadFile use saveFilePromise and this function not have progress handling
                dispatch(AppActions.setProgress(fileUrl.current, 100));
              }
            })
            .catch((e) => {
              console.log('downloadFile error:', e);
              dispatch(
                AppActions.setProgress(
                  fileUrl.current,
                  -1,
                  t('core:errorCORS'),
                ),
              );
              showNotification('downloadFile error' + e.message, 'error', true);
            });
        } else {
          saveAs(fileUrl.current, decodeURIComponent(fileName));
        }
        onClose();
      } catch (ex) {
        setInvalidURL(true);
        console.log('downloadURL', ex);
      }
    }
  }

  function tid(tid) {
    if (tidPrefix) {
      return tidPrefix + tid;
    }
    return tid;
  }

  return (
    <Root>
      <Grid item xs={12}>
        <Button
          variant="outlined"
          onClick={() => {
            onClose();
            openCreateEditLocationDialog();
          }}
          className={classes.createButton}
          data-tid={tid('createLocationButton')}
        >
          <Tooltip title={t('createLocationTitle')}>
            <Typography variant="button" display="block" gutterBottom>
              {t('core:createLocation')}
            </Typography>
          </Tooltip>
        </Button>
      </Grid>
      <Grid style={{ marginTop: 20 }} item xs={12}>
        <Button
          variant="outlined"
          onClick={() => {
            onClose();
            openCreateDirectoryDialog();
          }}
          className={classes.createButton}
          data-tid={tid('newSubDirTID')}
          disabled={noSuitableLocation}
        >
          {t('core:newSubdirectory')}
        </Button>
      </Grid>
      <Grid style={{ marginTop: 20 }} item xs={12}>
        <Button
          variant="outlined"
          disabled={!Pro || noSuitableLocation}
          onClick={() => {
            onClose();
            openNewAudioDialog();
          }}
          className={classes.createButton}
          data-tid={tid('newSubDirTID')}
        >
          {t('core:newAudioRecording')}
          {!Pro && <ProLabel />}
        </Button>
      </Grid>
      <Grid style={{ marginTop: 20 }} item xs={12}>
        <Tooltip title={t('core:addFilesTitle')}>
          <Button
            variant="outlined"
            onClick={addFile}
            className={classes.createButton}
            data-tid={tid('addFilesButton')}
            disabled={noSuitableLocation}
          >
            {t('addFiles')}
          </Button>
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
        <TextField
          error={invalidURL}
          label={t('core:url')}
          margin="dense"
          name="name"
          fullWidth={true}
          data-tid={tid('newUrlTID')}
          onKeyDown={(event) => {
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
            width: '100%',
          }}
        >
          <Button
            data-tid={tid('downloadFileUrlTID')}
            className={classes.createButton}
            onClick={() => downloadURL()}
          >
            {t('core:downloadFile')}
          </Button>
        </ButtonGroup>
      </Grid>
      <FileUploadContainer
        id="createDirId"
        ref={fileUploadContainerRef}
        directoryPath={targetDirectoryPath}
      />
    </Root>
  );
}

export default CreateDirectory;
