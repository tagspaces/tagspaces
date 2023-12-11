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
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useTranslation } from 'react-i18next';

/**
 * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html
 us-east-2	US East (Ohio)	Not required	Not available
us-east-1	US East (N. Virginia)	Not required	Not available
us-west-1	US West (N. California)	Not required	Not available
us-west-2	US West (Oregon)	Not required	us-west-2-lax-1a us-west-2-lax-1b
af-south-1	Africa (Cape Town)	Required	Not available
ap-east-1	Asia Pacific (Hong Kong)	Required	Not available
ap-south-1	Asia Pacific (Mumbai)	Not required	Not available
ap-northeast-3	Asia Pacific (Osaka-Local)	Not required	Not available
ap-northeast-2	Asia Pacific (Seoul)	Not required	Not available
ap-southeast-1	Asia Pacific (Singapore)	Not required	Not available
ap-southeast-2	Asia Pacific (Sydney)	Not required	Not available
ap-northeast-1	Asia Pacific (Tokyo)	Not required	Not available
ca-central-1	Canada (Central)	Not required	Not available
eu-central-1	Europe (Frankfurt)	Not required	Not available
eu-west-1	Europe (Ireland)	Not required	Not available
eu-west-2	Europe (London)	Not required	Not available
eu-south-1	Europe (Milan)	Required	Not available
eu-west-3	Europe (Paris)	Not required	Not available
eu-north-1	Europe (Stockholm)	Not required	Not available
me-south-1	Middle East (Bahrain)	Required	Not available
sa-east-1	South America (São Paulo)	Not required	Not available
 */
export const regions = [
  'us-east-2',
  'us-east-1',
  'us-west-1',
  'us-west-2',
  'af-south-1',
  'ap-south-1',
  'ap-northeast-3',
  'ap-northeast-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ca-central-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-south-1',
  'eu-west-3',
  'eu-north-1',
  'me-south-1',
  // 'cn-north-1',
  // 'cn-northwest-1',
  'sa-east-1',
];

interface Props {
  cloudErrorTextName: boolean;
  cloudErrorTextPath: boolean;
  cloudErrorAccessKey: boolean;
  cloudErrorSecretAccessKey: boolean;
  cloudErrorBucketName: boolean;
  cloudErrorRegion: boolean;
  showSecretAccessKey: boolean;
  storeName: string;
  storePath: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  bucketName: string;
  region: string;
  endpointURL: string;
  setStoreName: (string) => void;
  setStorePath: (string) => void;
  setAccessKeyId: (string) => void;
  setSecretAccessKey: (string) => void;
  setSessionToken: (string) => void;
  setShowSecretAccessKey: (boolean) => void;
  setBucketName: (string) => void;
  setRegion: (string) => void;
  setEndpointURL: (string) => void;
}
function ObjectStoreForm(props: Props) {
  const {
    setShowSecretAccessKey,
    cloudErrorTextName,
    cloudErrorTextPath,
    cloudErrorAccessKey,
    cloudErrorSecretAccessKey,
    cloudErrorBucketName,
    cloudErrorRegion,
    showSecretAccessKey,
    storeName,
    storePath,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    bucketName,
    region,
    endpointURL,
    setStoreName,
    setStorePath,
    setAccessKeyId,
    setSecretAccessKey,
    setSessionToken,
    setBucketName,
    setEndpointURL,
    setRegion,
  } = props;
  const { t } = useTranslation();

  function handleRegionChange(inputValue: any, value: string, reason: string) {
    if (reason === 'input') {
      setRegion(value);
    } else if (reason === 'select-option') {
      setRegion(value);
    }
    if (reason === 'clear') {
      setRegion('');
    }
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={cloudErrorTextName}>
          <TextField
            required
            autoFocus
            margin="dense"
            name="storeName"
            inputProps={{ autoCorrect: 'off' }}
            fullWidth={true}
            data-tid="locationName"
            onChange={(event) => setStoreName(event.target.value)}
            value={storeName}
            label={t('core:createLocationName')}
          />
          {/* {state.cloudErrorTextName && (
          <FormHelperText>{t('core:invalidName')}</FormHelperText>
          )} */}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={cloudErrorTextPath}>
          <TextField
            margin="dense"
            name="storePath"
            fullWidth={true}
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            data-tid="locationPath"
            onChange={(event) => setStorePath(event.target.value)}
            value={storePath}
            label={t('core:createLocationPath')}
          />
          {/* {state.cloudErrorTextPath && (
          <FormHelperText>{t('core:invalidPath')}</FormHelperText>
          )} */}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={cloudErrorAccessKey}>
          <TextField
            margin="dense"
            required
            name="accessKeyId"
            fullWidth={true}
            data-tid="accessKeyId"
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            onChange={(event) => setAccessKeyId(event.target.value)}
            value={accessKeyId}
            label={t('core:accessKeyId')}
          />
          {/* {state.cloudErrorAccessKey && (
          <FormHelperText>{t('core:invalidAccessKey')}</FormHelperText>
          )} */}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={cloudErrorSecretAccessKey}>
          <TextField
            margin="dense"
            required
            name="secretAccessKey"
            type={showSecretAccessKey ? 'text' : 'password'}
            fullWidth={true}
            data-tid="secretAccessKey"
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            onChange={(event) => setSecretAccessKey(event.target.value)}
            value={secretAccessKey}
            label={t('core:secretAccessKey')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowSecretAccessKey(!showSecretAccessKey)}
                    size="large"
                  >
                    {showSecretAccessKey ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* {state.cloudErrorSecretAccessKey && (
          <FormHelperText>
            {t('core:invalidSecretAccessKey')}
          </FormHelperText>
          )} */}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true}>
          <TextField
            margin="dense"
            name="sessionToken"
            fullWidth={true}
            data-tid="sessionTokenTID"
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            onChange={(event) => setSessionToken(event.target.value)}
            value={sessionToken}
            label={t('core:sessionToken')}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={cloudErrorBucketName}>
          <TextField
            margin="dense"
            name="bucketName"
            fullWidth={true}
            data-tid="bucketName"
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            onChange={(event) => setBucketName(event.target.value)}
            value={bucketName}
            label={t('core:bucketName')}
          />
          {/* {state.cloudErrorBucketName && (
          <FormHelperText>
            {t('core:invalidBucketName')}
          </FormHelperText>
          )} */}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true}>
          <TextField
            margin="dense"
            name="endpointURL"
            fullWidth={true}
            data-tid="endpointURL"
            placeholder={t('s3serviceURL')}
            onChange={(event) => setEndpointURL(event.target.value)}
            value={endpointURL}
            label={t('core:endpointURL')}
          />
          {/* {state.cloudErrorId && (
          <FormHelperText>{t('core:missingId')}</FormHelperText>
          )} */}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={cloudErrorRegion}>
          <Autocomplete
            options={regions}
            value={region}
            freeSolo
            onChange={handleRegionChange}
            onInputChange={handleRegionChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('core:regionSearch')}
                placeholder={t('core:regionSearch')}
                margin="normal"
              />
            )}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default ObjectStoreForm;
