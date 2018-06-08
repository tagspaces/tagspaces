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
import { connect } from 'react-redux';
import Button from 'material-ui/Button';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';
import {
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from 'material-ui/List';
import { FormControl } from 'material-ui/Form';
import { withStyles } from 'material-ui/styles/index';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import { getKeyBindingObject } from '../../reducers/settings';

const styles = theme => ({
  root: {
    width: 550,
    height: '100%',
    overflowY: 'overlay',
    marginBottom: 30,
    background: theme.palette.background.paper
  },
  form: {
    width: '98%',
    height: 'auto'
  },
  shortcutKey: {
    backgroundColor: '#D6D6D6',
    font: 'Console',
    fontFamily: 'monospace',
    padding: '5px',
    borderRadius: '5px',
  }
});

type Props = {
  open: boolean,
  classes: Object,
  keyBindings: Array<Object>,
  onClose: () => void
};

class KeyboardDialog extends React.Component<Props> {
  renderTitle = () => <DialogTitle>{i18n.t('core:shortcutKeys')}</DialogTitle>;

  renderContent = () => (
    <DialogContent style={{ overflowY: 'overlay' }}>
      <div className={this.props.classes.root} data-tid="keyboardShortCutsDialog">
        {this.props.keyBindings && Object.keys(this.props.keyBindings).map((shortcutKey) => (
          <ListItem key={shortcutKey}>
            <FormControl className={this.props.classes.form}>
              <ListItemText primary={i18n.t('core:' + shortcutKey)} />
              <ListItemSecondaryAction className={this.props.classes.shortcutKey}>
                {this.props.keyBindings[shortcutKey]}
              </ListItemSecondaryAction>
            </FormControl>
          </ListItem>
        ))}
      </div>
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="closeKeyboardDialog"
        onClick={this.props.onClose}
        color="primary"
      >
        {i18n.t('core:ok')}
      </Button>
    </DialogActions>
  );

  render() {
    return (
      <GenericDialog
        open={this.props.open}
        onClose={this.props.onClose}
        // onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    keyBindings: getKeyBindingObject(state),
  };
}

export default connect(mapStateToProps)(
  withStyles(styles)(KeyboardDialog)
);
