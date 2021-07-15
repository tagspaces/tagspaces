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

import React, { ChangeEvent, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import uuidv1 from 'uuid';
import { withStyles } from '@material-ui/core/styles';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Input from '@material-ui/core/Input';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import CheckIcon from '@material-ui/icons/Check';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import i18n from '-/services/i18n';
import { Pro } from '-/pro';
import ObjectStoreForm from './ObjectStoreForm';
import LocalForm from './LocalForm';
import useFirstRender from '-/utils/useFirstRender';
import AppConfig from '-/config';
import { TS } from '-/tagspaces.namespace';
import { locationType } from '-/utils/misc';
import { getLocationPath } from '-/utils/paths';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import InfoIcon from '-/components/InfoIcon';
import { ProLabel, BetaLabel, ProTooltip } from '-/components/HelperComponents';

const styles: any = theme => ({
  formControl: {
    marginLeft: theme.spacing(0),
    width: '100%'
  }
});

interface Props {
  location?: TS.Location;
  open: boolean;
  onClose: () => void;
  classes: any;
  fullScreen: boolean;
  addLocation?: (location: TS.Location) => void;
  editLocation?: (location: TS.Location) => void;
  isPersistTagsInSidecar: boolean;
}

const CreateEditLocationDialog = (props: Props) => {
  const IgnorePatternDialog =
    Pro && Pro.UI ? Pro.UI.IgnorePatternDialog : false;
  const { location } = props;
  const [showAdvancedMode, setShowAdvancedMode] = useState<boolean>(false);
  const [showSecretAccessKey, setShowSecretAccessKey] = useState<boolean>(
    false
  );
  const [errorTextPath, setErrorTextPath] = useState<boolean>(false);
  const [errorTextName, setErrorTextName] = useState<boolean>(false);
  const [name, setName] = useState<string>(
    location && location.name ? location.name : ''
  );
  let defaultIndexAge = AppConfig.maxIndexAge;
  if (location && location.maxIndexAge && location.maxIndexAge > 0) {
    const maxIndexAsString = location.maxIndexAge + '';
    defaultIndexAge = parseInt(maxIndexAsString, 10);
  }
  const [maxIndexAge, setMaxIndexAge] = useState<number>(defaultIndexAge);
  const [storeName, setStoreName] = useState<string>(
    location && location.name ? location.name : ''
  );
  const [path, setPath] = useState<string>(
    location && (location.path || location.paths)
      ? location.path || location.paths[0]
      : ''
  );
  const [storePath, setStorePath] = useState<string>(
    location && (location.path || location.paths)
      ? location.path || location.paths[0]
      : ''
  );
  const [endpointURL, setEndpointURL] = useState<string>(
    location ? location.endpointURL : ''
  );
  const [isDefault, setIsDefault] = useState<boolean>(
    location ? location.isDefault : false
  );
  const [isReadOnly, setIsReadOnly] = useState<boolean>(
    location ? location.isReadOnly : false
  );
  const [watchForChanges, setWatchForChanges] = useState<boolean>(
    location ? location.watchForChanges : false
  );
  const [persistIndex, setPersistIndex] = useState<boolean>(
    location ? location.persistIndex : false
  );
  const [fullTextIndex, setFullTextIndex] = useState<boolean>(
    location ? location.fullTextIndex : false
  );
  const [accessKeyId, setAccessKeyId] = useState<string>(
    location ? location.accessKeyId : ''
  );
  const [secretAccessKey, setSecretAccessKey] = useState<string>(
    location ? location.secretAccessKey : ''
  );
  const [sessionToken, setSessionToken] = useState<string>(
    location ? location.sessionToken : undefined
  );
  const [bucketName, setBucketName] = useState<string>(
    location ? location.bucketName : ''
  );
  const [persistTagsInSidecarFile, setPersistTagsInSidecarFile] = useState<
    boolean | null
  >(
    location && location.persistTagsInSidecarFile !== undefined
      ? location.persistTagsInSidecarFile
      : null // props.isPersistTagsInSidecar
  );
  const [region, setRegion] = useState<string>(location ? location.region : '');
  let defaultType;
  if (location) {
    defaultType = location.type;
  } else if (AppConfig.isWeb) {
    defaultType = locationType.TYPE_CLOUD;
  } else {
    defaultType = locationType.TYPE_LOCAL;
  }
  const [type, setType] = useState<string>(defaultType);
  const [newuuid, setNewUuid] = useState<string>(
    location ? location.uuid : uuidv1()
  );
  const [cloudErrorTextName, setCloudErrorTextName] = useState<boolean>(false);
  const [cloudErrorAccessKey, setCloudErrorAccessKey] = useState<boolean>(
    false
  );
  const [cloudErrorSecretAccessKey, setCloudErrorSecretAccessKey] = useState<
    boolean
  >(false);

  const [ignorePatternPaths, setIgnorePatternPaths] = useState<Array<string>>(
    location ? location.ignorePatternPaths : undefined
  );

  const [isIgnorePatternDialogOpen, setIgnorePatternDialogOpen] = useState<
    boolean
  >(false);

  const firstRender = useFirstRender();

  function changeMaxIndexAge(ageInMinutes) {
    if (ageInMinutes) {
      const age = parseInt(ageInMinutes, 10);
      setMaxIndexAge(age * 1000 * 60);
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

  /**
   * @param checkOnly - switch to set errors or only to check validation
   * return true - have errors; false - no errors
   */
  const validateObjectStore = (checkOnly: boolean = false): boolean => {
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
    return false;
  };

  /**
   * @param checkOnly - switch to set errors or only to check validation
   * return true - have errors; false - no errors
   */
  const validateLocal = (checkOnly: boolean = false): boolean => {
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

  const disableConfirmButton = () => {
    if (type === locationType.TYPE_LOCAL) {
      return errorTextName || errorTextPath || validateLocal(true);
    }
    return (
      cloudErrorTextName ||
      cloudErrorAccessKey ||
      cloudErrorSecretAccessKey ||
      validateObjectStore(true)
    );
  };

  const { fullScreen, open, onClose, classes } = props;

  const onConfirm = () => {
    if (!disableConfirmButton()) {
      let loc;
      if (type === locationType.TYPE_LOCAL) {
        loc = {
          uuid: props.location ? props.location.uuid : newuuid,
          type,
          name,
          path,
          paths: [path],
          isDefault,
          isReadOnly,
          persistIndex,
          fullTextIndex,
          watchForChanges,
          maxIndexAge,
          ignorePatternPaths
        };
      } else if (type === locationType.TYPE_CLOUD) {
        loc = {
          uuid: props.location ? props.location.uuid : newuuid,
          type,
          name: storeName,
          path: storePath,
          paths: [storePath],
          endpointURL,
          accessKeyId,
          secretAccessKey,
          sessionToken,
          bucketName,
          region,
          isDefault,
          isReadOnly,
          persistIndex,
          fullTextIndex,
          watchForChanges: false,
          maxIndexAge,
          ignorePatternPaths
        };
      }
      if (persistTagsInSidecarFile !== null) {
        // props.isPersistTagsInSidecar !== persistTagsInSidecarFile) {
        loc = { ...loc, persistTagsInSidecarFile };
      }

      if (props.addLocation) {
        props.addLocation(loc);
      } else if (props.editLocation) {
        loc.newuuid = newuuid;
        props.editLocation(loc);
      } else {
        console.error('No addLocation or editLocation props exist');
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
        errorTextId={false}
        showAdvancedMode={showAdvancedMode}
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
        newuuid={newuuid}
        setStoreName={setStoreName}
        setStorePath={setStorePath}
        setAccessKeyId={setAccessKeyId}
        setSecretAccessKey={setSecretAccessKey}
        setSessionToken={setSessionToken}
        setBucketName={setBucketName}
        setEndpointURL={setEndpointURL}
        setNewUuid={setNewUuid}
        setRegion={setRegion}
      />
    );
  } else {
    content = (
      <LocalForm
        showAdvancedMode={showAdvancedMode}
        errorTextPath={errorTextPath}
        errorTextName={errorTextName}
        errorTextId={false}
        setName={setName}
        setPath={setPath}
        setNewUuid={setNewUuid}
        path={path}
        name={name}
        newuuid={newuuid}
      />
    );
  }

  const currentTagsSetting =
    props.location && props.location.persistTagsInSidecarFile !== null
      ? location.persistTagsInSidecarFile
      : props.isPersistTagsInSidecar;

  const disableLocationTypeSwitch: boolean =
    !Pro || AppConfig.isWeb || props.location !== undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      scroll="paper"
      onKeyDown={event => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        }
        // } else if (event.key === 'Escape') {
        //   onClose();
        // }
      }}
    >
      <DialogTitle>
        {props.location
          ? i18n.t('core:editLocationTitle')
          : i18n.t('core:createLocationTitle')}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent
        style={{
          overflow: AppConfig.isFirefox ? 'auto' : 'overlay',
          minWidth: 500
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={2} style={{ marginTop: 10, textAlign: 'left' }}>
            <Typography>{i18n.t('core:locationType')}</Typography>
          </Grid>
          <Grid item xs={10}>
            <FormControl disabled={disableLocationTypeSwitch}>
              <RadioGroup
                aria-label={i18n.t('core:locationType')}
                name="type"
                value={type}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setType(event.target.value)
                }
                row
              >
                <FormControlLabel
                  data-tid="localLocation"
                  value={locationType.TYPE_LOCAL}
                  control={<Radio />}
                  label="Local"
                />
                <FormControlLabel
                  data-tid="objectStorageLocation"
                  value={locationType.TYPE_CLOUD}
                  control={<Radio />}
                  title={i18n.t('core:objectStorageTitle')}
                  label={
                    <>
                      {i18n.t('core:objectStorage')}
                      <ProLabel />
                    </>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        {content}
        <FormGroup style={{ marginTop: 10 }}>
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
            label={i18n.t('core:startupLocation')}
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
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setFullTextIndex(event.target.checked)
                }
              />
            }
            label={
              <>
                {i18n.t('core:createFullTextIndex')}
                {Pro ? <BetaLabel /> : <ProLabel />}
              </>
            }
          />
          <FormControlLabel
            className={classes.formControl}
            labelPlacement="start"
            style={{ justifyContent: 'space-between' }}
            control={
              <Switch
                disabled={!Pro || type === locationType.TYPE_CLOUD}
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
                {i18n.t('core:watchForChangesInLocation')}
                <ProLabel />
              </>
            }
          />
          {showAdvancedMode && (
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
                  {i18n.t('core:readonlyModeSwitch')}
                  <ProLabel />
                </>
              }
            />
          )}
          {showAdvancedMode && (
            <FormControlLabel
              className={classes.formControl}
              labelPlacement="start"
              style={{ justifyContent: 'space-between' }}
              control={
                <Switch
                  disabled={!Pro}
                  data-tid="changePersistIndex"
                  name="persistIndex"
                  checked={persistIndex}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setPersistIndex(event.target.checked)
                  }
                />
              }
              label={
                <>
                  {i18n.t('core:persistIndexSwitch')}
                  <ProLabel />
                </>
              }
            />
          )}
        </FormGroup>
        {showAdvancedMode && (
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
                  marginBottom: 15
                }}
                type="number"
                data-tid="maxIndexAgeTID"
                inputProps={{ min: 0 }}
                value={maxIndexAge / (1000 * 60)}
                onChange={event => changeMaxIndexAge(event.target.value)}
              />
            }
            label={
              <Typography>
                {i18n.t('core:maxIndexAge')}
                <InfoIcon tooltip={i18n.t('core:maxIndexAgeHelp')} />
              </Typography>
            }
          />
        )}
        {showAdvancedMode &&
          (AppConfig.useSidecarsForFileTaggingDisableSetting ? (
            <FormControlLabel
              className={classes.formControl}
              labelPlacement="start"
              style={{ justifyContent: 'space-between' }}
              control={
                <Button size="small" variant="outlined" disabled>
                  {currentTagsSetting ? 'Use Sidecar Files' : 'Rename Files'}
                </Button>
              }
              label={
                <Typography variant="caption" display="block" gutterBottom>
                  {i18n.t('core:fileTaggingSetting')}
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
                      arrow
                      title={
                        <Typography color="inherit">
                          Use the default settings for saving the tags:{' '}
                          <b>
                            {currentTagsSetting
                              ? 'Use Sidecar Files'
                              : 'Rename Files'}
                          </b>
                        </Typography>
                      }
                    >
                      <div style={{ display: 'flex' }}>
                        {persistTagsInSidecarFile === null && <CheckIcon />}
                        &nbsp;{i18n.t('core:default')}&nbsp;&nbsp;
                      </div>
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton
                    value={false}
                    data-tid="settingsSetPersistTagsInFileName"
                    onClick={() => setPersistTagsInSidecarFile(false)}
                  >
                    <Tooltip
                      arrow
                      title={
                        <Typography color="inherit">
                          Use the name of file for saving the tags - Tagging the
                          file <b>image.jpg</b> with a tag <b>sunset</b> will
                          rename it to <b>image[sunset].jpg</b>
                        </Typography>
                      }
                    >
                      <div style={{ display: 'flex' }}>
                        {persistTagsInSidecarFile !== null &&
                          !persistTagsInSidecarFile && <CheckIcon />}
                        &nbsp;Rename Files&nbsp;&nbsp;
                      </div>
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton
                    value={true}
                    data-tid="settingsSetPersistTagsInSidecarFile"
                    onClick={() => setPersistTagsInSidecarFile(true)}
                  >
                    <Tooltip
                      arrow
                      title={
                        <Typography color="inherit">
                          Use sidecar file for saving the tags - Tagging the
                          file <b>image.jpg</b> with a tag <b>sunset</b> will
                          save this tag in an additional sidecar file called{' '}
                          <b>image.jpg.json</b> located in a sub folder with the
                          name <b>.ts</b>
                        </Typography>
                      }
                    >
                      <div style={{ display: 'flex' }}>
                        {persistTagsInSidecarFile !== null &&
                          persistTagsInSidecarFile && <CheckIcon />}
                        &nbsp;Use Sidecar Files&nbsp;&nbsp;
                      </div>
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              }
              label={
                <Typography gutterBottom>
                  {i18n.t('core:fileTaggingSetting')}
                </Typography>
              }
            />
          ))}
        {showAdvancedMode && (
          <>
            <FormControlLabel
              className={classes.formControl}
              disabled={!Pro}
              labelPlacement="start"
              style={{ justifyContent: 'space-between' }}
              control={
                <ProTooltip tooltip={i18n.t('ignorePatternDialogTitle')}>
                  <Button
                    color="primary"
                    disabled={!Pro}
                    onClick={() => {
                      setIgnorePatternDialogOpen(true);
                    }}
                  >
                    {i18n.t('addEntryTags')}
                  </Button>
                </ProTooltip>
              }
              label={
                <Typography>
                  {i18n.t('core:ignorePatterns')}
                  <InfoIcon tooltip={i18n.t('core:ignorePatternsHelp')} />
                  <ProLabel />
                </Typography>
              }
            />
            <List
              style={{
                padding: 5,
                backgroundColor: '#d3d3d34a',
                borderRadius: 10
              }}
              dense
            >
              {ignorePatternPaths &&
                ignorePatternPaths.map(ignorePatternPath => (
                  <ListItem style={{ padding: 0 }}>
                    <ListItemText primary={ignorePatternPath} />
                    <ListItemIcon
                      style={{ minWidth: 0 }}
                      title={i18n.t('core:ignorePatternRemove')}
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
            {IgnorePatternDialog && isIgnorePatternDialogOpen && (
              <IgnorePatternDialog
                open={isIgnorePatternDialogOpen}
                onClose={() => setIgnorePatternDialogOpen(false)}
                ignorePatternPaths={ignorePatternPaths}
                setIgnorePatternPaths={setIgnorePatternPaths}
                locationPath={getLocationPath(location)}
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions style={{ justifyContent: 'space-between' }}>
        <Button
          data-tid="switchAdvancedModeTID"
          onClick={() => setShowAdvancedMode(!showAdvancedMode)}
          style={{ marginLeft: 10 }}
        >
          {showAdvancedMode
            ? i18n.t('core:switchSimpleMode')
            : i18n.t('core:switchAdvancedMode')}
        </Button>
        <div>
          <Button onClick={() => onClose()}>{i18n.t('core:cancel')}</Button>
          <Button
            disabled={disableConfirmButton()}
            onClick={onConfirm}
            data-tid="confirmLocationCreation"
            color="primary"
          >
            {i18n.t('core:ok')}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default withMobileDialog()(withStyles(styles)(CreateEditLocationDialog));
