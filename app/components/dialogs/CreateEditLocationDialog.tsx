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
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import i18n from '-/services/i18n';
import { Location, locationType } from '-/reducers/locations';
import { Pro } from '-/pro';
import ObjectStoreForm from './ObjectStoreForm';
import LocalForm from './LocalForm';
import useFirstRender from '-/utils/useFirstRender';

const styles: any = theme => ({
  root: {
    display: 'flex'
  },
  formControl: {
    margin: theme.spacing(3)
  },
  group: {
    margin: theme.spacing(1, 0),
    display: 'flex',
    flexDirection: 'row'
  }
});

interface Props {
  location?: Location;
  open: boolean;
  onClose: () => void;
  fullScreen: boolean;
  addLocation?: (location: Location) => void;
  editLocation?: (location: Location) => void;
  showSelectDirectoryDialog: () => void;
}

const CreateEditLocationDialog = (props: Props) => {
  const [showAdvancedMode, setShowAdvancedMode] = useState<boolean>(false);
  const [showSecretAccessKey, setShowSecretAccessKey] = useState<boolean>(
    false
  );
  const [errorTextPath, setErrorTextPath] = useState<boolean>(false);
  const [errorTextName, setErrorTextName] = useState<boolean>(false);
  // const [errorTextId, setErrorTextId] = useState<boolean>(false);
  const [name, setName] = useState<string>(
    props.location && props.location.type === locationType.TYPE_LOCAL
      ? props.location.name
      : ''
  );
  const [path, setPath] = useState<string>(
    props.location && props.location.type === locationType.TYPE_LOCAL
      ? props.location.path
      : ''
  );
  const [endpointURL, setEndpointURL] = useState<string>(
    props.location ? props.location.endpointURL : ''
  );
  const [isDefault, setIsDefault] = useState<boolean>(
    props.location ? props.location.isDefault : false
  );
  const [isReadOnly, setIsReadOnly] = useState<boolean>(
    props.location ? props.location.isReadOnly : false
  );
  const [watchForChanges, setWatchForChanges] = useState<boolean>(
    props.location ? props.location.watchForChanges : false
  );
  const [persistIndex, setPersistIndex] = useState<boolean>(
    props.location ? props.location.persistIndex : false
  );
  const [fullTextIndex, setFullTextIndex] = useState<boolean>(
    props.location ? props.location.fullTextIndex : false
  );
  const [storeName, setStoreName] = useState<string>(
    props.location && props.location.type === locationType.TYPE_CLOUD
      ? props.location.name
      : ''
  );
  const [cloudErrorTextName, setCloudErrorTextName] = useState<boolean>(false);
  // const [cloudErrorTextPath, setCloudErrorTextPath] = useState<boolean>(false);
  const [cloudErrorAccessKey, setCloudErrorAccessKey] = useState<boolean>(
    false
  );
  const [cloudErrorSecretAccessKey, setCloudErrorSecretAccessKey] = useState<
    boolean
  >(false);
  // const [cloudErrorBucketName, setCloudErrorBucketName] = useState<boolean>(false);
  // const [cloudErrorRegion, setCloudErrorRegion] = useState<boolean>(false);
  const [accessKeyId, setAccessKeyId] = useState<string>(
    props.location ? props.location.accessKeyId : ''
  );
  const [secretAccessKey, setSecretAccessKey] = useState<string>(
    props.location ? props.location.secretAccessKey : ''
  );
  const [bucketName, setBucketName] = useState<string>(
    props.location ? props.location.bucketName : ''
  );
  const [region, setRegion] = useState<string>(
    props.location ? props.location.region : ''
  );
  const [storePath, setStorePath] = useState<string>(
    props.location && props.location.type === locationType.TYPE_CLOUD
      ? props.location.path
      : ''
  );
  const [type, setType] = useState<string>(
    props.location ? props.location.type : locationType.TYPE_LOCAL
  );
  const [newuuid, setNewUuid] = useState<string>(
    props.location ? props.location.uuid : uuidv1()
  );

  const firstRender = useFirstRender();

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

  const { fullScreen, open, onClose } = props;

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
          watchForChanges
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
          bucketName,
          region,
          isDefault,
          isReadOnly,
          persistIndex,
          fullTextIndex,
          watchForChanges: false
        };
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
        setShowSecretAccessKey={setShowSecretAccessKey}
        bucketName={bucketName}
        region={region}
        endpointURL={endpointURL}
        newuuid={newuuid}
        setStoreName={setStoreName}
        setStorePath={setStorePath}
        setAccessKeyId={setAccessKeyId}
        setSecretAccessKey={setSecretAccessKey}
        setBucketName={setBucketName}
        setEndpointURL={setEndpointURL}
        setNewUuid={setNewUuid}
        setRegion={setRegion}
      />
    );
  } else {
    content = (
      <LocalForm
        showSelectDirectoryDialog={props.showSelectDirectoryDialog}
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
        } else if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      <DialogTitle>
        {props.location
          ? i18n.t('core:editLocationTitle')
          : i18n.t('core:createLocationTitle')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={2} style={{ marginTop: 13, textAlign: 'left' }}>
            <Typography>{i18n.t('core:locationType')}</Typography>
          </Grid>
          <Grid item xs={10}>
            <FormControl disabled={!Pro}>
              <RadioGroup
                title={
                  Pro ? '' : i18n.t('core:thisFunctionalityIsAvailableInPro')
                }
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
                  label={i18n.t('core:objectStorage')}
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        {content}
        <FormGroup>
          <FormControlLabel
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
              i18n.t('core:createFullTextIndex') +
              (Pro ? '' : ' - ' + i18n.t('core:proFeature'))
            }
          />
          <FormControlLabel
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
              i18n.t('core:watchForChangesInLocation') +
              (Pro ? '' : ' - ' + i18n.t('core:proFeature'))
            }
          />
          {showAdvancedMode && (
            <FormControlLabel
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
                i18n.t('core:readonlyModeSwitch') +
                (Pro ? '' : ' - ' + i18n.t('core:proFeature'))
              }
            />
          )}
          {showAdvancedMode && (
            <FormControlLabel
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
                i18n.t('core:persistIndexSwitch') +
                (Pro ? '' : ' - ' + i18n.t('core:proFeature'))
              }
            />
          )}
        </FormGroup>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'space-between' }}>
        <Button
          data-tid="switchAdvancedModeTID"
          onClick={() => setShowAdvancedMode(!showAdvancedMode)}
        >
          {showAdvancedMode
            ? i18n.t('core:switchSimpleMode')
            : i18n.t('core:switchAdvancedMode')}
        </Button>
        <div>
          <Button onClick={() => onClose()} color="primary">
            {i18n.t('core:cancel')}
          </Button>
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

export default withStyles(styles)(withMobileDialog()(CreateEditLocationDialog));
