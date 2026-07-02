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
  extractContainingDirectoryPath,
  extractFileName,
} from '@tagspaces/tagspaces-common/paths';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  open: boolean;
  title: string;
  targetPath?: string;
  onClose: () => void;
}

// Module-level on purpose: defined inside the dialog component it would be a
// new component type on every render, making React unmount/remount every
// progress row on each progress tick (and killing the bar's CSS transition).
function LinearProgressWithLabel({ value }: { value: number }) {
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
        <LinearProgress variant="determinate" value={value} />
      </Box>
      <Box
        sx={{
          minWidth: 35,
        }}
      >
        <Typography variant="body2">{`${value}%`}</Typography>
      </Box>
    </Box>
  );
}

function FileUploadDialog(props: Props) {
  const { open = false, title, targetPath, onClose } = props;
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
        dispatch(AppActions.onUploadProgress(newProgress, undefined, fileName));
      };
      // The preload `on()` wraps the handler internally and returns the
      // matching unsubscribe — removeListener(handler) would miss the wrapper
      // and leak the listener; removeAllListeners would kill other listeners
      // on the same channel.
      const unsubscribe = window.electronIO.ipcRenderer.on('progress', handler);
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [dispatch]);

  // Derived view-model. Defensive copy: progress comes from Redux; never sort
  // the original in place.
  const sortedProgress = useMemo(
    () =>
      Array.isArray(progress)
        ? [...progress].sort((a, b) => String(a.path).localeCompare(b.path))
        : [],
    [progress],
  );
  // Progress rows hold per-file paths — when no explicit targetPath prop was
  // provided, show the destination *folder* in the header, not the first
  // file's own path (which duplicated the file name above the rows).
  const firstProgressPath = sortedProgress[0]?.path
    ? String(sortedProgress[0].path).split('?')[0]
    : undefined;
  const fallbackTargetDir = firstProgressPath
    ? extractContainingDirectoryPath(
        firstProgressPath,
        currentLocation?.getDirSeparator(),
      )
    : undefined;

  const haveProgress = sortedProgress.some(
    (p) => p.progress > -1 && p.progress < 100 && p.state !== 'finished',
  );

  function getTargetURL() {
    if (targetPath) {
      return targetPath;
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
    if (fallbackTargetDir) {
      return fallbackTargetDir;
    }
    if (currentDirectoryPath) {
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
      fullWidth
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
          // filePath (when set) may be a bare name or a full path depending on
          // the producer — extractFileName handles both; a bare name passes
          // through unchanged.
          const rowName = extractFileName(
            String(filePath || path || '').split('?')[0],
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
