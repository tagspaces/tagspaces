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

import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Dialog from '@material-ui/core/Dialog';
import i18n from '-/services/i18n';
import { actions as SearchActions } from '-/reducers/searches';
import { SearchQuery } from '-/services/search';

interface Props {
  open: boolean;
  onClose: () => void;
  fullScreen?: boolean;
  searchQuery: SearchQuery;
  addSearch: (searchQuery: SearchQuery) => void;
}

const SaveSearchDialog = (props: Props) => {
  const [inputError, setInputError] = useState(false);
  const title = useRef<string>(undefined);
  const { open, onClose, fullScreen } = props;

  function onConfirm() {
    if (title.current) {
      props.addSearch({
        ...props.searchQuery,
        title: title.current
      });
      props.onClose();
    }
  }

  function handleValidation() {
    if (!title.current) {
      setInputError(true);
    } else if (inputError) {
      setInputError(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
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
      <DialogTitle>{i18n.t('core:createNewSavedSearchTitle')}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth={true} error={inputError}>
          <TextField
            fullWidth
            error={inputError}
            margin="dense"
            autoFocus
            name="name"
            label={i18n.t('core:createNewSavedSearchName')}
            onChange={event => {
              const { target } = event;
              title.current = target.value;
              handleValidation();
            }}
            data-tid="savedSearchTID"
            id="savedSearch"
          />
          <FormHelperText>{i18n.t('core:savedSearchHelp')}</FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          data-tid="closeSavedSearchTID"
          onClick={() => props.onClose()}
          color="primary"
        >
          {i18n.t('core:cancel')}
        </Button>
        <Button
          disabled={inputError}
          onClick={onConfirm}
          data-tid="confirmSavedSearchTID"
          id="confirmSavedSearch"
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
      addSearch: SearchActions.addSearch
    },
    dispatch
  );
}

export default connect(undefined, mapActionCreatorsToProps)(SaveSearchDialog);
