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

import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import { useTranslation } from 'react-i18next';
import {
  actions as LocationActions,
  getDefaultLocationId,
  getLocations
} from '-/reducers/locations';
import PlatformIO from '-/services/platform-facade';
import { setLocationType } from '-/services/utils-io';
import { PerspectiveIDs } from '-/perspectives';
import { clearAllURLParams, getURLParameter } from '-/utils/dom';

import { actions as LocationIndexActions } from '-/reducers/location-index';
import { Pro } from '-/pro';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';

type CurrentLocationContextData = {
  currentLocation: TS.Location;
  isReadOnlyMode: () => boolean;
  changeLocation: (location: TS.Location) => void;
  editLocation: (location: TS.Location, openAfterEdit?: boolean) => void;
  addLocation: (
    location: TS.Location,
    openAfterCreate?: boolean,
    locationPosition?: number
  ) => void;
  addLocations: (arrLocations: Array<TS.Location>, override?: boolean) => void;
  openLocation: (location: TS.Location, skipInitialDirList?: boolean) => void;
  closeLocation: (locationId: string) => void;
  closeAllLocations: () => void;
  switchCurrentLocationType: () => Promise<boolean>;
  switchLocationTypeByID: (locationId: string) => Promise<boolean>;
  changeLocationByID: (locationId: string) => void;
  openLocationById: (locationId: string, skipInitialDirList?: boolean) => void;
};

export const CurrentLocationContext = createContext<CurrentLocationContextData>(
  {
    currentLocation: undefined,
    isReadOnlyMode: () => false,
    changeLocation: () => {},
    editLocation: () => {},
    addLocation: () => {},
    addLocations: () => {},
    openLocation: () => {},
    closeLocation: () => {},
    closeAllLocations: () => {},
    switchCurrentLocationType: () => Promise.resolve(false),
    switchLocationTypeByID: () => Promise.resolve(false),
    changeLocationByID: () => {},
    openLocationById: () => {}
  }
);

export type CurrentLocationContextProviderProps = {
  children: React.ReactNode;
};

