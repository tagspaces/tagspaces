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

import React, { ChangeEvent, useReducer, useRef, useState } from 'react';
import uuidv1 from 'uuid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Dialog from '@material-ui/core/Dialog';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { connect } from 'react-redux';
import ColorPickerDialog from './ColorPickerDialog';
import i18n from '-/services/i18n';
import TransparentBackground from '../TransparentBackground';
import { TS } from '-/tagspaces.namespace';
import { getLocations } from '-/reducers/locations';
import { getCurrentLocationId } from '-/reducers/app';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

interface Props {
  open: boolean;
  onClose: () => void;
  createTagGroup: (tagGroup: TS.TagGroup) => void;
  fullScreen?: boolean;
  color: string;
  textcolor: string;
  currentLocationId: string | null;
  locations: Array<TS.Location>;
  saveTagInLocation: boolean;
}

const CreateTagGroupDialog = (props: Props) => {
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const [displayTextColorPicker, setDisplayTextColorPicker] = useState<boolean>(
    false
  );
  const [inputError, setInputError] = useState<boolean>(false);

  const title = useRef<string>('');
  const disableConfirmButton = useRef<boolean>(true);
  const color = useRef<string>(props.color);
  const textcolor = useRef<string>(props.textcolor);
  const locationId = useRef<string>(props.currentLocationId);
  // eslint-disable-next-line no-unused-vars
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  const handleTagGroupTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'title') {
      title.current = value;
      handleValidation();
    }
  };

  const handleValidation = () => {
    if (title.current.length > 0) {
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
      props.createTagGroup({
        uuid: uuidv1(),
        title: title.current,
        color: color.current,
        textcolor: textcolor.current,
        locationId: locationId.current,
        children: []
      });
      props.onClose();
    }
  };

  const toggleDefaultTagBackgroundColorPicker = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const toggleDefaultTagTextColorPicker = () => {
    setDisplayTextColorPicker(!displayTextColorPicker);
  };

  const handleChangeColor = (value: string) => {
    color.current = value;
  };

  const handleChangeTextColor = (value: string) => {
    textcolor.current = value;
  };

  const { fullScreen, open, onClose } = props;

  const styles = {
    color: {
      width: '100%',
      height: 30,
      borderRadius: 2,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'gray',
      background: color.current
    },
    textcolor: {
      width: '100%',
      height: 30,
      borderRadius: 2,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'gray',
      background: textcolor.current
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
          onConfirm();
        } else if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      <DialogTitle>
        {i18n.t('core:createTagGroupTitle')}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        {props.saveTagInLocation && (
          <FormControl fullWidth={true} error={inputError}>
            <Select
              defaultValue={locationId.current}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                locationId.current = event.target.value;
                // rerender
                forceUpdate();
              }}
            >
              {props.locations.map(location => (
                <MenuItem key={location.uuid} value={location.uuid}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {i18n.t('core:tagGroupLocationHelper')}
            </FormHelperText>
          </FormControl>
        )}
        <FormControl fullWidth={true} error={inputError}>
          <TextField
            fullWidth={true}
            error={inputError}
            autoFocus
            name="title"
            label={i18n.t('core:createTagGroupName')}
            defaultValue={title.current}
            onChange={handleTagGroupTitleChange}
            data-tid="createTagGroupInput"
          />
          {inputError && (
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
              onClick={toggleDefaultTagBackgroundColorPicker}
              data-tid="createTagGroupBackgroundColor"
              style={styles.color}
              role="presentation"
            >
              &nbsp;
            </Button>
          </TransparentBackground>
          {displayColorPicker && (
            <ColorPickerDialog
              open={displayColorPicker}
              setColor={handleChangeColor}
              onClose={toggleDefaultTagBackgroundColorPicker}
              color={color.current}
            />
          )}
        </FormControl>
        <FormControl fullWidth={true}>
          <FormHelperText style={styles.helpText}>
            {i18n.t('core:tagForegroundColor')}
          </FormHelperText>
          <TransparentBackground>
            <Button
              onClick={toggleDefaultTagTextColorPicker}
              data-tid="createTagGroupForegroundColor"
              style={styles.textcolor}
              role="presentation"
            >
              &nbsp;
            </Button>
          </TransparentBackground>
          {displayTextColorPicker && (
            <ColorPickerDialog
              open={displayTextColorPicker}
              setColor={handleChangeTextColor}
              onClose={toggleDefaultTagTextColorPicker}
              color={textcolor.current}
            />
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button data-tid="createTagGroupCancelButton" onClick={props.onClose}>
          {i18n.t('core:cancel')}
        </Button>
        <Button
          disabled={disableConfirmButton.current}
          onClick={onConfirm}
          data-tid="createTagGroupConfirmButton"
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function mapStateToProps(state) {
  return {
    locations: getLocations(state),
    currentLocationId: getCurrentLocationId(state),
    saveTagInLocation: state.settings.saveTagInLocation
  };
}

export default connect(mapStateToProps)(CreateTagGroupDialog);
