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

import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { Progress } from 'aws-sdk/clients/s3';
import {
  actions as SettingsActions,
  getExtensions,
  isDevMode
} from '-/reducers/settings';
import { actions as AppActions } from '-/reducers/app';
import IOActions from '-/reducers/io-actions';
import { TS } from '-/tagspaces.namespace';
import i18n from '-/services/i18n';
import PlatformFacade from '-/services/platform-facade';

interface Props {
  extension: Array<TS.Extension>;
  isDevMode: boolean;
  removeExtension: (extensionId: string) => void;
  resetProgress: () => void;
  onUploadProgress: (progress: Progress, response: any) => void;
  toggleUploadDialog: () => void;
  uploadFilesAPI: (
    files: Array<File>,
    destination: string,
    onUploadProgress?: (progress: Progress, response: any) => void
  ) => any;
}

function SettingsExtensions(props: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileInputChange(selection: any) {
    const files: File[] = Array.from(selection.currentTarget.files);
    PlatformFacade.getUserDataDir().then(dataDir => {
      props.resetProgress();
      props.toggleUploadDialog();
      const destinationPath =
        dataDir + PlatformFacade.getDirSeparator() + 'tsplugins';
      props
        .uploadFilesAPI(files, destinationPath, props.onUploadProgress)
        .then(fsEntries => {
          const targetPath =
            destinationPath +
            PlatformFacade.getDirSeparator() +
            '@tagspaces' +
            PlatformFacade.getDirSeparator() +
            'extensions';
          const promises = fsEntries.map(fsEntry =>
            PlatformFacade.unZip(fsEntry.path, targetPath)
          );
          // fsEntries.name.substring(0, fsEntries.extension.length + 1);
          return Promise.all(promises).then(paths => {
            PlatformFacade.loadExtensions();
            paths.forEach(path => PlatformFacade.deleteFilePromise(path));
            return true;
          });
        })
        .catch(error => {
          console.log('uploadFiles', error);
        });
    });
  }

  return (
    <div style={{ backgroundColor: '#E7EBF0', padding: 24 }}>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="internal-content"
          id="internal-header"
        >
          <Typography>Internal Extensions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {props.extension
              .filter(ext => !ext.extensionExternal)
              .map(ext => (
                <ListItem key={ext.extensionId} disablePadding>
                  {ext.extensionName} {ext.version}
                </ListItem>
              ))}
          </List>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="installed-content"
          id="installed-header"
        >
          <Typography>Installed Extensions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {props.extension
              .filter(ext => ext.extensionExternal)
              .map(ext => (
                <ListItem key={ext.extensionId} disablePadding>
                  {ext.extensionName} {ext.version}
                  <IconButton
                    aria-label={i18n.t('core:delete')}
                    onClick={() => {
                      props.removeExtension(ext.extensionId);
                      PlatformFacade.removeExtension(ext.extensionId);
                    }}
                    data-tid="revisionsTID"
                    size="large"
                  >
                    <DeleteIcon color={'action'} />
                  </IconButton>
                </ListItem>
              ))}
          </List>
          {props.isDevMode && (
            <>
              <Button
                data-tid="addNewExtensionTID"
                onClick={() => fileInputRef.current.click()}
                color="secondary"
                style={{ width: '100%' }}
              >
                {i18n.t('core:addNewExtension')}
              </Button>
              <input
                style={{ display: 'none' }}
                ref={fileInputRef}
                accept="zip"
                type="file"
                onChange={handleFileInputChange}
              />
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    extension: getExtensions(state),
    isDevMode: isDevMode(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      removeExtension: SettingsActions.removeExtension,
      onUploadProgress: AppActions.onUploadProgress,
      uploadFilesAPI: IOActions.uploadFilesAPI,
      toggleUploadDialog: AppActions.toggleUploadDialog,
      resetProgress: AppActions.resetProgress
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(SettingsExtensions);
