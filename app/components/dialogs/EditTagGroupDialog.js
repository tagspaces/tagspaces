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
import moment from 'moment';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import ColorPickerDialog from './ColorPickerDialog';
import { type TagGroup } from '../../reducers/taglibrary';
import i18n from '../../services/i18n';
import TransparentBackground from '../TransparentBackground';

type Props = {
  open?: boolean,
  editTagGroup: (tagGroup: TagGroup) => void,
  selectedTagGroupEntry?: TagGroup,
  onClose: () => void
};

type State = {
  inputError?: boolean,
  displayColorPicker?: boolean,
  displayTextColorPicker?: boolean,
  disableConfirmButton?: boolean,
  title?: string,
  applyChanges?: boolean,
  color?: string,
  textcolor?: string,
  modifiedDate?: string
};

class EditTagGroupDialog extends React.Component<Props, State> {
  state = {
    displayColorPicker: false,
    displayTextColorPicker: false,
    inputError: false,
    disableConfirmButton: true,
    applyChanges: false,
    title: '',
    color: '',
    textcolor: '',
    modifiedDate: ''
  };

  componentWillReceiveProps = ({ open, selectedTagGroupEntry }) => {
    if (open === true) {
      this.setState({
        disableConfirmButton: !selectedTagGroupEntry.title,
        applyChanges: false,
        title: selectedTagGroupEntry.title,
        color: selectedTagGroupEntry.color,
        textcolor: selectedTagGroupEntry.textcolor,
        modifiedDate: selectedTagGroupEntry.modified_date
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
    if (this.state.title && this.state.title.length > 0) {
      this.setState({ inputError: false, disableConfirmButton: false });
    } else {
      this.setState({ inputError: true, disableConfirmButton: true });
    }
  }

  onConfirm = () => {
    const { disableConfirmButton, applyChanges } = this.state;
    const { selectedTagGroupEntry } = this.props;
    if (disableConfirmButton) {
      return;
    }

    if (selectedTagGroupEntry && selectedTagGroupEntry.children) {
      this.props.editTagGroup({
        ...selectedTagGroupEntry,
        title: this.state.title,
        color: this.state.color,
        textcolor: this.state.textcolor,
        children: selectedTagGroupEntry.children.map((tag) => ({
          ...tag,
          color: applyChanges ? this.state.color : tag.color,
          textcolor: applyChanges ? this.state.textcolor : tag.textcolor,
          style: tag.style
        }))
      });
      this.setState({ inputError: false, disableConfirmButton: true });
      this.props.onClose();
    }
  };

  toggleDefaultTagBackgroundColorPicker = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  toggleDefaultTagTextColorPicker = () => {
    this.setState({ displayTextColorPicker: !this.state.displayTextColorPicker });
  };

  handleChangeColor = (color: string) => {
    this.setState({ color });
  };

  handleChangeTextColor = (color: string) => {
    this.setState({ textcolor: color });
  };

  setApplyChanges = (applyColorChanges: boolean) => {
    this.setState({ applyChanges: applyColorChanges });
  };

  renderTitle = () => (
    <DialogTitle style={{ overflow: 'visible' }}>{i18n.t('core:editTagGroupTitle')}{` '${this.state.title}'`}</DialogTitle>
  );

  renderContent = () => {
    const { color, textcolor, modifiedDate } = this.state;
    const styles = {
      color: {
        width: '100%',
        height: 30,
        borderRadius: 2,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'gray',
        padding: '5px',
        background: color
      },
      textcolor: {
        width: '100%',
        height: 30,
        borderRadius: 2,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'gray',
        padding: '5px',
        background: textcolor
      },
      helpText: {
        marginBottom: '5px',
        fontSize: '1rem'
      },
    };

    return (
      <DialogContent style={{ overflow: 'visible' }}>
        <FormControl
          fullWidth={true}
          error={this.state.inputError}
          style={{ overflow: 'visible' }}
        >
          {modifiedDate !== '' && (
            <div className="tag-date" style={{ fontSize: 12, position: 'relative', bottom: 20, color: '#808080' }}>
              <span className="text" style={{ fontWeight: 600 }}>{`${i18n.t('core:modifiedDate')}: `}</span>
              <time>{moment(modifiedDate).format('MMM. DD, YYYY')}</time>
            </div>
          )}
          <TextField
            error={this.state.inputError}
            margin="dense"
            name="title"
            label={i18n.t('core:editTagGroupNewName')}
            onChange={this.handleInputChange}
            value={this.state.title}
            data-tid="editTagGroupInput"
            fullWidth={true}
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
              data-tid="editTagGroupBackgroundColor"
              style={styles.color}
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
              data-tid="editTagGroupForegroundColor"
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
        <FormControl>
          <FormHelperText style={styles.helpText}>{i18n.t('core:colorChangesToAllTags')}</FormHelperText>
          <Switch
            data-tid="editTagGroupSwitch"
            onClick={() => this.setApplyChanges(!this.state.applyChanges)}
            checked={this.state.applyChanges}
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
        data-tid="editTagGroupConfirmButton"
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

export default EditTagGroupDialog;
