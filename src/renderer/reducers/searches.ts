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

import { TS } from '-/tagspaces.namespace';
import { immutablySwapItems } from '@tagspaces/tagspaces-common/misc';

export const initialState = [];

export const types = {
  ADD_SEARCH: 'SEARCH/ADD_SEARCH',
  EDIT_SEARCH: 'SEARCH/EDIT_SEARCH',
  MOVE_UP_SEARCH: 'SEARCH/MOVE_UP_SEARCH',
  MOVE_DOWN_SEARCH: 'SEARCH/MOVE_DOWN_SEARCH',
  REMOVE_SEARCH: 'SEARCH/REMOVE_SEARCH',
};

export default (state: Array<TS.SearchQuery> = initialState, action: any) => {
  switch (action.type) {
    case types.ADD_SEARCH: {
      const { maxSearchResults, ...search } = action.search;
      return [
        ...state,
        {
          ...search,
          // creationDate: new Date().getTime()
        },
      ];
    }
    case types.EDIT_SEARCH: {
      const indexForEditing = state.findIndex(
        (search) => search.uuid === action.search.uuid,
      );

      if (indexForEditing >= 0) {
        return [
          ...state.slice(0, indexForEditing),
          {
            // ...state[indexForEditing],
            ...action.search,
          },
          ...state.slice(indexForEditing + 1),
        ];
      }
      return state;
    }
    case types.MOVE_UP_SEARCH: {
      const indexForUpdating = state.findIndex(
        (search) => search.uuid === action.uuid,
      );

      if (indexForUpdating > 0) {
        const secondIndex = indexForUpdating - 1;
        return immutablySwapItems(state, indexForUpdating, secondIndex);
      }
      return state;
    }
    case types.MOVE_DOWN_SEARCH: {
      const indexForUpdating = state.findIndex(
        (search) => search.uuid === action.uuid,
      );

      if (indexForUpdating >= 0 && indexForUpdating < state.length - 1) {
        const secondIndex = indexForUpdating + 1;
        return immutablySwapItems(state, indexForUpdating, secondIndex);
      }
      return state;
    }
    case types.REMOVE_SEARCH: {
      const indexForRemoving = state.findIndex(
        (search) => search.uuid === action.uuid,
      );

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

// Selectors
export const getSearches = (state: any): Array<TS.SearchQuery> =>
  state.searches;
