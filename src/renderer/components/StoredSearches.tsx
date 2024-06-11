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

import React, { useContext, useReducer, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import EditIcon from '@mui/icons-material/Edit';
import MenuIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/FilterAltTwoTone';
import ArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import {
  actions as SettingsActions,
  getFileEditHistory,
  getFileOpenHistory,
  getFolderOpenHistory,
  getShowBookmarks,
  getShowUnixHiddenEntries,
  getStoredSearchesVisible,
} from '-/reducers/settings';
import { Pro } from '../pro';
import { actions as SearchActions, getSearches } from '-/reducers/searches';
import { TS } from '-/tagspaces.namespace';
import SearchMenu from '-/components/menus/SearchMenu';
import HistoryMenu from '-/components/menus/HistoryMenu';
import BookmarksMenu from '-/components/menus/BookmarksMenu';
import { classes, SidePanel } from '-/components/SidePanels.css';
import { useTranslation } from 'react-i18next';
import RenderHistory from '-/components/RenderHistory';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';

interface Props {
  style?: any;
  searches: Array<TS.SearchQuery>;
  showUnixHiddenEntries: boolean;
  addSearches: (searches: Array<TS.SearchQuery>) => void;
  reduceHeightBy: number;
  storedSearchesVisible: boolean;
  showBookmarks: boolean;
  fileOpenHistory: boolean;
  folderOpenHistory: boolean;
  fileEditHistory: boolean;
  setStoredSearchesVisible: (value: boolean) => void;
  setShowBookmarks: (value: boolean) => void;
  setFileOpenHistory: (value: boolean) => void;
  setFolderOpenHistory: (value: boolean) => void;
  setFileEditHistory: (value: boolean) => void;
}

const SaveSearchDialog = Pro && Pro.UI ? Pro.UI.SaveSearchDialog : false;

function StoredSearches(props: Props) {
  const { t } = useTranslation();
  const { setSearchQuery, findFromSavedSearch } = useDirectoryContentContext();
  const bookmarksContext = Pro?.contextProviders?.BookmarksContext
    ? useContext<TS.BookmarksContextData>(
        Pro?.contextProviders?.BookmarksContext,
      )
    : undefined;
  const historyContext = Pro?.contextProviders?.HistoryContext
    ? useContext<TS.HistoryContextData>(Pro.contextProviders.HistoryContext)
    : undefined;
  const [saveSearchDialogOpened, setSaveSearchDialogOpened] =
    useState<TS.SearchQuery>(undefined);
  const [searchMenuAnchorEl, setSearchMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [historyMenuAnchorEl, setHistoryMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  const [bookmarksMenuAnchorEl, setBookmarksMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  const [isExportSearchesDialogOpened, setExportSearchesDialogOpened] =
    useState<boolean>(false);

  const [importFile, setImportFile] = useState<File>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuHistoryKey = useRef<string>(undefined);
  const historyKeys = Pro ? Pro.keys.historyKeys : {};
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

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
    const savedSearch = props.searches.find((search) => search.uuid === uuid);
    if (!savedSearch) {
      return true;
    }
    setSaveSearchDialogOpened(savedSearch);
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

  const bookmarkItems: Array<TS.BookmarkItem> =
    Pro && bookmarksContext
      ? bookmarksContext.bookmarks //getBookmarks()
      : [];
  const fileOpenHistoryItems: Array<TS.HistoryItem> = Pro
    ? historyContext.fileOpenHistory
    : [];
  const fileEditHistoryItems: Array<TS.HistoryItem> = Pro
    ? historyContext.fileEditHistory
    : [];
  const folderOpenHistoryItems: Array<TS.HistoryItem> = Pro
    ? historyContext.folderOpenHistory
    : [];

  const bookmarksAvailable = bookmarkItems && bookmarkItems.length > 0;
  const openedFilesAvailable =
    fileOpenHistoryItems && fileOpenHistoryItems.length > 0;
  const editedFilesAvailable =
    fileEditHistoryItems && fileEditHistoryItems.length > 0;
  const openedFoldersAvailable =
    folderOpenHistoryItems && folderOpenHistoryItems.length > 0;

  return (
    <SidePanel
      data-tid="quickAccessArea"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 5,
        marginLeft: 5,
        marginRight: 0,
      }}
    >
      <div className={classes.toolbar}>
        <Typography
          className={classNames(classes.panelTitle, classes.header)}
          variant="subtitle1"
          style={{ paddingLeft: 0 }}
        >
          {t('core:quickAccess')}
        </Typography>
      </div>
      <div
        style={{
          paddingTop: 0,
          marginTop: 0,
          height: 'calc(100% - ' + reduceHeightBy + 'px)',
          width: 305,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Grid container direction="row">
          <Grid item xs={10} style={{ alignSelf: 'center' }}>
            <IconButton
              data-tid={
                props.storedSearchesVisible
                  ? 'storedSearchesVisibleTID'
                  : 'storedSearchesHiddenTID'
              }
              style={{ minWidth: 'auto', padding: 7 }}
              onClick={() =>
                props.setStoredSearchesVisible(!props.storedSearchesVisible)
              }
              size="large"
            >
              {props.storedSearchesVisible ? (
                <ArrowDownIcon />
              ) : (
                <ArrowRightIcon />
              )}
            </IconButton>
            <Typography
              variant="inherit"
              // className={props.classes.header}
              style={{ display: 'inline' }}
              noWrap
              onClick={() =>
                props.setStoredSearchesVisible(!props.storedSearchesVisible)
              }
            >
              {t('core:savedSearchesTitle')}
            </Typography>
          </Grid>
          <Grid item xs={2} style={{ alignSelf: 'center' }}>
            <SearchMenu
              anchorEl={searchMenuAnchorEl}
              open={Boolean(searchMenuAnchorEl)}
              onClose={handleCloseSearchMenu}
              exportSearches={() => {
                setExportSearchesDialogOpened(true);
              }}
              importSearches={() => {
                fileInputRef.current.click();
              }}
            />
            <IconButton
              data-tid="StoredSearchesMenuTID"
              style={{ minWidth: 'auto', padding: 7 }}
              onClick={handleSearchMenu}
              size="large"
            >
              <MenuIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Grid container direction="row">
          {props.storedSearchesVisible && noSearchesFound && (
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noSavedSearches')}</Typography>
            </Grid>
          )}
        </Grid>
        {props.storedSearchesVisible &&
          props.searches.map((search) => (
            <ListItem dense style={{ paddingLeft: 0 }} key={search.uuid}>
              <Grid item xs={10} style={{ width: 250 }}>
                <Button
                  data-tid={
                    'StoredSearchTID' +
                    search.title.trim().replaceAll(/\s+/g, '-')
                  }
                  style={{
                    textTransform: 'none',
                    fontWeight: 'normal',
                    justifyContent: 'start',
                  }}
                  onClick={() => findFromSavedSearch(search.uuid)}
                >
                  <SearchIcon />
                  &nbsp;
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      maxWidth: 220,
                    }}
                  >
                    {search.title}
                  </span>
                </Button>
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  aria-label={t('core:searchEditBtn')}
                  onClick={() => editSearch(search.uuid)}
                  data-tid="editSearchTID"
                  size="small"
                >
                  <EditIcon />
                </IconButton>
              </Grid>
            </ListItem>
          ))}
        <Grid container direction="row">
          <Grid item xs={10} style={{ alignSelf: 'center' }}>
            <IconButton
              data-tid="BookmarksTID"
              style={{ minWidth: 'auto', padding: 7 }}
              onClick={() => props.setShowBookmarks(!props.showBookmarks)}
              size="large"
            >
              {props.showBookmarks ? <ArrowDownIcon /> : <ArrowRightIcon />}
            </IconButton>
            <Typography
              variant="inherit"
              style={{ display: 'inline' }}
              noWrap
              onClick={() => props.setShowBookmarks(!props.showBookmarks)}
            >
              {t('core:showBookmarks')}
            </Typography>
          </Grid>
          <Grid item xs={2} style={{ alignSelf: 'center' }}>
            <IconButton
              data-tid="BookmarksMenuTID"
              style={{ minWidth: 'auto', padding: 7 }}
              onClick={(event: any) => {
                menuHistoryKey.current = historyKeys.fileOpenKey;
                setBookmarksMenuAnchorEl(event.currentTarget);
              }}
              size="large"
            >
              <MenuIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Grid container direction="row">
          {props.showBookmarks && !bookmarksAvailable && (
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noItems')}</Typography>
            </Grid>
          )}
        </Grid>
        {Pro && props.showBookmarks && (
          <RenderHistory
            historyKey={Pro.keys.bookmarksKey}
            items={bookmarkItems}
            update={forceUpdate}
          />
        )}
        <Grid container direction="row">
          <Grid item xs={10} style={{ alignSelf: 'center' }}>
            <IconButton
              data-tid={
                props.fileOpenHistory
                  ? 'fileCloseHistoryTID'
                  : 'fileOpenHistoryTID'
              }
              style={{ minWidth: 'auto', padding: 7 }}
              onClick={() => props.setFileOpenHistory(!props.fileOpenHistory)}
              size="large"
            >
              {props.fileOpenHistory ? <ArrowDownIcon /> : <ArrowRightIcon />}
            </IconButton>
            <Typography
              variant="inherit"
              style={{ display: 'inline' }}
              noWrap
              onClick={() => props.setFileOpenHistory(!props.fileOpenHistory)}
            >
              {t('core:fileOpenHistory')}
            </Typography>
          </Grid>
          <Grid item xs={2} style={{ alignSelf: 'center' }}>
            <IconButton
              data-tid="fileOpenMenuTID"
              style={{ minWidth: 'auto', padding: 7 }}
              onClick={(event: any) => {
                menuHistoryKey.current = historyKeys.fileOpenKey;
                setHistoryMenuAnchorEl(event.currentTarget);
              }}
              size="large"
            >
              <MenuIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Grid container direction="row">
          {props.fileOpenHistory && !openedFilesAvailable && (
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noItems')}</Typography>
            </Grid>
          )}
        </Grid>
        {props.fileOpenHistory && (
          <RenderHistory
            historyKey={historyKeys.fileOpenKey}
            items={fileOpenHistoryItems}
            update={forceUpdate}
          />
        )}
        <Grid container direction="row">
          <Grid item xs={10} style={{ alignSelf: 'center' }}>
            <IconButton
              data-tid="fileEditHistoryTID"
              style={{ minWidth: 'auto', padding: 7 }}
              onClick={() => props.setFileEditHistory(!props.fileEditHistory)}
              size="large"
            >
              {props.fileEditHistory ? <ArrowDownIcon /> : <ArrowRightIcon />}
            </IconButton>
            <Typography
              variant="inherit"
              // className={props.classes.header}
              style={{ display: 'inline' }}
              noWrap
              onClick={() => props.setFileEditHistory(!props.fileEditHistory)}
            >
              {t('core:fileEditHistory')}
            </Typography>
          </Grid>
          <Grid item xs={2} style={{ alignSelf: 'center' }}>
            <IconButton
              data-tid="FileEditedMenuTID"
              style={{ minWidth: 'auto', padding: 7 }}
              onClick={(event: any) => {
                menuHistoryKey.current = historyKeys.fileEditKey;
                setHistoryMenuAnchorEl(event.currentTarget);
              }}
              size="large"
            >
              <MenuIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Grid container direction="row">
          {props.fileEditHistory && !editedFilesAvailable && (
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noItems')}</Typography>
            </Grid>
          )}
        </Grid>
        {props.fileEditHistory && (
          <RenderHistory
            historyKey={historyKeys.fileEditKey}
            items={fileEditHistoryItems}
            update={forceUpdate}
          />
        )}
        <Grid container direction="row">
          <Grid item xs={10} style={{ alignSelf: 'center' }}>
            <IconButton
              data-tid={
                props.folderOpenHistory
                  ? 'folderCloseHistoryTID'
                  : 'folderOpenHistoryTID'
              }
              style={{ minWidth: 'auto', padding: 7 }}
              onClick={() =>
                props.setFolderOpenHistory(!props.folderOpenHistory)
              }
              size="large"
            >
              {props.folderOpenHistory ? <ArrowDownIcon /> : <ArrowRightIcon />}
            </IconButton>
            <Typography
              variant="inherit"
              style={{ display: 'inline' }}
              noWrap
              onClick={() =>
                props.setFolderOpenHistory(!props.folderOpenHistory)
              }
            >
              {t('core:folderOpenHistory')}
            </Typography>
          </Grid>
          <Grid item xs={2} style={{ alignSelf: 'center' }}>
            <IconButton
              data-tid="FolderOpenMenuTID"
              style={{ minWidth: 'auto', padding: 7 }}
              onClick={(event: any) => {
                menuHistoryKey.current = historyKeys.folderOpenKey;
                setHistoryMenuAnchorEl(event.currentTarget);
              }}
              size="large"
            >
              <MenuIcon />
            </IconButton>
          </Grid>
        </Grid>
        <HistoryMenu
          anchorEl={historyMenuAnchorEl}
          open={Boolean(historyMenuAnchorEl)}
          onClose={() => setHistoryMenuAnchorEl(null)}
          refreshHistory={() => forceUpdate()}
          clearAll={() => {
            if (Pro) {
              historyContext.delAllHistory(menuHistoryKey.current);
            } //historyKeys.fileOpenKey);
            forceUpdate();
          }}
        />
        <BookmarksMenu
          anchorEl={bookmarksMenuAnchorEl}
          open={Boolean(bookmarksMenuAnchorEl)}
          onClose={() => setBookmarksMenuAnchorEl(null)}
          refresh={() => forceUpdate()}
          clearAll={() => {
            if (Pro && bookmarksContext) {
              bookmarksContext.delAllBookmarks();
            } //historyKeys.fileOpenKey);
            forceUpdate();
          }}
        />
        <Grid container direction="row">
          {props.folderOpenHistory && !openedFoldersAvailable && (
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noItems')}</Typography>
            </Grid>
          )}
        </Grid>
        {props.folderOpenHistory && (
          <RenderHistory
            historyKey={historyKeys.folderOpenKey}
            items={folderOpenHistoryItems}
            update={forceUpdate}
          />
        )}
        {SaveSearchDialog && saveSearchDialogOpened !== undefined && (
          <SaveSearchDialog
            open={true}
            onClose={(searchQuery: TS.SearchQuery) => {
              setSaveSearchDialogOpened(undefined);
              if (searchQuery) {
                setSearchQuery({
                  ...searchQuery,
                  showUnixHiddenEntries: props.showUnixHiddenEntries,
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
      </div>
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
    </SidePanel>
  );
}

function mapStateToProps(state) {
  return {
    searches: getSearches(state),
    showUnixHiddenEntries: getShowUnixHiddenEntries(state),
    storedSearchesVisible: getStoredSearchesVisible(state),
    showBookmarks: getShowBookmarks(state),
    fileOpenHistory: getFileOpenHistory(state),
    folderOpenHistory: getFolderOpenHistory(state),
    fileEditHistory: getFileEditHistory(state),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      addSearches: SearchActions.addSearches,
      setStoredSearchesVisible: SettingsActions.setStoredSearchesVisible,
      setShowBookmarks: SettingsActions.setShowBookmarks,
      setFileOpenHistory: SettingsActions.setFileOpenHistory,
      setFolderOpenHistory: SettingsActions.setFolderOpenHistory,
      setFileEditHistory: SettingsActions.setFileEditHistory,
    },
    dispatch,
  );
}

const areEqual = (prevProp, nextProp) =>
  nextProp.storedSearchesVisible === prevProp.storedSearchesVisible &&
  nextProp.showBookmarks === prevProp.showBookmarks &&
  nextProp.fileOpenHistory === prevProp.fileOpenHistory &&
  nextProp.folderOpenHistory === prevProp.folderOpenHistory &&
  nextProp.fileEditHistory === prevProp.fileEditHistory &&
  nextProp.indexing === prevProp.indexing &&
  nextProp.currentDirectory === prevProp.currentDirectory &&
  nextProp.indexedEntriesCount === prevProp.indexedEntriesCount &&
  JSON.stringify(nextProp.searches) === JSON.stringify(prevProp.searches);
//  JSON.stringify(nextProp.classes) === JSON.stringify(prevProp.classes);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(React.memo(StoredSearches, areEqual));
