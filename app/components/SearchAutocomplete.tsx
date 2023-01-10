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

import React, { useEffect, useReducer, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import ClearSearchIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import Tooltip from '-/components/Tooltip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import {
  escapeRegExp,
  parseTextQuery,
  removeAllTagsFromSearchQuery
} from '@tagspaces/tagspaces-common/misc';
import {
  actions as AppActions,
  getDirectoryPath,
  getSearchResultsCount
} from '../reducers/app';
import {
  actions as LocationIndexActions,
  getIndexedEntriesCount,
  isIndexing,
  getSearchQuery
} from '../reducers/location-index';
import {
  isDesktopMode,
  getMaxSearchResults,
  getShowUnixHiddenEntries,
  getCurrentLanguage
} from '-/reducers/settings';
import i18n from '-/services/i18n';
import { FileTypeGroups } from '-/services/search';
import { TS } from '-/tagspaces.namespace';
import { Pro } from '../pro';
import useFirstRender from '-/utils/useFirstRender';
import SavedSearchesMenu from '-/components/menus/SavedSearchesMenu';
import AppConfig from '-/AppConfig';
import { Autocomplete, Box, TextField } from '@mui/material';
import {
  accuracy,
  ActionType,
  ExecActions,
  FileSize,
  findAction,
  isAction,
  LastModified,
  scope,
  ScopeType,
  SearchActions,
  SearchOptions,
  SearchOptionType,
  SearchQueryComposition
} from '-/components/SearchOptions';
import { getCurrentLocation, getLocations } from '-/reducers/locations';
import CloseIcon from '@mui/icons-material/Close';
import { getTagLibrary } from '-/services/taglibrary-utils';

interface Props {
  style?: any;
  watchForChanges: () => void;
  searchLocationIndex: (searchQuery: TS.SearchQuery) => void;
  createLocationsIndexes: () => void;
  searchAllLocations: (searchQuery: TS.SearchQuery) => void;
  // loadDirectoryContent: (path: string, generateThumbnails: boolean, loadDirMeta?: boolean) => void;
  openURLExternally: (url: string) => void;
  searchQuery: TS.SearchQuery; // () => any;
  // openCurrentDirectory: () => void;
  setSearchQuery: (searchQuery: TS.SearchQuery) => void;
  openLink: (url: string, options?: any) => void;
  currentDirectory: string;
  indexedEntriesCount: number;
  maxSearchResults: number;
  indexing: boolean;
  showUnixHiddenEntries: boolean;
  isDesktop: boolean;
  open: boolean;
  locations: TS.Location[];
  currentLocation: TS.Location;
  openLocationById: (locationId: string) => void;
  searchResultsCount: number;
  exitSearchMode: () => void;
  setSearchFilter: (filter) => void;
}

const useStyles = makeStyles(theme => ({
  customWidth: {
    maxWidth: 550
  },
  noMaxWidth: {
    maxWidth: 'none'
  }
}));

