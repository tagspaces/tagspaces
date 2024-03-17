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
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Paper from '@mui/material/Paper';
import DraggablePaper from '-/components/DraggablePaper';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CreateFile from '-/components/dialogs/components/CreateFile';
import TargetPath from '-/components/dialogs/components/TargetPath';
import { TargetPathContextProvider } from '-/components/dialogs/hooks/TargetPathContextProvider';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: (event?: Object, reason?: string) => void;
}

function NewFileDialog(props: Props) {
  const { open, onClose } = props;
  const { t } = useTranslation();

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <TargetPathContextProvider>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        keepMounted
        aria-labelledby="draggable-dialog-title"
        PaperComponent={fullScreen ? Paper : DraggablePaper}
        scroll="paper"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          {t('core:create') + '...'}
          <DialogCloseButton testId="closeCreateDialogTID" onClose={onClose} />
        </DialogTitle>
        <DialogContent
          style={{
            minWidth: 200,
            minHeight: 200,
            marginBottom: 20,
            overflow: 'overlay',
          }}
          data-tid="newFileDialog"
        >
          <CreateFile onClose={onClose} />
          <TargetPath />
        </DialogContent>
      </Dialog>
    </TargetPathContextProvider>
  );
}

export default NewFileDialog;
