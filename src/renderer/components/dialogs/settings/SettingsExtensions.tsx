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

import React, { ChangeEvent, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import Typography from '@mui/material/Typography';
import Tooltip from '-/components/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { actions as SettingsActions, isDevMode } from '-/reducers/settings';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import InfoIcon from '-/components/InfoIcon';
import { useTranslation } from 'react-i18next';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { getUserDataDir, loadExtensions, unZip } from '-/services/utils-io';
import AppConfig from '-/AppConfig';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useExtensionsContext } from '-/hooks/useExtensionsContext';

function SettingsExtensions() {
  const { t } = useTranslation();
  const { extensions, removeExtension, enableExtension } =
    useExtensionsContext();
  const { findLocalLocation } = useCurrentLocationContext();
  const { uploadFilesAPI } = useIOActionsContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removeExtDialogOpened, setRemoveExtDialogOpened] =
    useState<TS.Extension>(undefined);

  //const extension = useSelector(getExtensions);
  const devMode = useSelector(isDevMode);
  const dispatch: AppDispatch = useDispatch();

  const onUploadProgress = (progress, abort, fileName) => {
    dispatch(AppActions.onUploadProgress(progress, abort, fileName));
  };

  const handleFileInputChange = (selection: any) => {
    const files: File[] = Array.from(selection.currentTarget.files);
    getUserDataDir().then((dataDir) => {
      dispatch(AppActions.resetProgress());
      openFileUploadDialog();
      const destinationPath = dataDir + AppConfig.dirSeparator + 'tsplugins';
      const location = findLocalLocation();
      uploadFilesAPI(
        files,
        destinationPath,
        onUploadProgress,
        false,
        false,
        location.uuid,
        location.uuid,
      )
        .then((fsEntries: Array<TS.FileSystemEntry>) => {
          const targetPath =
            destinationPath +
            AppConfig.dirSeparator +
            '@tagspaces' +
            AppConfig.dirSeparator +
            'extensions';
          const promises = fsEntries.map((fsEntry) =>
            unZip(
              fsEntry.path,
              targetPath + AppConfig.dirSeparator + fsEntry.name,
            ),
          );
          return Promise.all(promises).then((paths) => {
            loadExtensions();
            paths.forEach((path) => location.deleteFilePromise(path));
            return true;
          });
        })
        .catch((error) => {
          console.log('uploadFiles', error);
          return true;
        });
    });
  };

  return (
    <div style={{ minHeight: 400 }}>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="internal-content"
          id="internal-header"
        >
          <Typography variant="h6" style={{ marginRight: 10 }}>
            Core Extensions
          </Typography>
          <InfoIcon tooltip="These are extensions which are packaged with the current version of the app" />
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {extensions &&
              extensions
                .filter((ext) => !ext.extensionExternal)
                .map((ext) => (
                  <ListItem key={ext.extensionId} disablePadding>
                    {ext.extensionName}{' '}
                    <small style={{ marginLeft: 5 }}>v{ext.version}</small>
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
          <Typography variant="h6" style={{ marginRight: 10 }}>
            Installed Extensions
          </Typography>
          <InfoIcon tooltip="Extensions manually installed on top of the current app installation" />
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {extensions &&
              extensions
                .filter((ext) => ext.extensionExternal)
                .map((ext) => (
                  <ListItem key={ext.extensionId} disablePadding>
                    {ext.extensionName}{' '}
                    <small style={{ marginLeft: 5 }}>v{ext.version}</small>
                    <Switch
                      data-tid="enableExtensionTID"
                      name="enableExtension"
                      checked={ext.extensionEnabled}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        const extId = ext.extensionId.endsWith('/build')
                          ? ext.extensionId.slice(0, -'/build'.length)
                          : ext.extensionId;

                        if (event.target.checked) {
                          enableExtension(extId, true);
                          loadExtensions();
                        } else {
                          enableExtension(extId, false);
                        }
                      }}
                    />
                    <Tooltip title={t('core:removeExtension')}>
                      <IconButton
                        aria-label={t('core:delete')}
                        onClick={() => {
                          setRemoveExtDialogOpened(ext);
                        }}
                        data-tid="removeExtensionTID"
                        size="large"
                      >
                        <DeleteIcon color={'action'} />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                ))}
          </List>
          <ConfirmDialog
            open={removeExtDialogOpened !== undefined}
            onClose={() => setRemoveExtDialogOpened(undefined)}
            title={t('core:removeExtension')}
            content={t('core:removeExtensionTooltip', {
              extensionName: removeExtDialogOpened
                ? removeExtDialogOpened.extensionName
                : '',
            })}
            confirmCallback={(result) => {
              if (result) {
                dispatch(
                  SettingsActions.removeSupportedFileTypes(
                    removeExtDialogOpened.extensionId,
                  ),
                );
                removeExtension(removeExtDialogOpened.extensionId);
              }
            }}
            cancelDialogTID="cancelRemoveExtDialogTID"
            confirmDialogTID="confirmRemoveExtDialogTID"
            confirmDialogContentTID="confirmRemoveExtDialogContentTID"
          />
          {extensions &&
            extensions.filter((ext) => ext.extensionExternal).length < 1 && (
              <Typography variant="subtitle1">No extensions found</Typography>
            )}
          {devMode && AppConfig.isElectron && (
            <Box style={{ textAlign: 'center' }}>
              <Button
                data-tid="installExtensionTID"
                onClick={() => fileInputRef.current.click()}
                color="secondary"
              >
                {t('core:installExtension')}
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

export default SettingsExtensions;
