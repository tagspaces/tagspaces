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

import SearchAutocomplete from '-/components/SearchAutocomplete';
import SearchPopover from '-/components/SearchPopover';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useSearchQueryContext } from '-/hooks/useSearchQueryContext';
import { TS } from '-/tagspaces.namespace';
import Popover from '@mui/material/Popover';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/** The parts of a query which the advanced search panel can edit */
const draftFields: Array<keyof TS.SearchQuery> = [
  'textQuery',
  'tagsAND',
  'tagsOR',
  'tagsNOT',
  'searchBoxing',
  'searchType',
  'fileTypes',
  'lastModified',
  'dateCreated',
  'fileSize',
  'tagTimePeriodFrom',
  'tagTimePeriodTo',
];

function pickDraft(query: TS.SearchQuery) {
  const draft = {};
  draftFields.forEach((field) => {
    const value = query?.[field];
    // treat '' / [] / null like an unset filter
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      draft[field] = value;
    }
  });
  return draft;
}

function SearchBox() {
  const { t } = useTranslation();
  const { isSearchMode, searchQuery, setSearchQuery } =
    useDirectoryContentContext();
  const { tempSearchQuery } = useSearchQueryContext();
  const [anchorSearch, setAnchorSearch] = useState<HTMLButtonElement | null>(
    null,
  );

  const closePopover = () => setAnchorSearch(null);

  /**
   * Closing the advanced search without running it keeps what was set
   * there: the draft is applied to the search bar (as chips), instead of
   * being lost with the next keystroke in the search bar.
   */
  const dismissPopover = () => {
    closePopover();
    const draft = pickDraft(tempSearchQuery);
    if (JSON.stringify(draft) !== JSON.stringify(pickDraft(searchQuery))) {
      const next: TS.SearchQuery = { ...searchQuery, executeSearch: false };
      // take every editable field from the draft, so filters cleared in
      // the panel are cleared in the search as well
      draftFields.forEach((field) => {
        (next as any)[field] = draft[field];
      });
      setSearchQuery(next);
    }
  };

  return (
    <>
      <SearchAutocomplete setAnchorSearch={setAnchorSearch} />
      {isSearchMode && (
        <Popover
          open={Boolean(anchorSearch)}
          anchorEl={anchorSearch}
          onClose={dismissPopover}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              // the panel has no visible title: name it for screen readers
              role: 'dialog',
              'aria-label': t('core:advancedSearch'),
              sx: {
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'min(720px, calc(100vh - 80px))',
              },
            },
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          style={
            {
              WebkitAppRegion: 'no-drag',
            } as React.CSSProperties & { WebkitAppRegion?: string }
          }
        >
          <SearchPopover onClose={closePopover} onDismiss={dismissPopover} />
        </Popover>
      )}
    </>
  );
}

export default SearchBox;
