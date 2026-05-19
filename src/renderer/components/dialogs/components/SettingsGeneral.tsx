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
import {
  CheckIcon,
  CloseIcon,
  CreateFileIcon,
  DeleteIcon,
  EditIcon,
  ReloadIcon,
} from '-/components/CommonIcons';
import { BetaLabel, ProLabel } from '-/components/HelperComponents';
import InfoIcon from '-/components/InfoIcon';
import PerspectiveSelector from '-/components/PerspectiveSelector';
import TsTooltip from '-/components/TsTooltip';
import TransparentBackground from '-/components/TransparentBackground';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsSelect from '-/components/TsSelect';
import TsSwitch from '-/components/TsSwitch';
import TsTextField from '-/components/TsTextField';
import TsToggleButton from '-/components/TsToggleButton';
import ColorPickerDialog from '-/components/dialogs/ColorPickerDialog';
import { historyKeys } from '-/hooks/HistoryContextProvider';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useHistoryContext } from '-/hooks/useHistoryContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { PerspectiveIDs } from '-/perspectives';
import { Pro } from '-/pro';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getFileNameTagPlace,
  getMapTileServers,
  getMaxCollectedTag,
  getPersistTagsInSidecarFile,
  getSettings,
  isDevMode,
  isHideProFeatures,
} from '-/reducers/settings';
import { isWorkerAvailable, setLanguage } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { clearAllURLParams } from '-/utils/dom';
import { darkThemes, lightThemes } from '-/utils/Themes';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Box, IconButton, InputAdornment, ListItemIcon } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import MapTileServerDialog from '../MapTileServerDialog';

