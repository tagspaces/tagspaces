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
import { CloseIcon } from '-/components/CommonIcons';
import {
  ActionType,
  ExecActions,
  ScopeType,
  SearchActions,
  SearchOptionType,
  SearchQueryComposition,
  accuracy,
  findAction,
  isAction,
  scope,
} from '-/components/SearchOptions';
import { getSearchOptions } from '-/components/SearchOptionsMenu';
import Tooltip from '-/components/Tooltip';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsTextField from '-/components/TsTextField';
import { useBrowserHistoryContext } from '-/hooks/useBrowserHistoryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useEditedTagLibraryContext } from '-/hooks/useEditedTagLibraryContext';
import { useHistoryContext } from '-/hooks/useHistoryContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useSavedSearchesContext } from '-/hooks/useSavedSearchesContext';
import { useSearchQueryContext } from '-/hooks/useSearchQueryContext';
import { Pro } from '-/pro';
import {
  getMaxSearchResults,
  getShowUnixHiddenEntries,
  isDesktopMode,
} from '-/reducers/settings';
import { haveSearchFilters } from '-/services/search';
import { dataTidFormat } from '-/services/test';
import { removePrefix } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import useFirstRender from '-/utils/useFirstRender';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AdvancedSearchIcon from '@mui/icons-material/TuneOutlined';
import { Autocomplete, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatFileSize } from '@tagspaces/tagspaces-common/misc';
import { format, formatDistanceToNow } from 'date-fns';
import Fuse from 'fuse.js';
import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { actions as AppActions, AppDispatch } from '../reducers/app';

interface Props {
  style?: any;
  //open: boolean;
  setAnchorSearch: (el: HTMLButtonElement) => void;
}

