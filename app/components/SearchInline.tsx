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
import { makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import format from 'date-fns/format';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import PictureIcon from '@material-ui/icons/Panorama';
import DocumentIcon from '@material-ui/icons/PictureAsPdf';
import NoteIcon from '@material-ui/icons/Note';
import AudioIcon from '@material-ui/icons/MusicVideo';
import VideoIcon from '@material-ui/icons/OndemandVideo';
import ArchiveIcon from '@material-ui/icons/Archive';
import FolderIcon from '@material-ui/icons/FolderOpen';
import UntaggedIcon from '@material-ui/icons/LabelOffOutlined';
import FileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import ClearSearchIcon from '@material-ui/icons/Clear';
import BookmarkIcon from '@material-ui/icons/BookmarkBorder';
import BookIcon from '@material-ui/icons/LocalLibraryOutlined';
// import PlaceIcon from '@material-ui/icons/Place';
import DateIcon from '@material-ui/icons/DateRange';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
// import { FormControlLabel, Switch } from '@material-ui/core';
import TagsSelect from './TagsSelect';
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
import { Pro } from '../pro';
import SearchMenu from './menus/SearchMenu';
import { formatDateTime, extractTimePeriod } from '-/utils/dates';
import { parseGeoLocation, parseLatLon } from '-/utils/misc';
import { AppConfig } from '-/config';
import { actions as SearchActions, getSearches } from '-/reducers/searches';
import { TS } from '-/tagspaces.namespace';
import { ProLabel, BetaLabel, ProTooltip } from '-/components/HelperComponents';

// const SaveSearchDialog = Pro && Pro.UI ? Pro.UI.SaveSearchDialog : false;

type PropsClasses = Record<keyof StyleProps, string>;

interface Props {
  classes?: PropsClasses;
  style?: any;
  theme?: any;
  searchLocationIndex: (searchQuery: TS.SearchQuery) => void;
  createLocationsIndexes: () => void;
  searchAllLocations: (searchQuery: TS.SearchQuery) => void;
  loadDirectoryContent: (path: string, generateThumbnails: boolean) => void;
  openURLExternally: (url: string) => void;
  hideDrawer?: () => void;
  searchQuery: TS.SearchQuery; // () => any;
  setSearchResults: (entries: Array<any>) => void;
  setSearchQuery: (searchQuery: TS.SearchQuery) => void;
  currentDirectory: string;
  indexedEntriesCount: number;
  maxSearchResults: number;
  indexing: boolean;
  searches: Array<TS.SearchQuery>;
  addSearches: (searches: Array<TS.SearchQuery>) => void;
  showUnixHiddenEntries: boolean;
}

const useStyles = makeStyles<Theme, StyleProps>(styles);

const SearchInline = (props: Props) => {
  const classes: PropsClasses = useStyles({} as StyleProps);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const textQuery = useRef<string>(props.searchQuery.textQuery);
  // const tagsAND = useRef<Array<TS.Tag>>(props.searchQuery.tagsAND);
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
  const [saveSearchDialogOpened, setSaveSearchDialogOpened] = useState<
    TS.SearchQuery
  >(undefined);
  const tagTimePeriod = useRef<string>('');
  const tagTimePeriodHelper = useRef<string>(' ');
  const [tagPlace, setTagPlace] = useState<string>(' ');
  const [tagPlaceHelper, setTagPlaceHelper] = useState<string>(' ');
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
  const [
    searchMenuAnchorEl,
    setSearchMenuAnchorEl
  ] = useState<null | HTMLElement>(null);

  const [
    isExportSearchesDialogOpened,
    setExportSearchesDialogOpened
  ] = useState<boolean>(false);

  const ExportSearchesDialog =
    Pro && Pro.UI ? Pro.UI.ExportSearchesDialog : false;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importFile, setImportFile] = useState<File>(undefined);

  const ImportSearchesDialog =
    Pro && Pro.UI ? Pro.UI.ImportSearchesDialog : false;

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

  function handleFileInputChange(selection: any) {
    const target = selection.currentTarget;
    const file = target.files[0];
    setImportFile(file);
    target.value = null;
  }

  const handleFileTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'fileTypes') {
      const types = JSON.parse(value);
      fileTypes.current = types;
      if (searchBoxing.current !== 'global') {
        props.searchLocationIndex({
          ...props.searchQuery,
          fileTypes: types,
          showUnixHiddenEntries: props.showUnixHiddenEntries
        });
      }
    }
  };

  const handleFileSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'fileSize') {
      fileSize.current = value;
      if (searchBoxing.current !== 'global') {
        props.searchLocationIndex({
          ...props.searchQuery,
          fileSize: value,
          showUnixHiddenEntries: props.showUnixHiddenEntries
        });
      }
    }
  };

  const handleLastModifiedChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'lastModified') {
      lastModified.current = value;
      if (searchBoxing.current !== 'global') {
        props.searchLocationIndex({
          ...props.searchQuery,
          lastModified: value,
          showUnixHiddenEntries: props.showUnixHiddenEntries
        });
      }
    }
  };

  const handleSavedSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { target } = event;
    const { value } = target;

    const savedSearch = props.searches.find(search => search.uuid === value);
    if (!savedSearch) {
      return true;
    }
    textQuery.current = savedSearch.textQuery;
    fileTypes.current = savedSearch.fileTypes;
    lastModified.current = savedSearch.lastModified;
    fileSize.current = savedSearch.fileSize;
    searchType.current = savedSearch.searchType;
    searchBoxing.current = savedSearch.searchBoxing;
    forceIndexing.current = savedSearch.forceIndexing;

    let ttPeriod;
    tagTimePeriodFrom.current = savedSearch.tagTimePeriodFrom;
    if (savedSearch.tagTimePeriodFrom) {
      ttPeriod = format(new Date(savedSearch.tagTimePeriodFrom), 'yyyyMMdd');
    }

    tagTimePeriodTo.current = savedSearch.tagTimePeriodTo;
    if (savedSearch.tagTimePeriodTo) {
      ttPeriod +=
        '-' + format(new Date(savedSearch.tagTimePeriodTo), 'yyyyMMdd');
    }

    if (ttPeriod) {
      tagTimePeriod.current = ttPeriod;
    }

    if (savedSearch.searchBoxing === 'global') {
      props.searchAllLocations({
        ...savedSearch,
        showUnixHiddenEntries: props.showUnixHiddenEntries
      });
    } else {
      props.searchLocationIndex({
        ...savedSearch,
        showUnixHiddenEntries: props.showUnixHiddenEntries
      });
    }
  };

  function removeTags(tagsArray, removeTagsArray) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    return tagsArray.filter(tag =>
      removeTagsArray.some(valueTag => valueTag.title !== tag.title)
    );
  }

  const handleTagFieldChange = (name, value, reason) => {
    let searchQuery;
    if (reason === 'remove-value') {
      if (name === 'tagsAND') {
        searchQuery = {
          ...props.searchQuery,
          tagsAND: removeTags(props.searchQuery.tagsAND, value)
        };
      } else if (name === 'tagsNOT') {
        searchQuery = {
          ...props.searchQuery,
          tagsNOT: removeTags(props.searchQuery.tagsNOT, value)
        };
      } else if (name === 'tagsOR') {
        searchQuery = {
          ...props.searchQuery,
          tagsOR: removeTags(props.searchQuery.tagsOR, value)
        };
      }
      if (!haveSearchFilters(searchQuery)) {
        clearSearch();
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (name === 'tagsAND') {
        searchQuery = { ...props.searchQuery, tagsAND: value };
      } else if (name === 'tagsNOT') {
        searchQuery = { ...props.searchQuery, tagsNOT: value };
      } else if (name === 'tagsOR') {
        searchQuery = { ...props.searchQuery, tagsOR: value };
      }
    }
    props.searchLocationIndex({
      ...searchQuery,
      showUnixHiddenEntries: props.showUnixHiddenEntries
    });
    // if (searchBoxing !== 'global') { // TODO disable automatic search in global mode
    //
    // }
  };

  function haveSearchFilters(searchQuery) {
    return (
      searchQuery.textQuery ||
      (searchQuery.tagsAND !== undefined && searchQuery.tagsAND.length > 0) ||
      (searchQuery.tagsNOT !== undefined && searchQuery.tagsNOT.length > 0) ||
      (searchQuery.tagsOR !== undefined && searchQuery.tagsOR.length > 0) ||
      (searchQuery.fileTypes !== undefined &&
        searchQuery.fileTypes !== FileTypeGroups.any) ||
      searchQuery.lastModified ||
      searchQuery.tagTimePeriodFrom ||
      searchQuery.tagTimePeriodTo ||
      searchQuery.tagPlaceLat ||
      searchQuery.tagPlaceLong ||
      searchQuery.fileSize
    );
  }

  const handleTimePeriodChange = event => {
    const { target } = event;
    const { value } = target;
    const { fromDateTime, toDateTime } = extractTimePeriod(value);

    if (toDateTime && fromDateTime) {
      const tagTPeriodHelper =
        'From: ' +
        formatDateTime(fromDateTime) +
        ' To: ' +
        formatDateTime(toDateTime);
      tagTimePeriodFrom.current = fromDateTime.getTime();
      tagTimePeriodTo.current = toDateTime.getTime();
      tagTimePeriodHelper.current = tagTPeriodHelper;
    } else {
      tagTimePeriodFrom.current = null;
      tagTimePeriodTo.current = null;
      tagTimePeriodHelper.current = ' ';
    }
    tagTimePeriod.current = value;
    forceUpdate();
  };

  const handlePlaceChange = event => {
    const { target } = event;
    const { value } = target;
    let lat = null;
    let lng = null;
    let tagPHelper;

    const location = parseGeoLocation(value);
    if (location !== undefined) {
      ({ lat, lng } = location);
    } else {
      const latLon = parseLatLon(value);
      if (latLon) {
        ({ lat } = latLon);
        lng = latLon.lon;
      }
    }

    if (lat && lng) {
      tagPHelper = 'Place at lat: ' + lat + ' long: ' + lng;
    } else {
      tagPHelper = '';
    }
    setTagPlace(value);
    setTagPlaceLat(lat);
    setTagPlaceLong(lng);
    setTagPlaceHelper(tagPHelper);
  };

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
    if (props.hideDrawer) {
      props.hideDrawer();
    }
  };

  const startSearch = event => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      if (props.hideDrawer) {
        props.hideDrawer();
      }
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
    setTagPlace(' ');
    setTagPlaceHelper(' ');
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

  const saveSearch = (isNew: boolean = true) => {
    const tagsAND = mergeWithExtractedTags(props.searchQuery.tagsAND, '+');
    const tagsOR = mergeWithExtractedTags(props.searchQuery.tagsOR, '?');
    const tagsNOT = mergeWithExtractedTags(props.searchQuery.tagsNOT, '-');
    setSaveSearchDialogOpened({
      uuid: isNew ? undefined : props.searchQuery.uuid,
      title: props.searchQuery.title,
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
      forceIndexing: forceIndexing.current
    });
  };

  const switchSearchBoxing = (
    event: React.MouseEvent<HTMLElement>,
    boxing: 'location' | 'folder' | 'global'
  ) => {
    if (boxing !== null) {
      searchBoxing.current = boxing;
      forceUpdate();
    }
  };

  const switchSearchType = (
    event: React.MouseEvent<HTMLElement>,
    type: 'fuzzy' | 'semistrict' | 'strict'
  ) => {
    if (type !== null) {
      searchType.current = type;
      forceUpdate();
    }
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

  const handleSearchMenu = (event: any) => {
    setSearchMenuAnchorEl(event.currentTarget);
  };

  const handleCloseSearchMenu = () => {
    setSearchMenuAnchorEl(null);
  };

  const { indexing, indexedEntriesCount } = props;

  const indexStatus = indexedEntriesCount
    ? indexedEntriesCount + ' indexed entries'
    : '';
  return (
    <div className={classes.panel} style={{ ...props.style, width: '100%' }}>
      {/*<div className={classes.toolbar}>
        <Typography
          className={classNames(classes.panelTitle, classes.header)}
          style={{ flex: 0 }}
        >
          {i18n.t('searchTitle')}
        </Typography>
        <Typography
          variant="caption"
          className={classes.header}
          style={{ alignSelf: 'center', paddingLeft: 5, display: 'block' }}
        >
          {indexStatus}
        </Typography>
        <IconButton
          style={{ marginLeft: 'auto' }}
          data-tid="searchMenu"
          onClick={handleSearchMenu}
        >
          <MoreVertIcon />
        </IconButton>
      </div>
      <SearchMenu
        anchorEl={searchMenuAnchorEl}
        open={Boolean(searchMenuAnchorEl)}
        onClose={handleCloseSearchMenu}
        createLocationsIndexes={props.createLocationsIndexes}
        openURLExternally={props.openURLExternally}
        exportSearches={() => {
          setExportSearchesDialogOpened(true);
        }}
        importSearches={() => {
          fileInputRef.current.click();
        }}
      />*/}
      <div className={classes.searchArea}>
        <FormControl
          style={{ width: '50%' }}
          className={classes.formControl}
          disabled={indexing}
        >
          <OutlinedInput
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
        </FormControl>
        <FormControl className={classes.formControl} style={{ width: '20%' }}>
          <ButtonGroup style={{ justifyContent: 'center' }}>
            <Button
              disabled={indexing}
              id="searchButton"
              // variant="outlined"
              color="primary"
              onClick={clickSearchButton}
              style={{ width: '98%' }}
              size="medium"
            >
              {indexing
                ? 'Search disabled while indexing'
                : i18n.t('searchTitle')}
            </Button>
          </ButtonGroup>
        </FormControl>
      </div>
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
    searches: getSearches(state),
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
      setSearchResults: AppActions.setSearchResults,
      addSearches: SearchActions.addSearches
    },
    dispatch
  );
}

const areEqual = (prevProp, nextProp) =>
  nextProp.indexing === prevProp.indexing &&
  nextProp.searchQuery === prevProp.searchQuery &&
  nextProp.currentDirectory === prevProp.currentDirectory &&
  nextProp.indexedEntriesCount === prevProp.indexedEntriesCount &&
  JSON.stringify(nextProp.searches) === JSON.stringify(prevProp.searches) &&
  JSON.stringify(nextProp.classes) === JSON.stringify(prevProp.classes);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(SearchInline, areEqual));
