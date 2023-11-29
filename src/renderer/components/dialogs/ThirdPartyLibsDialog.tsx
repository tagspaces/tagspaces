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
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import ThirdPartyLibs from '-/third-party.txt';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
}

function ThirdPartyLibsDialog(props: Props) {
  const { open, onClose } = props;
  const { t } = useTranslation();
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
        {t('core:thirdPartyLibs')}{' '}
        <DialogCloseButton testId="closeThirdPartyTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent style={{ overflowX: 'auto' }}>
        <pre style={{ whiteSpace: 'pre-wrap', userSelect: 'text' }}>
          {ThirdPartyLibs}
        </pre>
      </DialogContent>
      <DialogActions
        style={fullScreen ? { padding: '10px 30px 30px 30px' } : {}}
      >
        <Button
          data-tid="confirmThirdPartyLibsDialog"
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

export default ThirdPartyLibsDialog;
