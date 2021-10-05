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
import Box from '@material-ui/core/Box';
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
import { Link } from '@material-ui/core';
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

interface Props {
  style?: any;
  searchQuery: TS.SearchQuery;
  searches: Array<TS.SearchQuery>;
  searchLocationIndex: (searchQuery: TS.SearchQuery) => void;
  searchAllLocations: (searchQuery: TS.SearchQuery) => void;
  showUnixHiddenEntries: boolean;
}

const SaveSearchDialog = Pro && Pro.UI ? Pro.UI.SaveSearchDialog : false;

const StoredSearches = (props: Props) => {
  const [saveSearchDialogOpened, setSaveSearchDialogOpened] = useState<
    TS.SearchQuery
  >(undefined);

  const editSearch = (uuid: string) => {
    const savedSearch = props.searches.find(search => search.uuid === uuid);
    if (!savedSearch) {
      return true;
    }
    setSaveSearchDialogOpened(savedSearch);
  };

  const handleSavedSearchClick = (uuid: string) => {
    const savedSearch = props.searches.find(search => search.uuid === uuid);
    if (!savedSearch) {
      return true;
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

  const preventDefault = (event: React.SyntheticEvent) =>
    event.preventDefault();

  return (
    <div style={{ ...props.style, width: '100%' }}>
      <div>{i18n.t('core:savedSearchesTitle')}</div>
      {props.searches.length < 1 && <div>{i18n.t('noSavedSearches')}</div>}
      <Box onClick={preventDefault}>
        {props.searches.map(search => (
          <div key={search.uuid}>
            <Link
              variant="body2"
              onClick={() => handleSavedSearchClick(search.uuid)}
            >
              {search.title}
            </Link>
            <Button
              variant="outlined"
              color="secondary"
              size="medium"
              onClick={() => editSearch(search.uuid)}
            >
              {i18n.t('searchEditBtn')}
            </Button>
          </div>
        ))}
      </Box>

      {/* {Pro && (
        <ButtonGroup style={{ justifyContent: 'center' }}>
          <Button
            variant="outlined"
            color="secondary"
            size="medium"
            style={
              props.searchQuery.uuid ? { width: '48%' } : { width: '100%' }
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
      )} */}
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
          // onClearSearch={() => clearSearch()}
          searchQuery={saveSearchDialogOpened}
        />
      )}
    </div>
  );
};

function mapStateToProps(state) {
  return {
    searchQuery: getSearchQuery(state),
    searches: getSearches(state),
    showUnixHiddenEntries: getShowUnixHiddenEntries(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      addSearches: SearchActions.addSearches,
      searchAllLocations: LocationIndexActions.searchAllLocations,
      searchLocationIndex: LocationIndexActions.searchLocationIndex
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
)(React.memo(StoredSearches, areEqual));
