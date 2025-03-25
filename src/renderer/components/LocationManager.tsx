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

import LocationView from '-/components/LocationView';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { useCreateEditLocationDialogContext } from '-/components/dialogs/hooks/useCreateEditLocationDialogContext';
import LocationContextMenu from '-/components/menus/LocationContextMenu';
import LocationManagerMenu from '-/components/menus/LocationManagerMenu';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { Pro } from '-/pro';
import { Box, List } from '@mui/material';
import { useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';

/*const CreateEditLocationDialog = React.lazy(
  () =>
    import(
      /!* webpackChunkName: "CreateEditLocationDialog" *!/ './dialogs/CreateEditLocationDialog'
    ),
);
function CreateEditLocationDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <CreateEditLocationDialog {...props} />
    </React.Suspense>
  );
}*/

interface Props {
  style?: any;
  reduceHeightBy: number;
  show: boolean;
}

function LocationManager(props: Props) {
  const { t } = useTranslation();
  const {
    locations,
    findLocation,
    addLocations,
    moveLocation,
    deleteLocation,
    selectedLocation,
    setSelectedLocation,
    locationDirectoryContextMenuAnchorEl,
  } = useCurrentLocationContext();
  const { openCreateEditLocationDialog } = useCreateEditLocationDialogContext();

  //const locations: Array<CommonLocation> = useSelector(getLocations);
  // const loading: boolean = useSelector(isLoading);
  //const language: string = useSelector(getCurrentLanguage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /*const [isEditLocationDialogOpened, setEditLocationDialogOpened] =
    useState<boolean>(false);*/
  const [isDeleteLocationDialogOpened, setDeleteLocationDialogOpened] =
    useState<boolean>(false);
  const [isExportLocationsDialogOpened, setExportLocationsDialogOpened] =
    useState<boolean>(false);
  const [importFile, setImportFile] = useState<File>(undefined);

  const ExportLocationsDialog =
    Pro && Pro.UI ? Pro.UI.ExportLocationsDialog : false;

  const ImportLocationsDialog =
    Pro && Pro.UI ? Pro.UI.ImportLocationsDialog : false;

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
    moveLocation(result.draggableId, result.destination.index);
    /*dispatch(
      LocationActions.moveLocation(
        result.draggableId,
        result.destination.index,
      ),
    );*/
  };

  const { reduceHeightBy, show } = props;
  const currentLocation = findLocation();
  return (
    <Box
      style={{
        display: show ? 'flex' : 'none',
        flexDirection: 'column',
        height: '100%',
        paddingLeft: 5,
        paddingRight: 0,
      }}
    >
      {
        //loading &&
        currentLocation &&
          (currentLocation.haveObjectStoreSupport() ||
            currentLocation.haveWebDavSupport()) && (
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
        exportLocations={() => setExportLocationsDialogOpened(true)}
        showCreateLocationDialog={() => {
          setSelectedLocation(undefined);
          openCreateEditLocationDialog();
        }}
      />
      {locationDirectoryContextMenuAnchorEl && (
        <LocationContextMenu
          setDeleteLocationDialogOpened={setDeleteLocationDialogOpened}
        />
      )}
      <List
        data-tid="locationList"
        style={{
          height: 'calc(100% - ' + reduceHeightBy + 'px)',
          width: 310,
          borderRadius: 5,
          paddingTop: 0,
          marginTop: 0,
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
                          setDeleteLocationDialogOpened={
                            setDeleteLocationDialogOpened
                          }
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
      {/*{isEditLocationDialogOpened && (
        <CreateEditLocationDialogAsync
          open={isEditLocationDialogOpened}
          onClose={() => setEditLocationDialogOpened(false)}
          editLocation={(location) => editLocation(location)}
        />
      )}*/}
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
              deleteLocation(selectedLocation.uuid);
              //dispatch(LocationActions.deleteLocation(selectedLocation));
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
    </Box>
  );
}

export default LocationManager;
