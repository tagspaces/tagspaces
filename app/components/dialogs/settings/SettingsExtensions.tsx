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
import Tooltip from '-/components/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { Progress } from 'aws-sdk/clients/s3';
import { actions as SettingsActions, isDevMode } from '-/reducers/settings';
import { actions as AppActions, getExtensions } from '-/reducers/app';
import IOActions from '-/reducers/io-actions';
import { TS } from '-/tagspaces.namespace';
import i18n from '-/services/i18n';
import PlatformFacade from '-/services/platform-facade';
import PlatformIO from '-/services/platform-facade';

interface Props {
  extension: Array<TS.Extension>;
  isDevMode: boolean;
  removeExtension: (extensionId: string) => void;
  removeSupportedFileTypes: (extensionId: string) => void;
  resetProgress: () => void;
  onUploadProgress: (progress: Progress, response: any) => void;
  toggleUploadDialog: () => void;
  uploadFilesAPI: (
    files: Array<File>,
    destination: string,
    onUploadProgress?: (progress: Progress, response: any) => void,
    uploadMeta?: boolean
  ) => any;
  switchCurrentLocationType: (currentLocationId?) => void;
}

function SettingsExtensions(props: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileInputChange(selection: any) {
    const files: File[] = Array.from(selection.currentTarget.files);
    PlatformFacade.getUserDataDir().then(dataDir => {
      props.resetProgress();
      props.toggleUploadDialog();
      PlatformIO.disableObjectStoreSupport();
      PlatformIO.disableWebdavSupport();
      const destinationPath =
        dataDir + PlatformFacade.getDirSeparator() + 'tsplugins';
      props
        .uploadFilesAPI(files, destinationPath, props.onUploadProgress, false)
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
            return props.switchCurrentLocationType();
          });
        })
        .catch(error => {
          console.log('uploadFiles', error);
          return props.switchCurrentLocationType();
        });
    });
  }

  return (
    <div style={{ minHeight: 400 }}>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="internal-content"
          id="internal-header"
        >
          <Typography variant="h6">Core Extensions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {props.extension &&
              props.extension
                .filter(ext => !ext.extensionExternal)
                .map(ext => (
                  <ListItem key={ext.extensionId} disablePadding>
                    {ext.extensionName} ({ext.version})
                  </ListItem>
                ))}
          </List>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="installed-content"
          id="installed-header"
        >
          <Typography variant="h6">Installed Extensions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {props.extension &&
              props.extension
                .filter(ext => ext.extensionExternal)
                .map(ext => (
                  <ListItem key={ext.extensionId} disablePadding>
                    {ext.extensionName} ({ext.version})
                    <Tooltip title={i18n.t('core:removeExtension')}>
                      <IconButton
                        aria-label={i18n.t('core:delete')}
                        onClick={() => {
                          props.removeExtension(ext.extensionId);
                          props.removeSupportedFileTypes(ext.extensionId);
                          PlatformFacade.removeExtension(ext.extensionId);
                        }}
                        data-tid="revisionsTID"
                        size="large"
                      >
                        <DeleteIcon color={'action'} />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                ))}
          </List>
          {props.extension &&
            props.extension.filter(ext => ext.extensionExternal).length < 1 && (
              <Typography variant="subtitle1">No extensions found</Typography>
            )}
          {props.isDevMode && (
            <Box style={{ textAlign: 'center' }}>
              <Button
                data-tid="installExtensionTID"
                onClick={() => fileInputRef.current.click()}
                color="secondary"
              >
                {i18n.t('core:installExtension')}
              </Button>
              <input
                style={{ display: 'none' }}
                ref={fileInputRef}
                accept="zip"
                type="file"
                onChange={handleFileInputChange}
              />
            </Box>
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
      removeExtension: AppActions.removeExtension,
      removeSupportedFileTypes: SettingsActions.removeSupportedFileTypes,
      onUploadProgress: AppActions.onUploadProgress,
      uploadFilesAPI: IOActions.uploadFilesAPI,
      toggleUploadDialog: AppActions.toggleUploadDialog,
      resetProgress: AppActions.resetProgress,
      switchCurrentLocationType: AppActions.switchCurrentLocationType
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(SettingsExtensions);
