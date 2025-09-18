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

import Tag from '-/components/Tag';
import TsButton from '-/components/TsButton';
import TsSelect from '-/components/TsSelect';
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useTagGroupsLocationContext } from '-/hooks/useTagGroupsLocationContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { Pro } from '-/pro';
import { getSaveTagInLocation } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { useMediaQuery, useTheme } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import TransparentBackground from '../TransparentBackground';
import ColorPickerDialog from './ColorPickerDialog';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import TsIconButton from '-/components/TsIconButton';
import { RemoveIcon } from '-/components/CommonIcons';

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
  const saveTagInLocation: boolean = useSelector(getSaveTagInLocation);
  const [workSpaceId, setWorkSpaceId] = useState<string>(
    selectedTagGroupEntry ? selectedTagGroupEntry.workSpaceId || '' : '',
  );
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const [displayTextColorPicker, setDisplayTextColorPicker] =
    useState<boolean>(false);
  const [inputError, setInputError] = useState<boolean>(false);
  const [applyChanges, setApplyChanges] = useState<boolean>(false);
  const [newLocationId, setNewLocationId] = useState<string>(undefined);
  //selectedTagGroupEntry.locationId ?? defaultTagGroupLocation,
  const [title, setTitle] = useState<string>(selectedTagGroupEntry.title);
  const [color, setColor] = useState<string>(selectedTagGroupEntry.color);
  const [textcolor, setTextcolor] = useState<string>(
    selectedTagGroupEntry.textcolor,
  );
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const workSpacesContext = Pro?.contextProviders?.WorkSpacesContext
    ? useContext<TS.WorkSpacesContextData>(
        Pro.contextProviders.WorkSpacesContext,
      )
    : undefined;
  const workSpaces = workSpacesContext.getWorkSpaces();

  useEffect(() => {
    setNewLocationId(undefined);
  }, [selectedTagGroupEntry]);

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

  function isLocationChanged() {
    return (
      newLocationId !== undefined &&
      newLocationId !== selectedTagGroupEntry.locationId
    );
  }

  const onConfirm = async () => {
    if (disableConfirmButton()) {
      return;
    }

    if (selectedTagGroupEntry && selectedTagGroupEntry.children) {
      if (
        Pro &&
        isLocationChanged() &&
        selectedTagGroupEntry.locationId !== undefined
      ) {
        // remove old location
        const location: CommonLocation = findLocation(
          selectedTagGroupEntry.locationId,
        );
        if (location) {
          await removeLocationTagGroup(location, selectedTagGroupEntry.uuid);
        }
      }
      updateTagGroup({
        ...selectedTagGroupEntry,
        title,
        color,
        textcolor,
        ...(workSpaceId && { workSpaceId }),
        ...(isLocationChanged() && {
          locationId:
            newLocationId === defaultTagGroupLocation
              ? undefined
              : newLocationId,
        }),
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

  const okButton = (
    <TsButton
      disabled={disableConfirmButton()}
      onClick={onConfirm}
      data-tid="editTagGroupConfirmButton"
      variant="contained"
      style={{
        // @ts-ignore
        WebkitAppRegion: 'no-drag',
      }}
    >
      {t('core:ok')}
    </TsButton>
  );

  const renderContent = (
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
            defaultValue={
              selectedTagGroupEntry.locationId || defaultTagGroupLocation
            }
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setNewLocationId(event.target.value);
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
          <TsButton
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
          </TsButton>
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
          <TsButton
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
          </TsButton>
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
        <ListItemText primary={t('core:tagPreview')} />
        <Tag backgroundColor={color} textColor={textcolor} isDragging={false}>
          <span style={{ textTransform: 'lowercase' }}>
            {t('core:tagPreview')}
          </span>
          <span style={{ margin: 3 }} />
        </Tag>
      </ListItem>
      <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
        <ListItemText primary={t('core:colorChangesToAllTags')} />
        <Switch
          data-tid="editTagGroupSwitch"
          onClick={() => setApplyChanges(!applyChanges)}
          checked={applyChanges}
        />
      </ListItem>
      <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
        <ListItemText primary={t('core:workSpaces')} />
        <TsSelect
          disabled={!Pro}
          sx={{ minWidth: 200 }}
          data-tid="locationTypeTID"
          value={workSpaceId}
          label={t('core:workSpaces')}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setWorkSpaceId(event.target.value)
          }
          slotProps={{
            input: {
              endAdornment: workSpaceId && (
                <InputAdornment position="end" sx={{ ml: -12 }}>
                  <TsIconButton
                    aria-label={t('core:deleteWSpace')}
                    onClick={() => setWorkSpaceId(undefined)}
                    data-tid="wSpaceResetTID"
                  >
                    <RemoveIcon />
                  </TsIconButton>
                </InputAdornment>
              ),
            },
          }}
        >
          {workSpaces.map((wSpace) => (
            <MenuItem
              key={wSpace.uuid}
              value={wSpace.uuid}
              data-tid={'wSpace' + wSpace.shortName + 'TID'}
            >
              {wSpace.shortName + '(' + wSpace.fullName + ')'}
            </MenuItem>
          ))}
        </TsSelect>
      </ListItem>
    </DialogContent>
  );

  return (
    <Dialog
      open={open}
      fullScreen={smallScreen}
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
      <TsDialogTitle
        dialogTitle={t('core:editTagGroupTitle')}
        closeButtonTestId="closeEditTagGroupTID"
        onClose={onClose}
        actionSlot={okButton}
      ></TsDialogTitle>
      {renderContent}
      {!smallScreen && (
        <TsDialogActions>
          <TsButton onClick={onClose}>{t('core:cancel')}</TsButton>
          {okButton}
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default EditTagGroupDialog;
