/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import {
  CloseIcon,
  EditIcon,
  FilterIcon,
  MoreMenuIcon,
  SearchIcon,
  SmallArrowDownIcon,
  SmallArrowRightIcon,
} from '-/components/CommonIcons';
import QuickAccessRow from '-/components/QuickAccessRow';
import RenderHistory from '-/components/RenderHistory';
import TsIconButton from '-/components/TsIconButton';
import TsTextField from '-/components/TsTextField';
import BookmarksMenu from '-/components/menus/BookmarksMenu';
import HistoryMenu from '-/components/menus/HistoryMenu';
import SearchMenu from '-/components/menus/SearchMenu';
import { historyKeys } from '-/hooks/HistoryContextProvider';
import { useHistoryContext } from '-/hooks/useHistoryContext';
import { useSavedSearchesContext } from '-/hooks/useSavedSearchesContext';
import { useSearchQueryContext } from '-/hooks/useSearchQueryContext';
import {
  actions as SettingsActions,
  getFileEditHistory,
  getFileOpenHistory,
  getFolderOpenHistory,
  getShowBookmarks,
  getShowUnixHiddenEntries,
  getStoredSearchesVisible,
  isDesktopMode,
} from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { Box, InputAdornment } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React, {
  useContext,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { connect, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import useScrollFade from '-/utils/useScrollFade';
import { Pro } from '../pro';
import SidePanelTitle from './SidePanelTitle';
import { SettingsTab } from './dialogs/SettingsDialog';
import { useSettingsDialogContext } from './dialogs/hooks/useSettingsDialogContext';

interface Props {
  style?: any;
  showUnixHiddenEntries: boolean;
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

/**
 * Short summary of a saved search in the search box syntax, e.g.
 * `invoice +2024 |tax -draft`, shown as second line of its quick access row
 */
function getSearchSummary(search: TS.SearchQuery): string {
  const tagParts = (tags: TS.Tag[] | undefined, prefix: string) =>
    (tags || []).map((tag) => prefix + tag.title);
  return [
    search.textQuery?.trim(),
    ...tagParts(search.tagsAND, '+'),
    ...tagParts(search.tagsOR, '|'),
    ...tagParts(search.tagsNOT, '-'),
  ]
    .filter(Boolean)
    .join(' ');
}

// a stable empty list, so the memoized filtering keeps its result without Pro
const NO_BOOKMARKS: Array<TS.BookmarkItem> = [];

/**
 * @param query lowercased filter text, an empty query keeps all items
 */
function filterByPath<T extends { path?: string }>(
  items: T[] | undefined,
  query: string,
): T[] {
  if (!query) {
    return items || [];
  }
  return (items || []).filter((it) => it.path?.toLowerCase().includes(query));
}

function StoredSearches(props: Props) {
  const { t } = useTranslation();
  const listRef = useScrollFade();
  const { searches, findFromSavedSearch } = useSavedSearchesContext();
  const { openSaveSearchDialog } = useSearchQueryContext();
  const { delAllHistory, fileOpenHistory, fileEditHistory, folderOpenHistory } =
    useHistoryContext();
  const bookmarksContext = Pro?.contextProviders?.BookmarksContext
    ? useContext<TS.BookmarksContextData>(
        Pro?.contextProviders?.BookmarksContext,
      )
    : undefined;
  const [searchMenuAnchorEl, setSearchMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [historyMenuAnchorEl, setHistoryMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  const [bookmarksMenuAnchorEl, setBookmarksMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const desktopMode = useSelector(isDesktopMode);

  const query = showFilter ? filterQuery.trim().toLowerCase() : '';

  const { openSettingsDialog } = useSettingsDialogContext();

  const toggleFilter = () => {
    setShowFilter((prev) => {
      if (prev) {
        setFilterQuery('');
      }
      return !prev;
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuHistoryKey = useRef<string>(undefined);
  const [ignored, forceUpdate] = useReducer((x: number) => x + 1, 0, undefined);

  const handleSearchMenu = (event: any) => {
    setSearchMenuAnchorEl(event.currentTarget);
  };

  const handleCloseSearchMenu = () => {
    setSearchMenuAnchorEl(null);
  };

  function handleFileInputChange(selection: any) {
    const target = selection.currentTarget;
    const file = target.files[0];
    if (file) {
      openSettingsDialog(SettingsTab.BackupRestore, {
        mode: 'import',
        scope: 'searches',
        importFile: file,
      });
    }
    target.value = null;
  }

  const preventDefault = (event: React.SyntheticEvent) =>
    event.preventDefault();

  const bookmarkItems: Array<TS.BookmarkItem> =
    Pro && bookmarksContext
      ? bookmarksContext.bookmarks //getBookmarks()
      : NO_BOOKMARKS;

  const filterActive = !!query;

  const filteredSearches = filterActive
    ? searches.filter((s) => s.title?.toLowerCase().includes(query))
    : searches;
  // memoized so the React.memo'd RenderHistory lists keep their props while
  // filtering; a new array per render would re-render every list each time
  const filteredBookmarks = useMemo(
    () => filterByPath(bookmarkItems, query),
    [bookmarkItems, query],
  );
  const filteredFileOpen = useMemo(
    () => filterByPath(fileOpenHistory, query),
    [fileOpenHistory, query],
  );
  const filteredFileEdit = useMemo(
    () => filterByPath(fileEditHistory, query),
    [fileEditHistory, query],
  );
  const filteredFolderOpen = useMemo(
    () => filterByPath(folderOpenHistory, query),
    [folderOpenHistory, query],
  );

  const noSearchesFound = filteredSearches.length < 1;
  const bookmarksAvailable = filteredBookmarks.length > 0;
  const openedFilesAvailable = filteredFileOpen.length > 0;
  const editedFilesAvailable = filteredFileEdit.length > 0;
  const openedFoldersAvailable = filteredFolderOpen.length > 0;

  // While filtering, force every section open so matches are visible and hide
  // sections that have no match; otherwise honour the user's collapse state.
  const searchesExpanded = filterActive || props.storedSearchesVisible;
  const bookmarksExpanded = filterActive || props.showBookmarks;
  const fileOpenExpanded = filterActive || props.fileOpenHistory;
  const fileEditExpanded = filterActive || props.fileEditHistory;
  const folderOpenExpanded = filterActive || props.folderOpenHistory;

  const showSearchesSection = !filterActive || !noSearchesFound;
  const showBookmarksSection = !filterActive || bookmarksAvailable;
  const showFileOpenSection = !filterActive || openedFilesAvailable;
  const showFileEditSection = !filterActive || editedFilesAvailable;
  const showFolderOpenSection = !filterActive || openedFoldersAvailable;

  const noMatches =
    filterActive &&
    noSearchesFound &&
    !bookmarksAvailable &&
    !openedFilesAvailable &&
    !editedFilesAvailable &&
    !openedFoldersAvailable;

  return (
    <Box
      data-tid="quickAccessArea"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        borderRadius: AppConfig.defaultCSSRadius,
        marginLeft: '5px',
        marginRight: '5px',
      }}
    >
      <SidePanelTitle
        title={t('core:quickAccess')}
        titleAdornment={
          desktopMode ? (
            <TsIconButton
              size="small"
              data-tid="quickAccessFilterTID"
              tooltip={t('core:filterQuickAccess')}
              onClick={toggleFilter}
              sx={{
                marginTop: '8px',
                marginLeft: '6px',
                width: 18,
                height: 18,
                padding: '2px',
                borderRadius: '4px',
                border: '1px dashed',
                borderColor: showFilter ? 'text.primary' : 'text.disabled',
                color: showFilter ? 'text.primary' : 'text.disabled',
                '&:hover': {
                  borderColor: 'text.primary',
                  color: 'text.primary',
                },
              }}
            >
              <FilterIcon sx={{ fontSize: 13 }} />
            </TsIconButton>
          ) : null
        }
      />
      {showFilter && (
        <TsTextField
          autoFocus
          data-tid="quickAccessFilterInputTID"
          value={filterQuery}
          updateValue={(value) => setFilterQuery(value)}
          retrieveValue={() => filterQuery}
          onChange={(event) => setFilterQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              toggleFilter();
            }
          }}
          placeholder={t('core:filterQuickAccessPlaceholder')}
          sx={{
            marginBottom: '5px',
            marginLeft: '2px',
            '& .MuiInputBase-root': {
              paddingRight: '4px',
            },
            '& .MuiInputBase-input': {
              padding: '5px 8px',
              fontSize: '0.85rem',
            },
          }}
          slotProps={{
            input: {
              endAdornment: filterQuery ? (
                <InputAdornment position="end">
                  <TsIconButton
                    size="small"
                    data-tid="quickAccessFilterClearTID"
                    onClick={() => setFilterQuery('')}
                  >
                    <CloseIcon fontSize="small" />
                  </TsIconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
      )}
      <Box
        ref={listRef}
        sx={{
          paddingTop: 0,
          marginTop: 0,
          flex: 1,
          minHeight: 0,
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {noMatches && (
          <Box
            data-tid="quickAccessFilterNoMatch"
            sx={{
              padding: '16px',
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">{t('core:noMatchesFound')}</Typography>
          </Box>
        )}
        {showSearchesSection && (
          <Grid container direction="row">
            <Grid size={10} sx={{ alignSelf: 'center' }}>
              <TsIconButton
                data-tid={
                  props.storedSearchesVisible
                    ? 'storedSearchesVisibleTID'
                    : 'storedSearchesHiddenTID'
                }
                sx={{ minWidth: 'auto', padding: '7px' }}
                onClick={() =>
                  props.setStoredSearchesVisible(!props.storedSearchesVisible)
                }
              >
                {searchesExpanded ? (
                  <SmallArrowDownIcon />
                ) : (
                  <SmallArrowRightIcon />
                )}
              </TsIconButton>
              <Typography
                variant="inherit"
                sx={{ display: 'inline' }}
                noWrap
                onClick={() =>
                  props.setStoredSearchesVisible(!props.storedSearchesVisible)
                }
              >
                {t('core:savedSearchesTitle')}
              </Typography>
            </Grid>
            <Grid size={2} sx={{ textAlign: 'right' }}>
              <SearchMenu
                anchorEl={searchMenuAnchorEl}
                open={Boolean(searchMenuAnchorEl)}
                onClose={handleCloseSearchMenu}
                exportSearches={() => {
                  openSettingsDialog(SettingsTab.BackupRestore, {
                    mode: 'export',
                    scope: 'searches',
                  });
                }}
                importSearches={() => {
                  fileInputRef.current.click();
                }}
              />
              <TsIconButton
                size="small"
                data-tid="StoredSearchesMenuTID"
                onClick={handleSearchMenu}
              >
                <MoreMenuIcon />
              </TsIconButton>
            </Grid>
          </Grid>
        )}
        <Grid container direction="row">
          {!filterActive && searchesExpanded && noSearchesFound && (
            <Grid size={12} sx={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noSavedSearches')}</Typography>
            </Grid>
          )}
        </Grid>
        {searchesExpanded &&
          filteredSearches.map((search) => {
            const summary = getSearchSummary(search);
            return (
              <QuickAccessRow
                key={search.uuid}
                icon={<SearchIcon fontSize="small" />}
                primary={search.title}
                // secondary={summary}
                tooltip={summary && `${t('core:searchTitle')}: ${summary}`}
                dataTid={
                  'StoredSearchTID' +
                  search.title.trim().replaceAll(/\s+/g, '-')
                }
                onClick={() => findFromSavedSearch(search.uuid)}
                action={
                  <TsIconButton
                    tooltip={t('core:editSavedSearchTitle')}
                    aria-label={t('core:searchEditBtn')}
                    onClick={() => openSaveSearchDialog(search.uuid)}
                    data-tid="editSearchTID"
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </TsIconButton>
                }
              />
            );
          })}
        {showBookmarksSection && (
          <Grid container direction="row">
            <Grid size={10} sx={{ alignSelf: 'center' }}>
              <TsIconButton
                data-tid="BookmarksTID"
                sx={{ minWidth: 'auto', padding: '7px' }}
                onClick={() => props.setShowBookmarks(!props.showBookmarks)}
              >
                {bookmarksExpanded ? (
                  <SmallArrowDownIcon />
                ) : (
                  <SmallArrowRightIcon />
                )}
              </TsIconButton>
              <Typography
                variant="inherit"
                sx={{ display: 'inline' }}
                noWrap
                onClick={() => props.setShowBookmarks(!props.showBookmarks)}
              >
                {t('core:showBookmarks')}
              </Typography>
            </Grid>
            <Grid size={2} sx={{ textAlign: 'right' }}>
              <TsIconButton
                data-tid="BookmarksMenuTID"
                onClick={(event: any) => {
                  menuHistoryKey.current = historyKeys.fileOpenKey;
                  setBookmarksMenuAnchorEl(event.currentTarget);
                }}
                size="small"
              >
                <MoreMenuIcon />
              </TsIconButton>
            </Grid>
          </Grid>
        )}
        <Grid container direction="row">
          {!filterActive && bookmarksExpanded && !bookmarksAvailable && (
            <Grid size={12} sx={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noItems')}</Typography>
            </Grid>
          )}
        </Grid>
        {Pro && bookmarksExpanded && (
          <RenderHistory
            historyKey={Pro.keys.bookmarksKey}
            items={filteredBookmarks}
            update={forceUpdate}
          />
        )}
        {showFileOpenSection && (
          <Grid container direction="row">
            <Grid size={10} sx={{ alignSelf: 'center' }}>
              <TsIconButton
                data-tid={
                  props.fileOpenHistory
                    ? 'fileCloseHistoryTID'
                    : 'fileOpenHistoryTID'
                }
                sx={{ minWidth: 'auto', padding: '7px' }}
                onClick={() => props.setFileOpenHistory(!props.fileOpenHistory)}
              >
                {fileOpenExpanded ? (
                  <SmallArrowDownIcon />
                ) : (
                  <SmallArrowRightIcon />
                )}
              </TsIconButton>
              <Typography
                variant="inherit"
                sx={{ display: 'inline' }}
                noWrap
                onClick={() => props.setFileOpenHistory(!props.fileOpenHistory)}
              >
                {t('core:fileOpenHistory')}
              </Typography>
            </Grid>
            <Grid size={2} sx={{ textAlign: 'right' }}>
              <TsIconButton
                data-tid="fileOpenMenuTID"
                onClick={(event: any) => {
                  menuHistoryKey.current = historyKeys.fileOpenKey;
                  setHistoryMenuAnchorEl(event.currentTarget);
                }}
                size="small"
              >
                <MoreMenuIcon />
              </TsIconButton>
            </Grid>
          </Grid>
        )}
        <Grid container direction="row">
          {!filterActive && fileOpenExpanded && !openedFilesAvailable && (
            <Grid size={12} sx={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noItems')}</Typography>
            </Grid>
          )}
        </Grid>
        {fileOpenExpanded && (
          <RenderHistory
            historyKey={historyKeys.fileOpenKey}
            items={filteredFileOpen}
            update={forceUpdate}
          />
        )}
        {showFileEditSection && (
          <Grid container direction="row">
            <Grid size={10} sx={{ alignSelf: 'center' }}>
              <TsIconButton
                data-tid="fileEditHistoryTID"
                sx={{ minWidth: 'auto', padding: '7px' }}
                onClick={() => props.setFileEditHistory(!props.fileEditHistory)}
              >
                {fileEditExpanded ? (
                  <SmallArrowDownIcon />
                ) : (
                  <SmallArrowRightIcon />
                )}
              </TsIconButton>
              <Typography
                variant="inherit"
                sx={{ display: 'inline' }}
                noWrap
                onClick={() => props.setFileEditHistory(!props.fileEditHistory)}
              >
                {t('core:fileEditHistory')}
              </Typography>
            </Grid>
            <Grid size={2} sx={{ textAlign: 'right' }}>
              <TsIconButton
                data-tid="FileEditedMenuTID"
                onClick={(event: any) => {
                  menuHistoryKey.current = historyKeys.fileEditKey;
                  setHistoryMenuAnchorEl(event.currentTarget);
                }}
                size="small"
              >
                <MoreMenuIcon />
              </TsIconButton>
            </Grid>
          </Grid>
        )}
        <Grid container direction="row">
          {!filterActive && fileEditExpanded && !editedFilesAvailable && (
            <Grid size={12} sx={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noItems')}</Typography>
            </Grid>
          )}
        </Grid>
        {fileEditExpanded && (
          <RenderHistory
            historyKey={historyKeys.fileEditKey}
            items={filteredFileEdit}
            update={forceUpdate}
          />
        )}
        {showFolderOpenSection && (
          <Grid container direction="row">
            <Grid size={10} sx={{ alignSelf: 'center' }}>
              <TsIconButton
                data-tid={
                  props.folderOpenHistory
                    ? 'folderCloseHistoryTID'
                    : 'folderOpenHistoryTID'
                }
                sx={{ minWidth: 'auto', padding: '7px' }}
                onClick={() =>
                  props.setFolderOpenHistory(!props.folderOpenHistory)
                }
              >
                {folderOpenExpanded ? (
                  <SmallArrowDownIcon />
                ) : (
                  <SmallArrowRightIcon />
                )}
              </TsIconButton>
              <Typography
                variant="inherit"
                sx={{ display: 'inline' }}
                noWrap
                onClick={() =>
                  props.setFolderOpenHistory(!props.folderOpenHistory)
                }
              >
                {t('core:folderOpenHistory')}
              </Typography>
            </Grid>
            <Grid size={2} sx={{ textAlign: 'right' }}>
              <TsIconButton
                size="small"
                data-tid="FolderOpenMenuTID"
                onClick={(event: any) => {
                  menuHistoryKey.current = historyKeys.folderOpenKey;
                  setHistoryMenuAnchorEl(event.currentTarget);
                }}
              >
                <MoreMenuIcon />
              </TsIconButton>
            </Grid>
          </Grid>
        )}
        <HistoryMenu
          anchorEl={historyMenuAnchorEl}
          open={Boolean(historyMenuAnchorEl)}
          onClose={() => setHistoryMenuAnchorEl(null)}
          refreshHistory={() => forceUpdate()}
          clearAll={() => {
            delAllHistory(menuHistoryKey.current);
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
            }
            forceUpdate();
          }}
        />
        <Grid container direction="row">
          {!filterActive && folderOpenExpanded && !openedFoldersAvailable && (
            <Grid size={12} sx={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noItems')}</Typography>
            </Grid>
          )}
        </Grid>
        {folderOpenExpanded && (
          <RenderHistory
            historyKey={historyKeys.folderOpenKey}
            items={filteredFolderOpen}
            update={forceUpdate}
          />
        )}
      </Box>
      <input
        style={{ display: 'none' }}
        ref={fileInputRef}
        accept="*"
        type="file"
        data-tid="searchImportFileInput"
        onChange={handleFileInputChange}
      />
    </Box>
  );
}

function mapStateToProps(state) {
  return {
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
  nextProp.currentDirectory === prevProp.currentDirectory;

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(React.memo(StoredSearches, areEqual));
