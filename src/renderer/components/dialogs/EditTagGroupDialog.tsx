/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import React, { ChangeEvent, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText/ListItemText';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import { useSelector } from 'react-redux';
import ColorPickerDialog from './ColorPickerDialog';
import TransparentBackground from '../TransparentBackground';
import { TS } from '-/tagspaces.namespace';
import { Pro } from '-/pro';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import TsTextField from '-/components/TsTextField';
import TsSelect from '-/components/TsSelect';
import Tag from '-/components/Tag';
import { getSaveTagInLocation } from '-/reducers/settings';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { CommonLocation } from '-/utils/CommonLocation';
import { useTagGroupsLocationContext } from '-/hooks/useTagGroupsLocationContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';

const defaultTagGroupLocation = 'TAG_LIBRARY';

interface Props {
  open: boolean;
  selectedTagGroupEntry: TS.TagGroup;
  onClose: () => void;
}

function EditTagGroupDialog(props: Props) {
  const { selectedTagGroupEntry, open, onClose } = props;

  const { locations, findLocation } = useCurrentLocationContext();
  const { updateTagGroup } = useTaggingActionsContext();
  const { removeLocationTagGroup } = useTagGroupsLocationContext();
  const { t } = useTranslation();
  //const locations: Array<CommonLocation> = useSelector(getLocations);
  const saveTagInLocation: boolean = useSelector(getSaveTagInLocation);
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const [displayTextColorPicker, setDisplayTextColorPicker] =
    useState<boolean>(false);
  const [inputError, setInputError] = useState<boolean>(false);
  const [applyChanges, setApplyChanges] = useState<boolean>(false);
  const [locationId, setLocationId] = useState<string>(
    selectedTagGroupEntry.locationId ?? defaultTagGroupLocation,
  );
  const [title, setTitle] = useState<string>(selectedTagGroupEntry.title);
  const [color, setColor] = useState<string>(selectedTagGroupEntry.color);
  const [textcolor, setTextcolor] = useState<string>(
    selectedTagGroupEntry.textcolor,
  );

  useEffect(() => {
    handleValidation();
  }, [title]);

  const handleTagGroupTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'title') {
      setTitle(value);
    }
  };

  const handleValidation = () => {
    if (title && title.length > 0) {
      setInputError(false);
    } else {
      setInputError(true);
    }
  };

  const disableConfirmButton = () => inputError;

  const onConfirm = () => {
    if (disableConfirmButton()) {
      return;
    }

    if (selectedTagGroupEntry && selectedTagGroupEntry.children) {
      if (Pro && locationId !== selectedTagGroupEntry.locationId) {
        const location: CommonLocation = findLocation(
          selectedTagGroupEntry.locationId,
        );
        if (location) {
          removeLocationTagGroup(location, selectedTagGroupEntry.uuid);
        }
      }
      updateTagGroup({
        ...selectedTagGroupEntry,
        title,
        color,
        textcolor,
        locationId,
        modified_date: new Date().getTime(),
        children: selectedTagGroupEntry.children.map((tag) => ({
          ...tag,
          color: applyChanges ? color : tag.color,
          textcolor: applyChanges ? textcolor : tag.textcolor,
          style: tag.style,
        })),
      });
      onClose();
    }
  };

  const renderTitle = () => (
    <DialogTitle style={{ overflow: 'visible' }}>
      {t('core:editTagGroupTitle')}{' '}
      <Tag backgroundColor={color} textColor={textcolor} isDragging={false}>
        tag-preview
        <span style={{ margin: 3 }} />
      </Tag>
      <DialogCloseButton testId="closeEditTagGroupTID" onClose={onClose} />
    </DialogTitle>
  );

  const renderContent = () => {
    return (
      <DialogContent style={{ overflow: 'visible' }}>
        <FormControl
          fullWidth={true}
          error={inputError}
          style={{ overflow: 'visible' }}
        >
          <TsTextField
            error={inputError}
            name="title"
            autoFocus
            label={t('core:editTagGroupNewName')}
            onChange={handleTagGroupTitleChange}
            value={title}
            data-tid="editTagGroupInput"
          />
          {inputError && (
            <FormHelperText>{t('core:taggroupTitleHelper')}</FormHelperText>
          )}
        </FormControl>
        {saveTagInLocation && (
          <FormControl fullWidth={true} error={inputError}>
            <FormHelperText style={{ marginLeft: 0, marginTop: 0 }}>
              {t('core:tagGroupLocation')}
            </FormHelperText>
            <TsSelect
              fullWidth={false}
              defaultValue={locationId}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setLocationId(event.target.value);
              }}
            >
              <MenuItem
                key={defaultTagGroupLocation}
                value={defaultTagGroupLocation}
              >
                {t('core:tagLibrary')}
              </MenuItem>
              {locations.map((location) => (
                <MenuItem key={location.uuid} value={location.uuid}>
                  {t('core:location') + ': ' + location.name}
                </MenuItem>
              ))}
            </TsSelect>
          </FormControl>
        )}
        <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
          <ListItemText primary={t('tagBackgroundColor')} />
          <TransparentBackground>
            <Button
              onClick={() => setDisplayColorPicker(!displayColorPicker)}
              data-tid="editTagGroupBackgroundColor"
              style={{
                height: 30,
                borderRadius: 2,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: 'gray',
                padding: '5px',
                background: color,
              }}
            >
              &nbsp;
            </Button>
          </TransparentBackground>
          {displayColorPicker && (
            <ColorPickerDialog
              open={displayColorPicker}
              setColor={(value) => setColor(value)}
              onClose={() => setDisplayColorPicker(false)}
              color={color}
            />
          )}
        </ListItem>
        <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
          <ListItemText primary={t('core:tagForegroundColor')} />
          <TransparentBackground>
            <Button
              onClick={() => setDisplayTextColorPicker(!displayTextColorPicker)}
              data-tid="editTagGroupForegroundColor"
              style={{
                height: 30,
                borderRadius: 2,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: 'gray',
                padding: '5px',
                background: textcolor,
              }}
              role="presentation"
            >
              &nbsp;
            </Button>
          </TransparentBackground>
          {displayTextColorPicker && (
            <ColorPickerDialog
              open={displayTextColorPicker}
              setColor={(txtcolor) => setTextcolor(txtcolor)}
              onClose={() => setDisplayTextColorPicker(!displayTextColorPicker)}
              color={textcolor}
            />
          )}
        </ListItem>
        <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
          <ListItemText primary={t('core:colorChangesToAllTags')} />
          <Switch
            data-tid="editTagGroupSwitch"
            onClick={() => setApplyChanges(!applyChanges)}
            checked={applyChanges}
          />
        </ListItem>
      </DialogContent>
    );
  };

  const renderActions = () => (
    <DialogActions>
      <Button onClick={onClose}>{t('core:cancel')}</Button>
      <Button
        disabled={disableConfirmButton()}
        onClick={onConfirm}
        data-tid="editTagGroupConfirmButton"
        color="primary"
        variant="contained"
      >
        {t('core:ok')}
      </Button>
    </DialogActions>
  );

  // const theme = useTheme();
  // const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      // fullScreen={fullScreen}
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        } /*else if (event.key === 'Escape') {
          props.onClose();
        }*/
      }}
    >
      {renderTitle()}
      {renderContent()}
      {renderActions()}
    </Dialog>
  );
}

export default EditTagGroupDialog;
