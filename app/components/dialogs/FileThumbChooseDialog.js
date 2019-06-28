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

import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import FileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Typography from '@material-ui/core/Typography';
import GenericDialog from './GenericDialog';
import i18n from '../../services/i18n';
// import { extractContainingDirectoryPath } from '../../utils/paths';
import PlatformIO from '../../services/platform-io';
import AppConfig from '../../config';
import { extractFileName } from '../../utils/paths';

type Props = {
  classes: Object,
  open: boolean,
  onClose: () => void,
  selectedFile: string
};

const FileThumbChooseDialog = (props: Props) => {
  const [inputError, setInputError] = useState(false);
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [targetPath, setTargetPath] = useState('');

  useEffect(() => {
    handleValidation();
  });

  function handleValidation() {
    if (targetPath && targetPath.length > 0) {
      setInputError(false);
      setDisableConfirmButton(false);
    } else {
      setInputError(true);
      setDisableConfirmButton(true);
    }
  }

  function handleSetThumb() {
    if (!disableConfirmButton) {
      // props.setThumb(props.selectedFile, targetPath);
      setInputError(false);
      setDisableConfirmButton(true);
      setTargetPath('');
    }
    props.onClose();
  }

  function selectDirectory() {
    if (AppConfig.isElectron) {
      PlatformIO.selectFileDialog().then(selectedPaths => {
        setTargetPath(selectedPaths[0]);
        return true;
      }).catch((err) => {
        console.log('selectDirectoryDialog failed with: ' + err);
      });
    } else {
      // TODO handle case on other platforms
      // this.props.showSelectDirectoryDialog();
    }
  }

  function renderTitle() {
    return (
      <DialogTitle>{i18n.t('core:thumbChooseFileTitle')}</DialogTitle>
    );
  }

  function renderContent() {
    return (
      <DialogContent>
        <List dense style={{ width: 550 }}>
          <ListItem title={props.selectedFile}>
            <ListItemIcon>
              <FileIcon />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>{extractFileName(props.selectedFile)}</Typography>
          </ListItem>
        </List>
        <FormControl fullWidth={true}>
          <Input
            autoFocus
            required
            margin="dense"
            name="targetPath"
            placeholder={i18n.t('core:ThumbPath')}
            fullWidth={true}
            data-tid="targetPathInput"
            onChange={event => {
              const target = event.target;
              setTargetPath(target.value);
            }}
            value={targetPath}
            endAdornment={
              (<InputAdornment position="end" style={{ height: 33 }}>
                <IconButton
                  data-tid="openThumbFilesDialog"
                  onClick={selectDirectory}
                >
                  <FolderIcon />
                </IconButton>
              </InputAdornment>)
            }
          />
          {inputError && <FormHelperText>Empty Input Field</FormHelperText>}
        </FormControl>
      </DialogContent>
    );
  }

  function renderActions() {
    return (
      <DialogActions>
        <Button
          data-tid="closeMoveCopyDialog"
          onClick={props.onClose}
        >
          {i18n.t('core:cancel')}
        </Button>
        <Button
          onClick={handleSetThumb}
          data-tid="confirmCopyFiles"
          disabled={disableConfirmButton}
          color="primary"
        >
          {i18n.t('core:setThumbButton')}
        </Button>
      </DialogActions>
    );
  }

  return (
    <GenericDialog
      open={props.open}
      onClose={props.onClose}
      // onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
      renderTitle={renderTitle}
      renderContent={renderContent}
      renderActions={renderActions}
    />
  );
};

export default FileThumbChooseDialog;
