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
  EditIcon,
  MoreMenuIcon,
  SearchIcon,
  SmallArrowDownIcon,
  SmallArrowRightIcon,
} from '-/components/CommonIcons';
import RenderHistory from '-/components/RenderHistory';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
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
} from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React, { useContext, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Pro } from '../pro';
import SidePanelTitle from './SidePanelTitle';

interface Props {
  style?: any;
  showUnixHiddenEntries: boolean;
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

function StoredSearches(props: Props) {
  const { t } = useTranslation();
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

  const [isExportSearchesDialogOpened, setExportSearchesDialogOpened] =
    useState<boolean>(false);

  const [importFile, setImportFile] = useState<File>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuHistoryKey = useRef<string>(undefined);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

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

  function handleFileInputChange(selection: any) {
    const target = selection.currentTarget;
    const file = target.files[0];
    setImportFile(file);
    target.value = null;
  }

  const preventDefault = (event: React.SyntheticEvent) =>
    event.preventDefault();

  const noSearchesFound = searches.length < 1;

  const { reduceHeightBy } = props;

  const bookmarkItems: Array<TS.BookmarkItem> =
    Pro && bookmarksContext
      ? bookmarksContext.bookmarks //getBookmarks()
      : [];

  const bookmarksAvailable = bookmarkItems && bookmarkItems.length > 0;
  const openedFilesAvailable = fileOpenHistory && fileOpenHistory.length > 0;
  const editedFilesAvailable = fileEditHistory && fileEditHistory.length > 0;
  const openedFoldersAvailable =
    folderOpenHistory && folderOpenHistory.length > 0;

  return (
    <Box
      data-tid="quickAccessArea"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: AppConfig.defaultCSSRadius,
        marginLeft: '5px',
        marginRight: '5px',
      }}
    >
      <SidePanelTitle title={t('core:quickAccess')} />
      <Box
        sx={{
          paddingTop: 0,
          marginTop: 0,
          height: 'calc(100% - ' + reduceHeightBy + 'px)',
          width: 305,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
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
              {props.storedSearchesVisible ? (
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
                setExportSearchesDialogOpened(true);
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
        <Grid container direction="row">
          {props.storedSearchesVisible && noSearchesFound && (
            <Grid size={12} sx={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noSavedSearches')}</Typography>
            </Grid>
          )}
        </Grid>
        <Grid>
          {props.storedSearchesVisible &&
            searches.map((search) => (
              <Grid container direction="row" key={search.uuid}>
                <Grid size={10}>
                  <TsButton
                    tooltip={t('core:searchTitle')}
                    data-tid={
                      'StoredSearchTID' +
                      search.title.trim().replaceAll(/\s+/g, '-')
                    }
                    variant="text"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 'normal',
                      justifyContent: 'start',
                    }}
                    onClick={() => findFromSavedSearch(search.uuid)}
                  >
                    <SearchIcon />
                    &nbsp;
                    <Box
                      sx={{
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        maxWidth: 220,
                      }}
                    >
                      {search.title}
                    </Box>
                  </TsButton>
                </Grid>
                <Grid size={2}>
                  <TsIconButton
                    tooltip={t('core:editSavedSearchTitle')}
                    aria-label={t('core:searchEditBtn')}
                    onClick={() => openSaveSearchDialog(search.uuid)}
                    data-tid="editSearchTID"
                  >
                    <EditIcon fontSize="small" />
                  </TsIconButton>
                </Grid>
              </Grid>
            ))}
        </Grid>
        <Grid container direction="row">
          <Grid size={10} sx={{ alignSelf: 'center' }}>
            <TsIconButton
              data-tid="BookmarksTID"
              sx={{ minWidth: 'auto', padding: '7px' }}
              onClick={() => props.setShowBookmarks(!props.showBookmarks)}
            >
              {props.showBookmarks ? (
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
        <Grid container direction="row">
          {props.showBookmarks && !bookmarksAvailable && (
            <Grid size={12} sx={{ textAlign: 'center' }}>
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
              {props.fileOpenHistory ? (
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
        <Grid container direction="row">
          {props.fileOpenHistory && !openedFilesAvailable && (
            <Grid size={12} sx={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noItems')}</Typography>
            </Grid>
          )}
        </Grid>
        {props.fileOpenHistory && (
          <RenderHistory
            historyKey={historyKeys.fileOpenKey}
            items={fileOpenHistory}
            update={forceUpdate}
          />
        )}
        <Grid container direction="row">
          <Grid size={10} sx={{ alignSelf: 'center' }}>
            <TsIconButton
              data-tid="fileEditHistoryTID"
              sx={{ minWidth: 'auto', padding: '7px' }}
              onClick={() => props.setFileEditHistory(!props.fileEditHistory)}
            >
              {props.fileEditHistory ? (
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
        <Grid container direction="row">
          {props.fileEditHistory && !editedFilesAvailable && (
            <Grid size={12} sx={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noItems')}</Typography>
            </Grid>
          )}
        </Grid>
        {props.fileEditHistory && (
          <RenderHistory
            historyKey={historyKeys.fileEditKey}
            items={fileEditHistory}
            update={forceUpdate}
          />
        )}
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
              {props.folderOpenHistory ? (
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
          {props.folderOpenHistory && !openedFoldersAvailable && (
            <Grid size={12} sx={{ textAlign: 'center' }}>
              <Typography variant="caption">{t('noItems')}</Typography>
            </Grid>
          )}
        </Grid>
        {props.folderOpenHistory && (
          <RenderHistory
            historyKey={historyKeys.folderOpenKey}
            items={folderOpenHistory}
            update={forceUpdate}
          />
        )}
      </Box>
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
          searches={searches}
        />
      )}
      {ImportSearchesDialog && importFile && (
        <ImportSearchesDialog
          open={Boolean(importFile)}
          onClose={() => setImportFile(undefined)}
          importFile={importFile}
          searches={searches}
        />
      )}
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
