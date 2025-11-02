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
import { DeleteIcon } from '-/components/CommonIcons';
import { ProLabel } from '-/components/HelperComponents';
import InfoIcon from '-/components/InfoIcon';
import TooltipTS from '-/components/Tooltip';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsSelect from '-/components/TsSelect';
import MapTileServerDialog from '-/components/dialogs/MapTileServerDialog';
import { historyKeys } from '-/hooks/HistoryContextProvider';
import { useHistoryContext } from '-/hooks/useHistoryContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { Pro } from '-/pro';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getMapTileServers,
  getSettings,
  isDevMode,
} from '-/reducers/settings';
import { isWorkerAvailable } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { clearAllURLParams } from '-/utils/dom';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { ListItemIcon } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

interface Props {}

function SettingsAdvanced(props: Props) {
  const { t } = useTranslation();
  const { delAllHistory } = useHistoryContext();
  const { openConfirmDialog } = useNotificationContext();
  const dispatch: AppDispatch = useDispatch();
  const settings = useSelector(getSettings);
  const tileServers: Array<TS.MapTileServer> = useSelector(getMapTileServers);
  const devMode = useSelector(isDevMode);
  const [tileServerDialog, setTileServerDialog] = useState<any>(undefined);
  const wsAlive = useRef<boolean>(null);
  const workSpacesContext = Pro?.contextProviders?.WorkSpacesContext
    ? useContext<TS.WorkSpacesContextData>(
        Pro.contextProviders.WorkSpacesContext,
      )
    : undefined;
  const workSpaces = workSpacesContext?.getWorkSpaces() ?? [];
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (AppConfig.isElectron) {
      isWorkerAvailable().then((isWsAlive) => {
        wsAlive.current = isWsAlive;
        forceUpdate();
      });
    }
  }, [settings.enableWS]);

  function setConfirmDialogKey(key: string) {
    if (key) {
      openConfirmDialog(
        t('core:confirm'),
        t('core:confirm' + key + 'Deletion'),
        (result) => {
          if (result) {
            delAllHistory(key);
          }
        },
        'cancelDelete' + key + 'Dialog',
        'confirmDelete' + key + 'Dialog',
        'confirmDelete' + key + 'DialogContent',
      );
    }
  }

  const handleEditTileServerClick = (event, tileServer, isDefault: boolean) => {
    event.preventDefault();
    event.stopPropagation();
    setTileServerDialog({ ...tileServer, isDefault });
  };

  const editWorkSpacesClick = (event, workSpace?: TS.WorkSpace) => {
    event.preventDefault();
    event.stopPropagation();
    workSpacesContext.openNewWorkspaceDialog(workSpace);
  };

  const geoTaggingFormatDisabled = AppConfig.geoTaggingFormat !== undefined;

  const setDevMode = (devMode) => dispatch(SettingsActions.setDevMode(devMode));

  const setGeoTaggingFormat = (geoTaggingFormat) =>
    dispatch(SettingsActions.setGeoTaggingFormat(geoTaggingFormat));

  const setHistory = (key, value) =>
    dispatch(SettingsActions.setHistory(key, value));

  return (
    <List sx={{ overflowX: 'hidden', overflowY: 'auto', height: '100%' }}>
      <ListItem>
        <TsButton
          data-tid="resetSettingsTID"
          onClick={() =>
            openConfirmDialog(
              t('core:confirm'),
              t('core:confirmResetSettings'),
              (result) => {
                if (result) {
                  clearAllURLParams();
                  localStorage.clear();
                  // eslint-disable-next-line no-restricted-globals
                  if (AppConfig.isElectron) {
                    window.electronIO.ipcRenderer.sendMessage('reloadWindow');
                  } else {
                    window.location.reload();
                  }
                }
              },
              'cancelResetSettingsDialogTID',
              'confirmResetSettingsDialogTID',
              'confirmResetSettingsDialogContentTID',
            )
          }
          color="secondary"
          sx={{ marginLeft: '-7px' }}
        >
          {t('core:resetSettings')}
        </TsButton>
        <TsButton
          data-tid="reloadAppTID"
          sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
          onClick={() => {
            if (AppConfig.isElectron) {
              window.electronIO.ipcRenderer.sendMessage('reloadWindow');
            } else {
              window.location.reload();
            }
          }}
          color="secondary"
        >
          {t('core:reloadApplication')}
        </TsButton>
      </ListItem>
      <ListItem>
        <ListItemText
          primary={
            <>
              {t('core:workspaces')}
              <ProLabel />
            </>
          }
        />
        <TsButton
          disabled={!Pro}
          onClick={(event) => editWorkSpacesClick(event)}
        >
          {t('createWorkspace')}
        </TsButton>
      </ListItem>
      {workSpaces && workSpaces.length > 0 && (
        <List
          sx={{
            padding: '5px',
            paddingLeft: '10px',
            backgroundColor: '#d3d3d34a',
            borderRadius: AppConfig.defaultCSSRadius,
          }}
          dense
        >
          {workSpaces.map((workSpace, index) => (
            <ListItem key={workSpace.uuid}>
              <ListItemText
                primary={workSpace.fullName + ' - ' + workSpace.shortName}
              />
              <TsIconButton
                aria-label={'Edit workspace'}
                aria-haspopup="true"
                edge="end"
                disabled={!Pro}
                data-tid={'workSpaceEdit_' + workSpace.shortName}
                onClick={(event) => editWorkSpacesClick(event, workSpace)}
              >
                <EditIcon />
              </TsIconButton>
            </ListItem>
          ))}
        </List>
      )}
      <ListItem>
        <ListItemText primary={t('core:fileOpenHistory')} />
        <ListItemIcon>
          <TsIconButton
            tooltip={t('clearHistory')}
            aria-label={t('core:clearHistory')}
            onClick={() => setConfirmDialogKey(historyKeys.fileOpenKey)}
            data-tid="clearSearchTID"
          >
            <DeleteIcon />
          </TsIconButton>
        </ListItemIcon>
        <TsSelect
          data-tid="fileOpenTID"
          fullWidth={false}
          title={t('core:fileOpenHistoryTitle')}
          value={settings[historyKeys.fileOpenKey]}
          onChange={(event) =>
            setHistory(historyKeys.fileOpenKey, event.target.value)
          }
        >
          <MenuItem value={0}>{t('core:disabled')}</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </TsSelect>
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:folderOpenHistory')} />
        <ListItemIcon>
          <TsIconButton
            tooltip={t('clearHistory')}
            aria-label={t('core:clearHistory')}
            onClick={() => setConfirmDialogKey(historyKeys.folderOpenKey)}
            data-tid="clearSearchTID"
          >
            <DeleteIcon />
          </TsIconButton>
        </ListItemIcon>
        <TsSelect
          data-tid="folderOpenTID"
          fullWidth={false}
          title={t('core:folderOpenHistoryTitle')}
          value={settings[historyKeys.folderOpenKey]}
          onChange={(event: any) =>
            setHistory(historyKeys.folderOpenKey, event.target.value)
          }
        >
          <MenuItem value={0}>{t('core:disabled')}</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </TsSelect>
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:fileEditHistory')} />
        <ListItemIcon>
          <TsIconButton
            tooltip={t('clearHistory')}
            aria-label={t('core:clearHistory')}
            onClick={() => setConfirmDialogKey(historyKeys.fileEditKey)}
            data-tid="clearSearchTID"
          >
            <DeleteIcon />
          </TsIconButton>
        </ListItemIcon>
        <TsSelect
          data-tid="fileEditTID"
          fullWidth={false}
          title={t('core:fileEditHistoryTitle')}
          value={settings[historyKeys.fileEditKey]}
          onChange={(event: any) =>
            setHistory(historyKeys.fileEditKey, event.target.value)
          }
        >
          <MenuItem value={0}>{t('core:disabled')}</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </TsSelect>
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:searchHistory')} />
        <ListItemIcon>
          <TsIconButton
            tooltip={t('clearHistory')}
            aria-label={t('core:clearHistory')}
            onClick={() => setConfirmDialogKey(historyKeys.searchHistoryKey)}
            data-tid="clearSearchTID"
          >
            <DeleteIcon />
          </TsIconButton>
        </ListItemIcon>
        <TsSelect
          data-tid="searchHistoryTID"
          fullWidth={false}
          title={t('core:searchHistoryTitle')}
          value={settings[historyKeys.searchHistoryKey]}
          onChange={(event: any) =>
            setHistory(historyKeys.searchHistoryKey, event.target.value)
          }
        >
          <MenuItem value={0}>{t('core:disabled')}</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </TsSelect>
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:geoTaggingFormat')} />
        <TsSelect
          disabled={geoTaggingFormatDisabled}
          fullWidth={false}
          data-tid="geoTaggingFormatTID"
          title={
            geoTaggingFormatDisabled
              ? t('core:settingExternallyConfigured')
              : ''
          }
          value={
            geoTaggingFormatDisabled
              ? AppConfig.geoTaggingFormat
              : settings.geoTaggingFormat
          }
          onChange={(event: any) => setGeoTaggingFormat(event.target.value)}
        >
          {settings.supportedGeoTagging.map((geoTagging) => (
            <MenuItem key={geoTagging} value={geoTagging}>
              {geoTagging.toUpperCase()}
            </MenuItem>
          ))}
        </TsSelect>
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:tileServerTitle')} />
        <TsButton
          onClick={(event) => handleEditTileServerClick(event, {}, true)}
        >
          {t('tileServerDialogAdd')}
        </TsButton>
      </ListItem>
      <List
        sx={{
          padding: '5px',
          paddingLeft: '10px',
          backgroundColor: '#d3d3d34a',
          borderRadius: AppConfig.defaultCSSRadius,
        }}
        dense
      >
        {tileServers.length > 0 ? (
          tileServers.map((tileServer, index) => (
            <ListItem key={tileServer.uuid}>
              <ListItemText
                primary={tileServer.name}
                secondary={tileServer.serverURL}
              />
              <TsIconButton
                aria-label={t('core:options')}
                aria-haspopup="true"
                edge="end"
                data-tid={'tileServerEdit_' + tileServer.name}
                onClick={(event) =>
                  handleEditTileServerClick(event, tileServer, index === 0)
                }
              >
                <EditIcon />
              </TsIconButton>
              {index === 0 && (
                <TooltipTS title={t('core:serverIsDefaultHelp')}>
                  <CheckIcon
                    data-tid="tileServerDefaultIndication"
                    sx={{ marginLeft: '10px' }}
                  />
                </TooltipTS>
              )}
            </ListItem>
          ))
        ) : (
          <ListItem key="noTileServers">
            <ListItemText
              primary={t('core:noTileServersTitle')}
              secondary={t('core:addTileServersHelp')}
            />
          </ListItem>
        )}
      </List>
      {tileServerDialog && (
        <MapTileServerDialog
          open={tileServerDialog !== undefined}
          onClose={() => setTileServerDialog(undefined)}
          tileServer={tileServerDialog}
          isDefault={tileServerDialog.isDefault}
        />
      )}
      <ListItem>
        <ListItemText
          primary={
            <>
              {t('enableDevMode')}
              <InfoIcon
                tooltip={
                  'Will enable some experimental features and turn on extra debugging'
                }
              />
            </>
          }
        />
        <Switch
          data-tid="settingsEnableDevMode"
          disabled={window.ExtDevMode && window.ExtDevMode === true}
          onClick={() => setDevMode(!devMode)}
          checked={devMode}
        />
      </ListItem>
    </List>
  );
}

export default SettingsAdvanced;
