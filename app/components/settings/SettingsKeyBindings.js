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
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import PlatformIO from '../../services/platform-io';
import i18n from '../../services/i18n';
import {
  actions as SettingsActions,
  getKeyBindings, isGlobalKeyBindingEnabled,
} from '../../reducers/settings';
import DefaultSettings from '../../reducers/settings-default';
import { isStr } from '../../utils/misc';

const styles = theme => ({
  root: {
    background: theme.palette.background.paper
  },
  keyBinding: {
    marginTop: 10,
    marginBottom: 10,
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0
  },
});

type Props = {
  classes: Object,
  keyBindings: Array<Object>,
  setKeyBinding: (kbName: string, kbCommand: string) => void,
  setGlobalKeyBinding: (value: boolean) => void,
  globalKeyBindingEnabled: boolean
};

const SettingsKeyBindings = (props: Props) => {
  const { keyBindings, classes, setKeyBinding, setGlobalKeyBinding, globalKeyBindingEnabled } = props;
  return (
    <form className={classes.root} noValidate autoComplete="off">
      <ListItem className={classes.listItem}>
        <ListItemText primary={i18n.t('core:enableGlobalKeyboardShortcuts')} />
        <Switch
          onClick={() => {
            setGlobalKeyBinding(!globalKeyBindingEnabled);
            PlatformIO.setGlobalShortcuts(!globalKeyBindingEnabled);
          }}
          checked={globalKeyBindingEnabled}
        />
      </ListItem>
      {keyBindings.map((keyBinding) => {
        const defaultBinding = DefaultSettings.keyBindings.filter(kb => kb.name === keyBinding.name)[0];
        return (
          <TextField
            className={classes.keyBinding}
            key={keyBinding.name}
            InputLabelProps={{ shrink: true }}
            fullWidth
            onBlur={event => setKeyBinding(keyBinding.name, event.target.value)}
            label={i18n.t('core:' + keyBinding.name)}
            placeholder={'suggested binding: ' + (defaultBinding ? defaultBinding.command : '')}
            defaultValue={(isStr(keyBinding.command) ? keyBinding.command : '')}
          />
        );
      })}
    </form>
  );
};

function mapStateToProps(state) {
  return {
    keyBindings: getKeyBindings(state),
    globalKeyBindingEnabled: isGlobalKeyBindingEnabled(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(SettingsActions, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(withStyles(styles)(SettingsKeyBindings));
