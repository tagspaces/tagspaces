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

import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import AppConfig from '@tagspaces/tagspaces-platforms/AppConfig';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import i18n from '-/services/i18n';

interface Props {
  showAdvancedMode: boolean;
  errorTextPath: boolean;
  errorTextName: boolean;
  errorTextId: boolean;
  setUserName: (string) => void;
  setPassword: (string) => void;
  setName: (string) => void;
  setHost: (string) => void;
  setNewUuid: (string) => void;
  userName: string;
  password: string;
  showPassword: boolean;
  setShowPassword: (boolean) => void;
  host: string;
  name: string;
  newuuid: string;
}

function WebdavForm(props: Props) {
  const {
    errorTextPath,
    errorTextName,
    errorTextId,
    setName,
    setUserName,
    setPassword,
    setHost,
    setNewUuid,
    userName,
    password,
    host,
    name,
    newuuid,
    showAdvancedMode,
    showPassword,
    setShowPassword
  } = props;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl fullWidth={true}>
          <InputLabel htmlFor="userNameId">
            {i18n.t('core:userNameId')}
          </InputLabel>
          <Input
            margin="dense"
            name="userNameId"
            fullWidth={true}
            data-tid="userNameIdTID"
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            onChange={event => setUserName(event.target.value)}
            value={userName}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true}>
          <InputLabel htmlFor="password">{i18n.t('core:password')}</InputLabel>
          <Input
            margin="dense"
            name="password"
            type={showPassword ? 'text' : 'password'}
            fullWidth={true}
            data-tid="secretAccessKey"
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            onChange={event => setPassword(event.target.value)}
            value={password}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={errorTextPath}>
          <InputLabel htmlFor="host">{i18n.t('core:webdavHost')}</InputLabel>
          <Input
            required
            autoFocus
            margin="dense"
            name="host"
            fullWidth={true}
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            data-tid="webdavHostTID"
            onChange={event => setHost(event.target.value)}
            value={host}
            placeholder="Enter a webdav host"
          />
          {AppConfig.isCordovaAndroid && (
            <FormHelperText>
              Examples: http://my.host:8899/local/webdav
            </FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={errorTextName}>
          <InputLabel htmlFor="path">
            {i18n.t('core:createLocationName')}
          </InputLabel>
          <Input
            required
            margin="dense"
            name="name"
            inputProps={{ autoCorrect: 'off' }}
            onChange={event => setName(event.target.value)}
            value={name}
            data-tid="locationName"
            fullWidth={true}
          />
        </FormControl>
      </Grid>
      {showAdvancedMode && (
        <Grid item xs={12}>
          <FormControl fullWidth={true} error={errorTextId}>
            <InputLabel htmlFor="newuuid">
              {i18n.t('core:locationId')}
            </InputLabel>
            <Input
              required
              margin="dense"
              name="newuuid"
              fullWidth={true}
              data-tid="newuuid"
              placeholder="Unique location identifier"
              onChange={event => setNewUuid(event.target.value)}
              value={newuuid}
            />
          </FormControl>
        </Grid>
      )}
    </Grid>
  );
}

export default WebdavForm;
