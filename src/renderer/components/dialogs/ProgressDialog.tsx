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
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { CircularProgress } from '@mui/material';
import DraggablePaper from '-/components/DraggablePaper';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

interface Props {
  open: boolean;
  onClose: () => void;
}

function ProgressDialog(props: Props) {
  return (
    <Dialog
      aria-labelledby="draggable-dialog-title"
      PaperComponent={DraggablePaper}
      open={props.open}
      onClose={props.onClose}
    >
      <DialogTitle
        style={{ cursor: 'move' }}
        data-tid="progressDialogTitle"
        id="draggable-dialog-title"
      >
        <DialogCloseButton testId="closeProgressTID" onClose={props.onClose} />
      </DialogTitle>
      <DialogContent
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          flexGrow: 1,
        }}
      >
        <CircularProgress size={24} />
      </DialogContent>
    </Dialog>
  );
}

export default ProgressDialog;
