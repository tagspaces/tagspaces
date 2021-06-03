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
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import i18n from '-/services/i18n';
import useValidation from '-/utils/useValidation';

interface Props {
  open: boolean;
  fullScreen?: boolean;
  classes?: any;
  onClose: () => void;
  uuid: string;
}

const TileServerDialog = (props: Props) => {
  const { setError, haveError } = useValidation();
  const renderTitle = () => (
    <DialogTitle>
      {i18n.t('core:tileServerDialog')}{' '}
      <IconButton
        aria-label="close"
        style={{
          position: 'absolute',
          right: 5,
          top: 5
        }}
        onClick={props.onClose}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );

  const renderContent = () => (
    <DialogContent className={props.classes.mainContent}>
      <FormControl fullWidth={true} error={haveError('url')}>
        <TextField
          fullWidth
          error={haveError('url')}
          margin="dense"
          autoFocus
          name="name"
          label={i18n.t('core:createNewDirectoryTitleName')}
          onChange={event => {
            const { target } = event;
            // setName(target.value);
          }}
          data-tid="directoryName"
          id="directoryName"
        />
        <FormHelperText>{i18n.t('core:directoryNameHelp')}</FormHelperText>
      </FormControl>
    </DialogContent>
  );

  const renderActions = () => (
    <DialogActions
      style={{
        justifyContent: 'flex-end'
      }}
    >
      {props.uuid && (
        <Button
          data-tid="deleteTileServerTID"
          /* onClick={() => onDelete(props.uuid)} */
          color="secondary"
        >
          {i18n.t('core:deleteTileServer')}
        </Button>
      )}

      <Button
        data-tid="closeSettingsDialog"
        onClick={props.onClose}
        color="primary"
      >
        {i18n.t('core:closeButton')}
      </Button>
    </DialogActions>
  );

  const { fullScreen, open, onClose } = props;
  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      keepMounted
      scroll="paper"
      onClose={onClose}
    >
      {renderTitle()}
      {renderContent()}
      {renderActions()}
    </Dialog>
  );
};

export default TileServerDialog;
