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

import InfoIcon from '-/components/InfoIcon';
import TsIconButton from '-/components/TsIconButton';
import TsTextField from '-/components/TsTextField';
import { isDevMode } from '-/reducers/settings';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

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
  const devMode: boolean = useSelector(isDevMode);

  function handleRegionChange(inputValue: any, value: string, reason: string) {
    if (reason === 'input') {
      setRegion(value);
    } else if (reason === 'selectOption') {
      setRegion(value);
    }
    if (reason === 'clear') {
      //|| reason === 'reset') {
      setRegion('');
    }
  }

  return (
    <Grid container>
      <Grid size={12}>
        <FormControl fullWidth={true}>
          <TsTextField
            required
            autoFocus
            name="storeName"
            slotProps={{
              input: { autoCorrect: 'off' },
            }}
            data-tid="locationName"
            onChange={(event) => setStoreName(event.target.value)}
            value={storeName}
            label={t('core:createLocationName') + ' *'}
          />
          {cloudErrorTextName && (
            <FormHelperText
              sx={{ marginLeft: 0, marginTop: 0, marginBottom: '10px' }}
            >
              {t('core:invalidName')}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid size={12}>
        <FormControl fullWidth={true}>
          <TsTextField
            name="storePath"
            slotProps={{
              input: { autoCorrect: 'off', autoCapitalize: 'none' },
            }}
            data-tid="locationPath"
            onChange={(event) => setStorePath(event.target.value)}
            value={storePath}
            label={
              <>
                {t('core:createLocationPath')}
                <InfoIcon
                  tooltip={t(
                    'Optional parameter which can be used to specify a path to folder in the bucket, which will be the root of the location',
                  )}
                />
              </>
            }
          />
          {cloudErrorTextPath && (
            <FormHelperText
              sx={{ marginLeft: 0, marginTop: 0, marginBottom: '10px' }}
            >
              {t('core:invalidPath')}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid size={12}>
        <FormControl fullWidth={true}>
          <TsTextField
            required
            name="accessKeyId"
            data-tid="accessKeyId"
            slotProps={{
              input: { autoCorrect: 'off', autoCapitalize: 'none' },
            }}
            onChange={(event) => setAccessKeyId(event.target.value)}
            value={accessKeyId}
            label={t('core:accessKeyId') + ' *'}
          />
          {cloudErrorAccessKey && (
            <FormHelperText
              sx={{ marginLeft: 0, marginTop: 0, marginBottom: '10px' }}
            >
              {t('core:invalidAccessKey')}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid size={12}>
        {/* error={cloudErrorSecretAccessKey} */}
        <FormControl fullWidth={true}>
          <TsTextField
            required
            name="secretAccessKey"
            type={showSecretAccessKey ? 'text' : 'password'}
            data-tid="secretAccessKey"
            onChange={(event) => setSecretAccessKey(event.target.value)}
            value={secretAccessKey}
            label={t('core:secretAccessKey') + ' *'}
            slotProps={{
              input: {
                autoCorrect: 'off',
                autoCapitalize: 'none',
                endAdornment: (
                  <InputAdornment position="end">
                    <TsIconButton
                      tooltip={t('toggleKeyVisibility')}
                      aria-label="toggle password visibility"
                      onClick={() =>
                        setShowSecretAccessKey(!showSecretAccessKey)
                      }
                    >
                      {showSecretAccessKey ? <Visibility /> : <VisibilityOff />}
                    </TsIconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </FormControl>
      </Grid>
      <Grid size={12}>
        <FormControl fullWidth={true} error={cloudErrorBucketName}>
          <TsTextField
            name="bucketName"
            data-tid="bucketName"
            slotProps={{
              input: { autoCorrect: 'off', autoCapitalize: 'none' },
            }}
            onChange={(event) => setBucketName(event.target.value)}
            value={bucketName}
            label={t('core:bucketName')}
          />
        </FormControl>
      </Grid>
      <Grid size={12}>
        <FormControl fullWidth={true}>
          <TsTextField
            name="endpointURL"
            data-tid="endpointURL"
            placeholder={t('s3serviceURL')}
            onChange={(event) => setEndpointURL(event.target.value)}
            value={endpointURL}
            label={t('core:endpointURL')}
          />
        </FormControl>
      </Grid>
      <Grid size={12}>
        <FormControl fullWidth={true} error={cloudErrorRegion}>
          <Autocomplete
            options={regions}
            value={region}
            freeSolo
            onChange={handleRegionChange}
            onInputChange={handleRegionChange}
            renderInput={(params) => (
              <TsTextField
                {...params}
                label={t('core:regionSearch')}
                data-tid="regionTID"
                placeholder={t('core:regionSearch')}
                margin="normal"
              />
            )}
          />
        </FormControl>
      </Grid>
      {devMode && (
        <Grid size={12}>
          <FormControl fullWidth={true}>
            <TsTextField
              name="sessionToken"
              data-tid="sessionTokenTID"
              slotProps={{
                input: { autoCorrect: 'off', autoCapitalize: 'none' },
              }}
              onChange={(event) => setSessionToken(event.target.value)}
              value={sessionToken}
              label={t('core:sessionToken')}
            />
          </FormControl>
        </Grid>
      )}
    </Grid>
  );
}

export default ObjectStoreForm;
