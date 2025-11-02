/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import InfoIcon from '-/components/InfoIcon';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useExtensionsContext } from '-/hooks/useExtensionsContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { actions as SettingsActions, isDevMode } from '-/reducers/settings';
import { getUserDataDir, loadExtensions, unZip } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { ChangeEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

function SettingsExtensions() {
  const { t } = useTranslation();
  const { extensions, removeExtension, enableExtension } =
    useExtensionsContext();
  const { openConfirmDialog } = useNotificationContext();
  const { findLocalLocation } = useCurrentLocationContext();
  const { uploadFilesAPI } = useIOActionsContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const devMode = useSelector(isDevMode);
  const dispatch: AppDispatch = useDispatch();

  function setRemoveExtDialogOpened(ext: TS.Extension) {
    if (ext) {
      openConfirmDialog(
        t('core:removeExtension'),
        t('core:removeExtensionTooltip', {
          extensionName: ext.extensionName,
        }),
        (result) => {
          if (result) {
            dispatch(SettingsActions.removeSupportedFileTypes(ext.extensionId));
            removeExtension(ext.extensionId);
          }
        },
        'cancelRemoveExtDialogTID',
        'confirmRemoveExtDialogTID',
        'confirmRemoveExtDialogContentTID',
      );
    }
  }

  const onUploadProgress = (progress, abort, fileName) => {
    dispatch(AppActions.onUploadProgress(progress, abort, fileName));
  };

  const handleFileInputChange = (selection: any) => {
    let files: File[] = Array.from(selection.currentTarget.files);
    if (AppConfig.isElectron) {
      files = files.map((file) => {
        if (!file.path) {
          file.path = window.electronIO.ipcRenderer.getPathForFile(file);
        }
        return file;
      });
    }
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
    <div
      style={{
        overflowX: 'hidden',
        overflowY: 'auto',
        height: '100%',
        padding: 10,
      }}
    >
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="internal-content"
          id="internal-header"
        >
          <Typography sx={{ fontWeight: 'bold' }}>
            {t('core:coreExtensions')}
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
          <Typography sx={{ fontWeight: 'bold' }}>
            {t('core:thirdPartyExtensions')}
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
                    <TsIconButton
                      tooltip={t('core:removeExtension')}
                      aria-label={t('core:delete')}
                      onClick={() => {
                        setRemoveExtDialogOpened(ext);
                      }}
                      data-tid="removeExtensionTID"
                    >
                      <DeleteIcon color={'action'} />
                    </TsIconButton>
                  </ListItem>
                ))}
          </List>
          {extensions &&
            extensions.filter((ext) => ext.extensionExternal).length < 1 && (
              <Typography variant="subtitle1">No extensions found</Typography>
            )}
          {devMode && AppConfig.isElectron && (
            <Box style={{ textAlign: 'center' }}>
              <TsButton
                data-tid="installExtensionTID"
                onClick={() => fileInputRef.current.click()}
                color="secondary"
              >
                {t('core:installExtension')}
              </TsButton>
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
