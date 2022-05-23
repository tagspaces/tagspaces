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

import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import ClearSearchIcon from '@material-ui/icons/Close';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
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
  getShowUnixHiddenEntries
} from '-/reducers/settings';
import i18n from '-/services/i18n';
import { FileTypeGroups } from '-/services/search';
import { TS } from '-/tagspaces.namespace';
import { Pro } from '../pro';
import {
  escapeRegExp,
  parseTextQuery,
  removeAllTagsFromSearchQuery
} from '-/utils/misc';
import useFirstRender from '-/utils/useFirstRender';
import MainSearchField from '-/components/MainSearchField';

// type PropsClasses = Record<keyof StyleProps, string>;

interface Props {
  style?: any;
  searchLocationIndex: (searchQuery: TS.SearchQuery) => void;
  createLocationsIndexes: () => void;
  searchAllLocations: (searchQuery: TS.SearchQuery) => void;
  loadDirectoryContent: (path: string, generateThumbnails: boolean) => void;
  openURLExternally: (url: string) => void;
  searchQuery: TS.SearchQuery; // () => any;
  openCurrentDirectory: () => void;
  setSearchQuery: (searchQuery: TS.SearchQuery) => void;
  currentDirectory: string;
  indexedEntriesCount: number;
  maxSearchResults: number;
  indexing: boolean;
  showUnixHiddenEntries: boolean;
  isDesktop: boolean;
}

const useStyles = makeStyles(theme => ({
  customWidth: {
    maxWidth: 550
  },
  noMaxWidth: {
    maxWidth: 'none'
  }
}));

const SearchInline = (props: Props) => {
  // const [, forceUpdate] = useReducer(x => x + 1, 0);
  const textQuery = useRef<string>(props.searchQuery.textQuery);
  const textQueryMask = useRef<string>('');
  const fileTypes = useRef<Array<string>>(
    props.searchQuery.fileTypes
      ? props.searchQuery.fileTypes
      : FileTypeGroups.any
  );

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
    if (!firstRender) {
      if (Object.keys(props.searchQuery).length > 0) {
        props.setSearchQuery({});
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
      let emptySearch: boolean = true;
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
      const txtQuery = removeAllTagsFromSearchQuery(textQuery.current);
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
      mainSearchField.current.value =
        txtQuery +
        (textQueryMask.current ? ' ' + textQueryMask.current.trim() : '');
      // }
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
      executeSearch();
    } else if (event.key === 'Escape' || event.keyCode === 27) {
      clearSearch();
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
    props.openCurrentDirectory();
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

  const classes = useStyles();
  const HelpTooltip = hClasses => (
    <Tooltip
      arrow
      classes={{ tooltip: hClasses.customWidth }}
      interactive
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
              "|beach |sunset" - will find all files and folder having the tags
              beach or sunset
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

  const executeSearch = () => {
    let query = textQuery.current;
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

  const { indexing, isDesktop } = props;

  return (
    <div
      style={{
        width: '100%',
        whiteSpace: 'nowrap'
      }}
    >
      <MainSearchField
        fullWidth
        id="textQuery"
        name="textQuery"
        defaultValue={textQuery.current}
        variant="outlined"
        onChange={event => {
          textQuery.current = event.target.value;
        }}
        size="small"
        style={{
          marginTop: 10,
          width: 'calc(100% - 80px)'
        }}
        inputRef={mainSearchField}
        margin="dense"
        autoFocus
        onKeyDown={startSearch}
        placeholder={i18n.t('core:searchTitle')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" style={{ marginRight: 0 }}>
              {isDesktop ? (
                <Tooltip
                  arrow
                  classes={{ tooltip: classes.customWidth }}
                  interactive
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
              ) : (
                <HelpTooltip classes={classes} />
              )}
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isDesktop && <HelpTooltip classes={classes} />}
              <Tooltip title={i18n.t('clearSearch') + ' (ESC)'}>
                <IconButton
                  id="clearSearchID"
                  onClick={clearSearch}
                  size="small"
                  edge="end"
                >
                  <ClearSearchIcon />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        }}
      />
      <Tooltip title={indexing ? i18n.t('searchDisabledWhileIndexing') : ''}>
        <Button
          id="searchButton"
          variant="outlined"
          size="small"
          disabled={indexing}
          style={{
            marginRight: 10,
            marginLeft: 10,
            marginTop: 10
          }}
          color="primary"
          onClick={clickSearchButton}
        >
          {i18n.t('searchTitle')}
        </Button>
      </Tooltip>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    indexing: isIndexing(state),
    searchQuery: getSearchQuery(state),
    isDesktop: isDesktopMode(state),
    currentDirectory: getDirectoryPath(state),
    indexedEntriesCount: getIndexedEntriesCount(state),
    maxSearchResults: getMaxSearchResults(state),
    showUnixHiddenEntries: getShowUnixHiddenEntries(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      searchAllLocations: LocationIndexActions.searchAllLocations,
      setSearchQuery: LocationIndexActions.setSearchQuery,
      searchLocationIndex: LocationIndexActions.searchLocationIndex,
      createLocationsIndexes: LocationIndexActions.createLocationsIndexes,
      loadDirectoryContent: AppActions.loadDirectoryContent,
      openURLExternally: AppActions.openURLExternally,
      openCurrentDirectory: AppActions.openCurrentDirectory
    },
    dispatch
  );
}

const areEqual = (prevProp, nextProp) =>
  nextProp.indexing === prevProp.indexing &&
  nextProp.searchQuery === prevProp.searchQuery &&
  nextProp.currentDirectory === prevProp.currentDirectory &&
  nextProp.indexedEntriesCount === prevProp.indexedEntriesCount;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(SearchInline, areEqual));
