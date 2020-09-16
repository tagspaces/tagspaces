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
import format from 'date-fns/format';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Dialog from '@material-ui/core/Dialog';
import ColorPickerDialog from './ColorPickerDialog';
import TransparentBackground from '../TransparentBackground';
import i18n from '-/services/i18n';
import { Tag, TagGroup } from '-/reducers/taglibrary';

interface Props {
  open: boolean;
  fullScreen?: boolean;
  onClose: () => void;
  editTag: (tag: Tag, tagGroupId: string, origTitle: string) => void;
  selectedTag: Tag;
  selectedTagGroupEntry: TagGroup;
}

interface State {
  inputError: boolean;
  displayColorPicker: boolean;
  displayTextColorPicker: boolean;
  disableConfirmButton: boolean;
  title: string;
  origTitle: string;
  color: string;
  textcolor: string;
  modifiedDate: string;
}

class EditTagDialog extends React.Component<Props, State> {
  state = {
    displayColorPicker: false,
    displayTextColorPicker: false,
    inputError: false,
    disableConfirmButton: true,
    origTitle: '',
    title: '',
    color: '',
    textcolor: '',
    modifiedDate: ''
  };

  componentWillReceiveProps = ({ open, selectedTag }: Props) => {
    if (open === true) {
      this.setState({
        disableConfirmButton: !selectedTag.title,
        origTitle: selectedTag.title,
        title: selectedTag.title,
        color: selectedTag.color,
        textcolor: selectedTag.textcolor,
        modifiedDate: selectedTag.modified_date
      });
    }
  };

  handleTagTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'title') {
      this.setState({ title: value }, this.handleValidation);
    }
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
    if (
      !this.state.disableConfirmButton &&
      this.props.editTag &&
      this.props.selectedTagGroupEntry &&
      this.props.selectedTag
    ) {
      this.props.editTag(
        {
          ...this.props.selectedTag,
          title: this.state.title,
          color: this.state.color,
          textcolor: this.state.textcolor
        },
        this.props.selectedTagGroupEntry.uuid,
        this.state.origTitle
      );
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

  render() {
    const { color, textcolor, modifiedDate } = this.state;
    const { fullScreen, open, onClose } = this.props;
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
      }
    };

    return (
      <Dialog
        open={open}
        fullScreen={fullScreen}
        onClose={onClose}
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
        <DialogTitle style={{ overflow: 'visible' }}>
          {i18n.t('core:editTagTitle')}
          {` '${this.state.title}'`}
        </DialogTitle>
        <DialogContent style={{ overflow: 'visible' }}>
          <FormControl
            fullWidth={true}
            error={this.state.inputError}
            style={{ overflow: 'visible' }}
          >
            {modifiedDate && (
              <div
                className="tag-date"
                style={{
                  fontSize: 12,
                  position: 'relative',
                  bottom: 20,
                  color: '#808080'
                }}
              >
                <span className="text" style={{ fontWeight: 600 }}>
                  {`${i18n.t('core:modifiedDate')}: `}
                </span>
                <time>{format(new Date(modifiedDate), 'yyyy-mm-dd')}</time>
              </div>
            )}
            <TextField
              error={this.state.inputError}
              margin="dense"
              name="title"
              autoFocus
              label={i18n.t('core:editTag')}
              onChange={this.handleTagTitleChange}
              value={this.state.title}
              data-tid="editTagInput"
              fullWidth={true}
            />
            {this.state.inputError && (
              <FormHelperText style={styles.helpText}>
                {i18n.t('core:tagTitleHelper')}
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
                data-tid="tagBackgroundColorEditTagDialog"
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
                data-tid="tagForegroundColorEditTagDialog"
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
      </Dialog>
    );
  }
}

export default EditTagDialog;
