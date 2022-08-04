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
import i18n from '-/services/i18n';
import ThirdPartyLibs from '-/third-party.txt';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

// FIXME checkout https://mui.com/components/use-media-query/#using-material-uis-breakpoint-helpers
const withMobileDialog = () => WrappedComponent => props => (
  <WrappedComponent {...props} width="lg" fullScreen={false} />
);

interface Props {
  open: boolean;
  onClose: () => void;
  fullScreen: boolean;
}

function ThirdPartyLibsDialog(props: Props) {
  const { open, onClose, fullScreen } = props;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      scroll="paper"
    >
      <DialogTitle>
        {i18n.t('core:thirdPartyLibs')} <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent style={{ overflowX: 'auto' }}>
        <pre style={{ whiteSpace: 'pre-wrap', userSelect: 'text' }}>
          {ThirdPartyLibs}
        </pre>
      </DialogContent>
      <DialogActions>
        <Button
          data-tid="confirmThirdPartyLibsDialog"
          onClick={onClose}
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default withMobileDialog()(ThirdPartyLibsDialog);
