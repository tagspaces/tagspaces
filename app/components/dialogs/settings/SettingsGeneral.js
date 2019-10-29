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
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import i18n from '../../../services/i18n';
import {
  actions as SettingsActions,
  getSettings
} from '../../../reducers/settings';
import ColorPickerDialog from '../../dialogs/ColorPickerDialog';
import TransparentBackground from '../../TransparentBackground';

const styles = theme => ({
  root: {
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
});

type Props = {
  setTagColor: string,
  setTagTextColor: string,
  classes: Object,
  settings: Object,
  toggleShowUnixHiddenEntries: () => void,
  setCurrentTheme: () => void,
  setLanguage: () => void,
  // setDesktopMode: () => void,
  setCheckForUpdates: () => void,
  // setColoredFileExtension: () => void,
  setUseTrashCan: () => void,
  setPersistTagsInSidecarFile: () => void,
  setAddTagsToLibrary: () => void,
  setUseGenerateThumbnails: () => void,
  setTagDelimiter: () => void,
  setMaxSearchResult: () => void,
  setDesktopMode: () => void
};

type State = {
  displayColorPicker: boolean,
  displayTextColorPicker: boolean
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
    const { classes } = this.props;

    return (
      <List className={classes.root}>
        <ListItem className={classes.listItem}>
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
        <ListItem className={classes.listItem}>
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
        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('core:checkForNewVersionOnStartup')} />
          <Switch
            data-tid="settingsSetCheckForUpdates"
            onClick={() =>
              this.props.setCheckForUpdates(
                !this.props.settings.checkForUpdates
              )
            }
            checked={this.props.settings.checkForUpdates}
          />
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('core:persistTagsInSidecarFile')} />
          <Switch
            data-tid="settingsSetPersistTagsInSidecarFile"
            onClick={() =>
              this.props.setPersistTagsInSidecarFile(
                !this.props.settings.persistTagsInSidecarFile
              )
            }
            checked={this.props.settings.persistTagsInSidecarFile}
          />
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('core:addTagsToLibrary')} />
          <Switch
            data-tid="settingsSetAddTagsToLibrary"
            onClick={() =>
              this.props.setAddTagsToLibrary(
                !this.props.settings.addTagsToLibrary
              )
            }
            checked={this.props.settings.addTagsToLibrary}
          />
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('core:useGenerateThumbnails')} />
          <Switch
            data-tid="settingsUseGenerateThumbnails"
            onClick={() =>
              this.props.setUseGenerateThumbnails(
                !this.props.settings.useGenerateThumbnails
              )
            }
            checked={this.props.settings.useGenerateThumbnails}
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
                backgroundColor: this.props.settings.tagBackgroundColor
              }}
              onClick={this.toggleDefaultTagBackgroundColorPicker}
            >&nbsp;</Button>
          </TransparentBackground>
          <ColorPickerDialog
            open={this.state.displayColorPicker}
            setColor={(color) => { this.props.setTagColor(color); }}
            onClose={this.toggleDefaultTagBackgroundColorPicker}
            color={this.props.settings.tagBackgroundColor}
          />
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('core:tagForegroundColor')} />
          <TransparentBackground>
            <Button
              data-tid="settingsToggleDefaultTagForegroundColor"
              className={classes.colorChooserButton}
              size="small"
              style={{ backgroundColor: this.props.settings.tagTextColor }}
              onClick={this.toggleDefaultTagTextColorPicker}
            >&nbsp;</Button>
          </TransparentBackground>
          <ColorPickerDialog
            open={this.state.displayTextColorPicker}
            setColor={(color) => { this.props.setTagTextColor(color); }}
            onClose={this.toggleDefaultTagTextColorPicker}
            color={this.props.settings.tagTextColor}
          />
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('core:useTrashCan')} />
          <Switch
            data-tid="settingsSetUseTrashCan"
            onClick={() =>
              this.props.setUseTrashCan(!this.props.settings.useTrashCan)
            }
            checked={this.props.settings.useTrashCan}
          />
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('core:showUnixHiddenFiles')} />
          <Switch
            data-tid="settingsSetShowUnixHiddenEntries"
            onClick={this.props.toggleShowUnixHiddenEntries}
            checked={this.props.settings.showUnixHiddenEntries}
          />
        </ListItem>
        {<ListItem className={classes.listItem}>
          <ListItemText primary="Mobile Mode (experimental)" />
          <Switch
            data-tid="settingsSetDesktopMode"
            onClick={() =>
              this.props.setDesktopMode(!this.props.settings.desktopMode)
            }
            checked={!this.props.settings.desktopMode}
          />
        </ListItem>}
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
            label={i18n.t('core:maxSearchResult')}
            value={this.props.settings.maxSearchResult}
            onChange={this.handleMaxSearchResult}
          />
        </ListItem>
        { /* <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('core:coloredFileExtensionsEnabled')} />
          <Switch
            data-tid="settingsSetColoredFileExtension"
            onClick={() =>
              this.props.setColoredFileExtension(
                !this.props.settings.coloredFileExtension
              )
            }
            checked={this.props.settings.coloredFileExtension}
          />
        </ListItem> */ }
        { /* <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('core:loadLocationMetaData')} />
          <Switch
            data-tid="settingsSetLoadsLocationMetaData"
            onClick={() =>
              this.props.setLoadsLocationMetaData(
                !this.props.settings.loadsLocationMetaData
              )
            }
            checked={this.props.settings.loadsLocationMetaData}
          />
        </ListItem> */ }
      </List>
    );
  }
}

/*
        <ListItem className={classes.listItem}>
          <span className={this.props.classes.pro}>pro</span>
          <ListItemText primary={i18n.t('core:calculateTag')} />
          <Switch
            data-tid="settingsSetCalculateTags"
            onClick={() =>
              this.props.setCalculateTags(!this.props.settings.calculateTags)
            }
            checked={this.props.settings.calculateTags}
          />
        </ListItem>
        <ListItem>
          <ListItemText primary={i18n.t('core:useTextExtraction')} />
          <Switch
            onClick={() => this.props.setUseTextExtraction(!this.props.settings.useTextExtraction)}
            checked={this.props.settings.useTextExtraction}
          />
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
