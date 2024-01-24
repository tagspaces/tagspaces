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
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';

interface Props {
  open: boolean;
  onClose: () => void;
  anchorEl: Element;
  handleSortBy: (sortType: string) => void;
}

function SortingMenu(props: Props) {
  const { open, onClose, handleSortBy, anchorEl } = props;

  const { t } = useTranslation();
  const { sortBy, orderBy } = useSortedDirContext();
  const { isSearchMode } = useDirectoryContentContext();
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {/* <ListSubHeader>Sort by</ListSubHeader> */}
      {isSearchMode && (
        <MenuItem
          data-tid="gridPerspectiveSortByRelevance"
          onClick={() => {
            handleSortBy('byRelevance');
          }}
        >
          <ListItemIcon style={{ minWidth: 25 }}>
            {sortBy === 'byRelevance' &&
              (orderBy ? <ArrowDownIcon /> : <ArrowUpIcon />)}
          </ListItemIcon>
          <ListItemText primary={t('core:relevance')} />
        </MenuItem>
      )}
      <MenuItem
        data-tid="gridPerspectiveSortByName"
        onClick={() => {
          handleSortBy('byName');
        }}
      >
        <ListItemIcon style={{ minWidth: 25 }}>
          {sortBy === 'byName' &&
            (orderBy ? <ArrowDownIcon /> : <ArrowUpIcon />)}
        </ListItemIcon>
        <ListItemText primary={t('core:sortByName')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveSortBySize"
        onClick={() => {
          handleSortBy('byFileSize');
        }}
      >
        <ListItemIcon style={{ minWidth: 25 }}>
          {sortBy === 'byFileSize' &&
            (orderBy ? <ArrowDownIcon /> : <ArrowUpIcon />)}
        </ListItemIcon>
        <ListItemText primary={t('core:fileSize')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveSortByDate"
        onClick={() => {
          handleSortBy('byDateModified');
        }}
      >
        <ListItemIcon style={{ minWidth: 25 }}>
          {sortBy === 'byDateModified' &&
            (orderBy ? <ArrowDownIcon /> : <ArrowUpIcon />)}
        </ListItemIcon>
        <ListItemText primary={t('core:fileLDTM')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveSortByFirstTag"
        onClick={() => {
          handleSortBy('byFirstTag');
        }}
      >
        <ListItemIcon style={{ minWidth: 25 }}>
          {sortBy === 'byFirstTag' &&
            (orderBy ? <ArrowDownIcon /> : <ArrowUpIcon />)}
        </ListItemIcon>
        <ListItemText primary={t('core:fileFirstTag')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveSortByExt"
        onClick={() => {
          handleSortBy('byExtension');
        }}
      >
        <ListItemIcon style={{ minWidth: 25 }}>
          {sortBy === 'byExtension' &&
            (orderBy ? <ArrowDownIcon /> : <ArrowUpIcon />)}
        </ListItemIcon>
        <ListItemText primary={t('core:fileExtension')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveSortRandom"
        onClick={() => {
          handleSortBy('random');
        }}
      >
        <ListItemIcon style={{ minWidth: 25 }}>
          {sortBy === 'random' && <ArrowDownIcon />}
        </ListItemIcon>
        <ListItemText primary={t('core:random')} />
      </MenuItem>
    </Menu>
  );
}

export default SortingMenu;
