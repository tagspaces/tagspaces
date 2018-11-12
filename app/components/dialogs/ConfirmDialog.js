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
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import GenericDialog from './GenericDialog';
import i18n from '../../services/i18n';

const styles = theme => ({});

type Props = {
  open: boolean,
  title: string,
  content: string,
  cancelDialogTID: string,
  confirmDialogTID: string,
  confirmDialogContentTID: string,
  list: Array<string>,
  confirmCallback: (result: boolean) => void,
  onClose: () => void
};

class ConfirmDialog extends React.Component<Props> {
  onConfirm = (result) => {
    this.props.confirmCallback(result);
    this.props.onClose();
  };

  renderTitle = () => (
    <DialogTitle>{this.props.title}</DialogTitle>
  );

  renderContent = () => (
    <DialogContent>
      <DialogContentText data-tid={this.props.confirmDialogContentTID}>
        {this.props.content}
        {this.props.list && this.props.list.map((listItem) => (
          <ListItem title={listItem}>
            <Typography variant="inherit" noWrap>{listItem}</Typography>
          </ListItem>
        ))}
      </DialogContentText>
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      <Button
        onClick={() => this.onConfirm(false)}
        color="primary"
        data-tid={this.props.cancelDialogTID}
      >
        {i18n.t('core:no')}
      </Button>
      <Button
        data-tid={this.props.confirmDialogTID}
        onClick={() => this.onConfirm(true)}
        color="primary"
      >
        {i18n.t('core:yes')}
      </Button>
    </DialogActions>
  );

  render() {
    return (
      <GenericDialog
        open={this.props.open}
        onClose={this.props.onClose}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

export default withStyles(styles)(ConfirmDialog);
