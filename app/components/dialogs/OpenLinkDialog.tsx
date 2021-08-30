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

import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Dialog from '@material-ui/core/Dialog';
import i18n from '-/services/i18n';
import { actions as AppActions } from '-/reducers/app';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

interface Props {
  open: boolean;
  onClose: () => void;
  fullScreen?: boolean;
  openLink: (linkURL: string) => void;
}

const OpenLinkDialog = (props: Props) => {
  const [inputError, setInputError] = useState(false);
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [linkURL, setLinkURL] = useState('');
  const { open, onClose, fullScreen } = props;

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
      props.openLink(linkURL);
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
      fullScreen={fullScreen}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        } else if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      <DialogTitle>
        {i18n.t('core:openLink')}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl fullWidth={true} error={inputError}>
          <TextField
            fullWidth
            margin="dense"
            autoFocus
            name="name"
            label={i18n.t('core:link')}
            onChange={event => {
              const { target } = event;
              setLinkURL(target.value);
            }}
            value={linkURL}
            data-tid="directoryName"
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button data-tid="closeOpenLinkDialog" onClick={onCancel}>
          {i18n.t('core:cancel')}
        </Button>
        <Button
          disabled={disableConfirmButton}
          onClick={onConfirm}
          data-tid="confirmOpenLink"
          color="primary"
        >
          {i18n.t('core:open')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      openLink: AppActions.openLink
    },
    dispatch
  );
}

export default connect(undefined, mapActionCreatorsToProps)(OpenLinkDialog);