function SearchAutocomplete(props: Props) {
  // const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [
    openSavedSearches,
    setOpenSavedSearches
  ] = useState<null | HTMLElement>(null);
  const searchOptions = useRef<Array<SearchOptionType>>(SearchOptions);
  const currentOptions = useRef<string>(undefined);
  // const textQuery = useRef<string>(props.searchQuery.textQuery || ''); // rethink to use inputValue instead
  const textQueryMask = useRef<string>('');
  const fileTypes = useRef<Array<string>>(
    props.searchQuery.fileTypes
      ? props.searchQuery.fileTypes
      : FileTypeGroups.any
  );
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  /*function parseSearchQuery(textQuery: string) {
    if (textQuery) {
      return execActions(textQuery.split(' '), []);
    }
    return [];
  }*/

  const actionValues = useRef<Array<SearchOptionType>>(
    [] //parseSearchQuery(textQueryMask.current)
  );
  const inputValue = useRef<string>(props.searchQuery.textQuery || ''); //getInputValue());

  // const searchBoxing = useRef<'location' | 'folder' | 'global'>(
  //   props.searchQuery.searchBoxing ? props.searchQuery.searchBoxing : 'location'
  // );
  const [searchBoxing, setSearchBoxing] = useState<ScopeType>(
    props.searchQuery.searchBoxing || 'location'
  );

  const searchType = useRef<'fuzzy' | 'semistrict' | 'strict'>(
    props.searchQuery.searchType ? props.searchQuery.searchType : 'fuzzy'
  );
  const lastModified = useRef<string>(
    props.searchQuery.lastModified ? props.searchQuery.lastModified : ''
  );
  const tagTimePeriod = useRef<string>('');
  const tagTimePeriodHelper = useRef<string>(' ');
  const tagTimePeriodFrom = useRef<number | null>(
    props.searchQuery.tagTimePeriodFrom
      ? props.searchQuery.tagTimePeriodFrom
      : null
  );
  const tagTimePeriodTo = useRef<number | null>(
    props.searchQuery.tagTimePeriodTo ? props.searchQuery.tagTimePeriodTo : null
  );
  const [tagPlaceLat, setTagPlaceLat] = useState<number | null>(null);
  const [tagPlaceLong, setTagPlaceLong] = useState<number | null>(null);
  // const [tagPlaceRadius, setTagPlaceRadius] = useState<number>(0);
  const forceIndexing = useRef<boolean>(
    props.searchQuery.forceIndexing ? props.searchQuery.forceIndexing : false
  );
  const fileSize = useRef<string>(
    props.searchQuery.fileSize ? props.searchQuery.fileSize : ''
  );

  const mainSearchField = useRef<HTMLInputElement>(null);
  const isOpen = useRef<boolean>(true);

  const firstRender = useFirstRender();

  useEffect(() => {
    if (!firstRender) {
      if (
        props.open &&
        (inputValue.current.length > 0 || actionValues.current.length > 0)
      ) {
        executeSearch();
      }
    }
  }, [props.currentLocation]);

  useEffect(() => {
    if (!firstRender) {
      if (props.searchResultsCount === -1) {
        clearSearch();
      }
    }
  }, [props.searchResultsCount]);

  /* let searchBoxingName = i18n.t('location');
  if (searchBoxing === 'global') {
    searchBoxingName = i18n.t('globalSearch');
  } else if (searchBoxing === 'folder') {
    searchBoxingName = i18n.t('folder');
  }*/

  useEffect(() => {
    if (Object.keys(props.searchQuery).length > 0) {
      let emptySearch = true;
      textQueryMask.current = '';

      if (props.searchQuery.tagsAND && props.searchQuery.tagsAND.length > 0) {
        props.searchQuery.tagsAND.forEach(tag => {
          textQueryMask.current += ' +' + tag.title;
        });
        emptySearch = false;
      }
      if (props.searchQuery.tagsOR && props.searchQuery.tagsOR.length > 0) {
        props.searchQuery.tagsOR.forEach(tag => {
          textQueryMask.current += ' |' + tag.title;
        });
        emptySearch = false;
      }
      if (props.searchQuery.tagsNOT && props.searchQuery.tagsNOT.length > 0) {
        props.searchQuery.tagsNOT.forEach(tag => {
          textQueryMask.current += ' -' + tag.title;
        });
        emptySearch = false;
      }

      // inputValue.current = getInputValue();
      if (inputValue.current) {
        emptySearch = false;
      }
      /* if (textQueryMask.current) {
        txtQuery = textQuery.current.replace(textQueryMask.current, '').trim();
      } else if (textQuery.current) {
        txtQuery = textQuery.current; // props.searchQuery.textQuery;
      } else {
        txtQuery = '';
      } */
      const searchQuery = {
        ...props.searchQuery,
        textQuery: inputValue.current
      };
      /* if (textQuery.current) {
        txtQuery = textQuery.current.replace(tagsMask, '');
      } else {
        txtQuery = props.searchQuery.textQuery || '';
      }
      */
      /*textQuery.current =
        inputValue.current + ' ' + textQueryMask.current.trim();*/
      if (mainSearchField.current) {
        mainSearchField.current.value =
          inputValue.current +
          (textQueryMask.current ? ' ' + textQueryMask.current.trim() : '');
      }
      if (props.searchQuery.searchBoxing) {
        setSearchBoxing(props.searchQuery.searchBoxing);
        // searchBoxing.current = props.searchQuery.searchBoxing;
        emptySearch = false;
      }
      if (props.searchQuery.fileTypes) {
        fileTypes.current = props.searchQuery.fileTypes;
        emptySearch = false;
      }
      if (props.searchQuery.searchType) {
        searchType.current = props.searchQuery.searchType;
        emptySearch = false;
      }
      if (props.searchQuery.lastModified) {
        lastModified.current = props.searchQuery.lastModified;
        emptySearch = false;
      }
      if (props.searchQuery.tagTimePeriodFrom) {
        tagTimePeriodFrom.current = props.searchQuery.tagTimePeriodFrom;
        emptySearch = false;
      }
      if (props.searchQuery.tagTimePeriodTo) {
        tagTimePeriodTo.current = props.searchQuery.tagTimePeriodTo;
        emptySearch = false;
      }
      if (props.searchQuery.forceIndexing) {
        forceIndexing.current = props.searchQuery.forceIndexing;
      }
      if (props.searchQuery.fileSize) {
        fileSize.current = props.searchQuery.fileSize;
        emptySearch = false;
      }
      if (!emptySearch) {
        if (searchBoxing === 'global') {
          props.searchAllLocations(searchQuery);
        } else {
          props.searchLocationIndex(searchQuery);
        }
      }
    }
  }, [props.searchQuery]);

  /*function getInputValue() {
    const txtQuery = removeActionsFromQuery(
      inputValue.current.trim(),
      actionValues.current
    );
    // txtQuery = removeAllTagsFromSearchQuery(txtQuery);
    if (txtQuery) {
      return txtQuery;
    }
    return '';
  }*/
  /*const toggleSearchBoxing = () => {
    if (searchBoxing === 'location') {
      setSearchBoxing('folder');
    } else if (searchBoxing === 'folder' && Pro) {
      setSearchBoxing('global');
    } else {
      setSearchBoxing('location');
    }
  };*/

  const clickSearchButton = () => {
    executeSearch();
  };

  const onKeyDownHandler = event => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      if (!isOpen.current) {
        executeSearch();
      } else {
        isOpen.current = false;
        forceUpdate();
      }
    } else if (event.key === 'Escape' || event.keyCode === 27) {
      clearSearch();
      // props.openCurrentDirectory();
    } else if (event.key === 'ArrowDown' || event.keyCode === 40) {
      if (!isOpen.current) {
        isOpen.current = true;
        forceUpdate();
      }
    } else {
      isOpen.current = true;
    }
  };

  const clearSearch = () => {
    inputValue.current = '';
    setSearchBoxing('location');
    searchType.current = 'fuzzy';
    fileTypes.current = FileTypeGroups.any;
    lastModified.current = '';
    tagTimePeriod.current = '';
    tagTimePeriodHelper.current = ' ';
    tagTimePeriodFrom.current = null;
    tagTimePeriodTo.current = null;
    setTagPlaceLat(null);
    setTagPlaceLong(null);
    // setTagPlaceRadius(0);
    forceIndexing.current = false;
    fileSize.current = '';
    props.setSearchQuery({});
    // props.setSearchResults([]);
    props.watchForChanges();
    // props.openCurrentDirectory();
  };

  function removeActionsFromQuery(
    query: string,
    actions: Array<SearchOptionType>
  ) {
    if (actions && actions.length > 0) {
      const queryArr = query
        .split(' ')
        .filter(q => actions.some(action => q !== action.label));
      return queryArr.join(' ');
    }
    return query;
  }

  /*const removeTagsFromQuery = (
    tags: Array<TS.Tag>,
    query: string,
    identifier: string
  ) => {
    if (tags) {
      let newQuery = query
        .trim()
        .replace(
          new RegExp(escapeRegExp(identifier) + '\\s+', 'g'),
          identifier
        );
      tags.forEach(tag => {
        newQuery = newQuery.replace(identifier + tag.title, '');
      });

      return newQuery.trim();
    }

    return query;
  };*/

  const handleOpenSavedSearches = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setOpenSavedSearches(event.currentTarget);
  };

  const classes = useStyles();

  function HelpTooltip(hClasses) {
    return (
      <Tooltip
        classes={{ tooltip: hClasses.customWidth }}
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
        <IconButton size="small" edge="end">
          <HelpOutlineIcon style={{ color: 'lightgray' }} />
        </IconButton>
      </Tooltip>
    );
  }

  function getTags(
    actions: Array<SearchOptionType>,
    action: ActionType
  ): TS.Tag[] {
    if (actions.length > 0) {
      const actionsArr = actions.filter(a => isAction(a.action, action));
      if (actionsArr.length > 0) {
        return actionsArr.map(a => ({
          title:
            a.label.indexOf(action.shortName) === 0
              ? a.label.substring(action.shortName.length)
              : action.fullName && a.label.indexOf(action.fullName) === 0
              ? a.label.substring(action.fullName.length)
              : a.label
        }));
      }
    }
    return [];
  }

  const executeSearch = () => {
    let query = inputValue.current;
    if (
      query.startsWith('ts:?ts') ||
      query.startsWith(AppConfig.tsProtocol + '?ts')
    ) {
      props.openLink(query, { fullWidth: false });
      clearSearch();
      return;
    }
    const tagsAND = getTags(
      actionValues.current,
      SearchQueryComposition.TAG_AND
    );
    const tagsOR = getTags(actionValues.current, SearchQueryComposition.TAG_OR);
    const tagsNOT = getTags(
      actionValues.current,
      SearchQueryComposition.TAG_NOT
    );
    // const tagsAND = parseTextQuery(textQuery.current, '+');
    // query = removeTagsFromQuery(tagsAND, query, '+');
    // const tagsOR = parseTextQuery(textQuery.current, '|');
    // query = removeTagsFromQuery(tagsOR, query, '|');
    // const tagsNOT = parseTextQuery(textQuery.current, '-');
    // query = removeTagsFromQuery(tagsNOT, query, '-');
    // query = removeActionsFromQuery(query, actionValues.current);

    const searchQuery: TS.SearchQuery = {
      textQuery: query,
      tagsAND,
      tagsOR,
      tagsNOT,
      searchBoxing,
      searchType: searchType.current,
      fileTypes: fileTypes.current,
      lastModified: lastModified.current,
      fileSize: fileSize.current,
      tagTimePeriodFrom: tagTimePeriodFrom.current,
      tagTimePeriodTo: tagTimePeriodTo.current,
      tagPlaceLat,
      tagPlaceLong,
      // tagPlaceRadius,
      maxSearchResults: props.maxSearchResults,
      currentDirectory: props.currentDirectory,
      forceIndexing: forceIndexing.current,
      showUnixHiddenEntries: props.showUnixHiddenEntries
    };
    console.log('Search object: ' + JSON.stringify(searchQuery));
    props.setSearchQuery(searchQuery);
  };

  const { indexing, isDesktop, open } = props;

  /*function parseOptions(options: Array<any>) {

    const parsed = [];
    let prevAction;
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      let label, action;
      if (typeof option === 'object') {
        label = option.label;
        action = option.label;
      } else {
        label = option;
        action = Object.values(SearchActions).find(a => option.startsWith(a));
      }
      if (!action) {
        parsed.push(option);
      }
      prevAction = action;
    }
    return parsed;
  }*/
  function changeOptions(action: string) {
    let optionsChanged = false;
    if (isAction(action, SearchActions.LOCATION)) {
      if (currentOptions.current !== action) {
        currentOptions.current = action;
        searchOptions.current = props.locations.map(location => {
          return {
            id: location.uuid,
            descr: location.path,
            action: ExecActions.OPEN_LOCATION,
            label: location.name
          };
        });
        optionsChanged = true;
      }
    } else if (isAction(action, SearchActions.HISTORY)) {
      if (currentOptions.current !== action) {
        currentOptions.current = action;
        // searchOptions.current = ... todo
      }
    } else if (
      isAction(action, SearchQueryComposition.TAG_AND) ||
      isAction(action, SearchQueryComposition.TAG_OR) ||
      isAction(action, SearchQueryComposition.TAG_NOT)
    ) {
      /*if (
        currentOptions.current !== SearchQueryComposition.TAG_AND ||
        currentOptions.current !== SearchQueryComposition.TAG_OR ||
        currentOptions.current !== SearchQueryComposition.TAG_NOT
      ) {*/
      currentOptions.current = action;
      const searchAction = toExecAction(action);
      const tagGroups = getTagLibrary();
      const options = [];
      for (let j = 0; j < tagGroups.length; j++) {
        tagGroups[j].children.forEach((tag: TS.Tag) => {
          options.push({
            id: tag.id,
            action: searchAction,
            label: tag.title,
            color: tag.color,
            textcolor: tag.textcolor,
            group: tagGroups[j].title
          });
        });
      }
      searchOptions.current = options;
      optionsChanged = true;
    } else if (isAction(action, SearchQueryComposition.TYPE)) {
      if (currentOptions.current !== SearchQueryComposition.TYPE.shortName) {
        currentOptions.current = action;
        const options = [];
        Object.entries(FileTypeGroups).forEach(([key, value]) => {
          options.push({
            id: key,
            action: ExecActions.TYPE_SEARCH,
            label: i18n.t('core:' + key),
            descr: value.join(', ')
          });
        });
        searchOptions.current = options;
        optionsChanged = true;
      }
    } else if (isAction(action, SearchQueryComposition.SIZE)) {
      if (currentOptions.current !== SearchQueryComposition.SIZE.shortName) {
        currentOptions.current = action;
        const options = [];

        Object.entries(FileSize).forEach(([key, value]) => {
          let descr = '';
          if (value > 0) {
            if (value < 1000000) {
              descr = value / 1000 + 'KB';
            } else if (value < 1000000000) {
              descr = value / 1000000 + 'MB';
            } else if (value === 1000000000) {
              descr = value / 1000000000 + 'G';
            } else {
              descr = 'over 1GB';
            }
          }
          options.push({
            id: key,
            action: ExecActions.SIZE_SEARCH,
            label: i18n.t('core:' + key),
            descr: descr
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

        Object.entries(LastModified).forEach(([key, value]) => {
          options.push({
            id: key,
            action: ExecActions.LAST_MODIFIED_SEARCH,
            label: i18n.t('core:' + key)
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
            label: i18n.t('core:' + key)
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
            label: i18n.t('core:' + key)
          });
        });
        searchOptions.current = options;
        optionsChanged = true;
      }
    } else {
      currentOptions.current = action;
      const execActionsArr = Object.values(ExecActions);
      if (execActionsArr.includes(action)) {
        searchOptions.current = SearchOptions.filter(
          option => option.group === 'query'
        );
        optionsChanged = true;
      } else {
        searchOptions.current = SearchOptions;
      }
    }

    if (optionsChanged) {
      isOpen.current = true;
      forceUpdate();
    }
  }

  function execActions(options: Array<any>, previousActions) {
    const actions: Array<SearchOptionType> = [];

    function setPreviousAction(
      key: ActionType,
      option: SearchOptionType
    ): string {
      if (actions.length > 0) {
        const prevAction = actions[actions.length - 1];
        if (isAction(prevAction.action, key)) {
          prevAction.label = prevAction.action + option.label;
          return option.id;
        }
      }
      return undefined;
    }

    for (let i = 0; i < options.length; i++) {
      let option: SearchOptionType;
      if (typeof options[i] === 'object') {
        option = {...options[i]};
      } else {
        const action = findAction(options[i]);
        option = {
          label: options[i],
          fullName: action,
          action: action
        };
      }
      const prevAction = previousActions.find(
        obj =>
          obj.action === option.action &&
          (obj.label === option.label || obj.fullName === option.fullName)
      );
      if (!prevAction) {
        if (isAction(option.action, SearchActions.LOCATION)) {
          changeOptions(option.action);
          actions.push(option);
        } else if (option.action === ExecActions.OPEN_LOCATION) {
          // props.exitSearchMode();
          searchOptions.current = SearchOptions;
          currentOptions.current = undefined;
          props.openLocationById(option.id);
          return [];
        } else if (isAction(option.action, SearchActions.FILTER)) {
          actions.push(option);
          isOpen.current = false;
        } else if (isAction(option.action, SearchActions.HISTORY)) {
          changeOptions(option.action);
          actions.push(option);
        } else if (option.action === ExecActions.OPEN_HISTORY) {
        } else if (
          isAction(option.action, SearchQueryComposition.TAG_AND) ||
          isAction(option.action, SearchQueryComposition.TAG_OR) ||
          isAction(option.action, SearchQueryComposition.TAG_NOT)
        ) {
          // if (props.currentLocation) {
          changeOptions(option.action);
          // }
          actions.push(option);
        } else if (
          option.action === ExecActions.TAG_SEARCH_AND ||
          option.action === ExecActions.TAG_SEARCH_OR ||
          option.action === ExecActions.TAG_SEARCH_NOT
        ) {
          const searchAction: string =
            option.action === ExecActions.TAG_SEARCH_AND
              ? SearchQueryComposition.TAG_AND.shortName
              : option.action === ExecActions.TAG_SEARCH_NOT
              ? SearchQueryComposition.TAG_NOT.shortName
              : SearchQueryComposition.TAG_OR.shortName;
          // executeSearch();

          if (actions.length > 0) {
            const prevAction = actions[actions.length - 1];
            prevAction.label = searchAction + option.label;
            prevAction.fullName = searchAction + option.label;
            prevAction.color = option.color;
            prevAction.textcolor = option.textcolor;
          }
          changeOptions(option.action);
        } else if (isAction(option.action, SearchQueryComposition.TYPE)) {
          changeOptions(option.action);
          actions.push(option);
        } else if (option.action === ExecActions.TYPE_SEARCH) {
          if (actions.length > 0) {
            const prevAction = actions[actions.length - 1];
            if (isAction(prevAction.action, SearchQueryComposition.TYPE)) {
              prevAction.label = prevAction.action + option.label;
              fileTypes.current = option.descr.split(', ');
            }
          }
          changeOptions(option.action);
          // executeSearch();
        } else if (isAction(option.action, SearchQueryComposition.SIZE)) {
          changeOptions(option.action);
          actions.push(option);
        } else if (option.action === ExecActions.SIZE_SEARCH) {
          const id = setPreviousAction(SearchQueryComposition.SIZE, option);
          if (id) {
            fileSize.current = id;
          }
          changeOptions(option.action);
          // executeSearch();
        } else if (
          isAction(option.action, SearchQueryComposition.LAST_MODIFIED)
        ) {
          changeOptions(option.action);
          actions.push(option);
        } else if (option.action === ExecActions.LAST_MODIFIED_SEARCH) {
          const id = setPreviousAction(
            SearchQueryComposition.LAST_MODIFIED,
            option
          );
          if (id) {
            lastModified.current = id;
          }
          changeOptions(option.action);
          // executeSearch();
        } else if (isAction(option.action, SearchQueryComposition.SCOPE)) {
          changeOptions(option.action);
          actions.push(option);
        } else if (option.action === ExecActions.SCOPE_SEARCH) {
          const id = setPreviousAction(SearchQueryComposition.SCOPE, option);
          if (id) {
            setSearchBoxing(scope[id]);
          }
          changeOptions(option.action);
          // executeSearch();
        } else if (isAction(option.action, SearchQueryComposition.ACCURACY)) {
          changeOptions(option.action);
          actions.push(option);
        } else if (option.action === ExecActions.ACCURACY_SEARCH) {
          const id = setPreviousAction(SearchQueryComposition.ACCURACY, option);
          if (id) {
            searchType.current = accuracy[id];
          }
          changeOptions(option.action);
          // executeSearch();
        } else if (option.action === undefined) {
          // text query
          inputValue.current = option.label;

          const pAction = actions[actions.length - 1];
          if (pAction && isAction(pAction.action, SearchActions.FILTER)) {
            if (option.label) {
              props.setSearchFilter(option.label);
              isOpen.current = false;
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

  /*function setTextQuery(actions) {
    let txtQuery = '';
    if (actions.length > 0) {
      actions.forEach(action => {
        if (
          action.action === ExecActions.TAG_SEARCH_AND ||
          ExecActions.TAG_SEARCH_OR ||
          ExecActions.TAG_SEARCH_NOT
        ) {
          txtQuery += ' ' + action.label;
        }
      });
    }
    textQuery.current =
      txtQuery.trim() + (inputValue.current ? ' ' + inputValue.current : '');
  }*/

  function handleInputChange(event: any, value: string, reason: string) {
    // handleChange(event, value.split(' '), 'createOption');
    if (reason === 'input') {
      const valueArr = value.split(' ');
      actionValues.current = execActions(
        [...actionValues.current, ...valueArr],
        actionValues.current
      );
      const inputArr = valueArr.filter(
        action => !actionValues.current.some(v => v.label === action)
      );
      inputValue.current = inputArr.join(' ');
      //textQuery.current += ' ' + inputValue.current;
      forceUpdate();
    } else if (reason === 'clear') {
      clearSearch();
    } else if (reason === 'reset') {
      if (event.type === 'keydown') {
        // textQuery.current += ' ' + inputValue.current;
        inputValue.current = '';
      } else if (event.type === 'blur') {
      }
      // executeSearch();
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
      actionValues.current = execActions(selected, actionValues.current);
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
              action: toExecAction(action)
            });
          } else {
            actions.push(option);
          }
        } else {
          actions.push(option);
        }
        prevOption = option;
      }
      actionValues.current = execActions(actions, actionValues.current);
      forceUpdate();
    } else if (reason === 'remove-value') {
      actionValues.current = actionValues.current.filter(
        v => !(selected.includes(v.label) || selected.includes(v.fullName))
      );
      // reset default search filters
      for (let i = 0; i < selected.length; i++) {
        const action = findAction(selected[i]);
        if (isAction(action, SearchQueryComposition.TYPE)) {
          fileTypes.current = [];
        } else if (isAction(action, SearchQueryComposition.SIZE)) {
          fileSize.current = '';
        }
      }

      if (actionValues.current.length === 0) {
        searchOptions.current = SearchOptions;
        currentOptions.current = undefined;
        // textQuery.current = ''; todo remove tagsAnd from search query
      } else {
        const prevAction =
          actionValues.current[actionValues.current.length - 1];
        changeOptions(toExecAction(prevAction.action));
        // textQuery.current = actionValues.current.map(v => v.label).join(' ');
      }
      // executeSearch();
      isOpen.current = true;
      forceUpdate();
    } /*else if (reason === 'clear') {
      props.setSearchQuery({});
    }*/
  }

  /*const handleOpen = React.useCallback(() => {
    isOpen.current = true;
  }, []);

  const handleClose = React.useCallback(() => {
    isOpen.current = false;
  }, []);*/

  if (!open) {
    return null;
  }
  return (
    <>
      <div
        style={{
          width: '100%',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Autocomplete
          id="textQuery"
          multiple
          /*autoFocus*/
          /*openOnFocus*/
          freeSolo
          autoSelect
          autoComplete
          handleHomeEndKeys
          /*defaultValue={['one']}*/
          value={actionValues.current.map(v =>
            v.fullName ? v.fullName : v.label
          )}
          onChange={handleChange}
          inputValue={inputValue.current}
          onInputChange={handleInputChange}
          open={isOpen.current}
          /*onOpen={handleOpen}
          onClose={handleClose}*/
          renderTags={value =>
            value.map((option, index: number) => {
              const action = actionValues.current.find(
                a => a.fullName === option || a.label === option
              );
              return (
                <Button
                  key={'button_' + index}
                  size="small"
                  style={{
                    fontSize: 13,
                    textTransform: 'none',
                    color: 'black',
                    backgroundColor: 'green',
                    minHeight: 0,
                    minWidth: 0,
                    margin: 2,
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingRight: 0,
                    paddingLeft: 5,
                    borderRadius: 5,
                    ...(action &&
                      action.color && {
                        color: action.textcolor,
                        backgroundColor: action.color
                      })
                  }}
                  onClick={() => {
                    handleChange(null, [option], 'remove-value');
                  }}
                >
                  {option}
                  <CloseIcon />
                </Button>
              );
            })
          }
          /*inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}*/
          options={searchOptions.current}
          groupBy={option => option.group}
          renderOption={(props, option) => (
            <Box
              component="li"
              style={{ ...(option.color && { backgroundColor: option.color }) }}
              {...props}
            >
              <b
                style={{ ...(option.textcolor && { color: option.textcolor }) }}
              >
                {option.label}
              </b>
              &nbsp;{option.descr}
            </Box>
          )}
          /*getOptionLabel={(option: SearchOptionType) =>
            option.label + ': ' + option.descr
          }*/
          sx={{ width: 'calc(100% - 80px)' }}
          onKeyDown={onKeyDownHandler}
          renderInput={params => (
            <TextField
              {...params}
              onBlur={() => {
                isOpen.current = false;
                forceUpdate();
              }}
              onFocus={() => {
                isOpen.current = true;
                forceUpdate();
              }}
              fullWidth
              /*id="textQuery"
              name="textQuery"*/
              label={i18n.t('core:searchTitle')}
              /*defaultValue={textQuery.current}*/
              /*onChange={event => {
                textQuery.current = event.target.value;
              }}*/
              /*style={{
        width: 'calc(100% - 80px)'
      }}*/
              /*inputRef={mainSearchField}*/
              autoFocus
              /*onKeyDown={startSearch}*/
              placeholder={i18n.t('core:searchTitle')}
              size="small"
              margin="dense"
              variant="outlined"
              /*InputProps={{
                startAdornment: (
                  <InputAdornment position="start" style={{ marginRight: 0 }}>
                    {isDesktop ? (
                      <>
                        <Tooltip
                          classes={{ tooltip: classes.customWidth }}
                          title={
                            <span style={{ fontSize: 14 }}>
                              {i18n.t('searchScope')}:
                              <br />
                              &bull; {i18n.t('location')} -{' '}
                              {i18n.t('searchPlaceholder')}
                              <br />
                              &bull; {i18n.t('folder')} -{' '}
                              {i18n.t('searchCurrentFolderWithSubFolders')}
                              <br />
                              &bull; {i18n.t('globalSearch')} -{' '}
                              {i18n.t('searchInAllLocationTooltip')} (
                              {i18n.t('betaStatus')})<br />
                            </span>
                          }
                        >
                          <Typography
                            variant="overline"
                            display="block"
                            onClick={toggleSearchBoxing}
                            style={{
                              border: '1px solid gray',
                              borderRadius: 5,
                              lineHeight: 'inherit',
                              paddingLeft: 3,
                              paddingRight: 3
                            }}
                          >
                            {searchBoxingName}
                          </Typography>
                        </Tooltip>
                        <HelpTooltip classes={classes} />
                      </>
                    ) : (
                      <HelpTooltip classes={classes} />
                    )}
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {isDesktop && (
                      <Tooltip title={i18n.t('core:savedSearchesTitle')}>
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={handleOpenSavedSearches}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={i18n.t('clearSearch') + ' (ESC)'}>
                      <IconButton
                        id="clearSearchID"
                        onClick={() => {
                          clearSearch();
                          // props.openCurrentDirectory();
                        }}
                        size="small"
                        edge="end"
                      >
                        <ClearSearchIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}*/
            />
          )}
        />
        <Tooltip title={indexing ? i18n.t('searchDisabledWhileIndexing') : ''}>
          <Button
            id="searchButton"
            variant="outlined"
            size="small"
            disabled={indexing}
            style={{
              marginRight: 10,
              marginLeft: 10
            }}
            color="primary"
            onClick={clickSearchButton}
          >
            {i18n.t('searchTitle')}
          </Button>
        </Tooltip>
      </div>
      <SavedSearchesMenu
        anchorEl={openSavedSearches}
        open={Boolean(openSavedSearches)}
        onClose={() => setOpenSavedSearches(null)}
      />
    </>
  );
}

function mapStateToProps(state) {
  return {
    indexing: isIndexing(state),
    searchQuery: getSearchQuery(state),
    isDesktop: isDesktopMode(state),
    currentDirectory: getDirectoryPath(state),
    indexedEntriesCount: getIndexedEntriesCount(state),
    maxSearchResults: getMaxSearchResults(state),
    showUnixHiddenEntries: getShowUnixHiddenEntries(state),
    language: getCurrentLanguage(state),
    locations: getLocations(state),
    currentLocation: getCurrentLocation(state),
    searchResultsCount: getSearchResultsCount(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      searchAllLocations: LocationIndexActions.searchAllLocations,
      setSearchQuery: LocationIndexActions.setSearchQuery,
      searchLocationIndex: LocationIndexActions.searchLocationIndex,
      createLocationsIndexes: LocationIndexActions.createLocationsIndexes,
      // loadDirectoryContent: AppActions.loadDirectoryContent,
      openLink: AppActions.openLink,
      openURLExternally: AppActions.openURLExternally,
      // openCurrentDirectory: AppActions.openCurrentDirectory,
      watchForChanges: AppActions.watchForChanges,
      openLocationById: AppActions.openLocationById,
      exitSearchMode: AppActions.exitSearchMode,
      setSearchFilter: AppActions.setSearchFilter
    },
    dispatch
  );
}

/*const areEqual = (prevProp, nextProp) =>
  nextProp.open === prevProp.open &&
  nextProp.language === prevProp.language &&
  nextProp.indexing === prevProp.indexing &&
  nextProp.searchQuery === prevProp.searchQuery &&
  nextProp.currentDirectory === prevProp.currentDirectory &&
  nextProp.indexedEntriesCount === prevProp.indexedEntriesCount;*/

export default connect(mapStateToProps, mapDispatchToProps)(SearchAutocomplete); // (React.memo(SearchAutocomplete, areEqual));
