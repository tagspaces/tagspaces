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
import { CloseIcon, WarningIcon } from '-/components/CommonIcons';
import DraggablePaper from '-/components/DraggablePaper';
import InfoIcon from '-/components/InfoIcon';
import TsButton from '-/components/TsButton';
import TsTooltip from '-/components/TsTooltip';
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
import { Grid, LinearProgress } from '@mui/material';
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

  const currentLocation = findLocation();

  useEffect(() => {
    if (AppConfig.isElectron) {
      const handler = (fileName, newProgress) => {
        dispatch(AppActions.onUploadProgress(newProgress, undefined));
      };
      window.electronIO.ipcRenderer.on('progress', handler);
      return () => {
        // Best-effort cleanup: prefer removeListener so we don't kill listeners
        // registered by other components on the same channel.
        const ipc: any = window.electronIO.ipcRenderer;
        if (typeof ipc.removeListener === 'function') {
          ipc.removeListener('progress', handler);
        } else {
          ipc.removeAllListeners('progress');
        }
      };
    }
  }, [dispatch]);

  function LinearProgressWithLabel(prop) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            mr: 1,
          }}
        >
          <LinearProgress variant="determinate" {...prop} />
        </Box>
        <Box
          sx={{
            minWidth: 35,
          }}
        >
          <Typography variant="body2">{`${prop.value}%`}</Typography>
        </Box>
      </Box>
    );
  }

  // Derived view-model — computed once per render, no ref mutation inside .map.
  const progressArr = Array.isArray(progress) ? progress : [];
  // Defensive copy: progress comes from Redux; never sort the original in place.
  const sortedProgress = React.useMemo(
    () => [...progressArr].sort((a, b) => ('' + a.path).localeCompare(b.path)),
    [progressArr],
  );
  const firstProgressPath = progressArr[0]?.path
    ? progressArr[0].path.split('?')[0]
    : undefined;
  const targetPath = props.targetPath ?? firstProgressPath;

  const haveProgress = sortedProgress.some(
    (p) => p.progress > -1 && p.progress < 100 && p.state !== 'finished',
  );

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
    if (targetPath) {
      return targetPath;
    } else if (currentDirectoryPath) {
      return currentDirectoryPath;
    }
    return '/';
  }

  // Title counter: prefer the aggregate batch percentage for single-row
  // batches (the common case after the single-row progress key change), fall
  // back to the file count for multi-row batches (e.g. multi-dir copies).
  const titleCounter = (() => {
    if (!sortedProgress.length) {
      return '';
    }
    if (sortedProgress.length === 1) {
      const p = sortedProgress[0].progress;
      if (p < 0) {
        return '';
      }
      return ' (' + p + '%)';
    }
    const done = sortedProgress.filter((p) => p.progress === 100).length;
    return ' (' + done + '/' + sortedProgress.length + ')';
  })();

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
          ) + titleCounter
        }
        closeButtonTestId="closeFileUploadTID"
        onClose={onClose}
      />
      <DialogContent
        sx={{
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '90%',
          flexGrow: 1,
        }}
      >
        <p>{t('core:moveCopyToPath') + ': ' + getTargetURL()}</p>
        {sortedProgress.map((fileProgress) => {
          const percentage = fileProgress.progress;
          const { path, filePath, abort } = fileProgress;
          const rowName = filePath
            ? filePath
            : extractFileName(
                path.split('?')[0],
                currentLocation?.getDirSeparator(),
              );

          return (
            <Grid
              key={path}
              container
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Grid
                size={{ xs: 10 }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  wordBreak: 'break-word',
                }}
              >
                {rowName}
                {percentage === -1 && (
                  <TsTooltip
                    title={
                      abort && typeof abort === 'string'
                        ? abort
                        : t('core:fileExist')
                    }
                  >
                    <WarningIcon color="warning" />
                  </TsTooltip>
                )}
              </Grid>
              <Grid size={{ xs: 2 }}>
                {abort && typeof abort === 'function' && percentage !== 100 && (
                  <TsButton tooltip={t('core:abort')} onClick={() => abort()}>
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
        {sortedProgress.length > 0 && !haveProgress && (
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
      </TsDialogActions>
    </Dialog>
  );
}

export default FileUploadDialog;
