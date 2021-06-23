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
import { withStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import i18n from '-/services/i18n';

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
  'sa-east-1'
];

interface Props {
  classes: any;
  theme: any;
  cloudErrorTextName: boolean;
  cloudErrorTextPath: boolean;
  cloudErrorAccessKey: boolean;
  cloudErrorSecretAccessKey: boolean;
  cloudErrorBucketName: boolean;
  cloudErrorRegion: boolean;
  errorTextId: boolean;
  showAdvancedMode: boolean;
  showSecretAccessKey: boolean;
  storeName: string;
  storePath: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  bucketName: string;
  region: string;
  endpointURL: string;
  newuuid: string;
  setStoreName: (string) => void;
  setStorePath: (string) => void;
  setAccessKeyId: (string) => void;
  setSecretAccessKey: (string) => void;
  setSessionToken: (string) => void;
  setShowSecretAccessKey: (boolean) => void;
  setBucketName: (string) => void;
  setRegion: (string) => void;
  setEndpointURL: (string) => void;
  setNewUuid: (string) => void;
}
const ObjectStoreForm = (props: Props) => {
  const {
    setShowSecretAccessKey,
    cloudErrorTextName,
    cloudErrorTextPath,
    cloudErrorAccessKey,
    cloudErrorSecretAccessKey,
    cloudErrorBucketName,
    cloudErrorRegion,
    errorTextId,
    showAdvancedMode,
    showSecretAccessKey,
    storeName,
    storePath,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    bucketName,
    region,
    endpointURL,
    newuuid,
    setStoreName,
    setStorePath,
    setAccessKeyId,
    setSecretAccessKey,
    setSessionToken,
    setBucketName,
    setEndpointURL,
    setNewUuid,
    setRegion
  } = props;

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
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={cloudErrorTextName}>
          <InputLabel htmlFor="storeName">
            {i18n.t('core:createLocationName')}
          </InputLabel>
          <Input
            required
            autoFocus
            margin="dense"
            name="storeName"
            inputProps={{ autoCorrect: 'off' }}
            fullWidth={true}
            data-tid="locationName"
            onChange={event => setStoreName(event.target.value)}
            value={storeName}
          />
          {/* {state.cloudErrorTextName && (
          <FormHelperText>{i18n.t('core:invalidName')}</FormHelperText>
          )} */}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={cloudErrorTextPath}>
          <InputLabel htmlFor="path">
            {i18n.t('core:createLocationPath')}
          </InputLabel>
          <Input
            margin="dense"
            name="storePath"
            fullWidth={true}
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            data-tid="locationPath"
            onChange={event => setStorePath(event.target.value)}
            value={storePath}
          />
          {/* {state.cloudErrorTextPath && (
          <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>
          )} */}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={cloudErrorAccessKey}>
          <InputLabel htmlFor="accessKeyId">
            {i18n.t('core:accessKeyId')}
          </InputLabel>
          <Input
            margin="dense"
            name="accessKeyId"
            fullWidth={true}
            data-tid="accessKeyId"
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            onChange={event => setAccessKeyId(event.target.value)}
            value={accessKeyId}
          />
          {/* {state.cloudErrorAccessKey && (
          <FormHelperText>{i18n.t('core:invalidAccessKey')}</FormHelperText>
          )} */}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={cloudErrorSecretAccessKey}>
          <InputLabel htmlFor="secretAccessKey">
            {i18n.t('core:secretAccessKey')}
          </InputLabel>
          <Input
            margin="dense"
            name="secretAccessKey"
            type={showSecretAccessKey ? 'text' : 'password'}
            fullWidth={true}
            data-tid="secretAccessKey"
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            onChange={event => setSecretAccessKey(event.target.value)}
            value={secretAccessKey}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowSecretAccessKey(!showSecretAccessKey)}
                >
                  {showSecretAccessKey ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
          {/* {state.cloudErrorSecretAccessKey && (
          <FormHelperText>
            {i18n.t('core:invalidSecretAccessKey')}
          </FormHelperText>
          )} */}
        </FormControl>
      </Grid>
      {showAdvancedMode && (
        <Grid item xs={12}>
          <FormControl fullWidth={true}>
            <InputLabel htmlFor="sessionToken">
              {i18n.t('core:sessionToken')}
            </InputLabel>
            <Input
              margin="dense"
              name="sessionToken"
              fullWidth={true}
              data-tid="sessionTokenTID"
              inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
              onChange={event => setSessionToken(event.target.value)}
              value={sessionToken}
            />
          </FormControl>
        </Grid>
      )}
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={cloudErrorBucketName}>
          <InputLabel htmlFor="bucketName">
            {i18n.t('core:bucketName')}
          </InputLabel>
          <Input
            margin="dense"
            name="bucketName"
            fullWidth={true}
            data-tid="bucketName"
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            onChange={event => setBucketName(event.target.value)}
            value={bucketName}
          />
          {/* {state.cloudErrorBucketName && (
          <FormHelperText>
            {i18n.t('core:invalidBucketName')}
          </FormHelperText>
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
            placeholder={i18n.t('core:regionSearch')}
            renderInput={params => (
              <TextField
                {...params}
                label={i18n.t('core:regionSearch')}
                margin="normal"
              />
            )}
          />
          {/* {state.cloudErrorRegion && (
          <FormHelperText>{i18n.t('core:invalidRegion')}</FormHelperText>
          )} */}
        </FormControl>
      </Grid>
      {showAdvancedMode && (
        <Grid item xs={12}>
          <FormControl fullWidth={true}>
            <InputLabel htmlFor="endpointURL">
              {i18n.t('core:endpointURL')}
            </InputLabel>
            <Input
              margin="dense"
              name="endpointURL"
              fullWidth={true}
              data-tid="endpointURL"
              placeholder="Advanced setting, could be left empty"
              onChange={event => setEndpointURL(event.target.value)}
              value={endpointURL}
            />
            {/* {state.cloudErrorId && (
          <FormHelperText>{i18n.t('core:missingId')}</FormHelperText>
          )} */}
          </FormControl>
        </Grid>
      )}
      {showAdvancedMode && (
        <Grid item xs={12}>
          <FormControl fullWidth={true} error={errorTextId}>
            <InputLabel htmlFor="newuuid">
              {i18n.t('core:locationId')}
            </InputLabel>
            <Input
              margin="dense"
              name="newuuid"
              fullWidth={true}
              data-tid="newuuid"
              placeholder="Advanced setting"
              onChange={event => setNewUuid(event.target.value)}
              value={newuuid}
            />
          </FormControl>
        </Grid>
      )}
    </Grid>
  );
};

export default withStyles(undefined, { withTheme: true })(ObjectStoreForm);
