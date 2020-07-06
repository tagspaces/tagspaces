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
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { getProgress } from '-/reducers/app';
import i18n from '-/services/i18n';

interface Props {
  open: boolean;
  progress?: Array<Object>;
  onClose: () => void;
}

const FileUploadDialog = (props: Props) => {
  // const [color, setColor] = useState(undefined);
  // const [colorHex, setColorHex] = useState(undefined);
  const { open = false, onClose } = props;

  function onConfirm() {
    props.onClose();
  }

  function CircularProgressWithLabel(prop) {
    return (
      <Box position="relative" display="inline-flex">
        <CircularProgress variant="static" {...prop} />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="caption" component="div" color="textSecondary">
            {`${prop.value}%`}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      onKeyDown={event => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          onConfirm();
        } else if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      <DialogTitle data-tid="uploadDialogTitle">
        {i18n.t('core:uploadDialogTitle')}
      </DialogTitle>
      <DialogContent
        style={{
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        {props.progress &&
          props.progress.map(fileProgress =>
            Object.entries(fileProgress).map(([path, percentage]) => (
              <p>
                <span>{path}</span>
                <CircularProgressWithLabel value={percentage} />
              </p>
            ))
          )}
      </DialogContent>
      <DialogActions>
        <Button
          data-tid="uploadCloseDialog"
          onClick={props.onClose}
          color="primary"
        >
          {i18n.t('core:cancel')}
        </Button>
        <Button onClick={onConfirm} data-tid="uploadConfirm" color="primary">
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function mapStateToProps(state) {
  return {
    progress: getProgress(state)
  };
}

export default connect(mapStateToProps)(FileUploadDialog);