export const CurrentLocationContextProvider = ({
  children
}: CurrentLocationContextProviderProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { t } = useTranslation();

  const [currentLocation, setCurrentLocation] = useState<TS.Location>(
    undefined
  );
  const locations: TS.Location[] = useSelector(getLocations);
  const defaultLocationId = useSelector(getDefaultLocationId);

  useEffect(() => {
    if (!currentLocation && defaultLocationId && defaultLocationId.length > 0) {
      const openDefaultLocation =
        !getURLParameter('tslid') &&
        !getURLParameter('tsdpath') &&
        !getURLParameter('tsepath') &&
        !getURLParameter('cmdopen');
      if (openDefaultLocation) {
        openLocationById(defaultLocationId);
      }
    }
  }, []);

  useEffect(() => {
    if (locations.length < 1) {
      // init locations
      setDefaultLocations();
    } else {
      // check if current location exist (or is removed)
      if (currentLocation) {
        const location = locations.find(
          location => location.uuid === currentLocation.uuid
        );
        if (!location) {
          closeLocation(currentLocation.uuid);
        }
      }
    }
  }, [locations]);

  function setDefaultLocations() {
    PlatformIO.getDevicePaths()
      .then(devicePaths => {
        if (devicePaths) {
          Object.keys(devicePaths).forEach(key => {
            addLocation(
              {
                uuid: getUuid(),
                type: locationType.TYPE_LOCAL,
                name: t(('core:' + key) as any) as string,
                path: devicePaths[key] as string,
                isDefault: false, // AppConfig.isWeb && devicePaths[key] === '/files/', // Used for the web ts demo
                isReadOnly: false,
                disableIndexing: false
              },
              false
            );
          });
        }
        return true;
      })
      .catch(ex => console.error(ex));
  }

  function addLocation(
    location: TS.Location,
    openAfterCreate = true,
    locationPosition: number = undefined
  ) {
    dispatch(LocationActions.createLocation(location, locationPosition));
    if (openAfterCreate) {
      openLocation(location);
    }
  }
  /**
   * @param arrLocations
   * @param override = true - if location exist override else skip
   */
  function addLocations(arrLocations: Array<TS.Location>, override = true) {
    arrLocations.forEach((newLocation: TS.Location, idx, array) => {
      const locationExist: boolean = locations.some(
        location => location.uuid === newLocation.uuid
      );
      const isLast = idx === array.length - 1;
      if (!locationExist) {
        addLocation(newLocation, isLast);
      } else if (override) {
        editLocation(newLocation, isLast);
      }
    });
  }

  function editLocation(location: TS.Location, openAfterEdit = true) {
    dispatch(LocationActions.changeLocation(location));
    if (PlatformIO.haveObjectStoreSupport()) {
      // disableObjectStoreSupport to revoke objectStoreAPI cached object
      PlatformIO.disableObjectStoreSupport();
    }
    if (PlatformIO.haveWebDavSupport()) {
      // disableWebdavSupport to revoke cached object
      PlatformIO.disableWebdavSupport();
    }
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
      // dispatch(AppActions.setReadOnlyMode(location.isReadOnly || false));
    }
  }

  function isReadOnlyMode() {
    return currentLocation && currentLocation.isReadOnly;
  }

  function changeLocation(location: TS.Location) {
    if (!currentLocation || location.uuid !== currentLocation.uuid) {
      // dispatch(actions.exitSearchMode());
      dispatch(LocationIndexActions.clearDirectoryIndex());
      setCurrentLocation(location);
    }
  }

  function changeLocationByID(locationId: string) {
    if (!currentLocation || locationId !== currentLocation.uuid) {
      dispatch(LocationIndexActions.clearDirectoryIndex());
      const location = locations.find(location => location.uuid === locationId);
      if (location) {
        setCurrentLocation(location);
      }
    }
  }

  function switchLocationTypeByID(locationId: string) {
    const location = locations.find(location => location.uuid === locationId);
    return switchLocationType(location);
  }

  /**
   * @param location
   * return Promise<currentLocationId> if location is changed or null if location and type is changed
   */
  function switchLocationType(location: TS.Location) {
    if (currentLocation === undefined) {
      return setLocationType(location).then(() => null);
    }
    if (location.uuid !== currentLocation.uuid) {
      if (location.type !== currentLocation.type) {
        return setLocationType(location).then(() => null);
      } else {
        // handle the same location type but different location
        // dispatch(actions.setCurrentLocationId(location.uuid));
        return setLocationType(location).then(() => currentLocation.uuid);
      }
    }
    return Promise.resolve(null);
  }

  function switchCurrentLocationType() {
    return setLocationType(currentLocation);
  }

  function openLocationById(locationId: string, skipInitialDirList?: boolean) {
    const location = locations.find(location => location.uuid === locationId);
    if (location) {
      openLocation(location, skipInitialDirList);
    }
  }

  function openLocation(location: TS.Location, skipInitialDirList?: boolean) {
    if (Pro && Pro.Watcher) {
      Pro.Watcher.stopWatching();
    }
    if (location.type === locationType.TYPE_CLOUD) {
      PlatformIO.enableObjectStoreSupport(location)
        .then(() => {
          dispatch(
            AppActions.showNotification(
              t('core:connectedtoObjectStore' as any) as string,
              'default',
              true
            )
          );
          //dispatch(AppActions.setReadOnlyMode(location.isReadOnly || false));
          changeLocation(location);
          /*if (!skipInitialDirList) {
            loadDirectoryContent(
              PlatformIO.getLocationPath(location),
              false,
              true
            );
          }*/
          return true;
        })
        .catch(e => {
          console.log('connectedtoObjectStoreFailed', e);
          dispatch(
            AppActions.showNotification(
              t('core:connectedtoObjectStoreFailed' as any) as string,
              'warning',
              true
            )
          );
          PlatformIO.disableObjectStoreSupport();
        });
    } else {
      if (location.type === locationType.TYPE_WEBDAV) {
        PlatformIO.enableWebdavSupport(location);
      } else {
        PlatformIO.disableObjectStoreSupport();
        PlatformIO.disableWebdavSupport();
      }
      //dispatch(AppActions.setReadOnlyMode(location.isReadOnly || false));
      changeLocation(location);
      /*if (!skipInitialDirList) {
        loadDirectoryContent(PlatformIO.getLocationPath(location), true, true);
      }*/
      // watchForChanges(location);
    }
  }

  function closeLocation(locationId: string) {
    if (currentLocation && currentLocation.uuid === locationId) {
      locations.map(location => {
        if (location.uuid === locationId) {
          // location needed evtl. to unwatch many loc. root folders if available
          setCurrentLocation(undefined);
          dispatch(LocationIndexActions.clearDirectoryIndex());
          dispatch(AppActions.setSelectedEntries([]));
          dispatch(AppActions.exitSearchMode());
        }
        clearAllURLParams();
        return true;
      });
    }
  }

  function closeAllLocations() {
    // location needed evtl. to unwatch many loc. root folders if available
    setCurrentLocation(undefined);
    dispatch(LocationIndexActions.clearDirectoryIndex());
    dispatch(AppActions.setSelectedEntries([]));
    clearAllURLParams();
    return true;
  }

  function isCurrentLocation(uuid: string) {
    return currentLocation && currentLocation.uuid === uuid;
  }

  const context = useMemo(() => {
    return {
      currentLocation,
      isReadOnlyMode,
      changeLocation,
      addLocation,
      addLocations,
      editLocation,
      openLocation,
      closeLocation,
      closeAllLocations,
      switchCurrentLocationType,
      switchLocationTypeByID,
      changeLocationByID,
      openLocationById
    };
  }, [currentLocation]);

  return (
    <CurrentLocationContext.Provider value={context}>
      {children}
    </CurrentLocationContext.Provider>
  );
};
