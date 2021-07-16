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
import { withStyles } from '@material-ui/core/styles';
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
import OpenLocationCode from 'open-location-code-typescript';
// import { FormControlLabel, Switch } from '@material-ui/core';
import TagsSelect from './TagsSelect';
import CustomLogo from './CustomLogo';
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
import styles from './SidePanels.css';
import i18n from '../services/i18n';
import { FileTypeGroups } from '-/services/search';
import { Pro } from '../pro';
import SearchMenu from './menus/SearchMenu';
import { formatDateTime, extractTimePeriod } from '-/utils/dates';
import { isPlusCode, parseLatLon } from '-/utils/misc';
import { AppConfig } from '-/config';
import { actions as SearchActions, getSearches } from '-/reducers/searches';
import { TS } from '-/tagspaces.namespace';
import { ProLabel, BetaLabel, ProTooltip } from '-/components/HelperComponents';

const SaveSearchDialog = Pro && Pro.UI ? Pro.UI.SaveSearchDialog : false;

interface Props {
  classes: any;
  style?: any;
  theme?: any;
  searchLocationIndex: (searchQuery: TS.SearchQuery) => void;
  createLocationsIndexes: () => void;
  searchAllLocations: (searchQuery: TS.SearchQuery) => void;
  loadDirectoryContent: (path: string) => void;
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

const Search = (props: Props) => {
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
  const searchType = useRef<'fussy' | 'semistrict' | 'strict'>(
    props.searchQuery.searchType ? props.searchQuery.searchType : 'fussy'
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
    let lon = null;
    let tagPHelper;

    if (isPlusCode(value)) {
      const coord = OpenLocationCode.decode(value);
      lat = Number(coord.latitudeCenter.toFixed(7));
      lon = Number(coord.longitudeCenter.toFixed(7));
    } else {
      const latLon = parseLatLon(value);
      if (latLon) {
        ({ lat, lon } = latLon);
      }
    }

    if (lat && lon) {
      tagPHelper = 'Place at lat: ' + lat + ' long: ' + lon;
    } else {
      tagPHelper = '';
    }
    setTagPlace(value);
    setTagPlaceLat(lat);
    setTagPlaceLong(lon);
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
      props.loadDirectoryContent(props.currentDirectory);
    } else {
      props.setSearchResults([]);
    }
  }

