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

import React from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import CloseIcon from '@mui/icons-material/Close';
import { connect } from 'react-redux';
import { cleanFrontDirSeparator } from '@tagspaces/tagspaces-common/paths';
import { bindActionCreators } from 'redux';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { LinearProgress, Grid, Tooltip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import PlatformIO from '-/services/platform-facade';
import DraggablePaper from '-/components/DraggablePaper';
import {
  actions as AppActions,
  getCurrentDirectoryPerspective,
  getDirectoryPath,
  getProgress
} from '-/reducers/app';
import { extractFileName } from '@tagspaces/tagspaces-common/paths';
import i18n from '-/services/i18n';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { PerspectiveIDs } from '-/perspectives/types';
import { getCurrentLocation } from '-/reducers/locations';
import { TS } from '-/tagspaces.namespace';

interface Props {
  open: boolean;
  progress?: Array<any>;
  title: string;
  onClose: () => void;
  clearUploadDialog: () => void;
  currentDirectoryPerspective: string;
  currentDirectoryPath: string;
  currentLocation: TS.Location;
  loadDirectoryContent: (
    path: string,
    generateThumbnails: boolean,
    loadDirMeta?: boolean
  ) => void;
}

function FileUploadDialog(props: Props) {
  const { open = false, onClose } = props;
  const targetPath = React.useRef<string>(getTargetPath());

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
    if (props.progress) {
      props.progress.map(fileProgress => {
        const { abort } = fileProgress;
        if (abort !== undefined && typeof abort === 'function') {
          abort();
        }
        return true;
      });
    }
  };

  let haveProgress = false;

  function getTargetPath() {
    const pathProgress = props.progress.find(fileProgress => fileProgress.path);
    if (pathProgress) {
      return pathProgress.path;
    }
    return undefined;
  }

  function getTargetURL() {
    if (props.currentLocation) {
      if (props.currentLocation.endpointURL) {
        return (
          (props.currentLocation.endpointURL.endsWith('/')
            ? props.currentLocation.endpointURL
            : props.currentLocation.endpointURL + '/') +
          (props.currentLocation.path
            ? cleanFrontDirSeparator(props.currentLocation.path)
            : '') +
          (props.currentDirectoryPath
            ? cleanFrontDirSeparator(props.currentDirectoryPath)
            : '')
        );
      } else if (
        props.currentLocation.region &&
        props.currentLocation.bucketName
      ) {
        return (
          'https://s3.' +
          props.currentLocation.region +
          '.amazonaws.com' +
          (props.currentLocation.bucketName
            ? '/' + props.currentLocation.bucketName
            : '') +
          (props.currentLocation.path
            ? '/' + cleanFrontDirSeparator(props.currentLocation.path)
            : '') +
          (props.currentDirectoryPath
            ? '/' + cleanFrontDirSeparator(props.currentDirectoryPath)
            : '')
        );
      }
    }
    if (targetPath.current) {
      return targetPath.current;
    } else if (props.currentDirectoryPath) {
      return props.currentDirectoryPath;
    }
    return '/';
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      fullWidth={true}
      maxWidth="sm"
      aria-labelledby="draggable-dialog-title"
      PaperComponent={DraggablePaper}
      BackdropProps={{ style: { backgroundColor: 'transparent' } }}
    >
      <DialogTitle
        data-tid="importDialogTitle"
        style={{ cursor: 'move' }}
        id="draggable-dialog-title"
      >
        {i18n.t(
          'core:' +
            (props.title && props.title.length > 0
              ? props.title
              : 'importDialogTitle')
        )}
        <DialogCloseButton testId="closeFileUploadTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '90%',
          flexGrow: 1
        }}
      >
        <p>{i18n.t('core:moveCopyToPath') + ': ' + getTargetURL()}</p>
        {props.progress &&
          props.progress
            .sort((a, b) => ('' + a.path).localeCompare(b.path))
            .map(fileProgress => {
              const percentage = fileProgress.progress;
              const { path, filePath } = fileProgress;
              targetPath.current = path.split('?')[0];
              let { abort } = fileProgress;
              if (percentage > -1 && percentage < 100) {
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
                    item
                    xs={10}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      wordBreak: 'break-word'
                    }}
                  >
                    {filePath
                      ? filePath
                      : extractFileName(
                          targetPath.current,
                          PlatformIO.getDirSeparator()
                        )}
                    {percentage === -1 && (
                      <Tooltip
                        title={
                          abort && typeof abort === 'string'
                            ? abort
                            : i18n.t('core:fileExist')
                        }
                      >
                        <WarningIcon color="secondary" />
                      </Tooltip>
                    )}
                  </Grid>
                  <Grid item xs={2}>
                    {abort && typeof abort === 'function' && (
                      <Button onClick={() => abort()}>
                        <CloseIcon />
                      </Button>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    {percentage > -1 && (
                      <LinearProgressWithLabel value={percentage} />
                    )}
                  </Grid>
                </Grid>
              );
            })}
      </DialogContent>
      <DialogActions>
        {!haveProgress && (
          <Button
            data-tid="uploadCloseAndClearTID"
            onClick={() => {
              onClose();
              props.clearUploadDialog();
              if (props.currentDirectoryPerspective === PerspectiveIDs.GRID) {
                props.loadDirectoryContent(props.currentDirectoryPath, false);
              }
            }}
            color="primary"
          >
            {i18n.t('core:closeAndClear')}
          </Button>
        )}
        <Button
          data-tid="uploadMinimizeDialogTID"
          onClick={props.onClose}
          color="primary"
        >
          {i18n.t('core:minimize')}
        </Button>
        {haveProgress && (
          <Button data-tid="uploadStopAllTID" onClick={stopAll} color="primary">
            {i18n.t('core:stopAll')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function mapStateToProps(state) {
  return {
    progress: getProgress(state),
    currentDirectoryPerspective: getCurrentDirectoryPerspective(state),
    currentDirectoryPath: getDirectoryPath(state),
    currentLocation: getCurrentLocation(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      clearUploadDialog: AppActions.clearUploadDialog,
      loadDirectoryContent: AppActions.loadDirectoryContent
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(FileUploadDialog);
