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
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { isStr } from '@tagspaces/tagspaces-common/misc';
import {
  actions as SettingsActions,
  getKeyBindings,
  isGlobalKeyBindingEnabled,
} from '-/reducers/settings';
import DefaultSettings from '-/reducers/settings-default';
import { AppDispatch } from '-/reducers/app';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { setGlobalShortcuts } from '-/services/utils-io';
import AppConfig from '-/AppConfig';

const PREFIX = 'SettingsKeyBindings';

const classes = {
  keyBinding: `${PREFIX}-keyBinding`,
};

const Root = styled('form')(({ theme }) => ({
  [`& .${classes.keyBinding}`]: {
    marginTop: 10,
    marginBottom: 10,
  },
}));

function SettingsKeyBindings() {
  const { t } = useTranslation();
  const keyBindings = useSelector(getKeyBindings);
  const globalKeyBindingEnabled = useSelector(isGlobalKeyBindingEnabled);
  const dispatch: AppDispatch = useDispatch();

  const setKeyBinding = (kbName, kbCommand) => {
    dispatch(SettingsActions.setKeyBinding(kbName, kbCommand));
  };

  const setGlobalKeyBinding = (value) => {
    dispatch(SettingsActions.setGlobalKeyBinding(value));
    setGlobalShortcuts(value);
  };

  return (
    <Root className={classes.keyBinding} noValidate autoComplete="off">
      <Typography variant="body2" style={{ marginBottom: 10 }}>
        The following key names can be used for defining key bindings:{' '}
        <Typography variant="overline">
          ctrl, command, alt, option, shift, space, backspace, escape, enter,
          up, down, left, right
        </Typography>{' '}
        plus letters and digits from your keyboard.
      </Typography>
      {AppConfig.isElectron && (
        <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
          <ListItemText primary={t('core:enableGlobalKeyboardShortcuts')} />
          <Switch
            onClick={() => {
              setGlobalKeyBinding(!globalKeyBindingEnabled);
            }}
            checked={globalKeyBindingEnabled}
          />
        </ListItem>
      )}
      {keyBindings.map((keyBinding) => {
        const defaultBinding = DefaultSettings.keyBindings.filter(
          (kb) => kb.name === keyBinding.name,
        )[0];
        return (
          <TextField
            className={classes.keyBinding}
            key={keyBinding.name}
            InputLabelProps={{ shrink: true }}
            fullWidth
            onBlur={(event) =>
              setKeyBinding(keyBinding.name, event.target.value)
            }
            label={t('core:' + keyBinding.name)}
            placeholder={
              'suggested binding: ' +
              (defaultBinding ? defaultBinding.command : '')
            }
            defaultValue={isStr(keyBinding.command) ? keyBinding.command : ''}
          />
        );
      })}
    </Root>
  );
}

export default SettingsKeyBindings;
