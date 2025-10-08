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
import { ExpandIcon, IDIcon, RemoveIcon } from '-/components/CommonIcons';
import DraggablePaper from '-/components/DraggablePaper';
import { BetaLabel, ProLabel, ProTooltip } from '-/components/HelperComponents';
import InfoIcon from '-/components/InfoIcon';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsSelect from '-/components/TsSelect';
import TsTextField from '-/components/TsTextField';
import MaxLoopsSelect from '-/components/dialogs/MaxLoopsSelect';
import ObjectStoreForm from '-/components/dialogs/components/ObjectStoreForm';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import WebdavForm from '-/components/dialogs/components/WebdavForm';
import WorkSpacesDropdown from '-/components/dialogs/components/WorkSpacesDropdown';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useTagGroupsLocationContext } from '-/hooks/useTagGroupsLocationContext';
import { Pro } from '-/pro';
import { getPersistTagsInSidecarFile, isDevMode } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import useFirstRender from '-/utils/useFirstRender';
import CheckIcon from '@mui/icons-material/Check';
import PasswordIcon from '@mui/icons-material/Password';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormLabel,
  MenuItem,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import CryptoJS from 'crypto-js';
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import TsToggleButton from '../TsToggleButton';
import LocalForm from './components/LocalForm';

interface Props {
  open: boolean;
  onClose: () => void;
  //editLocation?: (location: CommonLocation) => void;
}

