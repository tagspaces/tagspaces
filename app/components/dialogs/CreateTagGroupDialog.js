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
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import ColorPickerDialog from './ColorPickerDialog';
import { type TagGroup } from '../../reducers/taglibrary';
import i18n from '../../services/i18n';
import TransparentBackground from '../TransparentBackground';

type Props = {
  open?: boolean,
  onClose: () => void,
  createTagGroup: (tagGroup: TagGroup) => void,
  color: string,
  textcolor: string
};

type State = {
  inputError?: boolean,
  displayColorPicker?: boolean,
  displayTextColorPicker?: boolean,
  disableConfirmButton?: boolean,
  uuid?: string,
  title?: string,
  color?: string,
  textcolor?: string,
  children?: string,
  expanded?: boolean
};

class CreateTagGroupDialog extends React.Component<Props, State> {
  state = {
    displayColorPicker: false,
    displayTextColorPicker: false,
    inputError: false,
    disableConfirmButton: true,
    title: '',
    children: '',
    color: this.props.color,
    textcolor: this.props.textcolor,
    expanded: true,
    uuid: ''
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
    if (this.state.title.length > 0) {
      this.setState({ inputError: false, disableConfirmButton: false });
    } else {
      this.setState({ inputError: true, disableConfirmButton: true });
    }
  }

  onConfirm = () => {
    if (!this.state.disableConfirmButton) {
      this.props.createTagGroup({
        uuid: this.state.uuid,
        title: this.state.title,
        expanded: true,
        color: this.state.color,
        textcolor: this.state.textcolor,
        children: []
      });
      this.setState({ inputError: false, disableConfirmButton: true });
      this.props.onClose();
    }
  };

  toggleDefaultTagBackgroundColorPicker = () => {
    this.setState((prevState) => ({
      displayColorPicker: !prevState.displayColorPicker
    }));
  };

  toggleDefaultTagTextColorPicker = () => {
    this.setState((prevState) => ({
      displayTextColorPicker: !prevState.displayTextColorPicker
    }));
  };

  handleChangeColor = (color: string) => {
    this.setState({ color });
  };

  handleChangeTextColor = (color: string) => {
    this.setState({ textcolor: color });
  };

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:createTagGroupTitle')}</DialogTitle>
  );

  renderContent = () => {
    const styles = {
      color: {
        width: '100%',
        height: 30,
        borderRadius: 2,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'gray',
        background: this.state.color
      },
      textcolor: {
        width: '100%',
        height: 30,
        borderRadius: 2,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'gray',
        background: this.state.textcolor
      },
      swatch: {
        padding: '5px',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer'
      },
      helpText: {
        marginBottom: '5px',
        fontSize: '1rem'
      },
    };

    return (
      <DialogContent>
        <FormControl
          fullWidth={true}
          error={this.state.inputError}
        >
          <TextField
            fullWidth={true}
            error={this.state.inputError}
            autoFocus
            name="title"
            label={i18n.t('core:createTagGroupName')}
            value={this.state.title}
            onChange={this.handleInputChange}
            data-tid="createTagGroupInput"
          />
          {this.state.inputError && <FormHelperText>{i18n.t('core:taggroupTitleHelper')}</FormHelperText>}
        </FormControl>
        <FormControl
          fullWidth={true}
        >
          <FormHelperText style={styles.helpText}>{i18n.t('core:tagBackgroundColor')}</FormHelperText>
          <TransparentBackground>
            <Button
              onClick={this.toggleDefaultTagBackgroundColorPicker}
              data-tid="createTagGroupBackgroundColor"
              style={styles.color}
              role="presentation"
            >&nbsp;
            </Button>
          </TransparentBackground>
          <ColorPickerDialog
            open={this.state.displayColorPicker}
            setColor={this.handleChangeColor}
            onClose={this.toggleDefaultTagBackgroundColorPicker}
            color={this.state.color}
          />
        </FormControl>
        <FormControl
          fullWidth={true}
        >
          <FormHelperText style={styles.helpText}>{i18n.t('core:tagForegroundColor')}</FormHelperText>
          <TransparentBackground>
            <Button
              onClick={this.toggleDefaultTagTextColorPicker}
              data-tid="createTagGroupForegroundColor"
              style={styles.textcolor}
              role="presentation"
            >&nbsp;
            </Button>
          </TransparentBackground>
          <ColorPickerDialog
            open={this.state.displayTextColorPicker}
            setColor={this.handleChangeTextColor}
            onClose={this.toggleDefaultTagTextColorPicker}
            color={this.state.textcolor}
          />
        </FormControl>
      </DialogContent>
    );
  };

  renderActions = () => (
    <DialogActions>
      <Button
        onClick={this.props.onClose}
        color="primary"
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        disabled={this.state.disableConfirmButton}
        onClick={this.onConfirm}
        data-tid="createTagGroupConfirmButton"
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

export default CreateTagGroupDialog;
