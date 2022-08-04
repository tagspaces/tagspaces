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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import FileIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import i18n from '-/services/i18n';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

interface Props {
  open: boolean;
  fullScreen: boolean;
  onClose: (clearSelection?: boolean) => void;
  selectedFiles: Array<File>;
  handleMoveFiles: (files: Array<File>) => void;
  handleCopyFiles: (files: Array<File>) => void;
}

function MoveOrCopyFilesDialog(props: Props) {
  const { open, onClose, fullScreen } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      fullScreen={fullScreen}
    >
      <DialogTitle>
        {i18n.t('core:copyMoveFilesTitle')}
        <DialogCloseButton onClose={() => onClose()} />
      </DialogTitle>
      <DialogContent>
        <List dense style={{ width: 550 }}>
          {props.selectedFiles &&
            props.selectedFiles.length > 0 &&
            props.selectedFiles.map((file: File) => (
              <ListItem title={file.path} key={file.path}>
                <ListItemIcon>
                  <FileIcon />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  {file.name}
                </Typography>
              </ListItem>
            ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button
          data-tid="closeMoveOrCopyDialog"
          onClick={() => props.onClose()}
        >
          {i18n.t('core:cancel')}
        </Button>
        <Button
          onClick={() => props.handleMoveFiles(props.selectedFiles)}
          data-tid="confirmMoveFilesTID"
          color="primary"
        >
          {i18n.t('core:moveFilesButton')}
        </Button>
        <Button
          onClick={() => props.handleCopyFiles(props.selectedFiles)}
          data-tid="confirmCopyFilesTID"
          color="primary"
        >
          {i18n.t('core:copyFilesButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MoveOrCopyFilesDialog;
