/* eslint-disable compat/compat */
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

import AppConfig from '-/AppConfig';
import { TS } from '-/tagspaces.namespace';
import {
  searchLocationIndex,
  haveSearchFilters as _haveSearchFilters,
  defaultTitle as _defaultTitle,
} from '@tagspaces/tagspaces-search';

export function haveSearchFilters(searchQuery: TS.SearchQuery) {
  // The library compares fileTypes with the "any" group by reference, but
  // the queries here carry copies of it — which would count "any type" as
  // an active filter (e.g. an auto-run searching with nothing but the
  // defaults after the last chip was removed).
  const fileTypes = searchQuery?.fileTypes;
  const isAnyType =
    Array.isArray(fileTypes) &&
    JSON.stringify(fileTypes) ===
      JSON.stringify(AppConfig.SearchTypeGroups?.any);
  return _haveSearchFilters(
    isAnyType ? { ...searchQuery, fileTypes: undefined } : searchQuery,
  );
}

export function defaultTitle(searchQuery: TS.SearchQuery) {
  return _defaultTitle(searchQuery);
}

export default class Search {
  static searchLocationIndex = (
    locationContent: Array<TS.FileSystemEntry>,
    searchQuery: TS.SearchQuery,
    tagDelimiter: string,
    options?: {
      fuseInstance?: any;
      preparedIndex?: any[];
    },
  ): Promise<TS.FileSystemEntry[]> =>
    searchLocationIndex(locationContent, searchQuery, tagDelimiter, options);
}
