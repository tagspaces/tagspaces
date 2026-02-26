/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
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

import { useNotificationContext } from '-/hooks/useNotificationContext';
import { AppDispatch } from '-/reducers/app';
import {
  actions as LocationActions,
  getDefaultLocationId,
  getLocations,
} from '-/reducers/locations';
import { getPersistTagsInSidecarFile } from '-/reducers/settings';
import {
  getDevicePaths,
  instanceId,
  resolveRelativePath,
  toTsLocation,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { clearAllURLParams, getURLParameter } from '-/utils/dom';
import {
  canMoveDown,
  canMoveUp,
  findLocalLocation as findLocalLocationUtil,
  findLocationById,
  getDirSeparatorForLocation,
  getFirstReadWriteLocation,
  getLocationPathString,
  getLocationPositionByUUID,
  validateMoveLocation,
} from '-/utils/locationUtils';
import versionMeta from '-/version.json';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

type CurrentLocationContextData = {
  locations: CommonLocation[];
  currentLocation: CommonLocation;
  currentLocationId: string;
  skipInitialDirList: boolean;
  persistTagsInSidecarFile: boolean;
  getLocationPath: (location: CommonLocation) => Promise<string>;
  findLocation: (locationID?: string) => CommonLocation | undefined;
  getDirSeparator: (locationID?: string) => string;
  findLocalLocation: () => CommonLocation;
  changeLocation: (location: CommonLocation, skipInitDirList?: boolean) => void;
  editLocation: (location: CommonLocation, openAfterEdit?: boolean) => void;
  addLocation: (
    location: CommonLocation,
    openAfterCreate?: boolean,
    locationPosition?: number,
  ) => void;
  addLocations: (
    arrLocations: Array<CommonLocation>,
    override?: boolean,
  ) => void;
  deleteLocation: (locationUUID: string) => void;
  moveLocationUp: (locationUUID: string) => void;
  moveLocationDown: (locationUUID: string) => void;
  moveLocation: (locationUUID: string, newIndex: number) => void;
  openLocation: (
    location: CommonLocation,
    skipInitialDirList?: boolean,
  ) => void;
  closeLocation: (locationId: string) => void;
  closeAllLocations: () => void;
  changeLocationByID: (locationId: string) => void;
  openLocationById: (locationId: string, skipInitialDirList?: boolean) => void;
  selectedLocation: CommonLocation;
  setSelectedLocation: (location: CommonLocation) => void;
  getLocationPosition: (locationId: string) => number;
  locationDirectoryContextMenuAnchorEl: null | HTMLElement;
  setLocationDirectoryContextMenuAnchorEl: (el: HTMLElement) => void;
  getFirstRWLocation: () => CommonLocation | undefined;
};

export const CurrentLocationContext = createContext<CurrentLocationContextData>(
  {
    locations: undefined,
    currentLocation: undefined,
    currentLocationId: undefined,
    skipInitialDirList: false,
    persistTagsInSidecarFile: true,
    getLocationPath: undefined,
    findLocation: undefined,
    getDirSeparator: undefined,
    findLocalLocation: undefined,
    changeLocation: () => {},
    editLocation: () => {},
    addLocation: () => {},
    addLocations: () => {},
    deleteLocation: undefined,
    moveLocationUp: undefined,
    moveLocationDown: undefined,
    moveLocation: undefined,
    openLocation: () => {},
    closeLocation: () => {},
    closeAllLocations: () => {},
    changeLocationByID: () => {},
    openLocationById: () => {},
    selectedLocation: undefined,
    setSelectedLocation: undefined,
    getLocationPosition: () => 0,
    locationDirectoryContextMenuAnchorEl: undefined,
    setLocationDirectoryContextMenuAnchorEl: () => {},
    getFirstRWLocation: undefined,
  },
);

export type CurrentLocationContextProviderProps = {
  children: React.ReactNode;
};

export const CurrentLocationContextProvider = ({
  children,
}: CurrentLocationContextProviderProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { t } = useTranslation();
  const { showNotification } = useNotificationContext();

  const locations: TS.Location[] = useSelector(getLocations);
  const defaultLocationId = useSelector(getDefaultLocationId);
  const settingsPersistTagsInSidecarFile: boolean = useSelector(
    getPersistTagsInSidecarFile,
  );
  // needs to convert TS.Location from redux into CommonLocation
  const allLocations = useRef<CommonLocation[]>(
    locations.map((l) => new CommonLocation(l)),
  );
  const currentLocationId = useRef<string | undefined>(undefined);
  const selectedLocation = useRef<CommonLocation | undefined>(undefined);
  const skipInitialDirList = useRef<boolean>(false);
  const initLocations = useRef<boolean>(false);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const [
    locationDirectoryContextMenuAnchorEl,
    setLocationDirectoryContextMenuAnchorEl,
  ] = useState<null | HTMLElement>(null);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    // Initialize BroadcastChannel
    try {
      broadcastRef.current = new BroadcastChannel('ts-sync-channel');
      broadcastRef.current.onmessage = (event: MessageEvent) => {
        const action = event.data as TS.BroadcastMessage;
        if (instanceId !== action.uuid) {
          handleBroadcastMessage(action);
        }
      };
    } catch (e) {
      console.error('BroadcastChannel initialization error:', e);
    }

    // Cleanup on unmount
    return () => {
      if (broadcastRef.current) {
        broadcastRef.current.close();
      }
    };
  }, []);

  function handleBroadcastMessage(action: TS.BroadcastMessage) {
    switch (action.type) {
      case 'addLocation': {
        const location = action.payload as TS.Location;
        addLocationInt(new CommonLocation(location), false);
        break;
      }
      case 'editLocation': {
        const location = action.payload as TS.Location;
        skipInitialDirList.current = true;
        editLocationInt(new CommonLocation(location));
        break;
      }
      case 'deleteLocation':
        deleteLocationInt(action.payload);
        break;
      case 'moveLocationUp':
        moveLocationUpInt(action.payload);
        forceUpdate();
        break;
      case 'moveLocationDown':
        moveLocationDownInt(action.payload);
        forceUpdate();
        break;
    }
  }

  useEffect(() => {
    if (locations.length < 1) {
      // init locations
      setDefaultLocations();
    } else {
      // check if current location exist (or is removed)
      if (currentLocationId.current) {
        const locationExists = locations.some(
          (location) => location.uuid === currentLocationId.current,
        );
        if (!locationExists) {
          setCurrentLocation(undefined);
        }
      }
      allLocations.current = locations.map((l) => new CommonLocation(l));
      forceUpdate();
    }
  }, [locations]);

  // Open default location if configured
  useEffect(() => {
    if (
      !currentLocationId.current &&
      defaultLocationId &&
      defaultLocationId.length > 0
    ) {
      const shouldOpenDefault =
        !getURLParameter('tslid') &&
        !getURLParameter('tsdpath') &&
        !getURLParameter('tsepath') &&
        !getURLParameter('cmdopen');
      if (shouldOpenDefault) {
        openLocationById(defaultLocationId);
      }
    }
  }, [defaultLocationId]);

  /**
   * @deprecated use resolveRelativePath instead
   */
  function getLocationPath(location: CommonLocation): Promise<string> {
    if (!location) return Promise.resolve('');
    return resolveRelativePath(getLocationPathString(location));
  }

  // Build a map of locations by ID. Rebuilt only when `locations` array changes.
  const locationsById = useMemo(() => {
    const map: Record<string, CommonLocation> = {};
    for (const loc of allLocations.current) {
      map[loc.uuid] = loc;
    }
    return map;
  }, [allLocations.current]);

  // Return the current location, memoized to prevent unnecessary re-renders
  const currentLocation = useMemo(
    () => locationsById[currentLocationId.current],
    [locationsById, currentLocationId.current],
  );

  function findLocation(locationID?: string): CommonLocation | undefined {
    return findLocationById(
      allLocations.current,
      locationID,
      currentLocationId.current,
    );
  }

  function getDirSeparator(locationID?: string): string {
    const loc = findLocation(locationID);
    return getDirSeparatorForLocation(loc);
  }

  function findLocalLocation(): CommonLocation | undefined {
    return findLocalLocationUtil(allLocations.current);
  }

  function setDefaultLocations() {
    if (!initLocations.current) {
      // setDefaultLocations first time only
      initLocations.current = true;
      getDevicePaths()
        .then((devicePaths) => {
          if (devicePaths) {
            Object.keys(devicePaths).forEach((key) => {
              const location = new CommonLocation({
                uuid: getUuid(),
                type: locationType.TYPE_LOCAL,
                name: t(('core:' + key) as any) as string,
                path: devicePaths[key] as string,
                isDefault: false, // AppConfig.isWeb && devicePaths[key] === '/files/', // Used for the web ts demo
                isReadOnly: false,
                disableIndexing: false,
              });
              addLocation(location, false);
            });
          }
          return true;
        })
        .catch((ex) => console.log('Error getDevicePaths:', ex));
    }
  }

  function sendMessage(type: string, payload?: any): void {
    if (!broadcastRef.current) return;
    try {
      const message: TS.BroadcastMessage = { uuid: instanceId, type, payload };
      broadcastRef.current.postMessage(message);
    } catch (e) {
      console.error('broadcast.postMessage error:', e);
    }
  }

  function addLocation(
    location: CommonLocation,
    openAfterCreate = true,
    locationPosition?: number,
  ): void {
    addLocationInt(location, openAfterCreate, locationPosition);
    sendMessage('addLocation', toTsLocation(location));
  }

  function addLocationInt(
    location: CommonLocation,
    openAfterCreate = true,
    locationPosition?: number,
  ): void {
    if (openAfterCreate) {
      openLocation(location);
    }
    dispatch(LocationActions.createLocation(location, locationPosition));
  }

  function deleteLocation(locationId: string): void {
    deleteLocationInt(locationId);
    sendMessage('deleteLocation', locationId);
  }

  function deleteLocationInt(locationId: string): void {
    dispatch(LocationActions.deleteLocation(locationId));
    if (currentLocationId.current === locationId) {
      setCurrentLocation(undefined);
    }
  }

  function moveLocationUp(locationUUID: string): void {
    moveLocationUpInt(locationUUID);
    sendMessage('moveLocationUp', locationUUID);
  }

  function moveLocationUpInt(locationUUID: string): void {
    if (!canMoveUp(allLocations.current, locationUUID)) return;
    dispatch(LocationActions.moveLocationUp(locationUUID));
  }

  function moveLocationDown(locationUUID: string): void {
    moveLocationDownInt(locationUUID);
    sendMessage('moveLocationDown', locationUUID);
  }

  function moveLocationDownInt(locationUUID: string): void {
    if (!canMoveDown(allLocations.current, locationUUID)) return;
    dispatch(LocationActions.moveLocationDown(locationUUID));
  }

  function moveLocation(locationUUID: string, newIndex: number): void {
    validateMoveLocation(allLocations.current, locationUUID, newIndex);
    dispatch(LocationActions.moveLocation(locationUUID, newIndex));
  }

  /**
   * Add multiple locations, optionally overriding duplicates
   */
  function addLocations(
    arrLocations: Array<CommonLocation>,
    override = true,
  ): void {
    arrLocations.forEach((newLocation) => {
      const locationExists = allLocations.current.some(
        (location) => location.uuid === newLocation.uuid,
      );
      if (!locationExists) {
        addLocation(newLocation);
      } else if (override) {
        editLocation(newLocation);
      }
    });
  }

  function setCurrentLocation(location: CommonLocation | undefined): void {
    const newLocationId = location?.uuid;
    if (currentLocationId.current !== newLocationId) {
      currentLocationId.current = newLocationId;
      forceUpdate();
    }
  }

  function setSelectedLocation(location: CommonLocation | undefined): void {
    selectedLocation.current = location;
    forceUpdate();
  }

  function editLocation(location: CommonLocation, openAfterEdit = false): void {
    editLocationInt(location, openAfterEdit);
    sendMessage('editLocation', toTsLocation(location));
  }

  function editLocationInt(
    location: CommonLocation,
    openAfterEdit = false,
  ): void {
    dispatch(LocationActions.changeLocation(location));
    if (openAfterEdit) {
      currentLocationId.current = location.uuid;
      // check if location uuid is changed
      if (
        location.newuuid !== undefined &&
        location.newuuid !== location.uuid
      ) {
        openLocation({ ...location, uuid: location.newuuid });
      } else {
        openLocation(location);
      }
    }
  }

  function getFirstRWLocation(): CommonLocation | undefined {
    return getFirstReadWriteLocation(allLocations.current);
  }

  const persistTagsInSidecarFile = useMemo(() => {
    const location = findLocation();
    if (location?.persistTagsInSidecarFile !== undefined) {
      return location.persistTagsInSidecarFile;
    }
    return settingsPersistTagsInSidecarFile;
  }, [currentLocationId.current, settingsPersistTagsInSidecarFile]);

  function changeLocation(
    location: CommonLocation,
    skipInitDirList = false,
  ): void {
    if (!location) return;
    skipInitialDirList.current = skipInitDirList;
    if (
      !currentLocationId.current ||
      location.uuid !== currentLocationId.current
    ) {
      if (location.name) {
        document.title = `${location.name} | ${versionMeta.name}`;
      }
      setCurrentLocation(location);
    }
  }

  function changeLocationByID(locationId: string): void {
    if (
      !currentLocationId.current ||
      locationId !== currentLocationId.current
    ) {
      const location = findLocation(locationId);
      if (location) {
        setCurrentLocation(location);
      }
    }
  }

  function openLocationById(
    locationId: string,
    skipInitDirList?: boolean,
  ): void {
    const location = findLocation(locationId);
    if (location) {
      openLocation(location, skipInitDirList);
    }
  }

  function openLocation(
    location: CommonLocation,
    skipInitDirList = false,
  ): void {
    if (location.type === locationType.TYPE_CLOUD) {
      showNotification(
        t('core:connectedtoObjectStore') as string,
        'default',
        true,
      );
    }
    changeLocation(location, skipInitDirList);
  }

  function closeLocation(locationId: string): void {
    if (currentLocationId.current === locationId) {
      setCurrentLocation(undefined);
      clearAllURLParams();
      document.title = versionMeta.name;
    }
  }

  function closeAllLocations(): void {
    setCurrentLocation(undefined);
    clearAllURLParams();
    document.title = versionMeta.name;
  }

  function getLocationPosition(locationId: string): number {
    return getLocationPositionByUUID(allLocations.current, locationId);
  }

  const context = useMemo(
    () => ({
      locations: allLocations.current,
      currentLocation,
      currentLocationId: currentLocationId.current,
      skipInitialDirList: skipInitialDirList.current,
      persistTagsInSidecarFile,
      getLocationPath,
      findLocation,
      getDirSeparator,
      findLocalLocation,
      changeLocation,
      addLocation,
      addLocations,
      deleteLocation,
      moveLocationUp,
      moveLocationDown,
      moveLocation,
      editLocation,
      openLocation,
      closeLocation,
      closeAllLocations,
      changeLocationByID,
      openLocationById,
      selectedLocation: selectedLocation.current,
      setSelectedLocation,
      locationDirectoryContextMenuAnchorEl,
      setLocationDirectoryContextMenuAnchorEl,
      getLocationPosition,
      getFirstRWLocation,
    }),
    [
      allLocations.current,
      currentLocationId.current,
      selectedLocation.current,
      persistTagsInSidecarFile,
      skipInitialDirList.current,
      locationDirectoryContextMenuAnchorEl,
    ],
  );

  return (
    <CurrentLocationContext.Provider value={context}>
      {children}
    </CurrentLocationContext.Provider>
  );
};
