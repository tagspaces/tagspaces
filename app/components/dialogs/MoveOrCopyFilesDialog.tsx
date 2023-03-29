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

/**
 * Used for the import functionality with drag and drop from the
 * file manager or desktop of the operating system
 */

import React from 'react';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import FileIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import DraggablePaper from '-/components/DraggablePaper';
import i18n from '-/services/i18n';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import AppConfig from '-/AppConfig';

interface Props {
  open: boolean;
  onClose: (clearSelection?: boolean) => void;
  selectedFiles: Array<File>;
  handleMoveFiles: (files: Array<File>) => void;
  handleCopyFiles: (files: Array<File>) => void;
}

function MoveOrCopyFilesDialog(props: Props) {
  const { open, onClose } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      aria-labelledby="draggable-dialog-title"
      PaperComponent={fullScreen ? Paper : DraggablePaper}
      fullScreen={fullScreen}
    >
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {i18n.t('core:copyMoveEntriesTitle')}
        <DialogCloseButton onClose={() => onClose()} />
      </DialogTitle>
      <DialogContent
        style={{
          overflowX: 'hidden',
          // @ts-ignore
          overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
        }}
      >
        <List
          dense
          style={{ width: 550, marginLeft: -15 }}
          subheader={
            <ListSubheader component="div">
              {i18n.t('selectedFiles')}
            </ListSubheader>
          }
        >
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
          {i18n.t('core:moveEntriesButton')}
        </Button>
        <Button
          onClick={() => props.handleCopyFiles(props.selectedFiles)}
          data-tid="confirmCopyFilesTID"
          color="primary"
        >
          {i18n.t('core:copyEntriesButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MoveOrCopyFilesDialog;
