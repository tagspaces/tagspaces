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
 * @flow
 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import PictureIcon from '@material-ui/icons/Panorama';
import DocumentIcon from '@material-ui/icons/PictureAsPdf';
import NoteIcon from '@material-ui/icons/Note';
import AudioIcon from '@material-ui/icons/MusicVideo';
import VideoIcon from '@material-ui/icons/OndemandVideo';
import ArchiveIcon from '@material-ui/icons/Archive';
import FolderIcon from '@material-ui/icons/FolderOpen';
import LocationIcon from '@material-ui/icons/WorkOutline';
import UntaggedIcon from '@material-ui/icons/LabelOffOutlined';
import FileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import ClearSearchIcon from '@material-ui/icons/Clear';
import BookmarkIcon from '@material-ui/icons/BookmarkBorder';
import BookIcon from '@material-ui/icons/LocalLibraryOutlined';
import PlaceIcon from '@material-ui/icons/Place';
import DateIcon from '@material-ui/icons/DateRange';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import TagsSelect from './TagsSelect';
import CustomLogo from './CustomLogo';
import { actions as AppActions, getDirectoryPath } from '../reducers/app';
import { actions as LocationIndexActions, getIndexedEntriesCount, isIndexing } from '../reducers/location-index';
import { getMaxSearchResults } from '../reducers/settings';
import styles from './SidePanels.css';
import i18n from '../services/i18n';
import { FileTypeGroups, type SearchQuery } from '../services/search';
import { Pro } from '../pro';
import type { Tag } from '../reducers/taglibrary';
import ocl from '../utils/openlocationcode';
import {
  formatDateTime,
  extractTimePeriod
} from '../utils/dates';
import {
  isPlusCode,
  parseLatLon
} from '../utils/misc';
import PlatformIO from '../services/platform-io';

type Props = {
  classes: Object,
  style: Object,
  searchLocationIndex: (searchQuery: SearchQuery) => void,
  loadDirectoryContent: (path: string) => void,
  currentDirectory: string,
  indexedEntriesCount: number,
  maxSearchResults: number,
  indexing: boolean
};

type State = {
  textQuery: string,
  tagsAND: Array<Tag>,
  tagsOR: Array<Tag>,
  tagsNOT: Array<Tag>,
  fileTypes: Array<string>,
  searchBoxing: 'location' | 'folder',
  lastModified: string,
  tagTimePeriod: string,
  tagTimePeriodHelper: string,
  tagPlace: string,
  tagPlaceHelper: string,
  tagTimePeriodFrom: Date | null,
  tagTimePeriodTo: Date | null,
  tagPlaceLat: number | null,
  tagPlaceLong: number | null,
  tagPlaceRadius: number,
  fileSize: string
};

class Search extends React.Component<Props, State> {
  state = {
    textQuery: '',
    tagsAND: [],
    tagsOR: [],
    tagsNOT: [],
    fileTypes: FileTypeGroups.any,
    searchBoxing: 'location',
    lastModified: '',
    tagTimePeriod: '',
    tagTimePeriodHelper: ' ',
    tagPlace: '',
    tagPlaceHelper: ' ',
    tagTimePeriodFrom: null,
    tagTimePeriodTo: null,
    tagPlaceLat: null,
    tagPlaceLong: null,
    tagPlaceRadius: 0,
    fileSize: ''
  };

