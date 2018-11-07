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
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormGroup from '@material-ui/core/FormGroup';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import PlatformIO from '../../services/platform-io';
import { extractDirectoryName } from '../../utils/paths';
import { type Location } from '../../reducers/locations';
import AppConfig from '../../config';
import { Pro } from '../../pro';

type Props = {
  open?: boolean,
  onClose: () => void,
  location?: Location | null,
  editLocation: (location: Location) => void,
  perspectives: Array<Object>,
  showSelectDirectoryDialog: () => void,
  selectedDirectoryPath?: string | null
};

type State = {
  errorTextPath?: boolean,
  errorTextName?: boolean,
  openDirectoryButtonDisabled?: boolean,
  uuid?: string,
  name?: string,
  path?: string,
  perspective?: '',
  isDefault?: boolean,
  isReadOnly?: boolean,
  watchForChanges?: boolean,
  persistIndex?: boolean
};

class EditLocationDialog extends React.Component<Props, State> {
  state = {
    errorTextPath: false,
    errorTextName: false,
    openDirectoryButtonDisabled: false,
    uuid: '',
    name: '',
    path: '',
    perspective: '',
    isDefault: false,
    isReadOnly: false,
    watchForChanges: false,
    persistIndex: false
  };

  componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open === true && nextProps.location) {
      const dir = nextProps.selectedDirectoryPath;
      this.setState({
        uuid: nextProps.location.uuid,
        name: dir ? extractDirectoryName(dir) : nextProps.location.name,
        path: dir || nextProps.location.paths[0],
        perspective: nextProps.location.perspective,
        isDefault: nextProps.location.isDefault,
        isReadOnly: nextProps.location.isReadOnly,
        watchForChanges: nextProps.location.watchForChanges,
        persistIndex: nextProps.location.persistIndex
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
    if (this.state.path && this.state.path.length > 0) {
      this.setState({ errorTextPath: false });
    } else {
      this.setState({ errorTextPath: true });
    }

    if (this.state.name && this.state.name.length > 0) {
      this.setState({ errorTextName: false });
    } else {
      this.setState({ errorTextName: true });
    }
  }

  openDirectory = () => {
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
  }

  onConfirm = () => {
    this.handleValidation();
    if (this.state.path && this.state.path.length > 0 && this.state.name && this.state.name.length > 0) {
      this.props.editLocation({
        uuid: this.state.uuid,
        name: this.state.name,
        paths: [this.state.path],
        perspective: this.state.perspective,
        isDefault: this.state.isDefault,
        isReadOnly: this.state.isReadOnly,
        watchForChanges: this.state.watchForChanges,
        persistIndex: this.state.persistIndex
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
      <FormControl
        fullWidth={true}
        error={this.state.errorTextPath}
      >
        <InputLabel htmlFor="name">{i18n.t('core:editLocationPath')}</InputLabel>
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
                onClick={this.openDirectory}
              >
                <FolderIcon />
              </IconButton>
            </InputAdornment>
          }
        />
        {this.state.errorTextPath && <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>}
      </FormControl>
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
                disabled={!Pro}
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

export default EditLocationDialog;

