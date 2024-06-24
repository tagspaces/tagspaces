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
import { TargetPathContextProvider } from '-/components/dialogs/hooks/TargetPathContextProvider';
import { useTranslation } from 'react-i18next';
import { Pro } from '-/pro';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateAudio = Pro && Pro.UI ? Pro.UI.CreateAudio : false;

function NewAudioDialog(props: Props) {
  const { open, onClose } = props;
  const { t } = useTranslation();

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  function intOnClose(event?: any, reason?: any) {
    if (reason === 'escapeKeyDown' || reason === 'backdropClick') {
      confirm(t('confirmDialogClosing')) && onClose();
    } else {
      onClose();
    }
  }

  return (
    <TargetPathContextProvider>
      <Dialog
        open={open}
        onClose={intOnClose}
        fullScreen={fullScreen}
        keepMounted
        aria-labelledby="draggable-dialog-title"
        PaperComponent={fullScreen ? Paper : DraggablePaper}
        scroll="paper"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          {t('core:audioRecorder')}
          <DialogCloseButton
            testId="closeCreateDialogTID"
            onClose={() => {
              intOnClose(undefined, 'escapeKeyDown');
            }}
          />
        </DialogTitle>
        <DialogContent
          style={{
            minWidth: 200,
            minHeight: 200,
            marginBottom: 20,
            overflow: 'overlay',
          }}
          data-tid="keyboardShortCutsDialog"
        >
          {CreateAudio && <CreateAudio onClose={intOnClose} />}
        </DialogContent>
      </Dialog>
    </TargetPathContextProvider>
  );
}

export default NewAudioDialog;
