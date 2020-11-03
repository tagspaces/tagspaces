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
import FormHelperText from '@material-ui/core/FormHelperText';
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

const styles: any = (theme: any) => ({
  root: {
    flexGrow: 1,
    height: 250
  },
  input: {
    display: 'flex',
    padding: 0,
    height: 36,
    marginTop: 10
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden'
  },
  noOptionsMessage: {
    padding: theme.spacing(1, 2)
  },
  singleValue: {
    fontSize: 16
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16
  },
  paper: {
    // position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0
  },
  divider: {
    height: theme.spacing(2)
  }
});

interface Props {
  state: any;
  handleChange: (name: string, value: any, action: string) => void;
  handleInputChange: (event: any) => void;
  classes: any;
  theme: any;
}

interface State {
  showPassword: boolean;
}

class ObjectStoreForm extends React.Component<Props, State> {
  state = { showPassword: false };

  handleRegionChange = (inputValue: any, region: string, reason: string) => {
    if (reason === 'input') {
      this.props.handleChange('region', region, reason);
    } else if (reason === 'select-option') {
      this.props.handleChange('region', region, reason);
    }
    if (reason === 'clear') {
      this.props.handleChange('region', '', reason);
    }
  };

  handleClickShowPassword = () => {
    this.setState(prevState => ({ showPassword: !prevState.showPassword }));
  };

  render() {
    const { handleInputChange, state } = this.props;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth={true} error={state.cloudErrorTextName}>
            <InputLabel htmlFor="storeName">
              {i18n.t('core:createLocationName')}
            </InputLabel>
            <Input
              required
              autoFocus
              margin="dense"
              name="storeName"
              fullWidth={true}
              data-tid="locationName"
              onChange={handleInputChange}
              value={state.storeName}
            />
            {state.cloudErrorTextName && (
              <FormHelperText>{i18n.t('core:invalidName')}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth={true} error={state.cloudErrorTextPath}>
            <InputLabel htmlFor="path">
              {i18n.t('core:createLocationPath')}
            </InputLabel>
            <Input
              margin="dense"
              name="storePath"
              fullWidth={true}
              data-tid="locationPath"
              onChange={handleInputChange}
              value={state.storePath}
            />
            {state.cloudErrorTextPath && (
              <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth={true} error={state.cloudErrorAccessKey}>
            <InputLabel htmlFor="accessKeyId">
              {i18n.t('core:accessKeyId')}
            </InputLabel>
            <Input
              margin="dense"
              name="accessKeyId"
              fullWidth={true}
              data-tid="accessKeyId"
              onChange={handleInputChange}
              value={state.accessKeyId}
            />
            {state.cloudErrorAccessKey && (
              <FormHelperText>{i18n.t('core:invalidAccessKey')}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth={true} error={state.cloudErrorSecretAccessKey}>
            <InputLabel htmlFor="secretAccessKey">
              {i18n.t('core:secretAccessKey')}
            </InputLabel>
            <Input
              margin="dense"
              name="secretAccessKey"
              type={this.state.showPassword ? 'text' : 'password'}
              fullWidth={true}
              data-tid="secretAccessKey"
              onChange={handleInputChange}
              value={state.secretAccessKey}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={this.handleClickShowPassword}
                  >
                    {this.state.showPassword ? (
                      <Visibility />
                    ) : (
                      <VisibilityOff />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
            {state.cloudErrorSecretAccessKey && (
              <FormHelperText>
                {i18n.t('core:invalidSecretAccessKey')}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth={true} error={state.cloudErrorBucketName}>
            <InputLabel htmlFor="bucketName">
              {i18n.t('core:bucketName')}
            </InputLabel>
            <Input
              margin="dense"
              name="bucketName"
              fullWidth={true}
              data-tid="bucketName"
              onChange={handleInputChange}
              value={state.bucketName}
            />
            {state.cloudErrorBucketName && (
              <FormHelperText>
                {i18n.t('core:invalidBucketName')}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth={true} error={state.cloudErrorRegion}>
            <Autocomplete
              options={regions}
              value={state.region}
              freeSolo
              onChange={this.handleRegionChange}
              onInputChange={this.handleRegionChange}
              placeholder={i18n.t('core:regionSearch')}
              renderInput={params => (
                <TextField
                  {...params}
                  label={i18n.t('core:regionSearch')}
                  margin="normal"
                />
              )}
            />
            {state.cloudErrorRegion && (
              <FormHelperText>{i18n.t('core:invalidRegion')}</FormHelperText>
            )}
          </FormControl>
        </Grid>
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
              onChange={handleInputChange}
              value={state.endpointURL}
            />
          </FormControl>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ObjectStoreForm);
