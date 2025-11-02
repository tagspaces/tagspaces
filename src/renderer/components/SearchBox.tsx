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
import Popover from '@mui/material/Popover';
import React, { useState } from 'react';

interface Props {
  //open: boolean;
}

function SearchBox(props: Props) {
  const { isSearchMode } = useDirectoryContentContext();
  const [anchorSearch, setAnchorSearch] = useState<HTMLButtonElement | null>(
    null,
  );

  return (
    <>
      <SearchAutocomplete setAnchorSearch={setAnchorSearch} />
      {isSearchMode && (
        <Popover
          open={Boolean(anchorSearch)}
          anchorEl={anchorSearch}
          onClose={() => setAnchorSearch(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              sx: {
                overflow: 'hidden',
                height: '720px',
                // background: alpha(theme.palette.background.default, 0.95),
                // backdropFilter: 'blur(5px)',
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
          <SearchPopover onClose={() => setAnchorSearch(null)} />
        </Popover>
      )}
    </>
  );
}

export default SearchBox;
