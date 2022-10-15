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

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withStyles from '@mui/styles/withStyles';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { isStr } from '@tagspaces/tagspaces-platforms/misc';
import PlatformIO from '-/services/platform-facade';
import i18n from '-/services/i18n';
import {
  actions as SettingsActions,
  getKeyBindings,
  isGlobalKeyBindingEnabled
} from '-/reducers/settings';
import DefaultSettings from '-/reducers/settings-default';

const styles: any = (theme: any) => ({
  keyBinding: {
    marginTop: 10,
    marginBottom: 10
  }
});

interface Props {
  classes: any;
  keyBindings: Array<any>;
  setKeyBinding: (kbName: string, kbCommand: string) => void;
  setGlobalKeyBinding: (value: boolean) => void;
  globalKeyBindingEnabled: boolean;
}

function SettingsKeyBindings(props: Props) {
  const {
    keyBindings,
    classes,
    setKeyBinding,
    setGlobalKeyBinding,
    globalKeyBindingEnabled
  } = props;
  return (
    <form className={classes.root} noValidate autoComplete="off">
      <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
        <ListItemText primary={i18n.t('core:enableGlobalKeyboardShortcuts')} />
        <Switch
          onClick={() => {
            setGlobalKeyBinding(!globalKeyBindingEnabled);
            PlatformIO.setGlobalShortcuts(!globalKeyBindingEnabled);
          }}
          checked={globalKeyBindingEnabled}
        />
      </ListItem>
      {keyBindings.map(keyBinding => {
        const defaultBinding = DefaultSettings.keyBindings.filter(
          kb => kb.name === keyBinding.name
        )[0];
        return (
          <TextField
            className={classes.keyBinding}
            key={keyBinding.name}
            InputLabelProps={{ shrink: true }}
            fullWidth
            onBlur={event => setKeyBinding(keyBinding.name, event.target.value)}
            label={i18n.t('core:' + keyBinding.name)}
            placeholder={
              'suggested binding: ' +
              (defaultBinding ? defaultBinding.command : '')
            }
            defaultValue={isStr(keyBinding.command) ? keyBinding.command : ''}
          />
        );
      })}
    </form>
  );
}

function mapStateToProps(state) {
  return {
    keyBindings: getKeyBindings(state),
    globalKeyBindingEnabled: isGlobalKeyBindingEnabled(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      setKeyBinding: SettingsActions.setKeyBinding,
      setGlobalKeyBinding: SettingsActions.setGlobalKeyBinding
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withStyles(styles)(SettingsKeyBindings));
