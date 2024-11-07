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

import React, { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import TsButton from '-/components/TsButton';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import InfoIcon from '-/components/InfoIcon';
import TsTextField from '-/components/TsTextField';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

function OpenLinkDialog(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      //fullScreen={fullScreen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        }
      }}
    >
      <DialogTitle>
        {t('core:openLink')}
        <DialogCloseButton testId="closeOpenLinkTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent style={{ minWidth: fullScreen ? 100 : 400 }}>
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
                    <InfoIcon tooltip="TagSpace links begin with ts://? and are used for internal sharing of files and folders" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </FormControl>
      </DialogContent>
      <TsDialogActions>
        <TsButton data-tid="closeOpenLinkDialog" onClick={onCancel}>
          {t('core:cancel')}
        </TsButton>
        <TsButton
          disabled={disableConfirmButton}
          onClick={onConfirm}
          data-tid="confirmOpenLink"
          variant="contained"
        >
          {t('core:open')}
        </TsButton>
      </TsDialogActions>
    </Dialog>
  );
}

export default OpenLinkDialog;
