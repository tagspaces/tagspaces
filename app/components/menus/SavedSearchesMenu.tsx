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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { TS } from '-/tagspaces.namespace';
import { getSearches } from '-/reducers/searches';
import { connect } from 'react-redux';

interface Props {
  classes?: any;
  open: boolean;
  anchorEl: Element;
  onClose: () => void;
  searches: Array<TS.SearchQuery>;
}

function SavedSearchesMenu(props: Props) {
  const menuItems = props.searches.map(search => (
    <MenuItem
      key={search.uuid}
      onClick={() => {} /* todo handleSavedSearchClick(search.uuid)*/}
    >
      {search.title}
    </MenuItem>
  ));
  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu
        anchorEl={props.anchorEl}
        open={props.open}
        onClose={props.onClose}
        id="search-menu"
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
        // onClick={() => setOpenSavedSearches(null)}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {menuItems}
      </Menu>
    </div>
  );
}

function mapStateToProps(state) {
  return { searches: getSearches(state) };
}
export default connect(mapStateToProps)(SavedSearchesMenu);
