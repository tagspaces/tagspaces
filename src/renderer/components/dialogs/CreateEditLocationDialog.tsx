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

import React, { ChangeEvent, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import CryptoJS from 'crypto-js';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Switch from '@mui/material/Switch';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import Tooltip from '-/components/Tooltip';
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TsTextField from '-/components/TsTextField';
import Input from '@mui/material/Input';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import CheckIcon from '@mui/icons-material/Check';
import RemoveIcon from '@mui/icons-material/RemoveCircleOutline';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { useSelector } from 'react-redux';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  InputLabel,
  MenuItem,
  FormLabel,
  Select,
} from '@mui/material';
import { Pro } from '-/pro';
import DraggablePaper from '-/components/DraggablePaper';
import ObjectStoreForm from './ObjectStoreForm';
import LocalForm from './LocalForm';
import useFirstRender from '-/utils/useFirstRender';
import { TS } from '-/tagspaces.namespace';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import InfoIcon from '-/components/InfoIcon';
import { ProLabel, BetaLabel, ProTooltip } from '-/components/HelperComponents';
import { getPersistTagsInSidecarFile, isDevMode } from '-/reducers/settings';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import WebdavForm from '-/components/dialogs/WebdavForm';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { ExpandIcon, IDIcon } from '-/components/CommonIcons';
import MaxLoopsSelect from '-/components/dialogs/MaxLoopsSelect';
import { useTranslation } from 'react-i18next';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useTagGroupsLocationContext } from '-/hooks/useTagGroupsLocationContext';
import { CommonLocation } from '-/utils/CommonLocation';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PasswordIcon from '@mui/icons-material/Password';
import TooltipTS from '-/components/Tooltip';

const PREFIX = 'CreateEditLocationDialog';

