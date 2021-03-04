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

import React, { useReducer, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Dialog from '@material-ui/core/Dialog';
import i18n from '-/services/i18n';
import { extractDirectoryName } from '-/utils/paths';
import { actions as AppActions } from '-/reducers/app';
import PlatformIO from '-/services/platform-io';

interface Props {
  open: boolean;
  selectedDirectoryPath: string;
  onClose: () => void;
  renameDirectory: (directoryPath: string, newDirectoryName: string) => void;
}

const RenameDirectoryDialog = (props: Props) => {
  const [inputError, setInputError] = useState<boolean>(false);
  const disableConfirmButton = useRef<boolean>(true);
  const name = useRef<string>(
    props.selectedDirectoryPath
      ? extractDirectoryName(
          props.selectedDirectoryPath,
          PlatformIO.getDirSeparator()
        )
      : ''
  );

  // eslint-disable-next-line no-unused-vars
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    name.current = event.target.value;
    handleValidation();
  };

  const handleValidation = () => {
    // const nameRegex = this.state.name.match('^[A-Z][-a-zA-Z]+$');
    if (name.current.length > 0) {
      if (inputError) {
        setInputError(false);
      } else {
        // rerender
        forceUpdate();
      }
      disableConfirmButton.current = false;
    } else {
      if (!inputError) {
        setInputError(true);
      } else {
        // rerender
        forceUpdate();
      }
      disableConfirmButton.current = true;
    }
  };

  const onConfirm = () => {
    if (!disableConfirmButton.current) {
      props.renameDirectory(props.selectedDirectoryPath, name.current);
      props.onClose();
    }
  };

  const { open, onClose } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
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
      <DialogTitle>{i18n.t('core:renameDirectory')}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth={true} error={inputError}>
          <TextField
            fullWidth={true}
            autoFocus
            required
            error={inputError}
            margin="dense"
            name="name"
            label={i18n.t('core:renameDirectoryTitleName')}
            onChange={handleInputChange}
            defaultValue={name.current}
            data-tid="renameDirectoryDialogInput"
          />
          <FormHelperText>{i18n.t('core:directoryNameHelp')}</FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          data-tid="closeRenameDirectoryDialog"
          onClick={props.onClose}
          color="primary"
        >
          {i18n.t('core:cancel')}
        </Button>
        <Button
          disabled={disableConfirmButton.current}
          onClick={onConfirm}
          data-tid="confirmRenameDirectory"
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      renameDirectory: AppActions.renameDirectory
    },
    dispatch
  );
}

export default connect(null, mapActionCreatorsToProps)(RenameDirectoryDialog);
