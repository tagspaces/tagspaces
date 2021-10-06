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

import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, IconButton, Collapse, Grid, styled } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';
import {
  actions as LocationIndexActions,
  getSearchQuery
} from '../reducers/location-index';
import { getShowUnixHiddenEntries } from '-/reducers/settings';
import i18n from '../services/i18n';
import { Pro } from '../pro';
import { actions as SearchActions, getSearches } from '-/reducers/searches';
import { TS } from '-/tagspaces.namespace';
import ArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

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
  const [storedSearchesVisible, setStoredSearchesVisible] = useState<boolean>(
    true
  );

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

  const LinkStyled = styled(Link)(({ theme }) => ({
    ...theme.typography.subtitle1,
    padding: theme.spacing(1),
    textAlign: 'left',
    alignSelf: 'center'
    // color: theme.palette.text.secondary
  }));

  return (
    <div style={{ ...props.style, width: '100%' }}>
      <Link
        underline="none"
        style={{ marginLeft: 10, display: 'flex' }}
        onClick={() => setStoredSearchesVisible(!storedSearchesVisible)}
      >
        <span>{i18n.t('core:savedSearchesTitle')} </span>
        {storedSearchesVisible ? <ArrowDownIcon /> : <ArrowUpIcon />}
      </Link>
      {props.searches.length < 1 && <div>{i18n.t('noSavedSearches')}</div>}
      <Collapse in={storedSearchesVisible} timeout="auto" unmountOnExit>
        <Grid container onClick={preventDefault}>
          {props.searches.map(search => (
            <React.Fragment key={search.uuid}>
              <Grid
                item
                xs={10}
                style={{
                  display: 'flex'
                }}
              >
                <SearchIcon style={{ alignSelf: 'center' }} />
                <LinkStyled
                  variant="body2"
                  onClick={() => handleSavedSearchClick(search.uuid)}
                >
                  {search.title}
                </LinkStyled>
              </Grid>
              <Grid item xs={2}>
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
      </Collapse>
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
          onClearSearch={() => console.log('search deleted')}
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
