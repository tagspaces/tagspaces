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
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import CloseIcon from '@material-ui/icons/Close';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { LinearProgress, Grid, Tooltip } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import PlatformIO from '-/services/platform-io';
import { actions as AppActions, getProgress } from '-/reducers/app';
import { extractFileName } from '-/utils/paths';
import i18n from '-/services/i18n';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

interface Props {
  open: boolean;
  progress?: Array<any>;
  onClose: () => void;
  clearUploadDialog: () => void;
}

const FileUploadDialog = (props: Props) => {
  const { open = false, onClose } = props;

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
        if (abort !== undefined) {
          abort();
        }
        return true;
      });
    }
  };

  let haveProgress = false;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      fullWidth={true}
      maxWidth="sm"
      BackdropProps={{ style: { backgroundColor: 'transparent' } }}
    >
      <DialogTitle data-tid="importDialogTitle">
        {i18n.t('core:importDialogTitle')}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '90%',
          flexGrow: 1
        }}
      >
        {props.progress &&
          props.progress
            .sort((a, b) => ('' + a.path).localeCompare(b.path))
            .map(fileProgress => {
              const percentage = fileProgress.progress;
              const { path } = fileProgress;
              const fileName = extractFileName(
                path,
                PlatformIO.getDirSeparator()
              );
              let { abort } = fileProgress;
              if (percentage > -1 && percentage < 100) {
                haveProgress = true;
              } else {
                abort = undefined;
              }

              return (
                <Grid key={path} container justify="center" alignItems="center">
                  <Grid
                    item
                    xs={10}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    {fileName}
                    {percentage === -1 && (
                      <Tooltip title={i18n.t('core:fileExist')}>
                        <WarningIcon color="secondary" />
                      </Tooltip>
                    )}
                  </Grid>
                  <Grid item xs={2}>
                    {abort && (
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
            data-tid="uploadCloseDialog"
            onClick={props.clearUploadDialog}
            color="primary"
          >
            {i18n.t('core:closeAndClear')}
          </Button>
        )}
        <Button
          data-tid="uploadCloseDialog"
          onClick={props.onClose}
          color="primary"
        >
          {i18n.t('core:minimize')}
        </Button>
        {haveProgress && (
          <Button
            data-tid="uploadCloseDialog"
            onClick={stopAll}
            color="primary"
          >
            {i18n.t('core:stopAll')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

function mapStateToProps(state) {
  return {
    progress: getProgress(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      clearUploadDialog: AppActions.clearUploadDialog
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(FileUploadDialog);
