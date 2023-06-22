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
import { connect } from 'react-redux';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import withStyles from '@mui/styles/withStyles';
import Dialog from '@mui/material/Dialog';
import AppConfig from '-/AppConfig';
import i18n from '-/services/i18n';
import { getKeyBindingObject } from '-/reducers/settings';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

const styles = theme => ({
  shortcutKey: {
    backgroundColor: theme.palette.primary.main,
    font: 'Console',
    fontFamily: 'monospace',
    padding: '5px',
    borderRadius: '5px'
  }
});

interface Props {
  open: boolean;
  classes: any;
  keyBindings: Array<any>;
  onClose: () => void;
}

function KeyboardDialog(props: Props) {
  const { open, onClose, keyBindings, classes } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      scroll="paper"
    >
      <DialogTitle>
        {i18n.t('core:shortcutKeys')}
        <DialogCloseButton testId="closeKeyboardTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent
        data-tid="keyboardShortCutsDialog"
        style={{
          minWidth: 350,
          overflow: 'auto'
        }}
      >
        <List dense={false}>
          {keyBindings &&
            Object.keys(keyBindings).map(shortcutKey => (
              <ListItem key={shortcutKey}>
                <ListItemText primary={i18n.t('core:' + shortcutKey)} />
                <ListItemSecondaryAction className={classes.shortcutKey}>
                  {keyBindings[shortcutKey].toUpperCase()}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button
          data-tid="closeKeyboardDialog"
          onClick={onClose}
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function mapStateToProps(state) {
  return {
    keyBindings: getKeyBindingObject(state)
  };
}

export default connect(mapStateToProps)(withStyles(styles)(KeyboardDialog));
