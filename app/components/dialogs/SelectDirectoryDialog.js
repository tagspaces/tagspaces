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
import { withStyles } from '@material-ui/core/styles';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import FolderIcon from '@material-ui/icons/FolderOpen';
import CreateFolderIcon from '@material-ui/icons/CreateNewFolder';
import UndoIcon from '@material-ui/icons/Undo';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import AppConfig from '../../config';
import PlatformIO from '../../services/platform-io';
import { loadSubFolders } from '../../services/utils-io';

type Props = {
  open: boolean,
  onClose: () => void
};

type State = {
  errorTextPath: boolean,
  errorTextName: boolean,
  open: boolean,
  drives: Array<string>,
  currentPath: string,
  isDefault: boolean
};

const styles = () => ({
  buttonContainer: {
    color: '#212121',
    backgroundColor: '#f5f5f5',
    borderColor: '#dddddd',
    marginLeft: 4,
    marginTop: 4,
    marginBottom: 4
  },
  buttonSuggestion: {
    fontSize: 10,
    textTransform: 'none',
    backgroundColor: '#E5E5E5',
    color: '#444444',
    textAlign: 'left',
    backgroundImage: 'none',
    margin: 0,
    paddingTop: '0',
    paddingBottom: '0',
    paddingRight: 0,
    borderRadius: 5
  },
  alertWarning: {
    color: '#fff',
    backgroundColor: '#ff9800',
    margin: 15,
    padding: 15
  },
  folderIcon: {
    color: '#ff9800'
  },
  contentFolder: {
    overflowY: 'auto',
    maxHeight: '40vh'
  }
});

const drives = ['Choose Drive', 'A:', 'B:', 'C:', 'D:', 'F:',
  'G:', 'H:', 'I:', 'J:', 'K:', 'L:', 'M:', 'N:', 'O:', 'P:',
  'Q:', 'R:', 'S:', 'T:', 'U:', 'V:', 'W:', 'X:', 'Y:', 'Z:'];

class SelectDirectoryDialog extends React.Component<Props, State> {
  state = {
    errorTextPath: false,
    alertSubFolderText: false,
    disableConfirmButton: true,
    open: false,
    currentPath: PlatformIO.getUserHomePath(),
    subFolders: [],
    choosePath: '',
    isDefault: false,
  };

  componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open === true) {
      let currentPath = this.state.currentPath;
      if (nextProps.currentPath) {
        currentPath = nextProps.currentPath;
      }
      this.setState({
        open: true,
        currentPath, // AppConfig.isWin ? drives[3] : AppConfig.dirSeparator,
        choosePath: drives[0]
      });
      this.loadListDirectory(currentPath);
    }
  };

  loadListDirectory = (path: string) => {
    loadSubFolders(path).then((rootDirContent) => {
      this.setState({
        subFolders: rootDirContent
      });
      return true;
    }).catch((error) => {
      console.log('Error listing directory ' + error);
    });
  };

  onConfirm = () => {
    this.props.chooseDirectoryPath(this.state.currentPath);
    this.setState({
      open: false,
      errorTextPath: false
    });
    this.props.onClose();
  };

  handleChooseDrive = (e: Object, selectedPath: string) => {
    this.setState({
      currentPath: selectedPath
    });
    this.loadListDirectory(selectedPath);
  };

  handleInputChange = (event: Object) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
      currentPath: value
    });
    this.loadListDirectory(value);
  };

  onBackButton = () => {
    const lastIndex = this.state.currentPath.lastIndexOf(AppConfig.dirSeparator);
    const path = this.state.currentPath.slice(0, lastIndex);
    this.setState({
      currentPath: path
    });
    this.loadListDirectory(path);
  };

  createNewFolder = () => {
    this.props.createNewDirectoryExt(this.state.currentPath);
    this.loadListDirectory(this.state.currentPath);
  };

  renderDriveSuggestions = (drive) => (
    <div className={styles.buttonContainer}>
      <Button
        key={drive.name}
        onClick={e => this.handleChooseDrive(e, drive.path)}
      >
        <FolderIcon />
        <span>{drive.name}</span>
      </Button>
    </div>
  );

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:selectDialogTitle')}</DialogTitle>
  );

  renderContent = () => (
    <DialogContent>
      <FormControl
        fullWidth={true}
        error={this.props.errorTextPath}
      >
        <InputLabel htmlFor="name">{i18n.t('core:selectDialogCurrentPath')}</InputLabel>
        <Input
          fullWidth={true}
          required
          margin="dense"
          name="path"
          onChange={this.handleInputChange}
          label={i18n.t('core:selectDialogCurrentPath')}
          data-tid="selectDirectoryDialogInput"
          value={this.state.currentPath}
          disabled={AppConfig.isWin}
        />
        {this.state.errorTextPath && <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>}
      </FormControl>
      {AppConfig.isWin ? (
        <FormControl
          fullWidth={true}
        >
          <Select
            data-tid="selectDirectoryDialogSelect"
            native
            autoWidth
            name="choosePath"
            value={this.state.choosePath}
            onChange={this.handleInputChange}
            input={<Input id="choosePath" />}
          >
            {drives.map((drive) => (<option key={drive} value={drive}>{drive}</option>))}
          </Select>
        </FormControl>
      ) : null
      }
      <FormControl
        fullWidth={true}
      >
        <Paper elevation={2}>
          <Button
            data-tid="onBackButtonSelectDirectoryDialog"
            onClick={e => this.onBackButton(e)}
          >
            <UndoIcon />
          </Button>
          <Button
            data-tid="createNewFolderSelectDirectoryDialog"
            onClick={e => this.createNewFolder(e)}
          >
            <CreateFolderIcon className={this.props.classes.folderIcon} />
            {i18n.t('core:createDirectory')}
          </Button>
        </Paper>
        <Paper elevation={2} className={this.props.classes.contentFolder} >
          {this.state.subFolders.length === 0 ?
            (
              <div className={this.props.classes.alertWarning}>
                {i18n.t('core:noSubfoldersFound')}
              </div>
            )
            :
            this.state.subFolders.map(this.renderDriveSuggestions)
          }
        </Paper>
      </FormControl>
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      <Button
        onClick={this.props.onClose}
        color="primary"
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        onClick={this.onConfirm}
        data-tid="confirmSelectDirectoryDialog"
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

export default withStyles(styles)(SelectDirectoryDialog);
