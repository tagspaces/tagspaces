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
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import CheckIcon from '@material-ui/icons/Check';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import AddIcon from '@material-ui/icons/Add';
import i18n from '-/services/i18n';
import {
  actions as SettingsActions,
  getPersistTagsInSidecarFile,
  getSettings,
  getMapTileServers
} from '-/reducers/settings';
import ColorPickerDialog from '../ColorPickerDialog';
import TransparentBackground from '../../TransparentBackground';
import AppConfig from '-/config';
import { TS } from '-/tagspaces.namespace';
import MapTileServerDialog from '-/components/dialogs/settings/MapTileServerDialog';

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
  setLanguage: (language: string) => void;
  setCheckForUpdates: (check: boolean) => void;
  setUseTrashCan: (useTrashCan: boolean) => void;
  setPersistTagsInSidecarFile: (tagInSidecar: boolean) => void;
  setAddTagsToLibrary: (addTagsToLibrary: boolean) => void;
  setUseGenerateThumbnails: (useGenerateThumbnails: boolean) => void;
  setTagDelimiter: (tagDelimiter: string) => void;
  setMaxSearchResult: (maxResult: string) => void;
  setDesktopMode: (desktopMode: boolean) => void;
  showResetSettings: (showDialog: boolean) => void;
  tileServers: Array<TS.MapTileServer>;
}

const SettingsGeneral = (props: Props) => {
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const [tileServerDialog, setTileServerDialog] = useState<any>(undefined);
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

  const handleEditTileServerClick = (
    event: any,
    tileServer: any,
    isDefault: boolean
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setTileServerDialog({ ...tileServer, isDefault });
  };

  const { classes, persistTagsInSidecarFile } = props;

  return (
    <>
      <List className={classes.root}>
        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('core:interfaceLanguage')} />
          <Select
            data-tid="settingsSetLanguage"
            value={props.settings.interfaceLanguage}
            onChange={(event: any) => {
              props.setLanguage(event.target.value);
              const { currentTheme } = props.settings;
              const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
              props.setCurrentTheme(newTheme);
              setTimeout(() => {
                props.setCurrentTheme(currentTheme);
              }, 500);
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
                {theme}
              </MenuItem>
            ))}
          </Select>
        </ListItem>
        <ListItem
          className={classes.listItem}
          title={
            AppConfig.useSidecarsForFileTaggingDisableSetting
              ? 'This setting is managed with an external configuration'
              : ''
          }
        >
          <ListItemText primary="File tagging method" />
          {AppConfig.useSidecarsForFileTaggingDisableSetting ? (
            <Button size="small" variant="outlined" disabled>
              {persistTagsInSidecarFile ? 'Use Sidecar Files' : 'Rename Files'}
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
                  arrow
                  title={
                    <Typography color="inherit">
                      Use the name of file for saving the tags - Tagging the
                      file <b>image.jpg</b> with a tag <b>sunset</b> will rename
                      it to <b>image[sunset].jpg</b>
                    </Typography>
                  }
                >
                  <div style={{ display: 'flex' }}>
                    {!persistTagsInSidecarFile && <CheckIcon />}
                    &nbsp;Rename Files&nbsp;&nbsp;
                    <InfoIcon />
                  </div>
                </Tooltip>
              </ToggleButton>
              <ToggleButton
                value={true}
                data-tid="settingsSetPersistTagsInSidecarFile"
                onClick={() => props.setPersistTagsInSidecarFile(true)}
              >
                <Tooltip
                  arrow
                  title={
                    <Typography color="inherit">
                      Use sidecar file for saving the tags - Tagging the file{' '}
                      <b>image.jpg</b> with a tag <b>sunset</b> will save this
                      tag in an additional sidecar file called{' '}
                      <b>image.jpg.json</b> located in a sub folder with the
                      name <b>.ts</b>
                    </Typography>
                  }
                >
                  <div style={{ display: 'flex' }}>
                    {persistTagsInSidecarFile && <CheckIcon />}
                    &nbsp;Use Sidecar Files&nbsp;&nbsp;
                    <InfoIcon />
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
            data-tid="settingsUseGenerateThumbnails"
            onClick={() =>
              props.setUseGenerateThumbnails(
                !props.settings.useGenerateThumbnails
              )
            }
            checked={props.settings.useGenerateThumbnails}
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
            <ListItemText primary={i18n.t('core:useTrashCan')} />
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
        <ListItem className={classes.listItem}>
          <ListItemText primary="Enable mobile (small screen) mode" />
          <Switch
            data-tid="settingsSetDesktopMode"
            disabled={!(typeof window.ExtDisplayMode === 'undefined')}
            onClick={() => props.setDesktopMode(!props.settings.desktopMode)}
            checked={!props.settings.desktopMode}
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
        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('core:tileServerTitle')} />
          <ListItemSecondaryAction>
            <IconButton
              aria-label={i18n.t('core:add')}
              aria-haspopup="true"
              edge="end"
              data-tid="addTileServerTID"
              onClick={event => handleEditTileServerClick(event, {}, true)}
            >
              <AddIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        {props.tileServers.length > 0 ? (
          props.tileServers.map((tileServer, index) => (
            <ListItem key={tileServer.uuid} className={classes.listItem}>
              <ListItemText
                primary={tileServer.name}
                secondary={tileServer.serverURL}
              />
              <ListItemSecondaryAction>
                {index === 0 && (
                  <Tooltip title={i18n.t('core:serverIsDefaultHelp')}>
                    <CheckIcon
                      data-tid="tileServerDefaultIndication"
                      style={{ marginLeft: 10 }}
                    />
                  </Tooltip>
                )}
                <IconButton
                  aria-label={i18n.t('core:options')}
                  aria-haspopup="true"
                  edge="end"
                  data-tid={'tileServerEdit_' + tileServer.name}
                  onClick={event =>
                    handleEditTileServerClick(event, tileServer, index === 0)
                  }
                >
                  <EditIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        ) : (
          <ListItem key="noTileServers" className={classes.listItem}>
            <ListItemText
              primary={i18n.t('core:noTileServersTitle')}
              secondary={i18n.t('core:addTileServersHelp')}
            />
          </ListItem>
        )}
        {/* <ListItem className={classes.listItem}>
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
        </ListItem> */}
        {/* <ListItem className={classes.listItem}>
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
        </ListItem> */}
        <ListItem className={classes.listItem}>
          <Button
            data-tid="resetSettingsTID"
            onClick={() => props.showResetSettings(true)}
            color="secondary"
            style={{ marginLeft: -7 }}
          >
            {i18n.t('core:resetSettings')}
          </Button>
          <Button
            data-tid="reloadAppTID"
            onClick={() => {
              window.location.reload();
            }}
            color="secondary"
          >
            {i18n.t('core:reloadApplication')}
          </Button>
        </ListItem>
      </List>
      {tileServerDialog && (
        <MapTileServerDialog
          open={tileServerDialog !== undefined}
          onClose={() => setTileServerDialog(undefined)}
          tileServer={tileServerDialog}
          isDefault={tileServerDialog.isDefault}
        />
      )}
    </>
  );
};

function mapStateToProps(state) {
  return {
    settings: getSettings(state),
    persistTagsInSidecarFile: getPersistTagsInSidecarFile(state),
    tileServers: getMapTileServers(state)
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
