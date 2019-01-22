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
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import { type Tag } from '../../reducers/taglibrary';

const styles = theme => ({
  root: {
    width: 550,
    height: '100%',
    marginBottom: 30,
    // background: theme.palette.background.paper
  },
});

type Props = {
  open: boolean,
  onClose: () => void,
  editTagForEntry: (path: string, tag: Tag, title: string) => void,
  currentEntryPath: string,
  selectedTag: Tag,
  open: boolean
};

type State = {
  errorTag?: boolean,
  disableConfirmButton?: boolean,
  title?: string
};

class EditEntryTagDialog extends React.Component<Props, State> {
  state = {
    disableConfirmButton: true,
    errorTag: false,
    title: ''
  };

  componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open === true) {
      this.setState({
        disableConfirmButton: !nextProps.selectedTag.title,
        title: nextProps.selectedTag.title
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
    const tagCheck = RegExp(/^[^\#\/\\ \[\]]{1,}$/);
    if (this.state.title && tagCheck.test(this.state.title)) {
      this.setState({ errorTag: false, disableConfirmButton: false });
    } else {
      this.setState({ errorTag: true, disableConfirmButton: true });
    }
  }

  onConfirm = () => {
    if (!this.state.disableConfirmButton) {
      this.props.editTagForEntry(this.props.currentEntryPath, this.props.selectedTag, this.state.title);
      this.setState({ errorTag: false, disableConfirmButton: true });
      this.props.onClose();
    }
  };

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:editTagTitle')}</DialogTitle>
  );

  renderContent = () => (
    <DialogContent data-tid="editEntryTagDialog" className={this.props.classes.root}>
      <FormControl
        fullWidth={true}
        error={this.state.errorTag}
      >
        <TextField
          fullWidth={true}
          error={this.state.errorTag}
          margin="dense"
          name="title"
          label={i18n.t('core:editTag')}
          onChange={this.handleInputChange}
          value={this.state.title}
          data-tid="editTagEntryDialog_input"
        />
        {this.state.errorTag && <FormHelperText>{i18n.t('core:tagTitleHelper')}</FormHelperText>}
      </FormControl>
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="closeEditTagEntryDialog"
        onClick={this.props.onClose}
        color="primary"
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        disabled={this.state.disableConfirmButton}
        onClick={this.onConfirm}
        data-tid="confirmEditTagEntryDialog"
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

export default withStyles(styles)(EditEntryTagDialog);
