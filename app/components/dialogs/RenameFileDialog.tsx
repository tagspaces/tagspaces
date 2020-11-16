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
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import AppConfig from '-/config';
import i18n from '-/services/i18n';
import { extractFileName, extractContainingDirectoryPath } from '-/utils/paths';
import { actions as AppActions } from '-/reducers/app';
import PlatformIO from '-/services/platform-io';

interface Props {
  open: boolean;
  selectedFilePath: string;
  classes: any;
  renameFile: (source: string, target: string) => void;
  onClose: (clearSelection?: boolean) => void;
}

const styles = theme => ({
  root: {
    width: 550,
    height: '100%',
    marginBottom: 30,
    background: theme.palette.background.paper
  }
});

const RenameFileDialog = (props: Props) => {
  const [inputError, setInputError] = useState(false);
  // const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const fileNameInput = useRef<HTMLInputElement>(null);
  let fileName = extractFileName(
    props.selectedFilePath,
    PlatformIO.getDirSeparator()
  );

  useEffect(() => {
    // https://github.com/mui-org/material-ui/issues/1594
    const timer = setTimeout(() => {
      if (fileNameInput && fileNameInput.current) {
        fileNameInput.current.focus();
        if (fileName) {
          const indexOfBracket = fileName.indexOf(AppConfig.beginTagContainer);
          const indexOfDot = fileName.lastIndexOf('.');
          let endRange = fileName.length;
          if (indexOfBracket > 0) {
            endRange = indexOfBracket;
          } else if (indexOfDot > 0) {
            endRange = indexOfDot;
          }
          fileNameInput.current.setSelectionRange(0, endRange);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [props.selectedFilePath]);
  /**
   * todo rewrite this to functional componet
   * its have problem with e2e test dialog is displayed without fileName -> its set here in state later
   * @param nextProps
   */
  /* componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open) {
      const fileName = extractFileName(
        nextProps.selectedFilePath,
        PlatformIO.getDirSeparator()
      );
      this.setState({ fileName }, () => {
        this.fileName.focus();
        if (fileName) {
          const indexOfBracket = fileName.indexOf(AppConfig.beginTagContainer);
          const indexOfDot = fileName.lastIndexOf('.');
          let endRange = fileName.length;
          if (indexOfBracket > 0) {
            endRange = indexOfBracket;
          } else if (indexOfDot > 0) {
            endRange = indexOfDot;
          }
          this.fileName.setSelectionRange(0, endRange);
        }
        return {
          fileName
        };
      });
    }
  }; */

  const handleRenameFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'fileName') {
      fileName = value;
      handleValidation();
      // this.setState({ fileName: value }, this.handleValidation);
    }
  };

  const handleValidation = () => {
    if (fileName.length > 0) {
      setInputError(false);
      // this.setState({ inputError: false, disableConfirmButton: false });
    } else {
      setInputError(true);
      // this.setState({ inputError: true, disableConfirmButton: true });
    }
  };

  const onConfirm = () => {
    if (!inputError) {
      const fileDirectory = extractContainingDirectoryPath(
        props.selectedFilePath,
        PlatformIO.getDirSeparator()
      );
      const newFilePath =
        fileDirectory + PlatformIO.getDirSeparator() + fileName;
      props.renameFile(props.selectedFilePath, newFilePath);
      props.onClose(true);
      // this.setState({ inputError: false, disableConfirmButton: true });
    } else {
      handleValidation();
    }
  };

  const renderTitle = () => (
    <DialogTitle>{i18n.t('core:renameFileTitle')}</DialogTitle>
  );

  const renderContent = () => (
    <DialogContent className={props.classes.root}>
      <FormControl
        data-tid="renameFileDialog"
        fullWidth={true}
        error={inputError}
      >
        <TextField
          error={inputError}
          margin="dense"
          name="fileName"
          autoFocus
          inputRef={fileNameInput}
          label={i18n.t('core:renameNewFileName')}
          onChange={handleRenameFile}
          defaultValue={fileName}
          data-tid="renameFileDialogInput"
          fullWidth={true}
        />
        {inputError && <FormHelperText>Empty File Name</FormHelperText>}
      </FormControl>
    </DialogContent>
  );

  const renderActions = () => (
    <DialogActions>
      <Button
        data-tid="closeRenameFileDialog"
        onClick={() => props.onClose()}
        color="primary"
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        disabled={inputError}
        onClick={onConfirm}
        data-tid="confirmRenameFileDialog"
        color="primary"
      >
        {i18n.t('core:ok')}
      </Button>
    </DialogActions>
  );

  const { onClose, open } = props;
  return (
    <Dialog
      open={open}
      keepMounted
      onClose={onClose}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        } else if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      {renderTitle()}
      {renderContent()}
      {renderActions()}
    </Dialog>
  );
};

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      renameFile: AppActions.renameFile
    },
    dispatch
  );
}

export default connect(
  null,
  mapActionCreatorsToProps
)(withStyles(styles)(RenameFileDialog));
