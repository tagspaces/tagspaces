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
import FileIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DraggablePaper from '-/components/DraggablePaper';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTranslation } from 'react-i18next';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';

interface Props {
  open: boolean;
  onClose: (clearSelection?: boolean) => void;
  selectedFiles: Array<any>;
}

function MoveOrCopyFilesDialog(props: Props) {
  const { open, onClose } = props;
  const { t } = useTranslation();

  const theme = useTheme();

  const { moveFiles, copyFiles } = useIOActionsContext();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  /*
  const handleMoveCopyFiles = (files: Array<any>, move = false) => {
    const promises = [];
    for (const file of files) {
      if (move) {
        promises.push(
          renameFilePromise(
            file.path,
            cleanTrailingDirSeparator(currentDirectoryPath) +
              AppConfig.dirSeparator +
              file.name,
          )
            .then(() => true)
            .catch((error) => {
              console.log('renameFilePromise', error);
            }),
        );
      } else {
        promises.push(
          copyFilePromise(
            file.path,
            cleanTrailingDirSeparator(currentDirectoryPath) +
              AppConfig.dirSeparator +
              file.name,
          )
            .then(() => true)
            .catch((error) => {
              console.log('copyFilePromise', error);
            }),
        );
      }
    }
    Promise.all(promises)
      .then(() => openDirectory(currentDirectoryPath))
      .catch((error) => {
        console.log('promises', error);
      });
  };  */

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
        {t('core:copyMoveEntriesTitle')}
        <DialogCloseButton
          testId="closeMoveOrCopyTID"
          onClose={() => onClose()}
        />
      </DialogTitle>
      <DialogContent
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        <Typography variant="subtitle2">{t('selectedFiles')}</Typography>
        <List dense style={{ width: 550, marginLeft: -15 }}>
          {props.selectedFiles &&
            props.selectedFiles.length > 0 &&
            props.selectedFiles.map((file) => (
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
      <DialogActions
        style={fullScreen ? { padding: '10px 30px 30px 30px' } : {}}
      >
        <Button
          data-tid="closeMoveOrCopyDialog"
          onClick={() => props.onClose()}
        >
          {t('core:cancel')}
        </Button>
        <Button
          onClick={() => {
            if (props.selectedFiles) {
              moveFiles(
                props.selectedFiles.map((file) => file.path),
                currentDirectoryPath,
              );
            }
            props.onClose();
          }}
          data-tid="confirmMoveFilesTID"
          color="primary"
          variant="contained"
        >
          {t('core:moveEntriesButton')}
        </Button>
        <Button
          onClick={() => {
            if (props.selectedFiles) {
              copyFiles(
                props.selectedFiles.map((file) => file.path),
                currentDirectoryPath,
              );
            }
            props.onClose();
          }}
          data-tid="confirmCopyFilesTID"
          color="primary"
          variant="contained"
        >
          {t('core:copyEntriesButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MoveOrCopyFilesDialog;
