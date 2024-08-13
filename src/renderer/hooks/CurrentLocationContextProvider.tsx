/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces UG (haftungsbeschraenkt)
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

import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '-/reducers/app';
import { useTranslation } from 'react-i18next';
import {
  actions as LocationActions,
  getDefaultLocationId,
  getLocations,
} from '-/reducers/locations';
import { clearAllURLParams, getURLParameter } from '-/utils/dom';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { getPersistTagsInSidecarFile } from '-/reducers/settings';
import AppConfig from '../AppConfig';
import versionMeta from '-/version.json';
import { CommonLocation } from '-/utils/CommonLocation';
import { getDevicePaths, toTsLocation } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';

type CurrentLocationContextData = {
  locations: CommonLocation[];
  currentLocation: CommonLocation;
  readOnlyMode: boolean;
  skipInitialDirList: boolean;
  persistTagsInSidecarFile: boolean;
  getLocationPath: (location: CommonLocation) => Promise<string>;
  findLocation: (locationID: string) => CommonLocation;
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
    readOnlyMode: false,
    skipInitialDirList: false,
    persistTagsInSidecarFile: true,
    getLocationPath: undefined,
    findLocation: undefined,
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

  const locations: CommonLocation[] = useSelector(getLocations);
  const defaultLocationId = useSelector(getDefaultLocationId);
  const settingsPersistTagsInSidecarFile: boolean = useSelector(
    getPersistTagsInSidecarFile,
  );

  const allLocations = useRef<CommonLocation[]>(locations);
  const currentLocation = useRef<string>(defaultLocationId);
  const selectedLocation = useRef<CommonLocation>(undefined);
  const skipInitialDirList = useRef<boolean>(false);
  const initLocations = useRef<boolean>(false);
  const [
    locationDirectoryContextMenuAnchorEl,
    setLocationDirectoryContextMenuAnchorEl,
  ] = useState<null | HTMLElement>(null);
  const broadcast = new BroadcastChannel('ts-sync-channel');

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (
      !currentLocation.current &&
      defaultLocationId &&
      defaultLocationId.length > 0
    ) {
      const openDefaultLocation =
        !getURLParameter('tslid') &&
        !getURLParameter('tsdpath') &&
        !getURLParameter('tsepath') &&
        !getURLParameter('cmdopen');
      if (openDefaultLocation) {
        openLocationById(defaultLocationId);
      }
    }
    // Listen for messages from other tabs
    broadcast.onmessage = (event: MessageEvent) => {
      const action = event.data as TS.BroadcastMessage;
      if (action.type === 'addLocation') {
        const location = action.payload as TS.Location;
        addLocationInt(new CommonLocation(location));
      } else if (action.type === 'editLocation') {
        const location = action.payload as TS.Location;
        editLocationInt(new CommonLocation(location));
      } else if (action.type === 'deleteLocation') {
        deleteLocationInt(action.payload);
      } else if (action.type === 'moveLocationUp') {
        moveLocationUpInt(action.payload);
        forceUpdate();
      } else if (action.type === 'moveLocationDown') {
        moveLocationDownInt(action.payload);
        forceUpdate();
      }
    };
  }, []);

  useEffect(() => {
    if (allLocations.current.length < 1) {
      // init locations
      setDefaultLocations();
    } else {
      // check if current location exist (or is removed)
      if (currentLocation.current) {
        const location = allLocations.current.find(
          (location) => location.uuid === currentLocation.current,
        );
        if (!location) {
          setCurrentLocation(undefined);
          //closeLocation(currentLocation.current.uuid);
        }
      }
    }
  }, [allLocations.current]);

  function getLocationPath(location: CommonLocation): Promise<string> {
    let locationPath = '';
    if (location) {
      if (location.path) {
        locationPath = location.path;
      }
      if (location.paths && location.paths[0]) {
        // eslint-disable-next-line prefer-destructuring
        locationPath = location.paths[0];
      }

      if (
        locationPath &&
        (locationPath.startsWith('.' + AppConfig.dirSeparator) ||
          locationPath.startsWith('./') ||
          locationPath.startsWith('..' + AppConfig.dirSeparator) ||
          locationPath.startsWith('../')) && // location paths are not with platform dirSeparator
        AppConfig.isElectron
      ) {
        // TODO test relative path (Directory Back) with other platforms
        // relative paths
        return window.electronIO.ipcRenderer.invoke(
          'resolveRelativePaths',
          locationPath,
        );
      }
    }

    return Promise.resolve(locationPath);
  }

  function findLocation(locationID: string = undefined): CommonLocation {
    if (!locationID) {
      locationID = currentLocation.current;
    }
    const loc = allLocations.current.find((l) => l.uuid === locationID);
    if (loc) {
      return loc;
    }
    return undefined;
  }

  function findLocalLocation(): CommonLocation {
    const loc = allLocations.current.find(
      (l) => l.type === locationType.TYPE_LOCAL,
    );
    if (loc) {
      return loc;
    }
    return undefined;
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
              addLocation(location);
            });
          }
          return true;
        })
        .catch((ex) => console.log('Error getDevicePaths:', ex));
    }
  }

  function sendMessage(type: string, payload?: any) {
    const message: TS.BroadcastMessage = { type, payload };
    broadcast.postMessage(message);
  }

  function addLocation(location: CommonLocation) {
    //addLocationInt(location, openAfterCreate, locationPosition);
    sendMessage('addLocation', toTsLocation(location));
  }

  function addLocationInt(
    location: CommonLocation,
    openAfterCreate = true,
    locationPosition: number = undefined,
  ) {
    allLocations.current = [...allLocations.current, location];
    if (openAfterCreate) {
      openLocation(location);
    }
    dispatch(LocationActions.createLocation(location, locationPosition));
  }

  function deleteLocation(locationId: string) {
    //deleteLocationInt(locationId);
    sendMessage('deleteLocation', locationId);
  }

  function deleteLocationInt(locationId: string) {
    allLocations.current = allLocations.current.filter(
      (l) => l.uuid !== locationId,
    );
    dispatch(LocationActions.deleteLocation(locationId));
    forceUpdate();
  }

  function moveLocationUp(locationUUID) {
    //moveLocationUpInt(locationUUID);
    sendMessage('moveLocationUp', locationUUID);
  }

  function moveLocationUpInt(locationUUID) {
    const currentIndex = allLocations.current.findIndex(
      (l) => l.uuid === locationUUID,
    );

    // If location is not found or is already at the top, do nothing
    if (currentIndex <= 0) {
      return;
    }

    // Create a copy of the array
    const newArray = [...allLocations.current];

    // Swap the location with the one above it
    const temp = newArray[currentIndex];
    newArray[currentIndex] = newArray[currentIndex - 1];
    newArray[currentIndex - 1] = temp;

    allLocations.current = newArray;
    dispatch(LocationActions.moveLocationUp(locationUUID));
  }

  function moveLocationDown(locationUUID) {
    //moveLocationDownInt(locationUUID);
    sendMessage('moveLocationDown', locationUUID);
  }

  function moveLocationDownInt(locationUUID) {
    const currentIndex = allLocations.current.findIndex(
      (l) => l.uuid === locationUUID,
    );

    // If location is not found or is already at the bottom, return the original array
    if (
      currentIndex === -1 ||
      currentIndex >= allLocations.current.length - 1
    ) {
      return;
    }

    // Create a copy of the array
    const newArray = [...allLocations.current];

    // Swap the location with the one below it
    const temp = newArray[currentIndex];
    newArray[currentIndex] = newArray[currentIndex + 1];
    newArray[currentIndex + 1] = temp;

    allLocations.current = newArray;
    dispatch(LocationActions.moveLocationDown(locationUUID));
  }

  function moveLocation(locationUUID: string, newIndex: number) {
    // Check if allLocations.current is an array and newIndex is within bounds
    if (
      !Array.isArray(allLocations.current) ||
      newIndex < 0 ||
      newIndex >= allLocations.current.length
    ) {
      throw new Error('Invalid input');
    }

    // Find the index of the location with the given UUID
    const currentIndex = allLocations.current.findIndex(
      (l) => l.uuid === locationUUID,
    );

    // If the location is not found, throw an error
    if (currentIndex === -1) {
      throw new Error('Location not found');
    }

    // Remove the location from its current position
    const [location] = allLocations.current.splice(currentIndex, 1);

    // Insert the location at the specified new index
    allLocations.current.splice(newIndex, 0, location);
    allLocations.current = [...allLocations.current];
    dispatch(LocationActions.moveLocation(locationUUID, newIndex));
  }

  /**
   * @param arrLocations
   * @param override = true - if location exist override else skip
   */
  function addLocations(arrLocations: Array<CommonLocation>, override = true) {
    arrLocations.forEach((newLocation: CommonLocation, idx, array) => {
      const locationExist: boolean = allLocations.current.some(
        (location) => location.uuid === newLocation.uuid,
      );
      //const isLast = idx === array.length - 1;
      if (!locationExist) {
        addLocation(newLocation);
      } else if (override) {
        editLocation(newLocation);
      }
    });
  }

  function setCurrentLocation(location) {
    const newLocationId = location?.uuid;
    if (currentLocation.current !== newLocationId) {
      currentLocation.current = newLocationId;
      forceUpdate();
    }
  }

  function setSelectedLocation(location) {
    selectedLocation.current = location;
    forceUpdate();
  }

  function editLocation(location: CommonLocation) {
    // editLocationInt(location);
    sendMessage('editLocation', toTsLocation(location));
  }

  function editLocationInt(location: CommonLocation, openAfterEdit = false) {
    allLocations.current = allLocations.current.map((l) =>
      l.uuid === location.uuid ? location : l,
    );
    currentLocation.current = location.uuid;
    dispatch(LocationActions.changeLocation(location));
    forceUpdate();
    if (openAfterEdit) {
      /*
       * check if location uuid is changed
       */
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
    let foundLocation = allLocations.current.find(
      (location) => location.isDefault && !location.isReadOnly,
    );
    if (!foundLocation) {
      foundLocation = allLocations.current.find(
        (location) => !location.isReadOnly,
      );
    }
    return foundLocation;
  }

  const location: CommonLocation = useMemo(
    () => findLocation(),
    [currentLocation.current, allLocations.current],
  );

  const readOnlyMode: boolean = useMemo(() => {
    if (location) {
      return location.isReadOnly;
    }
    return false;
  }, [currentLocation.current]);

  const persistTagsInSidecarFile: boolean = useMemo(() => {
    const locationPersistTagsInSidecarFile =
      location && location.persistTagsInSidecarFile;
    if (locationPersistTagsInSidecarFile !== undefined) {
      return locationPersistTagsInSidecarFile;
    }
    return settingsPersistTagsInSidecarFile;
  }, [currentLocation.current, settingsPersistTagsInSidecarFile]);

  function changeLocation(
    location: CommonLocation,
    skipInitDirList: boolean = false,
  ) {
    skipInitialDirList.current = skipInitDirList;
    if (!currentLocation.current || location.uuid !== currentLocation.current) {
      if (location && location.name) {
        document.title = location.name + ' | ' + versionMeta.name;
      }
      setCurrentLocation(location);
    }
  }

  function changeLocationByID(locationId: string) {
    if (!currentLocation.current || locationId !== currentLocation.current) {
      const location = findLocation(locationId);
      if (location) {
        setCurrentLocation(location);
      }
    }
  }

  function openLocationById(locationId: string, skipInitDirList?: boolean) {
    const location = findLocation(locationId);
    if (location) {
      openLocation(location, skipInitDirList);
    }
  }

  function openLocation(
    location: CommonLocation,
    skipInitDirList: boolean = false,
  ) {
    skipInitialDirList.current = skipInitDirList;
    if (location.type === locationType.TYPE_CLOUD) {
      showNotification(
        t('core:connectedtoObjectStore' as any) as string,
        'default',
        true,
      );
    }
    changeLocation(location, skipInitDirList);
  }

  function closeLocation(locationId: string) {
    if (currentLocation.current && currentLocation.current === locationId) {
      locations.map((location) => {
        if (location.uuid === locationId) {
          // location needed evtl. to unwatch many loc. root folders if available
          setCurrentLocation(undefined);
        }
        clearAllURLParams();
        document.title = versionMeta.name;
        return true;
      });
    }
  }

  function closeAllLocations() {
    // location needed evtl. to unwatch many loc. root folders if available
    setCurrentLocation(undefined);
    clearAllURLParams();
    document.title = versionMeta.name;
    return true;
  }

  function getLocationPosition(locationId: string): number {
    return locations.findIndex((location) => location.uuid === locationId);
  }

  function isCurrentLocation(uuid: string) {
    return currentLocation.current && currentLocation.current === uuid;
  }

  const context = useMemo(() => {
    return {
      locations: allLocations.current,
      currentLocation: location,
      readOnlyMode,
      skipInitialDirList: skipInitialDirList.current,
      persistTagsInSidecarFile,
      getLocationPath,
      findLocation,
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
    };
  }, [
    allLocations.current,
    currentLocation.current,
    selectedLocation.current,
    persistTagsInSidecarFile,
    skipInitialDirList.current,
    locationDirectoryContextMenuAnchorEl,
  ]);

  return (
    <CurrentLocationContext.Provider value={context}>
      {children}
    </CurrentLocationContext.Provider>
  );
};
