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
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
}

function OpenLinkDialog(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { openLink } = useOpenedEntryContext();
  const [inputError, setInputError] = useState(false);
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [linkURL, setLinkURL] = useState('');
  const { open, onClose } = props;

  useEffect(() => {
    handleValidation();
  });

  function handleValidation() {
    let validURL = true;
    try {
      // eslint-disable-next-line no-new
      new URL(linkURL);
    } catch (e) {
      validURL = false;
    }
    if (validURL) {
      setInputError(false);
      setDisableConfirmButton(false);
    } else {
      setInputError(true);
      setDisableConfirmButton(true);
    }
  }

  function onConfirm() {
    if (!disableConfirmButton && linkURL) {
      openLink(linkURL, { fullWidth: false });
      resetState();
      props.onClose();
    }
  }

  function onCancel() {
    resetState();
    props.onClose();
  }

  function resetState() {
    setLinkURL('');
    setInputError(false);
    setDisableConfirmButton(true);
  }

  const okButton = (
    <TsButton
      disabled={disableConfirmButton}
      onClick={onConfirm}
      data-tid="confirmOpenLink"
      variant="contained"
      sx={
        {
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties & { WebkitAppRegion?: string }
      }
    >
      {t('core:openLink')}
    </TsButton>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        }
      }}
    >
      <TsDialogTitle
        dialogTitle={t('core:openLink')}
        closeButtonTestId="closeOpenLinkTID"
        onClose={onClose}
        actionSlot={okButton}
      />
      <DialogContent style={{ minWidth: smallScreen ? 100 : 400 }}>
        <FormControl fullWidth={true}>
          <TsTextField
            autoFocus
            name="name"
            label={t('core:link')}
            onChange={(event) => {
              const { target } = event;
              setLinkURL(target.value);
            }}
            updateValue={(value) => {
              setLinkURL(value);
            }}
            retrieveValue={() => linkURL}
            value={linkURL}
            data-tid="openLinkTID"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="start">
                    <InfoIcon tooltip={t('core:tsLinksHelp')} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </FormControl>
      </DialogContent>
      {!smallScreen && (
        <TsDialogActions>
          <TsButton data-tid="closeOpenLinkDialog" onClick={onCancel}>
            {t('core:cancel')}
          </TsButton>
          {okButton}
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default OpenLinkDialog;
