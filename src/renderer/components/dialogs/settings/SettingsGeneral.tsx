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

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Tooltip from '-/components/Tooltip';
import Input from '@mui/material/Input';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import InfoMuiIcon from '@mui/icons-material/InfoOutlined';
import InfoIcon from '-/components/InfoIcon';
import CheckIcon from '@mui/icons-material/Check';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AppConfig from '-/AppConfig';
import {
  actions as SettingsActions,
  getFileNameTagPlace,
  getPersistTagsInSidecarFile,
  //getCurrentLanguage,
  getSettings,
} from '-/reducers/settings';
import ColorPickerDialog from '-/components/dialogs/ColorPickerDialog';
import PerspectiveSelector from '-/components/PerspectiveSelector';
import TransparentBackground from '-/components/TransparentBackground';
import { BetaLabel } from '-/components/HelperComponents';
import { PerspectiveIDs } from '-/perspectives';
import { AppDispatch } from '-/reducers/app';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { setLanguage } from '-/services/utils-io';

const PREFIX = 'SettingsGeneral';

const classes = {
  root: `${PREFIX}-root`,
  listItem: `${PREFIX}-listItem`,
  pro: `${PREFIX}-pro`,
  colorChooserButton: `${PREFIX}-colorChooserButton`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.root}`]: {
    overflowX: 'hidden',
  },
  [`& .${classes.listItem}`]: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  [`& .${classes.pro}`]: {
    backgroundColor: '#1DD19F',
  },
  [`& .${classes.colorChooserButton}`]: {
    minHeight: 30,
    border: '1px solid lightgray',
  },
}));

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

  /* handleChange = event => {
    this.setState({ currentTheme: event.target.value });
  }; */

  /* handleTagDelimiterChange = event => {
    this.props.setTagDelimiter(event.target.value);
  }; */

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
    <Root>
      <List className={classes.root}>
        <ListItem className={classes.listItem}>
          <ListItemText primary={t('core:interfaceLanguage')} />
          <Select
            data-tid="settingsSetLanguage"
            value={settings.interfaceLanguage}
            onChange={(event: any) => {
              return i18n.changeLanguage(event.target.value).then(() => {
                dispatch(SettingsActions.setLanguage(event.target.value));
                setLanguage(event.target.value);
                return true;
              });
            }}
            input={<Input id="languageSelector" />}
          >
            {settings.supportedLanguages.map((language) => (
              <MenuItem key={language.iso} value={language.iso}>
                {language.title}
              </MenuItem>
            ))}
          </Select>
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={t('core:themeSelector')} />
          <Select
            data-tid="settingsSetCurrentTheme"
            value={settings.currentTheme}
            onChange={(event: any) =>
              dispatch(SettingsActions.setCurrentTheme(event.target.value))
            }
            input={<Input id="themeSelector" />}
          >
            {settings.supportedThemes.map((theme) => (
              <MenuItem key={theme} value={theme}>
                {theme === 'light' && t('core:regularScheme')}
                {theme === 'dark' && t('core:darkScheme')}
                {theme === 'system' && t('core:systemScheme')}
              </MenuItem>
            ))}
          </Select>
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={t('core:themeRegularSelector')} />
          <Select
            data-tid="settingsCurrentRegularThemeTID"
            value={settings.currentRegularTheme}
            onChange={(event: any) =>
              dispatch(
                SettingsActions.setCurrentRegularTheme(event.target.value),
              )
            }
            input={<Input id="themeRegularSelector" />}
          >
            {settings.supportedRegularThemes.map((theme) => (
              <MenuItem key={theme} value={theme}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={t('core:themeDarkSelector')} />
          <Select
            data-tid="settingsCurrentDarkThemeTID"
            value={settings.currentDarkTheme}
            onChange={(event: any) =>
              dispatch(SettingsActions.setCurrentDarkTheme(event.target.value))
            }
            input={<Input id="themeDarkSelector" />}
          >
            {settings.supportedDarkThemes.map((theme) => (
              <MenuItem key={theme} value={theme}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={t('createLocationDefaultPerspective')} />
          <PerspectiveSelector
            onChange={changePerspective}
            defaultValue={defaultPerspective}
            testId="changePerspectiveInSettingsTID"
          />
        </ListItem>
        <ListItem
          className={classes.listItem}
          title={
            AppConfig.useSidecarsForFileTaggingDisableSetting
              ? t('core:settingExternallyConfigured')
              : ''
          }
        >
          <ListItemText primary={t('core:fileTaggingSetting')} />
          {AppConfig.useSidecarsForFileTaggingDisableSetting ? (
            <Button size="small" variant="outlined" disabled>
              {persistTagsInSidecarFile
                ? t('core:useSidecarFile')
                : t('core:renameFile')}
            </Button>
          ) : (
            <ToggleButtonGroup
              value={persistTagsInSidecarFile}
              size="small"
              exclusive
            >
              <ToggleButton
                value={false}
                data-tid="settingsSetPersistTagsInFileName"
                onClick={() =>
                  dispatch(SettingsActions.setPersistTagsInSidecarFile(false))
                }
              >
                <Tooltip
                  title={
                    <Typography color="inherit">
                      {t('core:tagsInFilenameExplanation')}
                    </Typography>
                  }
                >
                  <div style={{ display: 'flex', textTransform: 'unset' }}>
                    {!persistTagsInSidecarFile && <CheckIcon />}
                    &nbsp;{t('core:renameFile')}&nbsp;&nbsp;
                    <InfoMuiIcon />
                  </div>
                </Tooltip>
              </ToggleButton>
              <ToggleButton
                value={true}
                data-tid="settingsSetPersistTagsInSidecarFile"
                onClick={() =>
                  dispatch(SettingsActions.setPersistTagsInSidecarFile(true))
                }
              >
                <Tooltip
                  title={
                    <Typography color="inherit">
                      {t('core:tagsInSidecarFileExplanation')}
                    </Typography>
                  }
                >
                  <div style={{ display: 'flex', textTransform: 'unset' }}>
                    {persistTagsInSidecarFile && <CheckIcon />}
                    &nbsp;{t('core:useSidecarFile')}&nbsp;&nbsp;
                    <InfoMuiIcon />
                  </div>
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </ListItem>
        {!persistTagsInSidecarFile && (
          <ListItem className={classes.listItem}>
            <ListItemText primary={t('core:fileNameTagSetting')} />
            <ToggleButtonGroup
              value={filenameTagPlacedAtEnd}
              size="small"
              exclusive
            >
              <ToggleButton
                value={false}
                data-tid="fileNameBeginningTagTID"
                onClick={() =>
                  dispatch(SettingsActions.setFileNameTagPlace(false))
                }
              >
                <Tooltip
                  title={
                    <Typography color="inherit">
                      {t('core:fileNameBeginTagPlaceExplanation')}
                    </Typography>
                  }
                >
                  <div style={{ display: 'flex', textTransform: 'unset' }}>
                    {!filenameTagPlacedAtEnd && <CheckIcon />}
                    &nbsp;{t('core:atTheBeginningOfFileName')}&nbsp;&nbsp;
                    <InfoMuiIcon />
                  </div>
                </Tooltip>
              </ToggleButton>
              <ToggleButton
                value={true}
                data-tid="fileNameEndTagTID"
                onClick={() =>
                  dispatch(SettingsActions.setFileNameTagPlace(true))
                }
              >
                <Tooltip
                  title={
                    <Typography color="inherit">
                      {t('core:fileNameEndTagPlaceExplanation')}
                    </Typography>
                  }
                >
                  <div style={{ display: 'flex', textTransform: 'unset' }}>
                    {filenameTagPlacedAtEnd && <CheckIcon />}
                    &nbsp;{t('core:filenameTagPlacedAtEnd')}&nbsp;&nbsp;
                    <InfoMuiIcon />
                  </div>
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </ListItem>
        )}

        <ListItem className={classes.listItem}>
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
        <ListItem className={classes.listItem}>
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
        <ListItem className={classes.listItem}>
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
        <ListItem className={classes.listItem}>
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
        <ListItem className={classes.listItem}>
          <ListItemText primary={t('core:tagBackgroundColor')} />
          <TransparentBackground>
            <Button
              data-tid="settingsToggleDefaultTagBackgroundColor"
              className={classes.colorChooserButton}
              size="small"
              style={{
                backgroundColor: settings.tagBackgroundColor,
              }}
              onClick={toggleDefaultTagBackgroundColorPicker}
            >
              &nbsp;
            </Button>
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
        <ListItem className={classes.listItem}>
          <ListItemText primary={t('core:tagForegroundColor')} />
          <TransparentBackground>
            <Button
              data-tid="settingsToggleDefaultTagForegroundColor"
              className={classes.colorChooserButton}
              size="small"
              style={{ backgroundColor: settings.tagTextColor }}
              onClick={toggleDefaultTagTextColorPicker}
            >
              &nbsp;
            </Button>
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
          <ListItem className={classes.listItem}>
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
        <ListItem className={classes.listItem}>
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
        {/* <ListItem className={classes.listItem}>
          <ListItemText style={{ maxWidth: '300px' }} primary={t('core:tagDelimiterChoose')} />
          <Select
            style={{ minWidth: '170px' }}
            data-tid="settingsTagDelimiterChoose"
            value={this.settings.tagDelimiter}
            onChange={this.handleTagDelimiterChange}
            inputProps={{
              name: 'tagDelimiter',
              id: 'tag-delimiter',
            }}
          >
            <MenuItem value=" ">{t('core:tagDelimiterSpace')}</MenuItem>
            <MenuItem value="_">{t('core:tagDelimiterUnderscore')}</MenuItem>
            <MenuItem value=",">{t('core:tagDelimiterComma')}</MenuItem>
          </Select>
        </ListItem> */}
        <ListItem className={classes.listItem}>
          <ListItemText primary={t('core:maxSearchResultChoose')} />
          <Input
            style={{ maxWidth: '100px' }}
            type="number"
            data-tid="settingsMaxSearchResult"
            value={settings.maxSearchResult}
            onChange={handleMaxSearchResult}
          />
        </ListItem>
      </List>
    </Root>
  );
}

export default SettingsGeneral;
