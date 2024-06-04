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
import DialogContentText from '@mui/material/DialogContentText';
import DraggablePaper from '-/components/DraggablePaper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import BulletIcon from '@mui/icons-material/Remove';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  title: string;
  content: string;
  cancelDialogTID?: string;
  confirmDialogTID?: string;
  confirmDialogContentTID?: string;
  list: Array<string>;
  confirmCallback: (result: boolean) => void;
  onClose: () => void;
}

function ConfirmDialog(props: Props) {
  const { open, onClose, confirmCallback } = props;
  const { t } = useTranslation();

  function onConfirm(result) {
    confirmCallback(result);
    onClose();
  }

  return (
    <Dialog
      aria-labelledby="draggable-dialog-title"
      PaperComponent={DraggablePaper}
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      style={{ zIndex: 1301 }}
    >
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {props.title}
        <DialogCloseButton testId="closeConfirmTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          data-tid={props.confirmDialogContentTID}
          component="span"
        >
          {props.content}
          {props.list && (
            <List dense>
              {props.list.map((listItem) => (
                <ListItem key={listItem.toString()}>
                  <ListItemIcon>
                    <BulletIcon />
                  </ListItemIcon>
                  <ListItemText primary={listItem} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onConfirm(false)}
          color="primary"
          data-tid={props.cancelDialogTID}
        >
          {t('core:no')}
        </Button>
        <Button
          data-tid={props.confirmDialogTID}
          onClick={() => onConfirm(true)}
          color="primary"
        >
          {t('core:yes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmDialog.defaultProps = {
  cancelDialogTID: 'confirmDialogCancelButton',
  confirmDialogTID: 'confirmDialogOkButton',
  confirmDialogContentTID: 'confirmDialogContentTID',
  list: [],
};

export default ConfirmDialog;
