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

import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Dialog from '@material-ui/core/Dialog';
import ColorPickerDialog from './ColorPickerDialog';
import { TagGroup } from '-/reducers/taglibrary';
import i18n from '-/services/i18n';
import TransparentBackground from '../TransparentBackground';

interface Props {
  open: boolean;
  onClose: () => void;
  createTagGroup: (tagGroup: TagGroup) => void;
  fullScreen?: boolean;
  color: string;
  textcolor: string;
}

interface State {
  inputError: boolean;
  displayColorPicker: boolean;
  displayTextColorPicker: boolean;
  disableConfirmButton: boolean;
  uuid: string;
  title: string;
  color: string;
  textcolor: string;
}

class CreateTagGroupDialog extends React.Component<Props, State> {
  state = {
    displayColorPicker: false,
    displayTextColorPicker: false,
    inputError: false,
    disableConfirmButton: true,
    title: '',
    color: this.props.color,
    textcolor: this.props.textcolor,
    uuid: ''
  };

  handleTagGroupTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'title') {
      this.setState({ title: value }, this.handleValidation);
    }
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
        color: this.state.color,
        textcolor: this.state.textcolor,
        children: []
      });
      this.setState({ inputError: false, disableConfirmButton: true });
      this.props.onClose();
    }
  };

  toggleDefaultTagBackgroundColorPicker = () => {
    this.setState(prevState => ({
      displayColorPicker: !prevState.displayColorPicker
    }));
  };

  toggleDefaultTagTextColorPicker = () => {
    this.setState(prevState => ({
      displayTextColorPicker: !prevState.displayTextColorPicker
    }));
  };

  handleChangeColor = (color: string) => {
    this.setState({ color });
  };

  handleChangeTextColor = (color: string) => {
    this.setState({ textcolor: color });
  };

  render() {
    const { fullScreen, open, onClose } = this.props;

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
      }
    };

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
            this.onConfirm();
          } else if (event.key === 'Escape') {
            onClose();
          }
        }}
      >
        <DialogTitle>{i18n.t('core:createTagGroupTitle')}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth={true} error={this.state.inputError}>
            <TextField
              fullWidth={true}
              error={this.state.inputError}
              autoFocus
              name="title"
              label={i18n.t('core:createTagGroupName')}
              value={this.state.title}
              onChange={this.handleTagGroupTitleChange}
              data-tid="createTagGroupInput"
            />
            {this.state.inputError && (
              <FormHelperText>
                {i18n.t('core:taggroupTitleHelper')}
              </FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth={true}>
            <FormHelperText style={styles.helpText}>
              {i18n.t('core:tagBackgroundColor')}
            </FormHelperText>
            <TransparentBackground>
              <Button
                onClick={this.toggleDefaultTagBackgroundColorPicker}
                data-tid="createTagGroupBackgroundColor"
                style={styles.color}
                role="presentation"
              >
                &nbsp;
              </Button>
            </TransparentBackground>
            <ColorPickerDialog
              open={this.state.displayColorPicker}
              setColor={this.handleChangeColor}
              onClose={this.toggleDefaultTagBackgroundColorPicker}
              color={this.state.color}
            />
          </FormControl>
          <FormControl fullWidth={true}>
            <FormHelperText style={styles.helpText}>
              {i18n.t('core:tagForegroundColor')}
            </FormHelperText>
            <TransparentBackground>
              <Button
                onClick={this.toggleDefaultTagTextColorPicker}
                data-tid="createTagGroupForegroundColor"
                style={styles.textcolor}
                role="presentation"
              >
                &nbsp;
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
        <DialogActions>
          <Button onClick={this.props.onClose} color="primary">
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
      </Dialog>
    );
  }
}

export default CreateTagGroupDialog;
