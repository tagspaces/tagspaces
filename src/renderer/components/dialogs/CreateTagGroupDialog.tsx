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

import AppConfig from '-/AppConfig';
import DraggablePaper from '-/components/DraggablePaper';
import { ProLabel } from '-/components/HelperComponents';
import Tag from '-/components/Tag';
import TransparentBackground from '-/components/TransparentBackground';
import TsButton from '-/components/TsButton';
import TsSelect from '-/components/TsSelect';
import TsTextField from '-/components/TsTextField';
import ColorPickerDialog from '-/components/dialogs/ColorPickerDialog';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { Pro } from '-/pro';
import { getSaveTagInLocation } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { useTheme } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import React, {
  ChangeEvent,
  useContext,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import WorkSpacesDropdown from '-/components/dialogs/components/WorkSpacesDropdown';

interface Props {
  open: boolean;
  onClose: () => void;
  createTagGroup: (tagGroup: TS.TagGroup) => void;
  color: string;
  textcolor: string;
}

const defaultTagGroupLocation = 'TAG_LIBRARY';

function CreateTagGroupDialog(props: Props) {
  const { t } = useTranslation();
  const { open, onClose, createTagGroup } = props;
  const { locations } = useCurrentLocationContext();
  //const locations = useSelector(getLocations);
  const saveTagsInLocation = useSelector(getSaveTagInLocation);

  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const [displayTextColorPicker, setDisplayTextColorPicker] =
    useState<boolean>(false);
  const [inputError, setInputError] = useState<boolean>(false);

  const title = useRef<string>('');
  const disableConfirmButton = useRef<boolean>(true);
  const color = useRef<string>(props.color);
  const textcolor = useRef<string>(props.textcolor);
  const locationId = useRef<string>(defaultTagGroupLocation);
  const [workSpaceId, setWorkSpaceId] = useState<string>('');
  // eslint-disable-next-line no-unused-vars
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  const workSpacesContext = Pro?.contextProviders?.WorkSpacesContext
    ? useContext<TS.WorkSpacesContextData>(
        Pro.contextProviders.WorkSpacesContext,
      )
    : undefined;
  const workSpaces = workSpacesContext?.getWorkSpaces() ?? [];

  const handleTagGroupTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
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
    let lId;
    if (saveTagsInLocation && locationId.current !== defaultTagGroupLocation) {
      lId = locationId.current;
    }

    if (!disableConfirmButton.current) {
      createTagGroup({
        uuid: getUuid(),
        title: title.current,
        color: color.current,
        textcolor: textcolor.current,
        locationId: lId,
        ...(workSpaceId && { workSpaceId }),
        children: [],
      });
      onClose();
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

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const okButton = (
    <TsButton
      disabled={disableConfirmButton.current}
      onClick={onConfirm}
      variant="contained"
      data-tid="createTagGroupConfirmButton"
      style={
        {
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties & { WebkitAppRegion?: string }
      }
    >
      {t('core:ok')}
    </TsButton>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      keepMounted
      scroll="paper"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        } /*else if (event.key === 'Escape') {
          onClose();
        }*/
      }}
    >
      <TsDialogTitle
        dialogTitle={t('core:createTagGroupTitle')}
        closeButtonTestId="closeCreateTagGroupTID"
        onClose={onClose}
        actionSlot={okButton}
      />
      <DialogContent
        style={{ overflowY: 'visible', overflowX: 'hidden', minWidth: 300 }}
      >
        <FormControl fullWidth={true} error={inputError}>
          <TsTextField
            error={inputError}
            autoFocus
            name="title"
            label={t('core:createTagGroupName')}
            defaultValue={title.current}
            onChange={handleTagGroupTitleChange}
            data-tid="createTagGroupInput"
          />
          {inputError && (
            <FormHelperText>{t('core:taggroupTitleHelper')}</FormHelperText>
          )}
        </FormControl>
        {saveTagsInLocation && (
          <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
            <TsSelect
              data-tid="tagGroupLocationTID"
              label={t('core:tagGroupLocation')}
              defaultValue={defaultTagGroupLocation}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                locationId.current = event.target.value;
                // rerender
                forceUpdate();
              }}
            >
              <MenuItem
                key={defaultTagGroupLocation}
                value={defaultTagGroupLocation}
                data-tid="tagLibraryTID"
              >
                {t('tagLibrary')}
              </MenuItem>
              {locations.map((location) => (
                <MenuItem
                  key={location.uuid}
                  value={location.uuid}
                  data-tid={'tglocation_' + location.name}
                >
                  {t('core:location') + ': ' + location.name}
                </MenuItem>
              ))}
            </TsSelect>
          </ListItem>
        )}
        <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
          <WorkSpacesDropdown
            disabled={!Pro}
            dataTid="createTgWorkspaceTID"
            workSpaceId={workSpaceId}
            setWorkSpaceId={setWorkSpaceId}
            workSpaces={workSpaces}
            label={
              <>
                {t('core:workspace')}
                <ProLabel />
              </>
            }
            onOpenNewWorkspace={() =>
              workSpacesContext.openNewWorkspaceDialog()
            }
          />
        </ListItem>
        <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
          <ListItemText primary={t('core:tagBackgroundColor')} />
          <TransparentBackground>
            <TsButton
              onClick={toggleDefaultTagBackgroundColorPicker}
              data-tid="createTagGroupBackgroundColor"
              style={{
                height: 30,
                borderRadius: AppConfig.defaultCSSRadius,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: 'gray',
                padding: '5px',
                background: color.current,
              }}
              role="presentation"
            >
              &nbsp;
            </TsButton>
          </TransparentBackground>
          {displayColorPicker && (
            <ColorPickerDialog
              open={displayColorPicker}
              setColor={handleChangeColor}
              onClose={toggleDefaultTagBackgroundColorPicker}
              color={color.current}
            />
          )}
        </ListItem>
        <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
          <ListItemText primary={t('core:tagForegroundColor')} />
          <TransparentBackground>
            <TsButton
              onClick={toggleDefaultTagTextColorPicker}
              data-tid="createTagGroupForegroundColor"
              style={{
                height: 30,
                borderRadius: AppConfig.defaultCSSRadius,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: 'gray',
                padding: '5px',
                background: textcolor.current,
              }}
              role="presentation"
            >
              &nbsp;
            </TsButton>
          </TransparentBackground>
          {displayTextColorPicker && (
            <ColorPickerDialog
              open={displayTextColorPicker}
              setColor={handleChangeTextColor}
              onClose={toggleDefaultTagTextColorPicker}
              color={textcolor.current}
            />
          )}
        </ListItem>
        <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
          <ListItemText primary={t('core:tagPreview')} />
          <Tag
            backgroundColor={color.current}
            textColor={textcolor.current}
            isDragging={false}
          >
            <span style={{ textTransform: 'lowercase' }}>
              {t('core:tagPreview')}
            </span>
            <span style={{ margin: 3 }} />
          </Tag>
        </ListItem>
      </DialogContent>
      {!smallScreen && (
        <TsDialogActions>
          <TsButton data-tid="createTagGroupCancelButton" onClick={onClose}>
            {t('core:cancel')}
          </TsButton>
          {okButton}
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default CreateTagGroupDialog;
