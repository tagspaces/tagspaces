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

import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsTextField from '-/components/TsTextField';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import BulletIcon from '@mui/icons-material/Remove';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  title: string;
  content?: string;
  customConfirmText?: string;
  customCancelText?: string;
  cancelDialogTID?: string;
  confirmDialogTID?: string;
  confirmDialogContentTID?: string;
  prompt?: string;
  helpText?: string;
  list: string[];
  confirmCallback: (result: boolean | string) => void;
  onClose: () => void;
}

function ConfirmDialog(props: Props) {
  const {
    open,
    onClose,
    title,
    content,
    confirmCallback,
    prompt,
    helpText,
    customCancelText,
    customConfirmText,
    list,
    confirmDialogContentTID,
    cancelDialogTID,
    confirmDialogTID,
  } = props;
  const { t } = useTranslation();
  const [promptValue, setPromptValue] = useState<string>('');

  function onConfirm(result) {
    confirmCallback(result && prompt ? promptValue : result);
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
      <DialogTitle sx={{ cursor: 'move' }} id="draggable-dialog-title">
        {title}
        <DialogCloseButton testId="closeConfirmTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText data-tid={confirmDialogContentTID} component="span">
          {content}
          {prompt && (
            <TsTextField
              fullWidth
              label={helpText}
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              placeholder={prompt}
            />
          )}
          {list && (
            <List dense>
              {list.map((listItem) => (
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
      <TsDialogActions>
        <TsButton onClick={() => onConfirm(false)} data-tid={cancelDialogTID}>
          {customCancelText ? customCancelText : t('core:no')}
        </TsButton>
        <TsButton data-tid={confirmDialogTID} onClick={() => onConfirm(true)}>
          {customConfirmText ? customConfirmText : t('core:yes')}
        </TsButton>
      </TsDialogActions>
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
