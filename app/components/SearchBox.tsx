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

import React, { useEffect, useState } from 'react';
import Tooltip from '-/components/Tooltip';
import IconButton from '@mui/material/IconButton';
import i18n from '-/services/i18n';
import AdvancedSearchIcon from '@mui/icons-material/TuneOutlined';
import DropDownIcon from '@mui/icons-material/ArrowDropDownOutlined';
import Popover from '@mui/material/Popover';
import SearchPopover from '-/components/SearchPopover';
import SearchAutocomplete from '-/components/SearchAutocomplete';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField } from '@mui/material';
import { SearchOptions } from '-/components/SearchOptions';

interface Props {
  open: boolean;
}

function SearchBox(props: Props) {
  const [anchorSearch, setAnchorSearch] = useState<HTMLButtonElement | null>(
    null
  );
  // const searchInlineRef = React.useRef<HTMLDivElement | null>(null);

  /*  useEffect(() => {
    if (props.open && searchInlineRef.current) {
      setAnchorSearchItems(searchInlineRef.current);
    }
  }, [searchInlineRef.current, props.open]);*/

  return (
    <>
      <SearchAutocomplete open={props.open} />
      {/*<SearchInline open={props.open} />*/}
      {props.open && (
        <>
          <Tooltip title={i18n.t('core:advancedSearch')}>
            <IconButton
              id="advancedButton"
              data-tid="advancedSearch"
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                setAnchorSearch(event.currentTarget);
              }}
            >
              <AdvancedSearchIcon />
              <DropDownIcon />
            </IconButton>
          </Tooltip>
          <Popover
            open={Boolean(anchorSearch)}
            anchorEl={anchorSearch}
            onClose={() => setAnchorSearch(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            PaperProps={{
              style: {
                overflow: 'hidden',
                height: 720
              }
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <SearchPopover onClose={() => setAnchorSearch(null)} />
          </Popover>
        </>
      )}
    </>
  );
}

export default SearchBox;
