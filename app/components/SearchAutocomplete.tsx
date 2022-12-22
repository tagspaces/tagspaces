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
import { actions as AppActions, getDirectoryPath } from '../reducers/app';
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
  ExecActions,
  findAction,
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
  const textQuery = useRef<string>(props.searchQuery.textQuery || '');
  const textQueryMask = useRef<string>('');
  const fileTypes = useRef<Array<string>>(
    props.searchQuery.fileTypes
      ? props.searchQuery.fileTypes
      : FileTypeGroups.any
  );
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const actionValues = useRef<Array<SearchOptionType>>([]);
  const inputValue = useRef<string>('');

  // const searchBoxing = useRef<'location' | 'folder' | 'global'>(
  //   props.searchQuery.searchBoxing ? props.searchQuery.searchBoxing : 'location'
  // );
  const [searchBoxing, setSearchBoxing] = useState(
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

  const firstRender = useFirstRender();

  useEffect(() => {
    /*if (!firstRender) {
      if (Object.keys(props.searchQuery).length > 0) {
        props.setSearchQuery({});
      }
    }*/
    if (!firstRender && !props.open) {
      if (Object.keys(props.searchQuery).length > 0) {
        clearSearch();
      }
    }
  }, [props.currentDirectory]);

  let searchBoxingName = i18n.t('location');
  if (searchBoxing === 'global') {
    searchBoxingName = i18n.t('globalSearch');
  } else if (searchBoxing === 'folder') {
    searchBoxingName = i18n.t('folder');
  }

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
      let txtQuery = textQuery.current.trim() || props.searchQuery.textQuery;
      txtQuery = removeAllTagsFromSearchQuery(txtQuery);
      if (txtQuery) {
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
        textQuery: txtQuery
      };
      /* if (textQuery.current) {
        txtQuery = textQuery.current.replace(tagsMask, '');
      } else {
        txtQuery = props.searchQuery.textQuery || '';
      }
      */
      textQuery.current = txtQuery + ' ' + textQueryMask.current.trim();
      if (mainSearchField.current) {
        mainSearchField.current.value =
          txtQuery +
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

  const toggleSearchBoxing = () => {
    if (searchBoxing === 'location') {
      setSearchBoxing('folder');
    } else if (searchBoxing === 'folder' && Pro) {
      setSearchBoxing('global');
    } else {
      setSearchBoxing('location');
    }
  };

  const clickSearchButton = () => {
    executeSearch();
  };

  const startSearch = event => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      // executeSearch();
    } else if (event.key === 'Escape' || event.keyCode === 27) {
      clearSearch();
      // props.openCurrentDirectory();
    }
  };

  const clearSearch = () => {
    textQuery.current = '';
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

  const removeTagsFromQuery = (
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
  };

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

  const executeSearch = () => {
    let query = textQuery.current;
    if (
      query.startsWith('ts:?ts') ||
      query.startsWith(AppConfig.tsProtocol + '?ts')
    ) {
      props.openLink(query, { fullWidth: false });
      clearSearch();
      return;
    }
    const tagsAND = parseTextQuery(textQuery.current, '+');
    query = removeTagsFromQuery(tagsAND, query, '+');
    const tagsOR = parseTextQuery(textQuery.current, '|');
    query = removeTagsFromQuery(tagsOR, query, '|');
    const tagsNOT = parseTextQuery(textQuery.current, '-');
    query = removeTagsFromQuery(tagsNOT, query, '-');
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
  function changeOptions(option: string) {
    if (SearchActions.LOCATION === option) {
      if (currentOptions.current !== option) {
        currentOptions.current = option;
        searchOptions.current = props.locations.map(location => {
          return {
            id: location.uuid,
            descr: location.path,
            action: ExecActions.OPEN_LOCATION,
            label: location.name
          };
        });
      }
    } else if (SearchActions.HISTORY === option) {
      if (currentOptions.current !== option) {
        currentOptions.current = option;
        // searchOptions.current = ... todo
      }
    } else if (
      option === SearchQueryComposition.TAG_AND ||
      option === SearchQueryComposition.TAG_OR ||
      option === SearchQueryComposition.TAG_NOT
    ) {
      if (
        currentOptions.current !== SearchQueryComposition.TAG_AND ||
        currentOptions.current === SearchQueryComposition.TAG_OR ||
        currentOptions.current === SearchQueryComposition.TAG_NOT
      ) {
        currentOptions.current = option;
        const searchAction =
          option === SearchQueryComposition.TAG_AND
            ? ExecActions.TAG_SEARCH_AND
            : option === SearchQueryComposition.TAG_NOT
            ? ExecActions.TAG_SEARCH_NOT
            : ExecActions.TAG_SEARCH_OR;
        const tagGroups = getTagLibrary();
        const options = [];
        for (let j = 0; j < tagGroups.length; j++) {
          tagGroups[j].children.forEach((tag: TS.Tag) => {
            options.push({
              id: tag.id,
              action: searchAction,
              label: tag.title,
              group: tagGroups[j].title
            });
          });
        }
        searchOptions.current = options;
      }
    }
  }

  function execActions(options: Array<any>) {
    const actions: Array<SearchOptionType> = [];
    for (let i = 0; i < options.length; i++) {
      let option: SearchOptionType;
      if (typeof options[i] === 'object') {
        option = options[i];
      } else {
        option = {
          label: options[i],
          action: findAction(options[i])
        };
      }
      if (!actionValues.current.some(obj => obj.action === option.action)) {
        if (option.action === SearchActions.LOCATION) {
          changeOptions(option.action);
          actions.push(option);
        } else if (option.action === ExecActions.OPEN_LOCATION) {
          props.openLocationById(option.id);
        } else if (option.action === SearchActions.HISTORY) {
          changeOptions(option.action);
          actions.push(option);
        } else if (option.action === ExecActions.OPEN_HISTORY) {
        } else if (
          option.action === SearchQueryComposition.TAG_AND ||
          option.action === SearchQueryComposition.TAG_OR ||
          option.action === SearchQueryComposition.TAG_NOT
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
          const searchAction =
            option.action === ExecActions.TAG_SEARCH_AND
              ? SearchQueryComposition.TAG_AND
              : option.action === ExecActions.TAG_SEARCH_NOT
              ? SearchQueryComposition.TAG_NOT
              : SearchQueryComposition.TAG_OR;
          if (textQuery.current.indexOf(searchAction + option.label) === -1) {
            textQuery.current += ' ' + searchAction + option.label;
          }
          // executeSearch();

          if (actions.length > 0) {
            const prevAction = actions[actions.length - 1];
            prevAction.label = searchAction + option.label;
          }
        }
      } else {
        actions.push(option);
      }
    }
    return actions;
  }

  function handleInputChange(event: Object, value: string, reason: string) {
    // handleChange(event, value.split(' '), 'createOption');
    if (reason === 'input') {
      const valueArr = value.split(' ');
      actionValues.current = execActions([
        ...actionValues.current,
        ...valueArr
      ]);
      const inputArr = valueArr.filter(
        action => !actionValues.current.some(v => v.label === action)
      );
      inputValue.current = inputArr.join(' ');
      textQuery.current = inputValue.current;
      forceUpdate();
    } else if (reason === 'clear') {
      clearSearch();
    } else if (reason === 'reset') {
      inputValue.current = '';
      // executeSearch();
    }
  }
  function handleChange(event: Object, selected: Array<any>, reason: string) {
    if (reason === 'selectOption') {
      actionValues.current = execActions(selected);
      //textQuery.current = txtQuery.trim();
      forceUpdate();
    } else if (reason === 'createOption') {
      actionValues.current = execActions(selected);
      forceUpdate();
    } else if (reason === 'remove-value') {
      actionValues.current = actionValues.current.filter(
        v => !selected.includes(v.label)
      );
      if (actionValues.current.length === 0) {
        searchOptions.current = SearchOptions;
        textQuery.current = '';
      } else {
        textQuery.current = actionValues.current.map(v => v.label).join(' ');
      }
      // executeSearch();
      //forceUpdate();
    } else if (reason === 'clear') {
      props.setSearchQuery({});
    }
  }

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
          openOnFocus
          freeSolo
          autoSelect
          autoComplete
          handleHomeEndKeys
          /*defaultValue={['one']}*/
          value={actionValues.current.map(v => v.label)}
          onChange={handleChange}
          inputValue={inputValue.current}
          onInputChange={handleInputChange}
          renderTags={value =>
            value.map((option, index: number) => (
              <Button
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
                  borderRadius: 5
                }}
                onClick={() => {
                  handleChange(null, [option], 'remove-value');
                }}
              >
                {option}
                <CloseIcon />
              </Button>
            ))
          }
          /*inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}*/
          options={searchOptions.current}
          groupBy={option => option.group}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <b>{option.label}</b>&nbsp;{option.descr}
            </Box>
          )}
          /*getOptionLabel={(option: SearchOptionType) =>
            option.label + ': ' + option.descr
          }*/
          sx={{ width: 'calc(100% - 80px)' }}
          onKeyDown={startSearch}
          renderInput={params => (
            <TextField
              {...params}
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
    currentLocation: getCurrentLocation(state)
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
      openLocationById: AppActions.openLocationById
    },
    dispatch
  );
}

const areEqual = (prevProp, nextProp) =>
  nextProp.open === prevProp.open &&
  nextProp.language === prevProp.language &&
  nextProp.indexing === prevProp.indexing &&
  nextProp.searchQuery === prevProp.searchQuery &&
  nextProp.currentDirectory === prevProp.currentDirectory &&
  nextProp.indexedEntriesCount === prevProp.indexedEntriesCount;

export default connect(mapStateToProps, mapDispatchToProps)(SearchAutocomplete); // (React.memo(SearchAutocomplete, areEqual));
