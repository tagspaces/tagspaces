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

import React, { useContext, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '-/components/Tooltip';
import TsButton from '-/components/TsButton';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import TsIconButton from '-/components/TsIconButton';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import AppConfig from '-/AppConfig';
import {
  actions as SettingsActions,
  getSettings,
  getMapTileServers,
  isDevMode,
} from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import MapTileServerDialog from '-/components/dialogs/MapTileServerDialog';
import TsTextField from '-/components/TsTextField';
import TsSelect from '-/components/TsSelect';
import { Pro } from '-/pro';
import { ProLabel } from '-/components/HelperComponents';
import InfoIcon from '-/components/InfoIcon';
import { DeleteIcon } from '-/components/CommonIcons';
import { ListItemIcon } from '@mui/material';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { AppDispatch } from '-/reducers/app';
import { useTranslation } from 'react-i18next';

interface Props {
  showResetSettings: (showDialog: boolean) => void;
}

const historyKeys = Pro ? Pro.keys.historyKeys : {};

function SettingsAdvanced(props: Props) {
  const { showResetSettings } = props;
  const { t } = useTranslation();
  const historyContext = Pro?.contextProviders?.HistoryContext
    ? useContext<TS.HistoryContextData>(Pro.contextProviders.HistoryContext)
    : undefined;
  const dispatch: AppDispatch = useDispatch();
  const settings = useSelector(getSettings);
  const tileServers: Array<TS.MapTileServer> = useSelector(getMapTileServers);
  const devMode = useSelector(isDevMode);
  const [tileServerDialog, setTileServerDialog] = useState<any>(undefined);
  const [confirmDialogKey, setConfirmDialogKey] = useState<null | string>(null);

  const handleEditTileServerClick = (event, tileServer, isDefault: boolean) => {
    event.preventDefault();
    event.stopPropagation();
    setTileServerDialog({ ...tileServer, isDefault });
  };

  const geoTaggingFormatDisabled = AppConfig.geoTaggingFormat !== undefined;

  const setDesktopMode = (desktopMode) =>
    dispatch(SettingsActions.setDesktopMode(desktopMode));

  const setDevMode = (devMode) => dispatch(SettingsActions.setDevMode(devMode));

  const setEnableWS = (enableWS) =>
    dispatch(SettingsActions.setEnableWS(enableWS));

  const setWarningOpeningFilesExternally = (warningOpeningFilesExternally) =>
    dispatch(
      SettingsActions.setWarningOpeningFilesExternally(
        warningOpeningFilesExternally,
      ),
    );

  const setSaveTagInLocation = (saveTagInLocation) =>
    dispatch(SettingsActions.setSaveTagInLocation(saveTagInLocation));

  const setRevisionsEnabled = (enabled) =>
    dispatch(SettingsActions.setRevisionsEnabled(enabled));

  const setGeoTaggingFormat = (geoTaggingFormat) =>
    dispatch(SettingsActions.setGeoTaggingFormat(geoTaggingFormat));

  const setHistory = (key, value) =>
    dispatch(SettingsActions.setHistory(key, value));

  const setPrefixTagContainer = (prefix) =>
    dispatch(SettingsActions.setPrefixTagContainer(prefix));

  return (
    <List style={{ overflowX: 'hidden', overflowY: 'auto', height: '100%' }}>
      <ListItem>
        <TsButton
          data-tid="resetSettingsTID"
          onClick={() => showResetSettings(true)}
          color="secondary"
          style={{ marginLeft: -7 }}
        >
          {t('core:resetSettings')}
        </TsButton>
        <TsButton
          data-tid="reloadAppTID"
          style={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
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
        <ListItemText primary={t('enableMobileMode')} />
        <Switch
          data-tid="settingsSetDesktopMode"
          disabled={!(typeof window.ExtDisplayMode === 'undefined')}
          onClick={() => setDesktopMode(!settings.desktopMode)}
          checked={!settings.desktopMode}
        />
      </ListItem>
      <ListItem>
        <ListItemText primary={t('enableDevMode')} />
        <Switch
          data-tid="settingsEnableDevMode"
          disabled={window.ExtDevMode && window.ExtDevMode === true}
          onClick={() => setDevMode(!devMode)}
          checked={devMode}
        />
      </ListItem>
      <ListItem>
        <ListItemText primary={t('enableWS')} />
        <Switch
          data-tid="settingsEnableWS"
          disabled={!AppConfig.isElectron}
          onClick={() => setEnableWS(!settings.enableWS)}
          checked={settings.enableWS}
        />
      </ListItem>
      <ListItem>
        <ListItemText primary={t('warningOpeningFilesExternally')} />
        <Switch
          data-tid="warningOpeningFilesExternally"
          onClick={() =>
            setWarningOpeningFilesExternally(
              !settings.warningOpeningFilesExternally,
            )
          }
          checked={settings.warningOpeningFilesExternally}
        />
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:prefixTagContainer')} />
        <TsTextField
          style={{ maxWidth: '100px' }}
          data-tid="prefixTagContainerTID"
          value={settings.prefixTagContainer}
          onChange={(event) => setPrefixTagContainer(event.target.value)}
        />
      </ListItem>
      {Pro && (
        <>
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
                onClick={() =>
                  setConfirmDialogKey(historyKeys.searchHistoryKey)
                }
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
          <ConfirmDialog
            open={confirmDialogKey !== null}
            onClose={() => {
              setConfirmDialogKey(null);
            }}
            title="Confirm"
            content={t('core:confirm' + confirmDialogKey + 'Deletion')}
            confirmCallback={(result) => {
              if (result) {
                historyContext.delAllHistory(confirmDialogKey);
              }
            }}
            cancelDialogTID={'cancelDelete' + confirmDialogKey + 'Dialog'}
            confirmDialogTID={'confirmDelete' + confirmDialogKey + 'Dialog'}
            confirmDialogContentTID={
              'confirmDelete' + confirmDialogKey + 'DialogContent'
            }
          />
        </>
      )}
      <ListItem>
        <ListItemText
          primary={
            <>
              {t('setRevisionsEnabled')}
              <InfoIcon tooltip={t('core:setRevisionsEnabledHelp')} />
              <ProLabel />
            </>
          }
        />
        <Switch
          data-tid="setRevisionsEnabledTID"
          disabled={!Pro}
          onClick={() => setRevisionsEnabled(!settings.isRevisionsEnabled)}
          checked={settings.isRevisionsEnabled}
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary={
            <>
              {t('enableTagsFromLocation')}
              <InfoIcon tooltip={t('core:enableTagsFromLocationHelp')} />
              <ProLabel />
            </>
          }
        />
        <Switch
          data-tid="saveTagInLocationTID"
          disabled={!Pro}
          onClick={() => setSaveTagInLocation(!settings.saveTagInLocation)}
          checked={settings.saveTagInLocation}
        />
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
        style={{
          padding: 5,
          paddingLeft: 10,
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
                style={{ maxWidth: 470 }}
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
                <Tooltip title={t('core:serverIsDefaultHelp')}>
                  <CheckIcon
                    data-tid="tileServerDefaultIndication"
                    style={{ marginLeft: 10 }}
                  />
                </Tooltip>
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
    </List>
  );
}

export default SettingsAdvanced;
