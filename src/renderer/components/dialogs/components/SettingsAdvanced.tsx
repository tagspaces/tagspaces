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
import { DeleteIcon, ReloadIcon } from '-/components/CommonIcons';
import { ProLabel } from '-/components/HelperComponents';
import InfoIcon from '-/components/InfoIcon';
import TooltipTS from '-/components/Tooltip';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsSelect from '-/components/TsSelect';
import TsTextField from '-/components/TsTextField';
import MapTileServerDialog from '-/components/dialogs/MapTileServerDialog';
import { historyKeys } from '-/hooks/HistoryContextProvider';
import { useHistoryContext } from '-/hooks/useHistoryContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { Pro } from '-/pro';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getMapTileServers,
  getMaxCollectedTag,
  getSettings,
  isDevMode,
} from '-/reducers/settings';
import { isWorkerAvailable } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { clearAllURLParams } from '-/utils/dom';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { CircularProgress, InputAdornment, ListItemIcon } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

interface Props {}

function SettingsAdvanced(props: Props) {
  const { t } = useTranslation();
  const { delAllHistory } = useHistoryContext();
  const { openConfirmDialog } = useNotificationContext();
  const dispatch: AppDispatch = useDispatch();
  const settings = useSelector(getSettings);
  const maxCollectedTag = useSelector(getMaxCollectedTag);
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

  const setAuthor = (user: string) => dispatch(SettingsActions.setAuthor(user));

  return (
    <List style={{ overflowX: 'hidden', overflowY: 'auto', height: '100%' }}>
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
        <ListItemText primary={t('enableWS')} />
        {AppConfig.isElectron && (
          <TooltipTS
            title={
              t('core:serviceStatus') +
              ': ' +
              (wsAlive.current ? t('core:available') : t('core:notAvailable'))
            }
          >
            {wsAlive.current === null ? (
              <CircularProgress size={12} />
            ) : (
              <FiberManualRecordIcon
                sx={{
                  color: wsAlive.current ? 'green' : 'red',
                  fontSize: 19,
                  ml: 1,
                }}
              />
            )}
          </TooltipTS>
        )}
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
      {devMode && (
        <ListItem>
          <ListItemText primary={t('core:tagDelimiter')} />
          <TsSelect
            data-tid="tagDelimiterTID"
            fullWidth={false}
            title={t('core:tagDelimiter')}
            value={settings.tagDelimiter}
            onChange={(event) =>
              openConfirmDialog(
                t('core:confirm'),
                t('core:tagDelimiterChange'),
                (result) => {
                  if (result) {
                    dispatch(
                      SettingsActions.setTagDelimiter(event.target.value),
                    );
                  }
                },
                'cancelTagDelimiterChangeDialog',
                'confirmTagDelimiterChangeDialog',
                'confirmTagDelimiterChangeContent',
              )
            }
          >
            <MenuItem value=" ">{t('core:space')}</MenuItem>
            <MenuItem value=",">,</MenuItem>
            <MenuItem value="_">_</MenuItem>
          </TsSelect>
        </ListItem>
      )}
      <ListItem>
        <ListItemText primary={t('core:prefixTagContainer')} />
        <TsTextField
          style={{ maxWidth: '100px' }}
          data-tid="prefixTagContainerTID"
          value={settings.prefixTagContainer}
          onChange={(event) => setPrefixTagContainer(event.target.value)}
        />
      </ListItem>
      <ListItem>
        <ListItemText primary={t('core:maxCollectedTag')} />
        <TsTextField
          type="number"
          slotProps={{
            input: { inputMode: 'numeric', min: 0 },
          }}
          style={{ maxWidth: '92px' }}
          data-tid="prefixTagContainerTID"
          value={maxCollectedTag}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            dispatch(
              SettingsActions.setMaxCollectedTag(
                event.target.value === ''
                  ? undefined
                  : Number(event.target.value),
              ),
            )
          }
        />
      </ListItem>
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
      <ListItem
        title={
          window.ExtUseLocationTags !== undefined
            ? t('core:settingExternallyConfigured')
            : ''
        }
        // disabled={!Pro}
      >
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
          disabled={window.ExtUseLocationTags !== undefined}
          onClick={() => {
            Pro && setSaveTagInLocation(!settings.saveTagInLocation);
          }}
          checked={
            window.ExtUseLocationTags !== undefined
              ? window.ExtUseLocationTags
              : settings.saveTagInLocation
          }
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
                    style={{ marginLeft: 10 }}
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
              {t('core:workspaces')}
              <ProLabel />
            </>
          }
        />
        <TsButton
          disabled={!Pro}
          onClick={(event) => editWorkSpacesClick(event)}
        >
          {t('addWorkspace')}
        </TsButton>
      </ListItem>
      {workSpaces && workSpaces.length > 0 && (
        <List
          style={{
            padding: 5,
            paddingLeft: 10,
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
        <ListItemText
          primary={
            <>
              {t('core:author')}
              <InfoIcon
                tooltip={
                  'The value of this text box can be used for example in the templates as {author} variable. If you do not want this, just leave the text box empty.'
                }
              />
            </>
          }
        />
        <TsTextField
          disabled={window.ExtAuthor !== undefined}
          title={window.ExtAuthor ? t('core:settingExternallyConfigured') : ''}
          data-tid="authorTID"
          value={window.ExtAuthor ? window.ExtAuthor : settings.author}
          onChange={(event) => setAuthor(event.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <TooltipTS title={t('loadDefaultAuthor')}>
                    <TsIconButton
                      data-tid="loadDefaultAuthorTID"
                      disabled={window.ExtAuthor !== undefined}
                      onClick={() =>
                        dispatch(SettingsActions.setAuthor(undefined))
                      }
                    >
                      <ReloadIcon />
                    </TsIconButton>
                  </TooltipTS>
                </InputAdornment>
              ),
            },
          }}
        />
      </ListItem>
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
