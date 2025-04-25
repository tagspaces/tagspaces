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
import { BetaLabel } from '-/components/HelperComponents';
import InfoIcon from '-/components/InfoIcon';
import PerspectiveSelector from '-/components/PerspectiveSelector';
import TransparentBackground from '-/components/TransparentBackground';
import TsButton from '-/components/TsButton';
import TsSelect from '-/components/TsSelect';
import TsTextField from '-/components/TsTextField';
import TsToggleButton from '-/components/TsToggleButton';
import ColorPickerDialog from '-/components/dialogs/ColorPickerDialog';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { PerspectiveIDs } from '-/perspectives';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getFileNameTagPlace,
  getPersistTagsInSidecarFile,
  getSettings,
} from '-/reducers/settings';
import { setLanguage } from '-/services/utils-io';
import CheckIcon from '@mui/icons-material/Check';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

function SettingsGeneral() {
  const { i18n, t } = useTranslation();
  const { openCurrentDirectory } = useDirectoryContentContext();
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const [displayTextColorPicker, setDisplayTextColorPicker] =
    useState<boolean>(false);
  const dispatch: AppDispatch = useDispatch();
  const settings = useSelector(getSettings);
  const persistTagsInSidecarFile = useSelector(getPersistTagsInSidecarFile);
  const filenameTagPlacedAtEnd = useSelector(getFileNameTagPlace);

  const toggleDefaultTagBackgroundColorPicker = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const toggleDefaultTagTextColorPicker = () => {
    setDisplayTextColorPicker(!displayTextColorPicker);
  };

  const handleMaxSearchResult = (event) => {
    dispatch(SettingsActions.setMaxSearchResult(event.target.value));
  };

  const changePerspective = (event: any) => {
    const perspective = event.target.value;
    dispatch(SettingsActions.setDefaultPerspective(perspective));
  };

  let defaultPerspective = PerspectiveIDs.UNSPECIFIED;
  if (settings.defaultPerspective) {
    defaultPerspective = settings.defaultPerspective;
  }

  return (
    <List style={{ overflowX: 'hidden', overflowY: 'auto', height: '100%' }}>
      <ListItem>
        <ListItemText primary={t('core:interfaceLanguage')} />
        <TsSelect
          data-tid="settingsSetLanguage"
          fullWidth={false}
          value={settings.interfaceLanguage}
          onChange={(event: any) => {
            return i18n.changeLanguage(event.target.value).then(() => {
              dispatch(SettingsActions.setLanguage(event.target.value));
              setLanguage(event.target.value);
              return true;
            });
          }}
        >
          {settings.supportedLanguages.map((language) => (
            <MenuItem key={language.iso} value={language.iso}>
              {language.title}
            </MenuItem>
          ))}
        </TsSelect>
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:themeSelector')} />
        <TsSelect
          data-tid="settingsSetCurrentTheme"
          fullWidth={false}
          value={settings.currentTheme}
          onChange={(event: any) =>
            dispatch(SettingsActions.setCurrentTheme(event.target.value))
          }
        >
          {settings.supportedThemes.map((theme) => (
            <MenuItem key={theme} value={theme}>
              {theme === 'light' && t('core:regularScheme')}
              {theme === 'dark' && t('core:darkScheme')}
              {theme === 'system' && t('core:systemScheme')}
            </MenuItem>
          ))}
        </TsSelect>
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:themeRegularSelector')} />
        <TsSelect
          data-tid="settingsCurrentRegularThemeTID"
          fullWidth={false}
          value={settings.currentRegularTheme}
          onChange={(event: any) =>
            dispatch(SettingsActions.setCurrentRegularTheme(event.target.value))
          }
        >
          {settings.supportedRegularThemes.map((theme) => (
            <MenuItem key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </MenuItem>
          ))}
        </TsSelect>
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:themeDarkSelector')} />
        <TsSelect
          data-tid="settingsCurrentDarkThemeTID"
          fullWidth={false}
          value={settings.currentDarkTheme}
          onChange={(event: any) =>
            dispatch(SettingsActions.setCurrentDarkTheme(event.target.value))
          }
        >
          {settings.supportedDarkThemes.map((theme) => (
            <MenuItem key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </MenuItem>
          ))}
        </TsSelect>
      </ListItem>
      <ListItem>
        <ListItemText primary={t('createLocationDefaultPerspective')} />
        <PerspectiveSelector
          fullWidth={false}
          onChange={changePerspective}
          defaultValue={defaultPerspective}
          testId="changePerspectiveInSettingsTID"
        />
      </ListItem>
      <ListItem
        title={
          AppConfig.useSidecarsForFileTaggingDisableSetting
            ? t('core:settingExternallyConfigured')
            : ''
        }
      >
        <ListItemText primary={t('core:fileTaggingSetting')} />
        {AppConfig.useSidecarsForFileTaggingDisableSetting ? (
          <TsButton disabled>
            {persistTagsInSidecarFile
              ? t('core:useSidecarFile')
              : t('core:renameFile')}
          </TsButton>
        ) : (
          <ToggleButtonGroup
            value={persistTagsInSidecarFile}
            size="small"
            exclusive
          >
            <TsToggleButton
              value={false}
              data-tid="settingsSetPersistTagsInFileName"
              style={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
              onClick={() =>
                dispatch(SettingsActions.setPersistTagsInSidecarFile(false))
              }
            >
              <div style={{ display: 'flex', textTransform: 'unset' }}>
                {!persistTagsInSidecarFile && <CheckIcon />}
                &nbsp;{t('core:renameFile')}&nbsp;&nbsp;
                <InfoIcon tooltip={t('core:tagsInFilenameExplanation')} />
              </div>
            </TsToggleButton>
            <TsToggleButton
              value={true}
              data-tid="settingsSetPersistTagsInSidecarFile"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
              onClick={() =>
                dispatch(SettingsActions.setPersistTagsInSidecarFile(true))
              }
            >
              <div style={{ display: 'flex' }}>
                {persistTagsInSidecarFile && <CheckIcon />}
                &nbsp;{t('core:useSidecarFile')}&nbsp;&nbsp;
                <InfoIcon tooltip={t('core:tagsInSidecarFileExplanation')} />
              </div>
            </TsToggleButton>
          </ToggleButtonGroup>
        )}
      </ListItem>
      {!persistTagsInSidecarFile && (
        <ListItem>
          <ListItemText primary={t('core:fileNameTagSetting')} />
          <ToggleButtonGroup
            value={filenameTagPlacedAtEnd}
            size="small"
            exclusive
          >
            <TsToggleButton
              value={false}
              data-tid="fileNameBeginningTagTID"
              style={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
              onClick={() =>
                dispatch(SettingsActions.setFileNameTagPlace(false))
              }
            >
              <div style={{ display: 'flex' }}>
                {!filenameTagPlacedAtEnd && <CheckIcon />}
                &nbsp;{t('core:atTheBeginningOfFileName')}&nbsp;&nbsp;
                <InfoIcon
                  tooltip={t('core:fileNameBeginTagPlaceExplanation')}
                />
              </div>
            </TsToggleButton>
            <TsToggleButton
              value={true}
              data-tid="fileNameEndTagTID"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
              onClick={() =>
                dispatch(SettingsActions.setFileNameTagPlace(true))
              }
            >
              <div style={{ display: 'flex' }}>
                {filenameTagPlacedAtEnd && <CheckIcon />}
                &nbsp;{t('core:filenameTagPlacedAtEnd')}&nbsp;&nbsp;
                <InfoIcon tooltip={t('core:fileNameEndTagPlaceExplanation')} />
              </div>
            </TsToggleButton>
          </ToggleButtonGroup>
        </ListItem>
      )}

      <ListItem>
        <ListItemText primary={t('core:checkForNewVersionOnStartup')} />
        <Switch
          data-tid="settingsSetCheckForUpdates"
          onClick={() =>
            dispatch(
              SettingsActions.setCheckForUpdates(!settings.checkForUpdates),
            )
          }
          checked={settings.checkForUpdates}
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary={
            <>
              {t('core:reorderTags')}
              <BetaLabel />
            </>
          }
        />
        <Switch
          data-tid="reorderTagsTID"
          onClick={() =>
            dispatch(SettingsActions.reorderTags(!settings.reorderTags))
          }
          checked={settings.reorderTags}
        />
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:addTagsToLibrary')} />
        <Switch
          data-tid="settingsSetAddTagsToLibrary"
          onClick={() =>
            dispatch(
              SettingsActions.setAddTagsToLibrary(!settings.addTagsToLibrary),
            )
          }
          checked={settings.addTagsToLibrary}
        />
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:useOnlyTagsFromTagLibrary')} />
        <Switch
          disabled={AppConfig.useOnlyTagsFromTagLibrary !== undefined}
          data-tid="useOnlyTagsFromTagLibraryTID"
          onClick={() =>
            dispatch(
              SettingsActions.setUseOnlyTagsFromTagLibrary(
                !settings.useOnlyTagsFromTagLibrary,
              ),
            )
          }
          checked={
            AppConfig.useOnlyTagsFromTagLibrary !== undefined
              ? AppConfig.useOnlyTagsFromTagLibrary
              : settings.useOnlyTagsFromTagLibrary
          }
        />
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:useGenerateThumbnails')} />
        <Switch
          disabled={AppConfig.useGenerateThumbnails !== undefined}
          data-tid="settingsUseGenerateThumbnails"
          onClick={() =>
            dispatch(
              SettingsActions.setUseGenerateThumbnails(
                !settings.useGenerateThumbnails,
              ),
            )
          }
          checked={
            AppConfig.useGenerateThumbnails !== undefined
              ? AppConfig.useGenerateThumbnails
              : settings.useGenerateThumbnails
          }
        />
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:tagBackgroundColor')} />
        <TransparentBackground>
          <TsButton
            data-tid="settingsToggleDefaultTagBackgroundColor"
            style={{
              backgroundColor: settings.tagBackgroundColor,
              border: '1px solid lightgray',
            }}
            onClick={toggleDefaultTagBackgroundColorPicker}
          >
            &nbsp;
          </TsButton>
        </TransparentBackground>
        {displayColorPicker && (
          <ColorPickerDialog
            open={displayColorPicker}
            setColor={(color) => {
              dispatch(SettingsActions.setTagColor(color));
            }}
            onClose={toggleDefaultTagBackgroundColorPicker}
            color={settings.tagBackgroundColor}
          />
        )}
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:tagForegroundColor')} />
        <TransparentBackground>
          <TsButton
            data-tid="settingsToggleDefaultTagForegroundColor"
            style={{
              border: '1px solid lightgray',
              backgroundColor: settings.tagTextColor,
            }}
            onClick={toggleDefaultTagTextColorPicker}
          >
            &nbsp;
          </TsButton>
        </TransparentBackground>
        {displayTextColorPicker && (
          <ColorPickerDialog
            open={displayTextColorPicker}
            setColor={(color) => {
              dispatch(SettingsActions.setTagTextColor(color));
            }}
            onClose={toggleDefaultTagTextColorPicker}
            color={settings.tagTextColor}
          />
        )}
      </ListItem>
      {AppConfig.isElectron && (
        <ListItem>
          <ListItemText
            primary={
              <Typography>
                {t('core:useTrashCan')}
                <InfoIcon tooltip={t('core:useTrashCanInfo')} />
              </Typography>
            }
          />
          <Switch
            data-tid="settingsSetUseTrashCan"
            onClick={() =>
              dispatch(SettingsActions.setUseTrashCan(!settings.useTrashCan))
            }
            checked={settings.useTrashCan}
          />
        </ListItem>
      )}
      <ListItem>
        <ListItemText primary={t('core:showUnixHiddenFiles')} />
        <Switch
          data-tid="settingsSetShowUnixHiddenEntries"
          onClick={() => {
            dispatch(SettingsActions.toggleShowUnixHiddenEntries());
            openCurrentDirectory(!settings.showUnixHiddenEntries);
          }}
          checked={settings.showUnixHiddenEntries}
        />
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:maxSearchResultChoose')} />
        <TsTextField
          style={{ maxWidth: '100px' }}
          type="number"
          data-tid="settingsMaxSearchResult"
          value={settings.maxSearchResult}
          onChange={handleMaxSearchResult}
        />
      </ListItem>
    </List>
  );
}

export default SettingsGeneral;
