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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withStyles from '@mui/styles/withStyles';
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
import i18n from '-/services/i18n';
import {
  actions as SettingsActions,
  getPersistTagsInSidecarFile,
  getSettings
} from '-/reducers/settings';
import ColorPickerDialog from '-/components/dialogs/ColorPickerDialog';
import PerspectiveSelector from '-/components/PerspectiveSelector';
import TransparentBackground from '-/components/TransparentBackground';
import { BetaLabel } from '-/components/HelperComponents';
import PlatformIO from '-/services/platform-facade';
import { PerspectiveIDs } from '-/perspectives/types';

const styles: any = {
  root: {
    overflowX: 'hidden'
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0
  },
  pro: {
    backgroundColor: '#1DD19F'
  },
  colorChooserButton: {
    minHeight: 30,
    border: '1px solid lightgray'
  }
};

interface Props {
  setTagColor: (tagColor: string) => void;
  setTagTextColor: (tagTextColor: string) => void;
  classes: any;
  settings: any;
  persistTagsInSidecarFile: boolean;
  toggleShowUnixHiddenEntries: () => void;
  setCurrentTheme: (theme: string) => void;
  setCurrentRegularTheme: (theme: string) => void;
  setCurrentDarkTheme: (theme: string) => void;
  setLanguage: (language: string) => void;
  setCheckForUpdates: (check: boolean) => void;
  reorderTags: (check: boolean) => void;
  setUseTrashCan: (useTrashCan: boolean) => void;
  setPersistTagsInSidecarFile: (tagInSidecar: boolean) => void;
  setAddTagsToLibrary: (addTagsToLibrary: boolean) => void;
  setUseGenerateThumbnails: (useGenerateThumbnails: boolean) => void;
  setTagDelimiter: (tagDelimiter: string) => void;
  setDefaultPerspective: (defaultPerspective: string) => void;
  setMaxSearchResult: (maxResult: string) => void;
}

