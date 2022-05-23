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
import DialogContentText from '@material-ui/core/DialogContentText';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import BulletIcon from '@material-ui/icons/Remove';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import i18n from '-/services/i18n';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

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

const ConfirmDialog = (props: Props) => {
  const { open, onClose, confirmCallback } = props;

  function onConfirm(result) {
    confirmCallback(result);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} keepMounted scroll="paper">
      <DialogTitle>
        {props.title}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          data-tid={props.confirmDialogContentTID}
          component="span"
        >
          {props.content}
          {props.list && (
            <List dense>
              {props.list.map(listItem => (
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
          {i18n.t('core:no')}
        </Button>
        <Button
          data-tid={props.confirmDialogTID}
          onClick={() => onConfirm(true)}
          color="primary"
        >
          {i18n.t('core:yes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ConfirmDialog.defaultProps = {
  cancelDialogTID: 'confirmDialogCancelButton',
  confirmDialogTID: 'confirmDialogOkButton',
  confirmDialogContentTID: 'confirmDialogContentTID',
  list: []
};

export default ConfirmDialog;
