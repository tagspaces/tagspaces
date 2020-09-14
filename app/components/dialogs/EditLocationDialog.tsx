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
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Button from '@material-ui/core/Button';
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
import Dialog from '@material-ui/core/Dialog';
import i18n from '-/services/i18n';
import { extractDirectoryName } from '-/utils/paths';
import { Location, locationType } from '-/reducers/locations';
import ObjectStoreForm from './ObjectStoreForm';
import LocalForm from './LocalForm';
import { Pro } from '-/pro';
import PlatformIO from '-/services/platform-io';

interface Props {
  open: boolean;
  fullScreen?: boolean;
  resetState: (param: string) => void;
  onClose: () => void;
  location: Location | null;
  editLocation: (location: Location) => void;
  showSelectDirectoryDialog: () => void;
  selectedDirectoryPath: string | null;
  onCancel?: () => void;
}

interface State {
  errorTextPath: boolean;
  errorTextName: boolean;
  disableConfirmButton: boolean;
  cloudErrorTextName: boolean;
  cloudErrorBucketName: boolean;
  cloudErrorRegion: boolean;
  cloudErrorAccessKey: boolean;
  cloudErrorSecretAccessKey: boolean;
  uuid: string;
  name: string;
  path: string;
  endpointURL: string;
  isDefault: boolean;
  isReadOnly: boolean;
  watchForChanges: boolean;
  fullTextIndex: boolean;
  persistIndex: boolean;
  storeName: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region?: any;
  storePath: string;
  type: string;
}

