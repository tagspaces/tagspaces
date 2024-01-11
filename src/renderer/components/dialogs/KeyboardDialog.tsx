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
import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import { getKeyBindingObject } from '-/reducers/settings';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import AppConfig from '-/AppConfig';

export function adjustKeyBinding(keyBinding: string) {
  if (!keyBinding) return '';
  let adjKB = keyBinding.toLowerCase();
  if (AppConfig.isMacLike) {
    adjKB = adjKB
      .replaceAll('+', ' ')
      .replaceAll('command', '⌘')
      .replaceAll('option', '⌥')
      .replaceAll('shift', '⇧');
  } else {
    adjKB = adjKB.replaceAll('+', ' + ');
  }
  adjKB = adjKB
    .replaceAll('down', '▼')
    .replaceAll('up', '▲')
    .replaceAll('backspace', '⌫')
    .toUpperCase();
  return adjKB;
}

interface Props {
  open: boolean;
  classes: any;
  onClose: () => void;
}

function KeyboardDialog(props: Props) {
  const { open, onClose } = props;
  const { t } = useTranslation();
  const keyBindings = useSelector(getKeyBindingObject);
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
        {t('core:shortcutKeys')}
        <DialogCloseButton testId="closeKeyboardTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent
        data-tid="keyboardShortCutsDialog"
        style={{
          minWidth: 350,
          overflow: 'auto',
        }}
      >
        <List dense={false}>
          {keyBindings &&
            Object.keys(keyBindings).map((shortcutKey) => (
              <ListItem key={shortcutKey}>
                <ListItemText primary={t('core:' + shortcutKey)} />
                <ListItemSecondaryAction
                  style={{
                    backgroundColor: 'gray',
                    color: 'white',
                    font: 'Console',
                    fontFamily: 'monospace',
                    padding: '5px',
                    borderRadius: '5px',
                  }}
                >
                  {adjustKeyBinding(keyBindings[shortcutKey])}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      </DialogContent>
      <DialogActions
        style={fullScreen ? { padding: '10px 30px 30px 30px' } : {}}
      >
        <Button
          data-tid="closeKeyboardDialog"
          onClick={onClose}
          color="primary"
          variant="contained"
        >
          {t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default KeyboardDialog;
