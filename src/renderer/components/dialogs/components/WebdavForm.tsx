/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import { ChangeEvent } from 'react';

import TsIconButton from '-/components/TsIconButton';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Grid, InputAdornment, MenuItem, Select } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';

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
    setSecretAccessKey,
  } = props;
  const { t } = useTranslation();

  const AuthTypes = {
    None: 'none',
    Basic: 'password',
    Digest: 'digest',
    Token: 'token',
  };

  return (
    <Grid container direction="column" spacing={1}>
      <Grid>
        <FormControl fullWidth={true} error={errorTextName}>
          <TextField
            required
            margin="dense"
            name="name"
            slotProps={{
              input: { autoCorrect: 'off' },
            }}
            onChange={(event) => setName(event.target.value)}
            value={name}
            label={t('core:createLocationName')}
            data-tid="locationName"
            fullWidth={true}
          />
        </FormControl>
      </Grid>
      <Grid>
        <FormControl fullWidth={true} error={errorTextName}>
          <InputLabel id="AuthID">{t('core:WebdavAuth')}</InputLabel>
          <Select
            labelId="AuthID"
            id="AuthTypeID"
            value={authType}
            label={t('core:WebdavAuth')}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setAuthType(event.target.value)
            }
          >
            {Object.keys(AuthTypes).map((auth) => (
              <MenuItem key={auth} value={AuthTypes[auth]}>
                {auth}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      {(authType === AuthTypes.Basic || authType === AuthTypes.Digest) && (
        <>
          <Grid>
            <FormControl fullWidth={true}>
              <TextField
                margin="dense"
                name="userNameId"
                fullWidth={true}
                data-tid="userNameIdTID"
                slotProps={{
                  input: { autoCorrect: 'off', autoCapitalize: 'none' },
                }}
                onChange={(event) => setUserName(event.target.value)}
                label={t('core:userName')}
                value={userName}
              />
            </FormControl>
          </Grid>
          <Grid>
            <FormControl fullWidth={true}>
              <TextField
                margin="dense"
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth={true}
                data-tid="passwordTID"
                onChange={(event) => setPassword(event.target.value)}
                value={password}
                label={t('core:password')}
                slotProps={{
                  input: {
                    autoCorrect: 'off',
                    autoCapitalize: 'none',
                    endAdornment: (
                      <InputAdornment position="end">
                        <TsIconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </TsIconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </FormControl>
          </Grid>
        </>
      )}
      {authType === AuthTypes.Token && (
        <Grid>
          <FormControl fullWidth={true}>
            <TextField
              margin="dense"
              name="webDavToken"
              type={showPassword ? 'text' : 'password'}
              fullWidth={true}
              data-tid="webDavToken"
              onChange={(event) => setSecretAccessKey(event.target.value)}
              value={secretAccessKey}
              label={t('core:webDavToken')}
              slotProps={{
                input: {
                  autoCorrect: 'off',
                  autoCapitalize: 'none',
                  endAdornment: (
                    <InputAdornment position="end">
                      <TsIconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </TsIconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </FormControl>
        </Grid>
      )}
      <Grid>
        <FormControl fullWidth={true} error={webdavErrorUrl}>
          <TextField
            margin="dense"
            name="endpointURL"
            fullWidth={true}
            data-tid="endpointURL"
            placeholder={t('webdavServiceURL')}
            onChange={(event) => setEndpointURL(event.target.value)}
            value={endpointURL}
            label={t('core:endpointURL')}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default WebdavForm;