const classes = {
  formControl: `${PREFIX}-formControl`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.formControl}`]: {
    marginLeft: theme.spacing(0),
    width: '100%',
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  //editLocation?: (location: CommonLocation) => void;
}

function CreateEditLocationDialog(props: Props) {
  const { t } = useTranslation();

  const { showNotification } = useNotificationContext();
  const { createLocationIndex } = useLocationIndexContext();
  const { loadLocationDataPromise } = useTagGroupsLocationContext();
  const { addLocation, editLocation, selectedLocation, findLocation } =
    useCurrentLocationContext();
  const isPersistTagsInSidecar = useSelector(getPersistTagsInSidecarFile);
  //const locations: Array<CommonLocation> = useSelector(getLocations);
  const devMode: boolean = useSelector(isDevMode);
  const IgnorePatternDialog =
    Pro && Pro.UI ? Pro.UI.IgnorePatternDialog : false;
  /*const { location } = props;*/
  const [showSecretAccessKey, setShowSecretAccessKey] =
    useState<boolean>(false);
  const [showEncryptionKey, setShowEncryptionKey] = useState<boolean>(false);
  const [isConfirmEncryptionChanged, setConfirmEncryptionChanged] =
    useState<boolean>(false);
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
  const [watchForChanges, setWatchForChanges] = useState<boolean>(
    selectedLocation ? selectedLocation.watchForChanges : false,
  );
  const [disableIndexing, setIndexDisable] = useState<boolean>(
    selectedLocation ? selectedLocation.disableIndexing : false,
  );
  const [disableThumbnailGeneration, setDisableThumbnailGeneration] =
    useState<boolean>(
      selectedLocation ? selectedLocation.disableThumbnailGeneration : false,
    );
  const [fullTextIndex, setFullTextIndex] = useState<boolean>(
    selectedLocation ? selectedLocation.fullTextIndex : false,
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

  const [
    isFullTextIndexConfirmDialogOpened,
    setFullTextIndexConfirmDialogOpened,
  ] = useState<boolean>(false);

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
      setConfirmEncryptionChanged(true);
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
          type,
          name,
          path,
          paths: [path],
          isDefault,
          isReadOnly,
          disableIndexing,
          disableThumbnailGeneration,
          fullTextIndex,
          watchForChanges,
          maxIndexAge,
          ignorePatternPaths,
          autoOpenedFilename,
        };
      } else if (type === locationType.TYPE_WEBDAV) {
        loc = {
          uuid: selectedLocation ? selectedLocation.uuid : newuuid,
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
          disableThumbnailGeneration,
          fullTextIndex,
          watchForChanges,
          maxIndexAge,
          ignorePatternPaths,
          autoOpenedFilename,
        };
      } else if (type === locationType.TYPE_CLOUD) {
        loc = {
          uuid: selectedLocation ? selectedLocation.uuid : newuuid,
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
          disableThumbnailGeneration,
          fullTextIndex,
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

      if (!selectedLocation) {
        const commonLocation = new CommonLocation(loc);
        getMetaLocationId(commonLocation).then((uuid) => {
          if (uuid) {
            commonLocation.uuid = uuid;
          }
          addLocation(commonLocation);
        });
      } else {
        loc.newuuid = newuuid;
        editLocation(new CommonLocation(loc));
      } /*else {
        console.log('No addLocation or editLocation props exist');
      }*/
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
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  let locationTypeName = t('core:localLocation');
  if (defaultType === locationType.TYPE_CLOUD) {
    locationTypeName = t('core:objectStorage');
  }

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      scroll="paper"
      PaperComponent={fullScreen ? Paper : DraggablePaper}
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
      <DialogTitle
        style={{ cursor: 'move', paddingBottom: 0 }}
        id="draggable-dialog-title"
      >
        {selectedLocation ? (
          <>
            {t('core:editLocationTitle')}
            <Typography
              style={{ display: 'block', marginTop: -5 }}
              variant="overline"
            >
              {t('core:locationType') + ': ' + locationTypeName}
            </Typography>
          </>
        ) : (
          t('core:createLocationTitle')
        )}
        <DialogCloseButton
          testId="closeCreateEditLocationTID"
          onClose={onClose}
        />
      </DialogTitle>
      <DialogContent
        style={{
          overflow: 'auto',
          minHeight: 200,
          padding: 8,
        }}
      >
        <ConfirmDialog
          open={isConfirmEncryptionChanged}
          onClose={() => {
            setConfirmEncryptionChanged(false);
          }}
          title={t('core:confirm')}
          content={t('core:confirmEncryptionChanged')}
          confirmCallback={(result) => {
            if (result) {
              onConfirm();
            } else {
              setConfirmEncryptionChanged(false);
            }
          }}
          cancelDialogTID="cancelConfirmEncryptionChanged"
          confirmDialogTID="confirmConfirmEncryptionChanged"
          confirmDialogContentTID="confirmConfirmEncryptionChangedContent"
        />
        <Accordion defaultExpanded>
          <AccordionDetails style={{ paddingTop: 16 }}>
            <FormGroup>
              {!selectedLocation && (
                <FormControl disabled={disableLocationTypeSwitch} fullWidth>
                  {/* <InputLabel id="locationLabelID">
                  {t('core:locationType')}
                </InputLabel> */}
                  <Select
                    labelId="locationLabelID"
                    data-tid="locationTypeTID"
                    value={type}
                    label={t('core:locationType')}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setType(event.target.value)
                    }
                    variant="filled"
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
                      {t('core:objectStorage') + ' (AWS, MinIO, Wasabi,...)'}
                    </MenuItem>
                    {Pro && devMode && (
                      <MenuItem
                        key="TYPE_WEBDAV"
                        value={locationType.TYPE_WEBDAV}
                        data-tid="webdavLocationTID"
                      >
                        {t('core:webdavLocation') + ' (experimental)'}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}
              {content}
              <FormControlLabel
                className={classes.formControl}
                labelPlacement="start"
                style={{ justifyContent: 'space-between' }}
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
                className={classes.formControl}
                labelPlacement="start"
                style={{ justifyContent: 'space-between' }}
                control={
                  <Switch
                    disabled={!Pro}
                    data-tid="changeFullTextIndex"
                    name="fullTextIndex"
                    checked={fullTextIndex}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setFullTextIndex(event.target.checked);
                      if (event.target.checked) {
                        setFullTextIndexConfirmDialogOpened(true);
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
              {isFullTextIndexConfirmDialogOpened && selectedLocation && (
                <ConfirmDialog
                  open={isFullTextIndexConfirmDialogOpened}
                  onClose={() => {
                    setFullTextIndexConfirmDialogOpened(false);
                  }}
                  title={t('core:confirm')}
                  content={t('core:fullTextIndexRegenerate')}
                  confirmCallback={(result) => {
                    if (result) {
                      createLocationIndex(selectedLocation);
                    } else {
                      setFullTextIndexConfirmDialogOpened(false);
                    }
                  }}
                  cancelDialogTID="cancelSaveBeforeCloseDialog"
                  confirmDialogTID="confirmSaveBeforeCloseDialog"
                  confirmDialogContentTID="confirmDialogContent"
                />
              )}
              <FormControlLabel
                disabled={
                  !Pro ||
                  type === locationType.TYPE_CLOUD ||
                  AppConfig.isCordova
                }
                className={classes.formControl}
                labelPlacement="start"
                style={{ justifyContent: 'space-between' }}
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
            <FormGroup style={{ width: '100%' }}>
              <FormControlLabel
                className={classes.formControl}
                labelPlacement="start"
                style={{ justifyContent: 'space-between' }}
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
                className={classes.formControl}
                labelPlacement="start"
                style={{ justifyContent: 'space-between' }}
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
                className={classes.formControl}
                labelPlacement="start"
                style={{ justifyContent: 'space-between' }}
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
                className={classes.formControl}
                labelPlacement="start"
                style={{ justifyContent: 'space-between' }}
                control={
                  <Input
                    name="maxIndexAge"
                    style={{
                      maxWidth: 70,
                      marginLeft: 15,
                      marginBottom: 15,
                    }}
                    type="number"
                    data-tid="maxIndexAgeTID"
                    inputProps={{ min: 0 }}
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
                  className={classes.formControl}
                  labelPlacement="start"
                  style={{ justifyContent: 'space-between' }}
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
                  className={classes.formControl}
                  labelPlacement="start"
                  style={{ justifyContent: 'space-between' }}
                  control={
                    <Button size="small" variant="outlined" disabled>
                      {currentTagsSetting
                        ? t('core:useSidecarFile')
                        : t('core:renameFile')}
                    </Button>
                  }
                  label={
                    <Typography variant="caption" display="block" gutterBottom>
                      {t('core:fileTaggingSetting')}
                    </Typography>
                  }
                />
              ) : (
                <FormControlLabel
                  labelPlacement="top"
                  className={classes.formControl}
                  style={{ alignItems: 'start', marginBottom: 10 }}
                  control={
                    <ToggleButtonGroup
                      value={persistTagsInSidecarFile}
                      size="small"
                      exclusive
                    >
                      <ToggleButton
                        value={null}
                        data-tid="settingsSetPersistTagsDefault"
                        onClick={() => setPersistTagsInSidecarFile(null)}
                      >
                        <Tooltip
                          title={
                            <Typography color="inherit">
                              {t('core:useDefaultTaggingType')}:{' '}
                              <b>
                                {currentTagsSetting
                                  ? t('core:useSidecarFile')
                                  : t('core:renameFile')}
                              </b>
                            </Typography>
                          }
                        >
                          <div style={{ display: 'flex' }}>
                            {persistTagsInSidecarFile === null && <CheckIcon />}
                            &nbsp;{t('core:defaultSetting')}&nbsp;&nbsp;
                          </div>
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton
                        value={false}
                        data-tid="locationSetPersistTagsInFileName"
                        onClick={() => setPersistTagsInSidecarFile(false)}
                      >
                        <Tooltip
                          title={
                            <Typography color="inherit">
                              {t('core:tagsInFilenameExplanation')}
                            </Typography>
                          }
                        >
                          <div style={{ display: 'flex' }}>
                            {persistTagsInSidecarFile !== null &&
                              !persistTagsInSidecarFile && <CheckIcon />}
                            &nbsp;{t('core:renameFile')}&nbsp;&nbsp;
                          </div>
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton
                        value={true}
                        data-tid="locationSetPersistTagsInSidecarFile"
                        onClick={() => setPersistTagsInSidecarFile(true)}
                      >
                        <Tooltip
                          title={
                            <Typography color="inherit">
                              {t('core:tagsInSidecarFileExplanation')}
                            </Typography>
                          }
                        >
                          <div style={{ display: 'flex' }}>
                            {persistTagsInSidecarFile !== null &&
                              persistTagsInSidecarFile && <CheckIcon />}
                            &nbsp;{t('core:useSidecarFile')}&nbsp;&nbsp;
                          </div>
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  }
                  label={
                    <Typography gutterBottom>
                      {t('core:fileTaggingSetting')}
                    </Typography>
                  }
                />
              )}
              <FormControl fullWidth={true}>
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
              <>
                <FormControlLabel
                  className={classes.formControl}
                  disabled={!Pro}
                  labelPlacement="start"
                  style={{ justifyContent: 'space-between' }}
                  control={
                    <ProTooltip tooltip={t('ignorePatternDialogTitle')}>
                      <Button
                        color="primary"
                        disabled={!Pro}
                        onClick={() => {
                          setIgnorePatternDialogOpen(true);
                        }}
                      >
                        {t('addEntryTags')}
                      </Button>
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end" style={{ height: 32 }}>
                        <Tooltip title="Generates new unique identifier for this location">
                          <IconButton
                            onClick={() => {
                              const result = confirm(
                                'Changing the identifier of a location, will invalidate all the internal sharing links (tslinks) leading to files and folders in this location. Do you want to continue?',
                              );
                              if (result) {
                                setNewLocationID(getUuid());
                              }
                            }}
                            size="large"
                          >
                            <IDIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </FormGroup>
          </AccordionDetails>
        </Accordion>
        {type === locationType.TYPE_CLOUD && (
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
                <FormLabel>{t('encryptionExplanation')}</FormLabel>
                <TsTextField
                  name="encryptionKey"
                  type={showEncryptionKey ? 'text' : 'password'}
                  inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
                  data-tid="encryptionKeyTID"
                  placeholder={t('encryptionKeyExplanation')}
                  onChange={(event) => setEncryptionKey(event.target.value)}
                  value={encryptionKey}
                  updateValue={(value) => {
                    setEncryptionKey(value);
                  }}
                  retrieveValue={() => encryptionKey}
                  label={t('core:encryptionKey')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <TooltipTS title={t('toggleKeyVisibility')}>
                          <IconButton
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
                          </IconButton>
                        </TooltipTS>
                        <TooltipTS title={t('generateEncryptionKey')}>
                          <IconButton
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
                          </IconButton>
                        </TooltipTS>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </AccordionDetails>
          </Accordion>
        )}
      </DialogContent>
      <DialogActions
        style={fullScreen ? { padding: '10px 30px 30px 30px' } : {}}
      >
        <Button onClick={() => onClose()}>{t('core:cancel')}</Button>
        <Button
          disabled={disableConfirmButton()}
          onClick={preConfirm}
          data-tid="confirmLocationCreation"
          color="primary"
          variant="contained"
        >
          {t('core:ok')}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}

export default CreateEditLocationDialog;