  const clearSearch = () => {
    textQuery.current = '';
    searchBoxing.current = 'location';
    searchType.current = 'fussy';
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
    type: 'fussy' | 'semistrict' | 'strict'
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

  const { classes, indexing, indexedEntriesCount } = props;

  const indexStatus = indexedEntriesCount
    ? indexedEntriesCount + ' indexed entries'
    : '';
  return (
    <div className={classes.panel} style={props.style}>
      <CustomLogo />
      <div className={classes.toolbar}>
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
      />
      <div className={classes.searchArea}>
        <FormControl
          className={classes.formControl}
          style={{ marginTop: 10, width: '98%' }}
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
        <FormControl className={classes.formControl} disabled={indexing}>
          <ToggleButtonGroup
            onChange={switchSearchBoxing}
            size="small"
            exclusive
            style={{ marginBottom: 10, alignSelf: 'center' }}
            value={searchBoxing.current}
          >
            <ToggleButton value="location">
              <Tooltip arrow title={i18n.t('searchPlaceholder')}>
                <div>{i18n.t('location')}</div>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="folder">
              <Tooltip
                arrow
                title={i18n.t('searchCurrentFolderWithSubFolders')}
              >
                <div>{i18n.t('folder')}</div>
              </Tooltip>
            </ToggleButton>
            <ToggleButton disabled={!Pro} value="global">
              <Tooltip
                arrow
                title="Search globally in all locations. Feature is in BETA status."
              >
                <div>{i18n.t('globalSearch')}</div>
              </Tooltip>
              {Pro ? <BetaLabel /> : <ProLabel />}
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <FormControl className={classes.formControl} disabled={indexing}>
          <ToggleButtonGroup
            onChange={switchSearchType}
            size="small"
            exclusive
            style={{ marginBottom: 10, alignSelf: 'center' }}
            value={searchType.current}
          >
            <ToggleButton value="fussy" data-tid="fussySearchTID">
              <Tooltip
                arrow
                title={i18n.t(
                  'Delivering broader search results, tolerating typos'
                )}
              >
                <div>{i18n.t('fussy')}</div>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="semistrict" data-tid="semiStrictSearchTID">
              <Tooltip
                arrow
                title={i18n.t(
                  'Exact search in file path, description and text content (by enabled full-text search)'
                )}
              >
                <div>{i18n.t('semistrict')}</div>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="strict" data-tid="strictSearchTID">
              <Tooltip arrow title="Same as semistrict but case sensitive">
                <div>{i18n.t('strict')}</div>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <FormControl className={classes.formControl} disabled={indexing}>
          <ToggleButtonGroup
            onChange={() => {
              forceIndexing.current = !forceIndexing.current;
              forceUpdate();
            }}
            size="small"
            exclusive
            style={{ marginBottom: 10, alignSelf: 'center' }}
            value={forceIndexing.current}
          >
            <ToggleButton value={false}>
              <Tooltip
                arrow
                title={i18n.t(
                  'Will the use the already create index, if it is not expired'
                )}
              >
                <div>{i18n.t('default index')}</div>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value={true} data-tid="forceIndexingTID">
              <Tooltip
                arrow
                title={i18n.t('Will force the recreation of the index')}
              >
                <div>{i18n.t('force re-indexing')}</div>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        {/* <FormControlLabel
          title={i18n.t('core:enableIndexingBySearch')}
          control={
            <Switch
              data-tid="forceIndexingTID"
              checked={forceIndexing}
              onChange={() => setForceIndexing(!forceIndexing)}
              name="forceIndexing"
            />
          }
          label={
            <Typography
              style={{ padding: 15, color: props.theme.palette.text.primary }}
            >
              {i18n.t('forceReindexing')}
            </Typography>
          }
        /> */}
        <br />
        <FormControl className={classes.formControl}>
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
        <FormControl className={classes.formControl} disabled={indexing}>
          <TagsSelect
            placeholderText={i18n.t('core:selectTags')}
            label={i18n.t('core:mustContainTheseTags')}
            tags={props.searchQuery.tagsAND}
            handleChange={handleTagFieldChange}
            tagSearchType="tagsAND"
            tagMode="remove"
          />
        </FormControl>
        <FormControl className={classes.formControl} disabled={indexing}>
          <TagsSelect
            placeholderText={i18n.t('core:selectTags')}
            tags={props.searchQuery.tagsOR}
            label={i18n.t('core:atLeastOneOfTheseTags')}
            handleChange={handleTagFieldChange}
            tagSearchType="tagsOR"
            tagMode="remove"
          />
        </FormControl>
        <FormControl className={classes.formControl} disabled={indexing}>
          <TagsSelect
            placeholderText={i18n.t('core:selectTags')}
            tags={props.searchQuery.tagsNOT}
            label={i18n.t('core:noneOfTheseTags')}
            handleChange={handleTagFieldChange}
            tagSearchType="tagsNOT"
            tagMode="remove"
          />
        </FormControl>
        {AppConfig.showAdvancedSearch && (
          <>
            <FormControl
              className={classes.formControl}
              disabled={indexing || !Pro}
            >
              <ProTooltip>
                <InputLabel htmlFor="file-type">
                  {i18n.t('core:fileType')}
                </InputLabel>
                <Select
                  style={{ width: '100%' }}
                  value={JSON.stringify(fileTypes.current)}
                  onChange={handleFileTypeChange}
                  input={<Input name="fileTypes" id="file-type" />}
                >
                  <MenuItem value={JSON.stringify(FileTypeGroups.any)}>
                    {i18n.t('core:anyType')}
                  </MenuItem>
                  <MenuItem value={JSON.stringify(FileTypeGroups.folders)}>
                    <IconButton>
                      <FolderIcon />
                    </IconButton>
                    {i18n.t('core:searchFolders')}
                  </MenuItem>
                  <MenuItem value={JSON.stringify(FileTypeGroups.files)}>
                    <IconButton>
                      <FileIcon />
                    </IconButton>
                    {i18n.t('core:searchFiles')}
                  </MenuItem>
                  <MenuItem value={JSON.stringify(FileTypeGroups.untagged)}>
                    <IconButton>
                      <UntaggedIcon />
                    </IconButton>
                    {i18n.t('core:searchUntaggedEntries')}
                  </MenuItem>
                  <MenuItem
                    value={JSON.stringify(FileTypeGroups.images)}
                    title={FileTypeGroups.images.toString()}
                  >
                    <IconButton>
                      <PictureIcon />
                    </IconButton>
                    {i18n.t('core:searchPictures')}
                  </MenuItem>
                  <MenuItem
                    value={JSON.stringify(FileTypeGroups.documents)}
                    title={FileTypeGroups.documents.toString()}
                  >
                    <IconButton>
                      <DocumentIcon />
                    </IconButton>
                    {i18n.t('core:searchDocuments')}
                  </MenuItem>
                  <MenuItem
                    value={JSON.stringify(FileTypeGroups.notes)}
                    title={FileTypeGroups.notes.toString()}
                  >
                    <IconButton>
                      <NoteIcon />
                    </IconButton>
                    {i18n.t('core:searchNotes')}
                  </MenuItem>
                  <MenuItem
                    value={JSON.stringify(FileTypeGroups.audio)}
                    title={FileTypeGroups.audio.toString()}
                  >
                    <IconButton>
                      <AudioIcon />
                    </IconButton>
                    {i18n.t('core:searchAudio')}
                  </MenuItem>
                  <MenuItem
                    value={JSON.stringify(FileTypeGroups.video)}
                    title={FileTypeGroups.video.toString()}
                  >
                    <IconButton>
                      <VideoIcon />
                    </IconButton>
                    {i18n.t('core:searchVideoFiles')}
                  </MenuItem>
                  <MenuItem
                    value={JSON.stringify(FileTypeGroups.archives)}
                    title={FileTypeGroups.archives.toString()}
                  >
                    <IconButton>
                      <ArchiveIcon />
                    </IconButton>
                    {i18n.t('core:searchArchives')}
                  </MenuItem>
                  <MenuItem
                    value={JSON.stringify(FileTypeGroups.bookmarks)}
                    title={FileTypeGroups.bookmarks.toString()}
                  >
                    <IconButton>
                      <BookmarkIcon />
                    </IconButton>
                    {i18n.t('core:searchBookmarks')}
                  </MenuItem>
                  <MenuItem
                    value={JSON.stringify(FileTypeGroups.ebooks)}
                    title={FileTypeGroups.ebooks.toString()}
                  >
                    <IconButton>
                      <BookIcon />
                    </IconButton>
                    {i18n.t('core:searchEbooks')}
                  </MenuItem>
                </Select>
                {/* <FormHelperText>{i18n.t('core:searchFileTypes')}</FormHelperText> */}
              </ProTooltip>
            </FormControl>
            <FormControl
              className={classes.formControl}
              disabled={indexing || !Pro}
            >
              <ProTooltip>
                <InputLabel shrink htmlFor="file-size">
                  {i18n.t('core:sizeSearchTitle')}
                </InputLabel>
                <Select
                  style={{ width: '100%' }}
                  value={fileSize.current}
                  onChange={handleFileSizeChange}
                  input={<Input name="fileSize" id="file-size" />}
                  displayEmpty
                >
                  <MenuItem value="">{i18n.t('core:sizeAny')}</MenuItem>
                  <MenuItem value="sizeEmpty">
                    {i18n.t('core:sizeEmpty')}
                  </MenuItem>
                  <MenuItem value="sizeTiny">
                    {i18n.t('core:sizeTiny')}
                    &nbsp;(&lt;&nbsp;10KB)
                  </MenuItem>
                  <MenuItem value="sizeVerySmall">
                    {i18n.t('core:sizeVerySmall')}
                    &nbsp;(&lt;&nbsp;100KB)
                  </MenuItem>
                  <MenuItem value="sizeSmall">
                    {i18n.t('core:sizeSmall')}
                    &nbsp;(&lt;&nbsp;1MB)
                  </MenuItem>
                  <MenuItem value="sizeMedium">
                    {i18n.t('core:sizeMedium')}
                    &nbsp;(&lt;&nbsp;50MB)
                  </MenuItem>
                  <MenuItem value="sizeLarge">
                    {i18n.t('core:sizeLarge')}
                    &nbsp;(&lt;&nbsp;1GB)
                  </MenuItem>
                  <MenuItem value="sizeHuge">
                    {i18n.t('core:sizeHuge')}
                    &nbsp;(&gt;&nbsp;1GB)
                  </MenuItem>
                </Select>
              </ProTooltip>
            </FormControl>
            <FormControl
              className={classes.formControl}
              disabled={indexing || !Pro}
            >
              <ProTooltip>
                <InputLabel shrink htmlFor="modification-date">
                  {i18n.t('core:lastModifiedSearchTitle')}
                </InputLabel>
                <Select
                  value={lastModified.current}
                  style={{ width: '100%' }}
                  onChange={handleLastModifiedChange}
                  input={<Input name="lastModified" id="modification-date" />}
                  displayEmpty
                >
                  <MenuItem value="">{i18n.t('core:anyTime')}</MenuItem>
                  <MenuItem value="today">{i18n.t('core:today')}</MenuItem>
                  <MenuItem value="yesterday">
                    {i18n.t('core:yesterday')}
                  </MenuItem>
                  <MenuItem value="past7Days">
                    {i18n.t('core:past7Days')}
                  </MenuItem>
                  <MenuItem value="past30Days">
                    {i18n.t('core:past30Days')}
                  </MenuItem>
                  <MenuItem value="past6Months">
                    {i18n.t('core:past6Months')}
                  </MenuItem>
                  <MenuItem value="pastYear">
                    {i18n.t('core:pastYear')}
                  </MenuItem>
                  <MenuItem value="moreThanYear">
                    {i18n.t('core:moreThanYear')}
                  </MenuItem>
                </Select>
              </ProTooltip>
            </FormControl>
            <FormControl className={classes.formControl}>
              <ProTooltip>
                <TextField
                  id="tagTimePeriod"
                  label={i18n.t('Enter time period')}
                  value={tagTimePeriod.current}
                  disabled={indexing || !Pro}
                  onChange={handleTimePeriodChange}
                  onKeyDown={startSearch}
                  helperText={tagTimePeriodHelper.current}
                  error={tagTimePeriodHelper.current.length < 1}
                  style={{ width: '100%' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        title="201905 for May 2019 / 20190412 for 12th of April 2019 / 20190501~124523 for specific time"
                      >
                        <IconButton>
                          <DateIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </ProTooltip>
              {/* <TextField
                id="tagPlace"
                label={i18n.t('GPS coordinates or plus code')}
                value={tagPlace}
                disabled={indexing || !Pro}
                onChange={handlePlaceChange}
                onKeyDown={startSearch}
                helperText={tagPlaceHelper}
                error={tagPlaceHelper.length < 1}
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      title="GPS: 49.23276,12.43123 PlusCode: 8FRG8Q87+6X"
                    >
                      <IconButton onClick={openPlace}>
                        <PlaceIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              /> */}
            </FormControl>
            <FormControl
              className={classes.formControl}
              disabled={indexing || !Pro}
            >
              <ProTooltip>
                <InputLabel shrink htmlFor="saved-searches">
                  {i18n.t('core:savedSearchesTitle')}
                </InputLabel>
                <Select
                  style={{ width: '100%' }}
                  onChange={handleSavedSearchChange}
                  input={<Input name="savedSearch" id="saved-searches" />}
                  displayEmpty
                  value={props.searchQuery.uuid ? props.searchQuery.uuid : -1}
                >
                  <MenuItem value={-1} style={{ display: 'none' }} />
                  {props.searches.length < 1 && (
                    <MenuItem>{i18n.t('noSearchesFound')}</MenuItem>
                  )}
                  {props.searches.map(search => (
                    <MenuItem key={search.uuid} value={search.uuid}>
                      <span style={{ width: '100%' }}>{search.title}</span>
                    </MenuItem>
                  ))}
                </Select>
              </ProTooltip>
            </FormControl>
            {Pro && (
              <FormControl className={classes.formControl}>
                <ButtonGroup style={{ justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="medium"
                    style={
                      props.searchQuery.uuid
                        ? { width: '48%' }
                        : { width: '100%' }
                    }
                    onClick={() => saveSearch()}
                  >
                    {i18n.t('searchSaveBtn')}
                  </Button>
                  {props.searchQuery.uuid && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="medium"
                      style={{ width: '48%' }}
                      onClick={() => saveSearch(false)}
                    >
                      {i18n.t('searchEditBtn')}
                    </Button>
                  )}
                </ButtonGroup>
              </FormControl>
            )}
            <FormControl className={classes.formControl}>
              <ButtonGroup style={{ justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="medium"
                  style={{ width: '100%' }}
                  onClick={clearSearch}
                  id="resetSearchButton"
                >
                  {i18n.t('resetBtn')}
                </Button>
              </ButtonGroup>
            </FormControl>
            {SaveSearchDialog && saveSearchDialogOpened !== undefined && (
              <SaveSearchDialog
                open={saveSearchDialogOpened !== undefined}
                onClose={(searchQuery: TS.SearchQuery) => {
                  setSaveSearchDialogOpened(undefined);
                  if (searchQuery) {
                    if (searchQuery.searchBoxing === 'global') {
                      props.searchAllLocations({
                        ...searchQuery,
                        showUnixHiddenEntries: props.showUnixHiddenEntries
                      });
                    } else {
                      props.searchLocationIndex({
                        ...searchQuery,
                        showUnixHiddenEntries: props.showUnixHiddenEntries
                      });
                    }
                  }
                }}
                onClearSearch={() => clearSearch()}
                searchQuery={saveSearchDialogOpened}
              />
            )}
            <input
              style={{ display: 'none' }}
              ref={fileInputRef}
              accept="*"
              type="file"
              onChange={handleFileInputChange}
            />
            {ExportSearchesDialog && isExportSearchesDialogOpened && (
              <ExportSearchesDialog
                open={isExportSearchesDialogOpened}
                onClose={() => setExportSearchesDialogOpened(false)}
                searches={props.searches}
              />
            )}
            {ImportSearchesDialog && importFile && (
              <ImportSearchesDialog
                open={Boolean(importFile)}
                onClose={() => setImportFile(undefined)}
                importFile={importFile}
                addSearches={props.addSearches}
                searches={props.searches}
              />
            )}
          </>
        )}
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
)(withStyles(styles, { withTheme: true })(React.memo(Search, areEqual)));
