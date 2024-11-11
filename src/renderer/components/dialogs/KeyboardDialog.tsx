/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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
import TsButton from '-/components/TsButton';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import DraggablePaper from '-/components/DraggablePaper';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Box from '@mui/material/Box';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import { getKeyBindingObject } from '-/reducers/settings';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import AppConfig from '-/AppConfig';
import Paper from '@mui/material/Paper';

export function adjustKeyBinding(keyBinding: string) {
  if (!keyBinding || !keyBinding.length) return '';
  let adjKB = '';
  if (Array.isArray(keyBinding)) {
    adjKB = keyBinding.join(', ');
  } else {
    adjKB = keyBinding?.toLowerCase();
  }
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
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const okButton = (
    <TsButton
      data-tid="closeKeyboardDialog"
      onClick={onClose}
      variant="outlined"
    >
      {t('core:ok')}
    </TsButton>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      keepMounted
      scroll="paper"
    >
      <TsDialogTitle
        dialogTitle={t('core:shortcutKeys')}
        closeButtonTestId="closeKeyboardTID"
        onClose={onClose}
        actionSlot={okButton}
      />
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
                <Box
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
                </Box>
              </ListItem>
            ))}
        </List>
      </DialogContent>
      {!smallScreen && <TsDialogActions>{okButton}</TsDialogActions>}
    </Dialog>
  );
}

export default KeyboardDialog;
