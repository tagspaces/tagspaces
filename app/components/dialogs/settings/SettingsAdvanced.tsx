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
import AddIcon from '@material-ui/icons/Add';
import Switch from '@material-ui/core/Switch';
import i18n from '-/services/i18n';
import {
  actions as SettingsActions,
  getSettings,
  getMapTileServers
} from '-/reducers/settings';
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
  classes: any;
  settings: any;
  setDesktopMode: (desktopMode: boolean) => void;
  showResetSettings: (showDialog: boolean) => void;
  tileServers: Array<TS.MapTileServer>;
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

  return (
    <>
      <List className={classes.root}>
        <ListItem className={classes.listItem}>
          <ListItemText primary="Enable mobile (small screen) mode" />
          <Switch
            data-tid="settingsSetDesktopMode"
            disabled={!(typeof window.ExtDisplayMode === 'undefined')}
            onClick={() => props.setDesktopMode(!props.settings.desktopMode)}
            checked={!props.settings.desktopMode}
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
    tileServers: getMapTileServers(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    { setDesktopMode: SettingsActions.setDesktopMode },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
  // @ts-ignore
)(withStyles(styles, { withTheme: true })(SettingsAdvanced));
