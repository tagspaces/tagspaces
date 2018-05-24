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
 * @flow
 */

import React from 'react';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';
import { FormControl, FormHelperText } from 'material-ui/Form';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import { type TagGroup } from '../../reducers/taglibrary';

type Props = {
  open?: boolean,
  onClose: () => void,
  addTag: (tags: string, uuid: string) => void,
  selectedTagGroupEntry?: TagGroup
};

type State = {
  inputError?: boolean,
  disableConfirmButton?: boolean,
  open?: boolean,
  tagTitle?: string,
  uuid?: string
};

class CreateTagsDialog extends React.Component<Props, State> {
  state = {
    inputError: false,
    disableConfirmButton: true,
    open: false,
    tagTitle: '',
    uuid: ''
  };

  componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open === true) {
      this.setState({
        tagTitle: '',
        open: true,
        uuid: nextProps.selectedTagGroupEntry.uuid,
      });
    }
  };

  handleInputChange = (event: Object) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    }, this.handleValidation);
  };

  handleValidation() {
    // const regEx = '^[^#/\\ \[\]]{1,}$';
    const tagTitle = this.state.tagTitle.match(/[^,(?! )]+/g);
    if (tagTitle && tagTitle.length > 0) {
      this.setState({ inputError: false, disableConfirmButton: false });
    } else {
      this.setState({ inputError: true, disableConfirmButton: true });
    }
  }

  onConfirm = () => {
    if (!this.state.disableConfirmButton) {
      this.setState({ open: false, disableConfirmButton: true });
      this.props.addTag(this.state.tagTitle, this.state.uuid);
      this.props.onClose();
    }
  };

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:addTagsToGroupTitle')}</DialogTitle>
  );

  renderContent = () => (
    <DialogContent style={{ minWidth: 400 }}>
      <FormControl
        fullWidth={true}
        error={this.state.inputError}
      >
        <TextField
          error={this.state.inputError}
          name="tagTitle"
          label={i18n.t('core:addTagsToGroupTagsPlaceholder')}
          onChange={this.handleInputChange}
          value={this.state.tagTitle}
          data-tid="addTagsInput"
          fullWidth={true}
        />
        {this.state.inputError && <FormHelperText>{i18n.t('core:taggroupTitleHelper')}</FormHelperText>}
      </FormControl>

    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      <Button onClick={this.props.onClose} >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        disabled={this.state.disableConfirmButton}
        onClick={this.onConfirm}
        data-tid="createTagsConfirmButton"
        color="primary"
      >
        {i18n.t('core:ok')}
      </Button>
    </DialogActions>
  );

  render() {
    return (
      <GenericDialog
        open={this.props.open}
        onClose={this.props.onClose}
        onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

export default CreateTagsDialog;
