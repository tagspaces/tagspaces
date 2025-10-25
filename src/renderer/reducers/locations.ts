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

import { toTsLocation } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { immutablySwapItems } from '@tagspaces/tagspaces-common/misc';

export const types = {
  ADD_LOCATION: 'APP/ADD_LOCATION',
  MOVE_LOCATION: 'APP/MOVE_LOCATION',
  MOVE_UP_LOCATION: 'APP/MOVE_UP_LOCATION',
  MOVE_DOWN_LOCATION: 'APP/MOVE_DOWN_LOCATION',
  EDIT_LOCATION: 'APP/EDIT_LOCATION',
  REMOVE_LOCATION: 'APP/REMOVE_LOCATION',
};

export const initialState = [];

export default (state: Array<TS.S3Location> = initialState, action: any) => {
  switch (action.type) {
    case types.ADD_LOCATION: {
      const locations = action.location.isDefault
        ? state.map((location) => ({ ...location, isDefault: false }))
        : [...state];

      const newLocation: TS.S3Location = {
        ...toTsLocation(action.location),
        creationDate: new Date().getTime(),
        lastEditedDate: new Date().getTime(),
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
            // ...state[indexForEditing],
            ...toTsLocation(action.location),
            uuid:
              action.location.newuuid !== undefined
                ? action.location.newuuid
                : action.location.uuid || state[indexForEditing],
            lastEditedDate: new Date().getTime(),
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
        if (location.uuid === action.locationId) {
          indexForRemoving = index;
        }
      });
      if (indexForRemoving >= 0) {
        return [
          ...state.slice(0, indexForRemoving),
          ...state.slice(indexForRemoving + 1),
        ];
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
    location: CommonLocation,
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
  changeLocation: (location: CommonLocation) => ({
    type: types.EDIT_LOCATION,
    location,
  }),
  deleteLocation: (locationId: string) => ({
    type: types.REMOVE_LOCATION,
    locationId,
  }),
};

// Selectors
export const getLocations = (state: any): TS.Location[] => state.locations;
export const getDefaultLocationId = (state: any): string | undefined => {
  let foundLocation = state.locations.find((location) => location.isDefault);
  return foundLocation ? foundLocation.uuid : undefined;
};
