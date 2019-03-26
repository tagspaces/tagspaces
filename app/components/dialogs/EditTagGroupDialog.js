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

import React, { useState } from 'react';
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
  // classes: Object,
  open?: boolean,
  editTagGroup: (tagGroup: TagGroup) => void,
  selectedTagGroupEntry?: TagGroup,
  onClose: () => void
};

const EditTagGroupDialog = (props: Props) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [displayTextColorPicker, setDisplayTextColorPicker] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [applyChanges, setApplyChanges] = useState(false);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('');
  const [textcolor, setTextcolor] = useState('');
  const [modifiedDate, setModifiedData] = useState('');
  const [name, setName] = useState(target.name);

  /* componentWillReceiveProps = ({ open, selectedTagGroupEntry }) => {
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
  } */

  function componentWillReceiveProps({ open, selectedTagGroupEntry }) {
    if (open === true) {
      setDisplayTextColorPicker(!selectedTagGroupEntry.title);
      setApplyChanges(false);
      setTitle(selectedTagGroupEntry.title);
      setColor(selectedTagGroupEntry.color);
      setTextcolor(selectedTagGroupEntry.textcolor);
      setModifiedData(selectedTagGroupEntry.modified_date);
    }
  }

  /*
  function handleInputChange(event: Object) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    }, handleValidation);
  } */

  function handleInputChange(event: Object) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    setName({
      [name]: value
    }, handleValidation);
  }

  function handleValidation() {
    if (title && title.length > 0) {
      setInputError(false);
      setDisableConfirmButton(false);
    } else {
      setInputError(true);
      setDisableConfirmButton(true);
    }
  }

  function onConfirm() {
    const { selectedTagGroupEntry } = props;
    if (disableConfirmButton) {
      return;
    }

    if (selectedTagGroupEntry && selectedTagGroupEntry.children) {
      props.editTagGroup({
        ...selectedTagGroupEntry,
        title,
        color,
        textcolor,
        children: selectedTagGroupEntry.children.map((tag) => ({
          ...tag,
          color: applyChanges ? color : tag.color,
          textcolor: applyChanges ? textcolor : tag.textcolor,
          style: tag.style
        }))
      });
      setInputError(false);
      setDisableConfirmButton(true);
      props.onClose();
    }
  }

  function toggleDefaultTagBackgroundColorPicker() {
    setDisplayColorPicker(!displayColorPicker);
  }

  function toggleDefaultTagTextColorPicker() {
    setDisplayTextColorPicker(!displayTextColorPicker);
  }

  function handleChangeColor() {
    setColor(color);
  }

  function handleChangeTextColor() {
    setTextcolor(color);
  }

  /*  setApplyChanges = (applyColorChanges: boolean) => {
      this.setState({ applyChanges: applyColorChanges });
  };  */

  function setApplyChanges(applyColorChanges: boolean) {
    setApplyChanges(applyColorChanges);
  }

  function renderTitle() {
    return (
      <DialogTitle style={{ overflow: 'visible' }}>{i18n.t('core:editTagGroupTitle')}{`'${title}'`}</DialogTitle>
    );
  }

  /*  renderContent = () => {
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
      };  */

  function renderContent() {
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
          error={inputError}
          style={{ overflow: 'visible' }}
        >
          {modifiedDate !== '' && (
            <div className="tag-date" style={{ fontSize: 12, position: 'relative', bottom: 20, color: '#808080' }}>
              <span className="text" style={{ fontWeight: 600 }}>{`${i18n.t('core:modifiedDate')}: `}</span>
              <time>{moment(modifiedDate).format('MMM. DD, YYYY')}</time>
            </div>
          )}
          <TextField
            error={inputError}
            margin="dense"
            name="title"
            label={i18n.t('core:editTagGroupNewName')}
            onChange={handleInputChange}
            value={title}
            data-tid="editTagGroupInput"
            fullWidth={true}
          />
          {inputError && <FormHelperText>{i18n.t('core:taggroupTitleHelper')}</FormHelperText>}
        </FormControl>
        <FormControl
          fullWidth={true}
        >
          <FormHelperText style={styles.helpText}>{i18n.t('core:tagBackgroundColor')}</FormHelperText>
          <TransparentBackground>
            <Button
              onClick={toggleDefaultTagBackgroundColorPicker}
              data-tid="editTagGroupBackgroundColor"
              style={styles.color}
            >&nbsp;
            </Button>
          </TransparentBackground>
          <ColorPickerDialog
            open={displayColorPicker}
            setColor={handleChangeColor}
            onClose={toggleDefaultTagBackgroundColorPicker}
            color={color}
          />
        </FormControl>
        <FormControl
          fullWidth={true}
        >
          <FormHelperText style={styles.helpText}>{i18n.t('core:tagForegroundColor')}</FormHelperText>
          <TransparentBackground>
            <Button
              onClick={toggleDefaultTagTextColorPicker}
              data-tid="editTagGroupForegroundColor"
              style={styles.textcolor}
              role="presentation"
            >&nbsp;
            </Button>
          </TransparentBackground>
          <ColorPickerDialog
            open={displayTextColorPicker}
            setColor={handleChangeTextColor}
            onClose={toggleDefaultTagTextColorPicker}
            color={textcolor}
          />
        </FormControl>
        <FormControl>
          <FormHelperText style={styles.helpText}>{i18n.t('core:colorChangesToAllTags')}</FormHelperText>
          <Switch
            data-tid="editTagGroupSwitch"
            onClick={() => setApplyChanges(!applyChanges)}
            checked={applyChanges}
          />
        </FormControl>
      </DialogContent>
    );
  }

  function renderActions() {
    return (
      <DialogActions>
        <Button
          onClick={props.onClose}
          color="primary"
        >
          {i18n.t('core:cancel')}
        </Button>
        <Button
          disabled={disableConfirmButton}
          onClick={onConfirm}
          data-tid="editTagGroupConfirmButton"
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    );
  }

  return (
    <GenericDialog
      open={props.open}
      onClose={props.onClose}
      onEnterKey={(event) => onEnterKeyHandler(event, onConfirm)}
      renderTitle={renderTitle}
      renderContent={renderContent}
      renderActions={renderActions}
    />
  );
};

export default EditTagGroupDialog;
