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

import React from 'react';
import Tooltip from '-/components/Tooltip';
import IconButton from '@mui/material/IconButton';
import i18n from '-/services/i18n';
import SearchInline from '-/components/SearchInline';
import AdvancedSearchIcon from '@mui/icons-material/TuneOutlined';
import DropDownIcon from '@mui/icons-material/ArrowDropDownOutlined';
import Popover from '@mui/material/Popover';
import SearchPopover from '-/components/SearchPopover';

interface Props {
  open: boolean;
  setAnchorSearch: (HTMLButtonElement) => void;
  anchorSearch: HTMLButtonElement | null;
}

function SearchBox(props: Props) {
  return (
    <>
      <SearchInline open={props.open} />
      {props.open && (
        <>
          <Tooltip title={i18n.t('core:advancedSearch')}>
            <IconButton
              id="advancedButton"
              data-tid="advancedSearch"
              onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                props.setAnchorSearch(event.currentTarget)
              }
            >
              <AdvancedSearchIcon />
              <DropDownIcon />
            </IconButton>
          </Tooltip>
          <Popover
            open={Boolean(props.anchorSearch)}
            anchorEl={props.anchorSearch}
            onClose={() => props.setAnchorSearch(null)}
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
            <SearchPopover onClose={() => props.setAnchorSearch(null)} />
          </Popover>
        </>
      )}
    </>
  );
}

export default SearchBox;
