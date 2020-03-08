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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/FolderOpen';
import ListItem from '@material-ui/core/ListItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Radio from '@material-ui/core/Radio';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Dialog from '@material-ui/core/Dialog';
import i18n from '-/services/i18n';
import { formatDateTime4Tag } from '-/utils/misc';
import AppConfig from '-/config';
import TaggingActions from '-/reducers/tagging-actions';
import { actions as AppActions } from '-/reducers/app';
import PlatformIO from '-/services/platform-io';

const styles = theme => ({
  root: {
    width: 550,
    height: '100%',
    marginBottom: 30,
    background: theme.palette.background.paper
  },
  form: {
    width: '98%',
    height: 'auto'
  },
  formControl: {
    margin: theme.spacing(3)
  },
  group: {
    margin: theme.spacing(1, 0)
  }
});

interface Props {
  open: boolean;
  fullScreen: boolean;
  onClose: () => void;
  selectedDirectoryPath: string | null;
  showSelectDirectoryDialog: () => void;
  createFileAdvanced: (
    targetPath: string,
    fileName: string,
    content: string,
    fileType: string
  ) => void;
}

interface State {
  errorTextName: boolean;
  errorTextPath: boolean;
  disableConfirmButton: boolean;
  selectedDirectoryPath: string | null;
  fileName: string;
  fileContent: string;
  fileType: string;
}
class CreateFileDialog extends React.Component<Props, State> {
  state = {
    errorTextName: false,
    errorTextPath: false,
    openFolder: false,
    disableConfirmButton: !(
      this.props.selectedDirectoryPath &&
      this.props.selectedDirectoryPath.length > 0
    ),
    selectedDirectoryPath: this.props.selectedDirectoryPath,
    fileName:
      'note' +
      AppConfig.beginTagContainer +
      formatDateTime4Tag(new Date(), true) +
      AppConfig.endTagContainer,
    fileContent: '',
    fileType: 'txt'
  };

  fileName;

  handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    this.setState({ fileType: target.value });
  };

  handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'fileName') {
      this.setState({ fileName: value }, this.handleValidation);
    }
  };

  handleFileContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'fileContent') {
      this.setState({ fileContent: value }, this.handleValidation);
    }
  };

  handleFilePathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'selectedDirectoryPath') {
      this.setState({ selectedDirectoryPath: value }, this.handleValidation);
    }
  };

  handleValidation() {
    if (this.state.fileName && this.state.fileName.length > 0) {
      this.setState({ errorTextName: false });
    } else {
      this.setState({ errorTextName: true });
    }

    if (
      this.state.selectedDirectoryPath &&
      this.state.selectedDirectoryPath.length > 0
    ) {
      this.setState({ errorTextPath: false });
    } else {
      this.setState({ errorTextPath: true });
    }

    this.setState({
      disableConfirmButton:
        !this.state.fileName || !this.state.selectedDirectoryPath
    });
  }

  openFolderChooser = () => {
    if (AppConfig.isElectron) {
      PlatformIO.selectDirectoryDialog()
        .then(selectedPaths => {
          this.setState(
            {
              selectedDirectoryPath: selectedPaths[0]
            },
            this.handleValidation
          );
          return true;
        })
        .catch(err => {
          console.log('selectDirectoryDialog failed with: ' + err);
        });
    } else {
      this.props.showSelectDirectoryDialog();
    }
  };

  onConfirm = () => {
    if (!this.state.disableConfirmButton) {
      const {
        fileName,
        fileContent,
        fileType,
        selectedDirectoryPath
      } = this.state;
      this.props.createFileAdvanced(
        selectedDirectoryPath,
        fileName,
        fileContent,
        fileType
      );
      this.props.onClose();
    }
  };

  handleKeyPress = (event: any) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      event.stopPropagation();
    }
  };

  return = () => {
    <Dialog
      open={this.props.open}
      onClose={this.props.onClose}
      fullScreen={this.props.fullScreen}
      keepMounted
      scroll="paper"
      // onKeyDown={confirmFunction}
    >
      <DialogTitle>{i18n.t('core:createFileTitle')}</DialogTitle>
      <DialogContent data-tid="createFileDialog">
        <FormControl fullWidth={true} error={this.state.errorTextName}>
          <TextField
            fullWidth={true}
            error={this.state.errorTextName}
            autoFocus
            margin="dense"
            name="fileName"
            label={i18n.t('core:fileName')}
            inputRef={ref => {
              this.fileName = ref;
            }}
            onChange={this.handleFileNameChange}
            value={this.state.fileName}
            data-tid="createFileDialog_fileName"
          />
          {this.state.errorTextName && (
            <FormHelperText>{i18n.t('core:fileNameHelp')}</FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth={true}>
          <TextField
            id="textarea"
            placeholder="Enter the content of your file / note"
            multiline
            name="fileContent"
            value={this.state.fileContent}
            onChange={this.handleFileContentChange}
            onKeyDown={this.handleKeyPress}
            margin="normal"
            fullWidth={true}
            rows={4}
            rowsMax={10}
          />
        </FormControl>
        <ListItem>
          <Radio
            checked={this.state.fileType === 'txt'}
            onChange={this.handleTypeChange}
            value="txt"
            name="type"
            aria-label={i18n.t('core:createTextFile')}
          />
          <FormHelperText>{i18n.t('core:createTextFile')}</FormHelperText>
          <Radio
            checked={this.state.fileType === 'md'}
            onChange={this.handleTypeChange}
            value="md"
            name="type"
            aria-label={i18n.t('core:createMarkdown')}
          />
          <FormHelperText>{i18n.t('core:createMarkdown')}</FormHelperText>
          <Radio
            checked={this.state.fileType === 'html'}
            onChange={this.handleTypeChange}
            value="html"
            name="html"
            aria-label={i18n.t('core:createRichTextFile')}
          />
          <FormHelperText>{i18n.t('core:createRichTextFile')}</FormHelperText>
        </ListItem>
        <FormControl fullWidth={true}>
          <InputLabel htmlFor="name">{i18n.t('core:filePath')}</InputLabel>
          <Input
            required
            margin="dense"
            name="selectedDirectoryPath"
            fullWidth={true}
            data-tid="createFileDialog_filePath"
            value={this.state.selectedDirectoryPath}
            onChange={this.handleFilePathChange}
            endAdornment={
              PlatformIO.haveObjectStoreSupport() ? (
                undefined
              ) : (
                <InputAdornment position="end" style={{ height: 32 }}>
                  <IconButton onClick={this.openFolderChooser}>
                    <FolderIcon />
                  </IconButton>
                </InputAdornment>
              )
            }
          />
          {this.state.errorTextPath && (
            <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          data-tid="closeCreateFileDialog"
          onClick={this.props.onClose}
          color="primary"
        >
          {i18n.t('core:cancel')}
        </Button>
        <Button
          disabled={this.state.disableConfirmButton}
          onClick={this.onConfirm}
          data-tid="confirmCreateFileDialog"
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>;
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      createFileAdvanced: AppActions.createFileAdvanced,
      showSelectDirectoryDialog: AppActions.showSelectDirectoryDialog,
      ...TaggingActions
    },
    dispatch
  );
}

export default connect(
  undefined,
  mapActionCreatorsToProps
)(withMobileDialog()(withStyles(styles)(CreateFileDialog)));
