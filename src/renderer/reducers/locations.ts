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

import {
  immutablySwapItems,
  locationType,
} from '@tagspaces/tagspaces-common/misc';
import { actions as AppActions } from '-/reducers/app';
import PlatformIO from '-/services/platform-facade';
import { TS } from '-/tagspaces.namespace';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';

/* import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

type State = Array<TS.Location>;
export type LocationsDispatch = ThunkDispatch<State, any, AnyAction>;
  */
export const types = {
  ADD_LOCATION: 'APP/ADD_LOCATION',
  MOVE_LOCATION: 'APP/MOVE_LOCATION',
  MOVE_UP_LOCATION: 'APP/MOVE_UP_LOCATION',
  MOVE_DOWN_LOCATION: 'APP/MOVE_DOWN_LOCATION',
  EDIT_LOCATION: 'APP/EDIT_LOCATION',
  REMOVE_LOCATION: 'APP/REMOVE_LOCATION',
};

export const initialState = [];

export default (state: Array<TS.Location> = initialState, action: any) => {
  switch (action.type) {
    case types.ADD_LOCATION: {
      const locations = action.location.isDefault
        ? state.map((location) => ({ ...location, isDefault: false }))
        : [...state];

      const newLocation = {
        ...action.location,
        uuid: action.location.uuid || getUuid(),
        creationDate: new Date().toJSON(),
      };
      if (action.locationPosition) {
        locations.splice(action.locationPosition, 0, newLocation);
        return locations;
      } else {
        locations.push(newLocation);
        return locations;
      }
    }
    case types.EDIT_LOCATION: {
      let indexForEditing = -1;
      state.forEach((location, index) => {
        if (location.uuid === action.location.uuid) {
          indexForEditing = index;
        }
        if (action.location.isDefault) {
          // eslint-disable-next-line no-param-reassign
          location.isDefault = false;
        }
      });
      if (indexForEditing >= 0) {
        return [
          ...state.slice(0, indexForEditing),
          {
            ...state[indexForEditing],
            ...action.location,
            uuid:
              action.location.newuuid !== undefined
                ? action.location.newuuid
                : action.location.uuid,
            persistTagsInSidecarFile: action.location.persistTagsInSidecarFile,
          },
          ...state.slice(indexForEditing + 1),
        ];
      }
      return state;
    }
    case types.MOVE_LOCATION: {
      let indexForUpdating = -1;
      state.forEach((location, index) => {
        if (location.uuid === action.uuid) {
          indexForUpdating = index;
        }
      });
      if (indexForUpdating > -1) {
        const locations = Array.from(state);
        const [removed] = locations.splice(indexForUpdating, 1);
        locations.splice(action.position, 0, removed);
        return locations;
      }
      return state;
    }
    case types.MOVE_UP_LOCATION: {
      let indexForUpdating = -1;
      state.forEach((location, index) => {
        if (location.uuid === action.uuid) {
          indexForUpdating = index;
        }
      });
      if (indexForUpdating > 0) {
        const secondIndex = indexForUpdating - 1;
        return immutablySwapItems(state, indexForUpdating, secondIndex);
      }
      return state;
    }
    case types.MOVE_DOWN_LOCATION: {
      let indexForUpdating = -1;
      state.forEach((location, index) => {
        if (location.uuid === action.uuid) {
          indexForUpdating = index;
        }
      });
      if (indexForUpdating >= 0 && indexForUpdating < state.length - 1) {
        const secondIndex = indexForUpdating + 1;
        return immutablySwapItems(state, indexForUpdating, secondIndex);
      }
      return state;
    }
    case types.REMOVE_LOCATION: {
      let indexForRemoving = -1;
      state.forEach((location, index) => {
        if (location.uuid === action.location.uuid) {
          indexForRemoving = index;
        }
      });
      if (indexForRemoving >= 0) {
        return [
          ...state.slice(0, indexForRemoving),
          ...state.slice(indexForRemoving + 1),
        ];
        // return state.filter( (item, index) => index !== indexForRemoving);
      }
      return state;
    }
    default: {
      return state;
    }
  }
};

