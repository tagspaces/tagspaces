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
import format from 'date-fns/format';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import ColorPickerDialog from './ColorPickerDialog';
import TransparentBackground from '../TransparentBackground';
import i18n from '../../services/i18n';
import { type Tag, type TagGroup } from '../../reducers/taglibrary';

type Props = {
  open?: boolean,
  onClose: () => void,
  editTag: (tag: Tag, tagGroupId: string) => void,
  selectedTag?: Tag,
  selectedTagGroupEntry?: TagGroup
};

type State = {
  inputError?: boolean,
  displayColorPicker?: boolean,
  displayTextColorPicker?: boolean,
  disableConfirmButton?: boolean,
  title?: string,
  color?: string,
  textcolor?: string,
  modifiedDate?: string
};

class EditTagDialog extends React.Component<Props, State> {
  state = {
    displayColorPicker: false,
    displayTextColorPicker: false,
    inputError: false,
    disableConfirmButton: true,
    title: '',
    color: '',
    textcolor: '',
    modifiedDate: ''
  };

  componentWillReceiveProps = ({ open, selectedTag }) => {
    if (open === true) {
      this.setState({
        disableConfirmButton: !selectedTag.title,
        title: selectedTag.title,
        color: selectedTag.color,
        textcolor: selectedTag.textcolor,
        modifiedDate: selectedTag.modified_date
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
      this.setState({ inputError: false, disableConfirmButton: false });
    } else {
      this.setState({ inputError: true, disableConfirmButton: true });
    }
  }

  onConfirm = () => {
    if (!this.state.disableConfirmButton &&
         this.props.editTag &&
         this.props.selectedTagGroupEntry &&
         this.props.selectedTag
    ) {
      this.props.editTag({
        ...this.props.selectedTag,
        title: this.state.title,
        color: this.state.color,
        textcolor: this.state.textcolor,
      }, this.props.selectedTagGroupEntry.uuid);
      this.setState({ inputError: false, disableConfirmButton: true });
      this.props.onClose();
    }
  };

  toggleDefaultTagBackgroundColorPicker = () => {
    this.setState({
      displayColorPicker: !this.state.displayColorPicker
    });
  };

  toggleDefaultTagTextColorPicker = () => {
    this.setState({
      displayTextColorPicker: !this.state.displayTextColorPicker
    });
  };

  handleChangeColor = (color: string) => {
    this.setState({ color });
  };

  handleChangeTextColor = (color: string) => {
    this.setState({ textcolor: color });
  };

  renderTitle = () => (
    <DialogTitle style={{ overflow: 'visible' }}>{i18n.t('core:editTagTitle')}{` '${this.state.title}'`}</DialogTitle>
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
        background: color,
      },
      textcolor: {
        width: '100%',
        height: 30,
        borderRadius: 2,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'gray',
        padding: '5px',
        background: textcolor,
      },
      helpText: {
        marginBottom: '5px',
        fontSize: '1rem'
      },
    };


    console.log('Mod ' + modifiedDate);
    return (
      <DialogContent style={{ overflow: 'visible' }}>
        <FormControl
          fullWidth={true}
          error={this.state.inputError}
          style={{ overflow: 'visible' }}
        >
          {modifiedDate && (
            <div className="tag-date" style={{ fontSize: 12, position: 'relative', bottom: 20, color: '#808080' }}>
              <span className="text" style={{ fontWeight: 600 }}>{`${i18n.t('core:modifiedDate')}: `}</span>
              <time>{format(new Date(modifiedDate), 'yyyy-mm-dd')}</time>
            </div>
          )}
          <TextField
            error={this.state.inputError}
            margin="dense"
            name="title"
            label={i18n.t('core:editTag')}
            onChange={this.handleInputChange}
            value={this.state.title}
            data-tid="editTagInput"
            fullWidth={true}
          />
          {this.state.inputError && <FormHelperText style={styles.helpText}>{i18n.t('core:tagTitleHelper')}</FormHelperText>}
        </FormControl>
        <FormControl
          fullWidth={true}
        >
          <FormHelperText style={styles.helpText}>{i18n.t('core:tagBackgroundColor')}</FormHelperText>
          <TransparentBackground>
            <Button
              onClick={this.toggleDefaultTagBackgroundColorPicker}
              data-tid="tagBackgroundColorEditTagDialog"
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
              data-tid="tagForegroundColorEditTagDialog"
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
        data-tid="closeEditTagDialog"
        color="primary"
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        disabled={this.state.disableConfirmButton}
        onClick={this.onConfirm}
        data-tid="editTagConfirm"
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

export default EditTagDialog;