class EditLocationDialog extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    if (props.open === true && props.location) {
      const dir = props.selectedDirectoryPath;
      let properties;
      if (props.location.type === locationType.TYPE_CLOUD) {
        properties = {
          storeName: dir
            ? extractDirectoryName(dir, PlatformIO.getDirSeparator())
            : props.location.name,
          storePath: dir || props.location.paths[0]
        };
      } else {
        properties = {
          // TODO maybe its better to separate name/path keys for different locationTypes ??
          name: dir
            ? extractDirectoryName(dir, PlatformIO.getDirSeparator())
            : props.location.name,
          path: dir || props.location.paths[0]
        };
      }
      this.state = {
        ...properties,
        uuid: props.location.uuid,
        isDefault: props.location.isDefault,
        isReadOnly: props.location.isReadOnly,
        watchForChanges: props.location.watchForChanges,
        persistIndex: props.location.persistIndex,
        fullTextIndex: props.location.fullTextIndex,
        type: props.location.type || locationType.TYPE_LOCAL,
        accessKeyId: props.location.accessKeyId,
        secretAccessKey: props.location.secretAccessKey,
        bucketName: props.location.bucketName,
        endpointURL: props.location.endpointURL,
        region: props.location.region
      };
    } else {
      this.state = {
        errorTextPath: false,
        errorTextName: false,
        disableConfirmButton: true,
        cloudErrorTextName: false,
        cloudErrorBucketName: false,
        cloudErrorRegion: false,
        cloudErrorAccessKey: false,
        cloudErrorSecretAccessKey: false,
        uuid: '',
        name: '',
        path: '',
        endpointURL: '',
        isDefault: false,
        isReadOnly: false,
        watchForChanges: false,
        persistIndex: false,
        fullTextIndex: false,
        storeName: '',
        accessKeyId: '',
        secretAccessKey: '',
        bucketName: '',
        region: undefined,
        storePath: '',
        type: locationType.TYPE_LOCAL
      };
    }
  }

  /* componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open === true && nextProps.location) {
      const dir = nextProps.selectedDirectoryPath;
      let properties;
      if (nextProps.location.type === locationType.TYPE_CLOUD) {
        properties = {
          storeName: dir
            ? extractDirectoryName(dir, PlatformIO.getDirSeparator())
            : nextProps.location.name,
          storePath: dir || nextProps.location.paths[0]
        };
      } else {
        properties = {
          // TODO maybe its better to separate name/path keys for different locationTypes ??
          name: dir
            ? extractDirectoryName(dir, PlatformIO.getDirSeparator())
            : nextProps.location.name,
          path: dir || nextProps.location.paths[0]
        };
      }
      this.setState({
        ...properties,
        uuid: nextProps.location.uuid,
        isDefault: nextProps.location.isDefault,
        isReadOnly: nextProps.location.isReadOnly,
        watchForChanges: nextProps.location.watchForChanges,
        persistIndex: nextProps.location.persistIndex,
        fullTextIndex: nextProps.location.fullTextIndex,
        type: nextProps.location.type || locationType.TYPE_LOCAL,
        accessKeyId: nextProps.location.accessKeyId,
        secretAccessKey: nextProps.location.secretAccessKey,
        bucketName: nextProps.location.bucketName,
        endpointURL: nextProps.location.endpointURL,
        region: nextProps.location.region
      });
    }
  }; */

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    if (target.type === 'radio') {
      // type is changed (skip validation)
      // @ts-ignore
      this.setState({
        [name]: value
      });
    } else {
      this.handleChange(name, value);
    }
  };

  handleChange = (name, value) => {
    this.setState(
      // @ts-ignore
      {
        [name]: value
      },
      this.handleValidation
    );
  };

  handleValidation() {
    // const pathRegex = this.state.path.match('^((\.\./|[a-zA-Z0-9_/\-\\])*\.[a-zA-Z0-9]+)$');
    // const nameRegex = this.state.name.match('^[A-Z][-a-zA-Z]+$');
    if (this.state.type === locationType.TYPE_CLOUD) {
      let cloudErrorTextName = false;
      let cloudErrorAccessKey = false;
      let cloudErrorSecretAccessKey = false;
      let disableConfirmButton = false;
      if (!this.state.storeName || this.state.storeName.length === 0) {
        cloudErrorTextName = true;
        disableConfirmButton = true;
      }

      if (!this.state.accessKeyId || this.state.accessKeyId.length === 0) {
        cloudErrorAccessKey = true;
        disableConfirmButton = true;
      }

      if (
        !this.state.secretAccessKey ||
        this.state.secretAccessKey.length === 0
      ) {
        cloudErrorSecretAccessKey = true;
        disableConfirmButton = true;
      }

      // @ts-ignore
      this.setState({
        cloudErrorTextName,
        cloudErrorAccessKey,
        cloudErrorSecretAccessKey,
        disableConfirmButton
      });
    } else {
      let errorTextName = false;
      let errorTextPath = false;
      let disableConfirmButton = false;
      if (!this.state.name || this.state.name.length === 0) {
        errorTextName = true;
        disableConfirmButton = true;
      }
      if (!this.state.path || this.state.path.length === 0) {
        errorTextPath = true; // make in optional in cloud mode
        disableConfirmButton = true;
      }
      this.setState({ errorTextName, errorTextPath, disableConfirmButton });
    }
  }

  /* openDirectory = () => {
    if (AppConfig.isElectron) {
      this.setState({ openDirectoryButtonDisabled: true });
      PlatformIO.selectDirectoryDialog().then((selectedPaths) => {
        const newName = (this.state.name.length < 1) ? extractDirectoryName(selectedPaths[0]) : this.state.name;
        this.setState({
          openDirectoryButtonDisabled: false,
          name: newName,
          path: selectedPaths[0]
        });
        this.handleValidation();
        return true;
      }).catch((err) => {
        this.setState({ openDirectoryButtonDisabled: false });
        console.log('selectDirectoryDialog failed with: ' + err);
      });
    } else {
      this.props.showSelectDirectoryDialog();
    }
  } */

  onConfirm = () => {
    if (!this.state.disableConfirmButton) {
      if (this.state.type === locationType.TYPE_LOCAL) {
        this.props.editLocation({
          uuid: this.state.uuid,
          type: locationType.TYPE_LOCAL,
          name: this.state.name,
          paths: [this.state.path],
          isDefault: this.state.isDefault,
          isReadOnly: this.state.isReadOnly,
          persistIndex: this.state.persistIndex,
          fullTextIndex: this.state.fullTextIndex,
          watchForChanges: this.state.watchForChanges
        });
      } else if (this.state.type === locationType.TYPE_CLOUD) {
        this.props.editLocation({
          uuid: this.state.uuid,
          type: locationType.TYPE_CLOUD,
          name: this.state.storeName,
          paths: [this.state.storePath],
          endpointURL: this.state.endpointURL,
          accessKeyId: this.state.accessKeyId,
          secretAccessKey: this.state.secretAccessKey,
          bucketName: this.state.bucketName,
          region: this.state.region,
          isDefault: this.state.isDefault,
          isReadOnly: this.state.isReadOnly,
          persistIndex: this.state.persistIndex,
          fullTextIndex: this.state.fullTextIndex,
          watchForChanges: false
        });
      }
      this.props.onClose();
      this.props.resetState('editLocationDialogKey');
    }
  };

  onCancel = () => {
    this.props.onClose();
    this.props.resetState('editLocationDialogKey');
  };

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:editLocationTitle')}</DialogTitle>
  );

  renderContent = () => {
    let content;
    if (this.state.type === locationType.TYPE_CLOUD) {
      content = (
        <ObjectStoreForm
          handleInputChange={this.handleInputChange}
          handleChange={this.handleChange}
          state={this.state}
        />
      );
    } else {
      content = (
        <LocalForm
          showSelectDirectoryDialog={this.props.showSelectDirectoryDialog}
          handleInputChange={this.handleInputChange}
          handleChange={this.handleChange}
          state={this.state}
        />
      );
    }
    return (
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={2} style={{ marginTop: 13, textAlign: 'left' }}>
            <Typography>{i18n.t('core:locationType')}</Typography>
          </Grid>
          <Grid item xs={10}>
            <FormControl disabled={!Pro}>
              <RadioGroup
                title={
                  Pro ? '' : i18n.t('core:thisFunctionalityIsAvailableInPro')
                }
                aria-label={i18n.t('core:locationType')}
                name="type"
                value={this.state.type}
                onChange={this.handleInputChange}
                row
              >
                <FormControlLabel
                  value={locationType.TYPE_LOCAL}
                  control={<Radio />}
                  label="Local"
                />
                <FormControlLabel
                  value={locationType.TYPE_CLOUD}
                  control={<Radio />}
                  title={i18n.t('core:objectStorageTitle')}
                  label={i18n.t('core:objectStorage')}
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        {content}
        <FormControl>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  data-tid="editStartupLocation"
                  name="isDefault"
                  checked={this.state.isDefault}
                  onChange={this.handleInputChange}
                />
              }
              label={i18n.t('core:startupLocation')}
            />
            <FormControlLabel
              control={
                <Switch
                  disabled={!Pro}
                  data-tid="changeReadOnlyMode"
                  name="isReadOnly"
                  checked={this.state.isReadOnly}
                  onChange={this.handleInputChange}
                />
              }
              label={
                i18n.t('core:readonlyModeSwitch') +
                (Pro ? '' : ' - ' + i18n.t('core:proFeature'))
              }
            />
            <FormControlLabel
              control={
                <Switch
                  disabled={!Pro}
                  data-tid="changeFullTextIndex"
                  name="fullTextIndex"
                  checked={this.state.fullTextIndex}
                  onChange={this.handleInputChange}
                />
              }
              label={
                i18n.t('core:createFullTextIndex') +
                (Pro ? '' : ' - ' + i18n.t('core:proFeature'))
              }
            />
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
              label={
                i18n.t('core:persistIndexSwitch') +
                (Pro ? '' : ' - ' + i18n.t('core:proFeature'))
              }
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
              label={
                i18n.t('core:watchForChangesInLocation') +
                (Pro ? '' : ' - ' + i18n.t('core:proFeature'))
              }
            />
          </FormGroup>
        </FormControl>
      </DialogContent>
    );
  };

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="closeEditLocationDialog"
        color="primary"
        onClick={() => {
          this.props.onClose();
          this.props.resetState('editLocationDialogKey');
        }}
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        disabled={this.state.disableConfirmButton}
        onClick={this.onConfirm}
        data-tid="confirmEditLocationDialog"
        color="primary"
      >
        {i18n.t('core:ok')}
      </Button>
    </DialogActions>
  );

  render() {
    const { open, onClose, fullScreen, onCancel } = this.props;
    return (
      <Dialog
        open={open}
        onClose={onCancel}
        fullScreen={fullScreen}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            event.stopPropagation();
            this.onConfirm();
          } else if (event.key === 'Escape') {
            onClose();
          }
        }}
      >
        {this.renderTitle()}
        {this.renderContent()}
        {this.renderActions()}
      </Dialog>
    );
  }
}

export default withMobileDialog()(EditLocationDialog);
