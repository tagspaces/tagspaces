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
import { useCreateEditLocationDialogContext } from '-/components/dialogs/hooks/useCreateEditLocationDialogContext';
import LocationContextMenu from '-/components/menus/LocationContextMenu';
import LocationManagerMenu from '-/components/menus/LocationManagerMenu';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { Pro } from '-/pro';
import { getLocations } from '-/reducers/locations';
import { TS } from '-/tagspaces.namespace';
import { Box, List } from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useSelector } from 'react-redux';

interface Props {
  style?: any;
  reduceHeightBy: number;
  show: boolean;
}

function LocationManager(props: Props) {
  const {
    findLocation,
    moveLocation,
    setSelectedLocation,
    locationDirectoryContextMenuAnchorEl,
  } = useCurrentLocationContext();
  const { openCreateEditLocationDialog } = useCreateEditLocationDialogContext();

  const locations: TS.Location[] = useSelector(getLocations);
  const [wSpaceLocations, setWSpaceLocations] =
    useState<TS.Location[]>(locations);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExportLocationsDialogOpened, setExportLocationsDialogOpened] =
    useState<boolean>(false);
  const [importFile, setImportFile] = useState<File>(undefined);

  const ExportLocationsDialog =
    Pro && Pro.UI ? Pro.UI.ExportLocationsDialog : false;

  const ImportLocationsDialog =
    Pro && Pro.UI ? Pro.UI.ImportLocationsDialog : false;

  const workSpacesContext = Pro?.contextProviders?.WorkSpacesContext
    ? useContext<TS.WorkSpacesContextData>(
        Pro.contextProviders.WorkSpacesContext,
      )
    : undefined;

  const currentWorkSpace =
    workSpacesContext && workSpacesContext.getCurrentWorkSpace
      ? workSpacesContext?.getCurrentWorkSpace()
      : undefined;

  useEffect(() => {
    if (currentWorkSpace) {
      setWSpaceLocations(
        locations.filter((l) => l.workSpaceId === currentWorkSpace.uuid),
      );
    } else {
      setWSpaceLocations(locations);
    }
  }, [currentWorkSpace, locations]);

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
  };

  const { reduceHeightBy, show } = props;
  const currentLocation = findLocation();

  function getWorkSpace(l) {
    if (l.workSpaceId) {
      const wSpace = workSpacesContext?.getWorkSpace(l.workSpaceId);
      if (wSpace) {
        return wSpace;
      }
    }
    return undefined;
  }

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
      {currentLocation &&
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
              }}
            />
          </>
        )}
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
      {locationDirectoryContextMenuAnchorEl && <LocationContextMenu />}
      <List
        data-tid="locationList"
        sx={{
          height: 'calc(100% - ' + reduceHeightBy + 'px)',
          width: '310px',
          borderRadius: '5px',
          paddingTop: 0,
          marginTop: 0,
          overflowY: 'auto',
        }}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {wSpaceLocations.map((location, index) => (
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
                      >
                        <LocationView
                          key={location.uuid}
                          workspace={getWorkSpace(location)}
                          location={{
                            isFile: false,
                            lmdt: 0,
                            name: location.name,
                            path: location.path,
                            size: 0,
                            locationID: location.uuid,
                            children: [],
                          }}
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
      {ExportLocationsDialog && isExportLocationsDialogOpened && (
        <ExportLocationsDialog
          open={isExportLocationsDialogOpened}
          onClose={() => setExportLocationsDialogOpened(false)}
        />
      )}
      {ImportLocationsDialog && importFile && (
        <ImportLocationsDialog
          open={Boolean(importFile)}
          onClose={() => setImportFile(undefined)}
          importFile={importFile}
        />
      )}
    </Box>
  );
}

export default LocationManager;
