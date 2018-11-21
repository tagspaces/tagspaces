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
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import { type Tag } from '../../reducers/taglibrary';
import TagAutoSuggestion from '../TagAutoSuggestion';
import { formatDateTime4Tag } from '../../utils/misc';
import AppConfig from '../../config';
import TaggingActions from '../../reducers/tagging-actions';
import { actions as AppActions } from '../../reducers/app';
import PlatformIO from '../../services/platform-io';

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
  folderIcon: {
    color: '#ff9800',
  },
  formControl: {
    margin: theme.spacing.unit * 3,
  },
  group: {
    margin: `${theme.spacing.unit}px 0`,
  },
});

type Props = {
  open: boolean,
  onClose: () => void,
  showSelectDirectoryDialog: () => void,
  selectedFilePath: string,
  createDirectory: (directoryPath: string) => void,
  createFileAdvanced: (targetPath: string, fileName: string, content: string, fileType: string) => void,
  allTags: Array<Tag>
};

type State = {
  disableConfirmButton?: boolean,
  open?: boolean,
  selectedDirectoryPath?: string,
  dirPath?: string,
  fileName?: string,
  fileContent?: string,
  fileType?: string,
  suggestionTags?: Array<Tag>,
  newlyAddedTags?: Array,
  allTags?: Array
};

class CreateFileDialog extends React.Component<Props, State> {
  state = {
    errorTextName: false,
    errorTextPath: false,
    openFolder: false,
    selectedDirectoryPath: '',
    disableConfirmButton: true,
    dirPath: '',
    fileName: '',
    fileContent: '',
    fileType: 'txt',
    suggestionTags: [],
    newlyAddedTags: [],
    allTags: []
  };

  componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open === true) {
      this.setState({
        selectedDirectoryPath: nextProps.selectedDirectoryPath || '',
        allTags: nextProps.allTags,
        fileName: 'new note ' + AppConfig.beginTagContainer + formatDateTime4Tag(new Date(), true) + AppConfig.endTagContainer,
        fileContent: '',
        newlyAddedTags: [],
        disableConfirmButton: true
      }, () => {
        this.fileName.select();
        this.handleValidation();
        // this.fileName.focus();
      });
    }
  };

  fileName;

  handleTypeChange = (event: Object) => {
    const target = event.target;
    this.setState({ fileType: target.value });
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
    if (this.state.fileName.length > 0) {
      this.setState({ errorTextName: false });
    } else {
      this.setState({ errorTextName: true });
    }

    if (this.state.selectedDirectoryPath.length > 0) {
      this.setState({ errorTextPath: false });
    } else {
      this.setState({ errorTextPath: true });
    }
    this.setState({
      disableConfirmButton: (this.state.fileName.length <= 0) || (this.state.selectedDirectoryPath.length <= 0)
    });
  }

  openFolderChooser = () => {
    this.props.showSelectDirectoryDialog();
  };

  showSelectDirectoryDialog = () => {
    this.setState({
      isSelectDirectoryDialogOpened: true
    });
  };

  onAddTag = (tag) => {
    const { newlyAddedTags } = this.state;
    newlyAddedTags.push(tag);
    this.setState({ newlyAddedTags });
  };

  onRemoveTag = (tag) => {
    const { newlyAddedTags } = this.state;
    const modifiedTags = newlyAddedTags.filter(addedTag => addedTag.title !== tag.title);
    this.setState({ newlyAddedTags: modifiedTags });
  };

  onConfirm = () => {
    if (!this.state.disableConfirmButton) {
      const { selectedDirectoryPath, fileName, fileContent, fileType } = this.state;
      this.props.createFileAdvanced(selectedDirectoryPath, fileName, fileContent, fileType);
      this.props.onClose();
    }
  };

  addedTags = (tags) => {
    this.setState({
      suggestionTags: tags,
    });
  };

  handleKeyPress = (event: any) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      // event.preventDefault();
      event.stopPropagation();
    }
  };

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:createFileTitle')}</DialogTitle>
  );

  renderContent = () => (
    <DialogContent data-tid="createFileDialog">
      <FormControl
        fullWidth={true}
        error={this.state.errorTextName}
      >
        <TextField
          fullWidth={true}
          error={this.state.errorTextName}
          margin="dense"
          name="fileName"
          label={i18n.t('core:fileName')}
          inputRef={(ref) => { this.fileName = ref; }}
          onChange={this.handleInputChange}
          value={this.state.fileName}
          data-tid="createFileDialog_fileName"
        />
        {this.state.errorTextName && <FormHelperText>{i18n.t('core:fileNameHelp')}</FormHelperText>}
      </FormControl>
      <FormControl fullWidth={true}>
        <TextField
          id="textarea"
          placeholder="Enter the content of your file / note"
          multiline
          name="fileContent"
          value={this.state.fileContent}
          onChange={e => this.handleInputChange(e)}
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
      {/* <FormControl fullWidth={true} style={{ overflow: 'visible', margin: '0 0 10px 0' }}>
        <FormHelperText>{i18n.t('core:fileTags')}</FormHelperText>
        <TagAutoSuggestion
          height={120}
          isModalOpened={open}
          selectedItem={{}}
          selectedItems={[]}
          selectedEntries={[]}
          newlyAddedTags={this.state.newlyAddedTags}
          allTags={this.props.allTags}
          addTags={this.onAddTag}
          removeTags={this.onRemoveTag}
        />
      </FormControl> */}
      <FormControl fullWidth={true}>
        <InputLabel htmlFor="name">{i18n.t('core:filePath')}</InputLabel>
        <Input
          required
          margin="dense"
          name="selectedDirectoryPath"
          label={i18n.t('core:filePath')}
          fullWidth={true}
          data-tid="createFileDialog_filePath"
          value={this.state.selectedDirectoryPath}
          onChange={this.handleInputChange}
          endAdornment={
            PlatformIO.haveObjectStoreSupport() ? undefined :
              (<InputAdornment position="end" style={{ height: 32 }}>
                <IconButton onClick={this.openFolderChooser}>
                  <FolderIcon className={this.props.classes.folderIcon} />
                </IconButton>
              </InputAdornment>)
          }
        />
        {this.state.errorTextPath && <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>}
      </FormControl>
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="closeCreateFileDialog"
        onClick={() => {
          this.setState({ newlyAddedTags: [] });
          this.props.onClose();
        }}
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        disabled={this.state.disableConfirmButton}
        onClick={this.onConfirm}
        data-tid="confirmCreateFileDialog"
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

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators({
    createFileAdvanced: AppActions.createFileAdvanced,
    showSelectDirectoryDialog: AppActions.showSelectDirectoryDialog,
    ...TaggingActions
  }, dispatch);
}

export default connect(null, mapActionCreatorsToProps)(withStyles(styles)(CreateFileDialog));
