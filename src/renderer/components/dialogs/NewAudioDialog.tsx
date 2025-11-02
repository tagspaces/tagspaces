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
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { TargetPathContextProvider } from '-/components/dialogs/hooks/TargetPathContextProvider';
import { Pro } from '-/pro';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
}

const CreateAudio = Pro && Pro.UI ? Pro.UI.CreateAudio : false;

function NewAudioDialog(props: Props) {
  const { open, onClose, title } = props;
  const { t } = useTranslation();

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

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
        fullScreen={smallScreen}
        keepMounted
        aria-labelledby="draggable-dialog-title"
        PaperComponent={smallScreen ? Paper : DraggablePaper}
        scroll="paper"
      >
        <TsDialogTitle
          dialogTitle={t('core:audioRecorder')}
          closeButtonTestId="closeNewAudioDialogTID"
          onClose={() => {
            intOnClose(undefined, 'escapeKeyDown');
          }}
        />
        <DialogContent
          sx={{
            minWidth: '200px',
            minHeight: '200px',
            overflow: 'overlay',
          }}
          data-tid="keyboardShortCutsDialog"
        >
          {CreateAudio && <CreateAudio onClose={intOnClose} title={title} />}
        </DialogContent>
      </Dialog>
    </TargetPathContextProvider>
  );
}

export default NewAudioDialog;
