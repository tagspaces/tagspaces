/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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
import { saveAs } from 'file-saver';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Paper from '@mui/material/Paper';
import DraggablePaper from '-/components/DraggablePaper';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import TargetPath from '-/components/dialogs/components/TargetPath';
import { TargetPathContextProvider } from '-/components/dialogs/hooks/TargetPathContextProvider';
import { useTranslation } from 'react-i18next';
import TsButton from '-/components/TsButton';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import AppConfig from '-/AppConfig';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import TsTextField from '-/components/TsTextField';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useDispatch } from 'react-redux';
import { useTargetPathContext } from '-/components/dialogs/hooks/useTargetPathContext';
import { TS } from '-/tagspaces.namespace';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';

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
  open: boolean;
  onClose: (event?: Object, reason?: string) => void;
}

function DownloadUrlDialog(props: Props) {
  const { open, onClose } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { currentLocation, getFirstRWLocation } = useCurrentLocationContext();
  const { setReflectActions } = useEditedEntryContext();
  const { downloadUrl } = useIOActionsContext();
  const { showNotification } = useNotificationContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const dispatch: AppDispatch = useDispatch();

  const { targetDirectoryPath } = useTargetPathContext();
  const fileUrl = useRef<string>();
  const [invalidURL, setInvalidURL] = useState<boolean>(false);

  const onUploadProgress = (progress, abort, fileName) => {
    dispatch(AppActions.onUploadProgress(progress, abort, fileName));
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    fileUrl.current = event.target.value;
  };

  function downloadURL() {
    if (fileUrl.current) {
      const location = currentLocation ? currentLocation : getFirstRWLocation();
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
        if (!location.haveObjectStoreSupport() && AppConfig.isElectron) {
          dispatch(AppActions.resetProgress());
          openFileUploadDialog();
          downloadUrl(
            fileUrl.current,
            targetDirectoryPath + '/' + decodeURIComponent(fileName),
            onUploadProgress,
          )
            .then((entry) => {
              /*if (location?.haveObjectStoreSupport()) {
                // currently objectStore location in downloadFile use saveFilePromise and this function not have progress handling
                dispatch(AppActions.setProgress(fileUrl.current, 100));
              }*/
              const reflectAction: TS.EditAction = {
                action: 'add',
                entry: entry,
                open: true,
                source: 'upload',
              };
              setReflectActions(reflectAction);
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

  return (
    <Root>
      <TargetPathContextProvider>
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
            {t('core:downloadLink')}
            <DialogCloseButton
              testId="closeCreateDialogTID"
              onClose={() => onClose()}
            />
          </DialogTitle>
          <DialogContent
            style={{
              minWidth: 200,
              //minHeight: 300,
              marginBottom: 20,
              overflow: 'overlay',
            }}
            data-tid="downloadUrlDialogTID"
          >
            <TsTextField
              error={invalidURL}
              label={t('core:url')}
              autoFocus
              name="name"
              data-tid="newUrlTID"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  downloadURL();
                }
              }}
              onChange={handleUrlChange}
            />
            <TargetPath />
          </DialogContent>
          <TsDialogActions>
            <TsButton onClick={onClose}>{t('core:cancel')}</TsButton>
            <TsButton
              variant="contained"
              data-tid={'downloadFileUrlTID'}
              className={classes.createButton}
              onClick={() => downloadURL()}
            >
              {t('core:ok')}
            </TsButton>
          </TsDialogActions>
        </Dialog>
      </TargetPathContextProvider>
    </Root>
  );
}

export default DownloadUrlDialog;
