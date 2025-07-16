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

import AppConfig from '-/AppConfig';
import DraggablePaper from '-/components/DraggablePaper';
import InfoIcon from '-/components/InfoIcon';
import TsButton from '-/components/TsButton';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useFileUploadContext } from '-/hooks/useFileUploadContext';
import {
  actions as AppActions,
  AppDispatch,
  getProgress,
} from '-/reducers/app';
import { uploadAbort } from '-/services/utils-io';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import { Grid, LinearProgress, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  cleanFrontDirSeparator,
  extractFileName,
} from '@tagspaces/tagspaces-common/paths';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  open: boolean;
  title: string;
  targetPath?: string;
  //transferMeta?: boolean;
  onClose: () => void;
}

function FileUploadDialog(props: Props) {
  const { open = false, title, onClose } = props;
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { currentDirectoryPath } = useDirectoryContentContext();
  const { findLocation } = useCurrentLocationContext();
  const { uploadMeta, transferMeta } = useFileUploadContext();
  const progress = useSelector(getProgress);

  const targetPath = React.useRef<string>(getTargetPath()); // todo ContextProvider
  const currentLocation = findLocation();

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('progress', (fileName, newProgress) => {
        dispatch(AppActions.onUploadProgress(newProgress, undefined));
      });

      return () => {
        window.electronIO.ipcRenderer.removeAllListeners('progress');
      };
    }
  }, []);

  function LinearProgressWithLabel(prop) {
    return (
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          <LinearProgress variant="determinate" {...prop} />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">
            {`${prop.value}%`}
          </Typography>
        </Box>
      </Box>
    );
  }

  const stopAll = () => {
    if (progress) {
      if (currentLocation?.haveObjectStoreSupport()) {
        const progresses = progress.map((fileProgress) => {
          fileProgress.abort();
          return { ...fileProgress, state: 'finished' };
        });
        dispatch(AppActions.setProgresses(progresses));
      } else {
        return uploadAbort();
      }
    }
  };

  let haveProgress = false;

  function getTargetPath() {
    if (props.targetPath) {
      return props.targetPath;
    }
    const pathProgress = progress.find((fileProgress) => fileProgress.path);
    if (pathProgress) {
      return pathProgress.path;
    }
    return undefined;
  }

  function getTargetURL() {
    if (props.targetPath) {
      return props.targetPath;
    }
    if (currentLocation) {
      if (currentLocation.endpointURL) {
        return (
          (currentLocation.endpointURL.endsWith('/')
            ? currentLocation.endpointURL
            : currentLocation.endpointURL + '/') +
          (currentLocation.path
            ? cleanFrontDirSeparator(currentLocation.path)
            : '') +
          (currentDirectoryPath
            ? cleanFrontDirSeparator(currentDirectoryPath)
            : '')
        );
      } else if (currentLocation.region && currentLocation.bucketName) {
        return (
          'https://s3.' +
          currentLocation.region +
          '.amazonaws.com' +
          (currentLocation.bucketName ? '/' + currentLocation.bucketName : '') +
          (currentLocation.path
            ? '/' + cleanFrontDirSeparator(currentLocation.path)
            : '') +
          (currentDirectoryPath
            ? '/' + cleanFrontDirSeparator(currentDirectoryPath)
            : '')
        );
      }
    }
    if (targetPath.current) {
      return targetPath.current;
    } else if (currentDirectoryPath) {
      return currentDirectoryPath;
    }
    return '/';
  }
  const completed = progress?.filter((item) => item.progress === 100);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      fullWidth={true}
      fullScreen={smallScreen}
      maxWidth="sm"
      aria-labelledby="draggable-dialog-title"
      PaperComponent={DraggablePaper}
      slotProps={{ backdrop: { style: { backgroundColor: 'transparent' } } }}
    >
      <TsDialogTitle
        dialogTitle={
          t(
            'core:' + (title && title.length > 0 ? title : 'importDialogTitle'),
          ) +
          (progress
            ? ' (' + completed.length + '/' + progress.length + ')'
            : '')
        }
        closeButtonTestId="closeFileUploadTID"
        onClose={onClose}
      />
      <DialogContent
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '90%',
          flexGrow: 1,
        }}
      >
        <p>{t('core:moveCopyToPath') + ': ' + getTargetURL()}</p>
        {progress &&
          progress
            .sort((a, b) => ('' + a.path).localeCompare(b.path))
            .map((fileProgress) => {
              const percentage = fileProgress.progress;
              const { path, filePath } = fileProgress;
              targetPath.current = path.split('?')[0];
              let { abort } = fileProgress;
              if (
                percentage > -1 &&
                percentage < 100 &&
                fileProgress.state !== 'finished'
              ) {
                haveProgress = true;
              } /*else {
                abort = undefined;
              }*/

              return (
                <Grid
                  key={path}
                  container
                  justifyContent="center"
                  alignItems="center"
                >
                  <Grid
                    size={{ xs: 10 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      wordBreak: 'break-word',
                    }}
                  >
                    {filePath
                      ? filePath
                      : extractFileName(
                          targetPath.current,
                          currentLocation?.getDirSeparator(),
                        )}
                    {percentage === -1 && (
                      <Tooltip
                        title={
                          abort && typeof abort === 'string'
                            ? abort
                            : t('core:fileExist')
                        }
                      >
                        <WarningIcon color="secondary" />
                      </Tooltip>
                    )}
                  </Grid>
                  <Grid size={{ xs: 2 }}>
                    {abort &&
                      typeof abort === 'function' &&
                      percentage !== 100 && (
                        <TsButton
                          tooltip={t('core:abort')}
                          onClick={() => abort()}
                        >
                          <CloseIcon />
                        </TsButton>
                      )}
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    {percentage > -1 && (
                      <LinearProgressWithLabel value={percentage} />
                    )}
                  </Grid>
                </Grid>
              );
            })}
      </DialogContent>
      <TsDialogActions>
        {progress && progress.length > 0 && !haveProgress && (
          <>
            {transferMeta && AppConfig.isElectron && (
              <TsButton
                data-tid="uploadMetaTID"
                onClick={() => {
                  uploadMeta();
                }}
              >
                {t('core:transferMeta')}
                <InfoIcon tooltip={t('core:transferMetaInfo')} />
              </TsButton>
            )}

            <TsButton
              data-tid="uploadCloseAndClearTID"
              onClick={() => {
                onClose();
                dispatch(AppActions.resetProgress());
              }}
            >
              {t('core:closeAndClear')}
            </TsButton>
          </>
        )}
        <TsButton data-tid="uploadMinimizeDialogTID" onClick={onClose}>
          {t('core:minimize')}
        </TsButton>
        {haveProgress && (
          <TsButton data-tid="uploadStopAllTID" onClick={stopAll}>
            {t('core:stopAll')}
          </TsButton>
        )}
      </TsDialogActions>
    </Dialog>
  );
}

export default FileUploadDialog;
