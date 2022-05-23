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
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { CircularProgress } from '@material-ui/core';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ProgressDialog = (props: Props) => (
  <Dialog open={props.open} onClose={props.onClose}>
    <DialogTitle data-tid="progressDialogTitle">
      <DialogCloseButton onClose={props.onClose} />
    </DialogTitle>
    <DialogContent
      style={{
        marginLeft: 'auto',
        marginRight: 'auto',
        flexGrow: 1
      }}
    >
      <CircularProgress size={24} />
    </DialogContent>
  </Dialog>
);

export default ProgressDialog;
