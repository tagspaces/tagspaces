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
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import { extractDirectoryName } from '../../utils/paths';
import { type Location, locationType } from '../../reducers/locations';
import ObjectStoreForm, { suggestions } from './ObjectStoreForm';
import LocalForm from './LocalForm';
import { Pro } from '../../pro';

type Props = {
  open?: boolean,
  fullScreen: boolean,
  resetState: () => void,
  onClose: () => void,
  location?: Location | null,
  editLocation: (location: Location) => void,
  perspectives: Array<Object>,
  showSelectDirectoryDialog: () => void,
  selectedDirectoryPath?: string | null
};

type State = {
  errorTextPath: boolean,
  errorTextName: boolean,
  disableConfirmButton: boolean,
  // openDirectoryButtonDisabled?: boolean,
  uuid: string,
  name: string,
  path: string,
  perspective: '',
  isDefault: boolean,
  isReadOnly: boolean,
  watchForChanges: boolean,
  fullTextIndex: boolean,
  persistIndex: boolean
};

class EditLocationDialog extends React.Component<Props, State> {
  state = {
    errorTextPath: false,
    errorTextName: false,
    disableConfirmButton: true,
    // openDirectoryButtonDisabled: false,
    uuid: '',
    name: '',
    path: '',
    perspective: '',
    isDefault: false,
    isReadOnly: false,
    watchForChanges: false,
    persistIndex: false,
    fullTextIndex: false,
    type: locationType.TYPE_LOCAL
  };

   componentWillReceiveProps = (nextProps: any) => {
     if (nextProps.open === true && nextProps.location) {
       const dir = nextProps.selectedDirectoryPath;
       let properties;
       if (nextProps.location.type === locationType.TYPE_CLOUD) {
         properties = {
           storeName: dir ? extractDirectoryName(dir) : nextProps.location.name,
           storePath: dir || nextProps.location.paths[0],
         };
       } else {
         properties = { // TODO maybe its better to separate name/path keys for different locationTypes ??
           name: dir ? extractDirectoryName(dir) : nextProps.location.name,
           path: dir || nextProps.location.paths[0],
         };
       }
       this.setState({
         ...properties,
         uuid: nextProps.location.uuid,
         perspective: nextProps.location.perspective,
         isDefault: nextProps.location.isDefault,
         isReadOnly: nextProps.location.isReadOnly,
         watchForChanges: nextProps.location.watchForChanges,
         persistIndex: nextProps.location.persistIndex,
         fullTextIndex: nextProps.location.fullTextIndex,
         type: nextProps.location.type || locationType.TYPE_LOCAL,
         accessKeyId: nextProps.location.accessKeyId,
         secretAccessKey: nextProps.location.secretAccessKey,
         bucketName: nextProps.location.bucketName,
         region: suggestions.find(obj => obj.value === nextProps.location.region)
       });
     }
   };

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
    }, this.handleValidation);
  };

  handleValidation() {
    // const pathRegex = this.state.path.match('^((\.\./|[a-zA-Z0-9_/\-\\])*\.[a-zA-Z0-9]+)$');
    // const nameRegex = this.state.name.match('^[A-Z][-a-zA-Z]+$');
    if (this.state.type === locationType.TYPE_CLOUD) {
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
      }

      /* if (!this.state.storePath || this.state.storePath.length === 0) {
        cloudErrorTextPath = true;
        disableConfirmButton = true;
      } */

      if (!this.state.accessKeyId || this.state.accessKeyId.length === 0) {
        cloudErrorAccessKey = true;
        disableConfirmButton = true;
      }

      if (!this.state.secretAccessKey || this.state.secretAccessKey.length === 0) {
        cloudErrorSecretAccessKey = true;
        disableConfirmButton = true;
      }

      if (!this.state.bucketName || this.state.bucketName.length === 0) {
        cloudErrorBucketName = true;
        disableConfirmButton = true;
      }

      if (!this.state.region) {
        cloudErrorRegion = true;
        disableConfirmButton = true;
      }

      this.setState({
        cloudErrorTextName,
        // cloudErrorTextPath,
        cloudErrorAccessKey,
        cloudErrorSecretAccessKey,
        cloudErrorBucketName,
        disableConfirmButton,
        cloudErrorRegion
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
          perspective: this.state.perspective,
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
          accessKeyId: this.state.accessKeyId,
          secretAccessKey: this.state.secretAccessKey,
          bucketName: this.state.bucketName,
          region: this.state.region.value,
          perspective: this.state.perspective,
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
  }

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:editLocationTitle')}</DialogTitle>
  );

  renderContent = () => {
    let content;
    if (this.state.type === locationType.TYPE_CLOUD) {
      content = (<ObjectStoreForm
        handleInputChange={this.handleInputChange}
        handleChange={this.handleChange}
        state={this.state}
      />);
    } else {
      content = (<LocalForm
        showSelectDirectoryDialog={this.props.showSelectDirectoryDialog}
        handleInputChange={this.handleInputChange}
        handleChange={this.handleChange}
        state={this.state}
      />);
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
                <FormControlLabel value={locationType.TYPE_CLOUD} control={<Radio />} title="AWS S3 compatible object storage" label="AWS S3 Object Storage [BETA]" />
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
              label={i18n.t('core:readonlyModeSwitch') + (Pro ? '' : ' - ' + i18n.t('core:proFeature'))}
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
              label={i18n.t('core:createFullTextIndex') + (Pro ? '' : ' - ' + i18n.t('core:proFeature'))}
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
        </FormControl>
      </DialogContent>
    );
  };

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="closeEditLocationDialog"
        color="primary"
        onClick={() => { this.props.onClose(); this.props.resetState('editLocationDialogKey'); }}
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
    const {
      fullScreen,
      open,
    } = this.props;
    return (
      <GenericDialog
        open={open}
        onClose={this.onCancel}
        fullScreen={fullScreen}
        onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

export default withMobileDialog()(EditLocationDialog);