function SettingsGeneral() {
  const { i18n, t } = useTranslation();
  const { openCurrentDirectory } = useDirectoryContentContext();
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const [displayTextColorPicker, setDisplayTextColorPicker] =
    useState<boolean>(false);
  const [displayFolderColorPicker, setDisplayFolderColorPicker] =
    useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>('');
  const dispatch: AppDispatch = useDispatch();
  const settings = useSelector(getSettings);
  const persistTagsInSidecarFile = useSelector(getPersistTagsInSidecarFile);
  const filenameTagPlacedAtEnd = useSelector(getFileNameTagPlace);

  // --- Advanced settings imports ---
  const maxCollectedTag = useSelector(getMaxCollectedTag);
  const { openConfirmDialog } = useNotificationContext();
  const { delAllHistory } = useHistoryContext();
  const devMode = useSelector(isDevMode);
  const hideProFeatures = useSelector(isHideProFeatures);
  const tileServers: Array<TS.MapTileServer> = useSelector(getMapTileServers);
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

  // --- Advanced settings handlers ---
  const toggleDefaultTagBackgroundColorPicker = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const toggleDefaultTagTextColorPicker = () => {
    setDisplayTextColorPicker(!displayTextColorPicker);
  };

  const toggleDefaultFolderColorPicker = () => {
    setDisplayFolderColorPicker(!displayFolderColorPicker);
  };

  const handleMaxSearchResult = (event) => {
    dispatch(SettingsActions.setMaxSearchResult(event.target.value));
  };

  const changePerspective = (event: any) => {
    const perspective = event.target.value;
    dispatch(SettingsActions.setDefaultPerspective(perspective));
  };
  let defaultPerspective = PerspectiveIDs.UNSPECIFIED;
  if (settings.defaultPerspective) {
    defaultPerspective = settings.defaultPerspective;
  }

  const setDesktopMode = (desktopMode) =>
    dispatch(SettingsActions.setDesktopMode(desktopMode));

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

  const setPrefixTagContainer = (prefix) =>
    dispatch(SettingsActions.setPrefixTagContainer(prefix));

  const setAuthor = (user: string) => dispatch(SettingsActions.setAuthor(user));

  // --- Advanced settings handlers ---
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

  const geoTaggingFormatDisabled = AppConfig.ExtGeoTaggingFormat !== undefined;

  const setDevMode = (value) => dispatch(SettingsActions.setDevMode(value));

  const setGeoTaggingFormat = (geoTaggingFormat) =>
    dispatch(SettingsActions.setGeoTaggingFormat(geoTaggingFormat));

  const setHistory = (key, value) =>
    dispatch(SettingsActions.setHistory(key, value));

  // --- Settings items ---
  const settingsItems = useMemo(
    () =>
      [
        {
          label: t('core:interfaceLanguage'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('core:interfaceLanguage')} />
              <TsSelect
                data-tid="settingsSetLanguage"
                fullWidth={false}
                value={settings.interfaceLanguage}
                onChange={(event: any) => {
                  return i18n.changeLanguage(event.target.value).then(() => {
                    dispatch(SettingsActions.setLanguage(event.target.value));
                    setLanguage(event.target.value);
                    return true;
                  });
                }}
              >
                {settings.supportedLanguages.map((language) => (
                  <MenuItem key={language.iso} value={language.iso}>
                    {language.title}
                  </MenuItem>
                ))}
              </TsSelect>
            </ListItem>
          ),
        },
        {
          label: t('core:themeSelector'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('core:themeSelector')} />
              <TsSelect
                data-tid="settingsSetCurrentTheme"
                fullWidth={false}
                value={settings.currentTheme}
                onChange={(event: any) =>
                  dispatch(SettingsActions.setCurrentTheme(event.target.value))
                }
              >
                {settings.supportedThemes.map((theme) => (
                  <MenuItem key={theme} value={theme}>
                    {theme === 'light' && t('core:regularScheme')}
                    {theme === 'dark' && t('core:darkScheme')}
                    {theme === 'system' && t('core:systemScheme')}
                  </MenuItem>
                ))}
              </TsSelect>
            </ListItem>
          ),
        },
        {
          label: t('core:themeRegularSelector'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('core:themeRegularSelector')} />
              <TsSelect
                data-tid="settingsCurrentRegularThemeTID"
                fullWidth={false}
                value={settings.currentRegularTheme}
                onChange={(event: any) =>
                  dispatch(
                    SettingsActions.setCurrentRegularTheme(event.target.value),
                  )
                }
              >
                {Object.entries(lightThemes).map((theme) => {
                  const themeKey = theme[0];
                  const themeValue = theme[1];
                  const themeName =
                    themeKey.charAt(0).toUpperCase() + themeKey.slice(1);
                  return (
                    <MenuItem key={themeKey} value={themeKey}>
                      <div style={{ display: 'flex' }}>
                        <ListItemIcon>
                          <Box
                            component="div"
                            sx={{
                              // @ts-ignore
                              backgroundColor: themeValue.background.default,
                              width: '30px',
                              height: '30px',
                              borderTopLeftRadius: AppConfig.defaultCSSRadius,
                              borderBottomLeftRadius:
                                AppConfig.defaultCSSRadius,
                            }}
                          ></Box>
                          <Box
                            component="div"
                            sx={{
                              // @ts-ignore
                              backgroundColor: themeValue.primary.main,
                              width: '30px',
                              height: '30px',
                              borderTopRightRadius: AppConfig.defaultCSSRadius,
                              borderBottomRightRadius:
                                AppConfig.defaultCSSRadius,
                              marginRight: '10px',
                            }}
                          ></Box>
                        </ListItemIcon>
                        <ListItemText>{themeName}</ListItemText>
                      </div>
                    </MenuItem>
                  );
                })}
              </TsSelect>
            </ListItem>
          ),
        },
        {
          label: t('core:themeDarkSelector'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('core:themeDarkSelector')} />
              <TsSelect
                data-tid="settingsCurrentDarkThemeTID"
                fullWidth={false}
                value={settings.currentDarkTheme}
                onChange={(event: any) =>
                  dispatch(
                    SettingsActions.setCurrentDarkTheme(event.target.value),
                  )
                }
              >
                {Object.entries(darkThemes).map((theme) => {
                  const themeKey = theme[0];
                  const themeValue = theme[1];
                  const themeName =
                    themeKey.charAt(0).toUpperCase() + themeKey.slice(1);
                  return (
                    <MenuItem key={themeKey} value={themeKey}>
                      <div style={{ display: 'flex' }}>
                        <ListItemIcon>
                          <Box
                            component="div"
                            sx={{
                              // @ts-ignore
                              backgroundColor: themeValue.background.default,
                              width: '30px',
                              height: '30px',
                              borderTopLeftRadius: AppConfig.defaultCSSRadius,
                              borderBottomLeftRadius:
                                AppConfig.defaultCSSRadius,
                            }}
                          ></Box>
                          <Box
                            component="div"
                            sx={{
                              // @ts-ignore
                              backgroundColor: themeValue.primary.main,
                              width: '30px',
                              height: '30px',
                              borderTopRightRadius: AppConfig.defaultCSSRadius,
                              borderBottomRightRadius:
                                AppConfig.defaultCSSRadius,
                              marginRight: '10px',
                            }}
                          ></Box>
                        </ListItemIcon>
                        <ListItemText>{themeName}</ListItemText>
                      </div>
                    </MenuItem>
                  );
                })}
              </TsSelect>
            </ListItem>
          ),
        },
        {
          label: t('createLocationDefaultPerspective'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('createLocationDefaultPerspective')} />
              <PerspectiveSelector
                fullWidth={false}
                onChange={changePerspective}
                defaultValue={defaultPerspective}
                testId="changePerspectiveInSettingsTID"
              />
            </ListItem>
          ),
        },
        {
          label: t('core:fileTaggingSetting'),
          jsx: (
            <ListItem
              title={
                AppConfig.ExtUseSidecarsForFileTagging !== undefined
                  ? t('core:settingExternallyConfigured')
                  : ''
              }
            >
              <ListItemText primary={t('core:fileTaggingSetting')} />
              {AppConfig.ExtUseSidecarsForFileTagging !== undefined ? (
                <TsButton disabled>
                  {persistTagsInSidecarFile
                    ? t('core:useSidecarFile')
                    : t('core:renameFile')}
                </TsButton>
              ) : (
                <ToggleButtonGroup
                  value={persistTagsInSidecarFile}
                  size="small"
                  exclusive
                >
                  <TsToggleButton
                    value={false}
                    data-tid="settingsSetPersistTagsInFileName"
                    sx={{
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                    onClick={() =>
                      dispatch(
                        SettingsActions.setPersistTagsInSidecarFile(false),
                      )
                    }
                  >
                    <div style={{ display: 'flex', textTransform: 'unset' }}>
                      {!persistTagsInSidecarFile && <CheckIcon />}
                      &nbsp;{t('core:renameFile')}&nbsp;&nbsp;
                      <InfoIcon tooltip={t('core:tagsInFilenameExplanation')} />
                    </div>
                  </TsToggleButton>
                  <TsToggleButton
                    value={true}
                    data-tid="settingsSetPersistTagsInSidecarFile"
                    sx={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                    }}
                    onClick={() =>
                      dispatch(
                        SettingsActions.setPersistTagsInSidecarFile(true),
                      )
                    }
                  >
                    <div style={{ display: 'flex' }}>
                      {persistTagsInSidecarFile && <CheckIcon />}
                      &nbsp;{t('core:useSidecarFile')}&nbsp;&nbsp;
                      <InfoIcon
                        tooltip={t('core:tagsInSidecarFileExplanation')}
                      />
                    </div>
                  </TsToggleButton>
                </ToggleButtonGroup>
              )}
            </ListItem>
          ),
        },
        !persistTagsInSidecarFile && {
          label: t('core:fileNameTagSetting'),
          jsx: (
            <ListItem
              title={
                AppConfig.ExtFilenameTagPlacedAtEnd !== undefined
                  ? t('core:settingExternallyConfigured')
                  : ''
              }
            >
              <ListItemText
                primary={
                  AppConfig.ExtFilenameTagPlacedAtEnd !== undefined ? (
                    <>
                      {t('core:fileNameTagSetting')}
                      <InfoIcon
                        tooltip={t('core:settingExternallyConfigured')}
                      />
                    </>
                  ) : (
                    t('core:fileNameTagSetting')
                  )
                }
              />
              <ToggleButtonGroup
                value={filenameTagPlacedAtEnd}
                size="small"
                exclusive
                disabled={AppConfig.ExtFilenameTagPlacedAtEnd !== undefined}
              >
                <TsToggleButton
                  value={false}
                  data-tid="fileNameBeginningTagTID"
                  sx={{
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                  onClick={() =>
                    dispatch(SettingsActions.setFileNameTagPlace(false))
                  }
                >
                  <Box sx={{ display: 'flex' }}>
                    {!filenameTagPlacedAtEnd && <CheckIcon />}
                    &nbsp;{t('core:atTheBeginningOfFileName')}&nbsp;&nbsp;
                    <InfoIcon
                      tooltip={t('core:fileNameBeginTagPlaceExplanation')}
                    />
                  </Box>
                </TsToggleButton>
                <TsToggleButton
                  value={true}
                  data-tid="fileNameEndTagTID"
                  sx={{
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                  onClick={() =>
                    dispatch(SettingsActions.setFileNameTagPlace(true))
                  }
                >
                  <Box sx={{ display: 'flex' }}>
                    {filenameTagPlacedAtEnd && <CheckIcon />}
                    &nbsp;{t('core:filenameTagPlacedAtEnd')}&nbsp;&nbsp;
                    <InfoIcon
                      tooltip={t('core:fileNameEndTagPlaceExplanation')}
                    />
                  </Box>
                </TsToggleButton>
              </ToggleButtonGroup>
            </ListItem>
          ),
        },
        {
          label: t('core:checkForNewVersionOnStartup'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('core:checkForNewVersionOnStartup')} />
              <TsTooltip
                title={
                  AppConfig.ExtCheckForUpdatesOnStartup !== undefined
                    ? t('core:settingExternallyConfigured')
                    : ''
                }
              >
                {/* span wrapper lets the Tooltip listen to events even
                    when the Switch is disabled (disabled controls don't
                    fire pointer events). */}
                <span>
                  <TsSwitch
                    disabled={
                      AppConfig.ExtCheckForUpdatesOnStartup !== undefined
                    }
                    data-tid="settingsSetCheckForUpdates"
                    onClick={() =>
                      dispatch(
                        SettingsActions.setCheckForUpdates(
                          !settings.checkForUpdates,
                        ),
                      )
                    }
                    checked={
                      AppConfig.ExtCheckForUpdatesOnStartup !== undefined
                        ? AppConfig.ExtCheckForUpdatesOnStartup
                        : settings.checkForUpdates
                    }
                  />
                </span>
              </TsTooltip>
            </ListItem>
          ),
        },
        {
          label: t('core:reorderTags'),
          jsx: (
            <ListItem>
              <ListItemText
                primary={
                  <>
                    {t('core:reorderTags')}
                    <BetaLabel />
                  </>
                }
              />
              <TsSwitch
                data-tid="reorderTagsTID"
                onClick={() =>
                  dispatch(SettingsActions.reorderTags(!settings.reorderTags))
                }
                checked={settings.reorderTags}
              />
            </ListItem>
          ),
        },
        {
          label: t('core:addTagsToLibrary'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('core:addTagsToLibrary')} />
              <TsSwitch
                data-tid="settingsSetAddTagsToLibrary"
                onClick={() =>
                  dispatch(
                    SettingsActions.setAddTagsToLibrary(
                      !settings.addTagsToLibrary,
                    ),
                  )
                }
                checked={settings.addTagsToLibrary}
              />
            </ListItem>
          ),
        },
        {
          label: t('core:useOnlyTagsFromTagLibrary'),
          jsx: (
            <ListItem
              title={
                AppConfig.ExtUseOnlyTagsFromTagLibrary !== undefined
                  ? t('core:settingExternallyConfigured')
                  : ''
              }
            >
              <ListItemText primary={t('core:useOnlyTagsFromTagLibrary')} />
              <TsSwitch
                disabled={AppConfig.ExtUseOnlyTagsFromTagLibrary !== undefined}
                data-tid="useOnlyTagsFromTagLibraryTID"
                onClick={() =>
                  dispatch(
                    SettingsActions.setUseOnlyTagsFromTagLibrary(
                      !settings.useOnlyTagsFromTagLibrary,
                    ),
                  )
                }
                checked={
                  AppConfig.ExtUseOnlyTagsFromTagLibrary !== undefined
                    ? AppConfig.ExtUseOnlyTagsFromTagLibrary
                    : settings.useOnlyTagsFromTagLibrary
                }
              />
            </ListItem>
          ),
        },
        {
          label: t('core:useGenerateThumbnails'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('core:useGenerateThumbnails')} />
              <TsSwitch
                disabled={AppConfig.ExtUseGenerateThumbnails !== undefined}
                data-tid="settingsUseGenerateThumbnails"
                onClick={() =>
                  dispatch(
                    SettingsActions.setUseGenerateThumbnails(
                      !settings.useGenerateThumbnails,
                    ),
                  )
                }
                checked={
                  AppConfig.ExtUseGenerateThumbnails !== undefined
                    ? AppConfig.ExtUseGenerateThumbnails
                    : settings.useGenerateThumbnails
                }
              />
            </ListItem>
          ),
        },
        {
          label: t('core:autoSaveDescription'),
          jsx: (
            <ListItem>
              <ListItemText
                primary={
                  <>
                    {t('core:autoSaveDescription')}
                    <ProLabel />
                  </>
                }
              />
              <TsSwitch
                data-tid="settingsAutoSaveDescriptionTID"
                disabled={!Pro}
                onClick={() =>
                  dispatch(
                    SettingsActions.setAutoSaveDescription(
                      !settings.autoSaveDescription,
                    ),
                  )
                }
                checked={settings.autoSaveDescription}
              />
            </ListItem>
          ),
        },
        {
          label: t('core:tagBackgroundColor'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('core:tagBackgroundColor')} />
              <TransparentBackground>
                <TsButton
                  data-tid="settingsToggleDefaultTagBackgroundColor"
                  sx={{
                    backgroundColor: settings.tagBackgroundColor,
                    border: '1px solid lightgray',
                  }}
                  onClick={toggleDefaultTagBackgroundColorPicker}
                >
                  &nbsp;
                </TsButton>
              </TransparentBackground>
            </ListItem>
          ),
        },
        {
          label: t('core:tagForegroundColor'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('core:tagForegroundColor')} />
              <TransparentBackground>
                <TsButton
                  data-tid="settingsToggleDefaultTagForegroundColor"
                  sx={{
                    border: '1px solid lightgray',
                    backgroundColor: settings.tagTextColor,
                  }}
                  onClick={toggleDefaultTagTextColorPicker}
                >
                  &nbsp;
                </TsButton>
              </TransparentBackground>
            </ListItem>
          ),
        },
        {
          label: t('core:defaultFolderColor'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('core:defaultFolderColor')} />
              <TransparentBackground>
                <TsTooltip
                  title={
                    AppConfig.ExtDefaultFolderColor !== undefined
                      ? t('core:settingExternallyConfigured')
                      : ''
                  }
                >
                  <span>
                    <TsButton
                      data-tid="settingsToggleDefaultFolderColor"
                      disabled={AppConfig.ExtDefaultFolderColor !== undefined}
                      sx={{
                        backgroundColor:
                          AppConfig.ExtDefaultFolderColor ??
                          settings.defaultFolderColor,
                        border: '1px solid lightgray',
                      }}
                      onClick={toggleDefaultFolderColorPicker}
                    >
                      &nbsp;
                    </TsButton>
                  </span>
                </TsTooltip>
              </TransparentBackground>
            </ListItem>
          ),
        },
        AppConfig.isElectron && {
          label: t('core:useTrashCan'),
          jsx: (
            <ListItem>
              <ListItemText
                primary={
                  <Typography>
                    {t('core:useTrashCan')}
                    <InfoIcon tooltip={t('core:useTrashCanInfo')} />
                  </Typography>
                }
              />
              <TsSwitch
                data-tid="settingsSetUseTrashCan"
                onClick={() =>
                  dispatch(
                    SettingsActions.setUseTrashCan(!settings.useTrashCan),
                  )
                }
                checked={settings.useTrashCan}
              />
            </ListItem>
          ),
        },
        {
          label: t('core:showUnixHiddenFiles'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('core:showUnixHiddenFiles')} />
              <TsSwitch
                data-tid="settingsSetShowUnixHiddenEntries"
                onClick={() => {
                  dispatch(SettingsActions.toggleShowUnixHiddenEntries());
                  openCurrentDirectory(!settings.showUnixHiddenEntries);
                }}
                checked={settings.showUnixHiddenEntries}
              />
            </ListItem>
          ),
        },
        {
          label: t('core:showSymbolicLinks'),
          jsx: (
            <ListItem>
              <ListItemText
                primary={
                  <Typography>
                    {t('core:showSymbolicLinks')}
                    <InfoIcon tooltip={t('core:showSymbolicLinksInfo')} />
                  </Typography>
                }
              />
              <TsSwitch
                data-tid="settingsSetShowSymbolicLinks"
                onClick={() => {
                  dispatch(SettingsActions.toggleShowSymbolicLinks());
                  openCurrentDirectory();
                }}
                checked={settings.showSymbolicLinks !== false}
              />
            </ListItem>
          ),
        },
        {
          label: t('core:maxSearchResultChoose'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('core:maxSearchResultChoose')} />
              <TsTextField
                sx={{ maxWidth: '100px' }}
                type="number"
                data-tid="settingsMaxSearchResult"
                value={settings.maxSearchResult}
                onChange={handleMaxSearchResult}
              />
            </ListItem>
          ),
        },
        {
          label: t('enableMobileMode'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('enableMobileMode')} />
              <TsSwitch
                data-tid="settingsSetDesktopMode"
                disabled={!(typeof AppConfig.ExtDisplayMode === 'undefined')}
                onClick={() => setDesktopMode(!settings.desktopMode)}
                checked={!settings.desktopMode}
              />
            </ListItem>
          ),
        },
        {
          label: t('enableWS'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('enableWS')} />
              {AppConfig.isElectron && (
                <TsTooltip
                  title={
                    t('core:serviceStatus') +
                    ': ' +
                    (wsAlive.current
                      ? t('core:available')
                      : t('core:notAvailable'))
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
                </TsTooltip>
              )}
              <TsSwitch
                data-tid="settingsEnableWS"
                disabled={!AppConfig.isElectron}
                onClick={() => setEnableWS(!settings.enableWS)}
                checked={settings.enableWS}
              />
            </ListItem>
          ),
        },
        {
          label: t('warningOpeningFilesExternally'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('warningOpeningFilesExternally')} />
              <TsSwitch
                data-tid="warningOpeningFilesExternally"
                onClick={() =>
                  setWarningOpeningFilesExternally(
                    !settings.warningOpeningFilesExternally,
                  )
                }
                checked={settings.warningOpeningFilesExternally}
              />
            </ListItem>
          ),
        },
        devMode && {
          label: t('core:tagDelimiter'),
          jsx: (
            <ListItem>
              <ListItemText
                primary={
                  <>
                    {t('core:tagDelimiter')}
                    <InfoIcon tooltip={t('core:tagDelimiterInfo')} />
                  </>
                }
              />
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
          ),
        },
        {
          label: t('core:prefixTagContainer'),
          jsx: (
            <ListItem>
              <ListItemText
                primary={
                  <>
                    {t('core:prefixTagContainer')}
                    <InfoIcon tooltip={t('core:prefixTagContainerInfo')} />
                  </>
                }
              />
              <TsTextField
                sx={{ maxWidth: '100px' }}
                data-tid="prefixTagContainerTID"
                value={settings.prefixTagContainer}
                onChange={(event) => setPrefixTagContainer(event.target.value)}
              />
            </ListItem>
          ),
        },
        {
          label: t('core:maxCollectedTag'),
          jsx: (
            <ListItem>
              <ListItemText primary={t('core:maxCollectedTag')} />
              <TsTextField
                type="number"
                slotProps={{
                  input: { inputMode: 'numeric', min: 0 },
                }}
                sx={{ maxWidth: '92px' }}
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
          ),
        },
        {
          label: t('core:author'),
          jsx: (
            <ListItem>
              <ListItemText
                primary={
                  <>
                    {t('core:author')}
                    <InfoIcon tooltip={t('core:authorVariableTooltip')} />
                  </>
                }
              />
              <TsTextField
                disabled={AppConfig.ExtAuthor !== undefined}
                title={
                  AppConfig.ExtAuthor
                    ? t('core:settingExternallyConfigured')
                    : ''
                }
                data-tid="authorTID"
                value={
                  AppConfig.ExtAuthor ? AppConfig.ExtAuthor : settings.author
                }
                onChange={(event) => setAuthor(event.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <TsTooltip title={t('loadDefaultAuthor')}>
                          <TsIconButton
                            data-tid="loadDefaultAuthorTID"
                            disabled={AppConfig.ExtAuthor !== undefined}
                            onClick={() =>
                              dispatch(SettingsActions.setAuthor(undefined))
                            }
                          >
                            <ReloadIcon />
                          </TsIconButton>
                        </TsTooltip>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </ListItem>
          ),
        },
        {
          label: t('core:setRevisionsEnabled'),
          jsx: (
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
              <TsSwitch
                data-tid="setRevisionsEnabledTID"
                disabled={!Pro}
                onClick={() =>
                  setRevisionsEnabled(!settings.isRevisionsEnabled)
                }
                checked={settings.isRevisionsEnabled}
              />
            </ListItem>
          ),
        },
        {
          label: t('core:settingExternallyConfigured'),
          jsx: (
            <ListItem
              title={
                AppConfig.ExtUseLocationTags !== undefined
                  ? t('core:settingExternallyConfigured')
                  : ''
              }
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
              <TsSwitch
                data-tid="saveTagInLocationTID"
                disabled={!Pro || AppConfig.ExtUseLocationTags !== undefined}
                onClick={() => {
                  Pro && setSaveTagInLocation(!settings.saveTagInLocation);
                }}
                checked={
                  AppConfig.ExtUseLocationTags !== undefined
                    ? AppConfig.ExtUseLocationTags
                    : settings.saveTagInLocation
                }
              />
            </ListItem>
          ),
        },
        {
          label: t('core:workspaces'),
          jsx: (
            <>
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
                  startIcon={<CreateFileIcon />}
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
                  {workSpaces.map((workSpace) => (
                    <ListItem key={workSpace.uuid}>
                      <ListItemText
                        primary={
                          workSpace.fullName + ' - ' + workSpace.shortName
                        }
                      />
                      <TsIconButton
                        aria-label={'Edit workspace'}
                        aria-haspopup="true"
                        edge="end"
                        disabled={!Pro}
                        data-tid={'workSpaceEdit_' + workSpace.shortName}
                        onClick={(event) =>
                          editWorkSpacesClick(event, workSpace)
                        }
                      >
                        <EditIcon />
                      </TsIconButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          ),
        },
        {
          label: t('core:fileOpenHistory'),
          jsx: (
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
          ),
        },
        {
          label: t('core:folderOpenHistory'),
          jsx: (
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
          ),
        },
        {
          label: t('core:fileEditHistory'),
          jsx: (
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
          ),
        },
        {
          label: t('core:searchHistory'),
          jsx: (
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
          ),
        },
        {
          label: t('core:geoTaggingFormat'),
          jsx: (
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
                    ? AppConfig.ExtGeoTaggingFormat
                    : settings.geoTaggingFormat
                }
                onChange={(event: any) =>
                  setGeoTaggingFormat(event.target.value)
                }
              >
                {settings.supportedGeoTagging.map((geoTagging) => (
                  <MenuItem key={geoTagging} value={geoTagging}>
                    {geoTagging.toUpperCase()}
                  </MenuItem>
                ))}
              </TsSelect>
            </ListItem>
          ),
        },
        {
          label: t('core:tileServerTitle'),
          jsx: (
            <>
              <ListItem>
                <ListItemText primary={t('core:tileServerTitle')} />
                <TsButton
                  onClick={(event) =>
                    handleEditTileServerClick(event, {}, true)
                  }
                  startIcon={<CreateFileIcon />}
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
                          handleEditTileServerClick(
                            event,
                            tileServer,
                            index === 0,
                          )
                        }
                      >
                        <EditIcon />
                      </TsIconButton>
                      {index === 0 && (
                        <TsTooltip title={t('core:serverIsDefaultHelp')}>
                          <CheckIcon
                            data-tid="tileServerDefaultIndication"
                            sx={{ marginLeft: '10px' }}
                          />
                        </TsTooltip>
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
            </>
          ),
        },
        !Pro && {
          label: t('core:hideProFeatures'),
          jsx: (
            <ListItem
              title={
                AppConfig.ExtHideProFeatures !== undefined
                  ? t('core:settingExternallyConfigured')
                  : ''
              }
            >
              <ListItemText primary={t('core:hideProFeatures')} />
              <TsSwitch
                data-tid="settingsHideProFeatures"
                disabled={AppConfig.ExtHideProFeatures !== undefined}
                onClick={() =>
                  dispatch(SettingsActions.setHideProFeatures(!hideProFeatures))
                }
                checked={hideProFeatures}
              />
            </ListItem>
          ),
        },
        {
          label: t('enableDevMode'),
          jsx: (
            <ListItem>
              <ListItemText
                primary={
                  <>
                    {t('enableDevMode')}
                    <InfoIcon tooltip={t('core:devModeTooltip')} />
                  </>
                }
              />
              <TsSwitch
                data-tid="settingsEnableDevMode"
                disabled={AppConfig?.ExtDevMode === true}
                onClick={() => setDevMode(!devMode)}
                checked={devMode}
              />
            </ListItem>
          ),
        },
        {
          label: t('Danger Zone') + ' ' + t('core:resetSettings'),
          jsx: (
            <ListItem>
              <ListItemText primary={<>{t('Danger Zone')}</>} />
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
                          window.electronIO.ipcRenderer.sendMessage(
                            'reloadWindow',
                          );
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
                color="error"
              >
                {t('core:resetSettings')}
              </TsButton>
              {devMode && (
                <TsButton
                  data-tid="reloadAppTID"
                  color="error"
                  sx={{
                    marginLeft: AppConfig.defaultSpaceBetweenButtons,
                  }}
                  onClick={() => {
                    if (AppConfig.isElectron) {
                      window.electronIO.ipcRenderer.sendMessage('reloadWindow');
                    } else {
                      window.location.reload();
                    }
                  }}
                >
                  {t('core:reloadApplication')}
                </TsButton>
              )}
            </ListItem>
          ),
        },
      ].filter(Boolean),
    [
      t,
      settings,
      devMode,
      hideProFeatures,
      tileServers,
      workSpaces,
      wsAlive.current,
      maxCollectedTag,
      dispatch,
      openConfirmDialog,
    ],
  );

  // Filter settings by label and description
  const filteredSettings = useMemo(() => {
    if (!filterText.trim()) return settingsItems;
    const lowerFilter = filterText.toLowerCase();
    return settingsItems.filter((item) =>
      item.label.toLowerCase().includes(lowerFilter),
    );
  }, [filterText, settingsItems]);

  return (
    <>
      <Box sx={{ padding: '8px 16px 0 16px' }}>
        <TsTextField
          data-tid="settingsFilterText"
          fullWidth
          placeholder={t('core:searchSettings')}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          slotProps={{
            input: {
              endAdornment: filterText && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={t('core:clear')}
                    size="small"
                    onClick={() => setFilterText('')}
                    edge="end"
                  >
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <List
        sx={{
          overflowX: 'hidden',
          overflowY: 'auto',
          height: 'calc( 100% - 80px )',
        }}
      >
        {filteredSettings.map((item, i) => (
          <div key={'settings' + i}>{item.jsx}</div>
        ))}
        {displayColorPicker && (
          <ColorPickerDialog
            open={displayColorPicker}
            setColor={(color) => dispatch(SettingsActions.setTagColor(color))}
            onClose={() => setDisplayColorPicker(false)}
            color={settings.tagBackgroundColor}
          />
        )}
        {displayTextColorPicker && (
          <ColorPickerDialog
            open={displayTextColorPicker}
            setColor={(color) =>
              dispatch(SettingsActions.setTagTextColor(color))
            }
            onClose={() => setDisplayTextColorPicker(false)}
            color={settings.tagTextColor}
          />
        )}
        {displayFolderColorPicker && (
          <ColorPickerDialog
            open={displayFolderColorPicker}
            setColor={(color) =>
              dispatch(SettingsActions.setDefaultFolderColor(color))
            }
            onClose={() => setDisplayFolderColorPicker(false)}
            color={settings.defaultFolderColor}
          />
        )}
        {tileServerDialog && (
          <MapTileServerDialog
            open={tileServerDialog !== undefined}
            onClose={() => setTileServerDialog(undefined)}
            tileServer={tileServerDialog}
            isDefault={tileServerDialog.isDefault}
          />
        )}
      </List>
    </>
  );
}

export default SettingsGeneral;
