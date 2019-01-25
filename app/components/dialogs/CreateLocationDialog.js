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
import Button from '@material-ui/core/Button';
import uuidv1 from 'uuid';
import { withStyles } from '@material-ui/core/styles';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { Typography } from '@material-ui/core';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import { type Location, locationType } from '../../reducers/locations';
import { Pro } from '../../pro';
import ObjectStoreForm from './ObjectStoreForm';
import LocalForm from './LocalForm';

const styles = theme => ({
  root: {
    display: 'flex',
  },
  formControl: {
    margin: theme.spacing.unit * 3,
  },
  group: {
    margin: `${theme.spacing.unit}px 0`,
    display: 'flex',
    flexDirection: 'row'
  },
});

type Props = {
  classes: Object,
  open: boolean,
  onClose: () => void,
  fullScreen: boolean,
  onClose: () => void,
  addLocation: (location: Location) => void,
  perspectives: Array<Object>,
  showSelectDirectoryDialog: () => void,
  resetState: () => void,
  selectedDirectoryPath?: string | null
};

type State = {
  errorTextPath?: boolean,
  errorTextName?: boolean,
  disableConfirmButton?: boolean,
  // open?: boolean,
  name?: string,
  path?: string,
  perspective?: string,
  isDefault?: boolean,
  isReadOnly?: boolean,
  watchForChanges?: boolean,
  persistIndex?: boolean,
  type: string
};

class CreateLocationDialog extends React.Component<Props, State> {
  state = {
    errorTextPath: false,
    errorTextName: false,
    disableConfirmButton: true,
    // open: false,
    name: '',
    path: '',
    perspective: '',
    isDefault: false,
    isReadOnly: false,
    watchForChanges: Pro,
    persistIndex: false,
    type: locationType.TYPE_LOCAL
  };

  /* componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open === true) {
      const dir = nextProps.selectedDirectoryPath;
      this.setState({
        name: dir ? extractDirectoryName(dir) : '',
        path: dir || '',
        perspective: '',
        isDefault: false,
        isReadOnly: false,
        watchForChanges: !!Pro,
        persistIndex: false
      });
    }
  }; */

  /* componentWillUnmount = () => {
    console.log('CreateLocationDialog componentWillUnmount');
  }; */