export const actions = {
  createLocation: (
    location: TS.Location,
    locationPosition: number = undefined,
  ) => ({
    type: types.ADD_LOCATION,
    location,
    locationPosition,
  }),
  moveLocation: (uuid: string, position: number) => ({
    type: types.MOVE_LOCATION,
    uuid,
    position,
  }),
  moveLocationUp: (uuid: string) => ({ type: types.MOVE_UP_LOCATION, uuid }),
  moveLocationDown: (uuid: string) => ({
    type: types.MOVE_DOWN_LOCATION,
    uuid,
  }),
  /*editLocation: (location: TS.Location, openAfterEdit = true) => (
    dispatch: (actions: Object) => void
  ) => {
    dispatch(actions.changeLocation(location));
    if (PlatformIO.haveObjectStoreSupport()) {
      // disableObjectStoreSupport to revoke objectStoreAPI cached object
      PlatformIO.disableObjectStoreSupport();
    }
    if (PlatformIO.haveWebDavSupport()) {
      // disableWebdavSupport to revoke cached object
      PlatformIO.disableWebdavSupport();
    }
    if (openAfterEdit) {
      /!**
       * check if location uuid is changed
       *!/
      if (
        location.newuuid !== undefined &&
        location.newuuid !== location.uuid
      ) {
        dispatch(
          AppActions.openLocation({ ...location, uuid: location.newuuid })
        );
      } else {
        dispatch(AppActions.openLocation(location));
      }
      dispatch(AppActions.setReadOnlyMode(location.isReadOnly || false));
    }
  },*/
  /*switchLocationType: (locationId: string) => (
    dispatch: (actions) => Promise<string | null>,
    getState: () => any
  ): Promise<string | null> => {
    const { locations } = getState();
    const location: TS.Location = locations.find(
      location => location.uuid === locationId
    );
    if (location) {
      return dispatch(AppActions.switchLocationType(location));
    }
    return Promise.resolve(null);
  },*/
  changeLocation: (location: TS.Location) => ({
    type: types.EDIT_LOCATION,
    location,
  }),
  /*removeLocation: (location: TS.Location) => (
    dispatch: (actions: Object) => void
  ) => {
    //dispatch(AppActions.closeLocation(location.uuid));
    dispatch(actions.deleteLocation(location));
  },*/
  deleteLocation: (location: TS.Location) => ({
    type: types.REMOVE_LOCATION,
    location,
  }),
};

// Selectors
export const getLocations = (state: any): Array<TS.Location> => state.locations;
export const getLocation = (
  state: any,
  locationId: string,
): TS.Location | null =>
  state.locations.find((location) => location.uuid === locationId);
/*export const getLocationPosition = (state: any, locationId: string): number =>
  state.locations.findIndex(location => location.uuid === locationId);*/
export const getLocationByPath = (
  state: any,
  path: string,
): TS.Location | null =>
  state.locations.find((location) => location.path === path);
export const getDefaultLocationId = (state: any): string | undefined => {
  let foundLocation = state.locations.find((location) => location.isDefault);
  return foundLocation ? foundLocation.uuid : undefined;
};
/*export const getCurrentLocation = (state: any): TS.Location | undefined => {
  let foundLocation = state.locations.find(
    location => location.uuid === state.app.currentLocationId
  );
  return foundLocation ? foundLocation : undefined;
};*/
export const getFirstRWLocation = (state: any): TS.Location | undefined => {
  let foundLocation = state.locations.find(
    (location) => location.isDefault && !location.isReadOnly,
  );
  if (!foundLocation) {
    foundLocation = state.locations.find((location) => !location.isReadOnly);
  }
  return foundLocation;
};
