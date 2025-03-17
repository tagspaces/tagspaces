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

import { useSavedSearchesContext } from '-/hooks/useSavedSearchesContext';
import { getSearches } from '-/reducers/searches';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  open: boolean;
  anchorEl: Element;
  onClose: () => void;
}

function SavedSearchesMenu(props: Props) {
  const { open, onClose, anchorEl } = props;
  const { t } = useTranslation();
  const { findFromSavedSearch } = useSavedSearchesContext();
  const searches = useSelector((state) => getSearches(state));

  const menuItems = searches.length ? (
    searches.map((search) => (
      <MenuItem
        key={search.uuid}
        onClick={() => {
          findFromSavedSearch(search.uuid);
          onClose();
        }}
      >
        {search.title}
      </MenuItem>
    ))
  ) : (
    <MenuItem key={'noSavedSearches'}>{t('noSavedSearches')}</MenuItem>
  );

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        id="search-menu"
        MenuListProps={{
          'aria-labelledby': 'basic-button',
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
              mr: 1,
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
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {menuItems}
      </Menu>
    </div>
  );
}
export default SavedSearchesMenu;
