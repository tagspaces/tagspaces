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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import i18n from '../../services/i18n';
import {
  actions as SettingsActions,
  getSettings
} from '../../reducers/settings';
import ColorPickerDialog from '../dialogs/ColorPickerDialog';
import AppConfig from '../../config';

const styles = theme => ({
  root: {
    maxHeight: 500,
    overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
  },
  pro: {
    backgroundColor: '#1DD19F'
  },
  colorChooserButton: {
    border: '1px solid lightgray'
  }
});

type Props = {
  setTagColor: string,
  setTagTextColor: string,
  classes: Object,
  settings: Object,
  toggleShowUnixHiddenEntries: () => void,
  setCurrentTheme: () => void,
  setLanguage: () => void,
  setDesktopMode: () => void,
  setCheckForUpdates: () => void,
  // setColoredFileExtension: () => void,
  setUseTrashCan: () => void,
  setPersistTagsInSidecarFile: () => void,
  setAddTagsToLibrary: () => void,
  setUseGenerateThumbnails: () => void,
  setTagDelimiter: () => void,
  setMaxSearchResult: () => void
};

type State = {
  displayColorPicker?: boolean,
  displayTextColorPicker?: boolean
};

class SettingsGeneral extends React.Component<Props, State> {
  state = {
    displayColorPicker: false,
    displayTextColorPicker: false,
  };

  toggleDefaultTagBackgroundColorPicker = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  toggleDefaultTagTextColorPicker = () => {
    this.setState({
      displayTextColorPicker: !this.state.displayTextColorPicker
    });
  };

  handleChange = event => {
    this.setState({ currentTheme: event.target.value });
  };

  handleTagDelimiterChange = event => {
    this.props.setTagDelimiter(event.target.value);
  };

  handleMaxSearchResult = event => {
    this.props.setMaxSearchResult(event.target.value);
  };

