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
 * @flow
 */

import React from 'react';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import GenericDialog from './GenericDialog';
import i18n from '../../services/i18n';

type Props = {
  open: boolean,
  title: string,
  content: string,
  cancelDialogTID?: string,
  confirmDialogTID?: string,
  confirmDialogContentTID?: string,
  list: Array<string>,
  confirmCallback: (result: boolean) => void,
  onClose: () => void
};

const ConfirmDialog = (props: Props) => {
  function onConfirm(result) {
    props.confirmCallback(result);
    props.onClose();
  }

  function renderTitle() {
    return (<DialogTitle>{props.title}</DialogTitle>);
  }

  function renderContent() {
    return (<DialogContent>
      <DialogContentText data-tid={props.confirmDialogContentTID}>
        {props.content}
        {props.list && props.list.map((listItem) => (
          <ListItem title={listItem}>
            <Typography variant="inherit" noWrap>{listItem}</Typography>
          </ListItem>
        ))}
      </DialogContentText>
    </DialogContent>);
  }

  function renderActions() {
    return (<DialogActions>
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
    </DialogActions>);
  }

  return (
    <GenericDialog
      open={props.open}
      onClose={props.onClose}
      renderTitle={renderTitle}
      renderContent={renderContent}
      renderActions={renderActions}
    />
  );
};

ConfirmDialog.defaultProps = {
  cancelDialogTID: 'confirmDialogCancelButton',
  confirmDialogTID: 'confirmDialogOkButton',
  confirmDialogContentTID: 'confirmDialogContentTID',
  list: []
};

export default ConfirmDialog;