function CreateEditLocationDialog(props: Props) {
  const { t } = useTranslation();

  const { showNotification, openConfirmDialog } = useNotificationContext();
  const { createLocationIndex } = useLocationIndexContext();
  const { loadLocationDataPromise } = useTagGroupsLocationContext();
  const {
    addLocation,
    editLocation,
    selectedLocation,
    findLocation,
    locations,
  } = useCurrentLocationContext();
  const isPersistTagsInSidecar = useSelector(getPersistTagsInSidecarFile);
  //const locations: Array<CommonLocation> = useSelector(getLocations);
  const devMode: boolean = useSelector(isDevMode);
  const IgnorePatternDialog =
    Pro && Pro.UI ? Pro.UI.IgnorePatternDialog : false;
  /*const { location } = props;*/
  const [showSecretAccessKey, setShowSecretAccessKey] =
    useState<boolean>(false);
  const [showEncryptionKey, setShowEncryptionKey] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorTextPath, setErrorTextPath] = useState<boolean>(false);
  const [errorTextName, setErrorTextName] = useState<boolean>(false);
  const [name, setName] = useState<string>(
    selectedLocation && selectedLocation.name ? selectedLocation.name : '',
  );
  const [username, setUserName] = useState<string>(
    selectedLocation && selectedLocation.username
      ? selectedLocation.username
      : '',
  );
  const [password, setPassword] = useState<string>(
    selectedLocation && selectedLocation.password
      ? selectedLocation.password
      : '',
  );
  let defaultIndexAge = AppConfig.maxIndexAge;
  if (
    selectedLocation &&
    selectedLocation.maxIndexAge &&
    selectedLocation.maxIndexAge > 0
  ) {
    const maxIndexAsString = selectedLocation.maxIndexAge + '';
    defaultIndexAge = parseInt(maxIndexAsString, 10);
  }
  const [maxIndexAge, setMaxIndexAge] = useState<number>(defaultIndexAge);

  let defaultMaxLoops = AppConfig.maxLoops;
  if (
    selectedLocation &&
    selectedLocation.maxLoops &&
    selectedLocation.maxLoops > 0
  ) {
    const maxLoopsAsString = selectedLocation.maxLoops + '';
    defaultMaxLoops = parseInt(maxLoopsAsString, 10);
  }
  const [maxLoops, setMaxLoops] = useState<number>(defaultMaxLoops);
  const [storeName, setStoreName] = useState<string>(
    selectedLocation && selectedLocation.name ? selectedLocation.name : '',
  );
  const [path, setPath] = useState<string>(
    selectedLocation && (selectedLocation.path || selectedLocation.paths)
      ? selectedLocation.path || selectedLocation.paths[0]
      : '',
  );
  const [storePath, setStorePath] = useState<string>(
    selectedLocation && (selectedLocation.path || selectedLocation.paths)
      ? selectedLocation.path || selectedLocation.paths[0]
      : '',
  );
  const [endpointURL, setEndpointURL] = useState<string>(
    selectedLocation ? selectedLocation.endpointURL : '',
  );
  const [encryptionKey, setEncryptionKey] = useState<string>(
    selectedLocation && selectedLocation.encryptionKey
      ? selectedLocation.encryptionKey
      : undefined,
  );
  const [authType, setAuthType] = useState<string>('password');
  const [isDefault, setIsDefault] = useState<boolean>(
    selectedLocation ? selectedLocation.isDefault : false,
  );
  const [isReadOnly, setIsReadOnly] = useState<boolean>(
    selectedLocation ? selectedLocation.isReadOnly : false,
  );
  const [workSpaceId, setWorkSpaceId] = useState<string>(
    selectedLocation ? selectedLocation.workSpaceId || '' : '',
  );
  const [watchForChanges, setWatchForChanges] = useState<boolean>(
    selectedLocation ? selectedLocation.watchForChanges : false,
  );
  const [disableIndexing, setIndexDisable] = useState<boolean>(
    selectedLocation ? selectedLocation.disableIndexing : false,
  );
  const [reloadOnFocus, setReloadOnFocus] = useState<boolean>(
    selectedLocation ? selectedLocation.reloadOnFocus : false,
  );
  const [disableThumbnailGeneration, setDisableThumbnailGeneration] =
    useState<boolean>(
      selectedLocation ? selectedLocation.disableThumbnailGeneration : false,
    );
  const [fullTextIndex, setFullTextIndex] = useState<boolean>(
    selectedLocation ? selectedLocation.fullTextIndex : false,
  );
  const [extractLinks, setExtractLinks] = useState<boolean>(
    selectedLocation ? selectedLocation.extractLinks : false,
  );
  const [accessKeyId, setAccessKeyId] = useState<string>(
    selectedLocation ? selectedLocation.accessKeyId : '',
  );
  const [secretAccessKey, setSecretAccessKey] = useState<string>(
    selectedLocation ? selectedLocation.secretAccessKey : '',
  );
  const [sessionToken, setSessionToken] = useState<string>(
    selectedLocation ? selectedLocation.sessionToken : undefined,
  );
  const [bucketName, setBucketName] = useState<string>(
    selectedLocation ? selectedLocation.bucketName : '',
  );
  const [persistTagsInSidecarFile, setPersistTagsInSidecarFile] = useState<
    boolean | null
  >(
    selectedLocation && selectedLocation.persistTagsInSidecarFile !== undefined
      ? selectedLocation.persistTagsInSidecarFile
      : null, // props.isPersistTagsInSidecar
  );
  const [region, setRegion] = useState<string>(
    selectedLocation ? selectedLocation.region : '',
  );
  let defaultType;
  if (selectedLocation) {
    defaultType = selectedLocation.type;
  } else if (AppConfig.isWeb) {
    defaultType = locationType.TYPE_CLOUD;
  } else {
    defaultType = locationType.TYPE_LOCAL;
  }
  const [type, setType] = useState<string>(defaultType);
  const [newuuid, setNewUuid] = useState<string>(
    selectedLocation ? selectedLocation.uuid : getUuid(),
  );
  const [autoOpenedFilename, setAutoOpenedFilename] = useState<string>(
    selectedLocation ? selectedLocation.autoOpenedFilename : undefined,
  );
  const [cloudErrorTextName, setCloudErrorTextName] = useState<boolean>(false);
  const [webdavErrorUrl, setWebdavErrorUrl] = useState<boolean>(false);
  const [cloudErrorAccessKey, setCloudErrorAccessKey] =
    useState<boolean>(false);
  const [cloudErrorSecretAccessKey, setCloudErrorSecretAccessKey] =
    useState<boolean>(false);

  const [ignorePatternPaths, setIgnorePatternPaths] = useState<Array<string>>(
    selectedLocation ? selectedLocation.ignorePatternPaths : undefined,
  );

  const [isIgnorePatternDialogOpen, setIgnorePatternDialogOpen] =
    useState<boolean>(false);

  const firstRender = useFirstRender();

  function changeMaxIndexAge(ageInMinutes) {
    if (ageInMinutes) {
      const age = parseInt(ageInMinutes, 10);
      setMaxIndexAge(age * 1000 * 60);
    }
  }

  function changeMaxLoops(event: React.ChangeEvent<HTMLInputElement>) {
    const loops = event.target.value;
    if (loops) {
      setMaxLoops(parseInt(loops, 10));
    }
  }

  useEffect(() => {
    if (!firstRender) {
      validateObjectStore();
    }
  }, [storeName, accessKeyId, secretAccessKey]);

  useEffect(() => {
    if (!firstRender) {
      validateLocal();
    }
  }, [name, path]);

  function getMetaLocationId(
    location: CommonLocation,
  ): Promise<string | undefined> {
    return loadLocationDataPromise(location, AppConfig.metaFolderFile)
      .then((meta: TS.FileSystemEntryMeta) => {
        if (meta && meta.id) {
          const location = findLocation(meta.id);
          if (!location) {
            return meta.id;
          }
        }
        return undefined;
      })
      .catch((err) => {
        console.debug('no meta in location:' + location.path);
        return undefined;
      });
  }

  function setNewLocationID(newId: string) {
    const location = findLocation(newId);
    if (!location) {
      setNewUuid(newId);
    } else {
      showNotification('Location with this ID already exists', 'error');
    }
  }
  /**
   * @param checkOnly - switch to set errors or only to check validation
   * return true - have errors; false - no errors
   */
  const validateObjectStore = (checkOnly = false): boolean => {
    if (!storeName || storeName.length === 0) {
      if (checkOnly) return true;
      setCloudErrorTextName(true);
    } else if (!checkOnly) {
      setCloudErrorTextName(false);
    }

    if (!accessKeyId || accessKeyId.length === 0) {
      if (checkOnly) return true;
      setCloudErrorAccessKey(true);
    } else if (!checkOnly) {
      setCloudErrorAccessKey(false);
    }

    if (!secretAccessKey || secretAccessKey.length === 0) {
      if (checkOnly) return true;
      setCloudErrorSecretAccessKey(true);
    } else if (!checkOnly) {
      setCloudErrorSecretAccessKey(false);
    }

    if (encryptionKey && encryptionKey.length < 32) {
      if (checkOnly) return true;
      setCloudErrorSecretAccessKey(true);
    } else if (!checkOnly) {
      setCloudErrorSecretAccessKey(false);
    }
    return false;
  };

  /**
   * @param checkOnly - switch to set errors or only to check validation
   * return true - have errors; false - no errors
   */
  const validateLocal = (checkOnly = false): boolean => {
    if (!name || name.length === 0) {
      if (checkOnly) return true;
      setErrorTextName(true);
    } else if (!checkOnly) {
      setErrorTextName(false);
    }
    if (!path || path.length === 0) {
      if (checkOnly) return true;
      setErrorTextPath(true);
    } else if (!checkOnly) {
      setErrorTextPath(false);
    }
    return false;
  };

  const validateWebdav = (checkOnly = false): boolean => {
    if (!name || name.length === 0) {
      if (checkOnly) return true;
      setErrorTextName(true);
    } else if (!checkOnly) {
      setErrorTextName(false);
    }
    if (!endpointURL || endpointURL.length === 0) {
      if (checkOnly) return true;
      setWebdavErrorUrl(true);
    } else if (!checkOnly) {
      setWebdavErrorUrl(false);
    }
    return false;
  };

  const disableConfirmButton = () => {
    if (type === locationType.TYPE_LOCAL) {
      return errorTextName || errorTextPath || validateLocal(true);
    }
    if (type === locationType.TYPE_WEBDAV) {
      return errorTextName || validateWebdav(true);
    }
    return (
      cloudErrorTextName ||
      cloudErrorAccessKey ||
      cloudErrorSecretAccessKey ||
      validateObjectStore(true)
    );
  };

  const { open, onClose } = props;

  const preConfirm = () => {
    if (
      type === locationType.TYPE_CLOUD &&
      selectedLocation &&
      encryptionKey !== selectedLocation.encryptionKey
    ) {
      openConfirmDialog(
        t('core:confirm'),
        t('core:confirmEncryptionChanged'),
        (result) => {
          if (result) {
            onConfirm();
          }
        },
        'cancelConfirmEncryptionChanged',
        'confirmConfirmEncryptionChanged',
        'confirmConfirmEncryptionChangedContent',
      );
    } else {
      onConfirm();
    }
  };

  const onConfirm = () => {
    if (!disableConfirmButton()) {
      let loc;
      if (type === locationType.TYPE_LOCAL) {
        loc = {
          uuid: selectedLocation ? selectedLocation.uuid : newuuid,
          workSpaceId,
          type,
          name,
          path,
          paths: [path],
          isDefault,
          isReadOnly,
          disableIndexing,
          reloadOnFocus,
          disableThumbnailGeneration,
          fullTextIndex,
          extractLinks,
          watchForChanges,
          maxIndexAge,
          ignorePatternPaths,
          autoOpenedFilename,
        };
      } else if (type === locationType.TYPE_WEBDAV) {
        loc = {
          uuid: selectedLocation ? selectedLocation.uuid : newuuid,
          workSpaceId,
          type,
          authType,
          name,
          username,
          password,
          secretAccessKey,
          endpointURL,
          isDefault,
          isReadOnly,
          disableIndexing,
          reloadOnFocus,
          disableThumbnailGeneration,
          fullTextIndex,
          extractLinks,
          watchForChanges,
          maxIndexAge,
          ignorePatternPaths,
          autoOpenedFilename,
        };
      } else if (type === locationType.TYPE_CLOUD) {
        loc = {
          uuid: selectedLocation ? selectedLocation.uuid : newuuid,
          workSpaceId,
          type,
          name: storeName,
          path: storePath,
          paths: [storePath],
          endpointURL,
          encryptionKey,
          accessKeyId,
          secretAccessKey,
          sessionToken,
          bucketName,
          region,
          isDefault,
          isReadOnly,
          disableIndexing,
          reloadOnFocus,
          disableThumbnailGeneration,
          fullTextIndex,
          extractLinks,
          watchForChanges: false,
          maxIndexAge,
          maxLoops,
          ignorePatternPaths,
          autoOpenedFilename,
        };
      }
      if (persistTagsInSidecarFile !== null) {
        // props.isPersistTagsInSidecar !== persistTagsInSidecarFile) {
        loc = { ...loc, persistTagsInSidecarFile };
      }

      let editedLocation;
      if (!selectedLocation) {
        const editedLocation = new CommonLocation(loc);
        getMetaLocationId(editedLocation).then((uuid) => {
          if (uuid) {
            editedLocation.uuid = uuid;
          }
          addLocation(editedLocation);
        });
      } else {
        loc.newuuid = newuuid;
        editedLocation = new CommonLocation(loc);
        editLocation(editedLocation);
      }
      if (
        selectedLocation &&
        JSON.stringify(selectedLocation.ignorePatternPaths) !==
          JSON.stringify(loc.ignorePatternPaths)
      ) {
        createLocationIndex(editedLocation);
      }
      onClose();
      // this.props.resetState('createLocationDialogKey');
    }
  };

  let content;
  if (type === locationType.TYPE_CLOUD) {
    content = (
      <ObjectStoreForm
        cloudErrorTextName={cloudErrorTextName}
        cloudErrorTextPath={false}
        cloudErrorAccessKey={cloudErrorAccessKey}
        cloudErrorSecretAccessKey={cloudErrorSecretAccessKey}
        cloudErrorBucketName={false}
        cloudErrorRegion={false}
        showSecretAccessKey={showSecretAccessKey}
        storeName={storeName}
        storePath={storePath}
        accessKeyId={accessKeyId}
        secretAccessKey={secretAccessKey}
        sessionToken={sessionToken}
        setShowSecretAccessKey={setShowSecretAccessKey}
        bucketName={bucketName}
        region={region}
        endpointURL={endpointURL}
        setStoreName={setStoreName}
        setStorePath={setStorePath}
        setAccessKeyId={setAccessKeyId}
        setSecretAccessKey={setSecretAccessKey}
        setSessionToken={setSessionToken}
        setBucketName={setBucketName}
        setEndpointURL={setEndpointURL}
        setRegion={setRegion}
      />
    );
  } else if (type === locationType.TYPE_WEBDAV) {
    content = (
      <WebdavForm
        errorTextName={errorTextName}
        setName={setName}
        setUserName={setUserName}
        setPassword={setPassword}
        setEndpointURL={setEndpointURL}
        endpointURL={endpointURL}
        name={name}
        userName={username}
        password={password}
        setShowPassword={setShowPassword}
        showPassword={showPassword}
        webdavErrorUrl={webdavErrorUrl}
        authType={authType}
        setAuthType={setAuthType}
        secretAccessKey={secretAccessKey}
        setSecretAccessKey={setSecretAccessKey}
      />
    );
  } else {
    content = (
      <LocalForm
        errorTextPath={errorTextPath}
        errorTextName={errorTextName}
        setName={setName}
        setPath={setPath}
        path={path}
        name={name}
      />
    );
  }

  const currentTagsSetting =
    selectedLocation && selectedLocation.persistTagsInSidecarFile !== null
      ? selectedLocation.persistTagsInSidecarFile
      : isPersistTagsInSidecar;

  const disableLocationTypeSwitch: boolean = selectedLocation !== undefined;

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  let locationTypeName = t('core:localLocation');
  if (defaultType === locationType.TYPE_CLOUD) {
    locationTypeName = t('core:objectStorage');
  }

  const workSpacesContext = Pro?.contextProviders?.WorkSpacesContext
    ? useContext<TS.WorkSpacesContextData>(
        Pro.contextProviders.WorkSpacesContext,
      )
    : undefined;
  const workSpaces = workSpacesContext?.getWorkSpaces() ?? [];

  const okButton = (
    <TsButton
      disabled={disableConfirmButton()}
      onClick={preConfirm}
      data-tid="confirmLocationCreation"
      variant="contained"
      style={
        {
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties & { WebkitAppRegion?: string }
      }
    >
      {t('core:ok')}
    </TsButton>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      keepMounted
      scroll="paper"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      aria-labelledby="draggable-dialog-title"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          preConfirm();
        }
        // } else if (event.key === 'Escape') {
        //   onClose();
        // }
      }}
    >
      <TsDialogTitle
        dialogTitle={
          selectedLocation
            ? t('core:editLocationTitle')
            : t('core:createLocationTitle')
        }
        closeButtonTestId="closeCreateEditLocationTID"
        onClose={onClose}
        actionSlot={okButton}
      ></TsDialogTitle>
      <DialogContent
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 200,
          padding: 8,
        }}
      >
        {selectedLocation && (
          <>
            <Typography
              style={{ display: 'block', marginTop: -5, marginLeft: 15 }}
              variant="overline"
            >
              {t('core:locationType') + ': ' + locationTypeName}
            </Typography>
          </>
        )}
        <Accordion defaultExpanded>
          <AccordionDetails style={{ paddingTop: 16 }}>
            <FormGroup>
              {!selectedLocation && (
                <FormControl disabled={disableLocationTypeSwitch} fullWidth>
                  <TsSelect
                    data-tid="locationTypeTID"
                    value={type}
                    label={t('core:locationType')}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setType(event.target.value)
                    }
                  >
                    {!AppConfig.isWeb && (
                      <MenuItem
                        key="TYPE_LOCAL"
                        value={locationType.TYPE_LOCAL}
                        data-tid="localLocationTID"
                      >
                        {t('core:localLocation')}
                      </MenuItem>
                    )}
                    <MenuItem
                      key="TYPE_CLOUD"
                      value={locationType.TYPE_CLOUD}
                      data-tid="cloudLocationTID"
                    >
                      {t('core:objectStorage') +
                        ' (AWS S3, CloudFlare R2, Wasabi,...)'}
                    </MenuItem>
                    {/* {Pro && devMode && (
                      <MenuItem
                        key="TYPE_WEBDAV"
                        value={locationType.TYPE_WEBDAV}
                        data-tid="webdavLocationTID"
                      >
                        {t('core:webdavLocation') + ' (experimental)'}
                      </MenuItem>
                    )} */}
                  </TsSelect>
                </FormControl>
              )}
              {content}
              <WorkSpacesDropdown
                disabled={!Pro}
                dataTid="locationWorkspaceTID"
                workSpaceId={workSpaceId}
                setWorkSpaceId={setWorkSpaceId}
                workSpaces={workSpaces}
                label={
                  <>
                    {t('core:workspace')}
                    <ProLabel />
                  </>
                }
                onOpenNewWorkspace={() =>
                  workSpacesContext.openNewWorkspaceDialog()
                }
              />
              <FormControlLabel
                labelPlacement="start"
                style={{ justifyContent: 'space-between', marginLeft: 0 }}
                control={
                  <Switch
                    data-tid="locationIsDefault"
                    name="isDefault"
                    checked={isDefault}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setIsDefault(event.target.checked)
                    }
                  />
                }
                label={t('core:startupLocation')}
              />
              <FormControlLabel
                labelPlacement="start"
                style={{ justifyContent: 'space-between', marginLeft: 0 }}
                control={
                  <Switch
                    disabled={!Pro}
                    data-tid="changeFullTextIndex"
                    name="fullTextIndex"
                    checked={fullTextIndex}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setFullTextIndex(event.target.checked);
                      if (event.target.checked) {
                        if (selectedLocation) {
                          openConfirmDialog(
                            t('core:confirm'),
                            t('core:fullTextIndexRegenerate'),
                            (result) => {
                              if (result) {
                                createLocationIndex(selectedLocation);
                              }
                            },
                            'cancelReIndexDialogTID',
                            'confirmReIndexDialogTID',
                            'confirmDialogContentTID',
                          );
                        }
                      }
                    }}
                  />
                }
                label={
                  <>
                    {t('core:createFullTextIndex') + ' (TXT, HTML, MD, PDF)'}
                    {Pro ? <BetaLabel /> : <ProLabel />}
                  </>
                }
              />
              {fullTextIndex && (
                <FormControlLabel
                  labelPlacement="start"
                  style={{ justifyContent: 'space-between', marginLeft: 0 }}
                  control={
                    <Switch
                      disabled={!Pro}
                      data-tid="extractLinksTID"
                      name="extractLinks"
                      checked={extractLinks}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setExtractLinks(event.target.checked);
                      }}
                    />
                  }
                  label={
                    <>
                      {t('core:extractLinks')}
                      {Pro ? <BetaLabel /> : <ProLabel />}
                    </>
                  }
                />
              )}
              <FormControlLabel
                labelPlacement="start"
                style={{ justifyContent: 'space-between', marginLeft: 0 }}
                control={
                  <Switch
                    disabled={!Pro}
                    data-tid="reloadOnFocusTID"
                    name="reloadOnFocus"
                    checked={reloadOnFocus}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setReloadOnFocus(event.target.checked)
                    }
                  />
                }
                label={
                  <>
                    {t('core:reloadOnFocus')}
                    <InfoIcon
                      tooltip={t(
                        'Reloads the current folder, when the app regains focus in order to show changes which may have happened in the background.',
                      )}
                    />
                    <ProLabel />
                  </>
                }
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            data-tid="switchAdvancedModeTID"
            expandIcon={<ExpandIcon />}
            aria-controls="panelAdvanced-content"
            id="panelAdvanced-header"
          >
            <Typography>{t('core:switchAdvanced')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                labelPlacement="start"
                style={{ justifyContent: 'space-between', marginLeft: 0 }}
                control={
                  <Switch
                    disabled={!Pro}
                    data-tid="changeReadOnlyMode"
                    name="isReadOnly"
                    checked={isReadOnly}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setIsReadOnly(event.target.checked)
                    }
                  />
                }
                label={
                  <>
                    {t('core:readonlyModeSwitch')}
                    <ProLabel />
                  </>
                }
              />
              <FormControlLabel
                disabled={
                  !Pro ||
                  type === locationType.TYPE_CLOUD ||
                  AppConfig.isCordova
                }
                labelPlacement="start"
                style={{ justifyContent: 'space-between', marginLeft: 0 }}
                control={
                  <Switch
                    data-tid="changeWatchForChanges"
                    name="watchForChanges"
                    checked={watchForChanges}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setWatchForChanges(event.target.checked)
                    }
                  />
                }
                label={
                  <>
                    {t('core:watchForChangesInLocation')}
                    {!Pro && <ProLabel />}
                  </>
                }
              />
              <FormControlLabel
                labelPlacement="start"
                style={{ justifyContent: 'space-between', marginLeft: 0 }}
                control={
                  <Switch
                    data-tid="locationSettingsGenThumbsTID"
                    name="locationSettingsGenThumbs"
                    checked={disableThumbnailGeneration}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setDisableThumbnailGeneration(event.target.checked)
                    }
                  />
                }
                label={<>{t('core:disableThumbnailGeneration')}</>}
              />
              <FormControlLabel
                labelPlacement="start"
                style={{ justifyContent: 'space-between', marginLeft: 0 }}
                control={
                  <Switch
                    disabled={!Pro}
                    data-tid="disableIndexingTID"
                    name="disableIndexing"
                    checked={disableIndexing}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setIndexDisable(event.target.checked)
                    }
                  />
                }
                label={
                  <>
                    {t('core:disableIndexing')}
                    <ProLabel />
                  </>
                }
              />
              <FormControlLabel
                labelPlacement="start"
                style={{ justifyContent: 'space-between', marginLeft: 0 }}
                control={
                  <TsTextField
                    name="maxIndexAge"
                    style={{
                      width: 100,
                    }}
                    type="number"
                    data-tid="maxIndexAgeTID"
                    slotProps={{
                      input: { inputMode: 'numeric', min: 0 },
                    }}
                    value={maxIndexAge / (1000 * 60)}
                    onChange={(event) => changeMaxIndexAge(event.target.value)}
                  />
                }
                label={
                  <Typography>
                    {t('core:maxIndexAge')}
                    <InfoIcon tooltip={t('core:maxIndexAgeHelp')} />
                  </Typography>
                }
              />
              {type === locationType.TYPE_CLOUD && (
                <FormControlLabel
                  labelPlacement="start"
                  style={{ justifyContent: 'space-between', marginLeft: 0 }}
                  control={
                    <MaxLoopsSelect
                      maxLoops={maxLoops}
                      changeMaxLoops={changeMaxLoops}
                    />
                  }
                  label={
                    <Typography>
                      {t('core:maxLoops')}
                      <InfoIcon tooltip={t('core:maxLoopsHelp')} />
                    </Typography>
                  }
                />
              )}
              {AppConfig.useSidecarsForFileTaggingDisableSetting ? (
                <FormControlLabel
                  labelPlacement="start"
                  style={{ justifyContent: 'space-between', marginLeft: 0 }}
                  control={
                    <TsButton disabled>
                      {currentTagsSetting
                        ? t('core:useSidecarFile')
                        : t('core:renameFile')}
                    </TsButton>
                  }
                  label={t('core:fileTaggingSetting')}
                />
              ) : (
                <FormControlLabel
                  labelPlacement="top"
                  style={{
                    alignItems: 'start',
                    marginBottom: 10,
                    marginLeft: 0,
                  }}
                  control={
                    <ToggleButtonGroup
                      value={persistTagsInSidecarFile}
                      size="small"
                      exclusive
                    >
                      <TsToggleButton
                        value={
                          persistTagsInSidecarFile !== null
                            ? persistTagsInSidecarFile
                            : false
                        }
                        style={{
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                        }}
                        tooltip={
                          t('core:useDefaultTaggingType') +
                          ': ' +
                          (currentTagsSetting
                            ? t('core:useSidecarFile')
                            : t('core:renameFile'))
                        }
                        data-tid="settingsSetPersistTagsDefault"
                        onClick={() => setPersistTagsInSidecarFile(null)}
                      >
                        <div style={{ display: 'flex' }}>
                          {persistTagsInSidecarFile === null && <CheckIcon />}
                          &nbsp;{t('core:defaultSetting')}&nbsp;&nbsp;
                        </div>
                      </TsToggleButton>
                      <TsToggleButton
                        value={false}
                        style={{
                          borderRadius: 0,
                        }}
                        data-tid="locationSetPersistTagsInFileName"
                        tooltip={t('core:tagsInFilenameExplanation')}
                        onClick={() => setPersistTagsInSidecarFile(false)}
                      >
                        <div style={{ display: 'flex' }}>
                          {persistTagsInSidecarFile !== null &&
                            !persistTagsInSidecarFile && <CheckIcon />}
                          &nbsp;{t('core:renameFile')}&nbsp;&nbsp;
                        </div>
                      </TsToggleButton>
                      <TsToggleButton
                        value={true}
                        style={{
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                        }}
                        data-tid="locationSetPersistTagsInSidecarFile"
                        tooltip={t('core:tagsInSidecarFileExplanation')}
                        onClick={() => setPersistTagsInSidecarFile(true)}
                      >
                        <div style={{ display: 'flex' }}>
                          {persistTagsInSidecarFile !== null &&
                            persistTagsInSidecarFile && <CheckIcon />}
                          &nbsp;{t('core:useSidecarFile')}&nbsp;&nbsp;
                        </div>
                      </TsToggleButton>
                    </ToggleButtonGroup>
                  }
                  label={
                    <Typography gutterBottom>
                      {t('core:fileTaggingSetting')}
                    </Typography>
                  }
                />
              )}
              <>
                <FormControlLabel
                  disabled={!Pro}
                  labelPlacement="start"
                  style={{
                    justifyContent: 'space-between',
                    marginTop: 15,
                    marginLeft: 0,
                    marginRight: 0,
                  }}
                  control={
                    <ProTooltip tooltip={t('ignorePatternDialogTitle')}>
                      <TsButton
                        disabled={!Pro}
                        onClick={() => {
                          setIgnorePatternDialogOpen(true);
                        }}
                        style={{
                          marginBottom: AppConfig.defaultSpaceBetweenButtons,
                        }}
                      >
                        {t('addEntryTags')}
                      </TsButton>
                    </ProTooltip>
                  }
                  label={
                    <Typography>
                      {t('core:ignorePatterns')}
                      <InfoIcon tooltip={t('core:ignorePatternsHelp')} />
                      <ProLabel />
                    </Typography>
                  }
                />
                {ignorePatternPaths && ignorePatternPaths.length > 0 && (
                  <List
                    style={{
                      padding: 5,
                      backgroundColor: '#d3d3d34a',
                      borderRadius: 10,
                    }}
                    dense
                  >
                    {ignorePatternPaths.map((ignorePatternPath) => (
                      <ListItem style={{ padding: 0 }}>
                        <ListItemText primary={ignorePatternPath} />
                        <ListItemIcon
                          style={{ minWidth: 0 }}
                          title={t('core:ignorePatternRemove')}
                          onClick={() => {
                            const array = [...ignorePatternPaths];
                            const index = array.indexOf(ignorePatternPath);
                            if (index !== -1) {
                              array.splice(index, 1);
                              setIgnorePatternPaths(array);
                            }
                          }}
                        >
                          <RemoveIcon />
                        </ListItemIcon>
                      </ListItem>
                    ))}
                  </List>
                )}
                {IgnorePatternDialog && (
                  <IgnorePatternDialog
                    open={isIgnorePatternDialogOpen}
                    onClose={() => setIgnorePatternDialogOpen(false)}
                    ignorePatternPaths={ignorePatternPaths}
                    setIgnorePatternPaths={setIgnorePatternPaths}
                    location={selectedLocation}
                  />
                )}
              </>
              <FormControl fullWidth={true} style={{ marginTop: 10 }}>
                <TsTextField
                  name="autoOpenedFilename"
                  data-tid="autoOpenedFilenameTID"
                  placeholder={
                    t('core:forExample') + ': index.md, index.html or readme.md'
                  }
                  onChange={(event) =>
                    setAutoOpenedFilename(event.target.value)
                  }
                  updateValue={(value) => {
                    setAutoOpenedFilename(value);
                  }}
                  retrieveValue={() => autoOpenedFilename}
                  value={autoOpenedFilename}
                  label={t('core:autoOpenedFilename')}
                />
              </FormControl>
              <FormControl fullWidth={true} style={{ marginTop: 10 }}>
                <TsTextField
                  required
                  name="newuuid"
                  data-tid="newuuid"
                  placeholder="Unique location identifier"
                  onChange={(event) => setNewLocationID(event.target.value)}
                  value={newuuid}
                  label={t('core:locationId')}
                  updateValue={(value) => {
                    setNewLocationID(value);
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end" style={{ height: 32 }}>
                          <TsIconButton
                            tooltip={t('core:generateNewLocationId')}
                            onClick={() => {
                              const result = confirm(
                                'Changing the identifier of a location, will invalidate all the internal sharing links (tslinks) leading to files and folders in this location. Do you want to continue?',
                              );
                              if (result) {
                                setNewLocationID(getUuid());
                              }
                            }}
                          >
                            <IDIcon />
                          </TsIconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </FormControl>
            </FormGroup>
          </AccordionDetails>
        </Accordion>
        {devMode && type === locationType.TYPE_CLOUD && (
          <Accordion>
            <AccordionSummary
              data-tid="switchEncryptionTID"
              expandIcon={<ExpandIcon />}
              aria-controls="panelEncryption-content"
              id="panelEncryption-header"
            >
              <Typography>
                {t('core:switchEncryption')}
                <BetaLabel />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl fullWidth={true}>
                <FormLabel style={{ marginBottom: 15 }}>
                  {t('encryptionExplanation')}
                </FormLabel>
                <TsTextField
                  name="encryptionKey"
                  type={showEncryptionKey ? 'text' : 'password'}
                  data-tid="encryptionKeyTID"
                  placeholder={t('encryptionKeyExplanation')}
                  onChange={(event) => setEncryptionKey(event.target.value)}
                  value={encryptionKey}
                  updateValue={(value) => {
                    setEncryptionKey(value);
                  }}
                  retrieveValue={() => encryptionKey}
                  label={t('core:encryptionKey')}
                  slotProps={{
                    input: {
                      autoCorrect: 'off',
                      autoCapitalize: 'none',
                      endAdornment: (
                        <InputAdornment position="end">
                          <TsIconButton
                            tooltip={t('toggleKeyVisibility')}
                            aria-label="toggle key visibility"
                            onClick={() =>
                              setShowEncryptionKey(!showEncryptionKey)
                            }
                          >
                            {showEncryptionKey ? (
                              <Visibility />
                            ) : (
                              <VisibilityOff />
                            )}
                          </TsIconButton>
                          <TsIconButton
                            tooltip={t('generateEncryptionKey')}
                            aria-label="generate encryption key"
                            onClick={() =>
                              setEncryptionKey(
                                CryptoJS.lib.WordArray.random(32)
                                  .toString(CryptoJS.enc.Hex)
                                  .slice(0, 32),
                              )
                            }
                          >
                            <PasswordIcon />
                          </TsIconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </FormControl>
            </AccordionDetails>
          </Accordion>
        )}
      </DialogContent>
      {!smallScreen && (
        <TsDialogActions>
          <TsButton onClick={() => onClose()}>{t('core:cancel')}</TsButton>
          {okButton}
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default CreateEditLocationDialog;