  render() {
    const classes = this.props.classes;

    return (
      <List className={classes.root}>
        <ListItem>
          <ListItemText primary={i18n.t('core:interfaceLanguage')} />
          <Select
            data-tid="settingsSetLanguage"
            value={this.props.settings.interfaceLanguage}
            onChange={event => this.props.setLanguage(event.target.value)}
            input={<Input id="languageSelector" />}
          >
            {this.props.settings.supportedLanguages.map(language => (
              <MenuItem key={language.iso} value={language.iso}>
                {language.title}
              </MenuItem>
            ))}
          </Select>
        </ListItem>
        <ListItem>
          <ListItemText primary={i18n.t('core:themeSelector')} />
          <Select
            data-tid="settingsSetCurrentTheme"
            value={this.props.settings.currentTheme}
            onChange={event => this.props.setCurrentTheme(event.target.value)}
            input={<Input id="themeSelector" />}
          >
            {this.props.settings.supportedThemes.map(theme => (
              <MenuItem key={theme} value={theme}>
                {theme}
              </MenuItem>
            ))}
          </Select>
        </ListItem>
        <ListItem>
          <ListItemText primary={i18n.t('core:checkForNewVersionOnStartup')} />
          <ListItemSecondaryAction>
            <Switch
              data-tid="settingsSetCheckForUpdates"
              onClick={() =>
                this.props.setCheckForUpdates(
                  !this.props.settings.checkForUpdates
                )
              }
              checked={this.props.settings.checkForUpdates}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary={i18n.t('core:persistTagsInSidecarFile')} />
          <ListItemSecondaryAction>
            <Switch
              data-tid="settingsSetPersistTagsInSidecarFile"
              onClick={() =>
                this.props.setPersistTagsInSidecarFile(
                  !this.props.settings.persistTagsInSidecarFile
                )
              }
              checked={this.props.settings.persistTagsInSidecarFile}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary={i18n.t('core:addTagsToLibrary')} />
          <ListItemSecondaryAction>
            <Switch
              data-tid="settingsSetAddTagsToLibrary"
              onClick={() =>
                this.props.setAddTagsToLibrary(
                  !this.props.settings.addTagsToLibrary
                )
              }
              checked={this.props.settings.addTagsToLibrary}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary={i18n.t('core:useGenerateThumbnails')} />
          <ListItemSecondaryAction>
            <Switch
              data-tid="settingsUseGenerateThumbnails"
              onClick={() =>
                this.props.setUseGenerateThumbnails(
                  !this.props.settings.useGenerateThumbnails
                )
              }
              checked={this.props.settings.useGenerateThumbnails}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary={i18n.t('core:tagBackgroundColor')} />
          <ListItemSecondaryAction>
            <Button
              data-tid="settingsToggleDefaultTagBackgroundColor"
              className={classes.colorChooserButton}
              size="small"
              style={{
                backgroundColor: this.props.settings.tagBackgroundColor
              }}
              onClick={this.toggleDefaultTagBackgroundColorPicker}
            >
              &nbsp;
            </Button>
            <ColorPickerDialog
              open={this.state.displayColorPicker}
              setColor={(color) => { this.props.setTagColor(color); }}
              onClose={this.toggleDefaultTagBackgroundColorPicker}
              color={this.props.settings.tagBackgroundColor}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary={i18n.t('core:tagForegroundColor')} />
          <ListItemSecondaryAction>
            <Button
              data-tid="settingsToggleDefaultTagForegroundColor"
              className={classes.colorChooserButton}
              size="small"
              style={{ backgroundColor: this.props.settings.tagTextColor }}
              onClick={this.toggleDefaultTagTextColorPicker}
            >
              &nbsp;
              <div style={styles.textcolor} />
            </Button>
            <ColorPickerDialog
              open={this.state.displayTextColorPicker}
              setColor={(color) => { this.props.setTagTextColor(color); }}
              onClose={this.toggleDefaultTagTextColorPicker}
              color={this.props.settings.tagTextColor}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary={i18n.t('core:useTrashCan')} />
          <ListItemSecondaryAction>
            <Switch
              data-tid="settingsSetUseTrashCan"
              onClick={() =>
                this.props.setUseTrashCan(!this.props.settings.useTrashCan)
              }
              checked={this.props.settings.useTrashCan}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText style={{ maxWidth: '350px' }} primary={i18n.t('core:showUnixHiddenFiles')} />
          <ListItemSecondaryAction>
            <Switch
              data-tid="settingsSetShowUnixHiddenEntries"
              onClick={this.props.toggleShowUnixHiddenEntries}
              checked={this.props.settings.showUnixHiddenEntries}
            />
          </ListItemSecondaryAction>
        </ListItem>
        {/* <ListItem>
          <ListItemText primary={i18n.t('core:desktopMode')} />
          <ListItemSecondaryAction>
            <Switch
              data-tid="settingsSetDesktopMode"
              onClick={() =>
                this.props.setDesktopMode(!this.props.settings.desktopMode)
              }
              checked={this.props.settings.desktopMode}
            />
          </ListItemSecondaryAction>
        </ListItem> */}
        {/* <ListItem>
          <ListItemText style={{ maxWidth: '300px' }} primary={i18n.t('core:tagDelimiterChoose')} />
          <ListItemSecondaryAction>
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
          </ListItemSecondaryAction>
        </ListItem> */}
        <ListItem>
          <ListItemText primary={i18n.t('core:maxSearchResultChoose')} />
          <ListItemSecondaryAction>
            <Input
              style={{ maxWidth: '170px' }}
              type="number"
              data-tid="settingsMaxSearchResult"
              label={i18n.t('core:maxSearchResult')}
              value={this.props.settings.maxSearchResult}
              onChange={this.handleMaxSearchResult}
              // onBlur={this.handleMaxSearchResult}
            />
          </ListItemSecondaryAction>
        </ListItem>
        { /* <ListItem>
          <ListItemText primary={i18n.t('core:coloredFileExtensionsEnabled')} />
          <ListItemSecondaryAction>
            <Switch
              data-tid="settingsSetColoredFileExtension"
              onClick={() =>
                this.props.setColoredFileExtension(
                  !this.props.settings.coloredFileExtension
                )
              }
              checked={this.props.settings.coloredFileExtension}
            />
          </ListItemSecondaryAction>
        </ListItem> */ }
        { /* <ListItem>
          <ListItemText primary={i18n.t('core:loadLocationMetaData')} />
          <ListItemSecondaryAction>
            <Switch
              data-tid="settingsSetLoadsLocationMetaData"
              onClick={() =>
                this.props.setLoadsLocationMetaData(
                  !this.props.settings.loadsLocationMetaData
                )
              }
              checked={this.props.settings.loadsLocationMetaData}
            />
          </ListItemSecondaryAction>
        </ListItem> */ }
      </List>
    );
  }
}

/*
        <ListItem>
          <span className={this.props.classes.pro}>pro</span>
          <ListItemText primary={i18n.t('core:calculateTag')} />
          <ListItemSecondaryAction>
            <Switch
              data-tid="settingsSetCalculateTags"
              onClick={() =>
                this.props.setCalculateTags(!this.props.settings.calculateTags)
              }
              checked={this.props.settings.calculateTags}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary={i18n.t('core:useTextExtraction')} />
          <ListItemSecondaryAction>
            <Switch
              onClick={() => this.props.setUseTextExtraction(!this.props.settings.useTextExtraction)}
              checked={this.props.settings.useTextExtraction}
            />
          </ListItemSecondaryAction>
        </ListItem>
*/

function mapStateToProps(state) {
  return {
    settings: getSettings(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(SettingsActions, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(
  withStyles(styles)(SettingsGeneral)
);
