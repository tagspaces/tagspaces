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
 * @flow
 */

import uuidv1 from 'uuid';
import { immutablySwapItems } from '../utils/misc';
import PlatformIO from '../services/platform-io';
import { actions as AppActions } from '../reducers/app';

export const types = {
  ADD_LOCATION: 'APP/ADD_LOCATION',
  MOVE_UP_LOCATION: 'APP/MOVE_UP_LOCATION',
  MOVE_DOWN_LOCATION: 'APP/MOVE_DOWN_LOCATION',
  EDIT_LOCATION: 'APP/EDIT_LOCATION',
  REMOVE_LOCATION: 'APP/REMOVE_LOCATION'
};

export const locationType = {
  TYPE_LOCAL: '0',
  TYPE_CLOUD: '1',
};

export type Location = {
  uuid: string,
  name: string,
  type: string,
  accessKeyId: string,
  secretAccessKey: string,
  bucketName: string,
  region: string,
  paths: Array<string>,
  perspective?: string, // id of the perspective
  creationDate?: string,
  isDefault: boolean,
  isReadOnly?: boolean,
  watchForChanges?: boolean,
  persistIndex?: boolean
};

export const initialState = [];

const devicePaths = PlatformIO.getDevicePaths();

Object.keys(devicePaths).forEach(key => {
  initialState.push({
    uuid: uuidv1(),
    type: locationType.TYPE_LOCAL,
    name: key, // TODO use i18n
    paths: [devicePaths[key]],
    isDefault: false,
    isReadOnly: false,
    persistIndex: false
  });
});

export default (state: Array<Location> = initialState, action: Object) => {
  switch (action.type) {
  case types.ADD_LOCATION: {
    if (action.location.isDefault) {
      state.forEach((location) => {
        location.isDefault = false;
      });
    }
    return [
      ...state,
      {
        uuid: action.location.uuid || uuidv1(),
        type: action.location.type,
        name: action.location.name,
        paths: action.location.paths,
        accessKeyId: action.location.accessKeyId,
        secretAccessKey: action.location.secretAccessKey,
        bucketName: action.location.bucketName,
        region: action.location.region,
        perspective: action.location.perspective,
        creationDate: new Date().toJSON(),
        isDefault: action.location.isDefault,
        isReadOnly: action.location.isReadOnly,
        persistIndex: action.location.persistIndex,
        watchForChanges: action.location.watchForChanges,
      }
    ];
  }
  case types.EDIT_LOCATION: {
    let indexForEditing = -1;
    state.forEach((location, index) => {
      if (location.uuid === action.location.uuid) {
        indexForEditing = index;
      }
      if (action.location.isDefault) {
        location.isDefault = false;
      }
    });
    if (indexForEditing >= 0) {
      return [
        ...state.slice(0, indexForEditing),
        { ...state[indexForEditing], ...action.location },
        ...state.slice(indexForEditing + 1)
      ];
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
        ...state.slice(indexForRemoving + 1)
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
  addLocation: (location: Location) => (
    dispatch: (actions: Object) => void
  ) => {
    dispatch(actions.createLocation(location));
    dispatch(AppActions.openLocation(location));
  },
  createLocation: (location: Location) => ({ type: types.ADD_LOCATION, location }),
  moveLocationUp: (uuid: string) => ({ type: types.MOVE_UP_LOCATION, uuid }),
  moveLocationDown: (uuid: string) => ({ type: types.MOVE_DOWN_LOCATION, uuid }),
  editLocation: (location: Location) => (
    dispatch: (actions: Object) => void
  ) => {
    dispatch(actions.changeLocation(location));
    dispatch(AppActions.setReadOnlyMode(location.isReadOnly || false));
  },
  changeLocation: (location: Location) => ({
    type: types.EDIT_LOCATION,
    location
  }),
  removeLocation: (location: Location) => (
    dispatch: (actions: Object) => void
  ) => {
    dispatch(AppActions.closeLocation(location.uuid));
    dispatch(actions.deleteLocation(location));
  },
  deleteLocation: (location: Location) => ({
    type: types.REMOVE_LOCATION,
    location
  })
};

// Selectors
export const getLocations = (state: Object): Array<Location> => state.locations;
export const getLocation = (state: Object, locationId: string): Location | null => {
  let foundLocation = null;
  state.locations.map((location) => {
    if (location.uuid === locationId) {
      foundLocation = location;
    }
    return true;
  });
  return foundLocation;
};
export const getDefaultLocationId = (state: Object): ?string => {
  let defaultLocationID;
  state.locations.map((location) => {
    if (location.isDefault) {
      defaultLocationID = location.uuid;
    }
    return true;
  });
  return defaultLocationID;
};
