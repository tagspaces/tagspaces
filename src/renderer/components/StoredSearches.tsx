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

import React, { useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import EditIcon from '@material-ui/icons/Edit';
import MenuIcon from '@material-ui/icons/MoreVert';
import SearchIcon from '@material-ui/icons/Search';
import ArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import Typography from '@material-ui/core/Typography';
import {
  actions as LocationIndexActions,
  getSearchQuery
} from '-/reducers/location-index';
import { getShowUnixHiddenEntries } from '-/reducers/settings';
import i18n from '../services/i18n';
import { Pro } from '../pro';
import { actions as SearchActions, getSearches } from '-/reducers/searches';
import { TS } from '-/tagspaces.namespace';
import SearchMenu from '-/components/menus/SearchMenu';
import { actions as AppActions } from '-/reducers/app';
import AppConfig from '-/config';

interface Props {
  style?: any;
  searchQuery: TS.SearchQuery;
  setSearchQuery: (searchQuery: TS.SearchQuery) => void;
  searches: Array<TS.SearchQuery>;
  // searchLocationIndex: (searchQuery: TS.SearchQuery) => void;
  // searchAllLocations: (searchQuery: TS.SearchQuery) => void;
  showUnixHiddenEntries: boolean;
  addSearches: (searches: Array<TS.SearchQuery>) => void;
  openURLExternally: (url: string) => void;
  reduceHeightBy: number;
}

const SaveSearchDialog = Pro && Pro.UI ? Pro.UI.SaveSearchDialog : false;

const StoredSearches = (props: Props) => {
  const [saveSearchDialogOpened, setSaveSearchDialogOpened] = useState<
    TS.SearchQuery
  >(undefined);
  const [storedSearchesVisible, setStoredSearchesVisible] = useState<boolean>(
    true
  );
  const [
    searchMenuAnchorEl,
    setSearchMenuAnchorEl
  ] = useState<null | HTMLElement>(null);

  const [
    isExportSearchesDialogOpened,
    setExportSearchesDialogOpened
  ] = useState<boolean>(false);

  const [importFile, setImportFile] = useState<File>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ExportSearchesDialog =
    Pro && Pro.UI ? Pro.UI.ExportSearchesDialog : false;
  const ImportSearchesDialog =
    Pro && Pro.UI ? Pro.UI.ImportSearchesDialog : false;

  const handleSearchMenu = (event: any) => {
    setSearchMenuAnchorEl(event.currentTarget);
  };

  const handleCloseSearchMenu = () => {
    setSearchMenuAnchorEl(null);
  };

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

    props.setSearchQuery({
      ...savedSearch,
      showUnixHiddenEntries: props.showUnixHiddenEntries
    });

    /* if (savedSearch.searchBoxing === 'global') {
      props.searchAllLocations({
        ...savedSearch,
        showUnixHiddenEntries: props.showUnixHiddenEntries
      });
    } else {
      props.searchLocationIndex({
        ...savedSearch,
        showUnixHiddenEntries: props.showUnixHiddenEntries
      });
    } */
  };

  function handleFileInputChange(selection: any) {
    const target = selection.currentTarget;
    const file = target.files[0];
    setImportFile(file);
    target.value = null;
  }

  const preventDefault = (event: React.SyntheticEvent) =>
    event.preventDefault();

  const noSearchesFound = props.searches.length < 1;

  const { reduceHeightBy } = props;

  return (
    <div
      style={{
        paddingTop: 0,
        marginTop: 0,
        height: 'calc(100% - ' + reduceHeightBy + 'px)',
        // @ts-ignore
        overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
      }}
    >
      <Grid container direction="row">
        <Grid item xs={10} style={{ alignSelf: 'center' }}>
          <IconButton
            style={{ minWidth: 'auto', padding: 7 }}
            onClick={() => setStoredSearchesVisible(!storedSearchesVisible)}
          >
            {storedSearchesVisible ? <ArrowDownIcon /> : <ArrowRightIcon />}
          </IconButton>
          <Typography
            variant="inherit"
            // className={props.classes.header}
            style={{ textTransform: 'uppercase' }}
            noWrap
            onClick={() => setStoredSearchesVisible(!storedSearchesVisible)}
          >
            {i18n.t('core:savedSearchesTitle')}
          </Typography>
        </Grid>
        <Grid item xs={2} style={{ alignSelf: 'center' }}>
          <SearchMenu
            anchorEl={searchMenuAnchorEl}
            open={Boolean(searchMenuAnchorEl)}
            onClose={handleCloseSearchMenu}
            openURLExternally={props.openURLExternally}
            exportSearches={() => {
              setExportSearchesDialogOpened(true);
            }}
            importSearches={() => {
              fileInputRef.current.click();
            }}
          />
          <IconButton
            style={{ minWidth: 'auto', padding: 7 }}
            onClick={handleSearchMenu}
          >
            <MenuIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Grid container direction="row">
        {storedSearchesVisible && noSearchesFound && (
          <Grid item xs={12} style={{ display: 'flex', padding: 10 }}>
            {i18n.t('noSavedSearches')}
          </Grid>
        )}
      </Grid>
      <Grid container direction="row">
        {storedSearchesVisible &&
          props.searches.map(search => (
            <React.Fragment key={search.uuid}>
              <Grid item xs={10} style={{ display: 'flex' }}>
                <Button
                  style={{
                    textTransform: 'none',
                    fontWeight: 'normal',
                    marginLeft: 5,
                    width: '100%',
                    justifyContent: 'start'
                  }}
                  onClick={() => handleSavedSearchClick(search.uuid)}
                >
                  <SearchIcon />
                  &nbsp;
                  {search.title}
                </Button>
              </Grid>
              <Grid item xs={2} style={{ display: 'flex' }}>
                <IconButton
                  aria-label={i18n.t('core:searchEditBtn')}
                  onClick={() => editSearch(search.uuid)}
                  data-tid="editSearchTID"
                >
                  <EditIcon />
                </IconButton>
              </Grid>
            </React.Fragment>
          ))}
      </Grid>
      {SaveSearchDialog && saveSearchDialogOpened !== undefined && (
        <SaveSearchDialog
          open={saveSearchDialogOpened !== undefined}
          onClose={(searchQuery: TS.SearchQuery) => {
            setSaveSearchDialogOpened(undefined);
            if (searchQuery) {
              props.setSearchQuery({
                ...searchQuery,
                showUnixHiddenEntries: props.showUnixHiddenEntries
              });

              /* if (searchQuery.searchBoxing === 'global') {
                props.searchAllLocations({
                  ...searchQuery,
                  showUnixHiddenEntries: props.showUnixHiddenEntries
                });
              } else {
                props.searchLocationIndex({
                  ...searchQuery,
                  showUnixHiddenEntries: props.showUnixHiddenEntries
                });
              } */
            }
          }}
          onClearSearch={() => console.log('search deleted')}
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
      setSearchQuery: LocationIndexActions.setSearchQuery,
      // searchAllLocations: LocationIndexActions.searchAllLocations,
      // searchLocationIndex: LocationIndexActions.searchLocationIndex,
      openURLExternally: AppActions.openURLExternally
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