  handleInputChange = event => {
    const target = event.target;
    const value = (target.type && target.type === 'checkbox') ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    }, this.executeSearch);
  };

  handleTagFieldChange = (name, value) => {
    this.setState({ [name]: value }, this.executeSearch);
  };

  handleTimePeriodChange = event => {
    const target = event.target;
    const value = target.value;
    let tagTimePeriodHelper = '';
    const { fromDateTime, toDateTime } = extractTimePeriod(value);

    if (toDateTime && fromDateTime) {
      tagTimePeriodHelper = 'From: ' + formatDateTime(fromDateTime) + ' To: ' + formatDateTime(toDateTime);
    } else {
      tagTimePeriodHelper = '';
    }

    this.setState({
      tagTimePeriod: value,
      tagTimePeriodFrom: fromDateTime,
      tagTimePeriodTo: toDateTime,
      tagTimePeriodHelper
    });
  };

  handlePlaceChange = event => {
    const target = event.target;
    const value = target.value;
    let lat = null;
    let lon = null;
    let tagPlaceHelper;

    if (isPlusCode(value)) {
      const coord = ocl.decode(value);
      lat = Number(coord.latitudeCenter.toFixed(7));
      lon = Number(coord.longitudeCenter.toFixed(7));
    } else {
      const latLon = parseLatLon(value);
      if (latLon) {
        lat = latLon.lat;
        lon = latLon.lon;
      }
    }

    if (lat && lon) {
      tagPlaceHelper = 'Place at lat: ' + lat + ' long: ' + lon;
    } else {
      tagPlaceHelper = '';
    }

    this.setState({
      tagPlace: value,
      tagPlaceLat: lat,
      tagPlaceLong: lon,
      tagPlaceHelper
    });
  };

  openPlace = () => {
    const { tagPlaceLat, tagPlaceLong } = this.state;
    if (tagPlaceLat && tagPlaceLong) {
      PlatformIO.openUrl('https://www.openstreetmap.org/#map=16/' + tagPlaceLat + '/' + tagPlaceLong);
    }
  };

  startSearch = event => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      this.executeSearch();
    }
  };

  clearSearch = () => {
    this.setState({
      textQuery: '',
      tagsAND: [],
      tagsOR: [],
      tagsNOT: [],
      searchBoxing: 'location',
      fileTypes: FileTypeGroups.any,
      lastModified: '',
      tagTimePeriod: '',
      tagTimePeriodHelper: ' ',
      tagPlace: '',
      tagPlaceHelper: ' ',
      tagTimePeriodFrom: null,
      tagTimePeriodTo: null,
      tagPlaceLat: null,
      tagPlaceLong: null,
      tagPlaceRadius: 0,
      fileSize: ''
    }, () => this.props.loadDirectoryContent(this.props.currentDirectory));
  };

  toggleSearchBoxing = () => {
    this.setState(
      {
        searchBoxing: this.state.searchBoxing === 'location' ? 'folder' : 'location',
      }
    );
  };

  executeSearch = () => {
    const searchQuery: SearchQuery = {
      textQuery: this.state.textQuery,
      tagsAND: this.state.tagsAND,
      tagsOR: this.state.tagsOR,
      tagsNOT: this.state.tagsNOT,
      searchBoxing: this.state.searchBoxing,
      fileTypes: this.state.fileTypes,
      lastModified: this.state.lastModified,
      fileSize: this.state.fileSize,
      tagTimePeriodFrom: this.state.tagTimePeriodFrom ? this.state.tagTimePeriodFrom.getTime() : null,
      tagTimePeriodTo: this.state.tagTimePeriodTo ? this.state.tagTimePeriodTo.getTime() : null,
      tagPlaceLat: this.state.tagPlaceLat,
      tagPlaceLong: this.state.tagPlaceLong,
      tagPlaceRadius: this.state.tagPlaceRadius,
      maxSearchResults: this.props.maxSearchResults,
      currentDirectory: this.props.currentDirectory
    };
    console.log('Search object: ' + JSON.stringify(searchQuery));
    this.props.searchLocationIndex(searchQuery);
  };

  render() {
    const { classes, indexing, indexedEntriesCount } = this.props;
    return (
      <div className={classes.panel} style={this.props.style}>
        <CustomLogo />
        <div className={classes.toolbar}>
          <Typography className={classNames(classes.panelTitle, classes.header)} style={{ flex: 'none' }}>
            {i18n.t('searchTitle')}
          </Typography>
          <Typography variant="caption" className={classes.header} style={{ alignSelf: 'flex-end', paddingLeft: 5, display: 'block' }}>
            {indexing ? 'disabled while indexing...' : 'in ' + indexedEntriesCount + ' indexed entries'}
          </Typography>
        </div>
        <div className={classes.searchArea}>
          <FormControl
            className={classes.formControl}
            disabled={indexing}
          >
            <InputLabel htmlFor="textQuery">
              {this.state.searchBoxing === 'location' ? i18n.t('searchPlaceholder') : i18n.t('searchCurrentFolderWithSubFolders')}
            </InputLabel>
            <Input
              id="textQuery"
              name="textQuery"
              value={this.state.textQuery}
              onChange={(event) => {
                this.setState({ textQuery: event.target.value });
              }}
              onKeyDown={this.startSearch}
              placeholder={i18n.t('core:searchWordsWithInterval')}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    style={{ marginRight: -15 }}
                    onClick={this.toggleSearchBoxing}
                    title={this.state.searchBoxing === 'location' ? i18n.t('searchCurrentFolderWithSubFolders') : i18n.t('searchPlaceholder')}
                  >
                    {this.state.searchBoxing === 'location' ?
                      <FolderIcon /> :
                      <LocationIcon />
                    }
                  </IconButton>
                  <IconButton onClick={this.clearSearch}>
                    <ClearSearchIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <Typography variant="caption" className={classes.header} style={{ marginTop: 10 }}>
            {i18n.t('core:mustContainTheseTags')}
          </Typography>
          <FormControl
            className={classes.formControl}
            disabled={indexing}
          >
            <TagsSelect tags={this.state.tagsAND} handleChange={this.handleTagFieldChange} tagSearchType={'tagsAND'} />
          </FormControl>
          <Typography variant="caption" className={classes.header} style={{ marginTop: 10 }}>
            {i18n.t('core:atLeastOneOfTheseTags')}
          </Typography>
          <FormControl
            className={classes.formControl}
            disabled={indexing}
          >
            <TagsSelect tags={this.state.tagsOR} handleChange={this.handleTagFieldChange} tagSearchType={'tagsOR'} />
          </FormControl>
          <Typography variant="caption" className={classes.header} style={{ marginTop: 10 }}>
            {i18n.t('core:noneOfTheseTags')}
          </Typography>
          <FormControl
            className={classes.formControl}
            disabled={indexing}
          >
            <TagsSelect tags={this.state.tagsNOT} handleChange={this.handleTagFieldChange} tagSearchType={'tagsNOT'} />
          </FormControl>
          <FormControl
            className={classes.formControl}
            disabled={indexing || !Pro}
            title={!Pro ? i18n.t('core:thisFunctionalityIsAvailableInPro') : undefined}
          >
            <InputLabel htmlFor="file-type">{i18n.t('core:fileType')}</InputLabel>
            <Select
              value={this.state.fileTypes}
              onChange={this.handleInputChange}
              input={<Input name="fileTypes" id="file-type" />}
            >
              <MenuItem value={FileTypeGroups.any}>
                {i18n.t('core:anyType')}
              </MenuItem>
              <MenuItem value={FileTypeGroups.folders}>
                <IconButton>
                  <FolderIcon />
                </IconButton>
                {i18n.t('core:searchFolders')}
              </MenuItem>
              <MenuItem value={FileTypeGroups.files}>
                <IconButton>
                  <FileIcon />
                </IconButton>
                {i18n.t('core:searchFiles')}
              </MenuItem>
              <MenuItem value={FileTypeGroups.untagged}>
                <IconButton>
                  <UntaggedIcon />
                </IconButton>
                {i18n.t('core:searchUntaggedEntries')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.images}
                title={FileTypeGroups.images.toString()}
              >
                <IconButton>
                  <PictureIcon />
                </IconButton>
                {i18n.t('core:searchPictures')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.documents}
                title={FileTypeGroups.documents.toString()}
              >
                <IconButton>
                  <DocumentIcon />
                </IconButton>
                {i18n.t('core:searchDocuments')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.notes}
                title={FileTypeGroups.notes.toString()}
              >
                <IconButton>
                  <NoteIcon />
                </IconButton>
                {i18n.t('core:searchNotes')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.audio}
                title={FileTypeGroups.audio.toString()}
              >
                <IconButton>
                  <AudioIcon />
                </IconButton>
                {i18n.t('core:searchAudio')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.video}
                title={FileTypeGroups.video.toString()}
              >
                <IconButton>
                  <VideoIcon />
                </IconButton>
                {i18n.t('core:searchVideoFiles')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.archives}
                title={FileTypeGroups.archives.toString()}
              >
                <IconButton>
                  <ArchiveIcon />
                </IconButton>
                {i18n.t('core:searchArchives')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.bookmarks}
                title={FileTypeGroups.bookmarks.toString()}
              >
                <IconButton>
                  <BookmarkIcon />
                </IconButton>
                {i18n.t('core:searchBookmarks')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.ebooks}
                title={FileTypeGroups.ebooks.toString()}
              >
                <IconButton>
                  <BookIcon />
                </IconButton>
                {i18n.t('core:searchEbooks')}
              </MenuItem>
            </Select>
            {/* <FormHelperText>{i18n.t('core:searchFileTypes')}</FormHelperText> */}
          </FormControl>
          <FormControl
            className={classes.formControl}
            disabled={indexing || !Pro}
            title={i18n.t('core:thisFunctionalityIsAvailableInPro')}
          >
            <InputLabel shrink htmlFor="file-size">{i18n.t('core:sizeSearchTitle')}</InputLabel>
            <Select
              value={this.state.fileSize}
              onChange={this.handleInputChange}
              input={<Input name="fileSize" id="file-size" />}
              displayEmpty
            >
              <MenuItem value="">
                {i18n.t('core:sizeAny')}
              </MenuItem>
              <MenuItem value="sizeEmpty">
                {i18n.t('core:sizeEmpty')}
              </MenuItem>
              <MenuItem value="sizeTiny">
                {i18n.t('core:sizeTiny')}&nbsp;(&lt;&nbsp;10KB)
              </MenuItem>
              <MenuItem value="sizeVerySmall">
                {i18n.t('core:sizeVerySmall')}&nbsp;(&lt;&nbsp;100KB)
              </MenuItem>
              <MenuItem value="sizeSmall">
                {i18n.t('core:sizeSmall')}&nbsp;(&lt;&nbsp;1MB)
              </MenuItem>
              <MenuItem value="sizeMedium">
                {i18n.t('core:sizeMedium')}&nbsp;(&lt;&nbsp;50MB)
              </MenuItem>
              <MenuItem value="sizeLarge">
                {i18n.t('core:sizeLarge')}&nbsp;(&lt;&nbsp;1GB)
              </MenuItem>
              <MenuItem value="sizeHuge">
                {i18n.t('core:sizeHuge')}&nbsp;(&gt;&nbsp;1GB)
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl
            className={classes.formControl}
            disabled={indexing || !Pro}
            title={!Pro ? i18n.t('core:thisFunctionalityIsAvailableInPro') : undefined}
          >
            <InputLabel shrink htmlFor="modification-date">{i18n.t('core:lastModifiedSearchTitle')}</InputLabel>
            <Select
              value={this.state.lastModified}
              onChange={this.handleInputChange}
              input={<Input name="lastModified" id="modification-date" />}
              displayEmpty
            >
              <MenuItem value="">
                {i18n.t('core:anyTime')}
              </MenuItem>
              <MenuItem value="today">
                {i18n.t('core:today')}
              </MenuItem>
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
          </FormControl>
          <FormControl
            className={classes.formControl}
            title={!Pro ? i18n.t('core:thisFunctionalityIsAvailableInPro') : undefined}
          >
            <TextField
              id="tagTimePeriod"
              label={i18n.t('Enter time period')}
              value={this.state.tagTimePeriod}
              disabled={indexing || !Pro}
              onChange={this.handleTimePeriodChange}
              onKeyDown={this.startSearch}
              helperText={this.state.tagTimePeriodHelper}
              error={this.state.tagTimePeriodHelper.length < 1}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" title="201905 for May 2019 / 20190412 for 12th of April 2019 / 20190501~124523 for specific time">
                    <IconButton>
                      <DateIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              id="tagPlace"
              label={i18n.t('GPS coordinates or plus code')}
              value={this.state.tagPlace}
              disabled={indexing || !Pro}
              onChange={this.handlePlaceChange}
              onKeyDown={this.startSearch}
              helperText={this.state.tagPlaceHelper}
              error={this.state.tagPlaceHelper.length < 1}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" title="GPS: 49.23276,12.43123 PlusCode: 8FRG8Q87+6X">
                    <IconButton onClick={this.openPlace}>
                      <PlaceIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <Button
              disabled={indexing}
              id="searchButton"
              variant="outlined"
              size="small"
              color="primary"
              onClick={this.executeSearch}
            >
              {indexing ? 'Search disabled while indexing' : i18n.t('searchTitle')}
            </Button>&nbsp;
            <Button
              size="small"
              color="primary"
              onClick={this.clearSearch}
              id="resetSearchButton"
            >
              {i18n.t('resetBtn')}
            </Button>
          </FormControl>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    indexing: isIndexing(state),
    currentDirectory: getDirectoryPath(state),
    indexedEntriesCount: getIndexedEntriesCount(state),
    maxSearchResults: getMaxSearchResults(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    searchLocationIndex: LocationIndexActions.searchLocationIndex,
    loadDirectoryContent: AppActions.loadDirectoryContent
  }, dispatch);
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(Search)
);