function SettingsGeneral(props: Props) {
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const [displayTextColorPicker, setDisplayTextColorPicker] = useState<boolean>(
    false
  );

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

  const handleMaxSearchResult = event => {
    props.setMaxSearchResult(event.target.value);
  };

  const changePerspective = (event: any) => {
    const perspective = event.target.value;
    props.setDefaultPerspective(perspective);
  };

  let defaultPerspective = PerspectiveIDs.UNSPECIFIED;
  if (props.settings.defaultPerspective) {
    defaultPerspective = props.settings.defaultPerspective;
  }

  const { classes, persistTagsInSidecarFile } = props;

  return (
    <List className={classes.root}>
      <ListItem className={classes.listItem}>
        <ListItemText primary={i18n.t('core:interfaceLanguage')} />
        <Select
          data-tid="settingsSetLanguage"
          value={props.settings.interfaceLanguage}
          onChange={(event: any) => {
            props.setLanguage(event.target.value);
            PlatformIO.setLanguage(event.target.value);
          }}
          input={<Input id="languageSelector" />}
        >
          {props.settings.supportedLanguages.map(language => (
            <MenuItem key={language.iso} value={language.iso}>
              {language.title}
            </MenuItem>
          ))}
        </Select>
      </ListItem>
      <ListItem className={classes.listItem}>
        <ListItemText primary={i18n.t('core:themeSelector')} />
        <Select
          data-tid="settingsSetCurrentTheme"
          value={props.settings.currentTheme}
          onChange={(event: any) => props.setCurrentTheme(event.target.value)}
          input={<Input id="themeSelector" />}
        >
          {props.settings.supportedThemes.map(theme => (
            <MenuItem key={theme} value={theme}>
              {theme === 'light' && i18n.t('core:regularScheme')}
              {theme === 'dark' && i18n.t('core:darkScheme')}
              {theme === 'system' && i18n.t('core:systemScheme')}
            </MenuItem>
          ))}
        </Select>
      </ListItem>
      <ListItem className={classes.listItem}>
        <ListItemText primary={i18n.t('core:themeRegularSelector')} />
        <Select
          data-tid="settingsCurrentRegularThemeTID"
          value={props.settings.currentRegularTheme}
          onChange={(event: any) =>
            props.setCurrentRegularTheme(event.target.value)
          }
          input={<Input id="themeRegularSelector" />}
        >
          {props.settings.supportedRegularThemes.map(theme => (
            <MenuItem key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </ListItem>
      <ListItem className={classes.listItem}>
        <ListItemText primary={i18n.t('core:themeDarkSelector')} />
        <Select
          data-tid="settingsCurrentDarkThemeTID"
          value={props.settings.currentDarkTheme}
          onChange={(event: any) =>
            props.setCurrentDarkTheme(event.target.value)
          }
          input={<Input id="themeDarkSelector" />}
        >
          {props.settings.supportedDarkThemes.map(theme => (
            <MenuItem key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </ListItem>
      <ListItem className={classes.listItem}>
        <ListItemText primary={i18n.t('Default Perspective')} />
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
            ? i18n.t('core:settingExternallyConfigured')
            : ''
        }
      >
        <ListItemText primary={i18n.t('core:fileTaggingSetting')} />
        {AppConfig.useSidecarsForFileTaggingDisableSetting ? (
          <Button size="small" variant="outlined" disabled>
            {persistTagsInSidecarFile
              ? i18n.t('core:useSidecarFile')
              : i18n.t('core:renameFile')}
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
              onClick={() => props.setPersistTagsInSidecarFile(false)}
            >
              <Tooltip
                title={
                  <Typography color="inherit">
                    {i18n.t('core:tagsInFilenameExplanation')}
                  </Typography>
                }
              >
                <div style={{ display: 'flex' }}>
                  {!persistTagsInSidecarFile && <CheckIcon />}
                  &nbsp;{i18n.t('core:renameFile')}&nbsp;&nbsp;
                  <InfoMuiIcon />
                </div>
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              value={true}
              data-tid="settingsSetPersistTagsInSidecarFile"
              onClick={() => props.setPersistTagsInSidecarFile(true)}
            >
              <Tooltip
                title={
                  <Typography color="inherit">
                    {i18n.t('core:tagsInSidecarFileExplanation')}
                  </Typography>
                }
              >
                <div style={{ display: 'flex' }}>
                  {persistTagsInSidecarFile && <CheckIcon />}
                  &nbsp;{i18n.t('core:useSidecarFile')}&nbsp;&nbsp;
                  <InfoMuiIcon />
                </div>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </ListItem>
      <ListItem className={classes.listItem}>
        <ListItemText primary={i18n.t('core:checkForNewVersionOnStartup')} />
        <Switch
          data-tid="settingsSetCheckForUpdates"
          onClick={() =>
            props.setCheckForUpdates(!props.settings.checkForUpdates)
          }
          checked={props.settings.checkForUpdates}
        />
      </ListItem>
      <ListItem className={classes.listItem}>
        <ListItemText
          primary={
            <>
              {i18n.t('core:reorderTags')}
              <BetaLabel />
            </>
          }
        />
        <Switch
          data-tid="reorderTagsTID"
          onClick={() => props.reorderTags(!props.settings.reorderTags)}
          checked={props.settings.reorderTags}
        />
      </ListItem>
      <ListItem className={classes.listItem}>
        <ListItemText primary={i18n.t('core:addTagsToLibrary')} />
        <Switch
          data-tid="settingsSetAddTagsToLibrary"
          onClick={() =>
            props.setAddTagsToLibrary(!props.settings.addTagsToLibrary)
          }
          checked={props.settings.addTagsToLibrary}
        />
      </ListItem>
      <ListItem className={classes.listItem}>
        <ListItemText primary={i18n.t('core:useGenerateThumbnails')} />
        <Switch
          disabled={AppConfig.useGenerateThumbnails !== undefined}
          data-tid="settingsUseGenerateThumbnails"
          onClick={() =>
            props.setUseGenerateThumbnails(
              !props.settings.useGenerateThumbnails
            )
          }
          checked={
            AppConfig.useGenerateThumbnails !== undefined
              ? AppConfig.useGenerateThumbnails
              : props.settings.useGenerateThumbnails
          }
        />
      </ListItem>
      <ListItem className={classes.listItem}>
        <ListItemText primary={i18n.t('core:tagBackgroundColor')} />
        <TransparentBackground>
          <Button
            data-tid="settingsToggleDefaultTagBackgroundColor"
            className={classes.colorChooserButton}
            size="small"
            style={{
              backgroundColor: props.settings.tagBackgroundColor
            }}
            onClick={toggleDefaultTagBackgroundColorPicker}
          >
            &nbsp;
          </Button>
        </TransparentBackground>
        {displayColorPicker && (
          <ColorPickerDialog
            open={displayColorPicker}
            setColor={color => {
              props.setTagColor(color);
            }}
            onClose={toggleDefaultTagBackgroundColorPicker}
            color={props.settings.tagBackgroundColor}
          />
        )}
      </ListItem>
      <ListItem className={classes.listItem}>
        <ListItemText primary={i18n.t('core:tagForegroundColor')} />
        <TransparentBackground>
          <Button
            data-tid="settingsToggleDefaultTagForegroundColor"
            className={classes.colorChooserButton}
            size="small"
            style={{ backgroundColor: props.settings.tagTextColor }}
            onClick={toggleDefaultTagTextColorPicker}
          >
            &nbsp;
          </Button>
        </TransparentBackground>
        {displayTextColorPicker && (
          <ColorPickerDialog
            open={displayTextColorPicker}
            setColor={color => {
              props.setTagTextColor(color);
            }}
            onClose={toggleDefaultTagTextColorPicker}
            color={props.settings.tagTextColor}
          />
        )}
      </ListItem>
      {AppConfig.isElectron && (
        <ListItem className={classes.listItem}>
          <ListItemText
            primary={
              <Typography>
                {i18n.t('core:useTrashCan')}
                <InfoIcon tooltip={i18n.t('core:useTrashCanInfo')} />
              </Typography>
            }
          />
          <Switch
            data-tid="settingsSetUseTrashCan"
            onClick={() => props.setUseTrashCan(!props.settings.useTrashCan)}
            checked={props.settings.useTrashCan}
          />
        </ListItem>
      )}
      <ListItem className={classes.listItem}>
        <ListItemText primary={i18n.t('core:showUnixHiddenFiles')} />
        <Switch
          data-tid="settingsSetShowUnixHiddenEntries"
          onClick={props.toggleShowUnixHiddenEntries}
          checked={props.settings.showUnixHiddenEntries}
        />
      </ListItem>
      {/* <ListItem className={classes.listItem}>
          <ListItemText style={{ maxWidth: '300px' }} primary={i18n.t('core:tagDelimiterChoose')} />
          <Select
            style={{ minWidth: '170px' }}
            data-tid="settingsTagDelimiterChoose"
            value={this.props.settings.tagDelimiter}
            onChange={this.handleTagDelimiterChange}
            inputProps={{
              name: 'tagDelimiter',
              id: 'tag-delimiter',
            }}
          >
            <MenuItem value=" ">{i18n.t('core:tagDelimiterSpace')}</MenuItem>
            <MenuItem value="_">{i18n.t('core:tagDelimiterUnderscore')}</MenuItem>
            <MenuItem value=",">{i18n.t('core:tagDelimiterComma')}</MenuItem>
          </Select>
        </ListItem> */}
      <ListItem className={classes.listItem}>
        <ListItemText primary={i18n.t('core:maxSearchResultChoose')} />
        <Input
          style={{ maxWidth: '100px' }}
          type="number"
          data-tid="settingsMaxSearchResult"
          value={props.settings.maxSearchResult}
          onChange={handleMaxSearchResult}
        />
      </ListItem>
    </List>
  );
}

function mapStateToProps(state) {
  return {
    settings: getSettings(state),
    persistTagsInSidecarFile: getPersistTagsInSidecarFile(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(SettingsActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
  // @ts-ignore
)(withStyles(styles, { withTheme: true })(SettingsGeneral));
