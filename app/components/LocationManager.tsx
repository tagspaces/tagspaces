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

import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@mui/styles/withStyles';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { List } from '@mui/material';
import AppConfig from '@tagspaces/tagspaces-platforms/AppConfig';
import styles from '-/components/SidePanels.css';
import LocationManagerMenu from '-/components/menus/LocationManagerMenu';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { actions as LocationActions, getLocations } from '-/reducers/locations';
import { actions as AppActions, isLoading } from '-/reducers/app';
import {
  getCurrentLanguage,
  getPersistTagsInSidecarFile,
  isDesktopMode
} from '-/reducers/settings';
import i18n from '-/services/i18n';
import LoadingLazy from '-/components/LoadingLazy';
import LocationView from '-/components/LocationView';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import PlatformIO from '-/services/platform-facade';

const CreateEditLocationDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "CreateEditLocationDialog" */ './dialogs/CreateEditLocationDialog'
  )
);
function CreateEditLocationDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <CreateEditLocationDialog {...props} />
    </React.Suspense>
  );
}

interface Props {
  classes?: any;
  style?: any;
  locations: Array<TS.Location>;
  hideDrawer?: () => void;
  openURLExternally: (path: string) => void;
  toggleOpenLinkDialog: () => void;
  setDefaultLocations: () => void;
  addLocations: (locations: Array<TS.Location>) => void;
  editLocation: () => void;
  removeLocation: (location: TS.Location) => void;
  moveLocation: (uuid: string, position: number) => void;
  isDesktop: boolean;
  isPersistTagsInSidecar: boolean;
  reduceHeightBy: number;
  toggleLocationDialog: () => void;
  isLoading: boolean;
  show: boolean;
}

type SubFolder = {
  uuid: string;
  name: string;
  path: string;
  children?: Array<SubFolder>;
};

function LocationManager(props: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<TS.Location>(null);
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

  const onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    props.moveLocation(result.draggableId, result.destination.index);
  };

  const { classes, reduceHeightBy, isLoading, show } = props;
  return (
    <div
      className={classes.panel}
      style={{
        display: show ? 'flex' : 'none',
        flexDirection: 'column'
      }}
    >
      {isLoading &&
        (PlatformIO.haveObjectStoreSupport() ||
          PlatformIO.haveWebDavSupport()) && (
          <div
            style={{
              position: 'absolute',
              zIndex: 1000,
              height: 'calc(100% - 180px)',
              width: 310,
              backdropFilter: 'grayscale(1)'
              // backgroundColor: 'red'
              // backdropFilter: 'blur(2px)',
              // backgroundColor: '#fafafaAA' // red: '#eb585882' '#d9d9d980'
            }}
          />
        )}
      <LocationManagerMenu
        importLocations={() => {
          fileInputRef.current.click();
        }}
        // importLocations={() => setImportLocationsDialogOpened(true)}
        exportLocations={() => setExportLocationsDialogOpened(true)}
        classes={classes}
        openURLExternally={props.openURLExternally}
        showCreateLocationDialog={props.toggleLocationDialog}
        toggleOpenLinkDialog={props.toggleOpenLinkDialog}
      />
      <List
        className={classes.locationListArea}
        data-tid="locationList"
        style={{
          height: 'calc(100% - ' + reduceHeightBy + 'px)',
          borderRadius: 5,
          // @ts-ignore
          overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
        }}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                /* style={getListStyle(snapshot.isDraggingOver)} */
              >
                {props.locations.map((location, index) => (
                  <Draggable
                    key={location.uuid}
                    draggableId={location.uuid}
                    index={index}
                  >
                    {(prov, snap) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        /* style={getItemStyle(
                            snap.isDragging,
                            prov.draggableProps.style
                          )} */
                      >
                        <LocationView
                          key={location.uuid}
                          classes={props.classes}
                          location={location}
                          hideDrawer={props.hideDrawer}
                          setEditLocationDialogOpened={
                            setEditLocationDialogOpened
                          }
                          setDeleteLocationDialogOpened={
                            setDeleteLocationDialogOpened
                          }
                          selectedLocation={selectedLocation}
                          setSelectedLocation={setSelectedLocation}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </List>
      <input
        style={{ display: 'none' }}
        ref={fileInputRef}
        accept="*"
        type="file"
        onChange={handleFileInputChange}
      />
      {isEditLocationDialogOpened && (
        <CreateEditLocationDialogAsync
          open={isEditLocationDialogOpened}
          onClose={() => setEditLocationDialogOpened(false)}
          location={selectedLocation}
          editLocation={props.editLocation}
          isPersistTagsInSidecar={props.isPersistTagsInSidecar}
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
}

function mapStateToProps(state) {
  return {
    locations: getLocations(state),
    isDesktop: isDesktopMode(state),
    isLoading: isLoading(state),
    isPersistTagsInSidecar: getPersistTagsInSidecarFile(state),
    language: getCurrentLanguage(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setDefaultLocations: LocationActions.setDefaultLocations,
      addLocations: LocationActions.addLocations,
      editLocation: LocationActions.editLocation,
      removeLocation: LocationActions.removeLocation,
      moveLocation: LocationActions.moveLocation,
      toggleOpenLinkDialog: AppActions.toggleOpenLinkDialog,
      openURLExternally: AppActions.openURLExternally,
      toggleLocationDialog: AppActions.toggleLocationDialog
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
  // @ts-ignore
)(withStyles(styles)(LocationManager));
