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
import InfoIcon from '-/components/InfoIcon';
import TsButton from '-/components/TsButton';
import TsSelect from '-/components/TsSelect';
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { openUrl } from '-/services/utils-io';
import { generateClipboardLink } from '-/utils/dom';
import { Paper } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { extractTitle } from '@tagspaces/tagspaces-common/paths';
import Links from 'assets/links';
import { ChangeEvent, useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCode } from 'react-qrcode-logo';

interface Props {
  open: boolean;
  path?: string;
  onClose: () => void;
}

function LinkGeneratorDialog(props: Props) {
  const { open, onClose, path } = props;
  const { t } = useTranslation();
  const { findLocation } = useCurrentLocationContext();
  const { openedEntry } = useOpenedEntryContext();
  const { showNotification } = useNotificationContext();
  const linkValidityDuration = useRef<number>(60 * 15);
  const signedLink = useRef<string>(undefined);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  let location = findLocation(openedEntry?.locationID);

  const gPath = path || openedEntry.path;

  useEffect(() => {
    setSignedLink();
  }, []);

  function setSignedLink() {
    location
      .generateURLforPath(gPath, linkValidityDuration.current)
      .then((url) => {
        signedLink.current = url;
        forceUpdate();
      });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      keepMounted
      aria-labelledby="draggable-dialog-title"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      scroll="paper"
    >
      <TsDialogTitle
        dialogTitle={t('core:downloadLink')}
        closeButtonTestId="closeLinkGeneratorTID"
        onClose={onClose}
      />
      <DialogContent style={{ overflow: 'auto', minHeight: 510 }}>
        <TsSelect
          label={
            <>
              {t('core:linkValidity')}
              <InfoIcon tooltip={t('core:linkValidityTooltip')} />
            </>
          }
          value={linkValidityDuration.current}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            linkValidityDuration.current = parseInt(event.target.value, 10);
            setSignedLink();
          }}
        >
          <MenuItem value={60 * 15}>15 {t('core:minutes')}</MenuItem>
          <MenuItem value={60 * 60}>60 {t('core:minutes')}</MenuItem>
          <MenuItem value={60 * 60 * 24}>1 {t('core:day')}</MenuItem>
          <MenuItem value={60 * 60 * 24 * 3}>3 {t('core:days')}</MenuItem>
          <MenuItem value={60 * 60 * 24 * 7}>7 {t('core:days')}</MenuItem>
        </TsSelect>
        <TsTextField
          name="path"
          slotProps={{
            input: {
              readOnly: true,
              endAdornment: (
                <InputAdornment position="start">
                  <TsButton
                    data-tid="copySharingLinkTID"
                    variant="contained"
                    onClick={() => {
                      const entryTitle = extractTitle(
                        gPath,
                        true,
                        location.getDirSeparator(),
                      );
                      const clipboardItem = generateClipboardLink(
                        signedLink.current,
                        entryTitle,
                      );
                      navigator.clipboard.write(clipboardItem).then(() => {
                        showNotification(t('core:linkCopied'));
                      });
                    }}
                  >
                    {t('core:copy')}
                  </TsButton>
                </InputAdornment>
              ),
            },
          }}
          label={t('core:downloadLink')}
          value={signedLink.current}
        />
        <TsTextField
          name="path"
          label={t('core:qrCode')}
          value={' '}
          slotProps={{
            input: {
              readOnly: true,
              style: { height: 380 },
              startAdornment: (
                <InputAdornment title={t('core:qrCode')} position="start">
                  <QRCode
                    id="qr-code-link"
                    value={signedLink.current}
                    size={350}
                    enableCORS={true}
                    // logoWidth={64}
                    // logoHeight={64}
                    // logoImage="data:image/png;base64,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"
                  />
                </InputAdornment>
              ),
            },
          }}
        />
      </DialogContent>
      <TsDialogActions
        style={{
          justifyContent: 'space-between',
        }}
      >
        <TsButton
          data-tid="helpSearchButtonTID"
          onClick={() => {
            openUrl(Links.documentationLinks.sharing);
          }}
        >
          {t('help')}
        </TsButton>
        <TsButton data-tid="closeLinkTID" onClick={onClose}>
          {t('core:closeButton')}
        </TsButton>
      </TsDialogActions>
    </Dialog>
  );
}

export default LinkGeneratorDialog;
