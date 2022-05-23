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
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Switch from '@material-ui/core/Switch';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import i18n from '-/services/i18n';
import {
  actions as SettingsActions,
  getSettings,
  getMapTileServers,
  getEnableWS
} from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import MapTileServerDialog from '-/components/dialogs/settings/MapTileServerDialog';
import { Pro } from '-/pro';
import { ProLabel } from '-/components/HelperComponents';
import InfoIcon from '-/components/InfoIcon';
import AppConfig from '-/config';

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
  classes: any;
  settings: any;
  setDesktopMode: (desktopMode: boolean) => void;
  setEnableWS: (enableWS: boolean) => void;
  setWarningOpeningFilesExternally: (
    warningOpeningFilesExternally: boolean
  ) => void;
  setSaveTagInLocation: (saveTagInLocation: boolean) => void;
  showResetSettings: (showDialog: boolean) => void;
  tileServers: Array<TS.MapTileServer>;
  setGeoTaggingFormat: (geoTaggingFormat: string) => void;
}

const SettingsAdvanced = (props: Props) => {
  const [tileServerDialog, setTileServerDialog] = useState<any>(undefined);

  const handleEditTileServerClick = (
    event: any,
    tileServer: any,
    isDefault: boolean
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setTileServerDialog({ ...tileServer, isDefault });
  };

  const { classes } = props;

  const geoTaggingFormatDisabled = AppConfig.geoTaggingFormat !== undefined;

  return (
    <div style={{ width: '100%' }}>
      <List className={classes.root}>
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

        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('enableMobileMode')} />
          <Switch
            data-tid="settingsSetDesktopMode"
            disabled={!(typeof window.ExtDisplayMode === 'undefined')}
            onClick={() => props.setDesktopMode(!props.settings.desktopMode)}
            checked={!props.settings.desktopMode}
          />
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('enableWS')} />
          <Switch
            data-tid="settingsEnableWS"
            onClick={() => props.setEnableWS(!props.settings.enableWS)}
            checked={props.settings.enableWS}
          />
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('warningOpeningFilesExternally')} />
          <Switch
            data-tid="warningOpeningFilesExternally"
            onClick={() =>
              props.setWarningOpeningFilesExternally(
                !props.settings.warningOpeningFilesExternally
              )
            }
            checked={props.settings.warningOpeningFilesExternally}
          />
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText
            primary={
              <>
                {i18n.t('enableTagsFromLocation')}
                <InfoIcon tooltip={i18n.t('core:enableTagsFromLocationHelp')} />
                <ProLabel />
              </>
            }
          />
          <Switch
            data-tid="saveTagInLocationTID"
            disabled={!Pro}
            onClick={() =>
              props.setSaveTagInLocation(!props.settings.saveTagInLocation)
            }
            checked={props.settings.saveTagInLocation}
          />
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('core:geoTaggingFormat')} />
          <Select
            disabled={geoTaggingFormatDisabled}
            data-tid="geoTaggingFormatTID"
            title={
              geoTaggingFormatDisabled
                ? i18n.t('core:settingExternallyConfigured')
                : ''
            }
            value={
              geoTaggingFormatDisabled
                ? AppConfig.geoTaggingFormat
                : props.settings.geoTaggingFormat
            }
            onChange={(event: any) =>
              props.setGeoTaggingFormat(event.target.value)
            }
            input={<Input id="geoTaggingFormatSelector" />}
          >
            {props.settings.supportedGeoTagging.map(geoTagging => (
              <MenuItem key={geoTagging} value={geoTagging}>
                {geoTagging.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={i18n.t('core:tileServerTitle')} />
          <ListItemSecondaryAction style={{ right: 0 }}>
            <Button
              color="primary"
              onClick={event => handleEditTileServerClick(event, {}, true)}
            >
              {i18n.t('tileServerDialogAdd')}
            </Button>
          </ListItemSecondaryAction>
        </ListItem>
        <List
          style={{
            padding: 5,
            paddingLeft: 10,
            backgroundColor: '#d3d3d34a',
            borderRadius: 10
          }}
          dense
        >
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
        </List>
      </List>
      {tileServerDialog && (
        <MapTileServerDialog
          open={tileServerDialog !== undefined}
          onClose={() => setTileServerDialog(undefined)}
          tileServer={tileServerDialog}
          isDefault={tileServerDialog.isDefault}
        />
      )}
    </div>
  );
};

function mapStateToProps(state) {
  return {
    settings: getSettings(state),
    tileServers: getMapTileServers(state),
    enableWS: getEnableWS(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      setWarningOpeningFilesExternally:
        SettingsActions.setWarningOpeningFilesExternally,
      setDesktopMode: SettingsActions.setDesktopMode,
      setEnableWS: SettingsActions.setEnableWS,
      setSaveTagInLocation: SettingsActions.setSaveTagInLocation,
      setGeoTaggingFormat: SettingsActions.setGeoTaggingFormat
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withStyles(styles, { withTheme: true })(SettingsAdvanced));