  handleInputChange = (event: Object) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    if (target.type === 'radio') { // type is changed (skip validation)
      this.setState({
        [name]: value
      });
    } else {
      this.handleChange(name, value);
    }
  };

  handleChange = (name, value) => {
    this.setState({
      [name]: value
    }, () => {
      this.handleValidation(name);
    });
  };

  /* handleFieldValidation(field) {
    if (!this.state[field] || this.state[field].length === 0) {
      const errorName = 'error' + field;
      this.setState({ [errorName]: true, disableConfirmButton: true });
    }
  } */

  handleValidation(field) {
    // const pathRegex = this.state.path.match('^((\.\./|[a-zA-Z0-9_/\-\\])*\.[a-zA-Z0-9]+)$');
    // const nameRegex = this.state.name.match('^[A-Z][-a-zA-Z]+$');
    if (this.state.type === locationType.TYPE_LOCAL) {
      let errorTextName = false;
      let errorTextPath = false;
      let disableConfirmButton = false;
      if (!this.state.name || this.state.name.length === 0) {
        errorTextName = true;
        disableConfirmButton = true;
      } else if (field === 'name' && !this.state.errorTextName && !this.state.errorTextPath && this.state.disableConfirmButton) { // initial skip validation for other fields
        return new Promise(((resolve) => {
          resolve(true);
        }));
      }
      if (!this.state.path || this.state.path.length === 0) {
        errorTextPath = true; // make it optinal in cloud mode
        disableConfirmButton = true;
      }
      return new Promise(resolve => this.setState({ errorTextName, errorTextPath, disableConfirmButton }, resolve(!disableConfirmButton)));
    } else if (this.state.type === locationType.TYPE_CLOUD) {
      let cloudErrorTextName = false;
      // let cloudErrorTextPath = false;
      let cloudErrorAccessKey = false;
      let cloudErrorSecretAccessKey = false;
      let cloudErrorBucketName = false;
      let cloudErrorRegion = false;
      let disableConfirmButton = false;
      if (!this.state.storeName || this.state.storeName.length === 0) {
        cloudErrorTextName = true;
        disableConfirmButton = true;
      } else if (field === 'storeName'
        && !this.state.cloudErrorTextName
        // && !this.state.cloudErrorTextPath
        && !this.state.cloudErrorAccessKey
        && !this.state.cloudErrorSecretAccessKey
        && !this.state.cloudErrorBucketName
        && !this.state.cloudErrorRegion
        && this.state.disableConfirmButton) { // initial skip validation for other fields
        return new Promise(((resolve) => {
          resolve(true);
        }));
      }

      /* if (!this.state.storePath || this.state.storePath.length === 0) {
        cloudErrorTextPath = true;
        disableConfirmButton = true;
      } else if (field === 'storePath'
        && !this.state.cloudErrorTextName
        // && !this.state.cloudErrorTextPath
        && !this.state.cloudErrorAccessKey
        && !this.state.cloudErrorSecretAccessKey
        && !this.state.cloudErrorBucketName
        && !this.state.cloudErrorRegion
        && this.state.disableConfirmButton) { // initial skip validation for other fields
        return new Promise(((resolve) => {
          resolve(true);
        }));
        } */

      if (!this.state.accessKeyId || this.state.accessKeyId.length === 0) {
        cloudErrorAccessKey = true;
        disableConfirmButton = true;
      } else if (field === 'accessKeyId'
        && !this.state.cloudErrorTextName
        // && !this.state.cloudErrorTextPath
        && !this.state.cloudErrorAccessKey
        && !this.state.cloudErrorSecretAccessKey
        && !this.state.cloudErrorBucketName
        && !this.state.cloudErrorRegion
        && this.state.disableConfirmButton) { // initial skip validation for other fields
        return new Promise(((resolve) => {
          resolve(true);
        }));
      }

      if (!this.state.secretAccessKey || this.state.secretAccessKey.length === 0) {
        cloudErrorSecretAccessKey = true;
        disableConfirmButton = true;
      } else if (field === 'secretAccessKey'
        && !this.state.cloudErrorTextName
        // && !this.state.cloudErrorTextPath
        && !this.state.cloudErrorAccessKey
        && !this.state.cloudErrorSecretAccessKey
        && !this.state.cloudErrorBucketName
        && !this.state.cloudErrorRegion
        && this.state.disableConfirmButton) { // initial skip validation for other fields
        return new Promise(((resolve) => {
          resolve(true);
        }));
      }

      if (!this.state.bucketName || this.state.bucketName.length === 0) {
        cloudErrorBucketName = true;
        disableConfirmButton = true;
      } else if (field === 'bucketName'
        && !this.state.cloudErrorTextName
        // && !this.state.cloudErrorTextPath
        && !this.state.cloudErrorAccessKey
        && !this.state.cloudErrorSecretAccessKey
        && !this.state.cloudErrorBucketName
        && !this.state.cloudErrorRegion
        && this.state.disableConfirmButton) { // initial skip validation for other fields
        return new Promise(((resolve) => {
          resolve(true);
        }));
      }

      if (!this.state.region) {
        cloudErrorRegion = true;
        disableConfirmButton = true;
      }

      return new Promise(resolve => this.setState({
        cloudErrorTextName,
        // cloudErrorTextPath,
        cloudErrorAccessKey,
        cloudErrorSecretAccessKey,
        cloudErrorBucketName,
        disableConfirmButton,
        cloudErrorRegion }, resolve(!disableConfirmButton)));
    }
    return new Promise(((resolve) => {
      resolve(true);
    }));
  }

  onConfirm = () => {
    this.handleValidation().then((success) => {
      if (success) {
        if (this.state.type === locationType.TYPE_LOCAL) {
          this.props.addLocation({
            uuid: uuidv1(),
            type: locationType.TYPE_LOCAL,
            name: this.state.name,
            paths: [this.state.path],
            perspective: this.state.perspective,
            isDefault: this.state.isDefault,
            isReadOnly: this.state.isReadOnly,
            persistIndex: this.state.persistIndex,
            watchForChanges: this.state.watchForChanges
          });
        } else if (this.state.type === locationType.TYPE_CLOUD) {
          this.props.addLocation({
            uuid: uuidv1(),
            type: locationType.TYPE_CLOUD,
            name: this.state.storeName,
            paths: [this.state.storePath],
            accessKeyId: this.state.accessKeyId,
            secretAccessKey: this.state.secretAccessKey,
            bucketName: this.state.bucketName,
            region: this.state.region.value,
            perspective: this.state.perspective,
            isDefault: this.state.isDefault,
            isReadOnly: this.state.isReadOnly,
            persistIndex: this.state.persistIndex,
            watchForChanges: false
          });
        }
        this.props.onClose();
        this.props.resetState('createLocationDialogKey');
      }
      return true;
    }).catch((error) => {
      console.debug('Failed validation', error);
    });
  };

  onCancel = () => {
    this.props.onClose();
    this.props.resetState('createLocationDialogKey');
  }

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:createLocationTitle')}</DialogTitle>
  );

  renderContent = () => {
    // const { classes } = this.props;
    let content;
    if (this.state.type === locationType.TYPE_CLOUD) {
      content = (<ObjectStoreForm handleInputChange={this.handleInputChange} handleChange={this.handleChange} state={this.state} />);
    } else {
      content = (<LocalForm showSelectDirectoryDialog={this.props.showSelectDirectoryDialog} handleInputChange={this.handleInputChange} handleChange={this.handleChange} state={this.state} />);
    }
    return (
      <DialogContent>
        <Grid container spacing={32}>
          <Grid item xs={2} style={{ marginTop: 13, textAlign: 'left' }}>
            <Typography>{i18n.t('core:locationType')}</Typography>
          </Grid>
          <Grid item xs={10}>
            <FormControl disabled={!Pro}>
              <RadioGroup
                title={Pro ? '' : i18n.t('core:thisFunctionalityIsAvailableInPro')}
                component="label"
                aria-label={i18n.t('core:locationType')}
                name="type"
                value={this.state.type}
                onChange={this.handleInputChange}
                row
              >
                <FormControlLabel value={locationType.TYPE_LOCAL} control={<Radio />} label="Local" />
                <FormControlLabel value={locationType.TYPE_CLOUD} control={<Radio />} label="S3-Comp. Object Storage (BETA)" />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        {content}
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                data-tid="locationIsDefault"
                name="isDefault"
                checked={this.state.isDefault}
                onChange={this.handleInputChange}
              />
            }
            label={i18n.t('core:startupLocation')}
          />
          {/* <FormControlLabel
            control={
              <Switch
                disabled={!Pro}
                data-tid="changeReadOnlyMode"
                name="isReadOnly"
                checked={this.state.isReadOnly}
                onChange={this.handleInputChange}
              />
            }
            label={i18n.t('core:readonlyModeSwitch') + (Pro ? '' : ' - ' + i18n.t('core:proFeature'))}
          /> */}
          <FormControlLabel
            control={
              <Switch
                disabled={!Pro}
                data-tid="changePersistIndex"
                name="persistIndex"
                checked={this.state.persistIndex}
                onChange={this.handleInputChange}
              />
            }
            label={i18n.t('core:persistIndexSwitch') + (Pro ? '' : ' - ' + i18n.t('core:proFeature'))}
          />
          <FormControlLabel
            control={
              <Switch
                disabled={!Pro || this.state.type === locationType.TYPE_CLOUD}
                data-tid="changeWatchForChanges"
                name="watchForChanges"
                checked={this.state.watchForChanges}
                onChange={this.handleInputChange}
              />
            }
            label={i18n.t('core:watchForChangesInLocation') + (Pro ? '' : ' - ' + i18n.t('core:proFeature'))}
          />
        </FormGroup>
      </DialogContent>
    );
  };

  renderActions = () => (
    <DialogActions>
      <Button
        onClick={this.onCancel}
        color="primary"
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        disabled={this.state.disableConfirmButton}
        onClick={this.onConfirm}
        data-tid="confirmLocationCreation"
        color="primary"
      >
        {i18n.t('core:ok')}
      </Button>
    </DialogActions>
  );

  render() {
    const {
      fullScreen,
      open,
      onClose
    } = this.props;
    return (
      <GenericDialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

export default withStyles(styles)(withMobileDialog()(CreateLocationDialog));
