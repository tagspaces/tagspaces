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
import { makeStyles, Theme } from '@material-ui/core/styles';
import ClearSearchIcon from '@material-ui/icons/Clear';
import { actions as AppActions, getDirectoryPath } from '../reducers/app';
import {
  actions as LocationIndexActions,
  getIndexedEntriesCount,
  isIndexing,
  getSearchQuery
} from '../reducers/location-index';
import {
  getMaxSearchResults,
  getShowUnixHiddenEntries
} from '-/reducers/settings';
import { styles, StyleProps } from './SearchInline.css';
import i18n from '../services/i18n';
import { FileTypeGroups } from '-/services/search';
import { TS } from '-/tagspaces.namespace';
import {
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  ButtonGroup,
  Button,
  Grid
} from '@material-ui/core';

type PropsClasses = Record<keyof StyleProps, string>;

interface Props {
  style?: any;
  searchLocationIndex: (searchQuery: TS.SearchQuery) => void;
  createLocationsIndexes: () => void;
  searchAllLocations: (searchQuery: TS.SearchQuery) => void;
  loadDirectoryContent: (path: string, generateThumbnails: boolean) => void;
  openURLExternally: (url: string) => void;
  searchQuery: TS.SearchQuery; // () => any;
  setSearchResults: (entries: Array<any>) => void;
  setSearchQuery: (searchQuery: TS.SearchQuery) => void;
  currentDirectory: string;
  indexedEntriesCount: number;
  maxSearchResults: number;
  indexing: boolean;
  showUnixHiddenEntries: boolean;
}

const useStyles = makeStyles<Theme, StyleProps>(styles);

const SearchInline = (props: Props) => {
  const classes: PropsClasses = useStyles({} as StyleProps);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const textQuery = useRef<string>(props.searchQuery.textQuery);
  const fileTypes = useRef<Array<string>>(
    props.searchQuery.fileTypes
      ? props.searchQuery.fileTypes
      : FileTypeGroups.any
  );

  const searchBoxing = useRef<'location' | 'folder' | 'global'>(
    props.searchQuery.searchBoxing ? props.searchQuery.searchBoxing : 'location'
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

  useEffect(() => {
    // https://github.com/mui-org/material-ui/issues/1594
    const timeout = setTimeout(() => {
      if (mainSearchField && mainSearchField.current) {
        mainSearchField.current.focus();
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    textQuery.current = props.searchQuery.textQuery;
  }, [props.searchQuery]);

  const mergeWithExtractedTags = (tags: Array<TS.Tag>, identifier: string) => {
    const extractedTags = parseTextQuery(identifier);
    if (tags) {
      if (extractedTags.length > 0) {
        return getUniqueTags(tags, extractedTags);
      }
      return tags;
    }
    if (extractedTags.length > 0) {
      return extractedTags;
    }
    return undefined;
  };

  function getUniqueTags(tags1: Array<TS.Tag>, tags2: Array<TS.Tag>) {
    const mergedArray = [...tags1, ...tags2];
    // mergedArray have duplicates, lets remove the duplicates using Set
    const set = new Set();
    return mergedArray.filter(tag => {
      if (!set.has(tag.title)) {
        set.add(tag.title);
        return true;
      }
      return false;
    }, set);
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  const parseTextQuery = (identifier: string) => {
    const extractedTags = [];
    let query = textQuery.current;
    if (query && query.length > 0) {
      query = query
        .trim()
        .replace(
          new RegExp(escapeRegExp(identifier) + '\\s+', 'g'),
          identifier
        );
    }
    const textQueryParts = query.split(' ');
    let newTextQuery = '';
    if (textQueryParts) {
      // && textQueryParts.length > 1) {
      textQueryParts.forEach(part => {
        const trimmedPart = part.trim();
        if (trimmedPart.startsWith(identifier)) {
          const tagTitle = trimmedPart.substr(1).trim();
          extractedTags.push({ title: tagTitle });
        } /* else if (trimmedPart.startsWith('-')) {
          // add to searchQuery.tagsNOT
        } else if (trimmedPart.startsWith('?')) {
          // add to searchQuery.tagsOR
        */ else {
          newTextQuery += trimmedPart + ' ';
        }
      });
    }
    textQuery.current = newTextQuery.trim();
    return extractedTags;
  };

  const clickSearchButton = () => {
    executeSearch();
  };

  const startSearch = event => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      executeSearch();
    }
  };

  function openCurrentDirectory() {
    if (props.currentDirectory) {
      props.loadDirectoryContent(props.currentDirectory, false);
    } else {
      props.setSearchResults([]);
    }
  }

  const clearSearch = () => {
    textQuery.current = '';
    searchBoxing.current = 'location';
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
    openCurrentDirectory();
  };

  const executeSearch = () => {
    const { searchAllLocations, searchLocationIndex } = props;
    const tagsAND = mergeWithExtractedTags(props.searchQuery.tagsAND, '+');
    const tagsOR = mergeWithExtractedTags(props.searchQuery.tagsOR, '?');
    const tagsNOT = mergeWithExtractedTags(props.searchQuery.tagsNOT, '-');
    const searchQuery: TS.SearchQuery = {
      textQuery: textQuery.current,
      tagsAND,
      tagsOR,
      tagsNOT,
      // @ts-ignore
      searchBoxing: searchBoxing.current,
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
    if (searchBoxing.current === 'global') {
      searchAllLocations(searchQuery);
    } else {
      searchLocationIndex(searchQuery);
    }
  };

  const { indexing } = props;

  return (
    <div className={classes.panel} style={{ ...props.style, width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={10}>
          <OutlinedInput
            style={{
              width: '100%'
            }}
            id="textQuery"
            name="textQuery"
            value={textQuery.current}
            onChange={event => {
              textQuery.current = event.target.value;
              // rerender
              forceUpdate();
            }}
            inputRef={mainSearchField}
            margin="dense"
            autoFocus
            onKeyDown={startSearch}
            title={i18n.t('core:searchWordsWithInterval')}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  id="clearSearchID"
                  onClick={clearSearch}
                  size="small"
                  edge="end"
                >
                  <ClearSearchIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            id="searchButton"
            variant="outlined"
            style={{
              width: '100%',
              height: '100%'
            }}
            disabled={indexing}
            // variant="outlined"
            color="primary"
            onClick={clickSearchButton}
            size="medium"
          >
            {indexing
              ? 'Search disabled while indexing'
              : i18n.t('searchTitle')}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    indexing: isIndexing(state),
    searchQuery: getSearchQuery(state),
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
      setSearchResults: AppActions.setSearchResults
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
