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

import React, { ChangeEvent } from 'react';

import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import {
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
  authType: string;
  setAuthType: (string) => void;
  secretAccessKey: string;
  setSecretAccessKey: (string) => void;
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
    setShowPassword,
    authType,
    setAuthType,
    secretAccessKey,
    setSecretAccessKey
  } = props;

  const AuthTypes = {
    None: 'none',
    Basic: 'password',
    Digest: 'digest',
    Token: 'token'
  };

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <FormControl fullWidth={true} error={errorTextName}>
          <TextField
            required
            margin="dense"
            name="name"
            inputProps={{ autoCorrect: 'off' }}
            onChange={event => setName(event.target.value)}
            value={name}
            label={i18n.t('core:createLocationName')}
            data-tid="locationName"
            fullWidth={true}
          />
        </FormControl>
      </Grid>
      <Grid item>
        <FormControl fullWidth={true} error={errorTextName}>
          <InputLabel id="AuthID">{i18n.t('core:WebdavAuth')}</InputLabel>
          <Select
            labelId="AuthID"
            id="AuthTypeID"
            value={authType}
            label={i18n.t('core:WebdavAuth')}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setAuthType(event.target.value)
            }
          >
            {Object.keys(AuthTypes).map(auth => (
              <MenuItem key={auth} value={AuthTypes[auth]}>
                {auth}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      {(authType === AuthTypes.Basic || authType === AuthTypes.Digest) && (
        <>
          <Grid item>
            <FormControl fullWidth={true}>
              <TextField
                margin="dense"
                name="userNameId"
                fullWidth={true}
                data-tid="userNameIdTID"
                inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
                onChange={event => setUserName(event.target.value)}
                label={i18n.t('core:userName')}
                value={userName}
              />
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl fullWidth={true}>
              <TextField
                margin="dense"
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth={true}
                data-tid="passwordTID"
                inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
                onChange={event => setPassword(event.target.value)}
                value={password}
                label={i18n.t('core:password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        size="large"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </FormControl>
          </Grid>
        </>
      )}
      {authType === AuthTypes.Token && (
        <Grid item>
          <FormControl fullWidth={true}>
            <TextField
              margin="dense"
              name="webDavToken"
              type={showPassword ? 'text' : 'password'}
              fullWidth={true}
              data-tid="webDavToken"
              inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
              onChange={event => setSecretAccessKey(event.target.value)}
              value={secretAccessKey}
              label={i18n.t('core:webDavToken')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      size="large"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
        </Grid>
      )}
      <Grid item>
        <FormControl fullWidth={true} error={webdavErrorUrl}>
          <TextField
            margin="dense"
            name="endpointURL"
            fullWidth={true}
            data-tid="endpointURL"
            placeholder={i18n.t('webdavServiceURL')}
            onChange={event => setEndpointURL(event.target.value)}
            value={endpointURL}
            label={i18n.t('core:endpointURL')}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default WebdavForm;
