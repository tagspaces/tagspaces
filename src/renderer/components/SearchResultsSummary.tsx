/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
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
import { scope } from '-/components/SearchOptions';
import TsButton from '-/components/TsButton';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { TS } from '-/tagspaces.namespace';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

/** The query is narrowed by more than its text */
function hasNarrowingFilters(query: TS.SearchQuery): boolean {
  return (
    query.tagsAND?.length > 0 ||
    query.tagsOR?.length > 0 ||
    query.tagsNOT?.length > 0 ||
    (query.fileTypes?.length > 0 &&
      JSON.stringify(query.fileTypes) !==
        JSON.stringify(AppConfig.SearchTypeGroups?.any)) ||
    !!query.fileSize ||
    !!query.lastModified ||
    !!query.dateCreated ||
    !!query.tagTimePeriodFrom ||
    !!query.tagTimePeriodTo
  );
}

/**
 * State of the last executed search in the current search session. Returns
 * undefined until a search was executed (the shown entries are search
 * results only then); the session ends when search mode unmounts the caller.
 */
export function useSearchSummary() {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery, currentDirectoryEntries, isSearchMode } =
    useDirectoryContentContext();
  const { currentLocation } = useCurrentLocationContext();
  const { isSearchRunning, isIndexing, createLocationIndex } =
    useLocationIndexContext();
  // the shown entries are search results only after a search was executed
  // in this search session; callers can outlive search mode, so leaving it
  // ends the session
  const hasSearched = useRef<boolean>(false);
  const lastExecuted = useRef<TS.SearchQuery>(undefined);

  if (!isSearchMode) {
    hasSearched.current = false;
    lastExecuted.current = undefined;
    return undefined;
  }
  if (searchQuery?.executeSearch) {
    hasSearched.current = true;
    lastExecuted.current = searchQuery;
  }

  const query = lastExecuted.current;
  if (!hasSearched.current || !query) {
    return undefined;
  }

  const running = isSearchRunning || isIndexing !== undefined;
  const count = currentDirectoryEntries.length;
  const isGlobal = query.searchBoxing === scope.global || !currentLocation;
  const limitReached =
    query.maxSearchResults > 0 && count >= query.maxSearchResults;

  let scopeLabel: string;
  if (isGlobal) {
    scopeLabel = t('core:searchScopeAllLocations');
  } else if (query.searchBoxing === scope.folder) {
    scopeLabel = t('core:searchScopeFolder');
  } else {
    scopeLabel = currentLocation?.name;
  }

  const rerun = (changes: Partial<TS.SearchQuery>) =>
    setSearchQuery({ ...query, ...changes, executeSearch: true });

  const suggestions: Array<{ id: string; label: string; run: () => void }> = [];
  if (count === 0 && !running) {
    if (query.searchType && query.searchType !== 'fuzzy') {
      suggestions.push({
        id: 'searchSuggestionFuzzyTID',
        label: t('core:searchSuggestionFuzzy'),
        run: () => rerun({ searchType: 'fuzzy' }),
      });
    }
    if (!isGlobal) {
      suggestions.push({
        id: 'searchSuggestionGlobalTID',
        label: t('core:searchSuggestionAllLocations'),
        run: () => rerun({ searchBoxing: scope.global }),
      });
    }
    if (query.textQuery && hasNarrowingFilters(query)) {
      suggestions.push({
        id: 'searchSuggestionNoFiltersTID',
        label: t('core:searchSuggestionRemoveFilters'),
        run: () =>
          rerun({
            tagsAND: [],
            tagsOR: [],
            tagsNOT: [],
            fileTypes: AppConfig.SearchTypeGroups?.any,
            fileSize: '',
            lastModified: '',
            dateCreated: '',
            tagTimePeriodFrom: null,
            tagTimePeriodTo: null,
          }),
      });
    }
    if (!isGlobal && currentLocation && !currentLocation.isReadOnly) {
      suggestions.push({
        id: 'searchSuggestionReindexTID',
        label: t('core:searchSuggestionRebuildIndex'),
        run: () =>
          createLocationIndex(
            currentLocation,
            true,
            undefined,
            undefined,
            true,
          ).then(() => rerun({})),
      });
    }
  }

  let summaryText: string = query.textQuery
    ? t('core:searchResultsForQuery', { count, query: query.textQuery })
    : t('core:searchResultsCount', { count });
  if (scopeLabel) {
    summaryText += ' · ' + scopeLabel;
  }
  if (limitReached) {
    summaryText +=
      ' · ' + t('core:searchResultsLimited', { max: query.maxSearchResults });
  }

  return { running, count, summaryText, suggestions };
}

/**
 * Persistent summary of the current search (count, query, scope) for
 * perspectives without their own summary line — Grid and List show the same
 * text in their folder details instead. Not positioned itself: FolderContainer
 * places it next to the perspective switcher.
 */
function SearchResultsSummary() {
  const { t } = useTranslation();
  const theme = useTheme();
  const summary = useSearchSummary();
  if (!summary) {
    return null;
  }
  return (
    <Box
      data-tid="searchResultsSummaryTID"
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: 0,
        maxWidth: 'min(40vw, 520px)',
        color: theme.palette.text.secondary,
      }}
    >
      {summary.running ? (
        <>
          <CircularProgress size={14} />
          <Typography variant="body2" noWrap>
            {t('core:searching')}
          </Typography>
        </>
      ) : (
        <Typography variant="body2" noWrap title={summary.summaryText}>
          {summary.summaryText}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Centered panel with actionable suggestions shown when the search found
 * nothing. Rendered by FolderContainer, so it works for every perspective.
 */
export function SearchNoResults() {
  const { t } = useTranslation();
  const theme = useTheme();
  const summary = useSearchSummary();
  if (!summary || summary.count > 0 || summary.running) {
    return null;
  }
  const { suggestions } = summary;
  return (
    <Paper
      variant="outlined"
      data-tid="searchNoResultsTID"
      sx={{
        position: 'absolute',
        top: 140,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2,
        width: 'min(420px, calc(100% - 32px))',
        padding: '16px',
        textAlign: 'center',
        borderRadius: AppConfig.defaultCSSRadius,
      }}
    >
      <Typography variant="subtitle1">{t('core:noSearchResults')}</Typography>
      {suggestions.length > 0 && (
        <>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, margin: '4px 0' }}
          >
            {t('core:noSearchResultsTry')}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
            }}
          >
            {suggestions.map((s) => (
              <TsButton key={s.id} data-tid={s.id} onClick={s.run}>
                {s.label}
              </TsButton>
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
}

export default SearchResultsSummary;
