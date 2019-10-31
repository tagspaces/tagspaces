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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';
import GenericDialog from './GenericDialog';
import i18n from '../../services/i18n';
import { getKeyBindingObject } from '../../reducers/settings';
import { actions as AppActions } from '../../reducers/app';
import AppConfig from '../../config';
import { extractFileName, normalizePath } from '../../utils/paths'; // extractFileExtension
import PlatformIO from '../../services/platform-io';
import { formatDateTime4Tag } from '../../utils/misc';

const styles = theme => ({
  root: {
    minWidth: 350
  },
});

type Props = {
  open: boolean,
  classes: Object,
  createFileAdvanced: (targetPath: string, fileName: string, content: string, fileType: string) => void,
  onClose: () => void
};

const CreateDialog = (props: Props) => {
  let fileInput; // Object | null;

  function addExistingFile() {
    props.onClose();
    fileInput.click();
  }

  // function loadImageLocal() {
  //   props.onClose();
  //   navigator.camera.getPicture(onCameraSuccess, onFail, {
  //     destinationType: Camera.DestinationType.FILE_URI,
  //     sourceType: Camera.PictureSourceType.PHOTOLIBRARY
  //   });
  // }

  // function cameraTakePicture() {
  //   props.onClose();
  //   navigator.camera.getPicture(onCameraSuccess, onFail, {
  //     // quality: 50,
  //     destinationType: Camera.DestinationType.FILE_URI, // DATA_URL, // Return base64 encoded string
  //     // encodingType: Camera.EncodingType.JPEG,
  //     mediaType: Camera.MediaType.PICTURE // ALLMEDIA
  //   });
  // }

  function handleFileInputChange(selection: Object) {
    // console.log("Selected File: "+JSON.stringify(selection.currentTarget.files[0]));
    const file = selection.currentTarget.files[0];
    const filePath =
      normalizePath(props.directoryPath) +
      AppConfig.dirSeparator +
      decodeURIComponent(file.name);

    const reader = new FileReader();
    reader.onload = event => {
      PlatformIO.getPropertiesPromise(filePath).then((entryProps) => {
        if (entryProps) {
          props.showNotification(
            'File with the same name already exist, importing skipped!',
            'warning',
            true
          );
        } else {
          PlatformIO.saveBinaryFilePromise(
            filePath,
            event.currentTarget.result,
            true
          )
            .then(() => {
              props.showNotification(
                'File ' + filePath + ' successfully imported.',
                'default',
                true
              );
              props.reflectCreateEntry(filePath, true);
              return true;
            })
            .catch(error => {
              // TODO showAlertDialog("Saving " + filePath + " failed.");
              console.error('Save to file ' + filePath + ' failed ' + error);
              props.showNotification(
                'Importing file ' + filePath + ' failed.',
                'error',
                true
              );
              return true;
            });
        }
        return true;
      }).catch((err) => {
        console.log('Error getting properties ' + err);
      });
    };

    if (AppConfig.isCordova) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }

  // {i18n.t('core:createFileTitle')}
  function renderTitle() {
    return (<DialogTitle>Create new content</DialogTitle>);
  }

  function renderContent() {
    return (
      <DialogContent className={props.classes.root} data-tid="keyboardShortCutsDialog">
        bla
        <input
          style={{ display: 'none' }}
          ref={input => {
            fileInput = input;
          }}
          accept="*"
          type="file"
          onChange={handleFileInputChange}
        />
      </DialogContent>
    );
  }

  function renderActions() {
    return (
      <DialogActions>
        <Button
          data-tid="closeKeyboardDialog"
          onClick={props.onClose}
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    );
  }

  return (
    <GenericDialog
      open={props.open}
      onClose={props.onClose}
      renderTitle={renderTitle}
      renderContent={renderContent}
    // renderActions={renderActions}
    />
  );
};

function mapStateToProps(state) {
  return {
    keyBindings: getKeyBindingObject(state),
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators({
    createFileAdvanced: AppActions.createFileAdvanced,
  }, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(
  withStyles(styles)(CreateDialog)
);
