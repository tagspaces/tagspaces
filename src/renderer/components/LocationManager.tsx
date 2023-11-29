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
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { List } from '@mui/material';
import LocationManagerMenu from '-/components/menus/LocationManagerMenu';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { actions as LocationActions, getLocations } from '-/reducers/locations';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import LoadingLazy from '-/components/LoadingLazy';
import LocationView from '-/components/LocationView';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import PlatformIO from '-/services/platform-facade';
import { classes, SidePanel } from '-/components/SidePanels.css';
import { useTranslation } from 'react-i18next';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import LocationContextMenu from '-/components/menus/LocationContextMenu';

const CreateEditLocationDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "CreateEditLocationDialog" */ './dialogs/CreateEditLocationDialog'
    ),
);
function CreateEditLocationDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <CreateEditLocationDialog {...props} />
    </React.Suspense>
  );
}

interface Props {
  style?: any;
  reduceHeightBy: number;
  show: boolean;
}

function LocationManager(props: Props) {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const {
    addLocations,
    editLocation,
    selectedLocation,
    locationDirectoryContextMenuAnchorEl,
  } = useCurrentLocationContext();
  const locations: Array<TS.Location> = useSelector(getLocations);
  // const loading: boolean = useSelector(isLoading);
  //const language: string = useSelector(getCurrentLanguage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  //const selectedLocation = useRef<TS.Location>(null);
  const [isEditLocationDialogOpened, setEditLocationDialogOpened] =
    useState<boolean>(false);
  const [isDeleteLocationDialogOpened, setDeleteLocationDialogOpened] =
    useState<boolean>(false);
  const [isExportLocationsDialogOpened, setExportLocationsDialogOpened] =
    useState<boolean>(false);
  const [importFile, setImportFile] = useState<File>(undefined);

  const ExportLocationsDialog =
    Pro && Pro.UI ? Pro.UI.ExportLocationsDialog : false;

  const ImportLocationsDialog =
    Pro && Pro.UI ? Pro.UI.ImportLocationsDialog : false;

  /*function setSelectedLocation(location: TS.Location) {
    selectedLocation.current = location;
  }*/
  function handleFileInputChange(selection: any) {
    const target = selection.currentTarget;
    const file = target.files[0];
    setImportFile(file);
    target.value = null;
  }

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    dispatch(
      LocationActions.moveLocation(
        result.draggableId,
        result.destination.index,
      ),
    );
  };

  const { reduceHeightBy, show } = props;
  return (
    <SidePanel
      style={{
        display: show ? 'flex' : 'none',
        flexDirection: 'column',
      }}
    >
      {
        //loading &&
        (PlatformIO.haveObjectStoreSupport() ||
          PlatformIO.haveWebDavSupport()) && (
          <>
            <style>
              {`
                @keyframes hide {
                  to {
                      width: 0;
                  }
                }
              }
            `}
            </style>
            <div
              style={{
                position: 'absolute',
                zIndex: 1000,
                height: 'calc(100% - 150px)',
                width: 310,
                backdropFilter: 'grayscale(1)',
                animation: 'hide 1ms linear 5s 1 forwards',
                // backgroundColor: 'red'
                // backdropFilter: 'blur(2px)',
                // backgroundColor: '#fafafaAA' // red: '#eb585882' '#d9d9d980'
              }}
            />
          </>
        )
      }
      <LocationManagerMenu
        importLocations={() => {
          fileInputRef.current.click();
        }}
        // importLocations={() => setImportLocationsDialogOpened(true)}
        exportLocations={() => setExportLocationsDialogOpened(true)}
        classes={classes}
        showCreateLocationDialog={() =>
          dispatch(AppActions.toggleLocationDialog())
        }
        toggleOpenLinkDialog={() => dispatch(AppActions.toggleOpenLinkDialog())}
      />
      {locationDirectoryContextMenuAnchorEl && (
        <LocationContextMenu
          setEditLocationDialogOpened={setEditLocationDialogOpened}
          setDeleteLocationDialogOpened={setDeleteLocationDialogOpened}
        />
      )}
      <List
        className={classes.locationListArea}
        data-tid="locationList"
        style={{
          height: 'calc(100% - ' + reduceHeightBy + 'px)',
          width: 310,
          borderRadius: 5,
          overflowY: 'auto',
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
                {locations.map((location, index) => (
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
                          location={location}
                          setEditLocationDialogOpened={
                            setEditLocationDialogOpened
                          }
                          setDeleteLocationDialogOpened={
                            setDeleteLocationDialogOpened
                          }
                          /*selectedLocation={selectedLocation.current}
                          setSelectedLocation={setSelectedLocation}*/
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
          /*location={selectedLocation.current}*/
          editLocation={(location) => editLocation(location)}
        />
      )}
      {isDeleteLocationDialogOpened && (
        <ConfirmDialog
          open={isDeleteLocationDialogOpened}
          onClose={() => setDeleteLocationDialogOpened(false)}
          title={t('core:deleteLocationTitleAlert')}
          content={t('core:deleteLocationContentAlert', {
            locationName: selectedLocation ? selectedLocation.name : '',
          })}
          confirmCallback={(result) => {
            if (result && selectedLocation) {
              dispatch(LocationActions.deleteLocation(selectedLocation));
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
          locations={locations.filter((location) => !location.isNotEditable)}
        />
      )}
      {ImportLocationsDialog && importFile && (
        <ImportLocationsDialog
          open={Boolean(importFile)}
          onClose={() => setImportFile(undefined)}
          importFile={importFile}
          addLocations={(loc) => addLocations(loc)}
          locations={locations}
        />
      )}
    </SidePanel>
  );
}

export default LocationManager;
