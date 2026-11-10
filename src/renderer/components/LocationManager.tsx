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

import { CloseIcon } from '-/components/CommonIcons';
import LocationView from '-/components/LocationView';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsTextField from '-/components/TsTextField';
import { SettingsTab } from '-/components/dialogs/SettingsDialog';
import { useCreateEditLocationDialogContext } from '-/components/dialogs/hooks/useCreateEditLocationDialogContext';
import { useSettingsDialogContext } from '-/components/dialogs/hooks/useSettingsDialogContext';
import LocationContextMenu from '-/components/menus/LocationContextMenu';
import LocationManagerMenu from '-/components/menus/LocationManagerMenu';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { Pro } from '-/pro';
import { getLocations } from '-/reducers/locations';
import { TS } from '-/tagspaces.namespace';
import { Box, InputAdornment, List, Typography } from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import useScrollFade from '-/utils/useScrollFade';

interface Props {
  style?: any;
  show: boolean;
}

function LocationManager(props: Props) {
  const { t } = useTranslation();
  const listRef = useScrollFade<HTMLUListElement>();
  const {
    moveLocation,
    setSelectedLocation,
    locationDirectoryContextMenuAnchorEl,
  } = useCurrentLocationContext();
  const { openCreateEditLocationDialog } = useCreateEditLocationDialogContext();
  const { openSettingsDialog } = useSettingsDialogContext();

  const locations: TS.Location[] = useSelector(getLocations);
  const [wSpaceLocations, setWSpaceLocations] =
    useState<TS.Location[]>(locations);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (file) {
      openSettingsDialog(SettingsTab.BackupRestore, {
        mode: 'import',
        scope: 'locations',
        importFile: file,
      });
    }
    target.value = null;
  }

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    moveLocation(result.draggableId, result.destination.index);
  };

  const { show } = props;

  function getWorkSpace(l) {
    if (l.workSpaceId) {
      const wSpace = workSpacesContext?.getWorkSpace(l.workSpaceId);
      if (wSpace) {
        return wSpace;
      }
    }
    return undefined;
  }

  function toggleFilter() {
    setShowFilter((prev) => {
      if (prev) {
        setFilterQuery('');
      }
      return !prev;
    });
  }

  const query = filterQuery.trim().toLowerCase();
  const filteredLocations =
    showFilter && query
      ? wSpaceLocations.filter((l) => {
          const wSpace = getWorkSpace(l);
          return (
            (l.name && l.name.toLowerCase().includes(query)) ||
            (wSpace?.shortName &&
              wSpace.shortName.toLowerCase().includes(query)) ||
            (wSpace?.fullName && wSpace.fullName.toLowerCase().includes(query))
          );
        })
      : wSpaceLocations;

  return (
    <Box
      sx={{
        display: show ? 'flex' : 'none',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        paddingLeft: '5px',
        paddingRight: '5px',
        position: 'relative',
      }}
    >
      <LocationManagerMenu
        importLocations={() => {
          fileInputRef.current.click();
        }}
        exportLocations={() =>
          openSettingsDialog(SettingsTab.BackupRestore, {
            mode: 'export',
            scope: 'locations',
          })
        }
        showCreateLocationDialog={() => {
          setSelectedLocation(undefined);
          openCreateEditLocationDialog();
        }}
        toggleFilter={toggleFilter}
        filterActive={showFilter}
      />
      {locationDirectoryContextMenuAnchorEl && <LocationContextMenu />}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {showFilter && (
          <TsTextField
            autoFocus
            data-tid="locationManagerFilterInputTID"
            value={filterQuery}
            updateValue={(value) => setFilterQuery(value)}
            retrieveValue={() => filterQuery}
            onChange={(event) => setFilterQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                toggleFilter();
              }
            }}
            placeholder={t('core:filterLocationsPlaceholder')}
            sx={{
              marginBottom: '5px',
              '& .MuiInputBase-root': {
                paddingRight: '4px',
              },
              '& .MuiInputBase-input': {
                padding: '5px 8px',
                fontSize: '0.85rem',
              },
            }}
            slotProps={{
              input: {
                endAdornment: filterQuery ? (
                  <InputAdornment position="end">
                    <TsIconButton
                      size="small"
                      data-tid="locationManagerFilterClearTID"
                      onClick={() => setFilterQuery('')}
                    >
                      <CloseIcon fontSize="small" />
                    </TsIconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        )}
        <List
          ref={listRef}
          data-tid="locationList"
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            borderRadius: '5px',
            paddingTop: 0,
            marginTop: 0,
            overflowY: 'auto',
          }}
        >
          {wSpaceLocations.length === 0 && (
            <Box
              data-tid="locationsEmptyState"
              sx={{
                padding: '16px',
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2" sx={{ marginBottom: '12px' }}>
                {t('peri:noLocationsYet')}
              </Typography>
              <TsButton
                variant="contained"
                data-tid="createFirstLocationTID"
                onClick={() => {
                  setSelectedLocation(undefined);
                  openCreateEditLocationDialog();
                }}
              >
                {t('peri:createYourFirstLocation')}
              </TsButton>
            </Box>
          )}
          {wSpaceLocations.length > 0 && filteredLocations.length === 0 && (
            <Box
              data-tid="locationsFilterNoMatch"
              sx={{
                padding: '16px',
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                {t('core:noMatchesFound')}
              </Typography>
            </Box>
          )}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {filteredLocations.map((location, index) => (
                    <Draggable
                      key={location.uuid}
                      draggableId={location.uuid}
                      index={index}
                      isDragDisabled={Boolean(query)}
                    >
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                        >
                          <LocationView
                            key={location.uuid + index}
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
      </Box>
      <input
        style={{ display: 'none' }}
        ref={fileInputRef}
        accept="*"
        type="file"
        onChange={handleFileInputChange}
      />
    </Box>
  );
}

export default LocationManager;
