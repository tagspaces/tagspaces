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
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';
import GenericDialog from './GenericDialog';
import i18n from '../../services/i18n';
import { getKeyBindingObject } from '../../reducers/settings';

const styles = theme => ({
  root: {
    minWidth: 350
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
  fullScreen: boolean,
  keyBindings: Array<Object>,
  onClose: () => void
};

const KeyboardDialog = (props: Props) => {
  function renderTitle() {
    return (<DialogTitle>{i18n.t('core:shortcutKeys')}</DialogTitle>);
  }

  function renderContent() {
    return (
      <DialogContent className={props.classes.root} data-tid="keyboardShortCutsDialog">
        <List dense={false}>
          {props.keyBindings && Object.keys(props.keyBindings).map((shortcutKey) => (
            <ListItem key={shortcutKey}>
              <ListItemText primary={i18n.t('core:' + shortcutKey)} />
              <ListItemSecondaryAction className={props.classes.shortcutKey}>
                {props.keyBindings[shortcutKey]}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    );
  }

  function renderActions() {
    return (
      <DialogActions>
        <Button
          data-tid="closeKeyboardDialog"
          onClick={props.onClose}
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    );
  }

  return (
    <GenericDialog
      open={props.open}
      onClose={props.onClose}
      fullScreen={props.fullScreen}
      renderTitle={renderTitle}
      renderContent={renderContent}
      renderActions={renderActions}
    />
  );
};

function mapStateToProps(state) {
  return {
    keyBindings: getKeyBindingObject(state),
  };
}

export default connect(mapStateToProps)(
  withMobileDialog()(withStyles(styles)(KeyboardDialog))
);
