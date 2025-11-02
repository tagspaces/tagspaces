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
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { CircularProgress } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  title?: string;
  onClose: () => void;
}

function ProgressDialog(props: Props) {
  const { t } = useTranslation();
  const { open, onClose, title } = props;
  return (
    <Dialog
      aria-labelledby="draggable-dialog-title"
      PaperComponent={DraggablePaper}
      open={open}
      onClose={onClose}
      style={{ minHeight: 200 }}
    >
      <DialogTitle
        sx={{ cursor: 'move', minHeight: '20px' }}
        data-tid="progressDialogTitle"
        id="draggable-dialog-title"
      >
        {title && t(title)}
        <DialogCloseButton testId="closeProgressTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent
        style={{
          minWidth: 300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress size={40} />
      </DialogContent>
    </Dialog>
  );
}

export default ProgressDialog;
