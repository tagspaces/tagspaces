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
import Grid from '@material-ui/core/Grid';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import i18n from '-/services/i18n';

interface Props {
  errorTextName: boolean;
  webdavErrorUrl: boolean;
  setUserName: (string) => void;
  setPassword: (string) => void;
  setName: (string) => void;
  setEndpointURL: (string) => void;
  userName: string;
  password: string;
  showPassword: boolean;
  setShowPassword: (boolean) => void;
  endpointURL: string;
  name: string;
}

function WebdavForm(props: Props) {
  const {
    errorTextName,
    webdavErrorUrl,
    setName,
    setUserName,
    setPassword,
    setEndpointURL,
    userName,
    password,
    endpointURL,
    name,
    showPassword,
    setShowPassword
  } = props;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={errorTextName}>
          <InputLabel htmlFor="name">
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
      <Grid item xs={12}>
        <FormControl fullWidth={true}>
          <InputLabel htmlFor="userNameId">
            {i18n.t('core:userName')}
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
        <FormControl fullWidth={true} error={webdavErrorUrl}>
          <InputLabel htmlFor="endpointURL">
            {i18n.t('core:endpointURL')}
          </InputLabel>
          <Input
            margin="dense"
            name="endpointURL"
            fullWidth={true}
            data-tid="endpointURL"
            placeholder={i18n.t('webdavServiceURL')}
            onChange={event => setEndpointURL(event.target.value)}
            value={endpointURL}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default WebdavForm;