function SearchAutocomplete(props: Props) {
  const { t } = useTranslation();
  const desktopMode = useSelector(isDesktopMode);
  const theme = useTheme();
  const { openLink } = useOpenedEntryContext();
  const { locations, currentLocationId, changeLocationByID, openLocationById } =
    useCurrentLocationContext();
  const {
    currentDirectoryPath,
    exitSearchMode,
    openCurrentDirectory,
    searchQuery,
    setSearchQuery,
    isSearchMode,
  } = useDirectoryContentContext();
  const { tempSearchQuery, setTempSearchQuery } = useSearchQueryContext();
  const { openHistoryItem } = useBrowserHistoryContext();
  const { tagGroups } = useEditedTagLibraryContext();
  const { isIndexing, searchAllLocations, searchLocationIndex } =
    useLocationIndexContext();
  const { searches } = useSavedSearchesContext();
  const { fileOpenHistory, fileEditHistory, folderOpenHistory, searchHistory } =
    useHistoryContext();

  const bookmarksContext = Pro?.contextProviders?.BookmarksContext
    ? useContext<TS.BookmarksContextData>(Pro.contextProviders.BookmarksContext)
    : undefined;
  const dispatch: AppDispatch = useDispatch();
  const maxSearchResults = useSelector(getMaxSearchResults);
  const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);

  const openLinkDispatch = (link, options) => openLink(link, options);

  const { setAnchorSearch } = props;
  const [openSavedSearches, setOpenSavedSearches] =
    useState<null | HTMLElement>(null);
  const searchOptions = useRef<Array<SearchOptionType>>(getSearchOptions());
  const currentOptions = useRef<string>(undefined);
  const fileTypes = useRef<Array<string>>(
    searchQuery.fileTypes
      ? searchQuery.fileTypes
      : AppConfig.SearchTypeGroups.any,
  );
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const actionValues = useRef<Array<SearchOptionType>>([]);
  const [searchBoxing, setSearchBoxing] = useState<ScopeType>(
    searchQuery.searchBoxing || scope.location,
  );

  const searchType = useRef<'fuzzy' | 'semistrict' | 'strict'>(
    searchQuery.searchType ? searchQuery.searchType : 'fuzzy',
  );
  const lastModified = useRef<string>(
    searchQuery.lastModified ? searchQuery.lastModified : '',
  );
  const dateCreated = useRef<string>(
    searchQuery.dateCreated ? searchQuery.dateCreated : '',
  );
  const tagTimePeriod = useRef<string>('');
  const tagTimePeriodHelper = useRef<string>(' ');
  const tagTimePeriodFrom = useRef<number | null>(
    searchQuery.tagTimePeriodFrom ? searchQuery.tagTimePeriodFrom : null,
  );
  const tagTimePeriodTo = useRef<number | null>(
    searchQuery.tagTimePeriodTo ? searchQuery.tagTimePeriodTo : null,
  );
  const [tagPlaceLat, setTagPlaceLat] = useState<number | null>(null);
  const [tagPlaceLong, setTagPlaceLong] = useState<number | null>(null);
  // const [tagPlaceRadius, setTagPlaceRadius] = useState<number>(0);
  const forceIndexing = useRef<boolean>(
    searchQuery.forceIndexing ? searchQuery.forceIndexing : false,
  );
  const fileSize = useRef<string>(
    searchQuery.fileSize ? searchQuery.fileSize : '',
  );

  // const mainSearchField = useRef<HTMLInputElement>(null);
  const isOpen = useRef<boolean>(true);
  const workSpacesContext = Pro?.contextProviders?.WorkSpacesContext
    ? useContext<TS.WorkSpacesContextData>(
        Pro.contextProviders.WorkSpacesContext,
      )
    : undefined;

  const currentWorkSpace =
    workSpacesContext && workSpacesContext.getCurrentWorkSpace
      ? workSpacesContext?.getCurrentWorkSpace()
      : undefined;

  const firstRender = useFirstRender();

  useEffect(() => {
    if (!firstRender || searchQuery?.executeSearch) {
      processSearchQuery();
    }
  }, [searchQuery]);

  /**
   * todo move in useDirectoryContentContext or create SearchContextProvider
   */
  function processSearchQuery() {
    if (Object.keys(searchQuery).length > 0) {
      let emptySearch = true;
      const actions: SearchOptionType[] = [];

      if (searchQuery.tagsAND && searchQuery.tagsAND.length > 0) {
        searchQuery.tagsAND.forEach((tag) => {
          actions.push({
            action: SearchQueryComposition.TAG_AND.shortName,
            label: SearchQueryComposition.TAG_AND.shortName + tag.title,
            color: tag.color,
            textcolor: tag.textcolor,
          });
        });
        emptySearch = false;
      }
      if (searchQuery.tagsOR && searchQuery.tagsOR.length > 0) {
        searchQuery.tagsOR.forEach((tag) => {
          actions.push({
            action: SearchQueryComposition.TAG_OR.shortName,
            label: SearchQueryComposition.TAG_OR.shortName + tag.title,
            color: tag.color,
            textcolor: tag.textcolor,
          });
        });
        emptySearch = false;
      }
      if (searchQuery.tagsNOT && searchQuery.tagsNOT.length > 0) {
        searchQuery.tagsNOT.forEach((tag) => {
          actions.push({
            action: SearchQueryComposition.TAG_NOT.shortName,
            label: SearchQueryComposition.TAG_NOT.shortName + tag.title,
            color: tag.color,
            textcolor: tag.textcolor,
          });
        });
        emptySearch = false;
      }

      let txtQuery = '';
      if (searchQuery.textQuery) {
        txtQuery = searchQuery.textQuery;
        emptySearch = false;
      } else if (tempSearchQuery && tempSearchQuery.textQuery) {
        txtQuery = tempSearchQuery.textQuery;
        emptySearch = false;
      }

      if (searchQuery.searchBoxing) {
        const sBoxing = !currentLocationId
          ? scope.global
          : searchQuery.searchBoxing;
        setSearchBoxing(sBoxing);
        emptySearch = false;
        actions.push({
          action: SearchQueryComposition.SCOPE.fullName,
          label: SearchQueryComposition.SCOPE.fullName + ' ' + sBoxing,
        });
      }
      if (
        searchQuery.fileTypes &&
        JSON.stringify(searchQuery.fileTypes) !==
          JSON.stringify(AppConfig.SearchTypeGroups.any)
      ) {
        fileTypes.current = searchQuery.fileTypes;
        emptySearch = false;
        let keyFileType;
        Object.entries(AppConfig.SearchTypeGroups).forEach(([key, value]) => {
          if (JSON.stringify(value) === JSON.stringify(searchQuery.fileTypes)) {
            keyFileType = key;
          }
        });
        actions.push({
          action: SearchQueryComposition.TYPE.fullName,
          label:
            SearchQueryComposition.TYPE.fullName +
            ' ' +
            (keyFileType ? t('core:' + keyFileType) : searchQuery.fileTypes),
        });
      }
      if (searchQuery.searchType) {
        searchType.current = searchQuery.searchType;
        emptySearch = false;
        actions.push({
          action: SearchQueryComposition.ACCURACY.fullName,
          label:
            SearchQueryComposition.ACCURACY.fullName +
            ' ' +
            t('core:' + searchQuery.searchType),
        });
      }
      if (searchQuery.lastModified) {
        lastModified.current = searchQuery.lastModified;
        emptySearch = false;
        actions.push({
          action: SearchQueryComposition.LAST_MODIFIED.fullName,
          label:
            SearchQueryComposition.LAST_MODIFIED.fullName +
            ' ' +
            t('core:' + searchQuery.lastModified),
        });
      }
      if (searchQuery.dateCreated) {
        dateCreated.current = searchQuery.dateCreated;
        emptySearch = false;
        actions.push({
          action: SearchQueryComposition.DATE_CREATED.fullName,
          label:
            SearchQueryComposition.DATE_CREATED.fullName +
            ' ' +
            t('core:' + searchQuery.dateCreated),
        });
      }
      if (searchQuery.tagTimePeriodFrom) {
        tagTimePeriodFrom.current = searchQuery.tagTimePeriodFrom;
        emptySearch = false;
      }
      if (searchQuery.tagTimePeriodTo) {
        tagTimePeriodTo.current = searchQuery.tagTimePeriodTo;
        emptySearch = false;
      }
      if (searchQuery.forceIndexing) {
        forceIndexing.current = searchQuery.forceIndexing;
      }
      if (searchQuery.fileSize) {
        fileSize.current = searchQuery.fileSize;
        emptySearch = false;
        actions.push({
          action: SearchQueryComposition.SIZE.fullName,
          label:
            SearchQueryComposition.SIZE.fullName +
            ' ' +
            t('core:' + searchQuery.fileSize),
        });
      }
      if (!emptySearch) {
        if (actions.length > 0) {
          actionValues.current = execActions(
            actions, // todo set tag in actions
            actionValues.current,
            false,
          );
          isOpen.current = false;
          forceUpdate();
        }
        if (searchQuery.executeSearch) {
          const sQuery = {
            ...searchQuery,
            textQuery: txtQuery,
          };
          if (searchBoxing === 'global') {
            searchAllLocations(sQuery, currentWorkSpace);
          } else {
            searchLocationIndex(sQuery);
          }
        }
      }
    }
  }

  const clickSearchButton = () => {
    executeSearch();
  };

  const onKeyDownHandler = (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      if (!isOpen.current) {
        executeSearch();
      } else {
        isOpen.current = false;
        forceUpdate();
      }
    } else if (event.key === 'Escape' || event.keyCode === 27) {
      clearSearch();
    } else if (event.key === 'ArrowDown' || event.keyCode === 40) {
      if (!isOpen.current) {
        isOpen.current = true;
        forceUpdate();
      }
    } else if (event.key === 'Backspace' || event.keyCode === 8) {
      if (
        tempSearchQuery.textQuery.length === 0 &&
        actionValues.current.length > 0
      ) {
        actionValues.current = actionValues.current.slice(0, -1);
        resetActions(actionValues.current);
        isOpen.current = true;
        forceUpdate();
      }
    } else {
      isOpen.current = true;
    }
  };

  function resetValues(exceptions: Array<SearchOptionType>) {
    setTempSearchQuery({ textQuery: '' }, true);
    if (
      !exceptions.some((action) =>
        isAction(action.action, SearchQueryComposition.SCOPE),
      )
    ) {
      setSearchBoxing(scope.location);
    }
    if (
      !exceptions.some((action) =>
        isAction(action.action, SearchQueryComposition.ACCURACY),
      )
    ) {
      searchType.current = 'fuzzy';
    }
    if (
      !exceptions.some((action) =>
        isAction(action.action, SearchQueryComposition.TYPE),
      )
    ) {
      fileTypes.current = AppConfig.SearchTypeGroups.any;
    }
    if (
      !exceptions.some((action) =>
        isAction(action.action, SearchQueryComposition.LAST_MODIFIED),
      )
    ) {
      lastModified.current = '';
    }
    if (
      !exceptions.some((action) =>
        isAction(action.action, SearchQueryComposition.DATE_CREATED),
      )
    ) {
      dateCreated.current = '';
    }
    tagTimePeriod.current = '';
    tagTimePeriodHelper.current = ' ';
    tagTimePeriodFrom.current = null;
    tagTimePeriodTo.current = null;
    setTagPlaceLat(null);
    setTagPlaceLong(null);
    forceIndexing.current = false;
    if (
      !exceptions.some((action) =>
        isAction(action.action, SearchQueryComposition.SIZE),
      )
    ) {
      fileSize.current = '';
    }
  }
  const clearSearch = () => {
    openCurrentDirectory().then(() => {
      resetValues([]);
      setSearchQuery({});
      exitSearchMode();
    });
  };

  function removeActionsFromQuery(
    query: string,
    actions: Array<SearchOptionType>,
  ) {
    if (actions && actions.length > 0) {
      const queryArr = query
        .split(' ')
        .filter((q) => actions.some((action) => q !== action.label));
      return queryArr.join(' ');
    }
    return query;
  }

  const handleOpenSavedSearches = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setOpenSavedSearches(event.currentTarget);
  };

  function HelpTooltip(hClasses) {
    return (
      <Tooltip
        title={
          <span style={{ fontSize: 14 }}>
            The search query consists of a tag part and a search term. This term
            is optional and can be a single word. The tag part can have one or
            more tags preceded by the following symbols:
            <ul>
              <li>
                + will add only entries having this tag in the search results
                (logical AND)
              </li>
              <li>
                | will include all entries having this tag in the search results
                (logical OR)
              </li>
              <li>
                - will exclude entries having this tags from the search results
              </li>
            </ul>
            Example queries:
            <ul>
              <li>
                "italy +beach -sunset" - will find all files and folders having
                italy in their name and the tag beach but not sunset
              </li>
              <li>
                "|beach |sunset" - will find all files and folder having the
                tags beach or sunset
              </li>
            </ul>
          </span>
        }
      >
        <TsIconButton edge="end">
          <HelpOutlineIcon sx={{ color: 'lightgray' }} />
        </TsIconButton>
      </Tooltip>
    );
  }

  function getTags(
    actions: Array<SearchOptionType>,
    action: ActionType,
  ): TS.Tag[] {
    if (actions.length > 0) {
      const actionsArr = actions.filter((a) => isAction(a.action, action));
      if (actionsArr.length > 0) {
        return actionsArr.map((a) => ({
          title:
            a.label.indexOf(action.shortName) === 0
              ? a.label.substring(action.shortName.length)
              : action.fullName && a.label.indexOf(action.fullName) === 0
                ? a.label.substring(action.fullName.length)
                : a.label,
        }));
      }
    }
    return [];
  }

  const executeSearch = () => {
    if (
      actionValues.current.some((action) =>
        isAction(action.action, SearchActions.FILTER),
      )
    ) {
      // don't execute search on search filter
      return;
    }
    if (
      tempSearchQuery.textQuery &&
      (tempSearchQuery.textQuery.startsWith('ts:?ts') ||
        tempSearchQuery.textQuery.startsWith(AppConfig.tsProtocol + '?ts'))
    ) {
      openLinkDispatch(tempSearchQuery.textQuery, { fullWidth: false });
      clearSearch();
      return;
    }
    const tagsAND = getTags(
      actionValues.current,
      SearchQueryComposition.TAG_AND,
    );
    const tagsOR = getTags(actionValues.current, SearchQueryComposition.TAG_OR);
    const tagsNOT = getTags(
      actionValues.current,
      SearchQueryComposition.TAG_NOT,
    );
    const sQuery: TS.SearchQuery = {
      textQuery: tempSearchQuery.textQuery,
      tagsAND,
      tagsOR,
      tagsNOT,
      searchBoxing,
      searchType: searchType.current,
      fileTypes: fileTypes.current,
      lastModified: lastModified.current,
      dateCreated: dateCreated.current,
      fileSize: fileSize.current,
      tagTimePeriodFrom: tagTimePeriodFrom.current,
      tagTimePeriodTo: tagTimePeriodTo.current,
      tagPlaceLat,
      tagPlaceLong,
      // tagPlaceRadius,
      maxSearchResults: maxSearchResults,
      currentDirectory: currentDirectoryPath,
      forceIndexing: forceIndexing.current,
      showUnixHiddenEntries: showUnixHiddenEntries,
      executeSearch: true,
    };
    if (!haveSearchFilters(sQuery)) {
      clearSearch();
    } else {
      console.log('Search object: ' + JSON.stringify(sQuery));
      setSearchQuery(sQuery);
    }
  };

  function getHistoryOptions(
    items: TS.HistoryItem[],
    group: string,
  ): SearchOptionType[] {
    if (!items) {
      return [];
    }
    return items.map((item: TS.HistoryItem) => ({
      id: item.lid,
      descr: formatDistanceToNow(item.creationTimeStamp, {
        includeSeconds: true,
        addSuffix: true,
        // locale: https://date-fns.org/v2.29.3/docs/formatDistanceToNow#usage
      }),
      action: ExecActions.OPEN_HISTORY,
      fullName: item.url,
      label: item.path,
      group: group,
      ...(item.searchQuery && { searchQuery: item.searchQuery }),
    }));
  }

  function changeOptions(action: string, filter = true) {
    let optionsChanged = false;
    if (isAction(action, SearchActions.LOCATION)) {
      if (currentOptions.current !== action) {
        currentOptions.current = action;
        searchOptions.current = locations.map((location) => {
          return {
            id: location.uuid,
            descr: location.path,
            action: ExecActions.OPEN_LOCATION,
            label: location.name,
            filter,
          };
        });
        optionsChanged = true;
      }
    } else if (isAction(action, SearchActions.HISTORY)) {
      if (currentOptions.current !== action) {
        currentOptions.current = action;

        searchOptions.current = [
          ...getHistoryOptions(fileOpenHistory, t('core:fileOpenHistory')),
          ...getHistoryOptions(folderOpenHistory, t('core:folderOpenHistory')),
          ...getHistoryOptions(fileEditHistory, t('core:fileEditHistory')),
        ];
      }
    } else if (isAction(action, SearchActions.BOOK)) {
      if (currentOptions.current !== action) {
        currentOptions.current = action;
        const bookmarks: Array<TS.BookmarkItem> =
          Pro && bookmarksContext && bookmarksContext.bookmarks; //getBookmarks();

        function getOptions(
          items: TS.BookmarkItem[],
          group: string,
        ): SearchOptionType[] {
          if (!items) {
            return [];
          }
          return items.map((item: TS.BookmarkItem) => ({
            id: item.creationTimeStamp.toString(),
            descr:
              '(' + format(item.creationTimeStamp, 'yyyy-MM-dd HH:mm') + ')',
            action: ExecActions.OPEN_BOOKMARK,
            fullName: item.url,
            label: item.path,
            group: group,
            filter,
          }));
        }

        searchOptions.current = getOptions(
          bookmarks,
          t('core:searchBookmarks'),
        );
      }
    } else if (isAction(action, SearchActions.SEARCH_HISTORY)) {
      searchOptions.current = getHistoryOptions(
        searchHistory,
        t('core:searchHistory'),
      );
    } else if (isAction(action, SearchActions.SEARCH)) {
      if (currentOptions.current !== action) {
        currentOptions.current = action;

        function getOptions(
          items: TS.SearchQuery[],
          group: string,
        ): SearchOptionType[] {
          if (!items) {
            return [];
          }
          return items.map((item: TS.SearchQuery) => ({
            id: item.uuid,
            action: ExecActions.OPEN_SAVED_SEARCHES,
            label: item.title,
            fullName: JSON.stringify(item),
            group: group,
            filter,
          }));
        }

        searchOptions.current = getOptions(
          searches,
          t('core:savedSearchesTitle'),
        );
      }
    } else if (
      isAction(action, SearchQueryComposition.TAG_AND) ||
      isAction(action, SearchQueryComposition.TAG_OR) ||
      isAction(action, SearchQueryComposition.TAG_NOT)
    ) {
      currentOptions.current = action;
      const searchAction = toExecAction(action);
      const options = [];
      for (let j = 0; j < tagGroups.length; j++) {
        tagGroups[j].children.forEach((tag: TS.Tag) => {
          options.push({
            id: tag.id,
            action: searchAction,
            label: tag.title,
            color: tag.color,
            textcolor: tag.textcolor,
            group: tagGroups[j].title,
            filter,
          });
        });
      }
      searchOptions.current = options;
      optionsChanged = true;
    } else if (isAction(action, SearchQueryComposition.TYPE)) {
      if (currentOptions.current !== SearchQueryComposition.TYPE.shortName) {
        currentOptions.current = action;
        const options = [];
        Object.entries(AppConfig.SearchTypeGroups).forEach(([key, value]) => {
          const typedValue = value as string[];
          options.push({
            id: key,
            action: ExecActions.TYPE_SEARCH,
            label: t('core:' + key),
            descr: typedValue.join(', '),
            filter,
          });
        });
        searchOptions.current = options;
        optionsChanged = true;
      }
    } else if (isAction(action, SearchQueryComposition.SIZE)) {
      if (currentOptions.current !== SearchQueryComposition.SIZE.shortName) {
        currentOptions.current = action;
        const options = [];

        Object.entries(AppConfig.SearchSizes).forEach((size: any) => {
          let descr = '';
          if (size[1].key === AppConfig.SearchSizes.empty.key) {
            descr = formatFileSize(size[1].thresholdBytes);
          } else if (size[1].key === AppConfig.SearchSizes.tiny.key) {
            descr =
              formatFileSize(AppConfig.SearchSizes.empty.thresholdBytes) +
              ' < ' +
              formatFileSize(AppConfig.SearchSizes.tiny.thresholdBytes);
          } else if (size[1].key === AppConfig.SearchSizes.verySmall.key) {
            descr =
              formatFileSize(AppConfig.SearchSizes.tiny.thresholdBytes) +
              ' < ' +
              formatFileSize(AppConfig.SearchSizes.verySmall.thresholdBytes);
          } else if (size[1].key === AppConfig.SearchSizes.small.key) {
            descr =
              formatFileSize(AppConfig.SearchSizes.verySmall.thresholdBytes) +
              ' < ' +
              formatFileSize(AppConfig.SearchSizes.small.thresholdBytes);
          } else if (size[1].key === AppConfig.SearchSizes.medium.key) {
            descr =
              formatFileSize(AppConfig.SearchSizes.small.thresholdBytes) +
              ' < ' +
              formatFileSize(AppConfig.SearchSizes.medium.thresholdBytes);
          } else if (size[1].key === AppConfig.SearchSizes.large.key) {
            descr =
              formatFileSize(AppConfig.SearchSizes.medium.thresholdBytes) +
              ' < ' +
              formatFileSize(AppConfig.SearchSizes.large.thresholdBytes);
          } else if (size[1].key === AppConfig.SearchSizes.huge.key) {
            descr =
              ' > ' +
              formatFileSize(AppConfig.SearchSizes.large.thresholdBytes);
          }
          options.push({
            id: size[1].key,
            action: ExecActions.SIZE_SEARCH,
            label: t('core:' + size[1].key),
            descr: '(' + descr + ')',
            filter,
          });
        });
        searchOptions.current = options;
        optionsChanged = true;
      }
    } else if (isAction(action, SearchQueryComposition.LAST_MODIFIED)) {
      if (
        currentOptions.current !==
        SearchQueryComposition.LAST_MODIFIED.shortName
      ) {
        currentOptions.current = action;
        const options = [];

        Object.entries(AppConfig.SearchTimePeriods).forEach((period: any) => {
          options.push({
            id: period[1].key,
            action: ExecActions.LAST_MODIFIED_SEARCH,
            label: t('core:' + period[1].key),
            filter,
          });
        });
        searchOptions.current = options;
        optionsChanged = true;
      }
    } else if (isAction(action, SearchQueryComposition.DATE_CREATED)) {
      if (
        currentOptions.current !== SearchQueryComposition.DATE_CREATED.shortName
      ) {
        currentOptions.current = action;
        const options = [];

        Object.entries(AppConfig.SearchTimePeriods).forEach((period: any) => {
          options.push({
            id: period[1].key,
            action: ExecActions.DATE_CREATED_SEARCH,
            label: t('core:' + period[1].key),
            filter,
          });
        });
        searchOptions.current = options;
        optionsChanged = true;
      }
    } else if (isAction(action, SearchQueryComposition.SCOPE)) {
      if (currentOptions.current !== SearchQueryComposition.SCOPE.shortName) {
        currentOptions.current = action;
        const options = [];

        Object.entries(scope).forEach(([key, value]) => {
          options.push({
            id: key,
            action: ExecActions.SCOPE_SEARCH,
            label: t('core:' + key),
            filter,
          });
        });
        searchOptions.current = options;
        optionsChanged = true;
      }
    } else if (isAction(action, SearchQueryComposition.ACCURACY)) {
      if (
        currentOptions.current !== SearchQueryComposition.ACCURACY.shortName
      ) {
        currentOptions.current = action;
        const options = [];

        Object.entries(accuracy).forEach(([key, value]) => {
          options.push({
            id: key,
            action: ExecActions.ACCURACY_SEARCH,
            label: t('core:' + key),
            filter,
          });
        });
        searchOptions.current = options;
        optionsChanged = true;
      }
    } else {
      currentOptions.current = action;
      const execActionsArr = Object.values(ExecActions);
      if (execActionsArr.includes(action)) {
        searchOptions.current = getSearchOptions().filter(
          (option) => option.group === 'query',
        );
        optionsChanged = true;
      } else {
        searchOptions.current = getSearchOptions();
      }
    }

    if (optionsChanged) {
      isOpen.current = true;
      forceUpdate();
    }
  }

  function execActions(
    options: Array<any>,
    previousActions = [],
    hasOptionsChanged = false,
    unique = false,
  ) {
    const actions: Array<SearchOptionType> = [];

    function setActionLabel(key: ActionType, option: SearchOptionType): string {
      if (actions.length > 0) {
        const action = actions.find((a) => a.action === key.fullName); //[actions.length - 1];
        if (isAction(action.action, key)) {
          action.label = action.action + option.label;
          action.fullName = action.action + option.label;
          return option.id;
        }
      }
      return undefined;
    }

    for (let i = 0; i < options.length; i++) {
      let option: SearchOptionType;
      if (typeof options[i] === 'object') {
        option = { ...options[i] };
      } else {
        const action = findAction(options[i]);
        option = {
          label: options[i],
          fullName: action,
          action: action,
        };
      }
      const prevAction = previousActions.find(
        (obj) =>
          obj.action === option.action &&
          (unique ||
            obj.label === option.label ||
            (obj.fullName && obj.fullName === option.fullName)),
      );
      if (!prevAction) {
        if (isAction(option.action, SearchActions.LOCATION)) {
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
          actions.push(option);
        } else if (option.action === ExecActions.OPEN_LOCATION) {
          exitSearchMode();
          // isOpen.current = false;
          searchOptions.current = getSearchOptions();
          currentOptions.current = undefined;
          openLocationById(option.id);
          return [];
        } else if (isAction(option.action, SearchActions.FILTER)) {
          actions.push(option);
          isOpen.current = false;
        } else if (isAction(option.action, SearchActions.HISTORY)) {
          if (hasOptionsChanged) {
            changeOptions(option.action);
            isOpen.current = true;
          }
          actions.push(option);
        } else if (isAction(option.action, SearchActions.BOOK)) {
          if (hasOptionsChanged) {
            changeOptions(option.action);
            isOpen.current = true;
          }
          actions.push(option);
        } else if (isAction(option.action, SearchActions.SEARCH)) {
          if (hasOptionsChanged) {
            changeOptions(option.action);
            isOpen.current = true;
          }
          actions.push(option);
        } else if (isAction(option.action, SearchActions.SEARCH_HISTORY)) {
          if (hasOptionsChanged) {
            changeOptions(option.action);
            isOpen.current = true;
          }
          actions.push(option);
        } else if (option.action === ExecActions.OPEN_HISTORY) {
          if (option.searchQuery) {
            if (option.id) {
              changeLocationByID(option.id);
              setSearchQuery(option.searchQuery);
            } else {
            }
          } else {
            const item: TS.HistoryItem = {
              path: option.label,
              url: option.fullName,
              lid: option.id,
              creationTimeStamp: 0,
            };
            openHistoryItem(item);
          }
          searchOptions.current = getSearchOptions();
          currentOptions.current = undefined;
          isOpen.current = false;
          return [];
        } else if (option.action === ExecActions.OPEN_BOOKMARK) {
          if (Pro) {
            const item: TS.HistoryItem = {
              path: option.label,
              url: option.fullName,
              lid: undefined,
              creationTimeStamp: 0,
            };
            openHistoryItem(item);
          }
          searchOptions.current = getSearchOptions();
          currentOptions.current = undefined;
          isOpen.current = false;
          return [];
        } else if (option.action === ExecActions.OPEN_SAVED_SEARCHES) {
          setSearchQuery(JSON.parse(option.fullName));
          searchOptions.current = getSearchOptions();
          currentOptions.current = undefined;
          isOpen.current = false;
          return [];
        } else if (
          isAction(option.action, SearchQueryComposition.TAG_AND) ||
          isAction(option.action, SearchQueryComposition.TAG_OR) ||
          isAction(option.action, SearchQueryComposition.TAG_NOT)
        ) {
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
          actions.push(option);
        } else if (
          option.action === ExecActions.TAG_SEARCH_AND ||
          option.action === ExecActions.TAG_SEARCH_OR ||
          option.action === ExecActions.TAG_SEARCH_NOT
        ) {
          if (actions.length > 0) {
            const searchAction: string =
              option.action === ExecActions.TAG_SEARCH_AND
                ? SearchQueryComposition.TAG_AND.shortName
                : option.action === ExecActions.TAG_SEARCH_NOT
                  ? SearchQueryComposition.TAG_NOT.shortName
                  : SearchQueryComposition.TAG_OR.shortName;

            let prevAction;
            if (unique) {
              prevAction = actions.find((a) => a.action === searchAction);
            }
            if (!prevAction) {
              prevAction = actions[actions.length - 1];
            }
            prevAction.label = searchAction + option.label;
            prevAction.fullName = searchAction + option.label;
            prevAction.color = option.color;
            prevAction.textcolor = option.textcolor;
          }
          const tagsAND = getTags(
            actionValues.current,
            SearchQueryComposition.TAG_AND,
          );
          const tagsOR = getTags(
            actionValues.current,
            SearchQueryComposition.TAG_OR,
          );
          const tagsNOT = getTags(
            actionValues.current,
            SearchQueryComposition.TAG_NOT,
          );
          setSearchQuery({
            ...searchQuery,
            tagsAND,
            tagsOR,
            tagsNOT,
            textQuery: '',
            executeSearch: false,
          });
          setTempSearchQuery({ textQuery: '' });
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
        } else if (isAction(option.action, SearchQueryComposition.TYPE)) {
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
          actions.push(option);
        } else if (option.action === ExecActions.TYPE_SEARCH) {
          const id = setActionLabel(SearchQueryComposition.TYPE, option);
          if (id) {
            fileTypes.current = option.descr.split(', ');
            setSearchQuery({
              ...searchQuery,
              fileTypes: fileTypes.current,
              executeSearch: false,
            });
          }
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
          // executeSearch();
        } else if (isAction(option.action, SearchQueryComposition.SIZE)) {
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
          actions.push(option);
        } else if (option.action === ExecActions.SIZE_SEARCH) {
          const id = setActionLabel(SearchQueryComposition.SIZE, option);
          if (id) {
            fileSize.current = id;
            setSearchQuery({
              ...searchQuery,
              fileSize: id,
              executeSearch: false,
            });
          }
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
          // executeSearch();
        } else if (
          isAction(option.action, SearchQueryComposition.LAST_MODIFIED) ||
          isAction(option.action, SearchQueryComposition.DATE_CREATED)
        ) {
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
          actions.push(option);
        } else if (option.action === ExecActions.LAST_MODIFIED_SEARCH) {
          const id = setActionLabel(
            SearchQueryComposition.LAST_MODIFIED,
            option,
          );
          if (id) {
            lastModified.current = id;
            setSearchQuery({
              ...searchQuery,
              lastModified: id,
              executeSearch: false,
            });
          }
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
          // executeSearch();
        } else if (option.action === ExecActions.DATE_CREATED_SEARCH) {
          const id = setActionLabel(
            SearchQueryComposition.DATE_CREATED,
            option,
          );
          if (id) {
            dateCreated.current = id;
            setSearchQuery({
              ...searchQuery,
              dateCreated: id,
              executeSearch: false,
            });
          }
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
        } else if (isAction(option.action, SearchQueryComposition.SCOPE)) {
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
          actions.push(option);
        } else if (option.action === ExecActions.SCOPE_SEARCH) {
          const id = setActionLabel(SearchQueryComposition.SCOPE, option);
          if (id) {
            setSearchBoxing(scope[id]);
            setSearchQuery({
              ...searchQuery,
              searchBoxing: scope[id],
              executeSearch: false,
            });
          }
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
        } else if (isAction(option.action, SearchQueryComposition.ACCURACY)) {
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
          actions.push(option);
        } else if (option.action === ExecActions.ACCURACY_SEARCH) {
          const id = setActionLabel(SearchQueryComposition.ACCURACY, option);
          if (id) {
            searchType.current = accuracy[id];
            setSearchQuery({
              ...searchQuery,
              searchType: accuracy[id],
              executeSearch: false,
            });
          }
          if (hasOptionsChanged) {
            changeOptions(option.action);
          }
          // executeSearch();
        } else if (option.action === undefined) {
          // text query
          setTempSearchQuery({ textQuery: option.label }, true);

          const pAction = actions[actions.length - 1];
          if (pAction && isAction(pAction.action, SearchActions.FILTER)) {
            const filterArr = options.filter(
              (o) => !(typeof o === 'object') && o.action === undefined,
            );
            if (filterArr.length > 0) {
              dispatch(AppActions.setSearchFilter(filterArr.join(' ')));
              isOpen.current = false;
              return actions;
            }
          }
        }
      } else {
        actions.push(prevAction);
      }
    }
    // setTextQuery(actions);
    return actions;
  }

  function handleInputChange(event: any, value: string, reason: string) {
    if (reason === 'input') {
      const valueArr = value.split(' ');
      actionValues.current = execActions(
        [...actionValues.current, ...valueArr],
        actionValues.current,
        true,
      );
      const inputArr = valueArr.filter(
        (action) => !actionValues.current.some((v) => v.label === action),
      );
      const txtQuery = inputArr.join(' ');
      setTempSearchQuery({ textQuery: txtQuery }, true);
      searchQuery.textQuery = txtQuery;
      forceUpdate();
    } else if (reason === 'clear') {
      clearSearch();
    } else if (reason === 'reset') {
    }
  }

  function toExecAction(action: string) {
    if (isAction(action, SearchQueryComposition.TAG_AND)) {
      return ExecActions.TAG_SEARCH_AND;
    }
    if (isAction(action, SearchQueryComposition.TAG_NOT)) {
      return ExecActions.TAG_SEARCH_NOT;
    }
    if (isAction(action, SearchQueryComposition.TAG_OR)) {
      return ExecActions.TAG_SEARCH_OR;
    }
    return action;
  }

  function handleChange(event: Object, selected: Array<any>, reason: string) {
    if (reason === 'selectOption') {
      actionValues.current = execActions(selected, actionValues.current, true);
      forceUpdate();
    } else if (reason === 'createOption') {
      const actions = [];
      let prevOption;
      for (let i = 0; i < selected.length; i++) {
        const option = selected[i];
        if (option.action === undefined && prevOption) {
          let action = findAction(prevOption, true);
          if (action) {
            actions.push({
              label: option,
              action: toExecAction(action),
            });
          } else {
            actions.push(option);
          }
        } else {
          actions.push(option);
        }
        prevOption = option;
      }
      actionValues.current = execActions(actions, actionValues.current, true);
      forceUpdate();
    } else if (reason === 'remove-value') {
      actionValues.current = actionValues.current.filter(
        (v) => !(selected.includes(v.label) || selected.includes(v.fullName)),
      );
      resetActions(actionValues.current);
      forceUpdate();
    }
  }

  function resetActions(actions: Array<SearchOptionType>) {
    resetValues(actions);
    if (actions.length === 0) {
      searchOptions.current = getSearchOptions();
      currentOptions.current = undefined;
    } else {
      actionValues.current = execActions(actions, [], false);
      searchOptions.current = getSearchOptions().filter(
        (option) => option.group === 'query',
      );
      currentOptions.current = undefined;
    }
  }

  if (!isSearchMode) {
    return null;
  }

  const endAdornment = (
    <>
      <TsIconButton
        tooltip={t('core:advancedSearch')}
        id="advancedButton"
        data-tid="advancedSearch"
        sx={{ maxHeight: '34px' }}
        size={desktopMode ? 'small' : 'medium'}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          setAnchorSearch(event.currentTarget);
        }}
      >
        <AdvancedSearchIcon fontSize={desktopMode ? 'small' : 'medium'} />
        {/* <DropDownIcon /> */}
      </TsIconButton>
      <TsIconButton
        tooltip={t('clearSearch') + ' (ESC)'}
        id="clearSearchID"
        onClick={() => {
          clearSearch();
        }}
        sx={{ maxHeight: '34px' }}
        size={desktopMode ? 'small' : 'medium'}
        edge="end"
      >
        <CloseIcon fontSize={desktopMode ? 'small' : 'medium'} />
      </TsIconButton>
    </>
  );

  function haveEmptyAction(): boolean {
    if (actionValues.current.length > 0) {
      const action =
        actionValues.current[actionValues.current.length - 1].label;
      return !!findAction(action, true);
    }
    return false;
  }

  return (
    <>
      <div
        id="searchAutocompleteComp"
        style={
          {
            width: '100%',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            WebkitAppRegion: 'no-drag',
          } as React.CSSProperties & { WebkitAppRegion?: string }
        }
      >
        <style>
          {`
          #searchAutocompleteComp .MuiAutocomplete-root .MuiInputBase-root {
            padding: 2px 6px 2px 4px !important;
          }
          #searchAutocompleteComp .MuiTextField-root {
            overflow-x: hidden !important;
            margin-bottom: 0;
          }
          .MuiAutocomplete-popper {
            min-width: 350px;
          }
        `}
        </style>
        <Autocomplete
          id="textQuery"
          multiple
          freeSolo
          autoSelect
          autoComplete
          handleHomeEndKeys
          value={actionValues.current.map((v) =>
            v.fullName ? v.fullName : v.label,
          )}
          onChange={handleChange}
          inputValue={
            tempSearchQuery.textQuery ? tempSearchQuery.textQuery : ''
          }
          onInputChange={handleInputChange}
          open={isOpen.current}
          filterOptions={(options: Array<SearchOptionType>, state: any) => {
            if ((state.inputValue ?? '').trim() === '') {
              return options;
            }
            const fuseOptions = {
              keys: [
                {
                  name: 'label',
                  getFn: (entry) => entry.label,
                  weight: 0.2,
                },
              ],
              threshold: 0.3,
              shouldSort: true,
              minMatchCharLength: 1,
            };
            const fuse = new Fuse(options, fuseOptions);
            const result = fuse.search(state.inputValue);
            const filteredOptions = result.map(({ item }) => item);
            /*const filteredOptions = options.filter((option) => {
              if (option.filter === false) {
                return true;
              }
              return (
                option.label
                  .toLowerCase()
                  .indexOf(state.inputValue.toLowerCase()) > -1
              );
            });*/
            if (filteredOptions.length === 0 && !haveEmptyAction()) {
              return options;
              //isOpen.current = false;
            }
            return filteredOptions;
          }}
          renderTags={(value) =>
            value.map((option, index: number) => {
              const action = actionValues.current.find(
                (a) => a.fullName === option || a.label === option,
              );
              return (
                <Box
                  key={'button_' + index}
                  style={{
                    border: '1px solid gray',
                    minHeight: 0,
                    minWidth: 0,
                    margin: 2,
                    marginLeft: 1,
                    marginTop: 3,
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingRight: 0,
                    paddingLeft: 4,
                    borderRadius: 5,
                    ...(action &&
                      action.color && {
                        color: action.textcolor,
                        backgroundColor: action.color,
                        border: 'none',
                      }),
                  }}
                >
                  {isAction(action.action, SearchQueryComposition.TAG_AND) ||
                  isAction(action.action, SearchQueryComposition.TAG_OR) ||
                  isAction(action.action, SearchQueryComposition.TAG_NOT) ? (
                    <Box
                      style={{
                        fontSize: 13,
                        fontWeight: 'bold',
                        display: 'inline',
                      }}
                    >
                      {option}
                    </Box>
                  ) : (
                    <TsButton
                      tooltip={option}
                      onClick={() => {
                        changeOptions(action.action, false);
                      }}
                      data-tid={dataTidFormat('menu' + option)}
                      variant="text"
                      sx={{
                        backgroundColor: 'transparent',
                        textTransform: 'lowercase',
                        padding: 0,
                        margin: 0,
                      }}
                      endIcon={
                        <ArrowDropDownIcon
                          sx={{ marginLeft: '-10px' }}
                          fontSize="small"
                        />
                      }
                    >
                      {removePrefix(option, action.action)}
                    </TsButton>
                  )}

                  {!isAction(action.action, SearchQueryComposition.SCOPE) &&
                    !isAction(
                      action.action,
                      SearchQueryComposition.ACCURACY,
                    ) && (
                      <TsIconButton
                        onClick={() => {
                          handleChange(null, [option], 'remove-value');
                        }}
                        sx={{
                          padding: 0,
                          margin: 0,
                          textTransform: 'lowercase',
                        }}
                        data-tid={dataTidFormat('close' + option)}
                      >
                        <CloseIcon fontSize="small" />
                      </TsIconButton>
                    )}
                </Box>
              );
            })
          }
          options={searchOptions.current}
          groupBy={(option) => option.group}
          renderGroup={(params) => (
            <li key={params.key}>
              <div
                style={{
                  position: 'sticky',
                  top: -8,
                  padding: '10px 10px',
                  backgroundColor: theme.palette.background.default,
                }}
              >
                {t(params.group)}
              </div>
              <ul style={{ padding: 0 }}>{params.children}</ul>
            </li>
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              {option.color ? (
                <TsButton
                  variant="text"
                  sx={{
                    fontSize: '13px',
                    textTransform: 'none',
                    color: option.textcolor,
                    backgroundColor: option.color,
                    minHeight: 0,
                    minWidth: 0,
                    margin: '2px',
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingRight: '5px',
                    paddingLeft: '5px',
                    borderRadius: '5px',
                  }}
                >
                  {option.label}
                </TsButton>
              ) : (
                <>
                  <b>{option.label}</b>
                  &nbsp;{option.descr}
                </>
              )}
            </Box>
          )}
          sx={{ width: '100%' }}
          size="small"
          onKeyDown={onKeyDownHandler}
          disableClearable={true}
          renderInput={(params) => {
            if (params.InputProps.endAdornment) {
              params.InputProps.endAdornment = [
                params.InputProps.endAdornment,
                endAdornment,
              ];
            } else {
              params.InputProps.endAdornment = [endAdornment];
            }
            return (
              <TsTextField
                {...params}
                sx={{ overflow: 'auto', maxHeight: '40px' }}
                onBlur={() => {
                  isOpen.current = false;
                  forceUpdate();
                }}
                onFocus={() => {
                  isOpen.current = true;
                  forceUpdate();
                }}
                autoFocus
                placeholder={t('core:searchTitle')}
                size="small"
              />
            );
          }}
        />
        <TsButton
          tooltip={isIndexing ? t('searchDisabledWhileIndexing') : ''}
          id="searchButton"
          disabled={isIndexing !== undefined}
          sx={{
            marginRight: '10px',
            marginLeft: '10px',
          }}
          onClick={clickSearchButton}
        >
          {t('searchTitle')}
        </TsButton>
      </div>
    </>
  );
}

export default SearchAutocomplete;
