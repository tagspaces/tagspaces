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
/* global TagSpaces */
/* eslint no-undef: "error" */
import uuidv1 from 'uuid';
import { immutablySwapItems } from '-/utils/misc';
import { actions as AppActions } from '-/reducers/app';
import i18n from '-/services/i18n';
import PlatformIO from '-/services/platform-io';
import AppConfig from '-/config';

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
  TYPE_AMPLIFY: '2'
};

/* export type Location = {
  uuid: string;
  newuuid?: string;
  name: string;
  type: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  bucketName?: string;
  region?: string;
  paths?: Array<string>; // deprecated
  path?: string;
  endpointURL?: string;
  children?: Array<any>;
  perspective?: string; // id of the perspective
  creationDate?: string;
  isDefault: boolean;
  isReadOnly?: boolean;
  isNotEditable?: boolean;
  watchForChanges?: boolean;
  persistIndex?: boolean;
  fullTextIndex?: boolean;
  maxIndexAge?: number;
}; */

export const initialState = [];

export default (
  state: Array<TagSpaces.Location> = initialState,
  action: any
) => {
  switch (action.type) {
    case types.ADD_LOCATION: {
      if (action.location.isDefault) {
        state.forEach(location => {
          // eslint-disable-next-line no-param-reassign
          location.isDefault = false;
        });
      }
      return [
        ...state,
        {
          ...action.location,
          uuid: action.location.uuid || uuidv1(),
          creationDate: new Date().toJSON()
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
                : action.location.uuid
          },
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
  setDefaultLocations: () => (dispatch: (actions: Object) => void) => {
    const devicePaths = PlatformIO.getDevicePaths();

    Object.keys(devicePaths).forEach(key => {
      dispatch(
        actions.addLocation(
          {
            uuid: uuidv1(),
            type: locationType.TYPE_LOCAL,
            name: i18n.t(key),
            path: devicePaths[key],
            isDefault: AppConfig.isWeb && devicePaths[key] === '/files/', // Used for the web ts demo
            isReadOnly: false,
            persistIndex: false
          },
          false
        )
      );
    });
  },
  addLocation: (
    location: TagSpaces.Location,
    openAfterCreate: boolean = true
  ) => (dispatch: (actions: Object) => void) => {
    dispatch(actions.createLocation(location));
    if (openAfterCreate) {
      dispatch(AppActions.openLocation(location));
    }
  },
  /**
   * @param arrLocations
   * @param override = true - if location exist override else skip
   */
  addLocations: (
    arrLocations: Array<TagSpaces.Location>,
    override: boolean = true
  ) => (dispatch: (actions: Object) => void, getState: () => any) => {
    arrLocations.forEach((newLocation: TagSpaces.Location, idx, array) => {
      const { locations } = getState();
      const locationExist: boolean = locations.some(
        location => location.uuid === newLocation.uuid
      );
      const isLast = idx === array.length - 1;
      if (!locationExist) {
        dispatch(actions.addLocation(newLocation, isLast));
      } else if (override) {
        dispatch(actions.editLocation(newLocation, isLast));
      }
    });
  },
  createLocation: (location: TagSpaces.Location) => ({
    type: types.ADD_LOCATION,
    location
  }),
  moveLocationUp: (uuid: string) => ({ type: types.MOVE_UP_LOCATION, uuid }),
  moveLocationDown: (uuid: string) => ({
    type: types.MOVE_DOWN_LOCATION,
    uuid
  }),
  editLocation: (
    location: TagSpaces.Location,
    openAfterEdit: boolean = true
  ) => (dispatch: (actions: Object) => void) => {
    dispatch(actions.changeLocation(location));
    if (PlatformIO.haveObjectStoreSupport()) {
      // disableObjectStoreSupport to revoke objectStoreAPI cached object
      PlatformIO.disableObjectStoreSupport();
    }
    if (openAfterEdit) {
      /**
       * check if location uuid is changed
       */
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
  },
  changeLocation: (location: TagSpaces.Location) => ({
    type: types.EDIT_LOCATION,
    location
  }),
  removeLocation: (location: TagSpaces.Location) => (
    dispatch: (actions: Object) => void
  ) => {
    dispatch(AppActions.closeLocation(location.uuid));
    dispatch(actions.deleteLocation(location));
  },
  deleteLocation: (location: TagSpaces.Location) => ({
    type: types.REMOVE_LOCATION,
    location
  })
};

// Selectors
export const getLocations = (state: any): Array<TagSpaces.Location> =>
  state.locations;
export const getLocation = (
  state: any,
  locationId: string
): TagSpaces.Location | null =>
  state.locations.find(location => location.uuid === locationId);
export const getDefaultLocationId = (state: any): string | undefined => {
  let defaultLocationID;
  state.locations.map(location => {
    if (location.isDefault) {
      defaultLocationID = location.uuid;
    }
    return true;
  });
  return defaultLocationID;
};
