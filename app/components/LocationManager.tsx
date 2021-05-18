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
/* global TagSpaces */
/* eslint no-undef: "error" */
import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import styles from './SidePanels.css';
import LocationManagerMenu from './menus/LocationManagerMenu';
import ConfirmDialog from './dialogs/ConfirmDialog';
import CustomLogo from './CustomLogo';
import {
  actions as LocationActions,
  getLocations
} from '../reducers/locations';
import { actions as AppActions } from '../reducers/app';
import { getPerspectives, isDesktopMode } from '-/reducers/settings';
import i18n from '../services/i18n';
import AppConfig from '../config';
import LoadingLazy from '-/components/LoadingLazy';
import LocationView from '-/components/LocationView';
import { Pro } from '-/pro';

const CreateEditLocationDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "CreateEditLocationDialog" */ './dialogs/CreateEditLocationDialog'
  )
);
const CreateEditLocationDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <CreateEditLocationDialog {...props} />
  </React.Suspense>
);

interface Props {
  classes: any;
  style: any;
  locations: Array<TagSpaces.Location>;
  perspectives: Array<Object>;
  hideDrawer: () => void;
  openURLExternally: (path: string) => void;
  toggleOpenLinkDialog: () => void;
  setDefaultLocations: () => void;
  addLocation: (
    location: TagSpaces.Location,
    openAfterCreate?: boolean
  ) => void;
  addLocations: (locations: Array<TagSpaces.Location>) => void;
  editLocation: () => void;
  removeLocation: (location: TagSpaces.Location) => void;
  isDesktop: boolean;
}

type SubFolder = {
  uuid: string;
  name: string;
  path: string;
  children?: Array<SubFolder>;
};

const LocationManager = (props: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<TagSpaces.Location>(
    null
  );
  const [
    isCreateLocationDialogOpened,
    setCreateLocationDialogOpened
  ] = useState<boolean>(false);
  const [isEditLocationDialogOpened, setEditLocationDialogOpened] = useState<
    boolean
  >(false);
  const [
    isDeleteLocationDialogOpened,
    setDeleteLocationDialogOpened
  ] = useState<boolean>(false);
  const [
    isExportLocationsDialogOpened,
    setExportLocationsDialogOpened
  ] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File>(undefined);

  const ExportLocationsDialog =
    Pro && Pro.UI ? Pro.UI.ExportLocationsDialog : false;

  const ImportLocationsDialog =
    Pro && Pro.UI ? Pro.UI.ImportLocationsDialog : false;

  useEffect(() => {
    if (props.locations.length < 1) {
      // init locations
      props.setDefaultLocations();
    }
  }, []); // props.locations]);

  function handleFileInputChange(selection: any) {
    const target = selection.currentTarget;
    const file = target.files[0];
    setImportFile(file);
    target.value = null;
  }

  const { classes, isDesktop } = props;
  return (
    <div className={classes.panel} style={props.style}>
      <CustomLogo />

      <LocationManagerMenu
        importLocations={() => {
          fileInputRef.current.click();
        }}
        // importLocations={() => setImportLocationsDialogOpened(true)}
        exportLocations={() => setExportLocationsDialogOpened(true)}
        classes={classes}
        openURLExternally={props.openURLExternally}
        showCreateLocationDialog={() => {
          setCreateLocationDialogOpened(true);
        }}
        toggleOpenLinkDialog={props.toggleOpenLinkDialog}
      />
      {!AppConfig.locationsReadOnly && (
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            marginBottom: 10
          }}
        >
          <Button
            data-tid="createNewLocation"
            onClick={() => setCreateLocationDialogOpened(true)}
            title={i18n.t('core:createLocationTitle')}
            className={classes.mainActionButton}
            size="small"
            variant="outlined"
            color="primary"
            style={{ width: '95%' }}
          >
            {/* <CreateLocationIcon className={classNames(classes.leftIcon)} /> */}
            {i18n.t('core:createLocationTitle')}
          </Button>
        </div>
      )}
      <div>
        {isCreateLocationDialogOpened && (
          <CreateEditLocationDialogAsync
            open={isCreateLocationDialogOpened}
            onClose={() => setCreateLocationDialogOpened(false)}
            addLocation={props.addLocation}
          />
        )}
        {isEditLocationDialogOpened && (
          <CreateEditLocationDialogAsync
            open={isEditLocationDialogOpened}
            onClose={() => setEditLocationDialogOpened(false)}
            location={selectedLocation}
            editLocation={props.editLocation}
          />
        )}
        {isDeleteLocationDialogOpened && (
          <ConfirmDialog
            open={isDeleteLocationDialogOpened}
            onClose={() => setDeleteLocationDialogOpened(false)}
            title={i18n.t('core:deleteLocationTitleAlert')}
            content={i18n.t('core:deleteLocationContentAlert', {
              locationName: selectedLocation ? selectedLocation.name : ''
            })}
            confirmCallback={result => {
              if (result && selectedLocation) {
                props.removeLocation(selectedLocation);
              }
            }}
            cancelDialogTID="cancelDeleteLocationDialog"
            confirmDialogTID="confirmDeleteLocationDialog"
          />
        )}
        <List
          className={classes.locationListArea}
          data-tid="locationList"
          style={{
            maxHeight: isDesktop
              ? 'calc(100vh - 175px)'
              : 'calc(100vh - 225px)',
            // @ts-ignore
            overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
          }}
        >
          {props.locations.map(location => (
            <LocationView
              key={location.uuid}
              classes={props.classes}
              location={location}
              hideDrawer={props.hideDrawer}
              setEditLocationDialogOpened={setEditLocationDialogOpened}
              setDeleteLocationDialogOpened={setDeleteLocationDialogOpened}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
            />
          ))}
        </List>
      </div>
      <input
        style={{ display: 'none' }}
        ref={fileInputRef}
        accept="*"
        type="file"
        onChange={handleFileInputChange}
      />
      {ExportLocationsDialog && isExportLocationsDialogOpened && (
        <ExportLocationsDialog
          open={isExportLocationsDialogOpened}
          onClose={() => setExportLocationsDialogOpened(false)}
          locations={props.locations.filter(
            location => !location.isNotEditable
          )}
        />
      )}
      {ImportLocationsDialog && importFile && (
        <ImportLocationsDialog
          open={Boolean(importFile)}
          onClose={() => setImportFile(undefined)}
          importFile={importFile}
          addLocations={props.addLocations}
          locations={props.locations}
        />
      )}
    </div>
  );
};

function mapStateToProps(state) {
  return {
    locations: getLocations(state),
    perspectives: getPerspectives(state),
    isDesktop: isDesktopMode(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setDefaultLocations: LocationActions.setDefaultLocations,
      addLocation: LocationActions.addLocation,
      addLocations: LocationActions.addLocations,
      editLocation: LocationActions.editLocation,
      removeLocation: LocationActions.removeLocation,
      toggleOpenLinkDialog: AppActions.toggleOpenLinkDialog,
      openURLExternally: AppActions.openURLExternally
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
  // @ts-ignore
)(withStyles(styles)(LocationManager));
