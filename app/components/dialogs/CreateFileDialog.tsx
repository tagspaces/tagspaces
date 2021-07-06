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

import React, { useEffect, useRef, useState } from 'react';
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
  createFileAdvanced: (
    targetPath: string,
    fileName: string,
    content: string,
    fileType: string
  ) => void;
}

/* interface State {
  errorTextName: boolean;
  errorTextPath: boolean;
  disableConfirmButton: boolean;
  selectedDirectoryPath: string | null;
  fileName: string;
  fileContent: string;
  fileType: string;
} */

/**
 * @deprecated use CreateDialog instead
 */
const CreateFileDialog = (props: Props) => {
  const [errorTextName, setErrorTextName] = useState<boolean>(false);
  const [errorTextPath, setErrorTextPath] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>(
    'note' +
      AppConfig.beginTagContainer +
      formatDateTime4Tag(new Date(), true) +
      AppConfig.endTagContainer
  );
  const [fileType, setFileType] = useState<string>('txt');
  const disableConfirmButton = useRef(
    !(props.selectedDirectoryPath && props.selectedDirectoryPath.length > 0)
  );
  const selectedDirectoryPath = useRef(props.selectedDirectoryPath);
  const fileContent = useRef('');

  /* state = {
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
  }; */

  useEffect(() => {
    handleValidation();
  }, [fileName, selectedDirectoryPath]);

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    setFileType(target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'fileName') {
      setFileName(value);
    } else if (name === 'fileContent') {
      fileContent.current = value;
    } else if (name === 'selectedDirectoryPath') {
      selectedDirectoryPath.current = value;
    }
  };

  const handleValidation = () => {
    if (fileName && fileName.length > 0) {
      setErrorTextName(false);
      disableConfirmButton.current = false;
    } else {
      setErrorTextName(true);
      disableConfirmButton.current = true;
    }

    if (
      selectedDirectoryPath.current &&
      selectedDirectoryPath.current.length > 0
    ) {
      setErrorTextPath(false);
      disableConfirmButton.current = false;
    } else {
      setErrorTextPath(true);
      disableConfirmButton.current = true;
    }
  };

  const openFolderChooser = () => {
    PlatformIO.selectDirectoryDialog()
      .then(selectedPaths => {
        // eslint-disable-next-line prefer-destructuring
        selectedDirectoryPath.current = selectedPaths[0];
        return true;
      })
      .catch(err => {
        console.log('selectDirectoryDialog failed with: ' + err);
      });
  };

  const onConfirm = () => {
    if (!disableConfirmButton.current) {
      props.createFileAdvanced(
        selectedDirectoryPath.current,
        fileName,
        fileContent.current,
        fileType
      );
      props.onClose();
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      event.stopPropagation();
    }
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullScreen={props.fullScreen}
      keepMounted
      scroll="paper"
      // onKeyDown={confirmFunction}
    >
      <DialogTitle>{i18n.t('core:createFileTitle')}</DialogTitle>
      <DialogContent data-tid="createFileDialog">
        <FormControl fullWidth={true} error={errorTextName}>
          <TextField
            fullWidth={true}
            error={errorTextName}
            autoFocus
            margin="dense"
            name="fileName"
            label={i18n.t('core:fileName')}
            onChange={handleFileChange}
            value={fileName}
            data-tid="createFileDialog_fileName"
          />
          {errorTextName && (
            <FormHelperText>{i18n.t('core:fileNameHelp')}</FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth={true}>
          <TextField
            id="textarea"
            placeholder="Enter the content of your file / note"
            multiline
            name="fileContent"
            defaultValue={fileContent.current}
            onChange={handleFileChange}
            onKeyDown={handleKeyPress}
            margin="normal"
            fullWidth={true}
            rows={4}
            rowsMax={10}
          />
        </FormControl>
        <ListItem>
          <Radio
            checked={fileType === 'txt'}
            onChange={handleTypeChange}
            value="txt"
            name="type"
            aria-label={i18n.t('core:createTextFile')}
          />
          <FormHelperText>{i18n.t('core:createTextFile')}</FormHelperText>
          <Radio
            checked={fileType === 'md'}
            onChange={handleTypeChange}
            value="md"
            name="type"
            aria-label={i18n.t('core:createMarkdown')}
          />
          <FormHelperText>{i18n.t('core:createMarkdown')}</FormHelperText>
          <Radio
            checked={fileType === 'html'}
            onChange={handleTypeChange}
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
            value={selectedDirectoryPath.current}
            onChange={handleFileChange}
            endAdornment={
              PlatformIO.haveObjectStoreSupport() ? (
                undefined
              ) : (
                <InputAdornment position="end" style={{ height: 32 }}>
                  <IconButton onClick={openFolderChooser}>
                    <FolderIcon />
                  </IconButton>
                </InputAdornment>
              )
            }
          />
          {errorTextPath && (
            <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button data-tid="closeCreateFileDialog" onClick={props.onClose}>
          {i18n.t('core:cancel')}
        </Button>
        <Button
          disabled={disableConfirmButton.current}
          onClick={onConfirm}
          data-tid="confirmCreateFileDialog"
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      createFileAdvanced: AppActions.createFileAdvanced,
      ...TaggingActions
    },
    dispatch
  );
}

export default connect(
  undefined,
  mapActionCreatorsToProps
)(withMobileDialog()(withStyles(styles)(CreateFileDialog)));
