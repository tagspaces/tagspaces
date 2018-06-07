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
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import {
  DialogActions,
  DialogContent,
  DialogTitle
} from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import FolderIcon from 'material-ui-icons/Folder';
import Switch from 'material-ui/Switch';
import { FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import GenericDialog from './GenericDialog';
import i18n from '../../services/i18n';
import PlatformIO from '../../services/platform-io';
import { extractDirectoryName } from '../../utils/paths';
import AppConfig from '../../config';

class EditLocationDialog extends GenericDialog {
  state = {
    errorTextPath: false,
    errorTextName: false,
    openDirectoryButtonDisabled: false,
    uuid: '',
    name: '',
    path: '',
    perspectives: '',
    isDefault: false
  };

  componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open === true && nextProps.location) {
      const dir = nextProps.selectedDirectoryPath;
      this.setState({
        uuid: nextProps.location.uuid,
        name: dir ? extractDirectoryName(dir) : nextProps.location.name,
        path: dir || nextProps.location.paths[0],
        perspective: nextProps.location.perspective,
        isDefault: nextProps.location.isDefault
      });
    }
  };

  handleInputChange = (event: Object) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  handleValidation() {
    // const pathRegex = '^((\.\./|[a-zA-Z0-9_/\-\\])*\.[a-zA-Z0-9]+)$';
    // const nameRegex = '^[A-Z][-a-zA-Z]+$';
    if (this.state.path.length > 0) {
      this.setState({ errorTextPath: false });
    } else {
      this.setState({ errorTextPath: true });
    }

    if (this.state.name.length > 0) {
      this.setState({ errorTextName: false });
    } else {
      this.setState({ errorTextName: true });
    }
  }

  openDirectory() {
    if (AppConfig.isElectron) {
      this.setState({ openDirectoryButtonDisabled: true });
      PlatformIO.selectDirectoryDialog().then((selectedPaths) => {
        this.setState({
          openDirectoryButtonDisabled: false,
          name: extractDirectoryName(selectedPaths[0]),
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
  }

  onConfirm = () => {
    this.handleValidation();
    if (this.state.path.length > 0 && this.state.name.length > 0) {
      this.props.editLocation({
        uuid: this.state.uuid,
        name: this.state.name,
        paths: [this.state.path],
        perspective: this.state.perspective,
        isDefault: this.state.isDefault
      });

      this.props.onClose();
    }
  };

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:editLocationTitle')}</DialogTitle>
  );

  renderContent = () => (
    <DialogContent>
      <FormControl
        fullWidth={true}
        error={this.state.errorTextPath}
      >
        <InputLabel htmlFor="name">{i18n.t('core:editLocationTitle')}</InputLabel>
        <Input
          autoFocus
          required
          margin="dense"
          name="path"
          label={i18n.t('core:createLocationPath')}
          fullWidth={true}
          data-tid="editLocationPath"
          onChange={this.handleInputChange}
          value={this.state.path}
          endAdornment={
            <InputAdornment position="end" style={{ height: 32 }}>
              <IconButton
                disabled={this.state.openDirectoryButtonDisabled}
                onClick={this.openDirectory.bind(this)}
              >
                <FolderIcon />
              </IconButton>
            </InputAdornment>
          }
        />
        {this.state.errorTextPath && <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>}
      </FormControl>
      <FormControl
        fullWidth={true}
        error={this.state.errorTextPath}
      >
        <TextField
          error={this.state.errorTextPath}
          margin="dense"
          name="name"
          label={i18n.t('core:createLocationName')}
          onChange={this.handleInputChange}
          value={this.state.name}
          data-tid="editLocationName"
          fullWidth={true}
        />
        {this.state.errorTextName && <FormHelperText>Invalid Name</FormHelperText>}
      </FormControl>
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
    </DialogContent>
  );

/*
      <FormControl
        fullWidth={true}
      >
        <InputLabel htmlFor="perspective">{i18n.t('core:createLocationDefaultPerspective')}</InputLabel>
        <Select
          data-tid="editLocationDefaultPerspective"
          native
          autoWidth
          label={i18n.t('core:createLocationDefaultPerspective')}
          name="perspective"
          value={this.state.perspective}
          onChange={this.handleInputChange}
          input={<Input id="perspective" />}
        >
          {this.props.perspectives.map((persp) => (<option key={persp.id} value={persp.id}>{persp.name}</option>))}
        </Select>
      </FormControl>
*/

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="closeEditLocationDialog"
        color="primary"
        onClick={this.props.onClose}
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        onClick={this.onConfirm}
        data-tid="confirmEditLocationDialog"
        color="primary"
      >
        {i18n.t('core:ok')}
      </Button>
    </DialogActions>
  );
}

export default EditLocationDialog;

