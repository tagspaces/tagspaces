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
import uuidv1 from 'uuid';
import { withStyles } from '@material-ui/core/styles';
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
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import PlatformIO from '../../services/platform-io';
import { extractDirectoryName } from '../../utils/paths';
import { type Location } from '../../reducers/locations';
import AppConfig from '../../config';
import { Pro } from '../../pro';
import ObjectStoreForm from './ObjectStoreForm';

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
  open?: boolean,
  onClose: () => void,
  addLocation: (location: Location) => void,
  perspectives: Array<Object>,
  showSelectDirectoryDialog: () => void,
  selectedDirectoryPath?: string | null
};

type State = {
  errorTextPath?: boolean,
  errorTextName?: boolean,
  disableConfirmButton?: boolean,
  open?: boolean,
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
    open: false,
    name: '',
    path: '',
    perspective: '',
    isDefault: false,
    isReadOnly: false,
    watchForChanges: false,
    persistIndex: false,
    type: 'local'
  };

  componentWillReceiveProps = (nextProps: any) => {
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
  };

  handleInputChange = (event: Object) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.handleChange(name, value);
  };

  handleChange = (name, value) => {
    this.setState({
      [name]: value
    }, this.handleValidation);
  };

  handleValidation() {
    // const pathRegex = this.state.path.match('^((\.\./|[a-zA-Z0-9_/\-\\])*\.[a-zA-Z0-9]+)$');
    // const nameRegex = this.state.name.match('^[A-Z][-a-zA-Z]+$');
    if (this.state.type === 'local') {
      if (this.state.path && this.state.path.length > 0) {
        this.setState({ errorTextPath: false, disableConfirmButton: false });
      } else {
        this.setState({ errorTextPath: true, disableConfirmButton: true });
      }

      if (this.state.name && this.state.name.length > 0) {
        this.setState({ errorTextName: false, disableConfirmButton: false });
      } else {
        this.setState({ errorTextName: true, disableConfirmButton: true });
      }
    } else if (this.state.type === 'cloud') {
      if (this.state.name && this.state.name.length > 0) {
        this.setState({ errorTextName: false, disableConfirmButton: false });
      } else {
        this.setState({ errorTextName: true, disableConfirmButton: true });
      }
    }
  }

  openDirectory = () => {
    if (AppConfig.isElectron) {
      PlatformIO.selectDirectoryDialog().then((selectedPaths) => {
        const newName = (this.state.name.length < 1) ? extractDirectoryName(selectedPaths[0]) : this.state.name;
        this.setState({
          name: newName,
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
  };

  onConfirm = () => {
    if (!this.state.disableConfirmButton) {
      this.props.addLocation({
        uuid: uuidv1(),
        name: this.state.name,
        paths: [this.state.path],
        perspective: this.state.perspective,
        isDefault: this.state.isDefault,
        isReadOnly: this.state.isReadOnly,
        persistIndex: this.state.persistIndex,
        watchForChanges: this.state.watchForChanges
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
    const { classes } = this.props;
    let content;
    if (this.state.type === 'cloud') {
      content = (<ObjectStoreForm handleInputChange={this.handleInputChange} handleChange={this.handleChange} state={this.state} />);
    } else {
      content = (
        <div>
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
          <FormControl
            fullWidth={true}
            error={this.state.errorTextPath}
          >
            <InputLabel htmlFor="path">{i18n.t('core:createLocationPath')}</InputLabel>
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
                    onClick={this.openDirectory}
                  >
                    <FolderIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
            {this.state.errorTextPath && <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>}
          </FormControl>
        </div>
      );
    }
    return (
      <DialogContent>
        <Grid container spacing={24}>
          <Grid item xs={2} style={{ lineHeight: 3, textAlign: 'right' }}>
          Type
          </Grid>
          <Grid item xs={10}>
            <RadioGroup
              component="label"
              aria-label="Type"
              name="type"
              value={this.state.type}
              onChange={this.handleInputChange}
              row
            >
              <FormControlLabel value="local" control={<Radio />} label="Local" />
              <FormControlLabel value="cloud" control={<Radio />} label="Cloud (S3 AWS)" />
            </RadioGroup>
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

export default withStyles(styles)(CreateLocationDialog);
