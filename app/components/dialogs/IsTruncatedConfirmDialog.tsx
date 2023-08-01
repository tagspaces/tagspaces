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

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import DraggablePaper from '-/components/DraggablePaper';
import Dialog from '@mui/material/Dialog';
import i18n from '-/services/i18n';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import MaxLoopsSelect from '-/components/dialogs/MaxLoopsSelect';
import AppConfig from '-/AppConfig';
import { TS } from '-/tagspaces.namespace';
import { useDispatch, useSelector } from 'react-redux';
import {
  actions as LocationActions,
  getCurrentLocation
} from '-/reducers/locations';
import { AppDispatch } from '-/reducers/app';

interface Props {
  open: boolean;
  onClose: () => void;
}

function IsTruncatedConfirmDialog(props: Props) {
  const { open, onClose } = props;
  const dispatch: AppDispatch = useDispatch();
  const location: TS.Location = useSelector(getCurrentLocation);

  let defaultMaxLoops = AppConfig.maxLoops;
  if (location && location.maxLoops && location.maxLoops > 0) {
    const maxLoopsAsString = location.maxLoops + '';
    defaultMaxLoops = parseInt(maxLoopsAsString, 10);
  }
  const [maxLoops, setMaxLoops] = useState<number>(defaultMaxLoops);

  function changeMaxLoops(event: React.ChangeEvent<HTMLInputElement>) {
    const loops = event.target.value;
    if (loops) {
      setMaxLoops(parseInt(loops, 10));
      dispatch(LocationActions.editLocation({ ...location, maxLoops }));
      onClose();
    }
  }

  return (
    <Dialog
      aria-labelledby="draggable-dialog-title"
      PaperComponent={DraggablePaper}
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
    >
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {i18n.t('core:isTruncatedDialogTitle')}
        <DialogCloseButton testId="closeIsTruncatedTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText component="span">
          <MaxLoopsSelect maxLoops={maxLoops} changeMaxLoops={changeMaxLoops} />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} color="primary">
          {i18n.t('core:continue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default IsTruncatedConfirmDialog;
