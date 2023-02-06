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

import React, { ChangeEvent, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import i18n from '-/services/i18n';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { QRCode } from 'react-qrcode-logo';
import InfoIcon from '-/components/InfoIcon';
import Tooltip from '-/components/Tooltip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import PlatformIO from '-/services/platform-facade';
import InputLabel from '@mui/material/InputLabel';

interface Props {
  open: boolean;
  onClose: () => void;
  path: string;
  showNotification: (message: string) => void;
}

function SharingLinkDialog(props: Props) {
  const { open, onClose, path, showNotification } = props;
  const [linkValidityDuration, setLinkValidityDuration] = useState<number>(
    60 * 15
  );
  const signedLink = useRef<string>(
    PlatformIO.getURLforPath(path, linkValidityDuration)
  );
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
        {i18n.t('core:sharingLink')} <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <TextField
          style={{marginTop: 8}}
          select
          fullWidth={true}
          label={
            <>
              {i18n.t('core:qrCodeValidity')}
              <InfoIcon tooltip={i18n.t('core:linkValidity')} />
            </>
          }
          value={linkValidityDuration}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const validityDuration = parseInt(event.target.value, 10);
            signedLink.current = PlatformIO.getURLforPath(
              path,
              validityDuration
            );
            setLinkValidityDuration(validityDuration);
          }}
        >
          <MenuItem value={60 * 15}>15 min</MenuItem>
          <MenuItem value={60 * 60}>1 hour</MenuItem>
          <MenuItem value={60 * 60 * 24}>1 day</MenuItem>
          <MenuItem value={60 * 60 * 24 * 3}>3 days</MenuItem>
          <MenuItem value={60 * 60 * 24 * 7}>1 week</MenuItem>
        </TextField>
        <InputLabel htmlFor="qr-code-link" style={{ fontSize: 20 }}>
          {i18n.t('core:qrCode')}
        </InputLabel>
        <QRCode id="qr-code-link" value={signedLink.current} size={400} />
        <TextField
          margin="dense"
          name="path"
          label={
            <>
              {i18n.t('Link for downloading')}
              <InfoIcon
                tooltip={i18n.t(
                  'Link for time limited sharing on the Internet'
                )}
              />
            </>
          }
          fullWidth={true}
          value={signedLink.current}
        />
      </DialogContent>
      <DialogActions>
        <Button
          data-tid="copySharingLinkTID"
          onClick={() => {
            navigator.clipboard.writeText(signedLink.current).then(() => {
              showNotification(i18n.t('Link copied to clipboard'));
            });
          }}
          color="primary"
        >
          {i18n.t('core:copy')}
        </Button>
        <Button data-tid="closeLinkTID" onClick={onClose} color="primary">
          {i18n.t('core:close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SharingLinkDialog;
