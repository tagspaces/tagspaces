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
import uuidv1 from 'uuid';
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
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import PlatformIO from '../../services/platform-io';
import { extractDirectoryName } from '../../utils/paths';
import { type Location } from '../../reducers/locations';
import AppConfig from '../../config';

type Props = {
  open: boolean,
  onClose: () => void,
  addLocation: (location: Location) => void
};

type State = {
  errorTextPath?: boolean,
  errorTextName?: boolean,
  disableConfirmButton?: boolean,
  open?: boolean,
  name?: string,
  path?: string,
  perspective?: string,
  isDefault?: boolean
};

class CreateLocationDialog extends React.Component<Props, State> {
  state = {
    errorTextPath: false,
    errorTextName: false,
    disableConfirmButton: true,
    open: false,
    name: '',
    path: '',
    perspective: '',
    isDefault: false
  };

  handleInputChange = (event: Object) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    }, this.handleValidation);
  };

  handleValidation() {
    // const pathRegex = this.state.path.match('^((\.\./|[a-zA-Z0-9_/\-\\])*\.[a-zA-Z0-9]+)$');
    // const nameRegex = this.state.name.match('^[A-Z][-a-zA-Z]+$');

    if (this.state.path.length > 0) {
      this.setState({ errorTextPath: false, disableConfirmButton: false });
    } else {
      this.setState({ errorTextPath: true, disableConfirmButton: true });
    }

    if (this.state.name.length > 0) {
      this.setState({ errorTextName: false, disableConfirmButton: false });
    } else {
      this.setState({ errorTextName: true, disableConfirmButton: true });
    }
  }

  openDirectory() {
    if (AppConfig.isElectron) {
    PlatformIO.selectDirectoryDialog().then((selectedPaths) => {
      this.setState({
        name: extractDirectoryName(selectedPaths[0]),
        path: selectedPaths[0]
      });
      this.handleValidation();
      return true;
    }).catch((err) => {
      console.log('selectDirectoryDialog failed with: ' + err);
    });
    } else {
      this.props.showSelectDirectoryDialog();
    }
  }

  componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open === true) {
      const dir = nextProps.selectedDirectoryPath;
      this.setState({
        name: dir ? extractDirectoryName(dir) : '',
        path: dir || '',
        perspective: '',
        isDefault: false
      });
    }
  };

  onConfirm = () => {
    if (!this.state.disableConfirmButton) {
      this.props.addLocation({
        uuid: uuidv1(),
        name: this.state.name,
        paths: [this.state.path],
        perspective: this.state.perspective,
        isDefault: this.state.isDefault
      });
      this.setState({
        open: false,
        errorTextPath: false,
        errorTextName: false,
        disableConfirmButton: true
      });
      this.props.onClose();
    }
  };

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:createLocationTitle')}</DialogTitle>
  );

  renderContent = () => {
    return (
      <DialogContent>
        <FormControl
          fullWidth={true}
          error={this.state.errorTextPath}
        >
          <InputLabel htmlFor="name">{i18n.t('core:createLocationPath')}</InputLabel>
          <Input
            required
            margin="dense"
            name="path"
            label={i18n.t('core:createLocationPath')}
            fullWidth={true}
            data-tid="locationPath"
            onChange={this.handleInputChange}
            value={this.state.path}
            endAdornment={
              <InputAdornment position="end" style={{ height: 32 }}>
                <IconButton
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
            required
            margin="dense"
            name="name"
            label={i18n.t('core:createLocationName')}
            onChange={this.handleInputChange}
            value={this.state.name}
            data-tid="locationName"
            fullWidth={true}
          />
          {this.state.errorTextName && <FormHelperText>Invalid Name</FormHelperText>}
        </FormControl>
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
      </DialogContent>
    );
  };

/*
        <FormControl
          fullWidth={true}
        >
          <InputLabel htmlFor="perspective">{i18n.t('core:createLocationDefaultPerspective')}</InputLabel>
          <Select
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
      <Button onClick={this.props.onClose} >
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
    return (
      <GenericDialog
        open={this.props.open}
        onClose={this.props.onClose}
        onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

export default CreateLocationDialog;
